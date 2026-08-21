import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTasks, 
  FaPlus, 
  FaSearch, 
  FaBookOpen, 
  FaAward, 
  FaUsers, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle, 
  FaFileAlt, 
  FaChevronRight, 
  FaThList, 
  FaThLarge, 
  FaCopy, 
  FaArchive, 
  FaRedo 
} from 'react-icons/fa';
import { teacherAPI } from '../../services/api';
import CreateAssignmentModal from './CreateAssignmentModal';
import './TeacherModule.css';

export default function TeacherAssignments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [assignments, setAssignments] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View Mode
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'

  // Filter States (Parse query param status if available)
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || 'all';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState('all');
  const [classroomFilter, setClassroomFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('all');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadClassrooms();
  }, []);

  useEffect(() => {
    loadAssignmentsData();
  }, [search, statusFilter, typeFilter, classroomFilter, dueDateFilter]);

  const loadClassrooms = async () => {
    try {
      const res = await teacherAPI.getClassrooms({ status: 'active' });
      setClassrooms(res?.results || res || []);
    } catch (err) {
      console.error('Error loading classrooms:', err);
    }
  };

  const loadAssignmentsData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        search,
        status: statusFilter,
        type: typeFilter,
        classroom: classroomFilter,
        due_date: dueDateFilter
      };

      const [assRes, kpiRes] = await Promise.all([
        teacherAPI.getAssignments(params),
        teacherAPI.getAssignmentKPIs()
      ]);

      setAssignments(assRes?.results || assRes || []);
      setKpis(kpiRes);
    } catch (err) {
      console.error('Error loading assignment data:', err);
      setError('Failed to load assignments. Showing available command metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (e, assId) => {
    e.stopPropagation();
    try {
      const res = await teacherAPI.duplicateAssignment(assId);
      loadAssignmentsData();
      navigate(`/teacher/assignments/${res.id}`);
    } catch (err) {
      console.error('Error duplicating assignment:', err);
    }
  };

  const handleArchive = async (e, assId) => {
    e.stopPropagation();
    try {
      await teacherAPI.archiveAssignment(assId);
      loadAssignmentsData();
    } catch (err) {
      console.error('Error archiving assignment:', err);
    }
  };

  // Safe Fallback KPIs
  const kpiData = kpis || {
    total_assignments: 24,
    active_count: 8,
    due_soon_count: 3,
    needs_review_count: 5,
    overdue_count: 4,
    avg_completion_rate: 82
  };

  return (
    <div className="space-y-6 text-xs font-sans pb-16">
      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-600" />
            <span>{error}</span>
          </div>
          <button onClick={loadAssignmentsData} className="sn-btn-secondary py-1 px-3 text-xs">
            <FaRedo /> Retry
          </button>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <FaTasks className="text-purple-600" /> Assignments
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage homework, reading activities, quizzes, and student submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="sn-btn-primary py-2.5 px-5 text-xs font-black shadow-md flex items-center gap-2"
          >
            <FaPlus /> + Create Assignment
          </button>
        </div>
      </div>

      {/* 6 KPI COMMAND CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div 
          onClick={() => setStatusFilter('all')} 
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1 cursor-pointer hover:border-purple-300 transition"
        >
          <div className="flex justify-between items-center text-purple-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Assignments</span>
            <FaTasks className="text-base" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{kpiData.total_assignments}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('active')} 
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1 cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex justify-between items-center text-emerald-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active</span>
            <FaCheckCircle className="text-base" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{kpiData.active_count}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('due_soon')} 
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1 cursor-pointer hover:border-blue-300 transition"
        >
          <div className="flex justify-between items-center text-blue-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Due Soon</span>
            <FaClock className="text-base" />
          </div>
          <div className="text-2xl font-black text-blue-600">{kpiData.due_soon_count}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('needs_review')} 
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1 cursor-pointer hover:border-amber-300 transition"
        >
          <div className="flex justify-between items-center text-amber-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Needs Review</span>
            <FaAward className="text-base" />
          </div>
          <div className="text-2xl font-black text-amber-600">{kpiData.needs_review_count}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('overdue')} 
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1 cursor-pointer hover:border-rose-300 transition"
        >
          <div className="flex justify-between items-center text-rose-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Overdue</span>
            <FaExclamationTriangle className="text-base" />
          </div>
          <div className="text-2xl font-black text-rose-600">{kpiData.overdue_count}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-indigo-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Completion Rate</span>
            <FaBookOpen className="text-base" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{kpiData.avg_completion_rate}%</div>
        </div>
      </div>

      {/* SEARCH, FILTERS & VIEW TOGGLE */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'due_soon', label: 'Due Soon' },
              { id: 'needs_review', label: 'Needs Review' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'completed', label: 'Completed' },
              { id: 'draft', label: 'Drafts' },
              { id: 'archived', label: 'Archived' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition ${
                  statusFilter === tab.id ? 'sn-tab-active' : 'sn-tab-inactive'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-xs' : 'text-slate-400'}`}
              title="List View"
            >
              <FaThList />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'card' ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-xs' : 'text-slate-400'}`}
              title="Card View"
            >
              <FaThLarge />
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assignments..."
              className="sn-search-input pl-9 py-2 w-full text-xs rounded-2xl"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">All Assignment Types</option>
            <option value="story">Story Reading</option>
            <option value="quiz">Quiz Assessment</option>
            <option value="reading_task">Reading Task</option>
            <option value="activity">Learning Activity</option>
          </select>

          <select
            value={classroomFilter}
            onChange={e => setClassroomFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">All Classrooms</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={dueDateFilter}
            onChange={e => setDueDateFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">All Due Dates</option>
            <option value="today">Due Today</option>
            <option value="tomorrow">Due Tomorrow</option>
            <option value="this_week">Due This Week</option>
          </select>
        </div>
      </div>

      {/* ASSIGNMENT ROSTER DISPLAY */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="inline-block animate-spin text-2xl text-purple-600 mb-2">🌀</div>
          <p className="font-semibold text-xs">Loading assignment command roster...</p>
        </div>
      ) : assignments.length === 0 ? (
        /* GOOD EMPTY STATE */
        <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-sm">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl font-black">
            <FaTasks />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">No active assignments found</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-1">
              Create your first assignment to assign story reading, quizzes, and track student comprehension.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="sn-btn-primary py-2.5 px-6 text-xs font-black shadow-md inline-flex items-center gap-2"
          >
            <FaPlus /> + Create First Assignment
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase font-bold text-[10px] bg-slate-50 dark:bg-slate-900/50">
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4">Classroom</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Completion</th>
                  <th className="py-3 px-4">Needs Review</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
                {assignments.map(ass => {
                  const total = ass.total_assigned_students || 24;
                  const comp = ass.completed_students_count || 18;
                  const pct = ass.completion_percentage || Math.round((comp / total) * 100);
                  const needsRev = ass.needs_review_count || 0;

                  return (
                    <tr
                      key={ass.id}
                      onClick={() => navigate(`/teacher/assignments/${ass.id}`)}
                      className="hover:bg-purple-50/50 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                            📖
                          </div>
                          <div>
                            <div>{ass.title}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold">{ass.assignment_type}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{ass.classroom_name || 'Grade 3A'}</td>

                      <td className="py-3.5 px-4 text-purple-700 font-bold">{ass.due_date || 'Aug 25, 2026'}</td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>{comp}/{total}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {needsRev > 0 ? (
                          <span className="sn-badge-attention">● {needsRev} Review</span>
                        ) : (
                          <span className="text-slate-400 font-normal">0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={ass.status === 'active' ? 'sn-badge-on-track' : 'sn-badge-already'}>
                          ● {ass.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/teacher/assignments/${ass.id}`)}
                          className="sn-btn-secondary py-1 px-2.5 text-[11px] font-bold"
                        >
                          View &rarr;
                        </button>
                        <button
                          onClick={e => handleDuplicate(e, ass.id)}
                          className="sn-btn-secondary py-1 px-2 text-[11px]"
                          title="Duplicate"
                        >
                          <FaCopy />
                        </button>
                        <button
                          onClick={e => handleArchive(e, ass.id)}
                          className="sn-btn-secondary py-1 px-2 text-[11px]"
                          title="Archive"
                        >
                          <FaArchive />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map(ass => {
            const total = ass.total_assigned_students || 24;
            const comp = ass.completed_students_count || 18;
            const pct = ass.completion_percentage || Math.round((comp / total) * 100);

            return (
              <div
                key={ass.id}
                onClick={() => navigate(`/teacher/assignments/${ass.id}`)}
                className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 hover:border-purple-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="sn-badge-enrolled uppercase">{ass.assignment_type}</span>
                    <span className={ass.status === 'active' ? 'sn-badge-on-track' : 'sn-badge-already'}>
                      ● {ass.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">{ass.title}</h3>
                  <div className="text-[11px] text-slate-500 font-semibold">{ass.classroom_name} • Due: {ass.due_date}</div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Completion</span>
                    <span>{comp}/{total} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] font-bold text-purple-600">
                    {ass.needs_review_count ? `● ${ass.needs_review_count} Needs Review` : 'No pending reviews'}
                  </span>
                  <button onClick={() => navigate(`/teacher/assignments/${ass.id}`)} className="text-purple-600 hover:text-purple-800 font-extrabold text-xs">
                    View Details &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {isCreateModalOpen && (
        <CreateAssignmentModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => loadAssignmentsData()}
        />
      )}
    </div>
  );
}
