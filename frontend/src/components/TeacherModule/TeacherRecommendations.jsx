import { useState } from "react";
import { FaBookOpen, FaStar, FaPlus } from "react-icons/fa";

function TeacherRecommendations() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <FaBookOpen className="text-blue-500" /> Curated Recommendations
        </h2>
        <p className="text-slate-500 dark:text-slate-400">AI-curated reading lists customized for your classrooms based on current reading levels and interests.</p>
        
        <div className="mt-8 text-center py-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <FaStar className="mx-auto text-4xl text-amber-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Personalized Syllabi</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            StoryNest AI is compiling the perfect reading list for your Grade 2 class based on recent quiz scores. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherRecommendations;
