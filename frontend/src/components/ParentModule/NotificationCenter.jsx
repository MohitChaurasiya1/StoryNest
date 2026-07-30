import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import { parentNotificationsApi } from '../../services/api';
import { FaBell, FaCheckDouble, FaTrash, FaCheck, FaInfoCircle } from 'react-icons/fa';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await parentNotificationsApi.getNotifications();
      const list = Array.isArray(data) ? data : data?.results || [];
      setNotifications(list);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load notifications' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await parentNotificationsApi.markRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await parentNotificationsApi.markAllRead();
      setToast({ type: 'success', message: 'All notifications marked as read' });
      fetchNotifications();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to mark notifications read' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await parentNotificationsApi.deleteNotification(id);
      setToast({ type: 'success', message: 'Notification removed' });
      fetchNotifications();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete notification' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar title="Notification Center" />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaBell className="text-rose-500" /> Notifications
              </h1>
              <p className="text-sm text-slate-500">Stay updated on your child's milestones, quizzes, and assigned stories.</p>
            </div>

            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
              >
                <FaCheckDouble /> Mark All Read
              </button>
            )}
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={FaBell}
              title="No notifications yet"
              description="Notifications about completed stories, achievements, and goals will appear here."
            />
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-5 transition flex items-start justify-between gap-4 ${
                    n.is_read ? 'bg-white border-slate-200' : 'bg-rose-50/50 border-rose-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                      <FaInfoCircle />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-semibold mt-2 block">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-2 text-slate-400 hover:text-emerald-500 transition text-sm"
                        title="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition text-sm"
                      title="Delete notification"
                    >
                      <FaTrash />
                    </button>
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
