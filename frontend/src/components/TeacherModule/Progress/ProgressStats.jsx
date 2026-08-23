import React from 'react';
import { FiUsers, FiTrendingUp, FiCheckSquare, FiAward, FiBookOpen } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, subtext, color }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`p-2.5 rounded-xl ${colorStyles[color] || colorStyles.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>
        {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

const ProgressStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <StatCard
        icon={FiUsers}
        label="Students"
        value={stats.total_students || 0}
        subtext="Enrolled across classrooms"
        color="indigo"
      />
      <StatCard
        icon={FiTrendingUp}
        label="Avg Progress"
        value={`${stats.average_progress || 0}%`}
        subtext="Overall completion"
        color="emerald"
      />
      <StatCard
        icon={FiAward}
        label="Quiz Average"
        value={`${stats.quiz_average || 0}%`}
        subtext="Comprehension score"
        color="amber"
      />
      <StatCard
        icon={FiCheckSquare}
        label="Assignment Comp."
        value={`${stats.assignment_completion || 0}%`}
        subtext="Submitted tasks"
        color="blue"
      />
      <StatCard
        icon={FiBookOpen}
        label="Active Readers"
        value={`${stats.active_readers || 0} / ${stats.total_students || 0}`}
        subtext="Read in last 7 days"
        color="rose"
      />
    </div>
  );
};

export default ProgressStats;
