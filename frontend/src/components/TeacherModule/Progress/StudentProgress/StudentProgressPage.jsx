import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiBookOpen, FiAward, FiCheckSquare, FiClock, FiActivity } from 'react-icons/fi';
import teacherProgressService from '../../../../services/teacherProgressService';

const StudentProgressPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('all');

  const fetchStudentProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await teacherProgressService.getStudentDetailProgress(studentId, { time_period: timePeriod });
      setData(res);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to load student progress.');
    } finally {
      setLoading(false);
    }
  }, [studentId, timePeriod]);

  useEffect(() => {
    fetchStudentProgress();
  }, [fetchStudentProgress]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-rose-500">
        {error || 'Student not found.'}
      </div>
    );
  }

  const { student, overview, growth_trend, reading, quiz, assignments, timeline } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button & Header */}
      <button
        onClick={() => navigate('/teacher/progress')}
        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-6"
      >
        <FiChevronLeft className="h-4 w-4 mr-1" /> Back to Progress Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{student.avatar || '🧑‍🎓'}</span>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{student.name}</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{student.classroom_name}</p>
          </div>
        </div>

        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium w-fit"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="term">This Term (90 Days)</option>
        </select>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">Overall Progress</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{overview.progress}%</span>
            <div className="w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-1">
              <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${overview.progress}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">Quiz Average</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">{overview.quiz_average}%</span>
            <div className="w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-1">
              <div className="bg-amber-500 h-3 rounded-full" style={{ width: `${overview.quiz_average}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">Assignment Comp.</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{overview.assignment_completion}%</span>
            <div className="w-24 bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-1">
              <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${overview.assignment_completion}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Growth Trend</h3>
        <div className="flex items-end justify-between h-40 pt-4 gap-4">
          {growth_trend.map((g, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{g.progress}%</span>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg h-28 flex items-end overflow-hidden">
                <div className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(10, g.progress)}%` }} />
              </div>
              <span className="text-xs text-slate-500 font-medium">{g.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Reading */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-4">
            <FiBookOpen className="h-5 w-5" /> Reading Activity
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Stories Completed</span>
              <span className="font-bold text-slate-900 dark:text-white">{reading.stories_completed}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Total Reading Minutes</span>
              <span className="font-bold text-slate-900 dark:text-white">{reading.reading_minutes} min</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Current Streak</span>
              <span className="font-bold text-slate-900 dark:text-white">{reading.current_streak} days</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Average Session</span>
              <span className="font-bold text-slate-900 dark:text-white">{reading.average_session} min</span>
            </div>
          </div>
        </div>

        {/* Quiz */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold mb-4">
            <FiAward className="h-5 w-5" /> Quiz Performance
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Quizzes Taken</span>
              <span className="font-bold text-slate-900 dark:text-white">{quiz.quizzes_completed}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Average Score</span>
              <span className="font-bold text-slate-900 dark:text-white">{quiz.average_score}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Highest Score</span>
              <span className="font-bold text-emerald-600">{quiz.highest_score}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Lowest Score</span>
              <span className="font-bold text-rose-500">{quiz.lowest_score}%</span>
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-4">
            <FiCheckSquare className="h-5 w-5" /> Assignment Status
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Completed</span>
              <span className="font-bold text-emerald-600">{assignments.completed}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">In Progress</span>
              <span className="font-bold text-amber-500">{assignments.in_progress}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500">Overdue</span>
              <span className="font-bold text-rose-500">{assignments.overdue}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Average Grade</span>
              <span className="font-bold text-slate-900 dark:text-white">{assignments.average_score}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FiActivity className="text-indigo-500" /> Recent Activity Timeline
        </h3>
        <div className="space-y-4">
          {timeline && timeline.length > 0 ? (
            timeline.map((act, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{act.title}</span>
                <span className="text-xs text-slate-400">{act.timestamp}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressPage;
