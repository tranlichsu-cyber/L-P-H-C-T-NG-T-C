import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { SchoolProvider } from './context/SchoolContext';
import { TeacherDataProvider } from './context/TeacherDataContext';
import { OfflineBanner } from './components/common/OfflineBanner';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { RefreshCw } from 'lucide-react';
import { AccountRoleGuard } from './components/common/AccountRoleGuard';

// Fast Eager Imports for Student Flow
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { LoginPage } from './pages/auth/LoginPage';
import { StudentLayout } from './layouts/StudentLayout';
import { JoinPage } from './pages/student/JoinPage';
import { SelectNamePage } from './pages/student/SelectNamePage';
import { WaitingPage } from './pages/student/WaitingPage';
import { QuizPage } from './pages/student/QuizPage';
import { ResultPage } from './pages/student/ResultPage';

// Lazy Loaded Teacher & Admin Routes for Code Splitting
const TeacherLayout = lazy(() =>
  import('./layouts/TeacherLayout').then((m) => ({ default: m.TeacherLayout }))
);
const DashboardPage = lazy(() =>
  import('./pages/teacher/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ClassesPage = lazy(() =>
  import('./pages/teacher/ClassesPage').then((m) => ({ default: m.ClassesPage }))
);
const ClassDetailsPage = lazy(() =>
  import('./pages/teacher/ClassDetailsPage').then((m) => ({ default: m.ClassDetailsPage }))
);
const QuizzesPage = lazy(() =>
  import('./pages/teacher/QuizzesPage').then((m) => ({ default: m.QuizzesPage }))
);
const QuizEditorPage = lazy(() =>
  import('./pages/teacher/QuizEditorPage').then((m) => ({ default: m.QuizEditorPage }))
);
const RoomControllerPage = lazy(() =>
  import('./pages/teacher/RoomControllerPage').then((m) => ({ default: m.RoomControllerPage }))
);
const PresentationPage = lazy(() =>
  import('./pages/teacher/PresentationPage').then((m) => ({ default: m.PresentationPage }))
);
const AiQuestionPage = lazy(() =>
  import('./pages/teacher/AiQuestionPage').then((m) => ({ default: m.AiQuestionPage }))
);
const HistoryPage = lazy(() =>
  import('./pages/teacher/HistoryPage').then((m) => ({ default: m.HistoryPage }))
);
const SessionDetailPage = lazy(() =>
  import('./pages/teacher/SessionDetailPage').then((m) => ({ default: m.SessionDetailPage }))
);
const StudentHistoryPage = lazy(() =>
  import('./pages/teacher/StudentHistoryPage').then((m) => ({ default: m.StudentHistoryPage }))
);
const RemediationHubPage = lazy(() =>
  import('./pages/teacher/RemediationHubPage').then((m) => ({ default: m.RemediationHubPage }))
);
const PracticeListPage = lazy(() =>
  import('./pages/teacher/PracticeListPage').then((m) => ({ default: m.PracticeListPage }))
);
const PracticeEditorPage = lazy(() =>
  import('./pages/teacher/PracticeEditorPage').then((m) => ({ default: m.PracticeEditorPage }))
);
const PracticeMonitorPage = lazy(() =>
  import('./pages/teacher/PracticeMonitorPage').then((m) => ({ default: m.PracticeMonitorPage }))
);

// Admin & Team Lazy Loaded Pages
const SchoolDashboardPage = lazy(() =>
  import('./pages/admin/SchoolDashboardPage').then((m) => ({ default: m.SchoolDashboardPage }))
);
const TeacherManagementPage = lazy(() =>
  import('./pages/admin/TeacherManagementPage').then((m) => ({ default: m.TeacherManagementPage }))
);
const TeamManagementPage = lazy(() =>
  import('./pages/admin/TeamManagementPage').then((m) => ({ default: m.TeamManagementPage }))
);
const JoinRequestsPage = lazy(() =>
  import('./pages/admin/JoinRequestsPage').then((m) => ({ default: m.JoinRequestsPage }))
);
const SchoolReportsPage = lazy(() =>
  import('./pages/admin/SchoolReportsPage').then((m) => ({ default: m.SchoolReportsPage }))
);
const AuditLogsPage = lazy(() =>
  import('./pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage }))
);
const TeamDashboardPage = lazy(() =>
  import('./pages/team/TeamDashboardPage').then((m) => ({ default: m.TeamDashboardPage }))
);
const StudentPracticeHubPage = lazy(() =>
  import('./pages/student/StudentPracticeHubPage').then((m) => ({ default: m.StudentPracticeHubPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-12 text-slate-500 gap-2 font-bold text-sm">
    <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
    <span>Đang tải mô-đun ứng dụng...</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <SchoolProvider>
          <TeacherDataProvider>
            <OfflineBanner />
            <PWAInstallPrompt />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Role Selection Landing */}
                  <Route path="/" element={<RoleSelectionPage />} />

                  {/* Teacher Auth */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Teacher Section */}
                  <Route
                    path="/teacher"
                    element={
                      <AccountRoleGuard allowedRoles={['SCHOOL_ADMIN', 'TEAM_LEADER', 'TEACHER']}>
                        <TeacherLayout />
                      </AccountRoleGuard>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="classes" element={<ClassesPage />} />
                    <Route path="classes/:classId" element={<ClassDetailsPage />} />
                    <Route path="classes/:classId/students/:studentId/history" element={<StudentHistoryPage />} />
                    <Route path="quizzes" element={<QuizzesPage />} />
                    <Route path="quizzes/:quizId" element={<QuizEditorPage />} />
                    <Route path="ai" element={<AiQuestionPage />} />
                    <Route path="remediation" element={<RemediationHubPage />} />
                    <Route path="practice" element={<PracticeListPage />} />
                    <Route path="practice/new" element={<PracticeEditorPage />} />
                    <Route path="practice/:practiceSetId" element={<PracticeMonitorPage />} />
                    <Route path="practice/:practiceSetId/edit" element={<PracticeEditorPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="history/:roomId" element={<SessionDetailPage />} />
                    <Route path="room" element={<RoomControllerPage />} />
                    <Route path="room/:roomId" element={<RoomControllerPage />} />
                    <Route path="room/present" element={<PresentationPage />} />
                    <Route path="room/:roomId/present" element={<PresentationPage />} />
                  </Route>

                  {/* Milestone 11: School Admin & Team Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AccountRoleGuard allowedRoles={['SCHOOL_ADMIN']}>
                        <TeacherLayout />
                      </AccountRoleGuard>
                    }
                  >
                    <Route index element={<SchoolDashboardPage />} />
                    <Route path="teachers" element={<TeacherManagementPage />} />
                    <Route path="teams" element={<TeamManagementPage />} />
                    <Route path="requests" element={<JoinRequestsPage />} />
                    <Route path="reports" element={<SchoolReportsPage />} />
                    <Route path="logs" element={<AuditLogsPage />} />
                  </Route>

                  <Route
                    path="/team"
                    element={
                      <AccountRoleGuard allowedRoles={['SCHOOL_ADMIN', 'TEAM_LEADER']}>
                        <TeacherLayout />
                      </AccountRoleGuard>
                    }
                  >
                    <Route index element={<TeamDashboardPage />} />
                  </Route>

                  {/* Student Section (Eagerly Loaded Fast Bundle) */}
                  <Route path="/student" element={<StudentLayout />}>
                    <Route index element={<Navigate to="/student/join" replace />} />
                    <Route path="join" element={<JoinPage />} />
                    <Route path="select-name" element={<SelectNamePage />} />
                    <Route path="waiting" element={<WaitingPage />} />
                    <Route path="quiz" element={<QuizPage />} />
                    <Route path="result" element={<ResultPage />} />
                    <Route path="practice" element={<StudentPracticeHubPage />} />
                  </Route>

                  {/* Fallback 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TeacherDataProvider>
        </SchoolProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
