import { Router } from 'express';
import {
  ActivityLog,
  ChatSession,
  Course,
  Enrollment,
  Exercise,
  ExerciseAttempt,
  Lesson,
  LessonProgress,
  Module,
  User,
} from '../models/index.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { lessonIdsForCourse } from '../helpers/stats.js';

export const adminRouter = Router();

adminRouter.use(authRequired, requireRole('ADMIN'));

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

adminRouter.get('/stats', async (_req, res) => {
  const last30 = daysAgo(30);
  const prev30Start = daysAgo(60);
  const last7 = daysAgo(7);

  const [
    totalStudents,
    totalCourses,
    totalLessons,
    totalExercises,
    newStudents,
    newStudentsPrev,
    lessonsCompleted,
    lessonsCompletedPrev,
    aiSessions,
    aiSessionsPrev,
    enrollments,
    courses,
    recentStudents,
    recentLessons,
    recentActivity,
    activityLast7,
    progressLast7,
    attemptsLast7,
  ] = await Promise.all([
    User.countDocuments({ role: 'STUDENT' }),
    Course.countDocuments(),
    Lesson.countDocuments(),
    Exercise.countDocuments(),
    User.countDocuments({ role: 'STUDENT', created_at: { $gte: last30 } }),
    User.countDocuments({ role: 'STUDENT', created_at: { $gte: prev30Start, $lt: last30 } }),
    LessonProgress.countDocuments({ completed: true }),
    LessonProgress.countDocuments({ completed: true, completed_at: { $gte: prev30Start, $lt: last30 } }),
    ChatSession.countDocuments(),
    ChatSession.countDocuments({ created_at: { $gte: prev30Start, $lt: last30 } }),
    Enrollment.find().lean(),
    Course.find().lean(),
    User.find({ role: 'STUDENT' }).sort({ created_at: -1 }).limit(5).select('_id name email created_at').lean(),
    Lesson.find().sort({ created_at: -1 }).limit(5).lean(),
    ActivityLog.find().sort({ created_at: -1 }).limit(10).lean(),
    ActivityLog.find({ created_at: { $gte: last7 } }).lean(),
    LessonProgress.find({ completed: true, completed_at: { $gte: last7 } }).lean(),
    ExerciseAttempt.find({ created_at: { $gte: last7 } }).lean(),
  ]);

  const courseMap = new Map(courses.map((c) => [c._id, c]));
  const categoryCounts: Record<string, number> = {};
  const courseEnrollmentCounts: Record<string, number> = {};

  for (const e of enrollments) {
    const course = courseMap.get(e.course_id);
    if (!course) continue;
    categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1;
    courseEnrollmentCounts[course._id] = (courseEnrollmentCounts[course._id] || 0) + 1;
  }

  const studentsBySubject = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const coursePopularity = courses
    .map((c) => ({
      title: c.title,
      category: c.category,
      enrollments: courseEnrollmentCounts[c._id] || 0,
    }))
    .sort((a, b) => b.enrollments - a.enrollments);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(last7);
    dayStart.setDate(dayStart.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const inRange = (d?: Date) => d && d >= dayStart && d < dayEnd;

    return {
      day: dayLabels[dayStart.getDay()],
      date: dayStart.toISOString().slice(0, 10),
      activity: activityLast7.filter((a) => inRange(a.created_at)).length,
      lessons: progressLast7.filter((p) => inRange(p.completed_at)).length,
      exercises: attemptsLast7.filter((a) => inRange(a.created_at)).length,
    };
  });

  const recentLessonsEnriched = await Promise.all(
    recentLessons.map(async (l) => {
      const mod = await Module.findById(l.module_id).lean();
      const course = mod ? await Course.findById(mod.course_id).lean() : null;
      return {
        id: l._id,
        title: l.title,
        created_at: l.created_at instanceof Date ? l.created_at.toISOString() : l.created_at,
        course_title: course?.title,
      };
    })
  );

  const recentActivityEnriched = await Promise.all(
    recentActivity.map(async (a) => {
      const student = await User.findById(a.student_id).select('name').lean();
      return {
        action: a.action,
        detail: a.detail,
        created_at: a.created_at instanceof Date ? a.created_at.toISOString() : a.created_at,
        student_name: student?.name,
      };
    })
  );

  const lessonsCompletedRecent = await LessonProgress.countDocuments({
    completed: true,
    completed_at: { $gte: last30 },
  });

  res.json({
    stats: {
      totalStudents,
      newStudents,
      totalCourses,
      totalLessons,
      totalExercises,
      lessonsCompleted,
      aiSessions,
    },
    trends: {
      students: pctChange(newStudents, newStudentsPrev),
      courses: totalCourses > 0 ? Math.min(100, Math.round((totalCourses / 10) * 100)) : 0,
      lessonsCompleted: pctChange(lessonsCompletedRecent, lessonsCompletedPrev),
      aiSessions: pctChange(
        await ChatSession.countDocuments({ created_at: { $gte: last30 } }),
        aiSessionsPrev
      ),
    },
    charts: {
      studentsBySubject,
      coursePopularity,
      weeklyActivity,
    },
    recentStudents: recentStudents.map((s) => ({
      id: s._id,
      name: s.name,
      email: s.email,
      created_at: s.created_at instanceof Date ? s.created_at.toISOString() : s.created_at,
    })),
    recentLessons: recentLessonsEnriched,
    recentActivity: recentActivityEnriched,
  });
});

