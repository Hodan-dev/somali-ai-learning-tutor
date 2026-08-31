import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import {
  ActivityLog,
  Course,
  Exercise,
  ExerciseAttempt,
  Lesson,
  Module,
  Question,
  mapId,
} from '../models/index.js';
import { authRequired, requireRole } from '../middleware/auth.js';

export const exercisesRouter = Router();

exercisesRouter.get('/', authRequired, requireRole('ADMIN'), async (_req, res) => {
  const exercises = await Exercise.find().sort({ title: 1 }).lean();
  const enriched = await Promise.all(
    exercises.map(async (e) => {
      const lesson = await Lesson.findById(e.lesson_id).lean();
      const mod = lesson ? await Module.findById(lesson.module_id).lean() : null;
      const course = mod ? await Course.findById(mod.course_id).lean() : null;
      const question_count = await Question.countDocuments({ exercise_id: e._id });
      return {
        id: e._id,
        title: e.title,
        description: e.description,
        lesson_title: lesson?.title,
        course_title: course?.title,
        question_count,
      };
    })
  );
  res.json({ exercises: enriched });
});

exercisesRouter.get('/lesson/:lessonId', authRequired, async (req, res) => {
  const exercise = await Exercise.findOne({ lesson_id: req.params.lessonId }).lean();
  if (!exercise) return res.status(404).json({ error: 'Layli lama helin casharkan.' });

  const questions = await Question.find({ exercise_id: exercise._id }).sort({ sort_order: 1 }).lean();
  const safe = questions.map((q) => ({
    id: q._id,
    question: q.question,
    type: q.type,
    options: q.options?.length ? q.options : null,
    points: q.points,
    hint: q.hint,
  }));

  res.json({ exercise: { ...mapId(exercise), questions: safe } });
});

exercisesRouter.get('/:id', authRequired, async (req, res) => {
  const exercise = await Exercise.findById(req.params.id).lean();
  if (!exercise) return res.status(404).json({ error: 'Layli lama helin.' });

  const lesson = await Lesson.findById(exercise.lesson_id).lean();
  const mod = lesson ? await Module.findById(lesson.module_id).lean() : null;
  const course = mod ? await Course.findById(mod.course_id).lean() : null;
  const questions = await Question.find({ exercise_id: req.params.id }).sort({ sort_order: 1 }).lean();

  res.json({
    exercise: {
      ...mapId(exercise),
      lesson_title: lesson?.title,
      course_title: course?.title,
      course_id: course?._id,
      questions: questions.map((q) => ({
        ...mapId(q),
        options: q.options?.length ? q.options : null,
      })),
    },
  });
});

exercisesRouter.post('/:id/submit', authRequired, requireRole('STUDENT'), async (req, res) => {
  const schema = z.object({
    questionId: z.string(),
    answer: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Jawaabta lama helin.' });

  const question = await Question.findOne({ _id: parsed.data.questionId, exercise_id: req.params.id }).lean();
  if (!question) return res.status(404).json({ error: "Su'aasha lama helin." });

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const isCorrect = normalize(parsed.data.answer) === normalize(question.correct_answer);

  const prev = await ExerciseAttempt.countDocuments({
    student_id: req.user!.id,
    question_id: question._id,
  });

  const score = isCorrect ? question.points : 0;
  await ExerciseAttempt.create({
    student_id: req.user!.id,
    exercise_id: req.params.id,
    question_id: question._id,
    answer: parsed.data.answer,
    is_correct: isCorrect,
    score,
    attempt_number: prev + 1,
  });

  await ActivityLog.create({
    student_id: req.user!.id,
    action: isCorrect ? 'exercise_correct' : 'exercise_incorrect',
    detail: isCorrect ? 'Layli — Jawaab sax ah' : 'Layli — Jawaab khaldan',
  });

  res.json({
    correct: isCorrect,
    score,
    points: question.points,
    explanation: isCorrect ? question.explanation : undefined,
    hint: isCorrect ? undefined : question.hint,
    message: isCorrect
      ? '✓ Sax! Si fiican ayaad u fahamtay! 👏'
      : '✗ Weli sax ma aha. Isku day mar kale ama weydii Macallinka AI.',
  });
});

exercisesRouter.get('/:id/summary', authRequired, requireRole('STUDENT'), async (req, res) => {
  const questions = await Question.find({ exercise_id: req.params.id }).select('_id points').lean();

  let correct = 0;
  let incorrect = 0;
  let earned = 0;
  let total = 0;

  for (const q of questions) {
    total += q.points;
    const best = await ExerciseAttempt.findOne({ student_id: req.user!.id, question_id: q._id })
      .sort({ is_correct: -1, created_at: -1 })
      .lean();
    if (best?.is_correct) {
      correct++;
      earned += best.score;
    } else if (best) {
      incorrect++;
    }
  }

  const pct = total ? Math.round((earned / total) * 100) : 0;
  res.json({
    summary: {
      correct,
      incorrect,
      unanswered: questions.length - correct - incorrect,
      score: earned,
      total,
      percent: pct,
      questionCount: questions.length,
    },
  });
});

exercisesRouter.post('/', authRequired, requireRole('ADMIN'), async (req, res) => {
  const schema = z.object({
    lessonId: z.string(),
    title: z.string().min(2),
    description: z.string().optional(),
    questions: z
      .array(
        z.object({
          question: z.string(),
          type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'code']),
          options: z.array(z.string()).optional(),
          correctAnswer: z.string(),
          explanation: z.string().optional(),
          hint: z.string().optional(),
          points: z.number().optional(),
        })
      )
      .min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Exercise data ma saxna.' });

  const exerciseId = uuid();
  await Exercise.create({
    _id: exerciseId,
    lesson_id: parsed.data.lessonId,
    title: parsed.data.title,
    description: parsed.data.description || '',
  });

  await Question.insertMany(
    parsed.data.questions.map((q, i) => ({
      exercise_id: exerciseId,
      question: q.question,
      type: q.type,
      options: q.options || [],
      correct_answer: q.correctAnswer,
      explanation: q.explanation || '',
      hint: q.hint || '',
      points: q.points ?? 10,
      sort_order: i,
    }))
  );

  res.status(201).json({ exercise: { id: exerciseId, title: parsed.data.title } });
});

exercisesRouter.delete('/:id', authRequired, requireRole('ADMIN'), async (req, res) => {
  await Question.deleteMany({ exercise_id: req.params.id });
  await ExerciseAttempt.deleteMany({ exercise_id: req.params.id });
  await Exercise.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});
