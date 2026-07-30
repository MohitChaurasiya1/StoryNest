import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import SkeletonLoader from './SkeletonLoader';
import ToastNotification from './ToastNotification';
import { useAuth } from '../../context/AuthContext';
import { parentAIApi } from '../../services/api';
import { FaMagic, FaArrowRight, FaTag, FaClock } from 'react-icons/fa';


export default function StoryRecommendations() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchRecommendations = async () => {
    if (!activeChildId) return;
    setLoading(true);
    try {
      const data = await parentAIApi.getRecommendations(activeChildId);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load recommendations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeChildId]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar title="AI Story Recommendations" />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaMagic className="text-amber-500" /> Story Recommendations
              </h1>
              <p className="text-sm text-slate-500">Personalized AI recommendations based on age, level, and reading speed for {activeChild?.name}.</p>
            </div>
            <ChildSelector
              childrenList={childrenList}
              activeChildId={activeChildId}
              onSelectChild={setActiveChildId}
            />
          </div>

          {loading ? (
            <SkeletonLoader count={3} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-700 flex items-center gap-1">
                        <FaTag /> {rec.category}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                        <FaClock /> {rec.estimated_mins} mins
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{rec.title}</h3>
                    <p className="text-xs text-slate-500 mt-2">{rec.description}</p>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-600">
                      💡 Why: {rec.match_reason}
                    </div>
                  </div>

                  <NavLink
                    to={`/create?title=${encodeURIComponent(rec.title)}&child_id=${activeChildId}`}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 transition"
                  >
                    Generate Story <FaArrowRight />
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
