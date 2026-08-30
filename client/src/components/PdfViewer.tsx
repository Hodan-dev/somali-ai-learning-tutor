type Props = {
  url: string;
  title?: string;
};

/** Responsive PDF viewer — fits phone, tablet, and desktop. */
export function PdfViewer({ url, title = 'PDF lesson' }: Props) {
  const base = url.split('#')[0];
  const src = `${base}#view=FitH&toolbar=1`;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-blue-100 bg-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-50 px-3 py-2 text-sm">
        <span className="font-medium text-ink">PDF</span>
        <a href={url} target="_blank" rel="noreferrer" className="font-medium text-sea hover:underline">
          Open full screen
        </a>
      </div>
      <div className="relative w-full bg-white">
        <iframe
          title={title}
          src={src}
          className="block h-[min(72dvh,42rem)] w-full min-h-[280px] sm:h-[min(75dvh,48rem)]"
        />
      </div>
    </div>
  );
}
