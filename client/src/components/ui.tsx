export { SearchableSelect, type SelectOption } from './SearchableSelect';
export { DynamicSelectEnhancer } from './DynamicSelectEnhancer';

export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress-bar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} role="progressbar">
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function CourseProgressRow({
  title,
  progress,
  subtitle,
  className = '',
}: {
  title: string;
  progress: number;
  subtitle?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">{title}</div>
        {subtitle ? <div className="truncate text-xs text-muted">{subtitle}</div> : null}
        <div className="mt-1.5">
          <ProgressBar value={pct} />
        </div>
      </div>
      <span className="shrink-0 text-sm font-bold text-sea">{pct}%</span>
    </div>
  );
}

export function Badge({ children, tone = 'sea' }: { children: React.ReactNode; tone?: 'sea' | 'amber' | 'ink' }) {
  const tones = {
    sea: 'bg-sea-light text-sea-dark',
    amber: 'bg-amber-100 text-blue-800',
    ink: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-blue-200 bg-white/70 p-8 text-center">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-sea border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-0 rounded-xl border border-slate-200 bg-white">
      <div className="h-11 border-b border-slate-200 bg-slate-50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
          <div className="h-10 w-10 rounded-lg bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-slate-100" />
            <div className="h-3 w-64 rounded bg-slate-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return <Loading />;
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
  );
}

/** Minimal markdown-ish renderer for lesson content */
export function LessonContent({ content }: { content: string }) {
  const html = renderSimpleMarkdown(content);
  return <div className="prose-lesson" dangerouslySetInnerHTML={{ __html: html }} />;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderSimpleMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let inTable = false;
  let tableBuf: string[] = [];

  const flushTable = () => {
    if (!tableBuf.length) return;
    const rows = tableBuf.filter((r) => !/^\s*\|?\s*-+/.test(r));
    const htmlRows = rows.map((row, i) => {
      const cells = row
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());
      const tag = i === 0 ? 'th' : 'td';
      return `<tr>${cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`;
    });
    out.push(`<table>${htmlRows.join('')}</table>`);
    tableBuf = [];
    inTable = false;
  };

  const inline = (text: string) =>
    escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>');

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        if (inTable) flushTable();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (line.trim().startsWith('|')) {
      inTable = true;
      tableBuf.push(line);
      continue;
    }
    if (inTable) flushTable();

    else if (line.trim() === '---') out.push('<hr />');
    else if (line.startsWith('# ')) out.push(`<h1>${inline(line.slice(2))}</h1>`);
    else if (line.startsWith('## ')) out.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith('### ')) out.push(`<h3>${inline(line.slice(4))}</h3>`);
    else if (line.startsWith('> ')) out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    else if (line.startsWith('- ')) out.push(`<li>${inline(line.slice(2))}</li>`);
    else if (/^\d+\.\s/.test(line)) out.push(`<li>${inline(line.replace(/^\d+\.\s/, ''))}</li>`);
    else if (line.trim() === '') out.push('');
    else out.push(`<p>${inline(line)}</p>`);
  }
  if (inCode) out.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  if (inTable) flushTable();

  // wrap consecutive li
  return out
    .join('\n')
    .replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
}
