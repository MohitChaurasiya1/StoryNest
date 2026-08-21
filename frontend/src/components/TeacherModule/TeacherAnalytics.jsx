import { useState } from "react";
import { FaChartLine, FaDownload, FaChevronDown } from "react-icons/fa";

function TeacherAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
            <FaChartLine className="text-blue-500" /> Advanced Analytics
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Deep dive into classroom performance metrics and long-term trends.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-xl transition font-medium whitespace-nowrap">
          <FaDownload /> Export Data
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="text-center py-16 text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          Detailed analytics charts (Reading speed, comprehension over time, vocabulary growth) will be rendered here.
        </div>
      </div>
    </div>
  );
}

export default TeacherAnalytics;
