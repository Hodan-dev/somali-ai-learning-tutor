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

const tableColumns = [
  { key: 'no', label: '#', center: true },
  { key: 'subject', label: 'Subject' },
  { key: 'course', label: 'Course' },
  { key: 'lessons', label: 'Lessons', center: true },
  { key: 'exercises', label: 'Exercises', center: true },
  { key: 'level', label: 'Level' },
  { key: 'progress', label: 'Progress' },
  { key: 'action', label: 'Action', alignRight: true },
] as const;

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
  const visible = filter === 'all' ? courses : courses.filter((c) => c.category === filter);

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
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-blue-200 bg-blue-50">
                {tableColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-sea-dark ${
                      'alignRight' in col && col.alignRight
                        ? 'text-right'
                        : 'center' in col && col.center
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted">
                    No courses found for this filter.
                  </td>
                </tr>
              ) : (
                visible.map((c, index) => (
                  <tr key={c.id} className="bg-white transition hover:bg-blue-50/40">
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-ink">{c.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 shrink-0 text-sea" />
                        <div className="min-w-0">
                          <div className="font-semibold text-ink">{c.title}</div>
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted">{c.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-display text-lg font-bold text-ink">{c.lessonCount}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-display text-lg font-bold text-ink">{c.exerciseCount}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{c.difficulty}</td>
                    <td className="px-5 py-4">
                      <div className="min-w-[140px]">
                        <div className="mb-2 flex justify-between text-xs font-medium">
                          <span className="text-slate-500">Complete</span>
                          <span className="text-ink">{c.progress}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-sea"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-right">
                      <Link
                        to={`/app/courses/${c.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sea px-4 py-2 text-xs font-semibold text-white transition hover:bg-sea-dark"
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
        active
          ? 'bg-sea text-white shadow-sm'
          : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}
