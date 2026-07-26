import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/children" element={<ChildrenList />} />
          <Route path="/parent/children/:id" element={<ChildDetails />} />
          <Route path="/parent/library" element={<ParentStoryLibrary />} />
          <Route path="/parent/progress" element={<ChildProgress />} />
          <Route path="/parent/quizzes" element={<QuizReports />} />
          <Route path="/parent/achievements" element={<Achievements />} />
          <Route path="/parent/certificates" element={<Certificates />} />
          <Route path="/parent/profile" element={<ParentProfile />} />
          <Route path="/parent/settings" element={<ParentSettings />} />
          <Route path="/create" element={<StoryCreator />} />
          <Route path="/story/:id" element={<StoryReader />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
