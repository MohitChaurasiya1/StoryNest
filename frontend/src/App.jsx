import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
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
import StoryCreator from './pages/StoryCreator/StoryCreator';
import StoryReader from './pages/StoryReader';

function App() {
  // Auto‑reload the entire app every 5 minutes to keep data fresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      window.location.reload();
    }, 300000); // 5 min
    return () => clearInterval(intervalId);
  }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent"
            element={
              <ProtectedRoute>
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
            path="/create"
            element={
              <ProtectedRoute>
                <StoryCreator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/story/:id"
            element={
              <ProtectedRoute>
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
