
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import teacherAssignmentService from '../../../services/teacherAssignmentService';
import { useAuth } from '../../../context/AuthContext';
import { FiPlus as Plus, FiSearch as Search, FiFilter as Filter, FiBookOpen as BookOpen, FiClock as Clock, FiCheckCircle as CheckCircle, FiFileText as FileText } from 'react-icons/fi';
import AssignmentCard from './AssignmentCard';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    active: 0,
    due_soon: 0,
    needs_review: 0,
    completion: 0
  });

  const navigate = useNavigate();

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teacherAssignmentService.getAssignments({
        status: statusFilter,
        search: searchQuery
      });
      setAssignments(data);
      
      // Compute simple stats client side for now
      if (statusFilter === 'all' && !searchQuery) {
        let activeCount = 0;
        let completedRecipients = 0;
        let totalRecipients = 0;
        
        data.forEach(a => {
          if (a.status === 'active') activeCount++;
          if (a.stats) {
            completedRecipients += a.stats.completed;
            totalRecipients += a.stats.assigned;
          }
        });
        
        setStats({
          active: activeCount,
          due_soon: data.filter(a => a.status === 'active' && new Date(a.due_date) < new Date(Date.now() + 48*3600*1000)).length,
          needs_review: 0, // Placeholder
          completion: totalRecipients > 0 ? Math.round((completedRecipients / totalRecipients) * 100) : 0
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Assignments</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Create, manage and track student learning tasks.</p>
        </div>
        <button
          onClick={() => navigate('/teacher/assignments/create')}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5" />
          Create Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Active" value={stats.active} color="blue" />
        <StatCard icon={Clock} label="Due Soon" value={stats.due_soon} color="amber" />
        <StatCard icon={FileText} label="Needs Review" value={stats.needs_review} color="rose" />
        <StatCard icon={CheckCircle} label="Completion" value={stats.completion + '%'} color="emerald" />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Drafts</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div></div>
      ) : error ? (
        <div className="text-center py-12 text-rose-500">{error}</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No assignments found</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Create your first assignment and give your students something meaningful to learn.</p>
          <button
            onClick={() => navigate('/teacher/assignments/create')}
            className="btn btn-primary mt-6"
          >
            <Plus className="h-5 w-5" /> Create Assignment
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map(assignment => (
            <AssignmentCard key={assignment.id} assignment={assignment} onClick={() => navigate('/teacher/assignments/' + assignment.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
      <div className={'p-3 rounded-xl mb-3 ' + colors[color]}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</div>
    </div>
  );
};

export default AssignmentsPage;
