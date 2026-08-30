import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ErrorBox, Loading, ProgressBar } from '../components/ui';

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

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ courses: Course[] }>('/api/courses')
      .then((d) => setCourses(d.courses))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const categories = [...new Set(courses.map((c) => c.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Koorsooyinka</h1>
        <p className="mt-1 text-muted">Doorasho Physics, Biology, English, Chemistry, iyo Mathematics.</p>
      </div>

      {categories.map((cat) => (
        <section key={cat} className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-sea-dark">{cat}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {courses
              .filter((c) => c.category === cat)
              .map((c) => (
                <article key={c.id} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate font-display text-base font-semibold text-ink">{c.title}</h3>
                    <span className="shrink-0 text-sm font-bold text-sea">{c.progress}%</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted">{c.description}</p>
                  <div className="mt-3">
                    <ProgressBar value={c.progress} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted">
                      {c.lessonCount} cashar · {c.exerciseCount} layli
                    </span>
                    <Link
                      to={`/app/courses/${c.id}`}
                      className="rounded-lg bg-sea px-3 py-1.5 text-xs font-semibold text-white hover:bg-sea-dark"
                    >
                      {c.progress > 0 ? 'Continue' : 'Start'}
                    </Link>
                  </div>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
