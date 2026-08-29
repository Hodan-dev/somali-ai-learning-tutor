import { Router } from 'express';
import { db } from '../db.js';
import { authRequired, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();

adminRouter.use(authRequired, requireRole('ADMIN'));

adminRouter.get('/stats', (_req, res) => {
  const students = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'STUDENT'`).get() as { c: number };
  const courses = db.prepare(`SELECT COUNT(*) as c FROM courses`).get() as { c: number };
  const lessons = db.prepare(`SELECT COUNT(*) as c FROM lessons`).get() as { c: number };
  const exercises = db.prepare(`SELECT COUNT(*) as c FROM exercises`).get() as { c: number };

  const recentStudents = db
    .prepare(`SELECT id, name, email, created_at FROM users WHERE role = 'STUDENT' ORDER BY created_at DESC LIMIT 5`)
    .all();
  const recentLessons = db
    .prepare(
      `SELECT l.id, l.title, l.created_at, c.title as course_title
       FROM lessons l JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = m.course_id
       ORDER BY l.created_at DESC LIMIT 5`
    )
    .all();
  const recentActivity = db
    .prepare(
      `SELECT a.action, a.detail, a.created_at, u.name as student_name
       FROM activity_log a JOIN users u ON u.id = a.student_id
       ORDER BY a.created_at DESC LIMIT 10`
    )
    .all();

  res.json({
    stats: {
      totalStudents: students.c,
      totalCourses: courses.c,
      totalLessons: lessons.c,
      totalExercises: exercises.c,
    },
    recentStudents,
    recentLessons,
    recentActivity,
  });
});

adminRouter.get('/students', (_req, res) => {
  const students = db
    .prepare(`SELECT id, name, email, created_at FROM users WHERE role = 'STUDENT' ORDER BY name`)
    .all() as Array<{ id: string; name: string; email: string; created_at: string }>;

  const enriched = students.map((s) => {
    const lessonDone = db
      .prepare(`SELECT COUNT(*) as c FROM lesson_progress WHERE student_id = ? AND completed = 1`)
      .get(s.id) as { c: number };
    const lessonTotal = db
      .prepare(`SELECT COUNT(*) as c FROM lessons WHERE status = 'published'`)
      .get() as { c: number };
    return {
      ...s,
      lessonsCompleted: lessonDone.c,
      overallProgress: lessonTotal.c ? Math.round((lessonDone.c / lessonTotal.c) * 100) : 0,
    };
  });

  res.json({ students: enriched });
});

adminRouter.get('/students/:id/progress', (req, res) => {
  const student = db
    .prepare(`SELECT id, name, email, created_at FROM users WHERE id = ? AND role = 'STUDENT'`)
    .get(req.params.id) as { id: string; name: string; email: string; created_at: string } | undefined;
  if (!student) return res.status(404).json({ error: 'Ardayga lama helin.' });

  const courses = db
    .prepare(
      `SELECT c.id, c.title, c.category,
        (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = c.id AND l.status = 'published') as total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.student_id = ? AND lp.course_id = c.id AND lp.completed = 1) as completed_lessons
       FROM courses c ORDER BY c.category`
    )
    .all(req.params.id) as Array<{
    id: string;
    title: string;
    category: string;
    total_lessons: number;
    completed_lessons: number;
  }>;

  const courseProgress = courses.map((c) => ({
    ...c,
    progress: c.total_lessons ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0,
  }));

  const overallLessons = courseProgress.reduce((a, c) => a + c.total_lessons, 0);
  const overallDone = courseProgress.reduce((a, c) => a + c.completed_lessons, 0);

  const ex = db
    .prepare(
      `SELECT COUNT(DISTINCT question_id) as attempted,
        AVG(score) as avg_score
       FROM exercise_attempts WHERE student_id = ? AND is_correct = 1`
    )
    .get(req.params.id) as { attempted: number; avg_score: number | null };

  res.json({
    student,
    overallProgress: overallLessons ? Math.round((overallDone / overallLessons) * 100) : 0,
    lessonsCompleted: overallDone,
    lessonsTotal: overallLessons,
    exercisesCompleted: ex.attempted || 0,
    averageScore: Math.round(ex.avg_score || 0),
    courses: courseProgress,
  });
});

adminRouter.get('/modules', (_req, res) => {
  const modules = db
    .prepare(
      `SELECT m.id, m.title, m.sort_order, c.id as course_id, c.title as course_title, c.category
       FROM modules m JOIN courses c ON c.id = m.course_id
       ORDER BY c.category, m.sort_order`
    )
    .all();
  res.json({ modules });
});
