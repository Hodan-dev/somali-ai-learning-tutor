import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import {
  Course,
  Enrollment,
  Exercise,
  Lesson,
  LessonProgress,
  Module,
  Question,
  ExerciseAttempt,
  LessonChunk,
  CourseCompletion,
  User,
  mapId,
  toPlain,
} from '../models/index.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { cacheJson } from '../middleware/cache.js';
import { courseStats, nextSortOrder, studentCourseProgress } from '../helpers/stats.js';

export const coursesRouter = Router();
const listCache = cacheJson(30_000);
const detailCache = cacheJson(20_000);

coursesRouter.get('/', authRequired, listCache, async (req, res) => {
  const courses = await Course.find().sort({ category: 1, title: 1 }).lean();
  const result = await Promise.all(
    courses.map(async (c) => {
      const stats = await courseStats(c._id);
      const progress =
        req.user!.role === 'STUDENT'
          ? await studentCourseProgress(req.user!.id, c._id)
          : { progress: 0, completedLessons: 0, totalLessons: stats.lessonCount };
      return { ...toPlain(c), ...stats, ...progress };
    })
  );
  res.json({ courses: result });
});

coursesRouter.get('/:id', authRequired, detailCache, async (req, res) => {
  const courseId = String(req.params.id);
  const course = await Course.findById(courseId).lean();
  if (!course) return res.status(404).json({ error: 'Koorsada lama helin.' });

  const modules = await Module.find({ course_id: courseId }).sort({ sort_order: 1 }).lean();
  const curriculum = await Promise.all(
    modules.map(async (m) => {
      const lessons = await Lesson.find({ module_id: m._id }).sort({ sort_order: 1 }).lean();
      const withProgress = await Promise.all(
        lessons.map(async (l) => {
          let completed = false;
          if (req.user!.role === 'STUDENT') {
            const p = await LessonProgress.findOne({ student_id: req.user!.id, lesson_id: l._id }).lean();
            completed = !!p?.completed;
          }
          const ex = await Exercise.findOne({ lesson_id: l._id }).select('_id').lean();
          return { ...mapId(l), completed, exerciseId: ex?._id || null };
        })
      );
      return { ...mapId(m), lessons: withProgress };
    })
  );

  const stats = await courseStats(courseId);
  const progress =
    req.user!.role === 'STUDENT'
      ? await studentCourseProgress(req.user!.id, courseId)
      : { progress: 0, completedLessons: 0, totalLessons: stats.lessonCount };

  let currentLessonId: string | null = null;
  if (req.user!.role === 'STUDENT') {
    for (const mod of curriculum) {
      for (const les of mod.lessons) {
        if (!les.completed && les.status === 'published') {
          currentLessonId = les.id;
          break;
        }
      }
      if (currentLessonId) break;
    }
  }

  res.json({
    course: { ...toPlain(course), ...stats, ...progress, currentLessonId, modules: curriculum },
  });
});

coursesRouter.post('/', authRequired, requireRole('ADMIN'), async (req, res) => {
  const schema = z.object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters.'),
    description: z.string().trim().min(2, 'Description must be at least 2 characters.'),
    category: z.string().trim().min(2, 'Category is required.'),
    difficulty: z.string().trim().min(2).default('Beginner'),
    sequential: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(' ') || 'Macluumaadka koorsada ma saxna.';
    return res.status(400).json({ error: message, details: parsed.error.flatten() });
  }

  const id = uuid();
  await Course.create({
    _id: id,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    difficulty: parsed.data.difficulty,
    sequential: parsed.data.sequential ?? false,
  });

  const students = await User.find({ role: 'STUDENT' }).select('_id').lean();
  if (students.length) {
    await Enrollment.insertMany(
      students.map((s) => ({ student_id: s._id, course_id: id })),
      { ordered: false }
    ).catch(() => undefined);
  }

  res.status(201).json({ course: { id, ...parsed.data } });
});

coursesRouter.put('/:id', authRequired, requireRole('ADMIN'), async (req, res) => {
  const schema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    category: z.string().min(2).optional(),
    difficulty: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Update ma saxna.' });

  const existing = await Course.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Koorsada lama helin.' });

  if (parsed.data.title) existing.title = parsed.data.title;
  if (parsed.data.description) existing.description = parsed.data.description;
  if (parsed.data.category) existing.category = parsed.data.category;
  if (parsed.data.difficulty) existing.difficulty = parsed.data.difficulty;
  await existing.save();
  res.json({ ok: true });
});

coursesRouter.delete('/:id', authRequired, requireRole('ADMIN'), async (req, res) => {
  const courseId = req.params.id;
  const moduleIds = await Module.find({ course_id: courseId }).distinct('_id');
  const lessonIds = await Lesson.find({ module_id: { $in: moduleIds } }).distinct('_id');
  const exerciseIds = await Exercise.find({ lesson_id: { $in: lessonIds } }).distinct('_id');

  await Promise.all([
    Enrollment.deleteMany({ course_id: courseId }),
    CourseCompletion.deleteMany({ course_id: courseId }),
    LessonProgress.deleteMany({ course_id: courseId }),
    LessonChunk.deleteMany({ lesson_id: { $in: lessonIds } }),
    Question.deleteMany({ exercise_id: { $in: exerciseIds } }),
    ExerciseAttempt.deleteMany({ exercise_id: { $in: exerciseIds } }),
    Exercise.deleteMany({ _id: { $in: exerciseIds } }),
    Lesson.deleteMany({ _id: { $in: lessonIds } }),
    Module.deleteMany({ course_id: courseId }),
    Course.deleteOne({ _id: courseId }),
  ]);
  res.json({ ok: true });
});

coursesRouter.post('/:id/modules', authRequired, requireRole('ADMIN'), async (req, res) => {
  const title = z.string().min(2).safeParse(req.body.title);
  if (!title.success) return res.status(400).json({ error: 'Module title waa loo baahan yahay.' });
  const sortOrder = await nextSortOrder(Module, { course_id: req.params.id });
  const id = uuid();
  await Module.create({ _id: id, course_id: req.params.id, title: title.data, sort_order: sortOrder });
  res.status(201).json({ module: { id, title: title.data, sort_order: sortOrder } });
});
