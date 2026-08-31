import { Link } from 'react-router-dom';
import { Award, BookOpenCheck, Gauge, ListChecks } from 'lucide-react';
import type { ComponentType } from 'react';
import { DonutChart } from '../admin/DashboardCharts';

export const CATEGORY_COLORS: Record<string, string> = {
  Physics: '#3b82f6',
  Biology: '#10b981',
  English: '#8b5cf6',
  Chemistry: '#f97316',
  Mathematics: '#ef4444',
};

const FALLBACK_COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f97316', '#ef4444', '#06b6d4'];

export function categoryColor(category: string, index = 0) {
  return CATEGORY_COLORS[category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function ProgressStatCard({
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
    <article className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md ${gradient}`}>
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-white/85">{title}</p>
          <p className="font-display text-2xl font-bold">{value}</p>
        </div>
      </div>
      <p className="relative mt-3 text-xs text-white/80">{subtitle}</p>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
        <div className="h-full rounded-full bg-white/90 transition-all" style={{ width: `${Math.min(100, bar)}%` }} />
      </div>
    </article>
  );
}

export function RingGauge({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-ink">{pct}%</span>
          <span className="text-xs text-muted">{label}</span>
        </div>
      </div>
    </div>
  );
}

export function CourseProgressBars({
  courses,
}: {
  courses: Array<{ id: string; title: string; category: string; progress: number }>;
}) {
  return (
    <div className="space-y-3">
      {courses.map((course, i) => {
        const color = categoryColor(course.category, i);
        return (
          <Link
            key={course.id}
            to={`/app/courses/${course.id}`}
            className="block rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-sky-200 hover:bg-white"
          >
            <div className="mb-2 flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{course.title}</p>
                <p className="text-xs text-muted">{course.category}</p>
              </div>
              <span className="shrink-0 font-bold" style={{ color }}>
                {course.progress}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${course.progress}%`, background: color }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function LessonBreakdownDonut({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const remaining = Math.max(0, total - completed);
  const data =
    total === 0
      ? [{ label: 'No lessons', value: 1 }]
      : [
          { label: 'Completed', value: completed },
          { label: 'Remaining', value: remaining },
        ];

  return <DonutChart data={data} centerLabel="Lessons" />;
}

export function ScoreBars({
  items,
}: {
  items: Array<{ title: string; score: number; category: string }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const color = categoryColor(item.category, i);
        return (
          <div key={`${item.title}-${i}`}>
            <div className="mb-1 flex justify-between gap-2 text-sm">
              <span className="truncate font-medium text-ink">{item.title}</span>
              <span className="shrink-0 font-bold" style={{ color }}>
                {Math.round(item.score)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, item.score)}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { Gauge, BookOpenCheck, ListChecks, Award };
