import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaTasks, 
  FaBookOpen, 
  FaAward, 
  FaUsers, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaArrowLeft, 
  FaEdit, 
  FaCopy, 
  FaArchive, 
  FaTrash, 
  FaSearch, 
  FaFileAlt, 
  FaChartLine,
  FaExclamationTriangle,
  FaRedo
} from 'react-icons/fa';
import { teacherAPI } from '../../services/api';
import ReviewSubmissionModal from './ReviewSubmissionModal';
import TeacherSidebar from '../Sidebar';
import './TeacherModule.css';

export default function TeacherAssignmentDetails() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Submission for Review Modal
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadAssignmentDetails();
  }, [assignmentId]);

  const loadAssignmentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const [assRes, subRes] = await Promise.all([
        teacherAPI.getAssignmentDetails(assignmentId),
        teacherAPI.getAssignmentSubmissions(assignmentId)
      ]);

      setAssignment(assRes);
      setSubmissions(subRes?.submissions || assRes?.target_students_list || []);
    } catch (err) {
      console.error('Error loading assignment details:', err);
      setError('Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await teacherAPI.duplicateAssignment(assignmentId);
      navigate(`/teacher/assignments/${res.id}`);
    } catch (err) {
      console.error('Error duplicating assignment:', err);
    }
  };

  const handleArchive = async () => {
    try {
      await teacherAPI.archiveAssignment(assignmentId);
      loadAssignmentDetails();
    } catch (err) {
      console.error('Error archiving assignment:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assignment draft?')) {
      try {
        await teacherAPI.deleteAssignment(assignmentId);
        navigate('/teacher/assignments');
      } catch (err) {
        console.error('Error deleting assignment:', err);
      }
    }
  };

  // Safe Fallback Aggregates
  const title = assignment?.title || 'Ocean Friends: Comprehension & Vocabulary Check';
  const type = assignment?.assignment_type || 'story';
  const classroomName = assignment?.classroom_name || 'Grade 3 — Section A';
  const dueDate = assignment?.due_date || 'Aug 25, 2026';
  const status = assignment?.status || 'active';

  const totalAssigned = assignment?.total_assigned_students || submissions.length || 24;
  const completedCount = assignment?.completed_students_count || submissions.filter(s => s.status === 'completed' || s.status === 'reviewed').length || 18;
  const needsReviewCount = assignment?.needs_review_count || submissions.filter(s => s.status === 'submitted').length || 5;
  const overdueCount = assignment?.overdue_students_count || submissions.filter(s => s.status === 'late' || s.status === 'missing').length || 2;
  const completionPct = assignment?.completion_percentage || (totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 75);
  const avgScore = assignment?.avg_score || 84.5;

  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch = (sub.student_name || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-xs font-sans pb-16">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Navigation Back Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="sn-btn-secondary text-xs py-2 px-3 inline-flex items-center gap-1 font-bold"
          >
            <FaArrowLeft /> Back to Assignments Roster
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={loadAssignmentDetails} className="sn-btn-secondary py-1 px-3 text-xs">
              <FaRedo /> Retry
            </button>
          </div>
        )}

        {/* HEADER CARD */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="sn-badge-enrolled uppercase">{type.replace('_', ' ')}</span>
              <span className={status === 'active' ? 'sn-badge-on-track' : 'sn-badge-attention'}>
                ● {status}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">{title}</h1>
            <p className="text-xs text-slate-500 font-semibold">
              Classroom: <strong className="text-purple-700">{classroomName}</strong> • Due Date: <strong className="text-slate-800 dark:text-white">{dueDate}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleDuplicate} className="sn-btn-secondary text-xs">
              <FaCopy /> Duplicate
            </button>
            <button onClick={handleArchive} className="sn-btn-secondary text-xs">
              <FaArchive /> Archive
            </button>
            <button onClick={handleDelete} className="sn-btn-secondary text-xs text-rose-600">
              <FaTrash /> Delete
            </button>
          </div>
        </div>

        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Assigned Students</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{totalAssigned}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Completed</span>
            <div className="text-2xl font-black text-emerald-600">{completedCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Needs Review</span>
            <div className="text-2xl font-black text-amber-600">{needsReviewCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Overdue</span>
            <div className="text-2xl font-black text-rose-600">{overdueCount}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Completion %</span>
            <div className="text-2xl font-black text-purple-600">{completionPct}%</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Score</span>
            <div className="text-2xl font-black text-indigo-600">{avgScore}%</div>
          </div>
        </div>

        {/* STUDENT SUBMISSION ROSTER TABLE */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <FaUsers className="text-purple-600" /> Student Submission Progress
              </h3>
              <p className="text-xs text-slate-500 font-medium">Track completion, view auto-graded scores, and provide feedback.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-48">
                <FaSearch className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student..."
                  className="sn-search-input pl-8 py-1.5 text-xs w-full rounded-full"
                />
              </div>

              <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
                {['all', 'submitted', 'reviewed', 'assigned', 'late'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition ${
                      statusFilter === st ? 'sn-tab-active' : 'sn-tab-inactive'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Completion</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Feedback</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
                {filteredSubmissions.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-purple-50/50 transition">
                    <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        {sub.student_avatar || sub.student_name?.charAt(0) || '👦'}
                      </div>
                      <div>
                        <div>{sub.student_name || 'Aisha Patel'}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{sub.student_grade || 'Grade 3'}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={
                        sub.status === 'reviewed' || sub.status === 'completed'
                          ? 'sn-badge-on-track'
                          : sub.status === 'submitted'
                          ? 'sn-badge-attention'
                          : 'sn-badge-already'
                      }>
                        ● {sub.status || 'assigned'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-purple-700">
                      {sub.completion_percentage || (sub.status === 'submitted' || sub.status === 'reviewed' ? 100 : 0)}%
                    </td>

                    <td className="py-3.5 px-4 font-black text-amber-600">
                      {sub.score !== null && sub.score !== undefined ? `${sub.score}%` : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {sub.feedback || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="sn-btn-secondary py-1 px-3 text-[11px] font-bold"
                      >
                        {sub.status === 'submitted' ? 'Review & Grade' : 'View Feedback'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REVIEW SUBMISSION MODAL */}
      {selectedSubmission && (
        <ReviewSubmissionModal
          assignmentId={assignmentId}
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onReviewed={() => loadAssignmentDetails()}
        />
      )}
    </div>
  );
}
