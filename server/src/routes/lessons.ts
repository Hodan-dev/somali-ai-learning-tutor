import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { db } from '../db.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { chunkText } from '../services/ai.js';
import { placeholderPdfContent, queuePdfProcessing } from '../services/pdfProcessing.js';

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

lessonsRouter.get('/', authRequired, requireRole('ADMIN'), (_req, res) => {
  const lessons = db
    .prepare(
      `SELECT l.id, l.title, l.description, l.pdf_url, l.status, l.created_at, m.title as module_title, c.title as course_title, c.category
       FROM lessons l
       JOIN modules m ON m.id = l.module_id
       JOIN courses c ON c.id = m.course_id
       ORDER BY l.created_at DESC`
    )
    .all();
  res.json({ lessons });
});

lessonsRouter.get('/:id', authRequired, (req, res) => {
  const lesson = db
    .prepare(
      `SELECT l.*, m.course_id, m.title as module_title, c.title as course_title, c.category
       FROM lessons l
       JOIN modules m ON m.id = l.module_id
       JOIN courses c ON c.id = m.course_id
       WHERE l.id = ?`
    )
    .get(req.params.id) as Record<string, unknown> | undefined;

  if (!lesson) return res.status(404).json({ error: 'Casharka lama helin.' });

  if (req.user!.role === 'STUDENT') {
    const existing = db
      .prepare(`SELECT id FROM lesson_progress WHERE student_id = ? AND lesson_id = ?`)
      .get(req.user!.id, req.params.id);
    if (existing) {
      db.prepare(`UPDATE lesson_progress SET last_accessed = datetime('now') WHERE student_id = ? AND lesson_id = ?`).run(
        req.user!.id,
        req.params.id
      );
    } else {
      db.prepare(
        `INSERT INTO lesson_progress (id, student_id, lesson_id, course_id, completed) VALUES (?, ?, ?, ?, 0)`
      ).run(uuid(), req.user!.id, req.params.id, lesson.course_id);
    }
  }

  const exercise = db.prepare(`SELECT id, title, description FROM exercises WHERE lesson_id = ?`).get(req.params.id);

  // curriculum sidebar
  const modules = db
    .prepare(`SELECT id, title, sort_order FROM modules WHERE course_id = ? ORDER BY sort_order`)
    .all(lesson.course_id) as Array<{ id: string; title: string; sort_order: number }>;

  const curriculum = modules.map((m) => {
    const lessons = db
      .prepare(`SELECT id, title, sort_order FROM lessons WHERE module_id = ? AND status = 'published' ORDER BY sort_order`)
      .all(m.id) as Array<{ id: string; title: string; sort_order: number }>;
    return {
      ...m,
      lessons: lessons.map((l) => {
        let completed = false;
        if (req.user!.role === 'STUDENT') {
          const p = db
            .prepare(`SELECT completed FROM lesson_progress WHERE student_id = ? AND lesson_id = ?`)
            .get(req.user!.id, l.id) as { completed: number } | undefined;
          completed = !!p?.completed;
        }
        return { ...l, completed, current: l.id === req.params.id };
      }),
    };
  });

  let completed = false;
  if (req.user!.role === 'STUDENT') {
    const p = db
      .prepare(`SELECT completed FROM lesson_progress WHERE student_id = ? AND lesson_id = ?`)
      .get(req.user!.id, req.params.id) as { completed: number } | undefined;
    completed = !!p?.completed;
  }

  res.json({ lesson: { ...lesson, completed, exercise }, curriculum });
});

