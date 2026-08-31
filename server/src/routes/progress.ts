import { Router } from 'express';
import {
  ActivityLog,
  Course,
  CourseCompletion,
  Enrollment,
  ExerciseAttempt,
  Lesson,
  LessonProgress,
  Module,
} from '../models/index.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { lessonIdsForCourse } from '../helpers/stats.js';

export const progressRouter = Router();

progressRouter.get('/', authRequired, requireRole('STUDENT'), async (req, res) => {
  const enrollments = await Enrollment.find({ student_id: req.user!.id }).lean();
  const courseIds = enrollments.map((e) => e.course_id);
  const courses = await Course.find({ _id: { $in: courseIds } }).sort({ category: 1 }).lean();

  const courseProgress = await Promise.all(
    courses.map(async (c) => {
      const total_lessons = (await lessonIdsForCourse(c._id, true)).length;
      const completed_lessons = await LessonProgress.countDocuments({
        student_id: req.user!.id,
        course_id: c._id,
        completed: true,
      });
      return {
        id: c._id,
        title: c.title,
        category: c.category,
        total_lessons,
        completed_lessons,
        progress: total_lessons ? Math.round((completed_lessons / total_lessons) * 100) : 0,
      };
    })
  );

  const overallLessons = courseProgress.reduce((a, c) => a + c.total_lessons, 0);
  const overallDone = courseProgress.reduce((a, c) => a + c.completed_lessons, 0);
  const overall = overallLessons ? Math.round((overallDone / overallLessons) * 100) : 0;

  const attempts = await ExerciseAttempt.aggregate([
    { $match: { student_id: req.user!.id } },
    { $sort: { created_at: -1 } },
    {
      $group: {
        _id: '$question_id',
        is_correct: { $max: '$is_correct' },
        score: { $max: '$score' },
      },
    },
    {
      $group: {
        _id: null,
        attempted: { $sum: 1 },
        correct_attempts: { $sum: { $cond: ['$is_correct', 1, 0] } },
        avg_score: { $avg: { $cond: ['$is_correct', '$score', null] } },
      },
    },
  ]);
  const exerciseStats = attempts[0] || { attempted: 0, correct_attempts: 0, avg_score: 0 };

  const completedCourses = await CourseCompletion.find({ student_id: req.user!.id }).lean();
  const completedCoursesEnriched = await Promise.all(
    completedCourses.map(async (cc) => {
      const course = await Course.findById(cc.course_id).lean();
      return {
        final_score: cc.final_score,
        completed_at: cc.completed_at instanceof Date ? cc.completed_at.toISOString() : cc.completed_at,
        title: course?.title,
        category: course?.category,
      };
    })
  );

  const activity = await ActivityLog.find({ student_id: req.user!.id })
    .sort({ created_at: -1 })
    .limit(10)
    .lean();

  let continueTarget: Record<string, unknown> | null = null;
  for (const c of courses) {
    const modules = await Module.find({ course_id: c._id }).sort({ sort_order: 1 }).lean();
    for (const m of modules) {
      const lessons = await Lesson.find({ module_id: m._id, status: 'published' }).sort({ sort_order: 1 }).lean();
      for (const l of lessons) {
        const p = await LessonProgress.findOne({ student_id: req.user!.id, lesson_id: l._id }).lean();
        if (!p?.completed) {
          const doneInCourse = await LessonProgress.countDocuments({
            student_id: req.user!.id,
            course_id: c._id,
            completed: true,
          });
          continueTarget = {
            lesson_id: l._id,
            lesson_title: l.title,
            course_id: c._id,
            course_title: c.title,
            category: c.category,
            done_in_course: doneInCourse,
          };
          break;
        }
      }
      if (continueTarget) break;
    }
    if (continueTarget) break;
  }

  res.json({
    overall,
    lessonsCompleted: overallDone,
    lessonsTotal: overallLessons,
    exercisesCompleted: exerciseStats.correct_attempts || 0,
    exercisesAttempted: exerciseStats.attempted || 0,
    averageScore: Math.round(exerciseStats.avg_score || 0),
    courses: courseProgress,
    completedCourses: completedCoursesEnriched,
    activity: activity.map((a) => ({
      action: a.action,
      detail: a.detail,
      created_at: a.created_at instanceof Date ? a.created_at.toISOString() : a.created_at,
    })),
    continueLearning: continueTarget,
  });
});

progressRouter.get('/:courseId', authRequired, requireRole('STUDENT'), async (req, res) => {
  const total = (await lessonIdsForCourse(req.params.courseId, true)).length;
  const done = await LessonProgress.countDocuments({
    student_id: req.user!.id,
    course_id: req.params.courseId,
    completed: true,
  });

  res.json({
    courseId: req.params.courseId,
    progress: total ? Math.round((done / total) * 100) : 0,
    completedLessons: done,
    totalLessons: total,
  });
});
