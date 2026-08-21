import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import { parentComparisonApi } from '../../services/api';
import { FaUsers, FaBookOpen, FaClock, FaTrophy, FaCertificate, FaBullseye, FaCheckCircle } from 'react-icons/fa';

export default function ChildComparison() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await parentComparisonApi.getComparison();
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load comparison data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar
          title="Child Comparison"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FaUsers className="text-indigo-500" /> Multiple Child Comparison
            </h1>
            <p className="text-sm text-slate-500">Side-by-side comparative analysis of reading stats for all your children.</p>
          </div>

          {loading ? (
            <SkeletonLoader count={2} />
          ) : data.length < 2 ? (
            <EmptyState
              icon={FaUsers}
              title="Add another child to compare"
              description="Comparison mode requires 2 or more child profiles."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.map((c) => (
                <div key={c.child_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  {/* Child Avatar & Header */}
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-2xl shadow-sm">
                      {c.avatar || '🦁'}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{c.name}</h3>
                      <span className="text-xs font-semibold text-rose-500">Child Profile</span>
                    </div>
                  </div>

                  {/* Stats list */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-2xl">
                      <span className="flex items-center gap-2 font-semibold text-slate-600">
                        <FaBookOpen className="text-rose-500" /> Stories Read
                      </span>
                      <span className="font-extrabold text-slate-900">{c.stories_read}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-2xl">
                      <span className="flex items-center gap-2 font-semibold text-slate-600">
                        <FaClock className="text-amber-500" /> Reading Time
                      </span>
                      <span className="font-extrabold text-slate-900">{c.reading_time_mins} mins</span>
                    </div>

                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-2xl">
                      <span className="flex items-center gap-2 font-semibold text-slate-600">
                        <FaCheckCircle className="text-emerald-500" /> Quiz Avg
                      </span>
                      <span className="font-extrabold text-slate-900">{c.quiz_score_avg}%</span>
                    </div>

                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-2xl">
                      <span className="flex items-center gap-2 font-semibold text-slate-600">
                        <FaTrophy className="text-purple-500" /> Achievements
                      </span>
                      <span className="font-extrabold text-slate-900">{c.achievements_count}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-2xl">
                      <span className="flex items-center gap-2 font-semibold text-slate-600">
                        <FaCertificate className="text-indigo-500" /> Certificates
                      </span>
                      <span className="font-extrabold text-slate-900">{c.certificates_count}</span>
                    </div>
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
