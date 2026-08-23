import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import teacherSettingsService from '../../../services/teacherSettingsService';
import SettingsNavigation from './SettingsNavigation';
import TeacherProfileSection from './Profile/TeacherProfileSection';
import TeacherPreferencesSection from './Preferences/TeacherPreferencesSection';
import NotificationPreferencesSection from './Notifications/NotificationPreferencesSection';
import SecuritySettingsSection from './Security/SecuritySettingsSection';

const SettingsPage = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [activeTab, setActiveTab] = useState(tab || 'profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [settingsData, setSettingsData] = useState({
    profile: null,
    preferences: null,
    notifications: null
  });

  // Keep URL tab param in sync
  useEffect(() => {
    if (tab && ['profile', 'preferences', 'notifications', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    navigate(`/teacher/settings/${tabId}`);
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherSettingsService.getSettings();
      setSettingsData(data);
    } catch (err) {
      console.error(err);
      setError('We could not load your settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveProfile = async (formData) => {
    setSaving(true);
    try {
      const updatedProfile = await teacherSettingsService.updateProfile(formData);
      setSettingsData((prev) => ({ ...prev, profile: updatedProfile }));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (prefData) => {
    setSaving(true);
    try {
      const updatedPrefs = await teacherSettingsService.updatePreferences(prefData);
      setSettingsData((prev) => ({ ...prev, preferences: updatedPrefs }));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (notifData) => {
    setSaving(true);
    try {
      const updatedNotifs = await teacherSettingsService.updateNotifications(notifData);
      setSettingsData((prev) => ({ ...prev, notifications: updatedNotifs }));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Manage your personal account details, appearance, and StoryNest preferences.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 text-sm mt-3">Loading settings...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl border border-rose-200 text-center py-12">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="md:col-span-1">
            <SettingsNavigation activeTab={activeTab} onSelectTab={handleSelectTab} />
          </div>

          {/* Active Section Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <TeacherProfileSection
                profile={settingsData.profile}
                onSave={handleSaveProfile}
                isSaving={saving}
              />
            )}

            {activeTab === 'preferences' && (
              <TeacherPreferencesSection
                preferences={settingsData.preferences}
                onSave={handleSavePreferences}
                isSaving={saving}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationPreferencesSection
                notifications={settingsData.notifications}
                onSave={handleSaveNotifications}
                isSaving={saving}
              />
            )}

            {activeTab === 'security' && (
              <SecuritySettingsSection onLogout={handleLogout} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
