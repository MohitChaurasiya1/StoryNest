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
          width: 280px;
          background-color: #FFFFFF;
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          border-right: 2px solid var(--border-color);
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }

        .sidebar-header {
          padding: 2rem 1.5rem 1.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-bottom: 2px solid var(--border-color);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
        }

        .logo-sparkle {
          color: var(--coral);
          font-size: 1.35rem;
        }

        .role-badge {
          align-self: flex-start;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          background: linear-gradient(135deg, var(--coral-light), var(--pink-light));
          color: var(--coral);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-section-header {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          font-weight: 800;
          padding: 1rem 0.75rem 0.25rem 0.75rem;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-secondary);
          transition: var(--transition-bounce);
          text-decoration: none;
          border: 1.5px solid transparent;
        }

        .sidebar-nav-item:hover {
          color: var(--coral);
          background-color: var(--coral-light);
          transform: translateX(4px);
        }

        .sidebar-nav-item.active {
          color: #FFFFFF;
          background: linear-gradient(135deg, var(--coral), var(--pink));
          font-weight: 800;
          box-shadow: var(--shadow-glow-coral);
          transform: scale(1.02);
        }

        .nav-item-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 1.25rem 1rem;
          border-top: 2px solid var(--border-color);
        }

        .back-home {
          background-color: var(--bg-color);
          border: 1.5px solid var(--border-color);
        }

        .back-home:hover {
          background-color: var(--danger-light) !important;
          border-color: var(--danger-color) !important;
          color: var(--danger-color) !important;
        }

        @media (max-width: 768px) {
          .sidebar-container {
            width: 100%;
            min-height: auto;
            border-right: none;
            border-bottom: 2px solid var(--border-color);
          }
          .sidebar-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: none;
          }
          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
            padding: 0.5rem 1rem 1rem 1rem;
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
