import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import StatsCard from './StatsCard';
import SkeletonLoader from './SkeletonLoader';
import ToastNotification from './ToastNotification';
import { useAuth } from '../../context/AuthContext';
import { parentGrowthApi } from '../../services/api';
import { FaChartLine, FaBrain, FaClock, FaCheckCircle, FaThumbsUp, FaExclamationTriangle, FaArrowUp } from 'react-icons/fa';

export default function ChildGrowthDashboard() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [growthData, setGrowthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchGrowth = async () => {
    if (!activeChildId) return;
    setLoading(true);
    try {
      const data = await parentGrowthApi.getGrowth(activeChildId);
      setGrowthData(data);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load growth dashboard' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowth();
  }, [activeChildId]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar
          title="Child Growth Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaChartLine className="text-emerald-500" /> Growth & Development Report
              </h1>
              <p className="text-sm text-slate-500">In-depth growth trends and skill analytics for {activeChild?.name}.</p>
            </div>
            <ChildSelector
              childrenList={childrenList}
              activeChildId={activeChildId}
              onSelectChild={setActiveChildId}
            />
          </div>

          {loading || !growthData ? (
            <SkeletonLoader count={4} />
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Vocabulary Growth"
                  value={`+${growthData.vocabulary_growth} Words`}
                  icon={FaBrain}
                  color="indigo"
                  change={`+${growthData.improvement_percentage}%`}
                  changeType="increase"
                />
                <StatsCard
                  title="Total Reading Time"
                  value={`${growthData.reading_time} Mins`}
                  icon={FaClock}
                  color="amber"
                  description="Lifetime accumulative"
                />
                <StatsCard
                  title="Quiz Accuracy"
                  value={`${growthData.quiz_accuracy}%`}
                  icon={FaCheckCircle}
                  color="emerald"
                  description="Average test score"
                />
                <StatsCard
                  title="Focus Time"
                  value={`${growthData.focus_time_mins} Mins`}
                  icon={FaChartLine}
                  color="rose"
                  description="Deep engagement time"
                />
              </div>

              {/* Strengths and Weak Areas */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FaThumbsUp className="text-emerald-500" /> Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    {growthData.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-emerald-50 p-3 rounded-2xl">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FaExclamationTriangle className="text-amber-500" /> Focus Areas for Growth
                  </h3>
                  <ul className="space-y-3">
                    {growthData.weak_areas.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-amber-50 p-3 rounded-2xl">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
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
