import { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

type Props = {
  url: string;
  title?: string;
};

/** Embedded PDF viewer — loads after the lesson shell renders so the page feels instant. */
export function PdfViewer({ url, title = 'PDF lesson' }: Props) {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const base = url.split('#')[0];
  const viewerSrc = `${base}#view=FitH&toolbar=1`;

  useEffect(() => {
    setLoaded(false);
    setReady(false);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [url]);

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-blue-100 bg-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-50 px-3 py-2 text-sm">
        <span className="font-medium text-ink">PDF</span>
        <div className="flex gap-3">
          <a href={url} target="_blank" rel="noreferrer" className="font-medium text-sea hover:underline">
            Open full screen
          </a>
          <a href={url} download className="font-medium text-muted hover:text-ink">
            Download
          </a>
        </div>
      </div>
      <div className="relative w-full bg-white">
        {!loaded && (
          <div className="absolute inset-0 z-10 flex min-h-[280px] flex-col items-center justify-center gap-3 bg-white text-sm text-muted sm:min-h-[min(72dvh,42rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-sea" />
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-sea" />
              <span>Loading PDF…</span>
            </div>
          </div>
        )}
        {ready && (
          <iframe
            title={title}
            src={viewerSrc}
            onLoad={() => setLoaded(true)}
            className="block h-[min(72dvh,42rem)] w-full min-h-[280px] sm:h-[min(75dvh,48rem)]"
          />
        )}
      </div>
    </div>
  );
}
