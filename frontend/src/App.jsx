import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/AdminDashboard';

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

import TeacherLayout from './components/TeacherModule/TeacherLayout';
import TeacherDashboard from './components/TeacherModule/Dashboard/TeacherDashboard';
import ClassroomsPage from './components/TeacherModule/Classrooms/ClassroomsPage';
import ClassroomDetailsPage from './components/TeacherModule/Classrooms/ClassroomDetails/ClassroomDetailsPage';
import StudentProfilePage from './components/TeacherModule/Classrooms/Student/StudentProfilePage';
import LibraryPage from './components/TeacherModule/Library/LibraryPage';
import CreateStoryPage from './components/TeacherModule/Library/StoryCreator/CreateStoryPage';
import ComingSoonPlaceholder from './components/TeacherModule/ComingSoonPlaceholder';
import AssignmentsPage from './components/TeacherModule/Assignments/AssignmentsPage';
import CreateAssignmentPage from './components/TeacherModule/Assignments/CreateAssignment/CreateAssignmentPage';
import AssignmentDetailsPage from './components/TeacherModule/Assignments/AssignmentDetails/AssignmentDetailsPage';
import ProgressPage from './components/TeacherModule/Progress/ProgressPage';
import StudentProgressPage from './components/TeacherModule/Progress/StudentProgress/StudentProgressPage';
import ClassroomProgressPage from './components/TeacherModule/Progress/ClassroomProgress/ClassroomProgressPage';
import SettingsPage from './components/TeacherModule/Settings/SettingsPage';

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
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route path="classrooms/:id" element={<ClassroomDetailsPage />} />
            <Route path="classrooms/:id/students/:studentId" element={<StudentProfilePage />} />
            <Route path="library" element={<LibraryPage />} />
            
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="assignments/create" element={<CreateAssignmentPage />} />
            <Route path="assignments/:id" element={<AssignmentDetailsPage />} />

            <Route path="progress" element={<ProgressPage />} />
            <Route path="progress/classrooms/:classroomId" element={<ClassroomProgressPage />} />
            <Route path="progress/students/:studentId" element={<StudentProgressPage />} />

            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/:tab" element={<SettingsPage />} />
            <Route path="library/create-lesson" element={
              <ComingSoonPlaceholder 
                title="Lesson Builder" 
                description="The Lesson Builder is coming soon. You'll be able to create custom lessons for your students here." 
              />
            } />
            <Route path="library/create-story" element={<CreateStoryPage />} />
            <Route path="library/create-quiz" element={
              <ComingSoonPlaceholder 
                title="Quiz Creator" 
                description="The Quiz Creator is coming soon. Create custom comprehension checks for your students here." 
              />
            } />
          </Route>

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
