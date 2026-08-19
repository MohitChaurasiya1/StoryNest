import { useState, useEffect } from "react";
import { FaChartLine, FaBookReader, FaStar, FaChevronDown } from "react-icons/fa";

function TeacherReadingProgress() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <FaChartLine className="text-blue-500" /> Reading Progress
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Track and analyze reading metrics across your classrooms.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-400">
                <FaBookReader />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Total Books Read</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">428</p>
            <p className="text-sm text-green-600 mt-1">+12% from last week</p>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FaChartLine />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Avg Reading Time</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">24m / day</p>
            <p className="text-sm text-green-600 mt-1">+5% from last week</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg text-purple-600 dark:text-purple-400">
                <FaStar />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Comprehension</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">84%</p>
            <p className="text-sm text-slate-500 mt-1">Class average</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Student Leaderboard</h3>
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
            Grade 2 <FaChevronDown className="text-xs" />
          </button>
        </div>
        
        <div className="text-center py-12 text-slate-500">
          Analytics charts and leaderboard details will be populated here.
        </div>
      </div>
    </div>
  );
}

export default TeacherReadingProgress;
