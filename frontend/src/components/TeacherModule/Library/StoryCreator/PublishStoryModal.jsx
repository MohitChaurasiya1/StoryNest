import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaBook, FaSchool, FaUserCheck, FaCheck, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';
import teacherStoryService from '../../../../services/teacherStoryService';

const PublishStoryModal = ({ story, onClose, onSuccess }) => {
  const [destination, setDestination] = useState('classroom'); // 'library', 'classroom', 'students'
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [classroomStudents, setClassroomStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  const [assignmentTitle, setAssignmentTitle] = useState(story?.title ? `Read: ${story.title}` : '');
  const [instructions, setInstructions] = useState('Please read through all story pages carefully.');
  const [dueDate, setDueDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Lock background scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Load classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoadingData(true);
        const data = await teacherClassroomService.getClassrooms({ status: 'active' });
        setClassrooms(data);
        if (data.length > 0) {
          setSelectedClassroomId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load classrooms', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchClassrooms();
  }, []);

  // Load classroom students when selected classroom changes
  useEffect(() => {
    if (!selectedClassroomId || destination !== 'students') return;

    const fetchStudents = async () => {
      try {
        const students = await teacherClassroomService.getStudents(selectedClassroomId);
        setClassroomStudents(students);
        setSelectedStudentIds(students.map(s => s.id));
      } catch (err) {
        console.error('Failed to load classroom students', err);
      }
    };
    fetchStudents();
  }, [selectedClassroomId, destination]);

  const toggleStudent = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (destination !== 'library' && !selectedClassroomId) {
      setError('Please select a classroom.');
      return;
    }
    if (destination === 'students' && selectedStudentIds.length === 0) {
      setError('Please select at least one student.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        destination,
        classroom_id: destination !== 'library' ? parseInt(selectedClassroomId) : null,
        student_ids: destination === 'students' ? selectedStudentIds : [],
        assignment_title: assignmentTitle,
        instructions: instructions,
        due_date: dueDate || null
      };

      const result = await teacherStoryService.publishStory(story.id, payload);
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to publish story.');
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
      aria-labelledby="publish-story-title"
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in"
        style={{ 
          width: 'min(620px, 92vw)',
          maxHeight: '88vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
              <FaBook className="text-lg" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500 dark:text-rose-400 block">
                Publish & Distribute
              </span>
              <h2 
                id="publish-story-title"
                className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate"
              >
                Publish "{story?.title || 'Story'}"
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
        <form onSubmit={handlePublish} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 sm:px-8 space-y-5">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm font-semibold">
                <FaExclamationTriangle className="shrink-0 text-base" />
                <p className="m-0">{error}</p>
              </div>
            )}

            {/* Destination Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                Where would you like to publish this story?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDestination('classroom')}
                  className={`p-4 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                    destination === 'classroom'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-200 dark:ring-rose-900'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${destination === 'classroom' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    <FaSchool className="text-base" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">Classroom</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Assign to all active students in class</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDestination('students')}
                  className={`p-4 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                    destination === 'students'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-200 dark:ring-rose-900'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${destination === 'students' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    <FaUserCheck className="text-base" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">Specific Students</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Pick targeted students in classroom</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDestination('library')}
                  className={`p-4 rounded-2xl border text-left flex flex-col items-start gap-2 transition-all ${
                    destination === 'library'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-200 dark:ring-rose-900'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${destination === 'library' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    <FaBook className="text-base" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">My Library Only</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Save in teacher resource library</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Classroom configuration if classroom or students selected */}
            {destination !== 'library' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Select Classroom *
                  </label>
                  {loadingData ? (
                    <div className="p-3 text-xs text-slate-400">Loading classrooms...</div>
                  ) : classrooms.length === 0 ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                      No active classrooms found. Please create a classroom first.
                    </div>
                  ) : (
                    <select
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
                      value={selectedClassroomId}
                      onChange={(e) => setSelectedClassroomId(e.target.value)}
                      required
                    >
                      {classrooms.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.grade_level || 'Grade 3'}) — {c.active_students || 0} students
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Specific Student Selection */}
                {destination === 'students' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Select Students ({selectedStudentIds.length} selected)
                    </label>
                    {classroomStudents.length === 0 ? (
                      <div className="p-3 text-xs text-slate-400">No students enrolled in this classroom.</div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        {classroomStudents.map(student => {
                          const isChecked = selectedStudentIds.includes(student.id);
                          return (
                            <label 
                              key={student.id} 
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 cursor-pointer transition-colors text-sm"
                            >
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleStudent(student.id)}
                                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                              />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{student.name}</span>
                              <span className="text-xs text-slate-400">({student.grade || 'Grade 2'})</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Assignment Title & Due Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Assignment Title
                    </label>
                    <input 
                      type="text" 
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
                      value={assignmentTitle}
                      onChange={(e) => setAssignmentTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Due Date (Optional)
                    </label>
                    <input 
                      type="date" 
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Reading Instructions for Students
                  </label>
                  <textarea 
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500 resize-none"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>
              </div>
            )}
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
              {loading ? 'Publishing...' : 'Publish Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PublishStoryModal;
