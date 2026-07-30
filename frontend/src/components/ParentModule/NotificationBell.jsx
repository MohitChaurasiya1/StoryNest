import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBell, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { parentNotificationsApi } from '../../services/api';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchUnread = async () => {
    try {
      const res = await parentNotificationsApi.getUnreadCount();
      setUnreadCount(res.unread_count || 0);

      const notifs = await parentNotificationsApi.getNotifications();
      const list = Array.isArray(notifs) ? notifs : notifs?.results || [];
      setNotifications(list.slice(0, 5));
    } catch (err) {
      console.warn("Could not fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await parentNotificationsApi.markAllRead();
      setUnreadCount(0);
      fetchUnread();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500 transition"
      >
        <FaBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 z-50 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-extrabold text-sm text-slate-800">Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
                >
                  <FaCheckDouble /> Mark read
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl text-xs space-y-1 ${
                      n.is_read ? 'bg-slate-50 text-slate-600' : 'bg-rose-50/70 text-slate-900 font-semibold'
                    }`}
                  >
                    <div className="font-bold flex justify-between">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t text-center">
              <NavLink
                to="/parent/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-rose-500 hover:underline"
              >
                View all notifications →
              </NavLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
