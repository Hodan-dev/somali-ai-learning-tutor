import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { db } from '../db.js';
import { authRequired, requireRole } from '../middleware/auth.js';

export const coursesRouter = Router();

function courseStats(courseId: string) {
  const lessons = db
    .prepare(
      `SELECT COUNT(*) as c FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ? AND l.status = 'published'`
    )
    .get(courseId) as { c: number };
  const exercises = db
    .prepare(
      `SELECT COUNT(*) as c FROM exercises e
       JOIN lessons l ON l.id = e.lesson_id
       JOIN modules m ON m.id = l.module_id
       WHERE m.course_id = ?`
    )
    .get(courseId) as { c: number };
  return { lessonCount: lessons.c, exerciseCount: exercises.c };
}

function studentCourseProgress(studentId: string, courseId: string) {
  const total = db
    .prepare(
      `SELECT COUNT(*) as c FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ? AND l.status = 'published'`
    )
    .get(courseId) as { c: number };
  const done = db
    .prepare(
      `SELECT COUNT(*) as c FROM lesson_progress WHERE student_id = ? AND course_id = ? AND completed = 1`
    )
    .get(studentId, courseId) as { c: number };
  const pct = total.c === 0 ? 0 : Math.round((done.c / total.c) * 100);
  return { completedLessons: done.c, totalLessons: total.c, progress: pct };
}

coursesRouter.get('/', authRequired, (req, res) => {
  const courses = db
    .prepare(`SELECT id, title, description, category, difficulty, thumbnail, created_at FROM courses ORDER BY category, title`)
    .all() as Array<Record<string, unknown>>;

  const result = courses.map((c) => {
    const stats = courseStats(c.id as string);
    const progress =
      req.user!.role === 'STUDENT'
        ? studentCourseProgress(req.user!.id, c.id as string)
        : { progress: 0, completedLessons: 0, totalLessons: stats.lessonCount };
    return { ...c, ...stats, ...progress };
  });
  res.json({ courses: result });
});

coursesRouter.get('/:id', authRequired, (req, res) => {
  const courseId = String(req.params.id);
  const course = db.prepare(`SELECT * FROM courses WHERE id = ?`).get(courseId) as
    | Record<string, unknown>
    | undefined;
  if (!course) return res.status(404).json({ error: 'Koorsada lama helin.' });

  const modules = db
    .prepare(`SELECT id, title, sort_order FROM modules WHERE course_id = ? ORDER BY sort_order`)
    .all(courseId) as Array<{ id: string; title: string; sort_order: number }>;

  const curriculum = modules.map((m) => {
    const lessons = db
      .prepare(
        `SELECT id, title, description, sort_order, status FROM lessons WHERE module_id = ? ORDER BY sort_order`
      )
      .all(m.id) as Array<{ id: string; title: string; description: string; sort_order: number; status: string }>;

    const withProgress = lessons.map((l) => {
      let completed = false;
      if (req.user!.role === 'STUDENT') {
        const p = db
          .prepare(`SELECT completed FROM lesson_progress WHERE student_id = ? AND lesson_id = ?`)
          .get(req.user!.id, l.id) as { completed: number } | undefined;
        completed = !!p?.completed;
      }
      const ex = db.prepare(`SELECT id FROM exercises WHERE lesson_id = ?`).get(l.id) as { id: string } | undefined;
      return { ...l, completed, exerciseId: ex?.id || null };
    });

    return { ...m, lessons: withProgress };
  });

  const stats = courseStats(courseId);
  const progress =
    req.user!.role === 'STUDENT'
      ? studentCourseProgress(req.user!.id, courseId)
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

  res.json({ course: { ...course, ...stats, ...progress, currentLessonId, modules: curriculum } });
});

coursesRouter.post('/', authRequired, requireRole('ADMIN'), (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    category: z.string().min(2),
    difficulty: z.string().default('Beginner'),
    sequential: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Macluumaadka koorsada ma saxna.' });

  const id = uuid();
  db.prepare(
    `INSERT INTO courses (id, title, description, category, difficulty, sequential) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, parsed.data.title, parsed.data.description, parsed.data.category, parsed.data.difficulty, parsed.data.sequential ? 1 : 0);

  // Enroll all students
  const students = db.prepare(`SELECT id FROM users WHERE role = 'STUDENT'`).all() as { id: string }[];
  const enroll = db.prepare(`INSERT OR IGNORE INTO enrollments (id, student_id, course_id) VALUES (?, ?, ?)`);
  for (const s of students) enroll.run(uuid(), s.id, id);

  res.status(201).json({ course: { id, ...parsed.data } });
});

coursesRouter.put('/:id', authRequired, requireRole('ADMIN'), (req, res) => {
  const schema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    category: z.string().min(2).optional(),
    difficulty: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Update ma saxna.' });

  const existing = db.prepare(`SELECT * FROM courses WHERE id = ?`).get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Koorsada lama helin.' });

  const e = existing as Record<string, string>;
  db.prepare(
    `UPDATE courses SET title = ?, description = ?, category = ?, difficulty = ? WHERE id = ?`
  ).run(
    parsed.data.title ?? e.title,
    parsed.data.description ?? e.description,
    parsed.data.category ?? e.category,
    parsed.data.difficulty ?? e.difficulty,
    req.params.id
  );
  res.json({ ok: true });
});

coursesRouter.delete('/:id', authRequired, requireRole('ADMIN'), (req, res) => {
  db.prepare(`DELETE FROM courses WHERE id = ?`).run(req.params.id);
  res.json({ ok: true });
});

coursesRouter.post('/:id/modules', authRequired, requireRole('ADMIN'), (req, res) => {
  const title = z.string().min(2).safeParse(req.body.title);
  if (!title.success) return res.status(400).json({ error: 'Module title waa loo baahan yahay.' });
  const max = db.prepare(`SELECT COALESCE(MAX(sort_order), -1) as m FROM modules WHERE course_id = ?`).get(req.params.id) as { m: number };
  const id = uuid();
  db.prepare(`INSERT INTO modules (id, course_id, title, sort_order) VALUES (?, ?, ?, ?)`).run(
    id,
    req.params.id,
    title.data,
    max.m + 1
  );
  res.status(201).json({ module: { id, title: title.data, sort_order: max.m + 1 } });
});
