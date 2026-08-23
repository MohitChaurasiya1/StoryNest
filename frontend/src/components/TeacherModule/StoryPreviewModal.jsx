import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBookOpen, 
  FaTimes, 
  FaAward, 
  FaTasks, 
  FaHeart, 
  FaRegHeart, 
  FaCheckCircle, 
  FaClock, 
  FaLightbulb, 
  FaBookReader, 
  FaChalkboardTeacher 
} from 'react-icons/fa';
import { teacherAPI } from '../../services/api';

export default function StoryPreviewModal({ story, onClose, onAssign, onUseInLesson, onToggleSave }) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(story.is_saved || false);
  const [saving, setSaving] = useState(false);

  const handleSaveToggle = async () => {
    try {
      setSaving(true);
      const res = await teacherAPI.toggleSaveStory(story.id);
      setIsSaved(res.is_saved);
      if (onToggleSave) onToggleSave(story.id, res.is_saved);
    } catch (err) {
      console.error('Error toggling save:', err);
    } finally {
      setSaving(false);
    }
  };

  const estReadTime = Math.max(8, (story.num_pages || 5) * 2);

  // SVG Fallback for missing cover image
  const getCoverFallback = (title, theme) => {
    const hue = (title.charCodeAt(0) * 15) % 360;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center" style={{ background: `linear-gradient(135deg, hsl(${hue}, 80%, 90%), hsl(${hue + 40}, 80%, 80%))` }}>
        <FaBookOpen className="text-5xl mb-3 opacity-50" style={{ color: `hsl(${hue}, 80%, 40%)` }} />
        <span className="font-extrabold text-sm opacity-80 line-clamp-2" style={{ color: `hsl(${hue}, 80%, 30%)` }}>
          {title}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-black text-lg">
              <FaBookOpen />
            </div>
            <div>
              <span className="sn-badge-enrolled uppercase border-none bg-white/20 text-white backdrop-blur-sm shadow-sm">{story.language || 'English'}</span>
              <h3 className="font-extrabold text-base text-white mt-1.5">{story.title_en}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`p-2.5 rounded-xl border transition font-bold text-xs flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              {isSaved ? <FaHeart /> : <FaRegHeart />}
              <span>{isSaved ? 'Saved' : 'Save Story'}</span>
            </button>

            <button onClick={onClose} className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition">
              <FaTimes className="text-base" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
          {/* Main Info Card */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="h-44 w-full md:w-36 rounded-2xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0 overflow-hidden relative flex items-center justify-center shadow-sm">
              {story.cover_image_url ? (
                <img src={story.cover_image_url} alt={story.title_en} className="w-full h-full object-cover" />
              ) : (
                getCoverFallback(story.title_en, story.theme)
              )}
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2 font-bold">
                <span className="sn-badge-available bg-indigo-100 text-indigo-700 border-indigo-200">{story.grade || 'Grade 2'}</span>
                <span className="sn-badge-on-track bg-emerald-100 text-emerald-700 border-emerald-200">{story.reading_difficulty || 'Beginner'}</span>
                <span className="sn-badge-already flex items-center gap-1">
                  <FaClock /> ~{estReadTime} min read
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">About</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {story.description || story.moral || 'A captivating StoryNest reading adventure designed for young learners.'}
                </p>
              </div>

              {/* Classroom Performance Stats */}
              {(story.assigned_count > 0 || story.lessons_count > 0) && (
                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-600 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><FaTasks/></div>
                    <span>Assigned to <strong className="text-purple-700">{story.assigned_count}</strong> classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><FaChalkboardTeacher/></div>
                    <span>Used in <strong className="text-indigo-700">{story.lessons_count}</strong> lessons</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Learning Objectives Section */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-sm border-b pb-2">
                <FaLightbulb className="text-amber-500" /> Learning Skills
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Moral Lesson</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">{story.moral || 'Courage & Decision Making'}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Vocabulary Theme</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">{story.vocab_theme || 'Nature & Friendship'}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Focus Behavior</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">{story.encouraged_behavior || 'Helping Others'}</span>
                </div>
              </div>
            </div>

            {/* Assessment Section */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-sm border-b pb-2">
                <FaAward className="text-purple-500" /> Assessment
              </h4>

              <div className={`p-4 rounded-2xl border ${story.has_quiz ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'} h-[calc(100%-40px)] flex flex-col justify-center`}>
                {story.has_quiz ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-black text-emerald-700">
                      <FaCheckCircle className="text-lg" /> Comprehension Quiz
                    </div>
                    <ul className="text-xs text-emerald-800/80 font-medium space-y-1 ml-6 list-disc">
                      <li>5 standardized questions</li>
                      <li>Automated grading</li>
                      <li>Tests vocabulary & theme</li>
                    </ul>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 font-bold space-y-2">
                    <div className="text-2xl opacity-50">📖</div>
                    <div>Standard reading activity without quiz.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t flex flex-wrap sm:flex-nowrap justify-between items-center gap-3 shrink-0">
          <button
            onClick={() => { onClose(); navigate(`/story/${story.id}`); }}
            className="sn-btn-secondary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-2"
          >
            <FaBookReader className="text-purple-600" /> Read Story
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => { onClose(); if (onAssign) onAssign(story); }}
              className="sn-btn-secondary flex-1 sm:flex-none py-2.5 px-5 text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              <FaTasks /> Assign
            </button>
            <button
              onClick={() => { onClose(); if (onUseInLesson) onUseInLesson(story); }}
              className="sn-btn-primary flex-1 sm:flex-none py-2.5 px-5 text-xs font-black shadow-md inline-flex items-center justify-center gap-1.5"
            >
              <FaChalkboardTeacher /> Use in Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
