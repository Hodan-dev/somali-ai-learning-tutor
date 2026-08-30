import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type Props = {
  url: string;
  title?: string;
};

const pdfOptions = {
  disableAutoFetch: false,
  disableStream: false,
  disableRange: false,
};

/** Progressive PDF viewer — streams pages so large files open much faster than an iframe. */
export function PdfViewer({ url, title = 'PDF lesson' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(1);
    setNumPages(0);
    setLoading(true);
    setProgress(0);
    setError('');
  }, [url]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setLoading(false);
    setError('');
  }, []);

  const onLoadError = useCallback(() => {
    setLoading(false);
    setError('PDF could not be loaded in the viewer.');
  }, []);

  const onLoadProgress = useCallback(({ loaded, total }: { loaded: number; total: number }) => {
    if (total > 0) setProgress(Math.min(99, Math.round((loaded / total) * 100)));
  }, []);

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

      {numPages > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-blue-50 bg-white px-3 py-2 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-muted">
            Page{' '}
            <input
              type="number"
              min={1}
              max={numPages}
              value={page}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (n >= 1 && n <= numPages) setPage(n);
              }}
              className="w-14 rounded border border-blue-100 px-1 py-0.5 text-center text-ink"
            />{' '}
            of {numPages}
          </span>
          <button
            type="button"
            disabled={page >= numPages}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative flex min-h-[280px] justify-center overflow-auto bg-slate-200/60 p-3 sm:min-h-[min(72dvh,42rem)]"
      >
        {loading && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white text-sm text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-sea" />
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-sea" />
              <span>{progress > 0 ? `Loading PDF… ${progress}%` : 'Loading PDF…'}</span>
            </div>
            {progress > 0 && (
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-blue-100">
                <div className="h-full rounded-full bg-sea transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-sm">
            <p className="text-muted">{error}</p>
            <a href={url} target="_blank" rel="noreferrer" className="font-medium text-sea hover:underline">
              Open PDF in new tab
            </a>
          </div>
        ) : (
          width > 0 && (
            <Document
              file={url}
              options={pdfOptions}
              onLoadSuccess={onLoadSuccess}
              onLoadError={onLoadError}
              onLoadProgress={onLoadProgress}
              loading=""
              className="shadow-md"
            >
              <Page
                pageNumber={page}
                width={Math.max(width - 24, 280)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                aria-label={`${title}, page ${page}`}
                loading={
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-sea" />
                  </div>
                }
              />
            </Document>
          )
        )}
      </div>
      <p className="border-t border-blue-50 px-3 py-2 text-center text-xs text-muted">
        Large PDFs load page by page — use arrows to read. Scroll inside the viewer on mobile.
      </p>
    </div>
  );
}
