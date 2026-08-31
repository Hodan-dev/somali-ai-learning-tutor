import { type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  Gauge,
  ListChecks,
  Play,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../auth';
import { useApiData } from '../lib/useApiData';
import { ErrorBox, Loading } from '../components/ui';

interface ProgressData {
  overall: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  exercisesCompleted: number;
  exercisesAttempted: number;
  averageScore: number;
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

const categoryAccent: Record<string, string> = {
  Physics: 'from-blue-500 to-blue-700',
  Biology: 'from-emerald-500 to-emerald-700',
  English: 'from-violet-500 to-violet-700',
  Chemistry: 'from-orange-500 to-orange-600',
  Mathematics: 'from-rose-500 to-rose-700',
};

const categoryIconColor: Record<string, string> = {
  Physics: 'text-blue-600',
  Biology: 'text-emerald-600',
  English: 'text-violet-600',
  Chemistry: 'text-orange-600',
  Mathematics: 'text-rose-600',
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  barPercent,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
  barPercent?: number;
}) {
  const bar = barPercent ?? 0;

  return (
    <article className={`relative min-h-[168px] overflow-hidden rounded-2xl p-6 text-white shadow-lg sm:min-h-[180px] sm:p-7 ${gradient}`}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="relative flex h-full flex-col justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm sm:h-[4.5rem] sm:w-[4.5rem]">
            <Icon className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-sm font-medium text-white/90 sm:text-base">{title}</p>
            <p className="mt-1 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-[2.75rem]">
              {value}
            </p>
          </div>
        </div>
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${Math.min(100, Math.max(8, bar))}%` }}
            />
          </div>
          <p className="mt-2.5 text-sm text-white/90">{subtitle}</p>
        </div>
      </div>
    </article>
  );
}

function CourseCard({
  title,
  category,
  progress,
  completed,
  total,
  to,
}: {
  title: string;
  category: string;
  progress: number;
  completed: number;
  total: number;
  to: string;
}) {
  const accent = categoryAccent[category] || 'from-sea to-sea-dark';
  const iconColor = categoryIconColor[category] || 'text-sea';

  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sea/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <BookOpen className={`h-6 w-6 shrink-0 ${iconColor}`} />
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {category}
        </span>
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-ink group-hover:text-sea">{title}</h3>
      <p className="mt-1 text-xs text-muted">
        {completed} of {total} lessons completed
      </p>
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-muted">Progress</span>
          <span className="font-bold text-sea">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${accent} transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sea">
        Open course <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useApiData<ProgressData>('/api/progress');

  if (error && !data) return <ErrorBox message={error} />;
  if (loading && !data) return <Loading />;
  if (!data) return null;

  const continueCourse = data.continueLearning
    ? data.courses.find((c) => c.id === data.continueLearning?.course_id)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-sea">Student Dashboard</p>
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Welcome back, {user?.name}</h1>
        <p className="mt-1 text-sm text-muted">Track your learning — Learn, practice, ask AI, and improve.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Overall Progress"
          value={`${data.overall}%`}
          subtitle="Your total learning progress across all courses"
          icon={Gauge}
          gradient="bg-gradient-to-br from-blue-500 to-blue-800"
          barPercent={data.overall}
        />
        <StatCard
          title="Lessons Completed"
          value={`${data.lessonsCompleted}/${data.lessonsTotal}`}
          subtitle="Lessons finished out of all available"
          icon={BookOpenCheck}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-800"
          barPercent={data.lessonsTotal ? Math.round((data.lessonsCompleted / data.lessonsTotal) * 100) : 0}
        />
        <StatCard
          title="Exercises Done"
          value={data.exercisesCompleted}
          subtitle={`${data.exercisesAttempted} exercises attempted in total`}
          icon={ListChecks}
          gradient="bg-gradient-to-br from-violet-500 to-purple-800"
          barPercent={
            data.exercisesAttempted
              ? Math.round((data.exercisesCompleted / data.exercisesAttempted) * 100)
              : 0
          }
        />
        <StatCard
          title="Average Score"
          value={`${data.averageScore}%`}
          subtitle="Your average score on completed exercises"
          icon={Award}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          barPercent={data.averageScore}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_auto]">
          <div className="border-b border-slate-100 bg-gradient-to-br from-sea to-sea-dark p-6 text-white lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">Continue learning</p>
            {data.continueLearning ? (
              <>
                <h2 className="mt-2 font-display text-xl font-bold sm:text-2xl">{data.continueLearning.course_title}</h2>
                <p className="mt-1 text-sm text-blue-50">{data.continueLearning.lesson_title}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-sky-300"
                      style={{ width: `${continueCourse?.progress ?? 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">{continueCourse?.progress ?? 0}%</span>
                </div>
                <Link
                  to={`/app/lessons/${data.continueLearning.lesson_id}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-sea-dark hover:bg-blue-50"
                >
                  <Play className="h-4 w-4" /> Resume lesson
                </Link>
              </>
            ) : (
              <>
                <h2 className="mt-2 font-display text-xl font-bold">You are all caught up!</h2>
                <p className="mt-1 text-sm text-blue-50">Explore more courses or practice with the AI tutor.</p>
                <Link
                  to="/app/courses"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-sea-dark hover:bg-blue-50"
                >
                  Browse courses <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-1 lg:w-56">
            <Link
              to="/app/tutor"
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-sea/30 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sea text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">AI Tutor</div>
                <div className="text-xs text-muted">Ask a question</div>
              </div>
            </Link>
            <Link
              to="/app/progress"
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-sea/30 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">My Progress</div>
                <div className="text-xs text-muted">Full report</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">My Courses</h2>
            <p className="text-sm text-muted">{data.courses.length} enrolled subjects</p>
          </div>
          <Link to="/app/courses" className="text-sm font-semibold text-sea hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.courses.map((c) => (
            <CourseCard
              key={c.id}
              title={c.title}
              category={c.category}
              progress={c.progress}
              completed={c.completed_lessons}
              total={c.total_lessons}
              to={`/app/courses/${c.id}`}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">Recent Activity</h2>
        <p className="mt-1 text-sm text-muted">Your latest learning actions</p>
        <ul className="mt-4 space-y-3">
          {data.activity.length === 0 ? (
            <li className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-muted">
              No activity yet. Start a lesson to see updates here.
            </li>
          ) : (
            data.activity.slice(0, 6).map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{a.detail || a.action}</p>
                  {a.created_at && (
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(a.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
