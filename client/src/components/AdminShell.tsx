import { useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChartColumnIncreasing,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../auth';
import { BrandLogo } from './BrandLogo';
import { DynamicSelectEnhancer } from './DynamicSelectEnhancer';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'Students', icon: UserRound },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/lessons', label: 'Lessons', icon: GraduationCap },
  { to: '/admin/exercises', label: 'Exercises', icon: ChartColumnIncreasing },
];

export function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="min-h-screen bg-[#eef2f7]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
          <BrandLogo to="/admin" subtitle="Admin Dashboard" />

          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search students, courses..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-sea focus:bg-white focus:ring-2 focus:ring-sea/20"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="relative hidden rounded-full p-2 text-slate-500 hover:bg-slate-100 sm:inline-flex"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <button
              type="button"
              className="hidden rounded-full p-2 text-slate-500 hover:bg-slate-100 sm:inline-flex"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sea to-sea-dark text-sm font-bold text-white">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold text-ink">{user?.name}</div>
                <div className="text-[11px] text-muted">Administrator</div>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="px-5 py-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Main Menu</p>
            <nav className="mt-4 space-y-1">
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-sea text-white shadow-md shadow-sea/25'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-sea'
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </span>
                  <span className="text-xs opacity-60">›</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main ref={mainRef} className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <nav className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${
                    isActive ? 'bg-sea text-white' : 'bg-white text-slate-600 shadow-sm'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <DynamicSelectEnhancer scope={mainRef} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
