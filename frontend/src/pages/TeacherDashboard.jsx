import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DonutChart from '../components/DonutChart';
import { 
  FaSearch, 
  FaBell, 
  FaCheckCircle, 
  FaClock, 
  FaChevronRight,
  FaBookOpen,
  FaStar
} from 'react-icons/fa';

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

          {/* Donut Chart Card */}
          <div className="donut-chart-col">
            <DonutChart />
          </div>
        </section>

        {/* Assigned Lessons */}
        <section className="lessons-section">
          <div className="lessons-header">
            <h4>Assigned Lessons</h4>
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
              return (
                <div key={idx} className="card lesson-card">
                  <div className="lesson-icon-col">
                    <FaBookOpen style={{ color: 'var(--primary-accent)', fontSize: '1.25rem' }} />
                  </div>
                  <div className="lesson-info-col">
                    <h5 className="lesson-title">{lesson.title}</h5>
                    <span className="lesson-grade text-muted">{lesson.grade} · {lesson.dueDate}</span>
                  </div>
                  <div className="lesson-progress-col">
                    <div className="lesson-progress-track">
                      <div 
                        className="lesson-progress-fill"
                        style={{ width: `${(lesson.studentsCompleted / lesson.totalStudents) * 100}%` }}
                      />
                    </div>
                    <span className="lesson-progress-text text-muted">
                      {lesson.studentsCompleted}/{lesson.totalStudents}
                    </span>
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

      <style>{`
        .dashboard-top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .dashboard-welcome {
          font-size: 1.75rem;
        }

        .top-nav-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .search-bar {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .search-bar input {
          padding: 0.5rem 1rem 0.5rem 2.25rem;
          border: 1px solid var(--border-color);
          border-radius: 9999px;
          background-color: var(--surface-color);
          font-size: 0.85rem;
          width: 200px;
          transition: var(--transition-fast);
        }

        .search-bar input:focus {
          outline: none;
          border-color: var(--primary-accent);
          width: 240px;
        }

        .bell-btn {
          position: relative;
          padding: 0.5rem;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background-color: var(--surface-color);
          color: var(--text-primary);
          cursor: pointer;
        }

        .bell-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 8px;
          height: 8px;
          background-color: var(--secondary-accent);
          border-radius: 50%;
          border: 1.5px solid #FFFFFF;
        }

        .teacher-profile-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: var(--primary-accent);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Welcome Banner */
        .teacher-welcome-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--soft-accent-bg);
          border: 1px solid rgba(61, 92, 52, 0.1);
          border-radius: var(--radius-md);
          padding: 1.75rem 2rem;
          margin-bottom: 2rem;
        }

        .welcome-banner-left h3 {
          font-size: 1.15rem;
          margin-bottom: 0.25rem;
        }

        .welcome-banner-left p {
          font-size: 0.9rem;
        }

        .progress-ring-container svg {
          display: block;
        }

        /* Two column layout */
        .teacher-two-col {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        /* Students List */
        .students-list-card {
          padding: 1.5rem;
        }

        .students-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .students-header h4 {
          font-size: 1.1rem;
        }

        .students-table {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .student-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
        }

        .student-row:hover {
          background-color: var(--bg-color);
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 180px;
        }

        .student-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
          flex-shrink: 0;
        }

        .student-name-group {
          display: flex;
          flex-direction: column;
        }

        .student-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .student-stories {
          font-size: 0.75rem;
        }

        .student-progress-section {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .progress-bar-track {
          flex: 1;
          height: 6px;
          background-color: var(--bg-color);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 1s ease-out;
        }

        .student-pct {
          font-size: 0.85rem;
          font-weight: 700;
          min-width: 40px;
          text-align: right;
        }

        .student-status-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
          white-space: nowrap;
        }

        .donut-chart-col {
          display: flex;
        }

        /* Lessons Section */
        .lessons-section {
          margin-bottom: 2rem;
        }

        .lessons-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .lessons-header h4 {
          font-size: 1.1rem;
        }

        .lessons-tabs {
          display: flex;
          gap: 0.25rem;
          background-color: var(--bg-color);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .lesson-tab {
          padding: 0.4rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: 6px;
          transition: var(--transition-fast);
        }

        .lesson-tab:hover {
          color: var(--text-primary);
        }

        .lesson-tab.active {
          background-color: var(--surface-color);
          color: var(--primary-accent);
          box-shadow: var(--shadow-sm);
        }

        .lessons-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .lesson-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }

        .lesson-card:hover {
          transform: translateX(2px);
        }

        .lesson-icon-col {
          width: 40px;
          height: 40px;
          background-color: var(--soft-accent-bg);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .lesson-info-col {
          flex: 1;
        }

        .lesson-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.1rem;
        }

        .lesson-grade {
          font-size: 0.8rem;
        }

        .lesson-progress-col {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 140px;
        }

        .lesson-progress-track {
          flex: 1;
          height: 5px;
          background-color: var(--bg-color);
          border-radius: 9999px;
          overflow: hidden;
        }

        .lesson-progress-fill {
          height: 100%;
          background-color: var(--primary-accent);
          border-radius: 9999px;
          transition: width 0.8s ease-out;
        }

        .lesson-progress-text {
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 30px;
        }

        .lesson-status-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
          white-space: nowrap;
        }

        .lesson-action-btn {
          color: var(--text-muted);
          padding: 0.25rem;
          transition: var(--transition-fast);
        }

        .lesson-action-btn:hover {
          color: var(--primary-accent);
        }

        @media (max-width: 1024px) {
          .teacher-two-col {
            grid-template-columns: 1fr;
          }
          .lessons-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .student-status-pill {
            display: none;
          }
          .lesson-progress-col {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
