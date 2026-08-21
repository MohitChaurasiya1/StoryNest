import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard/TeacherDashboard';
import TeacherLayout from './components/TeacherModule/TeacherLayout';
import TeacherClassrooms from './components/TeacherModule/TeacherClassrooms';
import TeacherClassroomDetails from './components/TeacherModule/TeacherClassroomDetails';
import TeacherStoryLibrary from './components/TeacherModule/TeacherStoryLibrary';
import TeacherReadingProgress from './components/TeacherModule/TeacherReadingProgress';
import TeacherQuizReports from './components/TeacherModule/TeacherQuizReports';
import TeacherLearningGoals from './components/TeacherModule/TeacherLearningGoals';
import TeacherAchievements from './components/TeacherModule/TeacherAchievements';
import TeacherCertificates from './components/TeacherModule/TeacherCertificates';
import TeacherAnalytics from './components/TeacherModule/TeacherAnalytics';
import TeacherAIInsights from './components/TeacherModule/TeacherAIInsights';
import TeacherRecommendations from './components/TeacherModule/TeacherRecommendations';
import TeacherComparison from './components/TeacherModule/TeacherComparison';
import TeacherReports from './components/TeacherModule/TeacherReports';
import TeacherResources from './components/TeacherModule/TeacherResources';
import TeacherNotifications from './components/TeacherModule/TeacherNotifications';
import TeacherAssignments from './components/TeacherModule/TeacherAssignments';
import TeacherAssignmentDetails from './components/TeacherModule/TeacherAssignmentDetails';
import TeacherSchedule from './components/TeacherModule/TeacherSchedule';
import TeacherStudents from './components/TeacherModule/TeacherStudents';
import TeacherStudentProfile from './components/TeacherModule/TeacherStudentProfile';
import TeacherLessons from './components/TeacherModule/TeacherLessons';
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
            path="/admin/:tab"
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
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            {/* Phase 1: Keep existing dashboard logic for now by mapping everything into the layout */}
            <Route index element={<TeacherDashboard activeTab="dashboard" />} />
            <Route path="classrooms" element={<TeacherClassrooms />} />
            <Route path="classrooms/:id" element={<TeacherClassroomDetails />} />
            <Route path="library" element={<TeacherStoryLibrary />} />
            <Route path="progress" element={<TeacherReadingProgress />} />
            <Route path="quizzes" element={<TeacherQuizReports />} />
            <Route path="goals" element={<TeacherLearningGoals />} />
            <Route path="achievements" element={<TeacherAchievements />} />
            <Route path="certificates" element={<TeacherCertificates />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
            <Route path="insights" element={<TeacherAIInsights />} />
            <Route path="recommendations" element={<TeacherRecommendations />} />
            <Route path="comparison" element={<TeacherComparison />} />
            <Route path="reports" element={<TeacherReports />} />
            <Route path="resources" element={<TeacherResources />} />
            <Route path="notifications" element={<TeacherNotifications />} />
            <Route path="inbox" element={<TeacherDashboard activeTab="inbox" />} />
            <Route path="messages" element={<TeacherDashboard activeTab="inbox" />} />
            <Route path="lessons" element={<TeacherLessons />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="assignments/:assignmentId" element={<TeacherAssignmentDetails />} />
            <Route path="schedule" element={<TeacherSchedule />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="students/:id" element={<TeacherStudentProfile />} />
            <Route path="settings" element={<TeacherDashboard activeTab="settings" />} />
            {/* Future nested routes will replace these mapped activeTab components */}
            <Route path="*" element={<TeacherDashboard activeTab="dashboard" />} />
          </Route>
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
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ChildrenList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/children/:id"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ChildDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/library"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ParentStoryLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/progress"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ChildProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/quizzes"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <QuizReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/achievements"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/certificates"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <Certificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/profile"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ParentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/settings"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ParentSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/notes"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ParentNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/approvals"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <StoryApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/analytics"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ReadingAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/goals"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ChildGoals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/notifications"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <NotificationCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/timeline"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ActivityTimeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/favorites"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <FavoriteStories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/streak"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ReadingStreak />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/growth"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ChildGrowthDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/comparison"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ChildComparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/ai-insights"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <AIInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/recommendations"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <StoryRecommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/schedule"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ReadingSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/rewards"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <RewardsShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/search"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
                <GlobalSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/reports"
            element={
              <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
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
