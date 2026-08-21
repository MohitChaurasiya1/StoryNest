import { useState } from "react";
import { FaMedal, FaStar, FaChevronDown } from "react-icons/fa";

function TeacherAchievements() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <FaMedal className="text-blue-500" /> Student Achievements
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Track milestones and badges earned by your students.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-100 dark:border-yellow-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg text-yellow-600 dark:text-yellow-400">
                <FaStar />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Total Badges Awarded</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">842</p>
            <p className="text-sm text-yellow-600 mt-1">Across all classes</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Achievements</h3>
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
            All Classes <FaChevronDown className="text-xs" />
          </button>
        </div>
        
        <div className="text-center py-12 text-slate-500">
          Recent student achievements will appear here.
        </div>
      </div>
    </div>
  );
}

export default TeacherAchievements;
