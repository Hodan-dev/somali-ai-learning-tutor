import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, Bot, Home, LayoutDashboard, LogOut, UserRound, ChartColumnIncreasing, GraduationCap } from 'lucide-react';
import { useAuth } from '../auth';

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
  const links = variant === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-teal-100/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to={variant === 'admin' ? '/admin' : '/app'} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sea text-white font-display font-bold">S</span>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold text-ink sm:text-base">Somali AI Tutor</div>
              <div className="text-[11px] text-muted">{variant === 'admin' ? 'Admin' : 'Arday'}</div>
            </div>
          </Link>
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-100 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-sea-light"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-teal-50 px-3 py-2 md:hidden">
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
