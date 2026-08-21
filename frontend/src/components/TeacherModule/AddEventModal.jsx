import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaChalkboardTeacher, FaBook, FaUsers, FaTimes, FaExclamationTriangle, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';
import { teacherAPI } from '../../services/api';

export default function AddEventModal({ onClose, onCreated, preselectedClassroom = null, preselectedDate = null }) {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    event_type: 'class',
    title: preselectedClassroom ? `Grade Class Session: ${preselectedClassroom.name}` : '',
    description: '',
    location: 'Room 204',
    date: preselectedDate || new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '11:00',
    classroom: preselectedClassroom?.id || '',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const res = await teacherAPI.getClassrooms({ status: 'active' });
      const clsList = res?.results || res || [];
      setClassrooms(clsList);
      if (!formData.classroom && clsList.length > 0) {
        setFormData(prev => ({ ...prev, classroom: clsList[0].id }));
      }
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (formData.end_time <= formData.start_time) {
      setError('End time must be after start time.');
      return;
    }

    try {
      setSubmitting(true);
      await teacherAPI.createEvent(formData);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error('Error creating event:', err);
      setError(typeof err === 'string' ? err : (err?.response?.data?.error || 'Failed to schedule event. Check for conflicts.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-black text-lg">
              <FaCalendarAlt />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Schedule Teaching Event</h3>
              <p className="text-xs text-purple-200 font-medium">Add class, lesson, meeting, or office hours</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition">
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Conflict & Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <FaExclamationTriangle className="text-rose-600 shrink-0 text-base" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Event Type Grid */}
          <div className="space-y-1">
            <label className="font-extrabold text-slate-700 dark:text-slate-200">Event Category *</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
              {[
                { type: 'class', label: 'Class', icon: <FaChalkboardTeacher className="text-purple-500" /> },
                { type: 'lesson', label: 'Lesson', icon: <FaBook className="text-blue-500" /> },
                { type: 'meeting', label: 'Meeting', icon: <FaUsers className="text-pink-500" /> },
                { type: 'office_hours', label: 'Office', icon: <FaClock className="text-teal-500" /> },
                { type: 'other', label: 'Other', icon: <FaFileAlt className="text-slate-500" /> }
              ].map(t => (
                <div
                  key={t.type}
                  onClick={() => setFormData({ ...formData, event_type: t.type })}
                  className={`p-2.5 rounded-2xl border cursor-pointer font-bold text-center transition space-y-1 ${
                    formData.event_type === t.type
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300'
                  }`}
                >
                  <div className="text-base mx-auto flex justify-center">{t.icon}</div>
                  <div className="text-[10px] font-extrabold">{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-700 dark:text-slate-200">Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Grade 3A — Reading Comprehension Workshop"
              className="sn-search-input w-full py-2.5 px-3 rounded-2xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-200">Target Classroom</label>
              <select
                value={formData.classroom}
                onChange={e => setFormData({ ...formData, classroom: e.target.value })}
                className="sn-filter-select w-full py-2 px-3 rounded-2xl"
              >
                <option value="">None (Personal / General Event)</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>📚 {c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-200">Location / Room</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Room 204 or Conference Room B"
                className="sn-search-input w-full py-2 px-3 rounded-2xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-200">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="sn-search-input w-full py-2 px-2.5 rounded-2xl text-[11px]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-200">Start Time *</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                className="sn-search-input w-full py-2 px-2.5 rounded-2xl text-[11px]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-slate-700 dark:text-slate-200">End Time *</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                className="sn-search-input w-full py-2 px-2.5 rounded-2xl text-[11px]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-700 dark:text-slate-200">Description / Notes</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add agenda items or preparation instructions..."
              className="sn-search-input w-full p-3 rounded-2xl text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="sn-btn-secondary py-2 px-4 text-xs font-bold">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="sn-btn-primary py-2 px-6 text-xs font-black shadow-md">
              {submitting ? 'Scheduling...' : 'Save Event ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
