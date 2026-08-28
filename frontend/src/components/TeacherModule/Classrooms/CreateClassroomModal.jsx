import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaChalkboardTeacher, FaExclamationTriangle } from 'react-icons/fa';
import teacherClassroomService from '../../../services/teacherClassroomService';

const CreateClassroomModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: 'Grade 1',
    section: '',
    subject: 'Reading & Literature',
    academic_year: '2026-2027',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lock background body scroll while modal is open
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await teacherClassroomService.createClassroom(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create classroom');
    } finally {
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
      aria-labelledby="create-classroom-title"
    >
      {/* Modal Card Surface */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in"
        style={{ 
          width: 'min(560px, 92vw)',
          maxHeight: '88vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
              <FaChalkboardTeacher className="text-lg" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500 dark:text-rose-400 block">
                Classroom Management
              </span>
              <h2 
                id="create-classroom-title"
                className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white"
              >
                Create Classroom
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
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm font-semibold">
                <FaExclamationTriangle className="shrink-0 text-base" />
                <p className="m-0">{error}</p>
              </div>
            )}

            <div className="form-group">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Classroom Name *
              </label>
              <input 
                type="text" 
                name="name"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all" 
                placeholder="e.g., Grade 3-B (Sunflower)"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Grade
                </label>
                <select 
                  name="grade" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all"
                  value={formData.grade}
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
              
              <div className="form-group">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Section (Optional)
                </label>
                <input 
                  type="text" 
                  name="section"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all" 
                  placeholder="e.g., A"
                  value={formData.section}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <select 
                  name="subject" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="Reading & Literature">Reading & Literature</option>
                  <option value="English">English</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Academic Year
                </label>
                <input 
                  type="text" 
                  name="academic_year"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all" 
                  value={formData.academic_year}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Description (Optional)
              </label>
              <textarea 
                name="description"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium resize-none transition-all" 
                rows="2"
                placeholder="A short note about this classroom..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
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
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateClassroomModal;
