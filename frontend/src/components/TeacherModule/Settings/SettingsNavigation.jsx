import React from 'react';
import { FiUser, FiSliders, FiBell, FiShield } from 'react-icons/fi';

const SettingsNavigation = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'preferences', label: 'Preferences', icon: FiSliders },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiShield },
  ];

  return (
    <div>
      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-col space-y-1 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className="md:hidden mb-6">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Settings Section
        </label>
        <select
          value={activeTab}
          onChange={(e) => onSelectTab(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SettingsNavigation;