adminRouter.get('/students', async (_req, res) => {
  const students = await User.find({ role: 'STUDENT' }).sort({ name: 1 }).lean();
  const lessonTotal = await Lesson.countDocuments({ status: 'published' });

  const enriched = await Promise.all(
    students.map(async (s) => {
      const lessonDone = await LessonProgress.countDocuments({ student_id: s._id, completed: true });
      return {
        id: s._id,
        name: s.name,
        email: s.email,
        created_at: s.created_at instanceof Date ? s.created_at.toISOString() : s.created_at,
        lessonsCompleted: lessonDone,
        overallProgress: lessonTotal ? Math.round((lessonDone / lessonTotal) * 100) : 0,
      };
    })
  );

  res.json({ students: enriched });
});

adminRouter.get('/students/:id/progress', async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: 'STUDENT' }).lean();
  if (!student) return res.status(404).json({ error: 'Ardayga lama helin.' });

  const courses = await Course.find().sort({ category: 1 }).lean();
  const courseProgress = await Promise.all(
    courses.map(async (c) => {
      const total_lessons = (await lessonIdsForCourse(c._id, true)).length;
      const completed_lessons = await LessonProgress.countDocuments({
        student_id: req.params.id,
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

  const ex = await ExerciseAttempt.aggregate([
    { $match: { student_id: req.params.id, is_correct: true } },
    {
      $group: {
        _id: null,
        attempted: { $addToSet: '$question_id' },
        avg_score: { $avg: '$score' },
      },
    },
    { $project: { attempted: { $size: '$attempted' }, avg_score: 1 } },
  ]);

  res.json({
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      created_at: student.created_at instanceof Date ? student.created_at.toISOString() : student.created_at,
    },
    overallProgress: overallLessons ? Math.round((overallDone / overallLessons) * 100) : 0,
    lessonsCompleted: overallDone,
    lessonsTotal: overallLessons,
    exercisesCompleted: ex[0]?.attempted || 0,
    averageScore: Math.round(ex[0]?.avg_score || 0),
    courses: courseProgress,
  });
});

adminRouter.get('/modules', async (_req, res) => {
  const modules = await Module.find().sort({ sort_order: 1 }).lean();
  const enriched = await Promise.all(
    modules.map(async (m) => {
      const course = await Course.findById(m.course_id).lean();
      return {
        id: m._id,
        title: m.title,
        sort_order: m.sort_order,
        course_id: m.course_id,
        course_title: course?.title,
        category: course?.category,
      };
    })
  );
  enriched.sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.sort_order - b.sort_order);
  res.json({ modules: enriched });
});
