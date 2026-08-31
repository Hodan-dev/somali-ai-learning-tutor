import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { AppShell } from './components/AppShell';
import { PageSkeleton } from './components/ui';

const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.RegisterPage })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));
const CoursesPage = lazy(() => import('./pages/CoursesPage').then((m) => ({ default: m.CoursesPage })));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const LessonPage = lazy(() => import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })));
const ExercisePage = lazy(() => import('./pages/ExercisePage').then((m) => ({ default: m.ExercisePage })));
const ProfilePage = lazy(() => import('./pages/StudentMore').then((m) => ({ default: m.ProfilePage })));
const ProgressPage = lazy(() => import('./pages/StudentMore').then((m) => ({ default: m.ProgressPage })));
const TutorPage = lazy(() => import('./pages/StudentMore').then((m) => ({ default: m.TutorPage })));
const AdminDashboard = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminDashboard })));
const AdminCoursesPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminCoursesPage })));
const AdminLessonsPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminLessonsPage })));
const AdminExercisesPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminExercisesPage })));
const AdminStudentsPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminStudentsPage })));
const AdminStudentDetailPage = lazy(() =>
  import('./pages/AdminPages').then((m) => ({ default: m.AdminStudentDetailPage }))
);

function Protected({ role }: { role?: 'ADMIN' | 'STUDENT' }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/app'} replace />;
  }
  return <Outlet />;
}

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton label="Loading page..." />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Page><LandingPage /></Page>} />
      <Route path="/login" element={<Page><LoginPage /></Page>} />
      <Route path="/register" element={<Page><RegisterPage /></Page>} />

      <Route element={<Protected role="STUDENT" />}>
        <Route element={<AppShell variant="student" />}>
          <Route path="/app" element={<Page><StudentDashboard /></Page>} />
          <Route path="/app/courses" element={<Page><CoursesPage /></Page>} />
          <Route path="/app/courses/:id" element={<Page><CourseDetailPage /></Page>} />
          <Route path="/app/lessons/:id" element={<Page><LessonPage /></Page>} />
          <Route path="/app/exercises/:id" element={<Page><ExercisePage /></Page>} />
          <Route path="/app/progress" element={<Page><ProgressPage /></Page>} />
          <Route path="/app/tutor" element={<Page><TutorPage /></Page>} />
          <Route path="/app/profile" element={<Page><ProfilePage /></Page>} />
        </Route>
      </Route>

      <Route element={<Protected role="ADMIN" />}>
        <Route element={<AppShell variant="admin" />}>
          <Route path="/admin" element={<Page><AdminDashboard /></Page>} />
          <Route path="/admin/courses" element={<Page><AdminCoursesPage /></Page>} />
          <Route path="/admin/lessons" element={<Page><AdminLessonsPage /></Page>} />
          <Route path="/admin/exercises" element={<Page><AdminExercisesPage /></Page>} />
          <Route path="/admin/students" element={<Page><AdminStudentsPage /></Page>} />
          <Route path="/admin/students/:id" element={<Page><AdminStudentDetailPage /></Page>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
