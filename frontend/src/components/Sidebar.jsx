import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaMagic, 
  FaChartLine, 
  FaCalendarAlt, 
  FaUserGraduate, 
  FaBook, 
  FaChalkboardTeacher, 
  FaInbox, 
  FaCog, 
  FaUser, 
  FaArrowLeft,
  FaHome
} from 'react-icons/fa';

export default function Sidebar({ role }) {
  const location = useLocation();
  
  const getSidebarLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { type: 'link', label: 'Dashboard', path: '/admin', icon: FaChartLine },
          { type: 'link', label: 'Analytics', path: '/admin#analytics', icon: FaChartLine },
          { type: 'link', label: 'Calendar', path: '/admin#calendar', icon: FaCalendarAlt },
          { type: 'header', label: 'Management' },
          { type: 'link', label: 'Students', path: '/admin#students', icon: FaUserGraduate },
          { type: 'link', label: 'Stories Library', path: '/admin#stories', icon: FaBook },
          { type: 'link', label: 'Teachers', path: '/admin#teachers', icon: FaChalkboardTeacher },
        ];
      case 'teacher':
        return [
          { type: 'link', label: 'Dashboard', path: '/teacher', icon: FaChartLine },
          { type: 'link', label: 'Analysis', path: '/teacher#analysis', icon: FaChartLine },
          { type: 'link', label: 'Inbox', path: '/teacher#inbox', icon: FaInbox },
          { type: 'link', label: 'Lessons', path: '/teacher#lessons', icon: FaBook },
          { type: 'link', label: 'Settings', path: '/teacher#settings', icon: FaCog },
        ];
      case 'parent':
        return [
          { type: 'link', label: 'Dashboard', path: '/parent', icon: FaChartLine },
          { type: 'link', label: 'Leo\'s Profile', path: '/parent#profile', icon: FaUser },
          { type: 'link', label: 'Reading Logs', path: '/parent#logs', icon: FaBook },
          { type: 'link', label: 'Story Library', path: '/parent#library', icon: FaBook },
          { type: 'link', label: 'Insights', path: '/parent#insights', icon: FaMagic },
        ];
      default:
        return [];
    }
  };

  const links = getSidebarLinks();

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <FaMagic className="logo-sparkle animate-float" />
          <span>StoryNest</span>
        </Link>
        <span className="role-badge">{role}</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((item, idx) => {
          if (item.type === 'header') {
            return (
              <div key={idx} className="sidebar-section-header">
                {item.label}
              </div>
            );
          }
          
          const Icon = item.icon;
          const isActive = location.pathname === item.path && !location.hash || location.pathname + location.hash === item.path;
          
          return (
            <Link 
              key={idx} 
              to={item.path} 
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-item-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="sidebar-nav-item back-home">
          <FaHome className="nav-item-icon" />
          <span>Back to Landing</span>
        </Link>
      </div>

      <style>{`
        .sidebar-container {
          width: 260px;
          background-color: var(--sidebar-bg);
          color: var(--sidebar-text);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          border-right: 1px solid rgba(239, 231, 211, 0.1);
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(239, 231, 211, 0.05);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: #FFFFFF;
          text-decoration: none;
        }

        .logo-sparkle {
          color: var(--story-gold);
          font-size: 1.25rem;
        }

        .role-badge {
          align-self: flex-start;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          background-color: rgba(228, 238, 219, 0.15);
          color: var(--sidebar-text);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .sidebar-section-header {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(217, 226, 206, 0.4);
          font-weight: 700;
          padding: 1rem 0.5rem 0.5rem 0.5rem;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--sidebar-text);
          transition: var(--transition-fast);
          text-decoration: none;
        }

        .sidebar-nav-item:hover {
          color: var(--sidebar-text-hover);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .sidebar-nav-item.active {
          color: #FFFFFF;
          background-color: var(--sidebar-active-bg);
          font-weight: 600;
        }

        .nav-item-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(239, 231, 211, 0.05);
        }

        .back-home {
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .back-home:hover {
          opacity: 1;
          background-color: rgba(180, 82, 82, 0.1) !important;
          color: #ff9b9b !important;
        }

        @media (max-width: 768px) {
          .sidebar-container {
            width: 100%;
            min-height: auto;
          }
          .sidebar-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
          }
          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
            padding: 0.75rem 1rem;
            gap: 0.5rem;
          }
          .sidebar-section-header {
            display: none;
          }
          .sidebar-footer {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
