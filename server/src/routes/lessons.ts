import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import {
  ActivityLog,
  Course,
  CourseCompletion,
  Exercise,
  ExerciseAttempt,
  Lesson,
  LessonChunk,
  LessonProgress,
  Module,
  Question,
  mapId,
} from '../models/index.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { chunkText } from '../services/ai.js';
import { avgExerciseScoreForCourse, lessonIdsForCourse, nextSortOrder } from '../helpers/stats.js';

function pdfLessonPlaceholder(title: string, description?: string) {
  return description?.trim() || `Read the PDF lesson: ${title}`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname) || '.pdf'}`),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('PDF kaliya ayaa la oggol yahay'));
    }
  },
});

export const lessonsRouter = Router();

lessonsRouter.get('/', authRequired, requireRole('ADMIN'), async (_req, res) => {
  const lessons = await Lesson.find().sort({ created_at: -1 }).lean();
  const enriched = await Promise.all(
    lessons.map(async (l) => {
      const mod = await Module.findById(l.module_id).lean();
      const course = mod ? await Course.findById(mod.course_id).lean() : null;
      return {
        id: l._id,
        title: l.title,
        description: l.description,
        pdf_url: l.pdf_url,
        status: l.status,
        created_at: l.created_at instanceof Date ? l.created_at.toISOString() : l.created_at,
        module_title: mod?.title,
        course_title: course?.title,
        category: course?.category,
      };
    })
  );
  res.json({ lessons: enriched });
});

lessonsRouter.get('/:id', authRequired, async (req, res) => {
  const lessonDoc = await Lesson.findById(req.params.id).lean();
  if (!lessonDoc) return res.status(404).json({ error: 'Casharka lama helin.' });

  const mod = await Module.findById(lessonDoc.module_id).lean();
  if (!mod) return res.status(404).json({ error: 'Casharka lama helin.' });
  const course = await Course.findById(mod.course_id).lean();

  const lesson: Record<string, unknown> = {
    ...mapId(lessonDoc),
    course_id: mod.course_id,
    module_title: mod.title,
    course_title: course?.title,
    category: course?.category,
  };

  if (req.user!.role === 'STUDENT') {
    const existing = await LessonProgress.findOne({ student_id: req.user!.id, lesson_id: req.params.id });
    if (existing) {
      existing.last_accessed = new Date();
      await existing.save();
    } else {
      await LessonProgress.create({
        student_id: req.user!.id,
        lesson_id: req.params.id,
        course_id: mod.course_id,
        completed: false,
      });
    }
  }

  const exercise = await Exercise.findOne({ lesson_id: req.params.id }).select('_id title description').lean();

  const modules = await Module.find({ course_id: mod.course_id }).sort({ sort_order: 1 }).lean();
  const moduleLessons = await Promise.all(
    modules.map(async (m) => ({
      module: m,
      lessons: await Lesson.find({ module_id: m._id, status: 'published' }).sort({ sort_order: 1 }).lean(),
    }))
  );

  const progressByLesson = new Map<string, boolean>();
  if (req.user!.role === 'STUDENT') {
    const lessonIds = moduleLessons.flatMap(({ lessons }) => lessons.map((l) => l._id));
    if (lessonIds.length) {
      const rows = await LessonProgress.find({
        student_id: req.user!.id,
        lesson_id: { $in: lessonIds },
      }).lean();
      for (const row of rows) progressByLesson.set(row.lesson_id, !!row.completed);
    }
  }

  const curriculum = moduleLessons.map(({ module: m, lessons }) => ({
    ...mapId(m),
    lessons: lessons.map((l) => ({
      ...mapId(l),
      completed: progressByLesson.get(l._id) ?? false,
      current: l._id === req.params.id,
    })),
  }));

  let completed = false;
  if (req.user!.role === 'STUDENT') {
    const p = await LessonProgress.findOne({ student_id: req.user!.id, lesson_id: req.params.id }).lean();
    completed = !!p?.completed;
  }

  if (lesson.pdf_url) {
    lesson.content = pdfLessonPlaceholder(String(lesson.title), String(lesson.description || ''));
  }

  if (lesson.created_at instanceof Date) lesson.created_at = lesson.created_at.toISOString();

  res.json({
    lesson: {
      ...lesson,
      completed,
      exercise: exercise ? { id: exercise._id, title: exercise.title, description: exercise.description } : null,
    },
    curriculum,
  });
});

lessonsRouter.post('/:id/complete', authRequired, requireRole('STUDENT'), async (req, res) => {
  const lessonDoc = await Lesson.findById(req.params.id).lean();
  if (!lessonDoc) return res.status(404).json({ error: 'Casharka lama helin.' });
  const mod = await Module.findById(lessonDoc.module_id).lean();
  if (!mod) return res.status(404).json({ error: 'Casharka lama helin.' });

  const existing = await LessonProgress.findOne({ student_id: req.user!.id, lesson_id: req.params.id });
  if (existing) {
    existing.completed = true;
    existing.completed_at = new Date();
    existing.last_accessed = new Date();
    await existing.save();
  } else {
    await LessonProgress.create({
      student_id: req.user!.id,
      lesson_id: req.params.id,
      course_id: mod.course_id,
      completed: true,
      completed_at: new Date(),
    });
  }

  await ActivityLog.create({
    student_id: req.user!.id,
    action: 'lesson_completed',
    detail: `${lessonDoc.title} — La dhammeeyay`,
  });

  const total = (await lessonIdsForCourse(mod.course_id, true)).length;
  const done = await LessonProgress.countDocuments({
    student_id: req.user!.id,
    course_id: mod.course_id,
    completed: true,
  });

  let courseCompleted = false;
  if (total > 0 && done >= total) {
    const avg = await avgExerciseScoreForCourse(req.user!.id, mod.course_id);
    await CourseCompletion.findOneAndUpdate(
      { student_id: req.user!.id, course_id: mod.course_id },
      { student_id: req.user!.id, course_id: mod.course_id, final_score: avg, completed_at: new Date() },
      { upsert: true, new: true }
    );
    courseCompleted = true;
  }

  res.json({ ok: true, courseCompleted, progress: total ? Math.round((done / total) * 100) : 0 });
});

lessonsRouter.post('/', authRequired, requireRole('ADMIN'), async (req, res) => {
  const schema = z.object({
    moduleId: z.string(),
    title: z.string().min(2),
    description: z.string().optional(),
    content: z.string().min(10),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Lesson data ma saxna.' });

  const sortOrder = await nextSortOrder(Lesson, { module_id: parsed.data.moduleId });
  const id = uuid();
  await Lesson.create({
    _id: id,
    module_id: parsed.data.moduleId,
    title: parsed.data.title,
    description: parsed.data.description || '',
    content: parsed.data.content,
    sort_order: sortOrder,
    status: 'published',
    uploaded_by: req.user!.id,
  });

  await LessonChunk.insertMany(
    chunkText(parsed.data.content).map((ch) => ({
      lesson_id: id,
      content: ch.content,
      chunk_index: ch.chunk_index,
    }))
  );

  res.status(201).json({ lesson: { id, title: parsed.data.title } });
});

lessonsRouter.post(
  '/upload',
  authRequired,
  requireRole('ADMIN'),
  (req, res, next) => {
    upload.single('pdf')(req, res, (err) => {
      if (err) {
        const message =
          err instanceof Error && 'code' in err && err.code === 'LIMIT_FILE_SIZE'
            ? 'PDF file is too large for the server configuration.'
            : err.message || 'Upload failed';
        return res.status(400).json({ error: message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const schema = z.object({
        moduleId: z.string(),
        title: z.string().min(2),
        description: z.string().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success || !req.file) {
        return res.status(400).json({ error: 'PDF, title, iyo module ayaa loo baahan yahay.' });
      }

      const content = pdfLessonPlaceholder(parsed.data.title, parsed.data.description);
      const sortOrder = await nextSortOrder(Lesson, { module_id: parsed.data.moduleId });
      const id = uuid();
      const pdfUrl = `/uploads/${req.file.filename}`;
      await Lesson.create({
        _id: id,
        module_id: parsed.data.moduleId,
        title: parsed.data.title,
        description: parsed.data.description || 'PDF lesson',
        content,
        pdf_url: pdfUrl,
        sort_order: sortOrder,
        status: 'published',
        uploaded_by: req.user!.id,
      });

      res.status(201).json({ lesson: { id, title: parsed.data.title, pdfUrl } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'PDF processing failed.' });
    }
  }
);

lessonsRouter.put('/:id', authRequired, requireRole('ADMIN'), async (req, res) => {
  const schema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(['published', 'draft']).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Update ma saxna.' });
  const existing = await Lesson.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Casharka lama helin.' });

  if (parsed.data.title) existing.title = parsed.data.title;
  if (parsed.data.description !== undefined) existing.description = parsed.data.description;
  if (parsed.data.content) existing.content = parsed.data.content;
  if (parsed.data.status) existing.status = parsed.data.status;
  await existing.save();

  if (parsed.data.content) {
    await LessonChunk.deleteMany({ lesson_id: req.params.id });
    await LessonChunk.insertMany(
      chunkText(parsed.data.content).map((ch) => ({
        lesson_id: req.params.id,
        content: ch.content,
        chunk_index: ch.chunk_index,
      }))
    );
  }

  res.json({ ok: true });
});

lessonsRouter.delete('/:id', authRequired, requireRole('ADMIN'), async (req, res) => {
  const exerciseIds = await Exercise.find({ lesson_id: req.params.id }).distinct('_id');
  await LessonChunk.deleteMany({ lesson_id: req.params.id });
  await LessonProgress.deleteMany({ lesson_id: req.params.id });
  await Question.deleteMany({ exercise_id: { $in: exerciseIds } });
  await ExerciseAttempt.deleteMany({ exercise_id: { $in: exerciseIds } });
  await Exercise.deleteMany({ lesson_id: req.params.id });
  await Lesson.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});
