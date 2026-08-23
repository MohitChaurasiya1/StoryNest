import React from 'react';
import { FiCalendar as Calendar, FiCheckCircle as CheckCircle2 } from 'react-icons/fi';

const UpcomingAssignments = ({ assignments = [] }) => {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Upcoming Assignments</h2>
        <div className="empty-card" style={{ padding: '2rem' }}>
          <p className="text-muted mb-3">No assignments yet.</p>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Create Assignment
          </button>
        </div>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Overdue': return 'bg-[var(--danger-light)] text-[var(--danger-color)]';
      case 'Due Today': return 'bg-[var(--sunshine-light)] text-[#D97706]';
      case 'Ongoing': return 'bg-[var(--sky-light)] text-[var(--sky)]';
      default: return 'bg-[var(--bg-color)] text-[var(--text-muted)]';
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-4">Upcoming Assignments</h2>
      <div className="flex flex-col gap-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="p-4 rounded-[var(--radius-sm)] border border-[var(--border-color)]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold">{assignment.title}</h3>
              <span className={`pill ${getStatusClass(assignment.status)}`} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                {assignment.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted mb-4">
              <span className="flex items-center gap-1 font-bold">
                <Calendar size={14} />
                {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)]"></span>
              <span className="font-bold">{assignment.classroom_name}</span>
            </div>
            
            <div>
              <div className="flex justify-between text-xs font-bold text-muted mb-1.5">
                <span>Progress</span>
                <span>{assignment.completed_count} / {assignment.total_count} completed</span>
              </div>
              <div className="h-2 w-full bg-[var(--border-color)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--coral)] rounded-full transition-all duration-500" 
                  style={{ width: `${assignment.completion_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingAssignments;
