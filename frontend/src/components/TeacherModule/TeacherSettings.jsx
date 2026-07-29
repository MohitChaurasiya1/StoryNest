import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../../services/api';
import { FaSave, FaUserCog, FaCheckCircle } from 'react-icons/fa';
import './TeacherModule.css';

export default function TeacherSettings() {
  const [settings, setSettings] = useState({
    full_name: 'Ms. Maria Rivera',
    email: 'm.rivera@oakridge.edu',
    school_name: 'Oakridge Elementary School',
    grade_level: 'Grade 2 & Grade 3',
    subject: 'Primary Reading & Literature',
    bio: 'Passionate elementary teacher focusing on reading comprehension and dual-language storytelling.',
    avatar: 'MR',
    email_notifications: true,
    weekly_reports: true,
    theme_preference: 'light'
  });
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await teacherAPI.getSettings();
      if (res) {
        setSettings(prev => ({ ...prev, ...res }));
      }
    } catch (err) {
      console.error('Error fetching teacher settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Failed to update teacher settings.');
    }
  };

  if (loading) {
    return (
      <div className="teacher-view-container animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="text-muted">Loading profile & classroom settings...</p>
      </div>
    );
  }

  return (
    <div className="teacher-view-container animate-fade-in">
      <div className="teacher-view-header">
        <div>
          <h3>Teacher Account & Class Preferences</h3>
          <p>Manage your profile, school information, notification settings, and dashboard display.</p>
        </div>
      </div>

      <div className="settings-card">
        {savedSuccess && (
          <div style={{ background: '#DCFCE7', color: '#15803D', padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCheckCircle /> Settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ borderBottom: '2px solid #F1F5F9', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1.25rem 0', fontWeight: '800', color: '#0F172A' }}>Educator Profile</h4>
            
            <div className="form-group-row">
              <div className="form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={settings.full_name}
                  onChange={e => setSettings({ ...settings, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-field">
                <label>School Name</label>
                <input
                  type="text"
                  value={settings.school_name}
                  onChange={e => setSettings({ ...settings, school_name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Grade Level(s)</label>
                <input
                  type="text"
                  value={settings.grade_level}
                  onChange={e => setSettings({ ...settings, grade_level: e.target.value })}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Subject Specialization</label>
              <input
                type="text"
                value={settings.subject}
                onChange={e => setSettings({ ...settings, subject: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>Teacher Bio</label>
              <textarea
                rows="3"
                value={settings.bio}
                onChange={e => setSettings({ ...settings, bio: e.target.value })}
              />
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 1.25rem 0', fontWeight: '800', color: '#0F172A' }}>Notifications & Preferences</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '600', color: '#334155' }}>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', accentColor: '#7C3AED' }}
                  checked={settings.email_notifications}
                  onChange={e => setSettings({ ...settings, email_notifications: e.target.checked })}
                />
                Receive email alerts for parent messages and unread assignments
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '600', color: '#334155' }}>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', accentColor: '#7C3AED' }}
                  checked={settings.weekly_reports}
                  onChange={e => setSettings({ ...settings, weekly_reports: e.target.checked })}
                />
                Automated weekly class reading progress summary reports
              </label>
            </div>

            <button 
              type="submit" 
              className="btn"
              style={{ background: '#7C3AED', color: '#FFF', padding: '0.75rem 1.75rem', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaSave /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
