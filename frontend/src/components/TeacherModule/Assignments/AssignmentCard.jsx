import React from 'react';
import { FiBookOpen, FiHelpCircle, FiPlayCircle, FiUsers, FiCalendar, FiClock, FiCheckCircle, FiChevronRight } from 'react-icons/fi';

const AssignmentCard = ({ assignment, onClick }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'story': return FiBookOpen;
      case 'quiz': return FiHelpCircle;
      case 'lesson': return FiPlayCircle;
      default: return FiBookOpen;
    }
  };

  const Icon = getIcon(assignment.assignment_type);
  const stats = assignment.stats || {
    assigned: 0,
    completed: 0,
    pending: 0,
    in_progress: 0,
    not_started: 0,
    completion_percentage: 0,
    is_overdue: false,
    is_active: true
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateString);
    d.setHours(0, 0, 0, 0);

    if (d.getTime() === today.getTime()) {
      return 'Due Today';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = stats.is_overdue;

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-coral-300 dark:hover:border-coral-500/30 transition-all cursor-pointer group flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between"
    >
      <div className="flex items-start gap-4 flex-1">
        <div className="p-3.5 bg-gradient-to-br from-coral-50 to-orange-50 dark:from-coral-950/30 dark:to-orange-950/20 text-[#FF6B6B] rounded-2xl h-fit shadow-xs shrink-0 mt-0.5">
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-coral-50 text-[#FF6B6B] border border-coral-200/60 dark:bg-coral-900/20 dark:border-coral-800/40">
              {assignment.assignment_type}
            </span>
            {isOverdue && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                ⚠ Overdue
              </span>
            )}
            {stats.completion_percentage === 100 && stats.assigned > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                ✓ 100% Completed
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#FF6B6B] transition-colors truncate">
            {assignment.title}
          </h3>

          {assignment.content_title && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Content: <span className="font-semibold text-slate-700 dark:text-slate-300">{assignment.content_title}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <FiUsers className="w-3.5 h-3.5 text-[#FF6B6B]" />
              <span>{assignment.classroom_name || 'Classroom'}</span>
            </div>
            <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
              <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Due: {formatDate(assignment.due_date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Progress Column */}
      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end w-full lg:w-72 gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700/60">
        <div className="w-full">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Student Progress</span>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">{stats.completion_percentage}%</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.completion_percentage === 100 
                  ? 'bg-emerald-500' 
                  : isOverdue 
                    ? 'bg-amber-500' 
                    : 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53]'
              }`} 
              style={{ width: `${stats.completion_percentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            <span className="font-semibold">{stats.assigned} assigned</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.completed} completed</span>
            <span className="text-slate-400">{stats.pending} pending</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-[#FF6B6B] bg-coral-50 hover:bg-coral-100 dark:bg-coral-900/20 dark:hover:bg-coral-900/40 transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          View Details
          <FiChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AssignmentCard;
