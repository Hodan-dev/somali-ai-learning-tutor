import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { CourseProgressRow, ErrorBox, Loading, ProgressBar } from '../components/ui';

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

      <section className="rounded-2xl border border-blue-100 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="font-display text-4xl font-bold text-sea">{data.overall}%</div>
          <div className="flex-1">
            <p className="mb-1.5 text-sm text-muted">Guud ahaan</p>
            <ProgressBar value={data.overall} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Cashar" value={`${data.lessonsCompleted}/${data.lessonsTotal}`} />
          <Stat label="Layli" value={String(data.exercisesCompleted)} />
          <Stat label="Avg" value={`${data.averageScore}%`} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Koorsooyinka</h2>
        {data.courses.map((c) => (
          <Link
            key={c.id}
            to={`/app/courses/${c.id}`}
            className="block rounded-xl border border-blue-100 bg-white px-3 py-2.5 hover:border-blue-200"
          >
            <CourseProgressRow title={c.title} subtitle={c.category} progress={c.progress} />
          </Link>
        ))}
      </section>

      {data.completedCourses.length > 0 && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="font-display text-base font-semibold">La dhammeeyay</h2>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {data.completedCourses.map((c, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span className="truncate">{c.title}</span>
                <span className="shrink-0 font-semibold text-sea">{Math.round(c.final_score)}%</span>
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
    <div className="rounded-lg bg-sea-light/60 px-2 py-2.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-0.5 font-display text-base font-bold text-ink">{value}</div>
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
      <div className="rounded-2xl border border-blue-100 bg-white p-6">
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
    <div className="flex justify-between border-b border-blue-50 py-2">
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
        json: { message: q, ...(chatId ? { chatId } : {}) },
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
    <div className="mx-auto flex h-[70vh] max-w-2xl flex-col rounded-3xl border border-blue-100 bg-white">
      <div className="border-b border-blue-50 px-5 py-4">
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
      <form onSubmit={send} className="flex gap-2 border-t border-blue-50 p-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Su'aashaada..."
          className="flex-1 rounded-xl border border-blue-100 px-3 py-2.5 outline-none focus:ring-2 focus:ring-sea"
        />
        <button type="submit" className="rounded-xl bg-sea px-5 py-2.5 text-sm font-semibold text-white">
          Send
        </button>
      </form>
    </div>
  );
}
