import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import DonutChart from '../../components/DonutChart';
import { 
  FaSearch, 
  FaBell, 
  FaCheckCircle, 
  FaClock, 
  FaChevronRight,
  FaBookOpen,
  FaStar
} from 'react-icons/fa';
import './TeacherDashboard.css';

export default function TeacherDashboard() {
  const [selectedTab, setSelectedTab] = useState('all');

  const students = [
    { name: 'Leo Martinez', avatar: 'LM', progress: 92, status: 'On track', stories: 14 },
    { name: 'Emma Chen', avatar: 'EC', progress: 78, status: 'On track', stories: 11 },
    { name: 'Aisha Patel', avatar: 'AP', progress: 65, status: 'Needs attention', stories: 8 },
    { name: 'Noah Williams', avatar: 'NW', progress: 88, status: 'On track', stories: 13 },
    { name: 'Sofia Rodriguez', avatar: 'SR', progress: 45, status: 'Behind', stories: 5 },
    { name: 'Liam O\'Brien', avatar: 'LO', progress: 71, status: 'On track', stories: 9 },
  ];

  const lessons = [
    { title: 'The Brave Little Acorn', grade: 'Grade 2', status: 'active', dueDate: 'Due Today', studentsCompleted: 18, totalStudents: 24 },
    { title: 'Ocean Friends: A Coral Reef Story', grade: 'Grade 3', status: 'active', dueDate: 'Due Tomorrow', studentsCompleted: 12, totalStudents: 22 },
    { title: 'Leo and the Golden Tree', grade: 'Grade 2', status: 'upcoming', dueDate: 'Jul 20', studentsCompleted: 0, totalStudents: 24 },
    { title: 'The Wind\'s Secret Song', grade: 'Grade 1', status: 'completed', dueDate: 'Completed Jul 12', studentsCompleted: 20, totalStudents: 20 },
    { title: 'Adventures in Starlight Meadow', grade: 'Grade 2', status: 'completed', dueDate: 'Completed Jul 10', studentsCompleted: 23, totalStudents: 24 },
  ];

  const filteredLessons = selectedTab === 'all' 
    ? lessons 
    : lessons.filter(l => l.status === selectedTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'On track': return 'var(--primary-accent)';
      case 'Needs attention': return 'var(--secondary-accent)';
      case 'Behind': return 'var(--danger-color)';
      default: return 'var(--text-muted)';
    }
  };

  const getLessonStatusStyle = (status) => {
    switch (status) {
      case 'active': return { bg: 'var(--soft-accent-bg)', color: 'var(--primary-accent)', label: 'Active' };
      case 'upcoming': return { bg: '#FAF2DF', color: 'var(--secondary-accent)', label: 'Upcoming' };
      case 'completed': return { bg: '#F2F2F2', color: 'var(--text-muted)', label: 'Done' };
      default: return { bg: 'var(--bg-color)', color: 'var(--text-muted)', label: status };
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="teacher" />

      <main className="dashboard-content">
        {/* Top Bar */}
        <header className="dashboard-top-nav">
          <div className="top-nav-left">
            <h2 className="serif-heading dashboard-welcome">Good morning, Ms. Rivera</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Wednesday, July 16 · 3 classes today</p>
          </div>
          <div className="top-nav-right">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search students..." />
            </div>
            <button className="top-nav-btn bell-btn" title="Notifications">
              <FaBell />
              <span className="bell-badge"></span>
            </button>
            <div className="teacher-profile-avatar">MR</div>
          </div>
        </header>

        {/* Welcome Banner */}
        <section className="teacher-welcome-banner">
          <div className="welcome-banner-left">
            <h3>Weekly Teaching Progress</h3>
            <p className="text-muted">You've completed <strong>78%</strong> of this week's lesson assignments. Keep up the great work!</p>
          </div>
          <div className="welcome-banner-right">
            <div className="progress-ring-container">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--border-color)" strokeWidth="6" />
                <circle 
                  cx="36" cy="36" r="30" fill="none" 
                  stroke="var(--primary-accent)" strokeWidth="6" 
                  strokeLinecap="round"
                  strokeDasharray={`${0.78 * 2 * Math.PI * 30} ${2 * Math.PI * 30}`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
                <text x="36" y="38" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-primary)">78%</text>
              </svg>
            </div>
          </div>
        </section>

        {/* Two-column layout: Students + Donut */}
        <section className="teacher-two-col">
          {/* Students List */}
          <div className="card students-list-card">
            <div className="students-header">
              <h4>My Students</h4>
              <span className="pill pill-accent">{students.length} enrolled</span>
            </div>

            <div className="students-table">
              {students.map((student, idx) => (
                <div key={idx} className="student-row">
                  <div className="student-info">
                    <div 
                      className="student-avatar" 
                      style={{ backgroundColor: idx % 2 === 0 ? 'var(--soft-accent-bg)' : '#FAF2DF' }}
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
                      backgroundColor: `${getStatusColor(student.status)}15`,
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
            <h4>Lesson Assignments</h4>
            <div className="lessons-tabs">
              {['all', 'active', 'upcoming', 'completed'].map(tab => (
                <button
                  key={tab}
                  className={`lesson-tab ${selectedTab === tab ? 'active' : ''}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="lessons-list">
            {filteredLessons.map((lesson, idx) => {
              const statusStyle = getLessonStatusStyle(lesson.status);
              const pct = Math.round((lesson.studentsCompleted / lesson.totalStudents) * 100);
              
              return (
                <div key={idx} className="card lesson-card">
                  <div className="lesson-icon-col">
                    <FaBookOpen />
                  </div>
                  <div className="lesson-info-col">
                    <h5 className="lesson-title">{lesson.title}</h5>
                    <span className="lesson-grade text-muted">{lesson.grade} · {lesson.dueDate}</span>
                  </div>
                  <div className="lesson-progress-col">
                    <div className="lesson-progress-track">
                      <div className="lesson-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="lesson-progress-text text-muted">{lesson.studentsCompleted}/{lesson.totalStudents}</span>
                  </div>
                  <span 
                    className="lesson-status-badge"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                  >
                    {statusStyle.label}
                  </span>
                  <button className="lesson-action-btn">
                    <FaChevronRight />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
