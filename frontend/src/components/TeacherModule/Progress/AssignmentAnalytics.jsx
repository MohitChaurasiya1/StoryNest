import React from 'react';
import { FiCheckSquare, FiAlertCircle } from 'react-icons/fi';

const AssignmentAnalytics = ({ data }) => {
  if (!data) return null;

  const { assigned = 0, completed = 0, in_progress = 0, not_started = 0, overdue = 0, completion_percentage = 0 } = data;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assignment Completion</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Classroom assignment progress and overdue tasks</p>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <FiCheckSquare className="h-5 w-5" />
        </div>
      </div>

      {/* Main Bar Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{completion_percentage}%</span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {completed} of {assigned} completed
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden flex">
          <div className="bg-emerald-500 h-4 transition-all duration-500" style={{ width: `${assigned > 0 ? (completed / assigned) * 100 : 0}%` }} />
          <div className="bg-amber-400 h-4 transition-all duration-500" style={{ width: `${assigned > 0 ? (in_progress / assigned) * 100 : 0}%` }} />
          <div className="bg-rose-500 h-4 transition-all duration-500" style={{ width: `${assigned > 0 ? (overdue / assigned) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Detail Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Completed</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{completed}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">In Progress</span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{in_progress}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Not Started</span>
          <span className="text-lg font-bold text-slate-600 dark:text-slate-300">{not_started}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block flex items-center gap-1">
            <FiAlertCircle className="text-rose-500" /> Overdue
          </span>
          <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{overdue}</span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentAnalytics;
