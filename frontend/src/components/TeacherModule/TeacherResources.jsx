import { useState } from "react";
import { FaBook, FaDownload, FaVideo, FaFilePdf } from "react-icons/fa";

function TeacherResources() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <FaBook className="text-blue-500" /> Teaching Resources
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Access curriculum guides, printable worksheets, and training materials.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors cursor-pointer group">
            <FaFilePdf className="text-4xl text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Grade 2 Curriculum Guide</h3>
            <p className="text-sm text-slate-500 mb-4">Complete syllabus and story alignment for the current academic year.</p>
            <button className="text-blue-600 font-semibold flex items-center gap-2"><FaDownload /> Download</button>
          </div>
          
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors cursor-pointer group">
            <FaFilePdf className="text-4xl text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Vocabulary Worksheets</h3>
            <p className="text-sm text-slate-500 mb-4">Printable dual-language vocabulary exercises for in-class activities.</p>
            <button className="text-blue-600 font-semibold flex items-center gap-2"><FaDownload /> Download</button>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors cursor-pointer group">
            <FaVideo className="text-4xl text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Platform Training</h3>
            <p className="text-sm text-slate-500 mb-4">Video tutorials on how to maximize AI Insights and reporting tools.</p>
            <button className="text-blue-600 font-semibold flex items-center gap-2">Watch Now →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherResources;
