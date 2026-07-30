import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useAuth } from '../../context/AuthContext';
import { parentGoalsApi } from '../../services/api';
import { FaBullseye, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';

export default function ChildGoals() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const [formData, setFormData] = useState({
    goal_type: 'stories_per_week',
    title: '',
    target_value: 5,
    deadline: '',
  });

  const templates = [
    { goal_type: 'stories_per_week', title: 'Read 5 stories a week', target_value: 5 },
    { goal_type: 'minutes_per_day', title: 'Read 30 minutes daily', target_value: 30 },
    { goal_type: 'quiz_score', title: 'Maintain 80%+ quiz score', target_value: 80 },
    { goal_type: 'quizzes_per_week', title: 'Complete 3 quizzes a week', target_value: 3 },
  ];

  const fetchGoals = async () => {
    if (!activeChildId) return;
    setLoading(true);
    try {
      const data = await parentGoalsApi.getGoals(activeChildId);
      setGoals(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load child goals' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [activeChildId]);

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setFormData({
      goal_type: 'stories_per_week',
      title: 'Read 5 stories per week',
      target_value: 5,
      deadline: '',
    });
    setIsModalOpen(true);
  };

  const handleSelectTemplate = (tpl) => {
    setFormData({
      goal_type: tpl.goal_type,
      title: tpl.title,
      target_value: tpl.target_value,
      deadline: '',
    });
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await parentGoalsApi.updateGoal(editingGoal.id, formData);
        setToast({ type: 'success', message: 'Goal updated!' });
      } else {
        await parentGoalsApi.createGoal({
          child: activeChildId,
          ...formData,
        });
        setToast({ type: 'success', message: 'New goal created!' });
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save goal' });
    }
  };

  const handleDeleteGoal = async () => {
    if (!isDeleting) return;
    try {
      await parentGoalsApi.deleteGoal(isDeleting.id);
      setToast({ type: 'success', message: 'Goal deleted' });
      setIsDeleting(null);
      fetchGoals();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete goal' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar title="Child Goal Management" />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaBullseye className="text-rose-500" /> Learning Goals
              </h1>
              <p className="text-sm text-slate-500">Set and track reading targets for {activeChild?.name}.</p>
            </div>
            <div className="flex items-center gap-3">
              <ChildSelector
                childrenList={childrenList}
                activeChildId={activeChildId}
                onSelectChild={setActiveChildId}
              />
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm shadow-md hover:scale-105 transition flex items-center gap-2"
              >
                <FaPlus /> Create Goal
              </button>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={3} />
          ) : goals.length === 0 ? (
            <EmptyState
              icon={FaBullseye}
              title="No active goals set"
              description={`Create a learning goal for ${activeChild?.name} to motivate their reading journey.`}
              actionText="Create Goal"
              onAction={handleOpenCreate}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {goals.map((g) => (
                <div key={g.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        g.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {g.status}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{g.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingGoal(g); setFormData(g); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-rose-500 transition text-sm"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setIsDeleting(g)}
                        className="p-2 text-slate-400 hover:text-red-500 transition text-sm"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Progress ({g.current_value} / {g.target_value})</span>
                      <span>{g.progress_percentage}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${g.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  {g.deadline && (
                    <div className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <FaClock /> Target Date: {new Date(g.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingGoal ? 'Edit Goal' : 'Create Learning Goal'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FaTimes />
              </button>
            </div>

            {/* Presets */}
            {!editingGoal && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500">Quick Templates</p>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className="p-2.5 rounded-xl border border-slate-200 text-left text-xs font-semibold text-slate-700 hover:border-rose-500 hover:bg-rose-50 transition"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Goal Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Target Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 1 })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm shadow-md hover:scale-105 transition"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(isDeleting)}
        title="Delete Goal"
        message="Are you sure you want to delete this goal?"
        onConfirm={handleDeleteGoal}
        onCancel={() => setIsDeleting(null)}
      />

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
