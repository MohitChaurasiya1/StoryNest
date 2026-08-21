import React, { useRef, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  FaHome,
  FaSignOutAlt,
  FaUsers,
  FaHistory,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const { activeChild, logout, user } = useAuth();
  const childName = activeChild?.name || 'Child';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar_scroll_pos");
    if (navRef.current) {
      if (savedScroll !== null) {
        navRef.current.scrollTop = Number(savedScroll);
      } else {
        const activeEl = navRef.current.querySelector('.active');
        if (activeEl) {
          activeEl.scrollIntoView({ block: 'nearest' });
        }
      }
    }
  }, [location.pathname]);

  const handleNavScroll = (e) => {
    sessionStorage.setItem("sidebar_scroll_pos", e.target.scrollTop);
  };
  
  const getSidebarLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { type: 'link', label: 'Dashboard', path: '/admin', icon: FaChartLine },
          { type: 'link', label: 'User Directory', path: '/admin/users', icon: FaUsers },
          { type: 'link', label: 'Audit Logs', path: '/admin/audit', icon: FaHistory },
          { type: 'link', label: 'Analytics', path: '/admin/overview', icon: FaChartLine },
        ];
      case 'teacher':
        return [
          { type: 'link', label: 'Dashboard', path: '/teacher', icon: FaChartLine },
          { type: 'link', label: 'Analysis', path: '/teacher/analysis', icon: FaChartLine },
          { type: 'link', label: 'Inbox', path: '/teacher/inbox', icon: FaInbox },
          { type: 'link', label: 'Lessons', path: '/teacher/lessons', icon: FaBook },
          { type: 'link', label: 'Students', path: '/teacher/students', icon: FaUserGraduate },
          { type: 'link', label: 'Settings', path: '/teacher/settings', icon: FaCog },
        ];
      case 'parent':
        return [
          { type: 'link', label: 'Dashboard', path: '/parent', icon: FaChartLine },
          { type: 'link', label: 'All Children', path: '/parent/children', icon: FaUserGraduate },
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

      <nav ref={navRef} onScroll={handleNavScroll} className="sidebar-nav">
        {links.map((item, idx) => {
          if (item.type === 'header') {
            return (
              <div key={idx} className="sidebar-section-header">
                {item.label}
              </div>
            );
          }
          
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (location.hash && location.pathname + location.hash === item.path);
          
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
        <button 
          onClick={handleLogout} 
          className="sidebar-nav-item logout-btn text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full text-left cursor-pointer border-none bg-transparent"
        >
          <FaSignOutAlt className="nav-item-icon text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
