import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ErrorBox, Loading, CourseProgressRow } from '../components/ui';

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
                  <CourseProgressRow
                    title={c.title}
                    subtitle={`${c.lessonCount} cashar · ${c.category}`}
                    progress={c.progress}
                  />
                  <div className="mt-3 flex justify-end">
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
