import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export type SelectOption = { value: string; label: string; disabled?: boolean };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled = false,
  required = false,
  className = '',
  name,
  id,
}: Props) {
  const autoId = useId();
  const listId = `${id || autoId}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    setHighlight(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setQuery('');
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery('');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === 'Enter' && filtered[highlight] && !filtered[highlight].disabled) {
      e.preventDefault();
      pick(filtered[highlight].value);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`} onKeyDown={onKeyDown}>
      <button
        type="button"
        id={id || autoId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-blue-100 bg-slate-50 px-3 py-2.5 text-left text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-sea disabled:cursor-not-allowed disabled:opacity-60 ${
          open ? 'border-blue-300 bg-white ring-2 ring-sea' : ''
        }`}
      >
        <span className={`truncate ${selected ? 'text-ink' : 'text-muted'}`}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}

      {open && (
        <div className="absolute z-[80] mt-1 w-full overflow-hidden rounded-xl border border-blue-100 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-blue-50 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded p-0.5 text-muted hover:bg-slate-100"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <ul id={listId} role="listbox" className="max-h-56 overflow-y-auto py-1 text-sm">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-muted">No results found</li>
            )}
            {filtered.map((opt, i) => {
              const active = opt.value === value;
              const hi = i === highlight;
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    disabled={opt.disabled}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => !opt.disabled && pick(opt.value)}
                    className={`flex w-full px-3 py-2 text-left transition ${
                      opt.disabled
                        ? 'cursor-not-allowed text-slate-300'
                        : active
                          ? 'bg-sea-light font-semibold text-sea-dark'
                          : hi
                            ? 'bg-blue-50 text-ink'
                            : 'text-ink hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
