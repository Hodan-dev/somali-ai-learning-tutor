import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Badge, ErrorBox, Loading, ProgressBar } from '../components/ui';

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
          <div className="grid gap-4 md:grid-cols-2">
            {courses
              .filter((c) => c.category === cat)
              .map((c) => (
                <article key={c.id} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-ink">{c.title}</h3>
                    <Badge tone="amber">{c.difficulty}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
                    <span>{c.lessonCount} Cashar</span>
                    <span>{c.exerciseCount} Layli</span>
                    <span>{c.category}</span>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted">Horumar</span>
                      <span className="font-semibold text-sea">{c.progress}%</span>
                    </div>
                    <ProgressBar value={c.progress} />
                  </div>
                  <Link
                    to={`/app/courses/${c.id}`}
                    className="mt-4 inline-flex rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white hover:bg-sea-dark"
                  >
                    {c.progress > 0 ? 'Continue Course' : 'Start Course'}
                  </Link>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
