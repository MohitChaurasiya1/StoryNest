import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import DonutChart from '../../components/DonutChart';
import TeacherAnalysis from '../../components/TeacherModule/TeacherAnalysis';
import TeacherInbox from '../../components/TeacherModule/TeacherInbox';
import TeacherLessons from '../../components/TeacherModule/TeacherLessons';
import TeacherStudents from '../../components/TeacherModule/TeacherStudents';
import TeacherSettings from '../../components/TeacherModule/TeacherSettings';
import { teacherAPI } from '../../services/api';
import { 
  FaSearch, 
  FaBell, 
  FaChevronRight,
  FaBookOpen,
  FaUserGraduate,
  FaInbox,
  FaChartLine,
  FaCog
} from 'react-icons/fa';
import './TeacherDashboard.css';

export default function TeacherDashboard({ activeTab: tabProp }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current view tab based on prop, hash, or pathname
  const getCurrentTab = () => {
    if (tabProp) return tabProp;
    const path = location.pathname;
    if (path.includes('/analysis')) return 'analysis';
    if (path.includes('/inbox')) return 'inbox';
    if (path.includes('/lessons')) return 'lessons';
    if (path.includes('/students')) return 'students';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getCurrentTab();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonFilterTab, setLessonFilterTab] = useState('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await teacherAPI.getDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Error loading teacher dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const profile = dashboardData?.profile || {
    name: 'Ms. Rivera',
    school: 'Oakridge Elementary',
    unread_messages: 2
  };

  const weeklyProgress = dashboardData?.weekly_progress || 78;
  const students = dashboardData?.students || [
    { name: 'Leo Martinez', avatar: 'LM', progress: 92, status: 'On track', stories: 14 },
    { name: 'Emma Chen', avatar: 'EC', progress: 78, status: 'On track', stories: 11 },
    { name: 'Aisha Patel', avatar: 'AP', progress: 65, status: 'Needs attention', stories: 8 },
    { name: 'Noah Williams', avatar: 'NW', progress: 88, status: 'On track', stories: 13 },
    { name: 'Sofia Rodriguez', avatar: 'SR', progress: 45, status: 'Behind', stories: 5 },
    { name: 'Liam O\'Brien', avatar: 'LO', progress: 71, status: 'On track', stories: 9 },
  ];

  const lessons = dashboardData?.lessons || [
    { title: 'The Brave Little Acorn', grade: 'Grade 2', status: 'active', dueDate: 'Due Today', studentsCompleted: 18, totalStudents: 24 },
    { title: 'Ocean Friends: A Coral Reef Story', grade: 'Grade 3', status: 'active', dueDate: 'Due Tomorrow', studentsCompleted: 12, totalStudents: 22 },
    { title: 'Leo and the Golden Tree', grade: 'Grade 2', status: 'upcoming', dueDate: 'Jul 20', studentsCompleted: 0, totalStudents: 24 },
    { title: 'The Wind\'s Secret Song', grade: 'Grade 1', status: 'completed', dueDate: 'Completed Jul 12', studentsCompleted: 20, totalStudents: 20 },
    { title: 'Adventures in Starlight Meadow', grade: 'Grade 2', status: 'completed', dueDate: 'Completed Jul 10', studentsCompleted: 23, totalStudents: 24 },
  ];

  const filteredLessons = lessonFilterTab === 'all'
    ? lessons
    : lessons.filter(l => l.status === lessonFilterTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'On track': return 'var(--primary-accent, #7C3AED)';
      case 'Needs attention': return 'var(--secondary-accent, #F59E0B)';
      case 'Behind': return 'var(--danger-color, #EF4444)';
      default: return 'var(--text-muted, #64748B)';
    }
  };

  const getLessonStatusStyle = (status) => {
    switch (status) {
      case 'active': return { bg: '#E0F2FE', color: '#0284C7', label: 'Active' };
      case 'upcoming': return { bg: '#FEF3C7', color: '#D97706', label: 'Upcoming' };
      case 'completed': return { bg: '#F1F5F9', color: '#64748B', label: 'Done' };
      default: return { bg: '#F1F5F9', color: '#64748B', label: status };
    }
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'analysis':
        return <TeacherAnalysis />;
      case 'inbox':
        return <TeacherInbox />;
      case 'lessons':
        return <TeacherLessons />;
      case 'students':
        return <TeacherStudents />;
      case 'settings':
        return <TeacherSettings />;
      default:
        return (
          <>
            {/* Welcome Banner */}
            <section className="teacher-welcome-banner">
              <div className="welcome-banner-left">
                <h3>Weekly Teaching Progress</h3>
                <p className="text-muted">You've completed <strong>{weeklyProgress}%</strong> of this week's lesson assignments. Keep up the great work!</p>
              </div>
              <div className="welcome-banner-right">
                <div className="progress-ring-container">
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="var(--border-color, #E2E8F0)" strokeWidth="6" />
                    <circle 
                      cx="36" cy="36" r="30" fill="none" 
                      stroke="var(--primary-accent, #7C3AED)" strokeWidth="6" 
                      strokeLinecap="round"
                      strokeDasharray={`${(weeklyProgress / 100) * 2 * Math.PI * 30} ${2 * Math.PI * 30}`}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                    <text x="36" y="38" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-primary, #0F172A)">{weeklyProgress}%</text>
                  </svg>
                </div>
              </div>
            </section>

            {/* Two-column layout: Students + Donut */}
            <section className="teacher-two-col">
              {/* Students List */}
              <div className="card students-list-card">
                <div className="students-header">
                  <h4>My Class Students</h4>
                  <span className="pill pill-accent" style={{ cursor: 'pointer' }} onClick={() => navigate('/teacher/students')}>
                    {students.length} enrolled →
                  </span>
                </div>

                <div className="students-table">
                  {students.map((student, idx) => (
                    <div key={idx} className="student-row" style={{ cursor: 'pointer' }} onClick={() => navigate('/teacher/students')}>
                      <div className="student-info">
                        <div 
                          className="student-avatar" 
                          style={{ backgroundColor: idx % 2 === 0 ? 'var(--soft-accent-bg, #EDE9FE)' : '#FAF2DF' }}
                        >
                          {student.avatar}
                        </div>
                        <div className="student-name-group">
                          <span className="student-name">{student.name}</span>
                          <span className="student-stories text-muted">{student.stories} stories read</span>
                        </div>
                      </div>
                      <div className="student-progress-section">
                        <div className="progress-bar-track">
                          <div 
                            className="progress-bar-fill" 
                            style={{ 
                              width: `${student.progress}%`,
                              backgroundColor: getStatusColor(student.status)
                            }} 
                          />
                        </div>
                        <span className="student-pct" style={{ color: getStatusColor(student.status) }}>
                          {student.progress}%
                        </span>
                      </div>
                      <span 
                        className="student-status-pill"
                        style={{ 
                          backgroundColor: `${getStatusColor(student.status)}18`,
                          color: getStatusColor(student.status)
                        }}
                      >
                        {student.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut Chart Column */}
              <div className="donut-chart-col">
                <DonutChart />
              </div>
            </section>

            {/* Lessons & Assignments Section */}
            <section className="lessons-section">
              <div className="lessons-header">
                <h4>Active Lesson Assignments</h4>
                <div className="lessons-tabs">
                  {['all', 'active', 'upcoming', 'completed'].map(tab => (
                    <button
                      key={tab}
                      className={`lesson-tab ${lessonFilterTab === tab ? 'active' : ''}`}
                      onClick={() => setLessonFilterTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lessons-list">
                {filteredLessons.map((lesson, idx) => {
                  const statusStyle = getLessonStatusStyle(lesson.status);
                  const total = lesson.totalStudents || lesson.total_students || 24;
                  const completed = lesson.studentsCompleted || lesson.students_completed || 0;
                  const pct = Math.round((completed / total) * 100);
                  
                  return (
                    <div key={idx} className="card lesson-card">
                      <div className="lesson-icon-col">
                        <FaBookOpen />
                      </div>
                      <div className="lesson-info-col">
                        <h5 className="lesson-title">{lesson.title}</h5>
                        <span className="lesson-grade text-muted">{lesson.grade} · {lesson.dueDate || lesson.due_date}</span>
                      </div>
                      <div className="lesson-progress-col">
                        <div className="lesson-progress-track">
                          <div className="lesson-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="lesson-progress-text text-muted">{completed}/{total}</span>
                      </div>
                      <span 
                        className="lesson-status-badge"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                      >
                        {statusStyle.label}
                      </span>
                      <button className="lesson-action-btn" onClick={() => navigate('/teacher/lessons')}>
                        <FaChevronRight />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="teacher" />

      <main className="dashboard-content">
        {/* Top Navigation Header */}
        <header className="dashboard-top-nav">
          <div className="top-nav-left">
            <h2 className="serif-heading dashboard-welcome">Good morning, {profile.name}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              {profile.school} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="top-nav-right">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search..." onClick={() => navigate('/teacher/students')} />
            </div>
            <button 
              className="top-nav-btn bell-btn" 
              title="Notifications / Inbox"
              onClick={() => navigate('/teacher/inbox')}
            >
              <FaBell />
              {profile.unread_messages > 0 && <span className="bell-badge"></span>}
            </button>
            <div className="teacher-profile-avatar" onClick={() => navigate('/teacher/settings')} style={{ cursor: 'pointer' }}>
              {profile.avatar || 'MR'}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        {renderActiveContent()}
      </main>
    </div>
  );
}
