import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { AppShell } from './components/AppShell';
import { Loading } from './components/ui';
import { StudentDashboard } from './pages/StudentDashboard';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LessonPage } from './pages/LessonPage';
import { ExercisePage } from './pages/ExercisePage';
import { ProfilePage, ProgressPage, TutorPage } from './pages/StudentMore';
import {
  AdminDashboard,
  AdminCoursesPage,
  AdminLessonsPage,
  AdminExercisesPage,
  AdminStudentsPage,
  AdminStudentDetailPage,
} from './pages/AdminPages';

const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.RegisterPage })));

function Protected({ role }: { role?: 'ADMIN' | 'STUDENT' }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/app'} replace />;
  }
  return <Outlet />;
}

function PublicPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage><LandingPage /></PublicPage>} />
      <Route path="/login" element={<PublicPage><LoginPage /></PublicPage>} />
      <Route path="/register" element={<PublicPage><RegisterPage /></PublicPage>} />

      <Route element={<Protected role="STUDENT" />}>
        <Route element={<AppShell variant="student" />}>
          <Route path="/app" element={<StudentDashboard />} />
          <Route path="/app/courses" element={<CoursesPage />} />
          <Route path="/app/courses/:id" element={<CourseDetailPage />} />
          <Route path="/app/lessons/:id" element={<LessonPage />} />
          <Route path="/app/exercises/:id" element={<ExercisePage />} />
          <Route path="/app/progress" element={<ProgressPage />} />
          <Route path="/app/tutor" element={<TutorPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<Protected role="ADMIN" />}>
        <Route element={<AppShell variant="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/lessons" element={<AdminLessonsPage />} />
          <Route path="/admin/exercises" element={<AdminExercisesPage />} />
          <Route path="/admin/students" element={<AdminStudentsPage />} />
          <Route path="/admin/students/:id" element={<AdminStudentDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
