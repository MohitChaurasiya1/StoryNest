import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StoryCreator from './pages/StoryCreator';
import StoryReader from './pages/StoryReader';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/create" element={<StoryCreator />} />
        <Route path="/story/:id" element={<StoryReader />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
