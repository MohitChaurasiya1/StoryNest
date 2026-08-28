import React, { useState, useEffect, useCallback } from 'react';
import teacherProgressService from '../../../services/teacherProgressService';
import teacherClassroomService from '../../../services/teacherClassroomService';
import ProgressHeader from './ProgressHeader';
import ProgressFilters from './ProgressFilters';
import ProgressStats from './ProgressStats';
import ReadingAnalytics from './ReadingAnalytics';
import QuizAnalytics from './QuizAnalytics';
import AssignmentAnalytics from './AssignmentAnalytics';
import NeedsAttention from './NeedsAttention';
import StudentPerformanceTable from './StudentPerformanceTable';

const ProgressPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [timePeriod, setTimePeriod] = useState('all');

  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const [overview, setOverview] = useState(null);
  const [reading, setReading] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [attention, setAttention] = useState([]);
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('progress');

  // Load classrooms on mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const cls = await teacherClassroomService.getClassrooms();
        setClassrooms(cls);
      } catch (err) {
        console.error('Failed to load classrooms', err);
      }
    };
    fetchClassrooms();
  }, []);

  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        classroom_id: selectedClassroom || '',
        time_period: timePeriod
      };

      const [ovData, readData, qzData, asgnData, attData, stData] = await Promise.all([
        teacherProgressService.getOverview(params),
        teacherProgressService.getReadingAnalytics(params),
        teacherProgressService.getQuizAnalytics(params),
        teacherProgressService.getAssignmentAnalytics(params),
        teacherProgressService.getNeedsAttention({ classroom_id: selectedClassroom || '' }),
        teacherProgressService.getStudentPerformanceList({
          ...params,
          search,
          sort_by: sortBy
        })
      ]);

      setOverview(ovData);
      setReading(readData);
      setQuiz(qzData);
      setAssignment(asgnData);
      setAttention(attData);
      setStudents(stData);
    } catch (err) {
      console.error('Error loading progress data', err);
      setError('We could not load progress analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedClassroom, timePeriod, search, sortBy]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await teacherProgressService.exportReport(selectedClassroom);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `teacher_progress_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProgressHeader onExport={handleExport} isExporting={isExporting} />

      <ProgressFilters
        classrooms={classrooms}
        selectedClassroom={selectedClassroom}
        onSelectClassroom={setSelectedClassroom}
        timePeriod={timePeriod}
        onSelectTimePeriod={setTimePeriod}
      />

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 text-sm mt-3">Aggregating classroom progress...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl border border-rose-200 text-center py-12">
          {error}
        </div>
      ) : (
        <>
          <ProgressStats stats={overview} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
        </>
      )}
    </div>
  );
};

export default ProgressPage;
