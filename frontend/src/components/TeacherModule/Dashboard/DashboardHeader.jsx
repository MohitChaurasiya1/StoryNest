import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const DashboardHeader = ({ teacherName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString(undefined, options);

  return (
    <header className="parent-header parent-hero-card">
      <div className="parent-header-left">
        <h2 className="serif-heading text-white">
          {getGreeting()}, {teacherName} <span className="animate-wiggle inline-block origin-bottom-right">👋</span>
        </h2>
        <p className="text-white/85 mt-2" style={{ fontSize: '0.95rem' }}>
          Your classroom, your stories, your impact. Manage learning experiences and track how your students are growing today.
        </p>
      </div>
      <div className="parent-header-right">
        <div className="hidden sm:block text-sm font-bold text-white/90 bg-white/20 px-4 py-2 rounded-full border border-white/30 shadow-sm backdrop-blur-sm">
          {today}
        </div>
        <Link to="/teacher/assignments/new" className="btn btn-primary btn-header-create">
          <FaPlus /> Create Assignment
        </Link>
      </div>
    </header>
  );
};

export default DashboardHeader;
