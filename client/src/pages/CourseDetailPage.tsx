import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Circle } from 'lucide-react';
import { api } from '../lib/api';
import { Badge, ErrorBox, Loading, ProgressBar } from '../components/ui';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  currentLessonId: string | null;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      description: string;
      completed: boolean;
      exerciseId: string | null;
      status: string;
    }>;
  }>;
}

export function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ course: CourseDetail }>(`/api/courses/${id}`)
      .then((d) => setCourse(d.course))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!course) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{course.category}</Badge>
          <span className="text-sm text-muted">
            {course.completedLessons}/{course.totalLessons} cashar
          </span>
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{course.title}</h1>
        <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-muted">{course.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="max-w-sm flex-1">
            <ProgressBar value={course.progress} />
          </div>
          <span className="text-sm font-bold text-sea">{course.progress}%</span>
          {course.currentLessonId && (
            <Link
              to={`/app/lessons/${course.currentLessonId}`}
              className="ml-auto rounded-lg bg-sea px-4 py-2 text-sm font-semibold text-white hover:bg-sea-dark"
            >
              Continue
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {course.modules.map((mod) => (
          <section key={mod.id} className="rounded-2xl border border-blue-100 bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-ink">{mod.title}</h2>
            <ul className="mt-4 space-y-2">
              {mod.lessons.map((les) => {
                const isCurrent = les.id === course.currentLessonId;
                return (
                  <li key={les.id}>
                    <Link
                      to={`/app/lessons/${les.id}`}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                        isCurrent ? 'bg-sea-light ring-1 ring-sea/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      {les.completed ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : isCurrent ? (
                        <span className="text-sea">→</span>
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-ink">{les.title}</div>
                        {les.description && <div className="truncate text-xs text-muted">{les.description}</div>}
                      </div>
                      {les.completed && <Badge>La dhammeeyay</Badge>}
                      {isCurrent && !les.completed && <Badge tone="amber">Current</Badge>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
