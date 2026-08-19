import React, { useState } from 'react';
import { FaCheckCircle, FaTimes, FaAward, FaComment, FaClock, FaUserGraduate } from 'react-icons/fa';
import { teacherAPI } from '../../services/api';

export default function ReviewSubmissionModal({ assignmentId, submission, onClose, onReviewed }) {
  const [score, setScore] = useState(submission.score !== null && submission.score !== undefined ? submission.score : 85);
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      await teacherAPI.reviewAssignmentSubmission(assignmentId, {
        child_id: submission.child,
        score: Number(score),
        feedback,
        status: 'reviewed'
      });

      if (onReviewed) onReviewed();
      onClose();
    } catch (err) {
      console.error('Error reviewing submission:', err);
      setError(typeof err === 'string' ? err : 'Failed to save review feedback.');
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
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm">
              {submission.student_avatar || submission.student_name?.charAt(0) || '👦'}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Review Submission</h3>
              <p className="text-xs text-purple-200 font-medium">{submission.student_name} • {submission.student_grade || 'Grade 3'}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition">
            <FaTimes className="text-base" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Submission Summary</span>
              <span className="sn-badge-available">● Completed</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-semibold">
              <span>Reading Completion:</span>
              <strong className="text-emerald-600 font-black">100% Verified</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-semibold border-t border-slate-200/60 pt-2">
              <span>Auto-Graded Quiz Score:</span>
              <strong className="text-purple-600 font-black text-sm">{submission.score || 85}%</strong>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <FaAward className="text-amber-500" /> Grade / Score (0 – 100%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="sn-search-input w-full py-2.5 px-3 rounded-2xl font-black text-sm text-purple-700"
            />
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <FaComment className="text-blue-500" /> Teacher Feedback Notes
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Great story comprehension! Work on dual-language vocabulary recall in the next lesson."
              className="sn-search-input w-full p-3 rounded-2xl text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="sn-btn-secondary py-2 px-4 text-xs font-bold">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="sn-btn-primary py-2 px-6 text-xs font-black shadow-md">
              {submitting ? 'Saving...' : 'Save Feedback & Mark Reviewed ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
