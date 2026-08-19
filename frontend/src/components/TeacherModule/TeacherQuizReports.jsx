import { useState } from "react";
import { FaQuestionCircle, FaTrophy, FaChartBar, FaChevronDown } from "react-icons/fa";

function TeacherQuizReports() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <FaQuestionCircle className="text-blue-500" /> Quiz & Assessment Reports
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Review class performance on story quizzes and assessments.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg text-amber-600 dark:text-amber-400">
                <FaTrophy />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Quizzes Completed</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">156</p>
            <p className="text-sm text-amber-600 mt-1">This month</p>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                <FaChartBar />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Average Score</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">82%</p>
            <p className="text-sm text-green-600 mt-1">Class average</p>
          </div>
          
          <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-100 dark:bg-rose-800/50 rounded-lg text-rose-600 dark:text-rose-400">
                <FaQuestionCircle />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">Struggling Topics</h3>
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white mt-2">Moral Inference</p>
            <p className="text-sm text-slate-500 mt-1">Needs review</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Quiz Results</h3>
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
            All Classes <FaChevronDown className="text-xs" />
          </button>
        </div>
        
        <div className="text-center py-12 text-slate-500">
          Recent quiz attempt details and item analysis will appear here.
        </div>
      </div>
    </div>
  );
}

export default TeacherQuizReports;
