import React, { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';

const ToggleRow = ({ title, description, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/60">
    <div className="pr-4">
      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);

const NotificationPreferencesSection = ({ notifications, onSave, isSaving }) => {
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    assignment_notifications: true,
    student_progress_alerts: true,
    system_updates: false
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (notifications) {
      setPrefs({
        email_notifications: notifications.email_notifications ?? true,
        assignment_notifications: notifications.assignment_notifications ?? true,
        student_progress_alerts: notifications.student_progress_alerts ?? true,
        system_updates: notifications.system_updates ?? false
      });
    }
  }, [notifications]);

  const handleToggle = async (key, newValue) => {
    const updated = { ...prefs, [key]: newValue };
    setPrefs(updated);
    setMessage(null);

    try {
      await onSave({ [key]: newValue });
      setMessage({ type: 'success', text: '✓ Notification settings updated.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'We could not save your notification settings.' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <FiBell className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose when and how StoryNest contacts you</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <ToggleRow
          title="Email Notifications"
          description="Receive daily or weekly summary digests in your email inbox."
          checked={prefs.email_notifications}
          onChange={(val) => handleToggle('email_notifications', val)}
          disabled={isSaving}
        />

        <ToggleRow
          title="Assignment Activity Alerts"
          description="Receive notifications when students submit or complete assigned stories & quizzes."
          checked={prefs.assignment_notifications}
          onChange={(val) => handleToggle('assignment_notifications', val)}
          disabled={isSaving}
        />

        <ToggleRow
          title="Student Progress Alerts"
          description="Receive immediate alerts when a student triggers a Needs Attention warning."
          checked={prefs.student_progress_alerts}
          onChange={(val) => handleToggle('student_progress_alerts', val)}
          disabled={isSaving}
        />

        <ToggleRow
          title="System Updates & Announcements"
          description="Receive notifications about new StoryNest library releases and platform features."
          checked={prefs.system_updates}
          onChange={(val) => handleToggle('system_updates', val)}
          disabled={isSaving}
        />
      </div>
    </div>
  );
};

export default NotificationPreferencesSection;
