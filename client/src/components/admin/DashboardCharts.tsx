import type { ComponentType } from 'react';

const SUBJECT_COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#ef4444', '#10b981', '#06b6d4'];

type DonutItem = { label: string; value: number };

export function DonutChart({ data, centerLabel }: { data: DonutItem[]; centerLabel?: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = data.map((item, i) => {
    const pct = item.value / total;
    const dash = pct * circumference;
    const segment = {
      ...item,
      color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      dash,
      offset: -offset,
      pct: Math.round(pct * 100),
    };
    offset += dash;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
          {segments.map((s) => (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="font-display text-2xl font-bold text-ink">{total}</div>
          <div className="text-xs text-muted">{centerLabel || 'Enrollments'}</div>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
            <span className="text-muted">{s.label}</span>
            <span className="font-semibold text-ink">{s.value}</span>
            <span className="text-xs text-muted">({s.pct}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarChart({
  data,
  labelKey,
  valueKey,
}: {
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1);

  return (
    <div className="flex h-56 items-end justify-between gap-2 px-2">
      {data.map((item, i) => {
        const value = Number(item[valueKey]);
        const height = Math.max(8, (value / max) * 100);
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-ink">{value}</span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-sea-dark to-sea transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="max-w-[4rem] truncate text-center text-[10px] text-muted">
              {String(item[labelKey])}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AreaChart({
  data,
}: {
  data: Array<{ day: string; lessons: number; exercises: number; activity: number }>;
}) {
  const max = Math.max(...data.map((d) => d.lessons + d.exercises + d.activity), 1);
  const width = 100;
  const height = 60;
  const step = width / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const val = d.lessons + d.exercises + d.activity;
    const x = i * step;
    const y = height - (val / max) * (height - 8) - 4;
    return { x, y, val, day: d.day };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${points[points.length - 1]?.x ?? 0} ${height} L 0 ${height} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height + 10}`} className="h-48 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" />
        <path d={line} fill="none" stroke="#2563eb" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="#2563eb" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        {data.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: number | string;
  trend: number;
  trendLabel: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
}) {
  const barWidth = Math.min(100, Math.max(10, Math.abs(trend)));

  return (
    <article className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white/85">{title}</p>
          <p className="font-display text-3xl font-bold">{value}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white/90 transition-all" style={{ width: `${barWidth}%` }} />
        </div>
        <p className="mt-2 text-xs text-white/90">
          {trend >= 0 ? '+' : ''}
          {trend}% {trendLabel}
        </p>
      </div>
    </article>
  );
}
