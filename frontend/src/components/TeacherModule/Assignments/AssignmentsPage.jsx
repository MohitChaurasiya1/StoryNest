import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import teacherAssignmentService from '../../../services/teacherAssignmentService';
import teacherClassroomService from '../../../services/teacherClassroomService';
import {
  FiPlus,
  FiSearch,
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiCalendar,
  FiChevronRight,
  FiUser
} from 'react-icons/fi';
import AssignmentCard from './AssignmentCard';

const AssignmentsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [assignments, setAssignments] = useState([]);
  const [studentAssignmentsData, setStudentAssignmentsData] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [classroomFilter, setClassroomFilter] = useState(searchParams.get('classroom_id') || '');
  const [studentFilter, setStudentFilter] = useState(searchParams.get('student_id') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // 1. Fetch Classrooms for Filter Dropdown
  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        const results = await teacherClassroomService.getClassrooms({ status: 'active' });
        setClassrooms(results || []);
      } catch (err) {
        console.error('Failed to load classrooms:', err);
      }
    };
    loadClassrooms();
  }, []);

  // 2. Fetch Students when Classroom changes
  useEffect(() => {
    if (classroomFilter) {
      const loadStudents = async () => {
        setLoadingStudents(true);
        try {
          const results = await teacherClassroomService.getStudents(classroomFilter);
          setStudents(results || []);
        } catch (err) {
          console.error('Failed to load classroom students:', err);
          setStudents([]);
        } finally {
          setLoadingStudents(false);
        }
      };
      loadStudents();
    } else {
      setStudents([]);
      setStudentFilter('');
    }
  }, [classroomFilter]);

  // 3. Fetch Assignments or Student-Specific Assignments
  const fetchAssignmentsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (studentFilter) {
        // Fetch specific student assignments breakdown
        const res = await teacherAssignmentService.getStudentAssignments(studentFilter, classroomFilter || null);
        setStudentAssignmentsData(res);
        setAssignments([]);
      } else {
        setStudentAssignmentsData(null);
        const filters = {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          classroom_id: classroomFilter || undefined,
          search: searchQuery || undefined
        };
        const data = await teacherAssignmentService.getAssignments(filters);
        setAssignments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load assignment records.');
    } finally {
      setLoading(false);
    }
  }, [classroomFilter, studentFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchAssignmentsData();
  }, [fetchAssignmentsData]);

  // Handle Filter Changes
  const handleClassroomChange = (val) => {
    setClassroomFilter(val);
    setStudentFilter('');
  };

  const handleStudentChange = (val) => {
    setStudentFilter(val);
  };

  // Group assignments into Active vs Previous
  const activeAssignments = assignments.filter((a) => a.stats?.is_active !== false);
  const previousAssignments = assignments.filter((a) => a.stats?.is_active === false);

  // Aggregated Real Stats across all fetched assignments
  const totalAssignedRecipients = assignments.reduce((acc, a) => acc + (a.stats?.assigned || 0), 0);
  const totalCompletedRecipients = assignments.reduce((acc, a) => acc + (a.stats?.completed || 0), 0);
  const totalOverdueRecipients = assignments.reduce((acc, a) => acc + (a.stats?.overdue || 0), 0);
  const overallCompletionRate = totalAssignedRecipients > 0 ? Math.round((totalCompletedRecipients / totalAssignedRecipients) * 100) : 0;

  const selectedStudentObj = students.find((s) => s.id === parseInt(studentFilter) || s.child_id === parseInt(studentFilter));
  const selectedClassroomObj = classrooms.find((c) => c.id === parseInt(classroomFilter));

  const formatStudentDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Assignments</h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Create, manage, and track student learning tasks with real-time completion analytics.
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/assignments/create')}
          className="btn btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <FiPlus className="h-5 w-5" />
          Create Assignment
        </button>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FiBookOpen}
          label="Active Tasks"
          value={studentFilter && studentAssignmentsData ? studentAssignmentsData.stats?.active : activeAssignments.length}
          color="coral"
          sub="Live assignments"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Completed"
          value={studentFilter && studentAssignmentsData ? studentAssignmentsData.stats?.completed : totalCompletedRecipients}
          color="emerald"
          sub="Submissions verified"
        />
        <StatCard
          icon={FiAlertCircle}
          label="Overdue"
          value={studentFilter && studentAssignmentsData ? studentAssignmentsData.stats?.overdue : totalOverdueRecipients}
          color="rose"
          sub="Requires follow-up"
        />
        <StatCard
          icon={FiClock}
          label="Completion Rate"
          value={`${studentFilter && studentAssignmentsData ? studentAssignmentsData.stats?.completion_percentage : overallCompletionRate}%`}
          color="blue"
          sub="Class average"
        />
      </div>

      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Classroom Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Classroom
            </label>
            <select
              value={classroomFilter}
              onChange={(e) => handleClassroomChange(e.target.value)}
              className="w-full text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-3.5 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-coral-500"
            >
              <option value="">All Classrooms</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Student
            </label>
            <select
              value={studentFilter}
              onChange={(e) => handleStudentChange(e.target.value)}
              disabled={!classroomFilter}
              className={`w-full text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-3.5 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-coral-500 ${
                !classroomFilter ? 'opacity-60 cursor-not-allowed text-slate-400' : ''
              }`}
            >
              <option value="">{classroomFilter ? 'All Students in Class' : 'Select a classroom first'}</option>
              {students.map((s) => (
                <option key={s.id || s.child_id} value={s.id || s.child_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-3.5 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-coral-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Search
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-coral-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-[#FF6B6B] border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </div>
      ) : studentFilter && studentAssignmentsData ? (
        /* ========================================================================= */
        /* 3. STUDENT ASSIGNMENT VIEW (When Classroom + Student are selected)        */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-coral-50 dark:bg-coral-950/40 flex items-center justify-center text-3xl shadow-xs">
                {selectedStudentObj?.avatar || '🧑‍🎓'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedStudentObj?.name || 'Student'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-coral-50 text-[#FF6B6B] border border-coral-200/60">
                    {selectedClassroomObj?.name || 'Classroom'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Individual Assignment Status & Submission History
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/teacher/classrooms/${classroomFilter}/students/${studentFilter}`)}
              className="btn btn-secondary text-xs font-bold flex items-center gap-2"
            >
              <FiUser className="w-3.5 h-3.5" />
              Open Student Profile
            </button>
          </div>

          {/* Student Assignments List */}
          {studentAssignmentsData.all?.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <FiBookOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No assignments found for this student</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assign a story or comprehension quiz to get started.</p>
              <button
                onClick={() => navigate('/teacher/assignments/create')}
                className="btn btn-primary text-xs mt-5"
              >
                + Assign Work
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {studentAssignmentsData.all?.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-coral-50 text-[#FF6B6B] border border-coral-200/60">
                        {item.assignment_type}
                      </span>
                      <StudentStatusBadge status={item.status} />
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>Due: <strong className="text-slate-700 dark:text-slate-300">{formatStudentDate(item.due_date)}</strong></span>
                      {item.completed_at && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Completed: {formatStudentDate(item.completed_at)}
                        </span>
                      )}
                      {item.score !== null && item.score !== undefined && (
                        <span>Score: <strong className="text-slate-900 dark:text-white">{item.score}%</strong></span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/teacher/assignments/${item.id}`)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#FF6B6B] bg-coral-50 hover:bg-coral-100 dark:bg-coral-900/20 dark:hover:bg-coral-900/40 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    View Assignment
                    <FiChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 5 & 6. MAIN ASSIGNMENT LIST (Separated Active vs Previous)                */
        /* ========================================================================= */
        <div className="space-y-10">
          {/* Active Assignments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Active Assignments
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {activeAssignments.length}
                </span>
              </div>
            </div>

            {activeAssignments.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <FiBookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active assignments</p>
                <p className="text-xs text-slate-400 mt-0.5">Active tasks whose due dates have not passed will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => navigate(`/teacher/assignments/${assignment.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Previous Assignments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Previous Assignments
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {previousAssignments.length}
                </span>
              </div>
            </div>

            {previousAssignments.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <FiClock className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No previous assignments</p>
                <p className="text-xs text-slate-400 mt-0.5">Past assignments whose due dates have elapsed will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {previousAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => navigate(`/teacher/assignments/${assignment.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StudentStatusBadge = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          ✓ Completed
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          ◐ In Progress
        </span>
      );
    case 'overdue':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
          ⚠ Overdue
        </span>
      );
    case 'not_started':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
          ○ Not Started
        </span>
      );
  }
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => {
  const colorStyles = {
    coral: 'bg-coral-50 text-[#FF6B6B] dark:bg-coral-950/30 dark:text-[#FF6B6B]',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    blue: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
      <div className={`p-3.5 rounded-2xl ${colorStyles[color]} shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export default AssignmentsPage;
