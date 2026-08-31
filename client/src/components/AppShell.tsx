import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Bot,
  ChartColumnIncreasing,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Search,
  Settings,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../auth';
import { BrandLogo } from './BrandLogo';
import { DynamicSelectEnhancer } from './DynamicSelectEnhancer';

type ShellVariant = 'student' | 'admin';

type NavLinkItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

const studentLinks: NavLinkItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/courses', label: 'Courses', icon: BookOpen },
  { to: '/app/progress', label: 'Progress', icon: ChartColumnIncreasing },
  { to: '/app/tutor', label: 'AI Tutor', icon: Bot },
];

const studentBottomLinks: NavLinkItem[] = [
  { to: '/app/profile', label: 'Account Details', icon: UserRound },
];

const adminLinks: NavLinkItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'Students', icon: UserRound },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/lessons', label: 'Lessons', icon: GraduationCap },
  { to: '/admin/exercises', label: 'Exercises', icon: ChartColumnIncreasing },
];

const shellConfig: Record<
  ShellVariant,
  { home: string; subtitle: string; roleLabel: string; searchPlaceholder: string; links: NavLinkItem[]; bottomLinks?: NavLinkItem[] }
> = {
  student: {
    home: '/app',
    subtitle: 'Learning Platform',
    roleLabel: 'Student',
    searchPlaceholder: 'Search courses, lessons...',
    links: studentLinks,
    bottomLinks: studentBottomLinks,
  },
  admin: {
    home: '/admin',
    subtitle: 'Admin Panel',
    roleLabel: 'Administrator',
    searchPlaceholder: 'Search students, courses...',
    links: adminLinks,
  },
};

function SidebarNavLink({ link }: { link: NavLinkItem }) {
  return (
    <NavLink
      to={link.to}
      end={link.end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-sidebar-active text-white'
            : 'text-slate-400 hover:bg-sidebar-hover hover:text-white'
        }`
      }
    >
      <link.icon className="h-5 w-5 shrink-0" />
      {link.label}
    </NavLink>
  );
}

export function AppShell({ variant }: { variant: ShellVariant }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const config = shellConfig[variant];

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-sidebar lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <BrandLogo to={config.home} size="md" subtitle={config.subtitle} theme="dark" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label={`${config.roleLabel} navigation`}>
          {config.links.map((link) => (
            <SidebarNavLink key={link.to} link={link} />
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 px-3 py-4">
          {config.bottomLinks?.map((link) => (
            <SidebarNavLink key={link.to} link={link} />
          ))}
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-sidebar-hover hover:text-white"
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-sidebar-hover hover:text-white"
          >
            <HelpCircle className="h-5 w-5" />
            Help
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-sidebar-hover hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-hover p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-sm font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
              <div className="truncate text-xs text-slate-400">{user?.email}</div>
            </div>
            <MoreHorizontal className="h-4 w-4 shrink-0 text-slate-500" />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="lg:hidden">
            <BrandLogo to={config.home} size="sm" subtitle={config.subtitle} />
          </div>
          {variant === 'admin' ? (
            <div className="mx-auto hidden max-w-lg flex-1 lg:block">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder={config.searchPlaceholder}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-sea focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
              </label>
            </div>
          ) : (
            <div className="hidden flex-1 lg:block" />
          )}
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700 sm:flex">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
          {[...config.links, ...(config.bottomLinks || [])].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${
                  isActive ? 'bg-sea text-white' : 'bg-slate-100 text-slate-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <main ref={mainRef} className="min-h-[calc(100vh-3.5rem)] flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:py-6">
          {variant === 'admin' && <DynamicSelectEnhancer scope={mainRef} />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
