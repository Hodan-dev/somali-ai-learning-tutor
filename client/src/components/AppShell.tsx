import { useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, Bot, Home, LayoutDashboard, LogOut, UserRound, ChartColumnIncreasing, GraduationCap } from 'lucide-react';
import { useAuth } from '../auth';
import { BrandLogo } from './BrandLogo';
import { DynamicSelectEnhancer } from './DynamicSelectEnhancer';

const studentLinks = [
  { to: '/app', label: 'Dashboard', icon: Home, end: true },
  { to: '/app/courses', label: 'Koorsooyinka', icon: BookOpen },
  { to: '/app/progress', label: 'Horumar', icon: ChartColumnIncreasing },
  { to: '/app/tutor', label: 'Macallinka AI', icon: Bot },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/courses', label: 'Koorsooyinka', icon: BookOpen },
  { to: '/admin/lessons', label: 'Casharrada', icon: GraduationCap },
  { to: '/admin/exercises', label: 'Layliyada', icon: ChartColumnIncreasing },
  { to: '/admin/students', label: 'Ardayda', icon: UserRound },
];

export function AppShell({ variant }: { variant: 'student' | 'admin' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const links = variant === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <BrandLogo
            to={variant === 'admin' ? '/admin' : '/app'}
            subtitle={variant === 'admin' ? 'Admin Dashboard' : 'Arday · Student'}
          />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={'end' in l ? l.end : false}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-sea-light text-sea-dark' : 'text-muted hover:bg-slate-50 hover:text-ink'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted sm:inline">{user?.name}</span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-blue-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-blue-50 px-3 py-2 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={'end' in l ? l.end : false}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-sea text-white' : 'bg-white text-muted'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main ref={mainRef} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <DynamicSelectEnhancer scope={mainRef} />
        <Outlet />
      </main>
    </div>
  );
}
