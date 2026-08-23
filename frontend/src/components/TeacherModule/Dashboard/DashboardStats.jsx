import React from 'react';
import { FiUsers as Users, FiBook as GraduationCap, FiClock as Clock, FiTrendingUp as TrendingUp } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="card parent-stat-card">
    <div className={`p-stat-icon ${colorClass}`}>
      <Icon />
    </div>
    <div className="p-stat-info">
      <span className="p-stat-value">{value}</span>
      <span className="p-stat-label text-muted">{title}</span>
    </div>
  </div>
);

const DashboardStats = ({ summary }) => {
  return (
    <div className="parent-stats-row mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      <StatCard 
        title="Active Classrooms" 
        value={summary.classrooms} 
        icon={GraduationCap} 
        colorClass="bg-[#E0F4FE] text-[#6BCBF5] dark:bg-[#1A3A4A] dark:text-[#6BCBF5]" // Sky
      />
      <StatCard 
        title="Total Students" 
        value={summary.students} 
        icon={Users} 
        colorClass="bg-[#EDE9FE] text-[#A78BFA] dark:bg-[#2D2550] dark:text-[#A78BFA]" // Purple
      />
      <StatCard 
        title="Pending Assignments" 
        value={summary.pending_assignments} 
        icon={Clock} 
        colorClass="time-icon" // Uses sunshine-light & D97706 from ParentDashboard.css
      />
      <StatCard 
        title="Avg. Progress" 
        value={`${summary.average_progress}%`} 
        icon={TrendingUp} 
        colorClass="bg-[#DFFBE6] text-[#6BCB77] dark:bg-[#1A3A2A] dark:text-[#6BCB77]" // Mint
      />
    </div>
  );
};

export default DashboardStats;
