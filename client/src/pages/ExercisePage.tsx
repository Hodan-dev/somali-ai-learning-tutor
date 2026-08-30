import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { api } from '../lib/api';
import { ErrorBox, Loading } from '../components/ui';

interface Question {
  id: string;
  question: string;
  type: string;
  options: string[] | null;
  points: number;
  hint?: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  lesson_title: string;
  course_title: string;
  course_id: string;
  lesson_id: string;
  questions: Question[];
}

export function ExercisePage() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    message: string;
    hint?: string;
    explanation?: string;
    score: number;
  } | null>(null);
  const [summary, setSummary] = useState<{
    correct: number;
    incorrect: number;
    score: number;
    total: number;
    percent: number;
    questionCount: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQ, setAiQ] = useState('');
  const [aiA, setAiA] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    api<{ exercise: Exercise }>(`/api/exercises/${id}`)
      .then((d) => setExercise(d.exercise))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!exercise) return null;

  const q = exercise.questions[index];

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!q || !answer) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await api<{
        correct: boolean;
        message: string;
        hint?: string;
        explanation?: string;
        score: number;
      }>(`/api/exercises/${id}/submit`, {
        method: 'POST',
        json: { questionId: q.id, answer },
      });
      setFeedback(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  async function next() {
    if (index + 1 >= exercise!.questions.length) {
      const s = await api<{ summary: typeof summary }>(`/api/exercises/${id}/summary`);
      setSummary(s.summary);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer('');
    setFeedback(null);
    setAiOpen(false);
    setAiA('');
  }

  async function askAi(e: FormEvent) {
    e.preventDefault();
    if (!aiQ.trim() || !exercise) return;
    setAiLoading(true);
    try {
      const res = await api<{ reply: string }>('/api/ai/chat', {
        method: 'POST',
        json: {
          message: aiQ,
          lessonId: exercise.lesson_id,
          courseId: exercise.course_id,
          exerciseId: exercise.id,
          exerciseHint: true,
        },
      });
      setAiA(res.reply);
    } catch (err) {
      setAiA(err instanceof Error ? err.message : 'Error');
    } finally {
      setAiLoading(false);
    }
  }

  if (finished && summary) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
        <div className="text-4xl">🎉</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Exercise Completed</h1>
        <p className="mt-2 text-muted">{exercise.title}</p>
        <div className="mt-6 font-display text-5xl font-bold text-sea">{summary.percent}%</div>
        <p className="mt-2 text-ink">
          Score: {summary.score} / {summary.total}
        </p>
        <p className="mt-1 text-sm text-muted">
          Sax: {summary.correct} · Khalad: {summary.incorrect}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to={`/app/lessons/${exercise.lesson_id}`}
            className="rounded-xl bg-sea px-5 py-3 text-sm font-semibold text-white"
          >
            Continue Lesson
          </Link>
          <button
            type="button"
            onClick={() => {
              setFinished(false);
              setIndex(0);
              setAnswer('');
              setFeedback(null);
              setSummary(null);
            }}
            className="rounded-xl border border-blue-200 px-5 py-3 text-sm font-semibold"
          >
            Review / Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-sm text-muted">
          {exercise.course_title} · {exercise.lesson_title}
        </p>
        <h1 className="font-display text-3xl font-bold text-ink">{exercise.title}</h1>
        <p className="mt-1 text-sm text-muted">
          Su&apos;aal {index + 1} / {exercise.questions.length}
        </p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-ink">{q.question}</h2>
        <p className="mt-1 text-xs text-muted">+{q.points} points</p>

        <div className="mt-5 space-y-2">
          {q.options?.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setAnswer(opt)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                answer === opt ? 'border-sea bg-sea-light' : 'border-blue-100 hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  answer === opt ? 'border-sea bg-sea' : 'border-slate-300'
                }`}
                aria-hidden
              >
                {answer === opt && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              {opt}
            </button>
          ))}
          {!q.options && (
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Qor jawaabtaada..."
              className="w-full rounded-xl border border-blue-100 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sea"
            />
          )}
        </div>

        {!feedback && (
          <button
            type="submit"
            disabled={!answer || submitting}
            className="mt-6 rounded-xl bg-sea px-5 py-3 text-sm font-semibold text-white hover:bg-sea-dark disabled:opacity-60"
          >
            {submitting ? 'Gudbinaya...' : 'Gudbi Jawaabta'}
          </button>
        )}
      </form>

      {feedback && (
        <div
          className={`rounded-2xl border p-5 ${
            feedback.correct ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
          }`}
        >
          <div className="font-display text-lg font-semibold">{feedback.message}</div>
          {feedback.correct && <p className="mt-1 text-sm text-green-800">+{feedback.score} points</p>}
          {feedback.explanation && <p className="mt-2 text-sm">{feedback.explanation}</p>}
          {feedback.hint && (
            <p className="mt-2 text-sm">
              <strong>Hint:</strong> {feedback.hint}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {feedback.correct ? (
              <button
                type="button"
                onClick={next}
                className="rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white"
              >
                {index + 1 >= exercise.questions.length ? 'See Results' : 'Next Exercise'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setAnswer('');
                  }}
                  className="rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => setAiOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold"
                >
                  <Bot className="h-4 w-4" /> Ask AI Tutor
                </button>
                <button type="button" onClick={next} className="rounded-xl px-4 py-2.5 text-sm text-muted">
                  Skip / Next
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {aiOpen && (
        <div className="rounded-2xl border border-blue-100 bg-white p-5">
          <h3 className="font-display font-semibold">Macallinka AI — Hint</h3>
          <form onSubmit={askAi} className="mt-3 flex gap-2">
            <input
              value={aiQ}
              onChange={(e) => setAiQ(e.target.value)}
              placeholder='Tusaale: "I sii hint"'
              className="flex-1 rounded-xl border border-blue-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sea"
            />
            <button type="submit" className="rounded-xl bg-sea px-4 py-2 text-sm font-semibold text-white">
              {aiLoading ? '...' : 'Weydii'}
            </button>
          </form>
          {aiA && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-sea-light p-3 text-sm">{aiA}</p>}
        </div>
      )}
    </div>
  );
}
