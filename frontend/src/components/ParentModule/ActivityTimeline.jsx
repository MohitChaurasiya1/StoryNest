import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import { useAuth } from '../../context/AuthContext';
import { parentTimelineApi } from '../../services/api';
import { FaHistory, FaBookOpen, FaQuestionCircle, FaMedal, FaCertificate, FaTrophy, FaClock } from 'react-icons/fa';

export default function ActivityTimeline() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const iconMap = {
    FaBookOpen: <FaBookOpen className="text-rose-500" />,
    FaQuestionCircle: <FaQuestionCircle className="text-purple-500" />,
    FaMedal: <FaMedal className="text-amber-500" />,
    FaCertificate: <FaCertificate className="text-indigo-500" />,
    FaTrophy: <FaTrophy className="text-emerald-500" />,
  };

  const fetchTimeline = async () => {
    if (!activeChildId) return;
    setLoading(true);
    try {
      const data = await parentTimelineApi.getTimeline(activeChildId);
      setTimeline(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load timeline activity' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [activeChildId]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar title="Child Activity Timeline" />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaHistory className="text-indigo-500" /> Activity Timeline
              </h1>
              <p className="text-sm text-slate-500">Chronological history of {activeChild?.name}'s activities and accomplishments.</p>
            </div>
            <ChildSelector
              childrenList={childrenList}
              activeChildId={activeChildId}
              onSelectChild={setActiveChildId}
            />
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : timeline.length === 0 ? (
            <EmptyState
              icon={FaHistory}
              title="No activity recorded"
              description={`Activity timeline for ${activeChild?.name} will appear as stories are read and quizzes completed.`}
            />
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative pl-8 group">
                  {/* Timeline Icon Node */}
                  <div className="absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-slate-200 text-sm shadow-sm group-hover:scale-110 transition">
                    {iconMap[item.icon] || <FaClock className="text-slate-400" />}
                  </div>

                  {/* Card Content */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                        <FaClock /> {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{item.description}</p>
                  </div>
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
