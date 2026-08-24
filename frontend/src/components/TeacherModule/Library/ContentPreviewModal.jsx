import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import teacherLibraryService from '../../../services/teacherLibraryService';
import { FaTimes, FaSpinner, FaExclamationTriangle, FaBookOpen, FaLayerGroup, FaQuestionCircle, FaPlus } from 'react-icons/fa';

const ContentPreviewModal = ({ item, onClose }) => {
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await teacherLibraryService.getContentDetails(item.type, item.id);
        setDetails(data);
      } catch (err) {
        setError(err.message || 'Could not load preview details.');
      } finally {
        setLoading(false);
      }
    };
    
    if (item?.id && item?.type) {
      fetchDetails();
    }
  }, [item]);

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

  const handleCreateAssignment = () => {
    onClose();
    navigate(`/teacher/assignments/create?contentType=${item.type}&contentId=${item.id}&contentTitle=${encodeURIComponent(item.title || '')}`);
  };

  const getTypeBadge = () => {
    switch (item.type) {
      case 'story':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <FaBookOpen className="text-[11px]" /> Story Preview
          </span>
        );
      case 'lesson':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            <FaLayerGroup className="text-[11px]" /> Lesson Preview
          </span>
        );
      case 'quiz':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            <FaQuestionCircle className="text-[11px]" /> Quiz Preview
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Preview
          </span>
        );
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
      aria-labelledby="preview-modal-title"
    >
      {/* Modal Dialog Card */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in"
        style={{ 
          width: 'min(850px, 92vw)',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shrink-0">
          <div className="flex flex-col gap-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              {getTypeBadge()}
              {(item.creator?.type === 'system' || item.creator?.name === 'StoryNest') && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                  ✨ Suggested
                </span>
              )}
              {item.grade && (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  Grade {item.grade}
                </span>
              )}
            </div>
            <h2 
              id="preview-modal-title"
              className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate"
            >
              {item.title}
            </h2>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 sm:px-8 space-y-6">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <FaSpinner className="animate-spin text-rose-500 mb-3" size={28} />
              <p className="text-sm font-medium">Loading content preview...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3">
              <FaExclamationTriangle className="shrink-0" size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && details && (
            <div className="space-y-6">
              {/* Story Content View */}
              {item.type === 'story' && (
                <div>
                  {/* Top metadata overview */}
                  <div className="flex flex-col sm:flex-row gap-5 p-5 bg-rose-50/40 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-700/80 rounded-2xl mb-6">
                    {details.cover_image_url && (
                      <img 
                        src={details.cover_image_url} 
                        alt={details.title} 
                        className="w-full sm:w-36 h-36 object-cover rounded-xl shadow-sm shrink-0" 
                      />
                    )}
                    <div className="flex-1 space-y-3">
                      {details.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {details.description}
                        </p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                          <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Grade</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{details.grade || 'All'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                          <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Difficulty</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{details.reading_difficulty || 'Standard'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                          <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Pages</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{details.num_pages || details.pages?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Story Pages Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Story Pages Preview
                    </h3>
                    
                    {details.pages && details.pages.length > 0 ? (
                      <div className="space-y-3">
                        {details.pages.map((page, i) => (
                          <div 
                            key={i} 
                            className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-sm">
                                Page {page.page_number || i + 1}
                              </span>
                            </div>
                            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                              {page.text_en || page.text_hi || page.text || 'No text content on this page.'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        No pages available to preview for this story.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lesson Content View */}
              {item.type === 'lesson' && (
                <div className="space-y-4">
                  <div className="p-5 bg-sky-50/40 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700 rounded-2xl space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Lesson Overview</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {details.description || 'Interactive reading and vocabulary lesson customized for classroom learning.'}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2">
                      <span>Status: <strong className="text-emerald-600 capitalize">{details.status || 'Active'}</strong></span>
                      <span>Target: <strong>Grade {details.grade || 'All'}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Content View */}
              {item.type === 'quiz' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Comprehension Questions ({details.questions?.length || 0})
                  </h3>

                  {details.questions && details.questions.length > 0 ? (
                    <div className="space-y-4">
                      {details.questions.map((q, i) => (
                        <div 
                          key={i} 
                          className="p-5 rounded-2xl bg-purple-50/30 dark:bg-slate-800/70 border border-purple-100 dark:border-slate-700 space-y-3"
                        >
                          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {i + 1}. {q.question_text || q.question}
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {q.options && q.options.map((opt, oIdx) => {
                              const letter = String.fromCharCode(65 + oIdx);
                              const isCorrect = letter === q.correct_option || opt === q.correct_answer;
                              return (
                                <div 
                                  key={oIdx} 
                                  className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2.5 border transition-all ${
                                    isCorrect 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold shadow-sm' 
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    isCorrect 
                                      ? 'bg-emerald-600 text-white' 
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                  }`}>
                                    {letter}
                                  </span>
                                  <span className="truncate">{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                      No questions configured for this quiz.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Close
          </button>
          
          {!loading && !error && (
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleCreateAssignment}
            >
              <FaPlus className="text-sm mr-1.5" />
              Assign this {item.type}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ContentPreviewModal;
