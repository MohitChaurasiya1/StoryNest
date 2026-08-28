import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiArrowRight } from 'react-icons/fi';

const NeedsAttention = ({ items }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FiAlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Needs Attention</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Great news! All students are currently on track with healthy reading activity and assignment completion.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">🔴 High Risk</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">🟠 Medium Alert</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">🟡 Low Concern</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
            <FiAlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Needs Attention ({items.length})</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Students requiring intervention or support</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.student_id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{item.avatar || '🧑‍🎓'}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.student_name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.classroom_name}</span>
                  </div>
                </div>
                {getSeverityBadge(item.severity)}
              </div>

              <ul className="space-y-1 mb-4">
                {item.reasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => navigate(`/teacher/progress/students/${item.student_id}`)}
              className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center justify-center gap-1"
            >
              View Student Progress <FiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NeedsAttention;
