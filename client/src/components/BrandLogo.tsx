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
            <linearGradient id="athBg" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5eb8f0" />
              <stop offset="1" stopColor="#2d8fd4" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="13" fill="url(#athBg)" />
          <path
            d="M10 18.5L24 12l14 6.5v3L24 28 10 21.5v-3Z"
            fill="#f5e6d3"
            stroke="white"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M24 28v10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M17 32.5c0 2.5 3.1 4.5 7 4.5s7-2 7-4.5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M30 14.5l6-2.5 2 1.2-6 2.8-2-1.5Z"
            fill="#f5e6d3"
            stroke="white"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <circle cx="35" cy="12" r="2.2" fill="white" />
          <path d="M35 10.5v3M33.5 12h3" stroke="#2d8fd4" strokeWidth="0.9" strokeLinecap="round" />
          <path
            d="M14 22h6M14 25h4"
            stroke="#2d8fd4"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>
      {showText && (
        <div className="leading-tight">
          <div
            className={`font-display text-sm font-bold tracking-tight sm:text-base ${
              theme === 'dark' ? 'text-white' : 'text-ink'
            }`}
          >
            ArdeyTechHub
          </div>
          <div
            className={`text-[10px] font-semibold uppercase tracking-wide sm:text-[11px] ${
              theme === 'dark' ? 'text-sky-300' : 'text-sky-600'
            }`}
          >
            {subtitle || 'Academic · Digital Learning'}
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
