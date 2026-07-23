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
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ role }) {
  const location = useLocation();
  const { activeChild } = useAuth();
  const childName = activeChild?.name || 'Child';
  
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
          { type: 'link', label: `${childName}'s Profile`, path: '/parent#profile', icon: FaUser },
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
    </aside>
  );
}
