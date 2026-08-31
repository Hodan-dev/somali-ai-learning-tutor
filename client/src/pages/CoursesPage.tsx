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

const tableColumns = [
  { key: 'subject', label: 'Subject', hint: 'Maaddada' },
  { key: 'course', label: 'Course', hint: 'Magaca koorsada' },
  { key: 'lessons', label: 'Lessons', hint: 'Casharro' },
  { key: 'exercises', label: 'Exercises', hint: 'Layliyo' },
  { key: 'level', label: 'Level', hint: 'Heerka' },
  { key: 'progress', label: 'Progress', hint: 'Horumar' },
  { key: 'action', label: 'Action', hint: 'Ficil', align: 'right' as const },
] as const;

const headerColors = [
  'bg-blue-700',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-600',
  'bg-sky-600',
  'bg-sea-dark',
];

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

      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr>
                {tableColumns.map((col, i) => (
                  <th
                    key={col.key}
                    className={`border-r border-white/25 px-4 py-4 last:border-r-0 ${
                      'align' in col && col.align === 'right' ? 'text-right' : 'text-left'
                    } ${headerColors[i]}`}
                  >
                    <div
                      className={`text-sm font-bold uppercase tracking-wide text-white ${
                        'align' in col && col.align === 'right' ? 'text-right' : ''
                      }`}
                    >
                      {col.label}
                    </div>
                    <div
                      className={`mt-0.5 text-[11px] font-medium text-blue-100 ${
                        'align' in col && col.align === 'right' ? 'text-right' : ''
                      }`}
                    >
                      {col.hint}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border-t border-slate-200 px-5 py-12 text-center text-muted">
                    No courses found for this filter.
                  </td>
                </tr>
              ) : (
                visible.map((c, rowIndex) => (
                  <tr
                    key={c.id}
                    className={`border-t-2 border-slate-200 transition hover:bg-blue-50/50 ${
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                    }`}
                  >
                    <td className="border-r border-slate-200 px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          categoryBadge[c.category] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.category}
                      </span>
                    </td>
                    <td className="border-r border-slate-200 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sea ring-1 ring-blue-100">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-ink">{c.title}</div>
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted">{c.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="border-r border-slate-200 px-4 py-4 text-center">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-700 ring-1 ring-indigo-100">
                        {c.lessonCount}
                      </span>
                    </td>
                    <td className="border-r border-slate-200 px-4 py-4 text-center">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-violet-50 px-2.5 py-1 text-sm font-bold text-violet-700 ring-1 ring-violet-100">
                        {c.exerciseCount}
                      </span>
                    </td>
                    <td className="border-r border-slate-200 px-4 py-4">
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                        {c.difficulty}
                      </span>
                    </td>
                    <td className="border-r border-slate-200 px-4 py-4">
                      <div className="min-w-[130px]">
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="font-medium text-slate-500">Done</span>
                          <span className="font-bold text-sea">{c.progress}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-100">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${
                              categoryBar[c.category] || 'from-sea to-sea-dark'
                            }`}
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/app/courses/${c.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sea px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-sea-dark"
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
