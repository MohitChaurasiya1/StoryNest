import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import teacherAssignmentService from '../../../../services/teacherAssignmentService';
import {
  FiChevronLeft,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBookOpen,
  FiHelpCircle,
  FiPlayCircle
} from 'react-icons/fi';
import RecipientList from './RecipientList';

const AssignmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignmentData = useCallback(async () => {
    try {
      setLoading(true);
      const [assignmentData, recipientsData] = await Promise.all([
        teacherAssignmentService.getAssignment(id),
        teacherAssignmentService.getRecipients(id)
      ]);

      const total = recipientsData.length;
      const completed = recipientsData.filter((r) => ['submitted', 'reviewed', 'completed'].includes(r.status)).length;
      const inProgress = recipientsData.filter((r) => r.status === 'in_progress').length;
      const overdue = recipientsData.filter((r) => r.status === 'overdue' || r.is_overdue).length;
      const notStarted = recipientsData.filter((r) => r.status === 'not_started' || r.status === 'assigned').length;

      assignmentData.stats = {
        assigned: total,
        completed: completed,
        in_progress: inProgress,
        not_started: notStarted,
        overdue: overdue,
        completion_percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };

      setAssignment(assignmentData);
      setRecipients(recipientsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssignmentData();
  }, [fetchAssignmentData]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-[#FF6B6B] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-2xl border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 font-bold">
          {error || 'Assignment not found.'}
        </div>
        <button
          onClick={() => navigate('/teacher/assignments')}
          className="btn btn-secondary text-xs mt-4"
        >
          ← Back to Assignments
        </button>
      </div>
    );
  }

  const { stats } = assignment;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'story': return FiBookOpen;
      case 'quiz': return FiHelpCircle;
      case 'lesson': return FiPlayCircle;
      default: return FiBookOpen;
    }
  };

  const ContentIcon = getIcon(assignment.assignment_type);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/teacher/assignments')}
        className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 group transition-colors"
      >
        <FiChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Assignments
      </button>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-gradient-to-br from-coral-50 to-orange-50 dark:from-coral-950/40 dark:to-orange-950/20 text-[#FF6B6B] rounded-2xl shadow-xs shrink-0">
            <ContentIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-coral-50 text-[#FF6B6B] border border-coral-200/60">
                {assignment.assignment_type} Assignment
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                {assignment.status}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {assignment.title}
            </h1>
            {assignment.content_title && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Attached Content: <strong className="text-slate-900 dark:text-white">{assignment.content_title}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(`/teacher/classrooms/${assignment.classroom_id}`)}
            className="btn btn-secondary text-xs font-bold flex items-center gap-1.5"
          >
            <FiUsers className="w-3.5 h-3.5 text-[#FF6B6B]" />
            {assignment.classroom_name}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-coral-50 dark:bg-coral-950/30 text-[#FF6B6B] rounded-xl">
              <FiUsers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Target Recipients</h3>
          </div>
          <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">{assignment.classroom_name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {assignment.target_all_students ? 'Entire Classroom' : `${stats.assigned} Targeted Students`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-coral-50 dark:bg-coral-950/30 text-[#FF6B6B] rounded-xl">
              <FiCalendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Timeline</h3>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Available:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(assignment.start_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due Date:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(assignment.due_date)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-coral-50 dark:bg-coral-950/30 text-[#FF6B6B] rounded-xl">
              <FiFileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Instructions</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-3">
            {assignment.instructions || 'No special instructions specified.'}
          </p>
        </div>
      </div>

      {/* Progress Breakdown Cards */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Assignment Completion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live submission breakdown across all {stats.assigned} assigned students.
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">
              {stats.completion_percentage}%
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase">Completed</span>
          </div>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3.5 overflow-hidden mb-6 flex">
          <div
            className="bg-emerald-500 h-3.5 transition-all duration-500"
            style={{ width: `${(stats.completed / Math.max(1, stats.assigned)) * 100}%` }}
          />
          <div
            className="bg-amber-400 h-3.5 transition-all duration-500"
            style={{ width: `${(stats.in_progress / Math.max(1, stats.assigned)) * 100}%` }}
          />
          <div
            className="bg-rose-500 h-3.5 transition-all duration-500"
            style={{ width: `${(stats.overdue / Math.max(1, stats.assigned)) * 100}%` }}
          />
        </div>

        {/* 4 Detail Metric Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-700 pt-6">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
              <FiUsers className="w-3.5 h-3.5 text-slate-400" />
              <span>Assigned</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.assigned}</p>
          </div>

          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-1">
              <FiCheckCircle className="w-3.5 h-3.5" />
              <span>Completed</span>
            </div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{stats.completed}</p>
          </div>

          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold mb-1">
              <FiClock className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{stats.in_progress}</p>
          </div>

          <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-bold mb-1">
              <FiAlertCircle className="w-3.5 h-3.5" />
              <span>Overdue</span>
            </div>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-300">{stats.overdue}</p>
          </div>
        </div>
      </div>

      {/* Recipient List with Interactive Filter Tabs */}
      <RecipientList
        recipients={recipients}
        assignmentType={assignment.assignment_type}
        classroomId={assignment.classroom_id}
      />
    </div>
  );
};

export default AssignmentDetailsPage;
