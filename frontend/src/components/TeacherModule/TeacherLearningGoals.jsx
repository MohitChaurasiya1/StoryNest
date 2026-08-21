import { useState } from "react";
import { FaBullseye, FaPlus, FaCheckCircle, FaUserGraduate } from "react-icons/fa";

function TeacherLearningGoals() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FaBullseye className="text-blue-500" /> Learning Goals
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Set and track academic objectives for your classrooms and individual students.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition font-medium whitespace-nowrap">
          <FaPlus /> Create Goal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FaUserGraduate className="text-indigo-500" /> Classroom Goals
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 dark:text-white">Master 50 New Vocabulary Words</h4>
                <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">In Progress</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">Grade 2 · Target: End of Month</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 dark:text-white">Improve Reading Fluency</h4>
                <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">Completed</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">Grade 3 · Target: Q1</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-blue-500" /> Individual Goals
          </h3>
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            Individual student goals will appear here.
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLearningGoals;
