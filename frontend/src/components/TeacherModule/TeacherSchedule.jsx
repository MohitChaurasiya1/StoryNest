import { useState } from "react";
import { FaCalendarAlt, FaPlus, FaClock } from "react-icons/fa";

function TeacherSchedule() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
            <FaCalendarAlt className="text-blue-500" /> Teaching Schedule
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your daily classes, meetings, and office hours.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition font-medium whitespace-nowrap">
          <FaPlus /> Add Event
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <FaClock className="mx-auto text-5xl text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Scheduled Events</h3>
          <p className="max-w-md mx-auto">
            Your calendar is clear for today! Add events to organize your teaching schedule.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherSchedule;
