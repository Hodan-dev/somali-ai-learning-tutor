import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
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

const subjectThumb: Record<string, string> = {
  Physics: 'bg-sky-100 text-sky-700',
  Biology: 'bg-emerald-100 text-emerald-700',
  English: 'bg-violet-100 text-violet-700',
  Chemistry: 'bg-amber-100 text-amber-700',
  Mathematics: 'bg-rose-100 text-rose-700',
};

function statusBadge(progress: number) {
  if (progress >= 100) return { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
  if (progress > 0) return { label: 'In progress', className: 'bg-sky-50 text-sky-700 ring-sky-200' };
  return { label: 'Not started', className: 'bg-slate-100 text-slate-600 ring-slate-200' };
}

function progressBarColor(progress: number) {
  if (progress >= 70) return 'bg-emerald-500';
  if (progress >= 30) return 'bg-amber-500';
  return 'bg-rose-500';
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    api<{ courses: Course[] }>('/api/courses')
      .then((d) => setCourses(d.courses))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(courses.map((c) => c.category))];

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchCategory = filter === 'all' || c.category === filter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [courses, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <Loading fullPage />;
  if (error) return <ErrorBox message={error} />;

  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filtered.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Courses</h1>
        <Link
          to="/app/tutor"
          className="inline-flex items-center gap-2 rounded-lg bg-sea px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sea-dark"
        >
          + Ask AI Tutor
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-sea focus:ring-2 focus:ring-sky-100"
        >
          <option value="all">All subjects</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search courses..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-sea focus:ring-2 focus:ring-sky-100"
          />
          <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f9fafb]">
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600">Course name</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600">Subject</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-600">Lessons</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-600">Exercises</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600">Level</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600">Progress</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-muted">
                    No courses found.
                  </td>
                </tr>
              ) : (
                visible.map((c) => {
                  const status = statusBadge(c.progress);
                  return (
                    <tr key={c.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                              subjectThumb[c.category] || 'bg-sky-100 text-sky-700'
                            }`}
                          >
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-ink">{c.title}</div>
                            <div className="mt-0.5 line-clamp-1 text-xs text-muted">{c.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">{c.category}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-ink">{c.lessonCount}</td>
                      <td className="px-5 py-4 text-center font-semibold text-ink">{c.exerciseCount}</td>
                      <td className="px-5 py-4 text-slate-600">{c.difficulty}</td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-[130px] items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${progressBarColor(c.progress)}`}
                              style={{ width: `${c.progress}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-semibold text-slate-700">{c.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/app/courses/${c.id}`}
                          className="text-sm font-semibold text-sea hover:text-sea-dark hover:underline"
                        >
                          {c.progress > 0 ? 'Continue' : 'Open'}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5 text-sm text-slate-600">
          <div>
            Results: <span className="font-semibold text-ink">{from}</span> –{' '}
            <span className="font-semibold text-ink">{to}</span> of{' '}
            <span className="font-semibold text-ink">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`min-w-[2rem] rounded-lg px-2 py-1 text-xs font-semibold ${
                    page === n ? 'bg-sea text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {n}
                </button>
              ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
