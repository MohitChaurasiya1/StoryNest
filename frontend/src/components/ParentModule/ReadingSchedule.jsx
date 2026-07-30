import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useAuth } from '../../context/AuthContext';
import { parentScheduleApi } from '../../services/api';
import { FaCalendarAlt, FaPlus, FaTrash, FaClock, FaBell } from 'react-icons/fa';

export default function ReadingSchedule() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const [day, setDay] = useState(0);
  const [time, setTime] = useState('19:00');
  const [label, setLabel] = useState('Bedtime Story');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchSchedules = async () => {
    if (!activeChildId) return;
    setLoading(true);
    try {
      const data = await parentScheduleApi.getSchedules(activeChildId);
      setSchedules(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load schedule' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [activeChildId]);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await parentScheduleApi.createSchedule({
        child: activeChildId,
        day_of_week: parseInt(day),
        time,
        label,
      });
      setToast({ type: 'success', message: 'Schedule added!' });
      fetchSchedules();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to add schedule' });
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      await parentScheduleApi.deleteSchedule(isDeleting.id);
      setToast({ type: 'success', message: 'Schedule removed' });
      setIsDeleting(null);
      fetchSchedules();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to remove schedule' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar title="Reading Schedule" />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaCalendarAlt className="text-amber-500" /> Reading Schedule
              </h1>
              <p className="text-sm text-slate-500">Set weekly reading reminders and routine slots for {activeChild?.name}.</p>
            </div>
            <ChildSelector
              childrenList={childrenList}
              activeChildId={activeChildId}
              onSelectChild={setActiveChildId}
            />
          </div>

          {/* Add Schedule Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FaPlus className="text-emerald-500" /> Add Weekly Reading Routine
            </h3>
            <form onSubmit={handleAddSchedule} className="grid gap-4 sm:grid-cols-4 items-end">
              <div>
                <label className="text-xs font-bold text-slate-700">Day of Week</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-rose-500 focus:outline-none"
                >
                  {daysOfWeek.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Time</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Routine Label</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Bedtime Story"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-md hover:scale-105 transition"
              >
                Save Slot
              </button>
            </form>
          </div>

          {/* Schedules List */}
          {loading ? (
            <SkeletonLoader count={3} />
          ) : schedules.length === 0 ? (
            <EmptyState
              icon={FaCalendarAlt}
              title="No schedule created"
              description={`Add regular reading time slots to establish a healthy habit for ${activeChild?.name}.`}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schedules.map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-bold text-sm">
                      <FaBell />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{s.day_name || daysOfWeek[s.day_of_week]} @ {s.time}</h4>
                      <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDeleting(s)}
                    className="p-2 text-slate-400 hover:text-red-500 transition text-sm"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ConfirmDeleteModal
        isOpen={Boolean(isDeleting)}
        title="Delete Schedule"
        message="Are you sure you want to delete this reading time slot?"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(null)}
      />

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
