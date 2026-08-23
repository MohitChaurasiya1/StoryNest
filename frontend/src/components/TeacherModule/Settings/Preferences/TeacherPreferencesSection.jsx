import React, { useState, useEffect } from 'react';
import { FiSliders, FiSun, FiMoon, FiMonitor, FiCheck } from 'react-icons/fi';

const TeacherPreferencesSection = ({ preferences, onSave, isSaving }) => {
  const [theme, setTheme] = useState('light');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (preferences) {
      setTheme(preferences.theme_preference || 'light');
    }
  }, [preferences]);

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    setMessage(null);

    // Apply theme changes to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }

    try {
      await onSave({ theme_preference: newTheme });
      setMessage({ type: 'success', text: '✓ Preference updated.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update theme preference.' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <FiSliders className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance & Preferences</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Customize how StoryNest looks and behaves for you</p>
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

      {/* Theme Cards */}
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Appearance Theme
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-5 rounded-2xl border flex flex-col items-center text-center transition-all ${
              theme === 'light'
                ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
            }`}
          >
            <div className="p-3 rounded-full bg-amber-100 text-amber-600 mb-3">
              <FiSun className="h-6 w-6" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Light Mode</span>
            <span className="text-xs text-slate-500 mt-1">Clean, bright interface</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`p-5 rounded-2xl border flex flex-col items-center text-center transition-all ${
              theme === 'dark'
                ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
            }`}
          >
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 mb-3">
              <FiMoon className="h-6 w-6" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Dark Mode</span>
            <span className="text-xs text-slate-500 mt-1">Easy on the eyes</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`p-5 rounded-2xl border flex flex-col items-center text-center transition-all ${
              theme === 'system'
                ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
            }`}
          >
            <div className="p-3 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 mb-3">
              <FiMonitor className="h-6 w-6" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">System Default</span>
            <span className="text-xs text-slate-500 mt-1">Match OS settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherPreferencesSection;
