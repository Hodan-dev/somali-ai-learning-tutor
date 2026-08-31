import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { api } from '../lib/api';
import { ErrorBox, Loading } from '../components/ui';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  lessonCount: number;
  exerciseCount: number;
  progress: number;
}

const categoryBadge: Record<string, string> = {
  Physics: 'bg-blue-100 text-blue-700',
  Biology: 'bg-emerald-100 text-emerald-700',
  English: 'bg-violet-100 text-violet-700',
  Chemistry: 'bg-orange-100 text-orange-700',
  Mathematics: 'bg-rose-100 text-rose-700',
};

const categoryBar: Record<string, string> = {
  Physics: 'from-blue-500 to-blue-600',
  Biology: 'from-emerald-500 to-emerald-600',
  English: 'from-violet-500 to-violet-600',
  Chemistry: 'from-orange-500 to-orange-600',
  Mathematics: 'from-rose-500 to-rose-600',
};

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api<{ courses: Course[] }>('/api/courses')
      .then((d) => setCourses(d.courses))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading fullPage />;
  if (error) return <ErrorBox message={error} />;

  const categories = [...new Set(courses.map((c) => c.category))];
  const visible =
    filter === 'all' ? courses : courses.filter((c) => c.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-sea">Learning</p>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">My Courses</h1>
          <p className="mt-1 text-sm text-muted">
            Physics, Biology, English, Chemistry, and Mathematics — all in one place.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
          <span className="text-muted">Total courses: </span>
          <span className="font-bold text-ink">{courses.length}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All subjects" />
        {categories.map((cat) => (
          <FilterChip key={cat} active={filter === cat} onClick={() => setFilter(cat)} label={cat} />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Subject
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Course
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Lessons
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Exercises
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Level
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Progress
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    No courses found for this filter.
                  </td>
                </tr>
              ) : (
                visible.map((c) => (
                  <tr key={c.id} className="transition hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          categoryBadge[c.category] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sea-light text-sea">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-ink">{c.title}</div>
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted">{c.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-ink">{c.lessonCount}</td>
                    <td className="px-5 py-4 font-medium text-ink">{c.exerciseCount}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {c.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[120px]">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-muted">Complete</span>
                          <span className="font-bold text-sea">{c.progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${
                              categoryBar[c.category] || 'from-sea to-sea-dark'
                            }`}
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/app/courses/${c.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sea px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-sea-dark"
                      >
                        {c.progress > 0 ? 'Continue' : 'Start'}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
        active ? 'bg-sea text-white shadow-sm' : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}
