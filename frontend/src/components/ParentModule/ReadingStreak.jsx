import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import StatsCard from './StatsCard';
import SkeletonLoader from './SkeletonLoader';
import ToastNotification from './ToastNotification';
import { useAuth } from '../../context/AuthContext';
import { parentStreakApi } from '../../services/api';
import { FaFire, FaTrophy, FaStar, FaCalendarAlt, FaGift, FaCheckCircle } from 'react-icons/fa';

export default function ReadingStreak() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchStreak = async () => {
    if (!activeChildId) return;
    setLoading(true);
    try {
      const res = await parentStreakApi.getStreak(activeChildId);
      setStreakData(res);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load streak details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, [activeChildId]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar title="Reading Streak" />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaFire className="text-orange-500" /> Reading Streak System
              </h1>
              <p className="text-sm text-slate-500">Track daily reading consistency and earn milestone rewards for {activeChild?.name}.</p>
            </div>
            <ChildSelector
              childrenList={childrenList}
              activeChildId={activeChildId}
              onSelectChild={setActiveChildId}
            />
          </div>

          {loading || !streakData ? (
            <SkeletonLoader count={3} />
          ) : (
            <>
              {/* Header Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <StatsCard
                  title="Current Streak"
                  value={`${streakData.current_streak} Days 🔥`}
                  icon={FaFire}
                  color="amber"
                  description="Consecutive daily reading"
                />
                <StatsCard
                  title="Longest Streak"
                  value={`${streakData.longest_streak} Days`}
                  icon={FaTrophy}
                  color="rose"
                  description="All-time record"
                />
                <StatsCard
                  title="Reward Stars"
                  value={`${streakData.total_stars} ⭐`}
                  icon={FaStar}
                  color="indigo"
                  description="Available to spend in shop"
                />
              </div>

              {/* Milestone Rewards Section */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FaGift className="text-rose-500" /> Milestone Rewards
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {streakData.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 ${
                        m.unlocked ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-extrabold text-slate-500">{m.days} Days Streak</span>
                        {m.unlocked ? (
                          <FaCheckCircle className="text-emerald-500 text-lg" />
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">Locked</span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{m.reward}</h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Grid Representation */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FaCalendarAlt className="text-purple-500" /> Reading Calendar Heatmap
                </h3>
                <p className="text-xs text-slate-500">Days highlighted in green indicate active reading logs.</p>

                <div className="grid grid-cols-7 gap-2 pt-4 max-w-xl mx-auto text-center text-xs font-bold text-slate-400">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                  {Array.from({ length: 28 }).map((_, i) => {
                    const isRead = i % 2 === 0 || i < streakData.current_streak;
                    return (
                      <div
                        key={i}
                        className={`h-10 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                          isRead ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
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
