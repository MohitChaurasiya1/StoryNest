import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import StatsCard from './StatsCard';
import SkeletonLoader from './SkeletonLoader';
import ToastNotification from './ToastNotification';
import { useAuth } from '../../context/AuthContext';
import { parentAnalyticsApi } from '../../services/api';
import { FaClock, FaBookOpen, FaTrophy, FaBolt, FaStar, FaChartLine, FaChartPie, FaChartBar } from 'react-icons/fa';

export default function ReadingAnalytics() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchAnalytics = async () => {
    if (!activeChildId) return;
    setLoading(true);
    try {
      const res = await parentAnalyticsApi.getAnalytics(activeChildId);
      setData(res);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load reading analytics' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeChildId]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar
          title="Reading Analytics"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaChartLine className="text-purple-500" /> Reading Analytics
              </h1>
              <p className="text-sm text-slate-500">Comprehensive reading metrics and visual charts for {activeChild?.name}.</p>
            </div>
            <ChildSelector
              childrenList={childrenList}
              activeChildId={activeChildId}
              onSelectChild={setActiveChildId}
            />
          </div>

          {loading || !data ? (
            <SkeletonLoader count={6} />
          ) : (
            <>
              {/* Top Metrics Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                  title="Daily Reading Time"
                  value={`${data.daily_reading_time} mins`}
                  icon={FaClock}
                  color="rose"
                  description="Today's total reading"
                />
                <StatsCard
                  title="Weekly Reading Time"
                  value={`${data.weekly_reading_time} mins`}
                  icon={FaClock}
                  color="amber"
                  description="Current week total"
                />
                <StatsCard
                  title="Monthly Reading Time"
                  value={`${data.monthly_reading_time} mins`}
                  icon={FaClock}
                  color="indigo"
                  description="Current month total"
                />
                <StatsCard
                  title="Average Session"
                  value={`${data.average_reading_time} mins`}
                  icon={FaBolt}
                  color="emerald"
                  description="Per story session"
                />
                <StatsCard
                  title="Stories Completed"
                  value={data.stories_completed}
                  icon={FaBookOpen}
                  color="violet"
                  description="Finished reading books"
                />
                <StatsCard
                  title="Reading Speed"
                  value={`${data.reading_speed} p/m`}
                  icon={FaTrophy}
                  color="cyan"
                  description="Estimated pages per min"
                />
              </div>

              {/* Secondary Highlights */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 text-xl font-bold">
                    <FaTrophy />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Longest Session</p>
                    <p className="text-lg font-bold text-slate-800">{data.longest_reading_session} mins</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-xl font-bold">
                    <FaStar />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Most Read Category</p>
                    <p className="text-lg font-bold text-slate-800">{data.most_read_category}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 text-xl font-bold">
                    <FaBookOpen />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Favorite Story</p>
                    <p className="text-lg font-bold text-slate-800 truncate max-w-[180px]">{data.favorite_story}</p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Weekly Bar/Line Visualization */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <FaChartBar className="text-rose-500" /> Weekly Reading Activity (mins)
                    </h3>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
                    {data.weekly_chart.map((item, idx) => {
                      const maxVal = Math.max(...data.weekly_chart.map((w) => w.minutes), 30);
                      const heightPct = Math.min(100, Math.round((item.minutes / maxVal) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                          <div
                            style={{ height: `${Math.max(8, heightPct)}%` }}
                            className="w-full max-w-[28px] rounded-t-xl bg-gradient-to-t from-rose-500 to-amber-400 transition-all group-hover:scale-105"
                          />
                          <span className="text-xs font-semibold text-slate-500">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Pie/Bar breakdown */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FaChartPie className="text-purple-500" /> Category Breakdown
                  </h3>
                  <div className="space-y-3 pt-2">
                    {data.category_chart.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No category data available yet.</p>
                    ) : (
                      data.category_chart.map((cat, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700">{cat.name}</span>
                            <span className="text-slate-400">{cat.value} stories</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full"
                              style={{ width: `${Math.min(100, cat.value * 25)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
