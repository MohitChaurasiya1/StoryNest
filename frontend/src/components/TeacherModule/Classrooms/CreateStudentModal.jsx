import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaUserPlus, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import teacherClassroomService from '../../../services/teacherClassroomService';

const AVATAR_OPTIONS = ['🦁', '🐼', '🦊', '🐰', '🚀', '🌟', '🦄', '🎨', '🐻', '🐯', '🐬', '🦉'];

const CreateStudentModal = ({ onClose, onSuccess, initialClassroomId = null }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    age: 7,
    gender: 'boy',
    grade_level: 'Grade 2',
    reading_level: 'Beginner',
    avatar: '🦁',
    classroom_id: initialClassroomId || '',
    interests: 'Animals, Space, Magic'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(false);

  // Lock background body scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Fetch teacher's classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoadingClassrooms(true);
        const data = await teacherClassroomService.getClassrooms({ status: 'active' });
        setClassrooms(data);
        if (!formData.classroom_id && data.length > 0 && initialClassroomId) {
          setFormData(prev => ({ ...prev, classroom_id: initialClassroomId }));
        }
      } catch (err) {
        console.error('Failed to load classrooms', err);
      } finally {
        setLoadingClassrooms(false);
      }
    };
    fetchClassrooms();
  }, [initialClassroomId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (avatar) => {
    setFormData({ ...formData, avatar });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter the student\'s name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        age: parseInt(formData.age) || 7,
        gender: formData.gender,
        grade_level: formData.grade_level,
        reading_level: formData.reading_level,
        avatar: formData.avatar,
        interests: formData.interests,
        classroom_id: formData.classroom_id ? parseInt(formData.classroom_id) : null
      };

      const newStudent = await teacherClassroomService.createStudent(payload);
      setSuccessToast(true);

      setTimeout(() => {
        if (onSuccess) onSuccess(newStudent);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create student. Please try again.');
      setLoading(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-student-title"
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in"
        style={{ 
          width: 'min(580px, 92vw)',
          maxHeight: '88vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
              <FaUserPlus className="text-lg" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500 dark:text-rose-400 block">
                Student Roster
              </span>
              <h2 
                id="create-student-title"
                className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white"
              >
                Create Student
              </h2>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 sm:px-8 space-y-5">
            {successToast && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center gap-2 animate-fade-in">
                <FaCheck className="text-emerald-600" />
                Student created successfully!
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm font-semibold">
                <FaExclamationTriangle className="shrink-0 text-base" />
                <p className="m-0">{error}</p>
              </div>
            )}

            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Choose Student Avatar
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {AVATAR_OPTIONS.map((avatarEmoji) => (
                  <button
                    key={avatarEmoji}
                    type="button"
                    onClick={() => handleAvatarSelect(avatarEmoji)}
                    className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center transition-all ${
                      formData.avatar === avatarEmoji
                        ? 'bg-rose-500 text-white scale-110 shadow-md ring-2 ring-rose-300 dark:ring-rose-800'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700'
                    }`}
                  >
                    {avatarEmoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Student Full Name *
              </label>
              <input 
                type="text" 
                name="name"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all" 
                placeholder="e.g., Aarav Sharma"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            {/* Age & Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Age
                </label>
                <input 
                  type="number" 
                  name="age"
                  min="3"
                  max="18"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all" 
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Grade Level
                </label>
                <select 
                  name="grade_level" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all"
                  value={formData.grade_level}
                  onChange={handleChange}
                >
                  <option value="Pre-K">Pre-K</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                </select>
              </div>
            </div>

            {/* Reading Level & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Reading Level
                </label>
                <select 
                  name="reading_level" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all"
                  value={formData.reading_level}
                  onChange={handleChange}
                >
                  <option value="Beginner">Beginner (Phonics & Early Reader)</option>
                  <option value="Intermediate">Intermediate (Independent Reader)</option>
                  <option value="Advanced">Advanced (Fluent Reader)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select 
                  name="gender" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Classroom Assignment */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Assign to Classroom (Optional)
              </label>
              {loadingClassrooms ? (
                <div className="p-3 text-xs text-slate-400">Loading your classrooms...</div>
              ) : (
                <select 
                  name="classroom_id" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all"
                  value={formData.classroom_id}
                  onChange={handleChange}
                >
                  <option value="">No Classroom (Enroll later)</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade_level || c.grade || 'General'})
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-slate-400 mt-1">
                You can enroll the student in a classroom now or assign them at any time later.
              </p>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary disabled:opacity-50"
              disabled={loading || successToast}
            >
              {loading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateStudentModal;
