import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import ChildrenList from './components/ParentModule/ChildrenList';
import ChildDetails from './components/ParentModule/ChildDetails';
import ParentStoryLibrary from './components/ParentModule/ParentStoryLibrary';
import ChildProgress from './components/ParentModule/ChildProgress';
import QuizReports from './components/ParentModule/QuizReports';
import Achievements from './components/ParentModule/Achievements';
import Certificates from './components/ParentModule/Certificates';
import ParentProfile from './components/ParentModule/ParentProfile';
import ParentSettings from './components/ParentModule/ParentSettings';
import ParentNotes from './components/ParentModule/ParentNotes';
import StoryApprovals from './components/ParentModule/StoryApprovals';
import ReadingAnalytics from './components/ParentModule/ReadingAnalytics';
import ChildGoals from './components/ParentModule/ChildGoals';
import NotificationCenter from './components/ParentModule/NotificationCenter';
import ActivityTimeline from './components/ParentModule/ActivityTimeline';
import FavoriteStories from './components/ParentModule/FavoriteStories';
import ReadingStreak from './components/ParentModule/ReadingStreak';
import ChildGrowthDashboard from './components/ParentModule/ChildGrowthDashboard';
import ChildComparison from './components/ParentModule/ChildComparison';
import AIInsights from './components/ParentModule/AIInsights';
import StoryRecommendations from './components/ParentModule/StoryRecommendations';
import ReadingSchedule from './components/ParentModule/ReadingSchedule';
import RewardsShop from './components/ParentModule/RewardsShop';
import GlobalSearch from './components/ParentModule/GlobalSearch';
import ReportExport from './components/ParentModule/ReportExport';
import StoryCreator from './pages/StoryCreator/StoryCreator';
import StoryReader from './pages/StoryReader';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <TeacherDashboard activeTab="dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/analysis"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <TeacherDashboard activeTab="analysis" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/inbox"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <TeacherDashboard activeTab="inbox" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/lessons"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <TeacherDashboard activeTab="lessons" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <TeacherDashboard activeTab="students" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/settings"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <TeacherDashboard activeTab="settings" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/children"
            element={
              <ProtectedRoute>
                <ChildrenList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/children/:id"
            element={
              <ProtectedRoute>
                <ChildDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/library"
            element={
              <ProtectedRoute>
                <ParentStoryLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/progress"
            element={
              <ProtectedRoute>
                <ChildProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/quizzes"
            element={
              <ProtectedRoute>
                <QuizReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/certificates"
            element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/profile"
            element={
              <ProtectedRoute>
                <ParentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/settings"
            element={
              <ProtectedRoute>
                <ParentSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/notes"
            element={
              <ProtectedRoute>
                <ParentNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/approvals"
            element={
              <ProtectedRoute>
                <StoryApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/analytics"
            element={
              <ProtectedRoute>
                <ReadingAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/goals"
            element={
              <ProtectedRoute>
                <ChildGoals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/notifications"
            element={
              <ProtectedRoute>
                <NotificationCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/timeline"
            element={
              <ProtectedRoute>
                <ActivityTimeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/favorites"
            element={
              <ProtectedRoute>
                <FavoriteStories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/streak"
            element={
              <ProtectedRoute>
                <ReadingStreak />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/growth"
            element={
              <ProtectedRoute>
                <ChildGrowthDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/comparison"
            element={
              <ProtectedRoute>
                <ChildComparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/ai-insights"
            element={
              <ProtectedRoute>
                <AIInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/recommendations"
            element={
              <ProtectedRoute>
                <StoryRecommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/schedule"
            element={
              <ProtectedRoute>
                <ReadingSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/rewards"
            element={
              <ProtectedRoute>
                <RewardsShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/search"
            element={
              <ProtectedRoute>
                <GlobalSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/reports"
            element={
              <ProtectedRoute>
                <ReportExport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']}>
                <StoryCreator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/story/:id"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'TEACHER', 'ADMIN']}>
                <StoryReader />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
