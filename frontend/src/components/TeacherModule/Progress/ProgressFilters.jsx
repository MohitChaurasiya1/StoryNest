import React from 'react';

const ProgressFilters = ({ classrooms, selectedClassroom, onSelectClassroom, timePeriod, onSelectTimePeriod }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Classroom
        </label>
        <select
          value={selectedClassroom || ''}
          onChange={(e) => onSelectClassroom(e.target.value ? parseInt(e.target.value) : null)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
        >
          <option value="">All Classrooms</option>
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.student_count || 0} students)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Time Period
        </label>
        <select
          value={timePeriod}
          onChange={(e) => onSelectTimePeriod(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="term">This Term (90 Days)</option>
        </select>
      </div>
    </div>
  );
};

export default ProgressFilters;
