import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ErrorBox, Loading, ProgressBar } from '../components/ui';

export function ProgressPage() {
  const [data, setData] = useState<{
    overall: number;
    lessonsCompleted: number;
    lessonsTotal: number;
    exercisesCompleted: number;
    averageScore: number;
    courses: Array<{ id: string; title: string; category: string; progress: number }>;
    completedCourses: Array<{ title: string; final_score: number; category: string }>;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<NonNullable<typeof data>>('/api/progress')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Horumarkayga</h1>
        <p className="mt-1 text-muted">La soco casharrada, layliyada, iyo koorsooyinka.</p>
      </div>

      <section className="rounded-3xl border border-teal-100 bg-white p-6">
        <h2 className="font-display text-lg font-semibold">Overall Progress</h2>
        <div className="mt-3 flex items-end gap-4">
          <div className="font-display text-5xl font-bold text-sea">{data.overall}%</div>
          <div className="mb-2 flex-1">
            <ProgressBar value={data.overall} />
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Lessons Completed" value={`${data.lessonsCompleted} / ${data.lessonsTotal}`} />
          <Stat label="Exercises Completed" value={String(data.exercisesCompleted)} />
          <Stat label="Average Score" value={`${data.averageScore}%`} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">By Course</h2>
        {data.courses.map((c) => (
          <Link
            key={c.id}
            to={`/app/courses/${c.id}`}
            className="block rounded-2xl border border-teal-100 bg-white p-4 hover:border-teal-200"
          >
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-ink">
                {c.title} <span className="font-normal text-muted">· {c.category}</span>
              </span>
              <span className="font-semibold text-sea">{c.progress}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={c.progress} />
            </div>
          </Link>
        ))}
      </section>

      {data.completedCourses.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-display text-lg font-semibold">Completed Courses 🎉</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.completedCourses.map((c, i) => (
              <li key={i}>
                {c.title} ({c.category}) — Final Score: {Math.round(c.final_score)}%
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-sea-light/60 p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-display text-xl font-bold text-ink">{value}</div>
    </div>
  );
}

export function ProfilePage() {
  const [data, setData] = useState<{
    user: { name: string; email: string; created_at: string };
    profile: {
      enrolledCourses?: number;
      completedCourses?: number;
      lessonsCompleted?: number;
      joinedAt: string;
    };
  } | null>(null);
  const [progress, setProgress] = useState<{ overall: number; averageScore: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api<NonNullable<typeof data>>('/api/profile'),
      api<{ overall: number; averageScore: number }>('/api/progress'),
    ])
      .then(([p, pr]) => {
        setData(p);
        setProgress(pr);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">Profile</h1>
      <div className="rounded-2xl border border-teal-100 bg-white p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sea font-display text-2xl font-bold text-white">
          {data.user.name.charAt(0)}
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">{data.user.name}</h2>
        <p className="text-muted">{data.user.email}</p>
        <dl className="mt-6 space-y-3 text-sm">
          <Row label="Joined" value={new Date(data.profile.joinedAt).toLocaleDateString()} />
          <Row label="Courses enrolled" value={String(data.profile.enrolledCourses ?? 0)} />
          <Row label="Courses completed" value={String(data.profile.completedCourses ?? 0)} />
          <Row label="Lessons completed" value={String(data.profile.lessonsCompleted ?? 0)} />
          <Row label="Overall progress" value={`${progress?.overall ?? 0}%`} />
          <Row label="Exercise performance" value={`${progress?.averageScore ?? 0}% avg`} />
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-teal-50 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

export function TutorPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'student' | 'ai'; message: string }>>([
    {
      sender: 'ai',
      message:
        'Salaan! 👋 Waxaan ahay Macallinka AI. Weydii su\'aal ku saabsan Physics, Biology, English, Chemistry, ama Mathematics.',
    },
  ]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    const q = message.trim();
    setMessage('');
    setMessages((m) => [...m, { sender: 'student', message: q }]);
    setTyping(true);
    try {
      const res = await api<{ chatId: string; reply: string }>('/api/ai/chat', {
        method: 'POST',
        json: { message: q, chatId },
      });
      setChatId(res.chatId);
      setMessages((m) => [...m, { sender: 'ai', message: res.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { sender: 'ai', message: err instanceof Error ? err.message : 'Error' },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="mx-auto flex h-[70vh] max-w-2xl flex-col rounded-3xl border border-teal-100 bg-white">
      <div className="border-b border-teal-50 px-5 py-4">
        <h1 className="font-display text-xl font-bold">🤖 Somali AI Tutor</h1>
        <p className="text-sm text-muted">Weydii AI — hint, sharaxaad, iyo tusaalooyin.</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap rounded-xl px-3 py-2 ${
              m.sender === 'ai' ? 'bg-sea-light' : 'ml-8 bg-slate-100'
            }`}
          >
            <div className="mb-0.5 text-[10px] font-bold uppercase text-muted">
              {m.sender === 'ai' ? 'AI' : 'Adiga'}
            </div>
            {m.message}
          </div>
        ))}
        {typing && <div className="text-muted">AI qoraya...</div>}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-teal-50 p-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Su'aashaada..."
          className="flex-1 rounded-xl border border-teal-100 px-3 py-2.5 outline-none focus:ring-2 focus:ring-sea"
        />
        <button type="submit" className="rounded-xl bg-sea px-5 py-2.5 text-sm font-semibold text-white">
          Send
        </button>
      </form>
    </div>
  );
}
