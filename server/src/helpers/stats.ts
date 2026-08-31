import {
  Course,
  Enrollment,
  Exercise,
  ExerciseAttempt,
  Lesson,
  LessonProgress,
  Module,
} from '../models/index.js';

export async function moduleIdsForCourse(courseId: string) {
  return Module.find({ course_id: courseId }).distinct('_id');
}

export async function lessonIdsForCourse(courseId: string, publishedOnly = false) {
  const moduleIds = await moduleIdsForCourse(courseId);
  const filter: Record<string, unknown> = { module_id: { $in: moduleIds } };
  if (publishedOnly) filter.status = 'published';
  return Lesson.find(filter).distinct('_id');
}

export async function courseStats(courseId: string) {
  const moduleIds = await moduleIdsForCourse(courseId);
  const lessonCount = await Lesson.countDocuments({ module_id: { $in: moduleIds }, status: 'published' });
  const lessonIds = await Lesson.find({ module_id: { $in: moduleIds } }).distinct('_id');
  const exerciseCount = await Exercise.countDocuments({ lesson_id: { $in: lessonIds } });
  return { lessonCount, exerciseCount };
}

export async function studentCourseProgress(studentId: string, courseId: string) {
  const moduleIds = await moduleIdsForCourse(courseId);
  const totalLessons = await Lesson.countDocuments({ module_id: { $in: moduleIds }, status: 'published' });
  const completedLessons = await LessonProgress.countDocuments({
    student_id: studentId,
    course_id: courseId,
    completed: true,
  });
  const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  return { completedLessons, totalLessons, progress };
}

export async function nextSortOrder(model: typeof Lesson | typeof Module, filter: Record<string, string>) {
  const latest = await model.findOne(filter).sort({ sort_order: -1 }).select('sort_order').lean();
  return (latest?.sort_order ?? -1) + 1;
}

export async function avgExerciseScoreForCourse(studentId: string, courseId: string) {
  const lessonIds = await lessonIdsForCourse(courseId);
  const exercises = await Exercise.find({ lesson_id: { $in: lessonIds } }).distinct('_id');
  const result = await ExerciseAttempt.aggregate([
    { $match: { student_id: studentId, exercise_id: { $in: exercises }, is_correct: true } },
    { $group: { _id: null, avg: { $avg: '$score' } } },
  ]);
  return result[0]?.avg ?? 100;
}

export async function enrolledCoursesForStudent(studentId: string) {
  const enrollments = await Enrollment.find({ student_id: studentId }).lean();
  const courseIds = enrollments.map((e) => e.course_id);
  return Course.find({ _id: { $in: courseIds } }).sort({ category: 1, title: 1 }).lean();
}
