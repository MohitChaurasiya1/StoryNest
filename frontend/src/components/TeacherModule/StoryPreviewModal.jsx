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
  FaExternalLinkAlt 
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
              <span className="sn-badge-enrolled uppercase">{story.language || 'English'}</span>
              <h3 className="font-extrabold text-base text-white mt-1">{story.title_en}</h3>
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
            <div className="h-44 w-full md:w-36 rounded-2xl bg-slate-100 dark:bg-slate-700 border shrink-0 overflow-hidden relative flex items-center justify-center">
              {story.cover_image_url ? (
                <img src={story.cover_image_url} alt={story.title_en} className="w-full h-full object-cover" />
              ) : (
                <FaBookOpen className="text-5xl text-slate-300 dark:text-slate-500" />
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="sn-badge-available font-bold">{story.grade || 'Grade 2'}</span>
                <span className="sn-badge-on-track font-bold">{story.reading_difficulty || 'Beginner'} Reader</span>
                <span className="sn-badge-already font-bold flex items-center gap-1">
                  <FaClock /> ~{estReadTime} min read
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {story.description || story.moral || 'A captivating StoryNest reading adventure designed for young learners.'}
              </p>

              <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-500 pt-1">
                <span>Assigned in <strong className="text-purple-600">{story.assigned_count || 0}</strong> classrooms</span>
                <span>•</span>
                <span>Used in <strong className="text-indigo-600">{story.lessons_count || 0}</strong> lessons</span>
              </div>
            </div>
          </div>

          {/* Educational Value & Skills Section */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border space-y-3">
            <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-xs">
              <FaLightbulb className="text-amber-500" /> Learning Skills & Moral Values
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Moral Lesson</div>
                <div className="font-extrabold text-slate-800 dark:text-slate-200">{story.moral || 'Courage & Decision Making'}</div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Vocabulary Theme</div>
                <div className="font-extrabold text-slate-800 dark:text-slate-200">{story.vocab_theme || 'Nature & Friendship'}</div>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Encouraged Behavior</div>
                <div className="font-extrabold text-slate-800 dark:text-slate-200">{story.encouraged_behavior || 'Helping Others'}</div>
              </div>
            </div>
          </div>

          {/* Assessment & Quiz Section */}
          <div className="p-5 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <FaAward className="text-purple-600 text-base" /> Comprehension Assessment
              </div>
              <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                {story.has_quiz ? 'Includes a 5-question reading comprehension quiz with automated grading.' : 'Standard reading activity without quiz.'}
              </p>
            </div>

            <span className={story.has_quiz ? 'sn-badge-on-track' : 'sn-badge-already'}>
              {story.has_quiz ? '● Quiz Available' : 'No Quiz'}
            </span>
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
              onClick={() => { onClose(); if (onUseInLesson) onUseInLesson(story); }}
              className="sn-btn-secondary flex-1 sm:flex-none py-2.5 px-4 text-xs font-bold"
            >
              Use in Lesson
            </button>
            <button
              onClick={() => { onClose(); if (onAssign) onAssign(story); }}
              className="sn-btn-primary flex-1 sm:flex-none py-2.5 px-5 text-xs font-black shadow-md inline-flex items-center gap-1.5"
            >
              <FaTasks /> Assign Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
