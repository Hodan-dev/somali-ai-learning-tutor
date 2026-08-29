import { Router } from 'express';
import { db } from '../db.js';
import { authRequired, requireRole } from '../middleware/auth.js';

export const progressRouter = Router();

progressRouter.get('/', authRequired, requireRole('STUDENT'), (req, res) => {
  const courses = db
    .prepare(
      `SELECT c.id, c.title, c.category,
        (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = c.id AND l.status = 'published') as total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.student_id = ? AND lp.course_id = c.id AND lp.completed = 1) as completed_lessons
       FROM courses c
       JOIN enrollments e ON e.course_id = c.id AND e.student_id = ?
       ORDER BY c.category`
    )
    .all(req.user!.id, req.user!.id) as Array<{
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
  const overall = overallLessons ? Math.round((overallDone / overallLessons) * 100) : 0;

  const exerciseStats = db
    .prepare(
      `SELECT
        COUNT(DISTINCT question_id) as attempted,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
        AVG(CASE WHEN is_correct = 1 THEN score ELSE NULL END) as avg_score
       FROM (
         SELECT question_id, MAX(is_correct) as is_correct, MAX(score) as score
         FROM exercise_attempts WHERE student_id = ?
         GROUP BY question_id
       )`
    )
    .get(req.user!.id) as { attempted: number; correct_attempts: number; avg_score: number | null };

  const completedCourses = db
    .prepare(
      `SELECT cc.final_score, cc.completed_at, c.title, c.category
       FROM course_completions cc JOIN courses c ON c.id = cc.course_id
       WHERE cc.student_id = ?`
    )
    .all(req.user!.id);

  const activity = db
    .prepare(
      `SELECT action, detail, created_at FROM activity_log WHERE student_id = ? ORDER BY created_at DESC LIMIT 10`
    )
    .all(req.user!.id);

  // Continue learning target
  const continueTarget = db
    .prepare(
      `SELECT l.id as lesson_id, l.title as lesson_title, c.id as course_id, c.title as course_title, c.category,
        (SELECT COUNT(*) FROM lesson_progress lp2 WHERE lp2.student_id = ? AND lp2.course_id = c.id AND lp2.completed = 1) as done_in_course,
        (SELECT MAX(lp3.last_accessed) FROM lesson_progress lp3 WHERE lp3.student_id = ? AND lp3.course_id = c.id) as last_touch
       FROM lessons l
       JOIN modules m ON m.id = l.module_id
       JOIN courses c ON c.id = m.course_id
       JOIN enrollments e ON e.course_id = c.id AND e.student_id = ?
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = ?
       WHERE l.status = 'published' AND (lp.completed IS NULL OR lp.completed = 0)
       ORDER BY done_in_course DESC, COALESCE(last_touch, '') DESC, c.category, m.sort_order, l.sort_order
       LIMIT 1`
    )
    .get(req.user!.id, req.user!.id, req.user!.id, req.user!.id);

  res.json({
    overall,
    lessonsCompleted: overallDone,
    lessonsTotal: overallLessons,
    exercisesCompleted: exerciseStats.correct_attempts || 0,
    exercisesAttempted: exerciseStats.attempted || 0,
    averageScore: Math.round(exerciseStats.avg_score || 0),
    courses: courseProgress,
    completedCourses,
    activity,
    continueLearning: continueTarget || null,
  });
});

progressRouter.get('/:courseId', authRequired, requireRole('STUDENT'), (req, res) => {
  const total = db
    .prepare(
      `SELECT COUNT(*) as c FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ? AND l.status = 'published'`
    )
    .get(req.params.courseId) as { c: number };
  const done = db
    .prepare(`SELECT COUNT(*) as c FROM lesson_progress WHERE student_id = ? AND course_id = ? AND completed = 1`)
    .get(req.user!.id, req.params.courseId) as { c: number };

  res.json({
    courseId: req.params.courseId,
    progress: total.c ? Math.round((done.c / total.c) * 100) : 0,
    completedLessons: done.c,
    totalLessons: total.c,
  });
});
