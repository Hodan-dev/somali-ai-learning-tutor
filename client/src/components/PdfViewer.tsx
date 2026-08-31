import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type Props = {
  url: string;
  title?: string;
  startPage?: number;
  endPage?: number;
};

const pdfOptions = {
  disableAutoFetch: false,
  disableStream: false,
  disableRange: false,
};

/** Progressive PDF viewer — streams pages so large files open much faster than an iframe. */
export function PdfViewer({ url, title = 'PDF lesson', startPage = 1, endPage }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const safeStart = Math.max(1, startPage);
  const [page, setPage] = useState(safeStart);
  const [numPages, setNumPages] = useState(0);
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [useIframe, setUseIframe] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setPage(safeStart);
    setNumPages(0);
    setLoading(true);
    setProgress(0);
    setError('');
    setUseIframe(false);
    setIframeLoaded(false);
  }, [url, safeStart]);

  const lastPage = endPage && endPage >= safeStart ? Math.min(endPage, numPages || endPage) : numPages;
  const pageCount = lastPage >= safeStart ? lastPage - safeStart + 1 : 0;
  const showRange = endPage !== undefined && endPage > safeStart;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total);
      setPage(safeStart);
      setLoading(false);
      setError('');
    },
    [safeStart]
  );

  const onLoadError = useCallback((err: Error) => {
    console.error('PDF.js load failed:', err);
    setLoading(false);
    setUseIframe(true);
  }, []);

  const onLoadProgress = useCallback(({ loaded, total }: { loaded: number; total: number }) => {
    if (total > 0) setProgress(Math.min(99, Math.round((loaded / total) * 100)));
  }, []);

  const viewerSrc = `${url.split('#')[0]}#view=FitH&toolbar=1`;

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

      {numPages > 0 && !useIframe && (
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-blue-50 bg-white px-3 py-2 text-sm">
          {showRange ? (
            <span className="text-muted">
              Reading pages <strong className="text-ink">{safeStart}</strong>–<strong className="text-ink">{lastPage}</strong>{' '}
              ({pageCount} pages)
            </span>
          ) : null}
          <button
            type="button"
            disabled={page <= safeStart}
            onClick={() => setPage((p) => Math.max(safeStart, p - 1))}
            className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-muted">
            Page{' '}
            <input
              type="number"
              min={safeStart}
              max={lastPage || numPages}
              value={page}
              onChange={(e) => {
                const n = Number(e.target.value);
                const max = lastPage || numPages;
                if (n >= safeStart && n <= max) setPage(n);
              }}
              className="w-14 rounded border border-blue-100 px-1 py-0.5 text-center text-ink"
            />{' '}
            of {lastPage || numPages}
          </span>
          <button
            type="button"
            disabled={page >= (lastPage || numPages)}
            onClick={() => setPage((p) => Math.min(lastPage || numPages, p + 1))}
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
        {useIframe ? (
          <>
            {!iframeLoaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white text-sm text-muted">
                <Loader2 className="h-8 w-8 animate-spin text-sea" />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sea" />
                  <span>Loading PDF…</span>
                </div>
              </div>
            )}
            <iframe
              title={title}
              src={viewerSrc}
              onLoad={() => setIframeLoaded(true)}
              className="block h-[min(72dvh,42rem)] w-full min-h-[280px] bg-white sm:h-[min(75dvh,48rem)]"
            />
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-sm">
            <p className="text-muted">{error}</p>
            <a href={url} target="_blank" rel="noreferrer" className="font-medium text-sea hover:underline">
              Open PDF in new tab
            </a>
          </div>
        ) : (
          width > 0 && (
            <>
              {loading && (
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
              <Document
                file={url}
                options={pdfOptions}
                onLoadSuccess={onLoadSuccess}
                onLoadError={onLoadError}
                onLoadProgress={onLoadProgress}
                loading=""
                className="flex w-full flex-col gap-4 shadow-md"
              >
                {showRange && lastPage >= safeStart
                  ? Array.from({ length: pageCount }, (_, i) => safeStart + i).map((pageNumber) => (
                      <Page
                        key={pageNumber}
                        pageNumber={pageNumber}
                        width={Math.max(width - 24, 280)}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        aria-label={`${title}, page ${pageNumber}`}
                        loading={
                          <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-sea" />
                          </div>
                        }
                      />
                    ))
                  : (
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
                    )}
              </Document>
            </>
          )
        )}
      </div>
      <p className="border-t border-blue-50 px-3 py-2 text-center text-xs text-muted">
        {useIframe
          ? 'Using browser PDF viewer — large files may take a moment to appear.'
          : 'Large PDFs load page by page — use arrows to read.'}
      </p>
    </div>
  );
}
