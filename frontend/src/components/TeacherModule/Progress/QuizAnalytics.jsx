import React from 'react';
import { FiAward } from 'react-icons/fi';

const QuizAnalytics = ({ data }) => {
  if (!data) return null;

  const dist = data.distribution || {};
  const total = (dist.score_90_100 || 0) + (dist.score_80_89 || 0) + (dist.score_70_79 || 0) + (dist.below_70 || 0);

  const getPct = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quiz Performance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Comprehension score distribution & stats</p>
        </div>
        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
          <FiAward className="h-5 w-5" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Average</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
            {data.average_score || 0}%
          </span>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Highest</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {data.highest_score || 0}%
          </span>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Quizzes Taken</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {data.completed || 0}
          </span>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Score Range Distribution
        </h4>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-slate-700 dark:text-slate-300">90 – 100% (Excellent)</span>
            <span className="text-slate-500">{dist.score_90_100 || 0} ({getPct(dist.score_90_100)}%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${getPct(dist.score_90_100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-slate-700 dark:text-slate-300">80 – 89% (Good)</span>
            <span className="text-slate-500">{dist.score_80_89 || 0} ({getPct(dist.score_80_89)}%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${getPct(dist.score_80_89)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-slate-700 dark:text-slate-300">70 – 79% (Average)</span>
            <span className="text-slate-500">{dist.score_70_79 || 0} ({getPct(dist.score_70_79)}%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${getPct(dist.score_70_79)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-slate-700 dark:text-slate-300">Below 70% (Needs Help)</span>
            <span className="text-slate-500">{dist.below_70 || 0} ({getPct(dist.below_70)}%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
            <div className="bg-rose-500 h-2 rounded-full transition-all duration-500" style={{ width: `${getPct(dist.below_70)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;