lessonsRouter.post('/:id/complete', authRequired, requireRole('STUDENT'), (req, res) => {
  const lesson = db
    .prepare(
      `SELECT l.id, m.course_id, l.title FROM lessons l JOIN modules m ON m.id = l.module_id WHERE l.id = ?`
    )
    .get(req.params.id) as { id: string; course_id: string; title: string } | undefined;
  if (!lesson) return res.status(404).json({ error: 'Casharka lama helin.' });

  const existing = db
    .prepare(`SELECT id FROM lesson_progress WHERE student_id = ? AND lesson_id = ?`)
    .get(req.user!.id, req.params.id);

  if (existing) {
    db.prepare(
      `UPDATE lesson_progress SET completed = 1, completed_at = datetime('now'), last_accessed = datetime('now') WHERE student_id = ? AND lesson_id = ?`
    ).run(req.user!.id, req.params.id);
  } else {
    db.prepare(
      `INSERT INTO lesson_progress (id, student_id, lesson_id, course_id, completed, completed_at) VALUES (?, ?, ?, ?, 1, datetime('now'))`
    ).run(uuid(), req.user!.id, req.params.id, lesson.course_id);
  }

  db.prepare(`INSERT INTO activity_log (id, student_id, action, detail) VALUES (?, ?, ?, ?)`).run(
    uuid(),
    req.user!.id,
    'lesson_completed',
    `${lesson.title} — La dhammeeyay`
  );

  // Check course completion
  const total = db
    .prepare(
      `SELECT COUNT(*) as c FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ? AND l.status = 'published'`
    )
    .get(lesson.course_id) as { c: number };
  const done = db
    .prepare(`SELECT COUNT(*) as c FROM lesson_progress WHERE student_id = ? AND course_id = ? AND completed = 1`)
    .get(req.user!.id, lesson.course_id) as { c: number };

  let courseCompleted = false;
  if (total.c > 0 && done.c >= total.c) {
    const avg = db
      .prepare(
        `SELECT AVG(score) as avg FROM exercise_attempts ea
         JOIN exercises e ON e.id = ea.exercise_id
         JOIN lessons l ON l.id = e.lesson_id
         JOIN modules m ON m.id = l.module_id
         WHERE ea.student_id = ? AND m.course_id = ? AND ea.is_correct = 1`
      )
      .get(req.user!.id, lesson.course_id) as { avg: number | null };

    db.prepare(
      `INSERT INTO course_completions (id, student_id, course_id, final_score) VALUES (?, ?, ?, ?)
       ON CONFLICT(student_id, course_id) DO UPDATE SET final_score = excluded.final_score, completed_at = datetime('now')`
    ).run(uuid(), req.user!.id, lesson.course_id, avg.avg ?? 100);
    courseCompleted = true;
  }

  res.json({ ok: true, courseCompleted, progress: total.c ? Math.round((done.c / total.c) * 100) : 0 });
});

lessonsRouter.post('/', authRequired, requireRole('ADMIN'), (req, res) => {
  const schema = z.object({
    moduleId: z.string(),
    title: z.string().min(2),
    description: z.string().optional(),
    content: z.string().min(10),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Lesson data ma saxna.' });

  const max = db
    .prepare(`SELECT COALESCE(MAX(sort_order), -1) as m FROM lessons WHERE module_id = ?`)
    .get(parsed.data.moduleId) as { m: number };
  const id = uuid();
  db.prepare(
    `INSERT INTO lessons (id, module_id, title, description, content, sort_order, status, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, 'published', ?)`
  ).run(id, parsed.data.moduleId, parsed.data.title, parsed.data.description || '', parsed.data.content, max.m + 1, req.user!.id);

  const insertChunk = db.prepare(`INSERT INTO lesson_chunks (id, lesson_id, content, chunk_index) VALUES (?, ?, ?, ?)`);
  for (const ch of chunkText(parsed.data.content)) {
    insertChunk.run(ch.id, id, ch.content, ch.chunk_index);
  }

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

      const content = placeholderPdfContent(parsed.data.title);

      const max = db
        .prepare(`SELECT COALESCE(MAX(sort_order), -1) as m FROM lessons WHERE module_id = ?`)
        .get(parsed.data.moduleId) as { m: number };

      const id = uuid();
      const pdfUrl = `/uploads/${req.file.filename}`;
      db.prepare(
        `INSERT INTO lessons (id, module_id, title, description, content, pdf_url, sort_order, status, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)`
      ).run(
        id,
        parsed.data.moduleId,
        parsed.data.title,
        parsed.data.description || 'PDF lesson',
        content,
        pdfUrl,
        max.m + 1,
        req.user!.id
      );

      queuePdfProcessing(id, req.file.path, parsed.data.title);

      res.status(201).json({
        lesson: {
          id,
          title: parsed.data.title,
          pdfUrl,
          processing: true,
        },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'PDF processing failed.' });
    }
  }
);

lessonsRouter.put('/:id', authRequired, requireRole('ADMIN'), (req, res) => {
  const schema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(['published', 'draft']).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Update ma saxna.' });
  const existing = db.prepare(`SELECT * FROM lessons WHERE id = ?`).get(req.params.id) as Record<string, string> | undefined;
  if (!existing) return res.status(404).json({ error: 'Casharka lama helin.' });

  const content = parsed.data.content ?? existing.content;
  db.prepare(`UPDATE lessons SET title = ?, description = ?, content = ?, status = ? WHERE id = ?`).run(
    parsed.data.title ?? existing.title,
    parsed.data.description ?? existing.description,
    content,
    parsed.data.status ?? existing.status,
    req.params.id
  );

  if (parsed.data.content) {
    db.prepare(`DELETE FROM lesson_chunks WHERE lesson_id = ?`).run(req.params.id);
    const insertChunk = db.prepare(`INSERT INTO lesson_chunks (id, lesson_id, content, chunk_index) VALUES (?, ?, ?, ?)`);
    for (const ch of chunkText(content)) {
      insertChunk.run(ch.id, req.params.id, ch.content, ch.chunk_index);
    }
  }

  res.json({ ok: true });
});

lessonsRouter.delete('/:id', authRequired, requireRole('ADMIN'), (req, res) => {
  db.prepare(`DELETE FROM lessons WHERE id = ?`).run(req.params.id);
  res.json({ ok: true });
});
