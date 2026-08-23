import React, { useState, useEffect } from 'react';
import { FiUser, FiCheck, FiSave } from 'react-icons/fi';

const AVATAR_OPTIONS = ['👩‍🏫', '👨‍🏫', '🏫', '📚', '🌟', '🍎', '🎓', 'MR'];

const TeacherProfileSection = ({ profile, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school_name: '',
    grade_level: '',
    subject: '',
    bio: '',
    avatar: '👩‍🏫'
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        school_name: profile.school_name || '',
        grade_level: profile.grade_level || '',
        subject: profile.subject || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '👩‍🏫'
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await onSave(formData);
      setMessage({ type: 'success', text: '✓ Profile updated successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'We could not update your profile. Please try again.' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <FiUser className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Teacher Profile</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your personal information and teaching credentials</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Picker Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-3xl shadow-sm">
            {formData.avatar}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Choose Avatar / Badge
            </span>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, avatar: av }))}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                    formData.avatar === av
                      ? 'bg-indigo-600 text-white scale-110 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Email (Account Identity)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm font-medium cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              School / Institution
            </label>
            <input
              type="text"
              name="school_name"
              value={formData.school_name}
              onChange={handleChange}
              placeholder="Oakridge Elementary"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Grade Level(s) Taught
            </label>
            <input
              type="text"
              name="grade_level"
              value={formData.grade_level}
              onChange={handleChange}
              placeholder="Grade 2 & 3"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Primary Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Reading & Hindi Literature"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Teacher Bio
          </label>
          <textarea
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Share your passion for story-based learning..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium resize-none"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherProfileSection;
