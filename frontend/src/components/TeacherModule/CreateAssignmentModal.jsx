import React, { useState, useEffect } from 'react';
import { 
  FaTasks, 
  FaBookOpen, 
  FaAward, 
  FaUsers, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimes, 
  FaChevronRight, 
  FaChevronLeft, 
  FaSearch,
  FaFileAlt,
  FaLightbulb
} from 'react-icons/fa';
import { teacherAPI, storyApi } from '../../services/api';

export default function CreateAssignmentModal({ 
  onClose, 
  onCreated, 
  preselectedClassroom = null, 
  preselectedStudent = null,
  preselectedStory = null 
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Classrooms & Students & Stories Data
  const [classrooms, setClassrooms] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [stories, setStories] = useState([]);
  const [storySearch, setStorySearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: preselectedStory ? `Reading Task: ${preselectedStory.title_en || preselectedStory.title}` : '',
    assignment_type: preselectedStory ? 'story' : 'story',
    description: '',
    instructions: 'Read the story carefully, take notes on new vocabulary, and answer the comprehension questions.',
    teacher_note: '',
    classroom: preselectedClassroom?.id || '',
    story: preselectedStory?.id || '',
    quiz: '',
    lesson: '',
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    allow_late_submission: true,
    target_all_students: preselectedStudent ? false : true,
    selected_student_ids: preselectedStudent ? [preselectedStudent.id] : [],
    status: 'active'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.classroom) {
      fetchClassroomStudents(formData.classroom);
    }
  }, [formData.classroom]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [clsRes, stRes] = await Promise.all([
        teacherAPI.getClassrooms({ status: 'active' }),
        storyApi.getStories()
      ]);

      const clsList = clsRes?.results || clsRes || [];
      setClassrooms(clsList);

      if (!formData.classroom && clsList.length > 0) {
        setFormData(prev => ({ ...prev, classroom: clsList[0].id }));
      }

      const storyList = stRes?.results || stRes || [
        { id: 1, title_en: 'The Brave Little Acorn', reading_difficulty: 'Beginner', num_pages: 8 },
        { id: 2, title_en: 'Ocean Friends: A Coral Reef Story', reading_difficulty: 'Intermediate', num_pages: 12 },
        { id: 3, title_en: 'Leo and the Golden Tree', reading_difficulty: 'Beginner', num_pages: 10 },
        { id: 4, title_en: 'The Wind\'s Secret Song', reading_difficulty: 'Advanced', num_pages: 14 }
      ];
      setStories(storyList);
    } catch (err) {
      console.error('Error fetching modal initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassroomStudents = async (classId) => {
    try {
      const res = await teacherAPI.getClassroomDetails(classId);
      if (res && res.enrolled_students) {
        setAvailableStudents(res.enrolled_students.map(e => e.child || e));
      }
    } catch (err) {
      console.error('Error fetching classroom students:', err);
    }
  };

  const handleStudentToggle = (studentId) => {
    setFormData(prev => {
      const exists = prev.selected_student_ids.includes(studentId);
      const updated = exists
        ? prev.selected_student_ids.filter(id => id !== studentId)
        : [...prev.selected_student_ids, studentId];
      return { ...prev, selected_student_ids: updated };
    });
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.title.trim()) {
        setError('Assignment title is required.');
        return false;
      }
    } else if (step === 2) {
      if (formData.assignment_type === 'story' && !formData.story) {
        setError('Please select a story for this reading assignment.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.classroom) {
        setError('Please select a target classroom.');
        return false;
      }
      if (!formData.target_all_students && formData.selected_student_ids.length === 0) {
        setError('Please select at least one student or choose Entire Classroom.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.due_date) {
        setError('Please set a valid due date.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => Math.min(5, prev + 1));
    }
  };

  const handleBack = () => {
    setError('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (publishStatus = 'active') => {
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        ...formData,
        status: publishStatus
      };

      await teacherAPI.createAssignment(payload);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError(typeof err === 'string' ? err : 'Failed to publish assignment. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStories = stories.filter(s => 
    (s.title_en || s.title || '').toLowerCase().includes(storySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-black text-lg">
              <FaTasks />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Create New Assignment</h3>
              <p className="text-xs text-purple-200 font-medium">Multi-step learning task wizard</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition">
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-bold">
          {[
            { num: 1, label: '1. Details' },
            { num: 2, label: '2. Content' },
            { num: 3, label: '3. Assign To' },
            { num: 4, label: '4. Schedule' },
            { num: 5, label: '5. Review' }
          ].map(s => (
            <div 
              key={s.num}
              onClick={() => { if (s.num < step) setStep(s.num); }}
              className={`flex items-center gap-1.5 cursor-pointer transition ${
                step === s.num 
                  ? 'text-purple-600 font-extrabold' 
                  : step > s.num 
                  ? 'text-emerald-600 font-bold' 
                  : 'text-slate-400'
              }`}
            >
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                step === s.num 
                  ? 'bg-purple-600 text-white' 
                  : step > s.num 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* STEP 1: ASSIGNMENT DETAILS */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-200">Assignment Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Ocean Friends: Comprehension & Vocabulary Check"
                  className="sn-search-input w-full py-2.5 px-3 rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {[
                  { type: 'story', label: 'Story Reading', icon: <FaBookOpen className="text-purple-500" /> },
                  { type: 'quiz', label: 'Quiz Assessment', icon: <FaAward className="text-amber-500" /> },
                  { type: 'reading_task', label: 'Reading Task', icon: <FaFileAlt className="text-blue-500" /> },
                  { type: 'activity', label: 'Learning Activity', icon: <FaTasks className="text-emerald-500" /> }
                ].map(t => (
                  <div
                    key={t.type}
                    onClick={() => setFormData({ ...formData, assignment_type: t.type })}
                    className={`p-3 rounded-2xl border cursor-pointer font-bold text-center transition space-y-1 ${
                      formData.assignment_type === t.type
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-base mx-auto flex justify-center">{t.icon}</div>
                    <div className="text-[11px] font-extrabold">{t.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-200">Instructions for Students</label>
                <textarea
                  rows={3}
                  value={formData.instructions}
                  onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Provide step-by-step instructions..."
                  className="sn-search-input w-full p-3 rounded-2xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-200">Internal Teacher Notes (Optional)</label>
                <input
                  type="text"
                  value={formData.teacher_note}
                  onChange={e => setFormData({ ...formData, teacher_note: e.target.value })}
                  placeholder="e.g. Focus on dual-language recall for Aisha and Rahul"
                  className="sn-search-input w-full py-2 px-3 rounded-2xl text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 2: SELECT LEARNING CONTENT */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">Select Story Content</h4>
                <div className="relative w-48">
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={storySearch}
                    onChange={e => setStorySearch(e.target.value)}
                    placeholder="Search stories..."
                    className="sn-search-input pl-8 py-1.5 text-xs w-full rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                {filteredStories.map(st => (
                  <div
                    key={st.id}
                    onClick={() => setFormData({ ...formData, story: st.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-3 ${
                      formData.story === st.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 border-2'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shrink-0">
                      📖
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-800 dark:text-white text-xs">{st.title_en || st.title}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        {st.reading_difficulty || 'All Levels'} • {st.num_pages || 10} Pages
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: ASSIGN TO */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 dark:text-slate-200">Target Classroom *</label>
                <select
                  value={formData.classroom}
                  onChange={e => setFormData({ ...formData, classroom: e.target.value })}
                  className="sn-filter-select w-full py-2.5 px-3 rounded-2xl"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>
                      📚 {c.name} ({c.grade_level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="font-extrabold text-slate-700 dark:text-slate-200">Assign Work To:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-extrabold text-slate-700 dark:text-slate-200">
                    <input
                      type="radio"
                      name="target_mode"
                      checked={formData.target_all_students}
                      onChange={() => setFormData({ ...formData, target_all_students: true })}
                      className="accent-purple-600"
                    />
                    Entire Classroom Roster
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-extrabold text-slate-700 dark:text-slate-200">
                    <input
                      type="radio"
                      name="target_mode"
                      checked={!formData.target_all_students}
                      onChange={() => setFormData({ ...formData, target_all_students: false })}
                      className="accent-purple-600"
                    />
                    Selected Students Only
                  </label>
                </div>
              </div>

              {!formData.target_all_students && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-2 max-h-48 overflow-y-auto">
                  <div className="font-bold text-slate-500 text-[11px] uppercase">Select Individual Students:</div>
                  {availableStudents.map(st => (
                    <label key={st.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border cursor-pointer">
                      <span className="font-bold text-slate-800 dark:text-white">{st.name} ({st.grade_level || 'Grade 3'})</span>
                      <input
                        type="checkbox"
                        checked={formData.selected_student_ids.includes(st.id)}
                        onChange={() => handleStudentToggle(st.id)}
                        className="h-4 w-4 accent-purple-600"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SCHEDULE & DEADLINES */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-200">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="sn-search-input w-full py-2 px-3 rounded-2xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 dark:text-slate-200">Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    className="sn-search-input w-full py-2 px-3 rounded-2xl"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-800 dark:text-white text-xs">Allow Late Submissions</div>
                  <div className="text-[11px] text-slate-500 font-medium">Students can complete work past the deadline marked as Late.</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allow_late_submission}
                  onChange={e => setFormData({ ...formData, allow_late_submission: e.target.checked })}
                  className="h-5 w-5 accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & PUBLISH */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="sn-badge-on-track">Ready to Publish</span>
                  <span className="text-[11px] font-extrabold text-purple-700">Due: {formData.due_date}</span>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">{formData.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">{formData.instructions}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-purple-200/60">
                  <div>Target Classroom: <span className="text-purple-700 font-black">{classrooms.find(c => c.id === Number(formData.classroom))?.name || 'Grade 3A'}</span></div>
                  <div>Target Students: <span className="text-emerald-700 font-black">{formData.target_all_students ? 'Entire Classroom Roster' : `${formData.selected_student_ids.length} Selected`}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          {step > 1 ? (
            <button type="button" onClick={handleBack} className="sn-btn-secondary py-2 px-4 text-xs">
              <FaChevronLeft /> Back
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <button type="button" onClick={handleNext} className="sn-btn-primary py-2 px-5 text-xs">
                Next Step <FaChevronRight />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('draft')}
                  className="sn-btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('active')}
                  className="sn-btn-primary py-2 px-6 text-xs font-black shadow-md"
                >
                  {submitting ? 'Publishing...' : 'Publish Assignment ✨'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
