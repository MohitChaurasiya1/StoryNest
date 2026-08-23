
import React from 'react';
import { FiBookOpen as BookOpen, FiHelpCircle as FileQuestion, FiPlayCircle as MonitorPlay, FiUsers as Users, FiCalendar as Calendar, FiMoreVertical as MoreVertical } from 'react-icons/fi';

const AssignmentCard = ({ assignment, onClick }) => {
  
  const getIcon = (type) => {
    switch (type) {
      case 'story': return BookOpen;
      case 'quiz': return FileQuestion;
      case 'lesson': return MonitorPlay;
      default: return BookOpen;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'archived': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const Icon = getIcon(assignment.assignment_type);
  const completionPercentage = assignment.stats ? assignment.stats.completion_percentage : 0;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
    >
      <div className="flex gap-4 flex-1">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl h-fit">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{assignment.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">
            {assignment.assignment_type} • {assignment.content_title || 'No Content'}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Users className="w-4 h-4 mr-1.5" />
              {assignment.classroom_name}
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 mr-1.5" />
              Due: {formatDate(assignment.due_date)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:items-end w-full md:w-64 gap-4">
        <div className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(assignment.status)}`}>
          {assignment.status}
        </div>
        
        {assignment.status === 'active' && assignment.stats && (
          <div className="w-full">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500 dark:text-slate-400">Progress</span>
              <span className="font-medium text-slate-900 dark:text-white">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
              {assignment.stats.completed} / {assignment.stats.assigned} completed
            </p>
          </div>
        )}
      </div>
      
      {/* Options button */}
      <button className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); /* TODO popup */ }}>
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AssignmentCard;
