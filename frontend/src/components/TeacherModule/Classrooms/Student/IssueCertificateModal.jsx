import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaTimes, FaAward, FaCalendarAlt, FaStar, FaEye, 
  FaPen, FaCheckCircle, FaSpinner, FaTrophy, FaMagic, FaCertificate
} from 'react-icons/fa';

const CERTIFICATE_TEMPLATES = [
  { id: 'reading_completion', label: 'Reading Completion', icon: '📖', color: '#10B981', subtitle: 'For successfully reading, comprehending, and completing a story.' },
  { id: 'reading_excellence', label: 'Reading Excellence', icon: '🦁', color: '#FF6B6B', subtitle: 'For outstanding dedication to reading and literacy.' },
  { id: 'story_explorer', label: 'Story Explorer', icon: '🚀', color: '#4F46E5', subtitle: 'For enthusiastic exploration of imaginative worlds and stories.' },
  { id: 'quiz_champion', label: 'Quiz Champion', icon: '🏆', color: '#F59E0B', subtitle: 'For mastery and high comprehension in reading quizzes.' },
  { id: 'reading_streak', label: 'Streak Master', icon: '🔥', color: '#EF4444', subtitle: 'For remarkable consistency and daily reading streaks.' },
  { id: 'learning_achievement', label: 'Learning Achievement', icon: '🎓', color: '#10B981', subtitle: 'For remarkable progress and learning milestones.' },
  { id: 'creative_storyteller', label: 'Creative Storyteller', icon: '✨', color: '#8B5CF6', subtitle: 'For brilliant creativity, imagination, and expression.' },
  { id: 'bilingual_star', label: 'Bilingual Star', icon: '🌐', color: '#06B6D4', subtitle: 'For excellence in bilingual and multilingual reading.' },
  { id: 'classroom_excellence', label: 'Classroom Excellence', icon: '⭐', color: '#EC4899', subtitle: 'For exemplary attitude and participation in the classroom.' }
];

export default function IssueCertificateModal({ 
  isOpen, 
  onClose, 
  onIssue, 
  studentName = "Student",
  classroomName = "Classroom",
  teacherName = "Teacher"
}) {
  const [template, setTemplate] = useState('reading_excellence');
  const [title, setTitle] = useState('Certificate of Reading Excellence');
  const [reason, setReason] = useState(`Awarded to ${studentName} for outstanding reading consistency and story engagement.`);
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Keep up the wonderful curiosity and passion for stories!');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const selectedTpl = CERTIFICATE_TEMPLATES.find(t => t.id === template);
      if (selectedTpl) {
        setTitle(`Certificate of ${selectedTpl.label}`);
        setReason(`Awarded to ${studentName} ${selectedTpl.subtitle.toLowerCase()}`);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTemplateChange = (e) => {
    const tplId = e.target.value;
    setTemplate(tplId);
    const selectedTpl = CERTIFICATE_TEMPLATES.find(t => t.id === tplId);
    if (selectedTpl) {
      setTitle(`Certificate of ${selectedTpl.label}`);
      setReason(`Awarded to ${studentName} ${selectedTpl.subtitle.toLowerCase()}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a certificate title.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onIssue({
        certificate_type: template,
        title: title.trim(),
        description: `${reason.trim()}\n\n${description.trim()}`.trim(),
        issued_date: issuedDate
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to issue certificate.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentTemplate = CERTIFICATE_TEMPLATES.find(t => t.id === template) || CERTIFICATE_TEMPLATES[0];

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-50/60 to-amber-50/60 dark:from-slate-800 dark:to-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center text-xl shadow-md">
              <FaAward />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">
                Issue Certificate
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Award an official StoryNest achievement certificate to <span className="text-rose-500 font-extrabold">{studentName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'edit' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FaPen className="inline mr-1.5" /> Form
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'preview' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FaEye className="inline mr-1.5" /> Preview
              </button>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-4 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <FaTimes /> {error}
            </div>
          )}

          {viewMode === 'preview' ? (
            /* Live Certificate Preview Card */
            <div className="py-4">
              <div 
                className="relative mx-auto max-w-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FFF8EE] border-8 border-double border-amber-300 dark:border-amber-700 rounded-3xl p-8 sm:p-12 shadow-xl text-center overflow-hidden select-none"
              >
                {/* Decorative corner ribbons */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-amber-400 to-rose-400 rotate-45 opacity-20"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-tr from-amber-400 to-rose-400 rotate-45 opacity-20"></div>

                {/* Badge Icon */}
                <div className="text-5xl mb-3">{currentTemplate.icon}</div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1">
                  StoryNest Official Award
                </div>
                
                <h2 className="serif-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-900 mb-4 tracking-tight">
                  {title}
                </h2>

                <p className="text-xs font-medium text-slate-500 mb-2">This is proudly presented to</p>
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 underline decoration-rose-300 decoration-wavy decoration-2 underline-offset-8 mb-4">
                  {studentName}
                </div>

                <p className="text-sm font-semibold text-slate-700 max-w-lg mx-auto leading-relaxed mb-3">
                  {reason}
                </p>

                {description && (
                  <p className="text-xs italic text-slate-500 max-w-md mx-auto mb-6">
                    "{description}"
                  </p>
                )}

                {/* Bottom Signature Line */}
                <div className="pt-6 border-t border-amber-200 flex justify-between items-end text-left mt-6">
                  <div>
                    <div className="text-xs font-bold text-slate-400">Classroom</div>
                    <div className="font-extrabold text-xs text-slate-800">{classroomName}</div>
                    <div className="text-[10px] text-slate-400">{new Date(issuedDate).toLocaleDateString()}</div>
                  </div>

                  <div className="w-16 h-16 rounded-full border-4 border-amber-400/60 bg-amber-100 flex items-center justify-center shadow-inner">
                    <span className="text-2xl">🎖️</span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400">Certified By</div>
                    <div className="font-extrabold text-xs text-slate-800 font-serif italic text-base">{teacherName}</div>
                    <div className="text-[10px] text-slate-400">Lead Educator</div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  ← Back to Editing Details
                </button>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <form id="issue-cert-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Template Selection Cards */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-2">
                  1. Select Certificate Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CERTIFICATE_TEMPLATES.map((t) => {
                    const isSelected = template === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTemplate(t.id);
                          setTitle(`Certificate of ${t.label}`);
                          setReason(`Awarded to ${studentName} ${t.subtitle.toLowerCase()}`);
                        }}
                        className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 shadow-sm ring-2 ring-rose-400/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/60 dark:bg-slate-800/40'
                        }`}
                      >
                        <span className="text-2xl mb-1">{t.icon}</span>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white text-center leading-tight">
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                  2. Certificate Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                  placeholder="e.g. Certificate of Reading Excellence"
                  required
                />
              </div>

              {/* Reason / Achievement */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                  3. Achievement / Reason *
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm resize-none"
                  placeholder="e.g. For reading 10 stories with distinction and showing great enthusiasm."
                  required
                />
              </div>

              {/* Row: Date & Optional Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                    Teacher Note / Personal Message (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                    placeholder="e.g. So proud of your hard work!"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm"
          >
            {viewMode === 'edit' ? <><FaEye /> Preview Certificate</> : <><FaPen /> Edit Details</>}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="issue-cert-form"
              disabled={submitting}
              className="px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}
            >
              {submitting ? (
                <><FaSpinner className="animate-spin" /> Issuing...</>
              ) : (
                <><FaAward /> Issue Certificate</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
