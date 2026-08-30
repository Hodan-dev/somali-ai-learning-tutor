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
      <div className="rounded-3xl border border-blue-100 bg-white p-6">
        <Badge>{course.category}</Badge>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">{course.title}</h1>
        <p className="mt-2 max-w-3xl text-muted">{course.description}</p>
        <div className="mt-5 max-w-lg">
          <div className="mb-2 flex justify-between text-sm">
            <span>
              {course.completedLessons}/{course.totalLessons} cashar
            </span>
            <span className="font-semibold text-sea">{course.progress}%</span>
          </div>
          <ProgressBar value={course.progress} />
        </div>
        {course.currentLessonId && (
          <Link
            to={`/app/lessons/${course.currentLessonId}`}
            className="mt-5 inline-flex rounded-xl bg-sea px-5 py-3 text-sm font-semibold text-white hover:bg-sea-dark"
          >
            Continue Learning
          </Link>
        )}
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
