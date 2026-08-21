import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import SkeletonLoader from './SkeletonLoader';
import ToastNotification from './ToastNotification';
import { useAuth } from '../../context/AuthContext';
import { parentAIApi } from '../../services/api';
import { FaMagic, FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaBookReader } from 'react-icons/fa';

export default function AIInsights() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchInsights = async () => {
    if (!activeChildId) return;
    setLoading(true);
    try {
      const data = await parentAIApi.getInsights(activeChildId);
      setInsights(data);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load AI insights' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [activeChildId]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar
          title="AI Insights (Gemini)"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-black dark:text-white flex items-center gap-2">
                <FaMagic className="text-purple-500 animate-pulse" /> Gemini AI Learning Insights
              </h1>
              <p className="text-sm font-medium text-black/80 dark:text-white">AI-generated weekly summaries and customized suggestions for {activeChild?.name}.</p>
            </div>
            <ChildSelector
              childrenList={childrenList}
              activeChildId={activeChildId}
              onSelectChild={setActiveChildId}
            />
          </div>

          {loading || !insights ? (
            <SkeletonLoader count={3} />
          ) : (
            <div className="space-y-6">
              {/* Weekly Summary Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 p-8 text-white shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <FaMagic className="text-2xl text-amber-300" />
                  <h3 className="text-xl font-extrabold">Weekly AI Overview</h3>
                </div>
                <p className="text-sm leading-relaxed text-rose-50 font-medium">{insights.weekly_summary}</p>
              </div>

              {/* Grid Suggestions */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Strengths & Weaknesses */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h4 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {insights.strengths.map((s, i) => (
                      <li key={i} className="text-xs font-bold text-emerald-950 dark:text-emerald-100 bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-xl">{s}</li>
                    ))}
                  </ul>

                  <h4 className="text-base font-bold text-black dark:text-white flex items-center gap-2 pt-2">
                    <FaExclamationTriangle className="text-amber-500" /> Areas for Growth
                  </h4>
                  <ul className="space-y-2">
                    {insights.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs font-bold text-amber-950 dark:text-amber-100 bg-amber-50 dark:bg-amber-950/60 p-3 rounded-xl">{w}</li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h4 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                    <FaLightbulb className="text-amber-500" /> Reading & Quiz Tips
                  </h4>
                  <div className="space-y-3">
                    {insights.reading_suggestions.map((r, i) => (
                      <div key={i} className="p-3 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-xs font-bold text-purple-950 dark:text-purple-100">
                        {r}
                      </div>
                    ))}
                    {insights.quiz_suggestions.map((q, i) => (
                      <div key={i} className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-xs font-bold text-rose-950 dark:text-rose-100">
                        {q}
                      </div>
                    ))}
                  </div>

                  <h4 className="text-base font-bold text-black dark:text-white flex items-center gap-2 pt-2">
                    <FaBookReader className="text-indigo-500" /> Recommended Themes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.recommended_stories.map((rec, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 text-xs font-bold">
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
