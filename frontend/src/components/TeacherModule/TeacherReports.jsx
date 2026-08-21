import { useState } from "react";
import { FaFileDownload, FaFilePdf, FaFileCsv } from "react-icons/fa";

function TeacherReports() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <FaFileDownload className="text-blue-500" /> Export Reports
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Generate and download comprehensive performance reports for your classrooms.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors cursor-pointer group">
            <FaFilePdf className="text-4xl text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Term Progress Report (PDF)</h3>
            <p className="text-sm text-slate-500 mb-4">A structured, printable report detailing reading levels, quiz scores, and teacher notes for parents.</p>
            <button className="text-blue-600 font-semibold">Generate PDF →</button>
          </div>
          
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors cursor-pointer group">
            <FaFileCsv className="text-4xl text-green-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Raw Data Export (CSV)</h3>
            <p className="text-sm text-slate-500 mb-4">Export all reading logs and quiz attempt data for use in custom spreadsheet analysis.</p>
            <button className="text-blue-600 font-semibold">Download CSV →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherReports;
