import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Save } from 'lucide-react';
import { useAuth } from '../auth';
import { api } from '../lib/api';
import { CourseProgressRow, ErrorBox, Loading, ProgressBar } from '../components/ui';
import type { User } from '../lib/api';

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

  if (loading) return <Loading fullPage />;
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
  const { user, updateUser } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    Promise.all([
      api<NonNullable<typeof data>>('/api/profile'),
      api<{ overall: number; averageScore: number }>('/api/progress'),
    ])
      .then(([p, pr]) => {
        setData(p);
        setName(p.user.name);
        setProgress(pr);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMsg('');
    try {
      const payload: { name: string; currentPassword?: string; newPassword?: string } = { name: name.trim() };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const res = await api<{ user: User; message: string }>('/api/profile', {
        method: 'PATCH',
        json: payload,
      });
      setData((prev) => (prev ? { ...prev, user: { ...prev.user, name: res.user.name } } : prev));
      updateUser({ ...user!, name: res.user.name, email: res.user.email, role: res.user.role });
      setMsg(res.message);
      setEditing(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading fullPage />;
  if (error && !data) return <ErrorBox message={error} />;
  if (!data) return null;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-sea">Account</p>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">My Profile</h1>
          <p className="mt-1 text-sm text-muted">View and update your personal information.</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" /> Edit profile
          </button>
        )}
      </div>

      {error && <ErrorBox message={error} />}
      {msg && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sea to-sea-dark font-display text-2xl font-bold text-white">
              {data.user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">{data.user.name}</h2>
              <p className="text-sm text-muted">{data.user.email}</p>
              <p className="mt-1 text-xs text-muted">
                Member since {new Date(data.profile.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sea focus:bg-white focus:ring-2 focus:ring-sea/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-muted"
                  value={data.user.email}
                  disabled
                />
                <p className="mt-1 text-xs text-muted">Email cannot be changed.</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-ink">Change password (optional)</p>
                <div className="mt-3 space-y-3">
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sea focus:ring-2 focus:ring-sea/20"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sea focus:ring-2 focus:ring-sea/20"
                    placeholder="New password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-sea px-5 py-2.5 text-sm font-semibold text-white hover:bg-sea-dark disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setName(data.user.name);
                    setCurrentPassword('');
                    setNewPassword('');
                    setError('');
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm">
              <Row label="Full name" value={data.user.name} />
              <Row label="Email" value={data.user.email} />
              <Row label="Role" value="Student" />
              <Row label="Joined" value={new Date(data.profile.joinedAt).toLocaleDateString()} />
            </dl>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-display font-semibold text-ink">Learning stats</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Courses enrolled" value={String(data.profile.enrolledCourses ?? 0)} />
              <Row label="Courses completed" value={String(data.profile.completedCourses ?? 0)} />
              <Row label="Lessons completed" value={String(data.profile.lessonsCompleted ?? 0)} />
              <Row label="Overall progress" value={`${progress?.overall ?? 0}%`} />
              <Row label="Exercise avg" value={`${progress?.averageScore ?? 0}%`} />
            </dl>
          </section>
        </aside>
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
