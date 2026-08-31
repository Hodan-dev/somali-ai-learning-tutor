import { Link } from 'react-router-dom';

type Size = 'sm' | 'md' | 'lg';

const iconSize: Record<Size, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
};

export function BrandLogo({
  to = '/',
  size = 'md',
  showText = true,
  subtitle,
  theme = 'light',
}: {
  to?: string;
  size?: Size;
  showText?: boolean;
  subtitle?: string;
  theme?: 'light' | 'dark';
}) {
  const content = (
    <>
      <div className={`${iconSize[size]} shrink-0`} aria-hidden>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <defs>
            <linearGradient id="logoGrad" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="14" fill="url(#logoGrad)" />
          <path
            d="M24 11L14 16.5V28c0 5.2 4.3 10 10 11 5.7-1 10-5.8 10-11V16.5L24 11Z"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.12)"
          />
          <path d="M24 11v27" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <path d="M17 19.5h14M17 24h14M17 28.5h9" stroke="#bae6fd" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="34" cy="14" r="5" fill="#7dd3fc" stroke="white" strokeWidth="1.5" />
          <path d="M34 12v4M32 14h4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      {showText && (
        <div className="leading-tight">
          <div
            className={`font-display text-sm font-bold sm:text-base ${
              theme === 'dark' ? 'text-white' : 'text-ink'
            }`}
          >
            Somali Tutor AI
          </div>
          <div className={`text-[11px] font-medium ${theme === 'dark' ? 'text-sky-300' : 'text-sky-600'}`}>
            {subtitle || 'Baro · Learning Platform'}
          </div>
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="flex items-center gap-2.5 transition hover:opacity-90">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-2.5">{content}</div>;
}
