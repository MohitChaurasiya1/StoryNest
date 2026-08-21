import { useState } from "react";
import { FaMagic, FaLightbulb, FaRobot } from "react-icons/fa";

function TeacherAIInsights() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-2xl shadow-md text-white">
        <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <FaMagic className="text-amber-300" /> AI Insights
        </h2>
        <p className="text-blue-100 max-w-2xl text-lg">
          Our AI analyzes your students' reading patterns to provide actionable teaching recommendations and identify learning gaps early.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FaRobot className="text-blue-500" /> Pattern Recognition
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl">
              <h4 className="font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2 mb-1">
                <FaLightbulb /> Attention Required
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                3 students in Grade 2 are consistently struggling with phonetic decoding of multi-syllable words. Consider assigning a focused phonetic lesson.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Suggested Actions</h3>
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            AI generated curriculum adjustments will appear here.
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherAIInsights;
