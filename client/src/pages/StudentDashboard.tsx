import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, CheckCircle2, Play } from 'lucide-react';
import { useAuth } from '../auth';
import { api } from '../lib/api';
import { CourseProgressRow, ErrorBox, Loading } from '../components/ui';

interface ProgressData {
  overall: number;
  courses: Array<{
    id: string;
    title: string;
    category: string;
    progress: number;
    completed_lessons: number;
    total_lessons: number;
  }>;
  activity: Array<{ action: string; detail: string; created_at: string }>;
  continueLearning: {
    lesson_id: string;
    lesson_title: string;
    course_id: string;
    course_title: string;
    category: string;
  } | null;
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ProgressData>('/api/progress')
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
        <h1 className="font-display text-3xl font-bold text-ink">Salaan, {user?.name} 👋</h1>
        <p className="mt-1 text-muted">Sii wad barashadaada — LEARN → PRACTICE → ASK → IMPROVE</p>
      </div>

      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-sea to-sea-dark p-5 text-white sm:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-100">Continue</p>
        {data.continueLearning ? (
          <>
            <h2 className="mt-1 truncate font-display text-xl font-bold">{data.continueLearning.course_title}</h2>
            <p className="mt-0.5 truncate text-sm text-blue-50">{data.continueLearning.lesson_title}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-sky-300"
                  style={{
                    width: `${data.courses.find((c) => c.id === data.continueLearning?.course_id)?.progress ?? 0}%`,
                  }}
                />
              </div>
              <span className="text-sm font-bold">
                {data.courses.find((c) => c.id === data.continueLearning?.course_id)?.progress ?? 0}%
              </span>
            </div>
            <Link
              to={`/app/lessons/${data.continueLearning.lesson_id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-sea-dark hover:bg-blue-50"
            >
              <Play className="h-4 w-4" /> Continue
            </Link>
          </>
        ) : (
          <>
            <h2 className="mt-2 font-display text-2xl font-bold">Waad dhammaysay casharrada la heli karo!</h2>
            <Link
              to="/app/courses"
              className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-sea-dark"
            >
              Explore Courses
            </Link>
          </>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-blue-100 bg-white p-5 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">My Courses</h3>
          <div className="mt-3 space-y-2">
            {data.courses.map((c) => (
              <Link
                key={c.id}
                to={`/app/courses/${c.id}`}
                className="block rounded-xl border border-blue-50 px-3 py-2.5 hover:border-blue-200 hover:bg-sea-light/40"
              >
                <CourseProgressRow
                  title={c.title}
                  subtitle={`${c.completed_lessons}/${c.total_lessons} cashar`}
                  progress={c.progress}
                />
              </Link>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-blue-100 bg-white p-5">
            <h3 className="font-display text-lg font-semibold">Recent Activity</h3>
            <ul className="mt-4 space-y-3">
              {data.activity.length === 0 && (
                <li className="text-sm text-muted">Weli wax dhaqdhaqaaq ah ma jiro.</li>
              )}
              {data.activity.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{a.detail || a.action}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Bot className="h-5 w-5 text-blue-700" /> AI Tutor
            </div>
            <p className="mt-2 text-sm text-muted">Ma u baahan tahay caawimaad cashar ah?</p>
            <Link
              to="/app/tutor"
              className="mt-4 inline-flex rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white hover:bg-sea-dark"
            >
              Ask AI Tutor
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
