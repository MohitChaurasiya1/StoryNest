import React from 'react';
import { FiBookOpen, FiClock, FiZap, FiCheckCircle } from 'react-icons/fi';

const ReadingAnalytics = ({ data }) => {
  if (!data) return null;

  const maxVal = Math.max(...(data.trend?.map((t) => t.progress) || [1]), 10);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reading Performance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Classroom engagement and time spent reading</p>
        </div>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <FiBookOpen className="h-5 w-5" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Stories Completed</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
            <FiCheckCircle className="text-emerald-500 h-4 w-4" /> {data.stories_completed || 0}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Reading Time</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
            <FiClock className="text-indigo-500 h-4 w-4" /> {data.reading_minutes || 0} min
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Avg Session</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
            <FiClock className="text-amber-500 h-4 w-4" /> {data.average_session_minutes || 0} min
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Avg Streak</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
            <FiZap className="text-rose-500 h-4 w-4" /> {data.average_streak || 0} days
          </span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Daily Reading Trend (Avg Minutes / Day)
        </h4>
        {data.trend && data.trend.length > 0 ? (
          <div className="flex items-end justify-between h-32 gap-2 pt-4">
            {data.trend.map((item, idx) => {
              const heightPct = Math.round((item.progress / maxVal) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full bg-indigo-100 dark:bg-indigo-950 rounded-t-lg h-24 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600"
                      style={{ height: `${Math.max(10, heightPct)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{item.date}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No trend data available for this time period.</p>
        )}
      </div>
    </div>
  );
};

export default ReadingAnalytics;
