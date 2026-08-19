import { useState } from "react";
import { FaTasks, FaPlus, FaCheckCircle, FaClock } from "react-icons/fa";

function TeacherAssignments() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
            <FaTasks className="text-blue-500" /> Homework & Assignments
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Track homework completion, due dates, and grade assignments.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition font-medium whitespace-nowrap">
          <FaPlus /> New Assignment
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Active Assignments</h3>
        <div className="text-center py-16 text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <FaTasks className="mx-auto text-4xl text-slate-300 dark:text-slate-600 mb-4" />
          <p className="max-w-md mx-auto">
            You don't have any active assignments right now. Create a new assignment to track student progress.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherAssignments;
