import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, 
  FaBell, 
  FaChevronRight,
  FaBookOpen,
  FaUserGraduate,
  FaChartLine,
  FaChalkboardTeacher,
  FaUsers,
  FaAward,
  FaExclamationTriangle,
  FaPlus,
  FaTasks,
  FaCalendarAlt,
  FaClock,
  FaLightbulb,
  FaCheckCircle,
  FaFileAlt,
  FaArrowRight,
  FaRedo,
  FaRegSmile,
  FaGraduationCap
} from 'react-icons/fa';
import { teacherAPI } from '../../services/api';
import AddStudentModal from '../../components/TeacherModule/AddStudentModal';
import CertificateIssuanceModal from '../../components/TeacherModule/CertificateIssuanceModal';
import StudentReportModal from '../../components/TeacherModule/StudentReportModal';
import TeacherAnalysis from '../../components/TeacherModule/TeacherAnalysis';
import TeacherInbox from '../../components/TeacherModule/TeacherInbox';
import TeacherLessons from '../../components/TeacherModule/TeacherLessons';
import TeacherStudents from '../../components/TeacherModule/TeacherStudents';
import TeacherSettings from '../../components/TeacherModule/TeacherSettings';
import './TeacherDashboard.css';
import '../../components/TeacherModule/TeacherModule.css';

