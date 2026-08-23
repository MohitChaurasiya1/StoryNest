import React from 'react';
import { FaUsers, FaChartLine, FaBookOpen } from 'react-icons/fa';

const ClassroomOverview = ({ classroom, onTabChange }) => {
  const stats = classroom.stats || {
    student_count: 0,
    average_progress: 0,
    average_reading: 0,
    active_readers: 0
  };

  return (
    <div className="grid-3 animate-fade-in">
      {/* Metric Cards */}
      <div className="card text-center flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-[var(--purple-light)] text-[var(--purple)] flex items-center justify-center mb-4">
          <FaUsers size={28} />
        </div>
        <h3 className="text-4xl font-bold text-[var(--text-primary)] mb-1">{stats.student_count}</h3>
        <p className="font-bold text-muted uppercase tracking-wider text-sm">Active Students</p>
        
        {stats.student_count === 0 && (
          <button 
            className="btn btn-outline mt-6"
            onClick={() => onTabChange('students')}
          >
            Add Students
          </button>
        )}
      </div>

      <div className="card text-center flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-[var(--mint-light)] text-[var(--mint)] flex items-center justify-center mb-4">
          <FaChartLine size={28} />
        </div>
        <h3 className="text-4xl font-bold text-[var(--text-primary)] mb-1">{stats.average_progress}%</h3>
        <p className="font-bold text-muted uppercase tracking-wider text-sm">Avg. Quiz Score</p>
      </div>

      <div className="card text-center flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-[var(--coral-light)] text-[var(--coral)] flex items-center justify-center mb-4">
          <FaBookOpen size={28} />
        </div>
        <h3 className="text-4xl font-bold text-[var(--text-primary)] mb-1">{stats.active_readers}</h3>
        <p className="font-bold text-muted uppercase tracking-wider text-sm">Read This Week</p>
      </div>

      {/* Description / Info Card */}
      <div className="card col-span-full mt-4">
        <h3 className="font-bold text-lg mb-4 border-b border-[var(--border-color)] pb-3">Classroom Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold text-muted uppercase mb-1">Description</p>
            <p>{classroom.description || "No description provided."}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-muted uppercase mb-1">Subject</p>
            <p className="font-bold">{classroom.subject}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomOverview;
