
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import teacherAssignmentService from '../../../../services/teacherAssignmentService';
import { FiChevronLeft as ChevronLeft, FiCalendar as Calendar, FiUsers as Users, FiFileText as FileText, FiCheckCircle as CheckCircle, FiClock as Clock } from 'react-icons/fi';
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
      
      // Compute stats since backend might not provide them directly on the object depending on serializer
      if (!assignmentData.stats) {
          const total = recipientsData.length;
          const completed = recipientsData.filter(r => ['submitted', 'reviewed', 'completed'].includes(r.status)).length;
          const inProgress = recipientsData.filter(r => r.status === 'in_progress').length;
          
          assignmentData.stats = {
              assigned: total,
              completed: completed,
              in_progress: inProgress,
              not_started: total - completed - inProgress,
              completion_percentage: total > 0 ? Math.round((completed/total)*100) : 0
          }
      }
      
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
    return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;
  }

  if (error || !assignment) {
    return <div className="text-center py-20 text-rose-500">{error || 'Assignment not found.'}</div>;
  }

  const { stats } = assignment;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/teacher/assignments')}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Assignments
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${assignment.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                {assignment.status}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                {assignment.assignment_type} Assignment
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{assignment.title}</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Content: {assignment.content_title || 'N/A'}</p>
          </div>
          
          <div className="flex gap-2">
            {/* Future: Edit, Duplicate, Archive actions */}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Recipients</h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300">{assignment.classroom_name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {assignment.target_all_students ? 'Entire Classroom' : `${stats.assigned} student(s)`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Timeline</h3>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Available</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{formatDate(assignment.start_date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Due Date</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{formatDate(assignment.due_date)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Instructions</h3>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap line-clamp-3">
            {assignment.instructions || 'No instructions provided.'}
          </p>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Overall Progress</h3>
        
        <div className="flex items-end gap-4 mb-4">
          <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.completion_percentage}%</div>
          <div className="text-slate-500 dark:text-slate-400 pb-1">Completed</div>
        </div>
        
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden mb-6 flex">
          <div className="bg-emerald-500 h-4 transition-all duration-500" style={{ width: `${(stats.completed / Math.max(1, stats.assigned)) * 100}%` }} />
          <div className="bg-amber-400 h-4 transition-all duration-500" style={{ width: `${(stats.in_progress / Math.max(1, stats.assigned)) * 100}%` }} />
        </div>
        
        <div className="grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-700 pt-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Completed</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.in_progress}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 ml-1" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Not Started</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.not_started}</p>
          </div>
        </div>
      </div>

      {/* Recipient List */}
      <RecipientList recipients={recipients} assignmentType={assignment.assignment_type} />
    </div>
  );
};

export default AssignmentDetailsPage;
