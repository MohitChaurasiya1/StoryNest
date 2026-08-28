import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import teacherProgressService from '../../../../services/teacherProgressService';
import ProgressStats from '../ProgressStats';
import ReadingAnalytics from '../ReadingAnalytics';
import QuizAnalytics from '../QuizAnalytics';
import AssignmentAnalytics from '../AssignmentAnalytics';
import NeedsAttention from '../NeedsAttention';
import StudentPerformanceTable from '../StudentPerformanceTable';

const ClassroomProgressPage = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('all');

  const [overview, setOverview] = useState(null);
  const [reading, setReading] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [attention, setAttention] = useState([]);
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('progress');

  const cId = classroomId ? parseInt(classroomId) : null;

  const fetchClassroomData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ovData, readData, qzData, asgnData, attData, stData] = await Promise.all([
        teacherProgressService.getOverview({ classroom_id: cId, time_period: timePeriod }),
        teacherProgressService.getReadingAnalytics({ classroom_id: cId, time_period: timePeriod }),
        teacherProgressService.getQuizAnalytics({ classroom_id: cId, time_period: timePeriod }),
        teacherProgressService.getAssignmentAnalytics({ classroom_id: cId, time_period: timePeriod }),
        teacherProgressService.getNeedsAttention({ classroom_id: cId }),
        teacherProgressService.getStudentPerformanceList({ classroom_id: cId, search, sort_by: sortBy, time_period: timePeriod })
      ]);

      setOverview(ovData);
      setReading(readData);
      setQuiz(qzData);
      setAssignment(asgnData);
      setAttention(attData);
      setStudents(stData);
    } catch (err) {
      console.error(err);
      setError('Failed to load classroom progress data.');
    } finally {
      setLoading(false);
    }
  }, [cId, timePeriod, search, sortBy]);

  useEffect(() => {
    fetchClassroomData();
  }, [fetchClassroomData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/teacher/progress')}
        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-6"
      >
        <FiChevronLeft className="h-4 w-4 mr-1" /> Back to Progress Dashboard
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Classroom Deep Dive</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Classroom ID: {classroomId}</p>
        </div>

        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="term">This Term (90 Days)</option>
        </select>
      </div>

      <ProgressStats stats={overview} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ReadingAnalytics data={reading} />
        <QuizAnalytics data={quiz} />
      </div>

      <div className="mb-8">
        <AssignmentAnalytics data={assignment} />
      </div>

      <NeedsAttention items={attention} />

      <StudentPerformanceTable
        students={students}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
    </div>
  );
};

export default ClassroomProgressPage;