export default function TeacherDashboard({ activeTab: tabProp }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentTab = () => {
    if (tabProp) return tabProp;
    const path = location.pathname;
    if (path.includes('/analysis')) return 'analysis';
    if (path.includes('/inbox')) return 'inbox';
    if (path.includes('/lessons')) return 'lessons';
    if (path.includes('/students')) return 'students';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getCurrentTab();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignmentFilterTab, setAssignmentFilterTab] = useState('all');

  // Modal States
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await teacherAPI.getDashboard();
      if (res) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Error loading teacher dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Safe Fallback Aggregates
  const profile = dashboardData?.profile || {
    name: 'Ms. Rivera',
    school: 'Oakridge Elementary',
    role: 'Lead Educator',
    date_display: 'Wednesday, August 20, 2026',
    unread_messages: 2
  };

  const todaySummary = dashboardData?.today_summary || {
    weekly_progress_pct: 62,
    review_assignments_count: 5,
    today_lessons_count: 2,
    attention_count: 4
  };

  const kpis = dashboardData?.kpis || {
    total_students: 24,
    active_students: 21,
    total_classrooms: 3,
    avg_reading_progress: 76,
    avg_quiz_score: 82.5,
    needs_attention_count: 4
  };

  const studentPerformance = dashboardData?.student_performance || {
    distribution: { on_track: 18, needs_attention: 4, behind: 2 },
    avg_reading_progress: 76,
    avg_quiz_score: 82.5,
    avg_assignment_completion: 84
  };

  const attentionStudents = dashboardData?.students_needing_attention || [
    { id: 101, name: 'Aisha Patel', avatar: '👦', grade: 'Grade 3', reading_level: 'Beginner', classroom_name: 'Grade 3 — Section A', progress: 42, quiz_avg: 61.5, attention_reason: 'Quiz average dropped below 65%.' },
    { id: 102, name: 'Ananya', avatar: '👧', grade: 'Grade 2', reading_level: 'Beginner', classroom_name: 'Grade 2 — Section A', progress: 38, quiz_avg: 64.0, attention_reason: '2 reading assignments overdue.' },
    { id: 103, name: 'Sofia Rodriguez', avatar: '👧', grade: 'Grade 3', reading_level: 'Intermediate', classroom_name: 'Grade 3 — Section A', progress: 48, quiz_avg: 68.0, attention_reason: 'No reading activity in past 7 days.' },
    { id: 104, name: 'Liam O\'Brien', avatar: '🧒', grade: 'Grade 2', reading_level: 'Beginner', classroom_name: 'Grade 2 — Section A', progress: 54, quiz_avg: 71.0, attention_reason: 'Vocabulary comprehension needs review.' }
  ];

  const classrooms = dashboardData?.classrooms_overview || [
    { id: 1, name: 'Grade 3 — Section A', grade_level: 'Grade 3', section: 'A', student_count: 24, reading_avg: 78, quiz_avg: 84, assignment_completion: 85, status: 'On track' },
    { id: 2, name: 'Grade 2 — Section A', grade_level: 'Grade 2', section: 'A', student_count: 18, reading_avg: 71, quiz_avg: 76, assignment_completion: 78, status: 'Needs attention' },
    { id: 3, name: 'Grade 4 — Section B', grade_level: 'Grade 4', section: 'B', student_count: 21, reading_avg: 82, quiz_avg: 88, assignment_completion: 89, status: 'On track' }
  ];

  const assignmentData = dashboardData?.assignment_overview || {
    counts: { active: 4, upcoming: 3, needs_review: 5, completed: 18 },
    priority_assignments: [
      { id: 1, title: 'Ocean Friends: A Coral Reef Story', classroom_name: 'Grade 3 — Section A', due_date: 'Due Tomorrow', status: 'active', completed_count: 4, total_count: 6 },
      { id: 2, title: 'The Brave Little Acorn', classroom_name: 'Grade 2 — Section A', due_date: 'Due Today', status: 'active', completed_count: 4, total_count: 6 },
      { id: 3, title: 'Vocabulary Comprehension Review', classroom_name: 'Grade 3 — Section A', due_date: 'Needs Review', status: 'needs_review', completed_count: 5, total_count: 6 }
    ]
  };

  const teachingProgress = dashboardData?.teaching_progress || {
    lessons_this_week: 8,
    completed_lessons: 5,
    remaining_lessons: 3,
    completion_percentage: 62,
    daily_trend: [
      { day: 'Mon', completed: 2 },
      { day: 'Tue', completed: 3 },
      { day: 'Wed', completed: 1 },
      { day: 'Thu', completed: 2 },
      { day: 'Fri', completed: 0 }
    ]
  };

  const upcomingSchedule = dashboardData?.upcoming_schedule || [
    { id: 1, title: 'Reading Comprehension & Vocabulary', classroom_name: 'Grade 3 — Section A', date: 'Today', time: '10:00 AM', status: 'upcoming' },
    { id: 2, title: 'Bilingual Storytelling Workshop', classroom_name: 'Grade 2 — Section A', date: 'Today', time: '1:30 PM', status: 'upcoming' },
    { id: 3, title: 'Advanced Fables & Story Recall', classroom_name: 'Grade 4 — Section B', date: 'Tomorrow', time: '9:30 AM', status: 'upcoming' }
  ];

  const recentActivity = dashboardData?.recent_activity || [
    { id: 1, type: 'reading', child_name: 'Aisha Patel', child_avatar: '👦', description: "completed reading 'The Magic Forest'", time_ago: '10 mins ago' },
    { id: 2, type: 'quiz', child_name: 'Emma Chen', child_avatar: '👧', description: 'scored 92% on comprehension check', time_ago: '25 mins ago' },
    { id: 3, type: 'reading', child_name: 'Ananya', child_avatar: '👧', description: "completed reading 'Ocean Friends'", time_ago: '1 hour ago' },
    { id: 4, type: 'achievement', child_name: 'Noah Williams', child_avatar: '👦', description: "unlocked 'Bookworm Explorer' badge", time_ago: '2 hours ago' }
  ];

  const aiInsights = dashboardData?.ai_insights || [
    { id: 1, title: 'Attention Alert', insight: '4 students show declining quiz scores or overdue assignments this week.', action_label: 'View Attention Students', action_type: 'view_students' },
    { id: 2, title: 'Comprehension Boost', insight: 'Grade 3 — Section A has strong story completion (78%) but needs vocabulary recall support.', action_label: 'Create Assignment', action_type: 'create_assignment' }
  ];

  const filteredPriorityAssignments = assignmentFilterTab === 'all'
    ? assignmentData.priority_assignments
    : assignmentData.priority_assignments.filter((a) => a.status === assignmentFilterTab);

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'analysis':
        return <TeacherAnalysis />;
      case 'inbox':
        return <TeacherInbox />;
      case 'lessons':
        return <TeacherLessons />;
      case 'students':
        return <TeacherStudents />;
      case 'settings':
        return <TeacherSettings />;
      default:
        return (
          <div className="space-y-6 text-xs font-sans pb-16">
            {/* Error Notification Banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <FaExclamationTriangle className="text-amber-600 text-base" />
                  <span>{error}</span>
                </div>
                <button onClick={loadDashboard} className="sn-btn-secondary py-1 px-3 text-xs">
                  <FaRedo /> Retry
                </button>
              </div>
            )}

            {/* HEADER & GREETING */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  Good morning, {profile.name} 👋
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  Here's what's happening across your classrooms today. • <span className="text-purple-600 font-bold">{profile.date_display}</span>
                </p>
              </div>

              {/* Header Quick Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/teacher/classrooms')}
                  className="sn-btn-secondary text-xs"
                >
                  <FaChalkboardTeacher /> + Classroom
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(true)}
                  className="sn-btn-secondary text-xs"
                >
                  <FaUsers /> + Add Student
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/assignments')}
                  className="sn-btn-secondary text-xs"
                >
                  <FaTasks /> + Assignment
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/lessons')}
                  className="sn-btn-primary text-xs"
                >
                  <FaPlus /> + Lesson
                </button>
              </div>
            </div>

            {/* BANNER — TODAY'S TEACHING SUMMARY */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-800/40">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-[11px] font-bold border border-purple-400/30">
                  ⚡ Today's Teaching Command Center
                </div>
                <h2 className="text-xl font-black text-white">
                  You have completed <span className="text-purple-300 underline">{todaySummary.weekly_progress_pct}%</span> of this week's teaching activities.
                </h2>
                <p className="text-xs text-slate-300">
                  Stay on top of reviews, upcoming scheduled lessons, and priority student support.
                </p>
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[110px]">
                  <div className="text-lg font-black text-amber-300">{todaySummary.review_assignments_count}</div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase">Needs Review</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[110px]">
                  <div className="text-lg font-black text-emerald-300">{todaySummary.today_lessons_count}</div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase">Lessons Today</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[110px]">
                  <div className="text-lg font-black text-rose-300">{todaySummary.attention_count}</div>
                  <div className="text-[10px] text-slate-300 font-bold uppercase">Need Attention</div>
                </div>
              </div>
            </div>

            {/* TIER 1 — 6 KPI COMMAND CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-purple-600">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Total Students</span>
                  <FaUsers className="text-base" />
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">{kpis.total_students}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Across {kpis.total_classrooms} classrooms</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Active Readers</span>
                  <FaBookOpen className="text-base" />
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">{kpis.active_students}</div>
                <div className="text-[10px] text-emerald-600 font-bold">Active past 7 days</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-blue-600">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Classrooms</span>
                  <FaChalkboardTeacher className="text-base" />
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">{kpis.total_classrooms}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Active learning spaces</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-indigo-600">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Avg Reading</span>
                  <FaChartLine className="text-base" />
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">{kpis.avg_reading_progress}%</div>
                <div className="text-[10px] text-indigo-600 font-bold">Overall completion</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-amber-600">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Quiz Average</span>
                  <FaAward className="text-base" />
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">{kpis.avg_quiz_score}%</div>
                <div className="text-[10px] text-amber-600 font-bold">Comprehension score</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                <div className="flex justify-between items-center text-rose-600">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Needs Attention</span>
                  <FaExclamationTriangle className="text-base" />
                </div>
                <div className="text-2xl font-black text-rose-600">{kpis.needs_attention_count}</div>
                <div className="text-[10px] text-rose-500 font-bold">Require teacher review</div>
              </div>
            </div>

            {/* TIER 2 — STUDENT PERFORMANCE & PRIORITY ATTENTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Performance Overview Chart Card */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      <FaChartLine className="text-purple-600" /> Student Performance
                    </h3>
                    <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                      Live Analytics
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Understand student comprehension & progress distribution across all classrooms.
                  </p>
                </div>

                {/* Segmented Distribution Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Performance Breakdown</span>
                    <span>{kpis.total_students} Total Students</span>
                  </div>

                  <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      style={{ width: `${(studentPerformance.distribution.on_track / (kpis.total_students || 1)) * 100}%` }}
                      className="bg-emerald-500 h-full transition-all"
                      title="On Track"
                    />
                    <div
                      style={{ width: `${(studentPerformance.distribution.needs_attention / (kpis.total_students || 1)) * 100}%` }}
                      className="bg-amber-500 h-full transition-all"
                      title="Needs Attention"
                    />
                    <div
                      style={{ width: `${(studentPerformance.distribution.behind / (kpis.total_students || 1)) * 100}%` }}
                      className="bg-rose-500 h-full transition-all"
                      title="Behind"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px] font-bold">
                    <span className="text-emerald-700 flex items-center gap-1">● On Track ({studentPerformance.distribution.on_track})</span>
                    <span className="text-amber-700 flex items-center gap-1">● Attention ({studentPerformance.distribution.needs_attention})</span>
                    <span className="text-rose-700 flex items-center gap-1">● Behind ({studentPerformance.distribution.behind})</span>
                  </div>
                </div>

                {/* Key Metric Rows */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 font-bold">Reading Progress Average</span>
                    <strong className="text-purple-700 font-black text-sm">{studentPerformance.avg_reading_progress}%</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                    <span className="text-slate-600 dark:text-slate-300 font-bold">Quiz Comprehension Average</span>
                    <strong className="text-amber-700 font-black text-sm">{studentPerformance.avg_quiz_score}%</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                    <span className="text-slate-600 dark:text-slate-300 font-bold">Assignment Completion Rate</span>
                    <strong className="text-emerald-700 font-black text-sm">{studentPerformance.avg_assignment_completion}%</strong>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/teacher/students')}
                  className="sn-btn-secondary w-full text-xs py-2.5 font-bold"
                >
                  Explore All Students Roster &rarr;
                </button>
              </div>

              {/* Right Column: Students Needing Attention */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      <FaExclamationTriangle className="text-amber-500" /> Students Needing Attention
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Prioritized support list based on quiz drops, overdue tasks, or inactive reading.
                    </p>
                  </div>
                  <button onClick={() => navigate('/teacher/students')} className="text-purple-600 hover:text-purple-700 font-bold text-xs">
                    View All ({attentionStudents.length}) &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {attentionStudents.slice(0, 4).map((st) => (
                    <div
                      key={st.id}
                      onClick={() => navigate(`/teacher/students/${st.id}`)}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 hover:bg-purple-50/60 hover:border-purple-200 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm">
                          {st.avatar || st.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-white text-xs">{st.name}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            {st.grade} • {st.reading_level} • {st.classroom_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Quiz Avg</div>
                          <div className="text-xs font-black text-amber-600">{st.quiz_avg}%</div>
                        </div>

                        <div>
                          <span
                            className={
                              st.status === 'Behind'
                                ? 'sn-badge-behind'
                                : 'sn-badge-attention'
                            }
                          >
                            ● {st.attention_reason || 'Needs Review'}
                          </span>
                        </div>

                        <button type="button" className="text-purple-600 hover:text-purple-800 text-xs font-bold">
                          View &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TIER 3 — MY CLASSROOMS OVERVIEW & COMPARISON */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <FaChalkboardTeacher className="text-purple-600" /> My Classrooms Overview
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Compare performance metrics and student counts across your assigned classrooms.
                  </p>
                </div>
                <button onClick={() => navigate('/teacher/classrooms')} className="sn-btn-secondary py-1.5 px-3 text-xs">
                  Manage Classrooms &rarr;
                </button>
              </div>

              {/* Desktop Classroom Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase font-bold text-[10px]">
                      <th className="py-3 px-4">Classroom</th>
                      <th className="py-3 px-4">Students</th>
                      <th className="py-3 px-4">Reading Avg</th>
                      <th className="py-3 px-4">Quiz Avg</th>
                      <th className="py-3 px-4">Assignment Completion</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
                    {classrooms.map((cls) => (
                      <tr key={cls.id} className="hover:bg-purple-50/50 transition cursor-pointer" onClick={() => navigate(`/teacher/classrooms/${cls.id}`)}>
                        <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-white">
                          📚 {cls.name}
                        </td>
                        <td className="py-3.5 px-4">{cls.student_count} Students</td>
                        <td className="py-3.5 px-4 text-purple-700 font-bold">{cls.reading_avg}%</td>
                        <td className="py-3.5 px-4 text-amber-700 font-bold">{cls.quiz_avg}%</td>
                        <td className="py-3.5 px-4 text-emerald-700 font-bold">{cls.assignment_completion}%</td>
                        <td className="py-3.5 px-4">
                          <span className={cls.status === 'On track' ? 'sn-badge-on-track' : 'sn-badge-attention'}>
                            ● {cls.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/teacher/classrooms/${cls.id}`); }} className="text-purple-600 hover:text-purple-800 font-bold">
                            View Workspace &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TIER 4 — ASSIGNMENT COMMAND CENTER */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <FaTasks className="text-purple-600" /> Assignment Command Center
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Track active, upcoming, and review-pending learning assignments.
                  </p>
                </div>

                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
                  {['all', 'active', 'needs_review', 'completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAssignmentFilterTab(tab)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs capitalize transition ${
                        assignmentFilterTab === tab ? 'sn-tab-active' : 'sn-tab-inactive'
                      }`}
                    >
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Assignments Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredPriorityAssignments.map((ass) => (
                  <div key={ass.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        📖
                      </div>
                      <span className="sn-badge-enrolled">{ass.due_date}</span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">{ass.title}</h4>
                      <div className="text-[10px] text-slate-500 font-semibold">{ass.classroom_name}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>Submission Progress</span>
                        <span>{ass.completed_count}/{ass.total_count} Completed</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${(ass.completed_count / (ass.total_count || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button onClick={() => navigate('/teacher/assignments')} className="sn-btn-secondary w-full text-xs py-1.5">
                      View Assignment Details &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TIER 5 — TEACHING PROGRESS & UPCOMING SCHEDULE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Teaching Workload Progress */}
              <div className="lg:col-span-6 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <FaClock className="text-purple-600" /> Teaching Workload Progress
                </h3>

                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-purple-900 dark:text-purple-100">
                      {teachingProgress.completed_lessons} / {teachingProgress.lessons_this_week} Lessons
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold">
                      Completed this week ({teachingProgress.completion_percentage}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-bold text-xs shadow-sm">
                      {teachingProgress.remaining_lessons} Remaining
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Weekly Target</span>
                    <span>{teachingProgress.completion_percentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${teachingProgress.completion_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Daily Breakdown */}
                <div className="grid grid-cols-5 gap-2 pt-2 text-center">
                  {teachingProgress.daily_trend.map((day) => (
                    <div key={day.day} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{day.day}</div>
                      <div className="text-sm font-black text-slate-800 dark:text-white">{day.completed}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Teaching Schedule */}
              <div className="lg:col-span-6 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-600" /> Upcoming Schedule
                  </h3>
                  <button onClick={() => navigate('/teacher/schedule')} className="text-purple-600 hover:text-purple-700 font-bold text-xs">
                    Full Schedule &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {upcomingSchedule.map((item) => (
                    <div key={item.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          <FaClock />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-white text-xs">{item.title}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            {item.classroom_name} • <span className="text-purple-600 font-bold">{item.date} @ {item.time}</span>
                          </div>
                        </div>
                      </div>
                      <span className="sn-badge-enrolled">Upcoming</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TIER 6 — RECENT STUDENT ACTIVITY FEED */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <FaRegSmile className="text-purple-600" /> Recent Student Activity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentActivity.map((act) => (
                  <div key={act.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {act.child_avatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-xs">
                          <strong>{act.child_name}</strong> {act.description}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">{act.time_ago}</div>
                      </div>
                    </div>
                    <span className="sn-badge-available text-[10px]">Verified</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TIER 7 — AI TEACHING INSIGHTS ✨ & QUICK ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* AI Teaching Insights Card */}
              <div className="lg:col-span-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-purple-700/50">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center text-lg font-black shadow-md">
                    <FaLightbulb />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">AI Teaching Insights ✨</h3>
                    <p className="text-[11px] text-purple-200 font-semibold">Metrics-driven recommendations based on live student performance.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {aiInsights.map((ins) => (
                    <div key={ins.id} className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
                      <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        ⚡ {ins.title}
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{ins.insight}</p>
                      <button
                        onClick={() => {
                          if (ins.action_type === 'view_students') navigate('/teacher/students');
                          else if (ins.action_type === 'create_assignment') navigate('/teacher/assignments');
                          else navigate('/teacher/lessons');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-[11px] hover:bg-amber-300 shadow-md transition inline-flex items-center gap-1"
                      >
                        {ins.action_label} <FaArrowRight />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Shortcuts Grid */}
              <div className="lg:col-span-6 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <FaTasks className="text-purple-600" /> Command Quick Actions
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setIsAddStudentOpen(true)}
                    className="p-3.5 rounded-2xl bg-purple-50/80 hover:bg-purple-100 text-purple-900 border border-purple-200/80 font-bold text-xs text-left transition flex flex-col gap-2 shadow-xs"
                  >
                    <FaUsers className="text-purple-600 text-lg" />
                    <span>Add / Enroll Student</span>
                  </button>

                  <button
                    onClick={() => navigate('/teacher/assignments')}
                    className="p-3.5 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 font-bold text-xs text-left transition flex flex-col gap-2 shadow-xs"
                  >
                    <FaTasks className="text-indigo-600 text-lg" />
                    <span>Create Assignment</span>
                  </button>

                  <button
                    onClick={() => navigate('/teacher/lessons')}
                    className="p-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 font-bold text-xs text-left transition flex flex-col gap-2 shadow-xs"
                  >
                    <FaBookOpen className="text-emerald-600 text-lg" />
                    <span>Create Lesson</span>
                  </button>

                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="p-3.5 rounded-2xl bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs text-left transition flex flex-col gap-2 shadow-xs"
                  >
                    <FaFileAlt className="text-amber-600 text-lg" />
                    <span>Generate Report</span>
                  </button>

                  <button
                    onClick={() => setIsCertModalOpen(true)}
                    className="p-3.5 rounded-2xl bg-rose-50/80 hover:bg-rose-100 text-rose-900 border border-rose-200/80 font-bold text-xs text-left transition flex flex-col gap-2 shadow-xs"
                  >
                    <FaGraduationCap className="text-rose-600 text-lg" />
                    <span>Issue Certificate</span>
                  </button>

                  <button
                    onClick={() => navigate('/teacher/classrooms')}
                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs text-left transition flex flex-col gap-2 shadow-xs"
                  >
                    <FaChalkboardTeacher className="text-slate-700 text-lg" />
                    <span>View Classrooms</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MODALS INTEGRATION */}
            {isAddStudentOpen && (
              <AddStudentModal
                classrooms={classrooms}
                onClose={() => setIsAddStudentOpen(false)}
                onStudentsAdded={() => loadDashboard()}
              />
            )}

            {isCertModalOpen && (
              <CertificateIssuanceModal
                students={attentionStudents}
                classrooms={classrooms}
                onClose={() => setIsCertModalOpen(false)}
                onIssued={() => loadDashboard()}
              />
            )}

            {isReportModalOpen && (
              <StudentReportModal
                student={selectedStudentForReport || attentionStudents[0]}
                onClose={() => setIsReportModalOpen(false)}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in" style={{ padding: 0, background: 'transparent' }}>
      <div className="dashboard-content" style={{ marginLeft: 0, marginTop: 0, padding: 0 }}>
        {renderActiveContent()}
      </div>
    </div>
  );
}
