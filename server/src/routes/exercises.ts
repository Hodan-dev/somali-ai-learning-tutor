import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { db } from '../db.js';
import { authRequired, requireRole } from '../middleware/auth.js';

export const exercisesRouter = Router();

exercisesRouter.get('/', authRequired, requireRole('ADMIN'), (_req, res) => {
  const exercises = db
    .prepare(
      `SELECT e.id, e.title, e.description, l.title as lesson_title, c.title as course_title,
        (SELECT COUNT(*) FROM questions q WHERE q.exercise_id = e.id) as question_count
       FROM exercises e
       JOIN lessons l ON l.id = e.lesson_id
       JOIN modules m ON m.id = l.module_id
       JOIN courses c ON c.id = m.course_id
       ORDER BY e.title`
    )
    .all();
  res.json({ exercises });
});

exercisesRouter.get('/lesson/:lessonId', authRequired, (req, res) => {
  const exercise = db
    .prepare(`SELECT id, lesson_id, title, description FROM exercises WHERE lesson_id = ?`)
    .get(req.params.lessonId) as { id: string; lesson_id: string; title: string; description: string } | undefined;

  if (!exercise) return res.status(404).json({ error: 'Layli lama helin casharkan.' });

  const questions = db
    .prepare(
      `SELECT id, question, type, options, explanation, hint, points, sort_order FROM questions WHERE exercise_id = ? ORDER BY sort_order`
    )
    .all(exercise.id) as Array<Record<string, unknown>>;

  // Don't send correct answers to students until submitted — strip them
  const safe = questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: q.options ? JSON.parse(q.options as string) : null,
    points: q.points,
    hint: q.hint,
  }));

  res.json({ exercise: { ...exercise, questions: safe } });
});

exercisesRouter.get('/:id', authRequired, (req, res) => {
  const exercise = db
    .prepare(
      `SELECT e.*, l.title as lesson_title, c.title as course_title, c.id as course_id
       FROM exercises e
       JOIN lessons l ON l.id = e.lesson_id
       JOIN modules m ON m.id = l.module_id
       JOIN courses c ON c.id = m.course_id
       WHERE e.id = ?`
    )
    .get(req.params.id) as Record<string, unknown> | undefined;
  if (!exercise) return res.status(404).json({ error: 'Layli lama helin.' });

  const questions = db
    .prepare(
      `SELECT id, question, type, options, hint, points, sort_order FROM questions WHERE exercise_id = ? ORDER BY sort_order`
    )
    .all(req.params.id) as Array<Record<string, unknown>>;

  res.json({
    exercise: {
      ...exercise,
      questions: questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options as string) : null,
      })),
    },
  });
});

exercisesRouter.post('/:id/submit', authRequired, requireRole('STUDENT'), (req, res) => {
  const schema = z.object({
    questionId: z.string(),
    answer: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Jawaabta lama helin.' });

  const question = db
    .prepare(`SELECT * FROM questions WHERE id = ? AND exercise_id = ?`)
    .get(parsed.data.questionId, req.params.id) as
    | {
        id: string;
        correct_answer: string;
        explanation: string;
        hint: string;
        points: number;
        type: string;
      }
    | undefined;

  if (!question) return res.status(404).json({ error: 'Su\'aasha lama helin.' });

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const isCorrect = normalize(parsed.data.answer) === normalize(question.correct_answer);

  const prev = db
    .prepare(
      `SELECT COUNT(*) as c FROM exercise_attempts WHERE student_id = ? AND question_id = ?`
    )
    .get(req.user!.id, question.id) as { c: number };

  const score = isCorrect ? question.points : 0;
  db.prepare(
    `INSERT INTO exercise_attempts (id, student_id, exercise_id, question_id, answer, is_correct, score, attempt_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(uuid(), req.user!.id, req.params.id, question.id, parsed.data.answer, isCorrect ? 1 : 0, score, prev.c + 1);

  db.prepare(`INSERT INTO activity_log (id, student_id, action, detail) VALUES (?, ?, ?, ?)`).run(
    uuid(),
    req.user!.id,
    isCorrect ? 'exercise_correct' : 'exercise_incorrect',
    isCorrect ? 'Layli — Jawaab sax ah' : 'Layli — Jawaab khaldan'
  );

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

exercisesRouter.get('/:id/summary', authRequired, requireRole('STUDENT'), (req, res) => {
  const questions = db
    .prepare(`SELECT id, points FROM questions WHERE exercise_id = ?`)
    .all(req.params.id) as { id: string; points: number }[];

  let correct = 0;
  let incorrect = 0;
  let earned = 0;
  let total = 0;

  for (const q of questions) {
    total += q.points;
    const best = db
      .prepare(
        `SELECT is_correct, score FROM exercise_attempts
         WHERE student_id = ? AND question_id = ?
         ORDER BY is_correct DESC, created_at DESC LIMIT 1`
      )
      .get(req.user!.id, q.id) as { is_correct: number; score: number } | undefined;
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

exercisesRouter.post('/', authRequired, requireRole('ADMIN'), (req, res) => {
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
  db.prepare(`INSERT INTO exercises (id, lesson_id, title, description) VALUES (?, ?, ?, ?)`).run(
    exerciseId,
    parsed.data.lessonId,
    parsed.data.title,
    parsed.data.description || ''
  );

  const insertQ = db.prepare(
    `INSERT INTO questions (id, exercise_id, question, type, options, correct_answer, explanation, hint, points, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  parsed.data.questions.forEach((q, i) => {
    insertQ.run(
      uuid(),
      exerciseId,
      q.question,
      q.type,
      q.options ? JSON.stringify(q.options) : null,
      q.correctAnswer,
      q.explanation || '',
      q.hint || '',
      q.points ?? 10,
      i
    );
  });

  res.status(201).json({ exercise: { id: exerciseId, title: parsed.data.title } });
});

exercisesRouter.delete('/:id', authRequired, requireRole('ADMIN'), (req, res) => {
  db.prepare(`DELETE FROM exercises WHERE id = ?`).run(req.params.id);
  res.json({ ok: true });
});
