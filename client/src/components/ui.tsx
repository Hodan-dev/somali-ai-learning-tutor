export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-bar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} role="progressbar">
      <span style={{ width: `${v}%` }} />
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

export function Loading({ label = 'Soo raraya...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-sea border-t-transparent" />
      <span>{label}</span>
    </div>
  );
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

    if (line.startsWith('# ')) out.push(`<h1>${inline(line.slice(2))}</h1>`);
    else if (line.startsWith('## ')) out.push(`<h2>${inline(line.slice(3))}</h2>`);
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
