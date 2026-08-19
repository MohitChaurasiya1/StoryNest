import { useState } from "react";
import { FaUsers, FaBalanceScale } from "react-icons/fa";

function TeacherComparison() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <FaUsers className="text-blue-500" /> Student Comparison
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Compare reading metrics across individual students or entire classrooms.</p>
        
        <div className="mt-8 text-center py-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <FaBalanceScale className="mx-auto text-4xl text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Select Students to Compare</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Select up to 4 students to view a side-by-side comparison of their reading levels, quiz scores, and vocabulary retention.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherComparison;
