import { useState } from "react";
import { FaBell, FaCheckDouble } from "react-icons/fa";

function TeacherNotifications() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
            <FaBell className="text-blue-500" /> Notifications
          </h2>
          <p className="text-slate-500 dark:text-slate-400">View recent alerts, system updates, and messages from parents.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-xl transition font-medium whitespace-nowrap">
          <FaCheckDouble /> Mark All as Read
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="text-center py-16 text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <FaBell className="mx-auto text-4xl text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">You're all caught up!</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            You have no new notifications right now. Check back later for updates.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherNotifications;
