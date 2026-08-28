import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSearch, FaCheck, FaSpinner, FaUserGraduate, FaExclamationTriangle } from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';

const AddStudentsModal = ({ isOpen = true, classroomId, onClose, onSuccess }) => {
  if (isOpen === false) return null;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const searchStudents = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      
      try {
        setSearching(true);
        const data = await teacherClassroomService.searchStudents(query);
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(() => {
      searchStudents();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAddStudents = async () => {
    if (selectedIds.size === 0) return;
    
    setSaving(true);
    setError(null);
    try {
      await teacherClassroomService.addStudents(classroomId, Array.from(selectedIds));
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add students.');
      setSaving(false);
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
      aria-labelledby="add-students-title"
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
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center text-sky-500 shrink-0 shadow-sm">
              <FaUserGraduate className="text-lg" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-500 dark:text-sky-400 block">
                Classroom Roster
              </span>
              <h2 
                id="add-students-title"
                className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white"
              >
                Add Students
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

        {/* Search & Selection Body */}
        <div className="flex-1 flex flex-col min-h-0 p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm font-semibold shrink-0">
              <FaExclamationTriangle className="shrink-0 text-base" />
              <p className="m-0">{error}</p>
            </div>
          )}

          <div className="relative shrink-0">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input 
              type="text" 
              placeholder="Search by student name..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Student list results */}
          <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[300px] border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 divide-y divide-slate-100 dark:divide-slate-800">
            {searching ? (
              <div className="p-8 flex flex-col items-center justify-center text-slate-400">
                <FaSpinner className="animate-spin text-sky-500 text-2xl mb-2" />
                <span className="text-xs font-medium">Searching students...</span>
              </div>
            ) : query.trim().length < 2 ? (
              <div className="p-8 text-center text-xs font-medium text-slate-400">
                Type at least 2 characters to search for registered students.
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-xs font-medium text-slate-400">
                No students found matching "{query}".
              </div>
            ) : (
              results.map(student => (
                <div 
                  key={student.id} 
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedIds.has(student.id) 
                      ? 'bg-sky-50 dark:bg-sky-950/40' 
                      : 'hover:bg-white dark:hover:bg-slate-800'
                  }`}
                  onClick={() => toggleSelect(student.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={student.avatar_url || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=" + student.name} 
                      alt={student.name} 
                      className="w-10 h-10 rounded-full bg-white object-cover shadow-sm shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{student.name}</div>
                      {student.grade && (
                        <div className="text-xs text-slate-400">Grade {student.grade}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(student.id) 
                      ? 'border-sky-500 bg-sky-500 text-white shadow-sm' 
                      : 'border-slate-300 dark:border-slate-600 text-transparent'
                  }`}>
                    <FaCheck size={10} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {selectedIds.size} student{selectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleAddStudents}
              className="btn btn-primary disabled:opacity-50"
              disabled={saving || selectedIds.size === 0}
            >
              {saving ? 'Adding...' : 'Add to Class'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddStudentsModal;
