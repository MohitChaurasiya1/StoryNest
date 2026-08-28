import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronRight, FiUser, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const RecipientList = ({ recipients = [], assignmentType, classroomId }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'completed' | 'in_progress' | 'not_started' | 'overdue'

  const getFilteredRecipients = () => {
    return recipients.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === 'all') return true;
      return r.status === activeTab;
    });
  };

  const filtered = getFilteredRecipients();

  const getStatusBadge = (status, isOverdue) => {
    switch (status) {
      case 'completed':
      case 'reviewed':
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            ✓ Completed
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
            ⚠ Overdue
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            ◐ In Progress
          </span>
        );
      case 'not_started':
      case 'assigned':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            ○ Not Started
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const counts = {
    all: recipients.length,
    completed: recipients.filter((r) => r.status === 'completed' || r.status === 'submitted' || r.status === 'reviewed').length,
    in_progress: recipients.filter((r) => r.status === 'in_progress').length,
    not_started: recipients.filter((r) => r.status === 'not_started' || r.status === 'assigned').length,
    overdue: recipients.filter((r) => r.status === 'overdue' || r.is_overdue).length
  };

  const handleStudentClick = (studentId) => {
    if (classroomId) {
      navigate(`/teacher/classrooms/${classroomId}/students/${studentId}`);
    } else {
      navigate(`/teacher/progress/students/${studentId}`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Assigned Students</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any student to inspect their detailed learning dashboard and submission history.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-coral-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
        {[
          { id: 'all', label: 'All Students', count: counts.all },
          { id: 'completed', label: 'Completed', count: counts.completed, color: 'text-emerald-600' },
          { id: 'in_progress', label: 'In Progress', count: counts.in_progress, color: 'text-amber-600' },
          { id: 'not_started', label: 'Not Started', count: counts.not_started, color: 'text-slate-500' },
          { id: 'overdue', label: 'Overdue', count: counts.overdue, color: 'text-rose-600' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Progress
              </th>
              {assignmentType === 'quiz' && (
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Score
                </th>
              )}
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Completed Date
              </th>
              <th scope="col" className="relative px-6 py-3.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {filtered.length > 0 ? (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => handleStudentClick(r.id)}
                  className="hover:bg-coral-50/40 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-coral-50 dark:bg-coral-950/40 flex items-center justify-center text-xl shadow-2xs">
                        {r.avatar || '🧑‍🎓'}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF6B6B] transition-colors">
                          {r.name}
                        </span>
                        {r.grade && (
                          <p className="text-[11px] text-slate-400">Grade: {r.grade}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(r.status, r.is_overdue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            r.status === 'completed'
                              ? 'bg-emerald-500'
                              : r.status === 'overdue'
                              ? 'bg-rose-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${r.completion_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {r.completion_percentage}%
                      </span>
                    </div>
                  </td>
                  {assignmentType === 'quiz' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-slate-900 dark:text-white">
                      {r.score !== null && r.score !== undefined ? `${r.score}%` : '—'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {formatDate(r.completed_at || r.submitted_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-[#FF6B6B]">
                    <div className="flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                      <span className="text-xs">Dashboard</span>
                      <FiChevronRight className="h-4 w-4" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                  No students match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecipientList;
