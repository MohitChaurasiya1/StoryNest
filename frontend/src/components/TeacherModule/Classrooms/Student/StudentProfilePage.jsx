import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaFire, FaBookOpen, FaClock, FaTrophy, 
  FaPlus, FaCheckCircle, FaMagic, FaTasks, FaChartLine, 
  FaExclamationTriangle, FaTrash, FaStar, FaCalendarAlt, 
  FaUserGraduate, FaLayerGroup, FaHistory, FaLightbulb, FaSpinner,
  FaAward, FaBan, FaEye, FaPrint, FaCertificate
} from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';
import teacherLibraryService from '../../../../services/teacherLibraryService';
import ReadingLogModal from '../../../ReadingLogModal/ReadingLogModal';
import IssueCertificateModal from './IssueCertificateModal';
import SharedCertificateModal from '../../../Certificate/SharedCertificateModal';

const StudentProfilePage = () => {
  const { id: classroomId, studentId } = useParams();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [readingLogs, setReadingLogs] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [libraryStories, setLibraryStories] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'logs' | 'assignments' | 'certificates' | 'achievements' | 'insights'

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isIssueCertModalOpen, setIsIssueCertModalOpen] = useState(false);
  const [selectedCertToView, setSelectedCertToView] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, logsRes, asgRes, libRes, certRes] = await Promise.allSettled([
        teacherClassroomService.getStudentDashboard(classroomId, studentId),
        teacherClassroomService.getStudentReadingLogs(classroomId, studentId),
        teacherClassroomService.getStudentAssignments(classroomId, studentId),
        teacherLibraryService.getContent({ type: 'story' }, 1),
        teacherClassroomService.getStudentCertificates(classroomId, studentId)
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashboardData(dashRes.value);
        if (dashRes.value?.certificates) {
          setCertificates(dashRes.value.certificates);
        }
      } else {
        throw dashRes.reason || new Error("Failed to load student dashboard");
      }

      if (logsRes.status === 'fulfilled') {
        setReadingLogs(logsRes.value || []);
      }

      if (asgRes.status === 'fulfilled') {
        const asgData = asgRes.value;
        const taskList = Array.isArray(asgData) ? asgData : (asgData?.all || asgData?.results || []);
        setAssignedTasks(taskList);
      }

      if (libRes.status === 'fulfilled' && libRes.value?.results) {
        setLibraryStories(libRes.value.results || []);
      }

      if (certRes.status === 'fulfilled') {
        setCertificates(certRes.value || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  }, [classroomId, studentId]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveReadingLog = async (logData) => {
    try {
      const res = await teacherClassroomService.createStudentReadingLog(classroomId, studentId, logData);
      setIsLogModalOpen(false);
      if (res?.certificate_earned || (logData.completed && res?.certificate)) {
        showToast("Story completed! Reading certificate earned 🎉");
      } else {
        showToast("Reading session logged successfully!");
      }
      fetchStudentData();
    } catch (err) {
      alert(err.message || 'Failed to log reading session.');
    }
  };

  const handleDeleteLog = async (logId) => {
    if (window.confirm("Are you sure you want to delete this reading log?")) {
      try {
        await teacherClassroomService.deleteStudentReadingLog(classroomId, studentId, logId);
        showToast('Reading log deleted.');
        fetchStudentData();
      } catch (err) {
        alert(err.message || 'Failed to delete reading log.');
      }
    }
  };

  const handleIssueCertificate = async (certData) => {
    try {
      await teacherClassroomService.issueStudentCertificate(classroomId, studentId, certData);
      setIsIssueCertModalOpen(false);
      showToast('Certificate issued successfully.');
      fetchStudentData();
    } catch (err) {
      alert(err.message || 'Failed to issue certificate.');
    }
  };

  const handleRevokeCertificate = async (certId, reason) => {
    try {
      await teacherClassroomService.revokeStudentCertificate(classroomId, studentId, certId, reason);
      setSelectedCertToView(null);
      showToast('Certificate revoked.');
      fetchStudentData();
    } catch (err) {
      alert(err.message || 'Failed to revoke certificate.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-rose-500 mb-4" />
        <p className="font-bold text-slate-600 dark:text-slate-300">Loading Student Learning Dashboard...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="card error-banner max-w-xl mx-auto my-12 p-6">
        <FaExclamationTriangle className="error-icon text-2xl" />
        <div>
          <h4 className="font-bold text-lg">Student Profile Not Found</h4>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => navigate(`/teacher/classrooms/${classroomId}`)} 
            className="btn btn-secondary mt-4"
          >
            Back to Classroom
          </button>
        </div>
      </div>
    );
  }

  const { child = {}, stats = {}, weekly_activity = [], recent_stories = [], story_ideas = [], achievements = [], assigned_tasks = [], assignment_stats = {} } = dashboardData || {};
  const currentAssignedTasks = assignedTasks.length > 0 ? assignedTasks : (Array.isArray(assigned_tasks) ? assigned_tasks : []);
  const streak = stats.reading_streak || stats.current_streak || 0;
  const booksRead = stats.total_books_read || stats.stories_completed || 0;
  const totalMins = stats.total_minutes || 0;
  const avgQuiz = stats.average_quiz || stats.quiz_average || 0;

  const handleCreateStoryForStudent = (customTitle, customPrompt) => {
    const studentName = child?.name || 'Student';
    const title = customTitle || `${studentName}'s Adventure`;
    const grade = child?.grade || child?.grade_level || 'Grade 2';
    const readingLevel = child?.reading_level || 'Beginner';
    const prompt = customPrompt || `An engaging reading adventure tailored for ${studentName}`;
    const characters = `${studentName} and magical friends`;

    const search = new URLSearchParams({
      title,
      grade,
      reading_difficulty: readingLevel,
      characters,
      custom_prompt: prompt
    }).toString();

    navigate(`/teacher/library/create-story?${search}`, {
      state: {
        title,
        grade,
        reading_difficulty: readingLevel,
        characters,
        custom_prompt: prompt
      }
    });
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[999999] p-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl flex items-center gap-3 animate-bounce">
          <FaCheckCircle className="text-xl" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back link */}
      <button 
        type="button"
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold mb-4 transition-colors text-sm"
        onClick={() => navigate(`/teacher/classrooms/${classroomId}`)}
      >
        <FaArrowLeft size={12} /> Back to {child?.classroom_name || 'Classroom'}
      </button>

      {/* Hero Header matching Parent/Teacher Style */}
      <div className="parent-header parent-hero-card mb-8">
        <div className="parent-header-left flex items-center gap-5 sm:gap-6 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <img 
              src={child?.avatar_url || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=" + (child?.name || 'Student')} 
              alt={child?.name || 'Student'} 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white object-cover border-4 border-white/30 shadow-lg shrink-0"
            />
            <span className="absolute -bottom-1 -right-1 text-2xl select-none">{child?.avatar || '🦁'}</span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="serif-heading text-white text-2xl sm:text-3xl">{child?.name || 'Student'}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                {child?.grade || child?.grade_level || 'Grade 2'}
              </span>
            </div>

            <p className="text-white/85 mt-2 text-sm font-semibold flex items-center gap-3 flex-wrap">
              <span>🏫 {child?.classroom_name || 'Classroom'}</span>
              <span className="opacity-60">•</span>
              <span>Age {child?.age || 7}</span>
              <span className="opacity-60">•</span>
              <span>Level: {child?.reading_level || 'Intermediate'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="parent-header-right flex flex-wrap items-center gap-3">
          <button 
            type="button"
            className="btn btn-secondary flex items-center gap-2 text-sm shadow-md cursor-pointer"
            onClick={() => setIsLogModalOpen(true)}
          >
            <FaBookOpen /> Log Reading
          </button>
          <button 
            type="button"
            className="btn btn-secondary flex items-center gap-2 text-sm shadow-md cursor-pointer"
            onClick={() => setIsIssueCertModalOpen(true)}
          >
            <FaAward /> Issue Certificate
          </button>
          <button 
            type="button"
            className="btn btn-primary flex items-center gap-2 text-sm shadow-md cursor-pointer"
            style={{
              background: '#FFFFFF',
              color: '#FF6B6B',
              fontWeight: 800,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
            }}
            onClick={() => handleCreateStoryForStudent()}
          >
            <FaMagic /> Create Story
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Overview', icon: FaLayerGroup },
          { id: 'logs', label: `Reading Logs (${readingLogs.length})`, icon: FaHistory },
          { id: 'assignments', label: `Assigned Tasks (${assignedTasks.length})`, icon: FaTasks },
          { id: 'certificates', label: `Certificates (${certificates.length})`, icon: FaAward },
          { id: 'achievements', label: 'Achievements', icon: FaTrophy },
          { id: 'insights', label: 'Insights & Growth', icon: FaChartLine },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer select-none"
              style={isActive ? {
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(255, 107, 107, 0.35)',
                transform: 'translateY(-1px)'
              } : {
                background: 'var(--surface-color, #F8FAFC)',
                color: 'var(--text-secondary, #475569)',
                border: '1.5px solid var(--border-color, #E2E8F0)'
              }}
            >
              <Icon style={{ color: isActive ? '#FFFFFF' : '#94A3B8' }} />
              <span style={{ color: isActive ? '#FFFFFF' : 'inherit' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metric Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-5 text-center flex flex-col items-center justify-center border-t-4 border-t-rose-500 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-xl mb-2.5">
                <FaFire />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{streak} <span className="text-sm font-bold text-slate-400">Days</span></div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Reading Streak</div>
            </div>

            <div className="card p-5 text-center flex flex-col items-center justify-center border-t-4 border-t-sky-500 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center text-xl mb-2.5">
                <FaBookOpen />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{booksRead}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Stories Read</div>
            </div>

            <div className="card p-5 text-center flex flex-col items-center justify-center border-t-4 border-t-amber-500 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-xl mb-2.5">
                <FaClock />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{totalMins} <span className="text-sm font-bold text-slate-400">min</span></div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Total Reading</div>
            </div>

            <div className="card p-5 text-center flex flex-col items-center justify-center border-t-4 border-t-emerald-500 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center text-xl mb-2.5">
                <FaTrophy />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{avgQuiz}%</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Quiz Mastery</div>
            </div>
          </div>

          {/* Two Columns: Weekly Calendar & Story Ideas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Reading Activity Calendar */}
            <div className="card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">Weekly Activity</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Current week's reading consistency</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                  <FaFire /> {streak}-day streak
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {weekly_activity?.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400 mb-2">{d.day}</span>
                    <div 
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base transition-transform ${
                        d.read 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                      }`}
                      title={d.read ? `${d.minutes} mins on ${d.date}` : `No logs on ${d.date}`}
                    >
                      {d.read ? <FaCheckCircle /> : '—'}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 mt-1.5">{d.minutes > 0 ? `${d.minutes}m` : '0m'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Story Recommendations for Student */}
            <div className="card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <FaMagic className="text-rose-500 text-base" /> Story Ideas for {child.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Personalized prompts based on interests</p>
                </div>
              </div>

              <div className="space-y-3">
                {story_ideas?.map((idea, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3 group hover:border-rose-300 transition-colors">
                    <div className="text-xs">
                      <div className="font-extrabold text-slate-900 dark:text-white leading-snug mb-1">{idea.prompt}</div>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px]">
                        <span>✨ {idea.theme}</span>
                        <span>•</span>
                        <span>{idea.difficulty}</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-sm shrink-0 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                      onClick={() => handleCreateStoryForStudent(idea.prompt, idea.prompt)}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reading Sessions & Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Reading */}
            <div className="card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">Recent Reading Sessions</h4>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('logs')}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  View All ({readingLogs.length})
                </button>
              </div>

              {recent_stories?.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-bold">
                  No reading sessions logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {recent_stories?.map((read, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${read.completed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60' : 'bg-slate-200 text-slate-500'}`}>
                          <FaBookOpen />
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{read.title}</div>
                          <div className="text-[11px] text-slate-400 font-semibold">{read.date} • {read.minutes || 15} mins</div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${read.completed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                        {read.completed ? 'Completed' : `${read.progress || 50}%`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Showcase */}
            <div className="card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">Earned Badges</h4>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('achievements')}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  All Badges
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {achievements?.slice(0, 6).map((ach) => (
                  <div 
                    key={ach.id}
                    className={`p-3 rounded-2xl text-center border transition-all ${
                      ach.earned 
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50 opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-2xl mb-1 select-none">{ach.emoji}</div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight truncate">{ach.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{ach.earned ? 'Earned' : 'Locked'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: READING LOGS */}
      {activeTab === 'logs' && (
        <div className="card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Reading History & Logs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">All recorded reading sessions for {child.name}</p>
            </div>
            <button 
              type="button"
              className="btn btn-primary text-sm flex items-center gap-2"
              onClick={() => setIsLogModalOpen(true)}
            >
              <FaPlus /> Log New Session
            </button>
          </div>

          {readingLogs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FaBookOpen className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No reading logs recorded yet</h4>
              <p className="text-xs text-slate-400 mb-4">Record your classroom reading sessions or independent reading.</p>
              <button 
                type="button"
                className="btn btn-secondary text-sm"
                onClick={() => setIsLogModalOpen(true)}
              >
                Log First Session
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Story / Book</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Pages</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {readingLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="font-extrabold text-slate-900 dark:text-white">
                        <div>{log.story_title}</div>
                        {log.notes && <div className="text-xs text-slate-400 font-normal mt-0.5">"{log.notes}"</div>}
                      </td>
                      <td className="text-xs text-slate-500">{new Date(log.read_date).toLocaleDateString()}</td>
                      <td className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.reading_time_minutes} min</td>
                      <td className="text-xs text-slate-500">{log.pages_read} pages</td>
                      <td>
                        <div className="flex text-amber-400 text-xs">
                          {Array.from({ length: log.rating || 5 }).map((_, i) => (
                            <FaStar key={i} />
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${log.completed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                          {log.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td>
                        <button 
                          type="button"
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors"
                          title="Delete log"
                          onClick={() => handleDeleteLog(log.id)}
                        >
                          <FaTrash size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: ASSIGNED WORK */}
      {activeTab === 'assignments' && (
        <div className="card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Assigned Learning Tasks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Classroom assignments targeting {child.name}</p>
            </div>
            <button 
              type="button"
              className="btn btn-primary text-sm flex items-center gap-2"
              onClick={() => navigate(`/teacher/assignments/create?classroom_id=${classroomId}&student_id=${child.id}`)}
            >
              <FaPlus /> Assign Work to {child.name}
            </button>
          </div>

          {/* 4 Mini Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {assignment_stats.active ?? currentAssignedTasks.filter(t => t.status === 'in_progress' || t.status === 'not_started' || t.status === 'assigned').length}
              </p>
            </div>
            <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Completed</span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {assignment_stats.completed ?? currentAssignedTasks.filter(t => t.status === 'completed' || t.status === 'submitted' || t.status === 'reviewed').length}
              </p>
            </div>
            <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Overdue</span>
              <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-0.5">
                {assignment_stats.overdue ?? currentAssignedTasks.filter(t => t.status === 'overdue' || t.is_overdue).length}
              </p>
            </div>
            <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/20 rounded-xl border border-sky-100 dark:border-sky-900/30">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Total</span>
              <p className="text-xl font-black text-sky-700 dark:text-sky-300 mt-0.5">
                {assignment_stats.total ?? currentAssignedTasks.length}
              </p>
            </div>
          </div>

          {currentAssignedTasks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FaTasks className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No active assignments for this student</h4>
              <p className="text-xs text-slate-400 mb-4">Assign a story, lesson, or comprehension quiz.</p>
              <button 
                type="button"
                className="btn btn-secondary text-sm"
                onClick={() => navigate(`/teacher/assignments/create?classroom_id=${classroomId}&student_id=${child.id}`)}
              >
                Assign Work
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Type</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignedTasks.map((t) => {
                    const isCompleted = t.status === 'completed' || t.status === 'submitted' || t.status === 'reviewed';
                    const isOverdue = t.status === 'overdue' || t.is_overdue;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="font-extrabold text-slate-900 dark:text-white">{t.title}</td>
                        <td>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200 uppercase">
                            {t.type || t.assignment_type || 'Story'}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500 font-medium">
                          {t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
                        </td>
                        <td>
                          {isCompleted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                              ✓ Completed
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                              ⚠ Overdue
                            </span>
                          ) : t.status === 'in_progress' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              ◐ In Progress
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                              ○ Not Started
                            </span>
                          )}
                        </td>
                        <td className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          {t.score !== null && t.score !== undefined ? `${t.score}%` : '—'}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/teacher/assignments/${t.id}`)}
                            className="px-3 py-1 text-xs font-bold text-[#FF6B6B] hover:bg-coral-50 dark:hover:bg-coral-900/20 rounded-lg transition-colors"
                          >
                            Details →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: CERTIFICATES & AWARDS */}
      {activeTab === 'certificates' && (
        <div className="card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <FaAward className="text-rose-500" /> Student Certificates & Awards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official StoryNest certificates awarded to {child.name}</p>
            </div>
            <button 
              type="button"
              className="btn btn-primary text-sm flex items-center gap-2"
              onClick={() => setIsIssueCertModalOpen(true)}
            >
              <FaPlus /> Issue Certificate
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FaAward className="text-5xl text-amber-300 dark:text-amber-600 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No certificates yet. Keep learning and achieving!</h4>
              <p className="text-xs text-slate-400 mb-5 max-w-md mx-auto">
                Recognize {child.name}'s reading milestones, quiz comprehension, or classroom excellence by issuing an official certificate.
              </p>
              <button 
                type="button"
                className="btn btn-secondary text-sm"
                onClick={() => setIsIssueCertModalOpen(true)}
              >
                <FaAward className="mr-1" /> Issue First Certificate
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => {
                const isRevoked = cert.status === 'revoked';
                const isReadingCompletion = cert.certificate_type === 'reading_completion';
                return (
                  <div 
                    key={cert.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isRevoked 
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60' 
                        : isReadingCompletion
                          ? 'bg-gradient-to-br from-emerald-50/60 via-amber-50/30 to-rose-50/20 dark:bg-slate-800/90 border-emerald-300/80 dark:border-slate-700 shadow-sm hover:shadow-md'
                          : 'bg-gradient-to-br from-amber-50/40 to-rose-50/30 dark:bg-slate-800/80 border-amber-200/80 dark:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl select-none">{isReadingCompletion ? '🏆' : '🎖️'}</span>
                          {isReadingCompletion && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Reading Completion
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isRevoked 
                              ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isRevoked ? 'Revoked' : 'Active'}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug mb-1">
                        {cert.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 mb-3">
                        {cert.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between mt-2">
                      <div className="text-[11px] text-slate-400 font-semibold">
                        <span>Issued: {new Date(cert.issued_date).toLocaleDateString()}</span>
                        <div className="text-[10px] text-slate-400 font-normal">By {cert.issuer_name || 'Teacher'}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCertToView(cert)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FaEye size={12} /> View Certificate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 animate-fade-in">
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1">Student Achievements & Badges</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Milestones unlocked through reading, streaks, and quiz mastery</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements?.map((ach) => (
              <div 
                key={ach.id}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                  ach.earned 
                    ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-700/60 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl shrink-0 select-none">{ach.emoji}</div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{ach.name}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{ach.description}</p>
                  <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-2">
                    {ach.earned ? `Unlocked ${ach.earned_at ? new Date(ach.earned_at).toLocaleDateString() : '✓'}` : 'Locked Milestone'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-2">Reading & Comprehension Growth</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Analytics tracking vocabulary, pace, and consistency</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">Preferred Language</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{child.preferred_language || 'Bilingual (EN/HI)'}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">Reading Level</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{child.reading_level || 'Beginner'}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">Average Session</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {booksRead > 0 ? Math.round(totalMins / Math.max(1, booksRead)) : 15} mins / book
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Reading Session Modal */}
      {(() => {
        const rawAssigned = Array.isArray(assignedTasks) ? assignedTasks : (Array.isArray(assignedTasks?.all) ? assignedTasks.all : []);
        const rawLibrary = Array.isArray(libraryStories) ? libraryStories : [];
        const rawRecent = Array.isArray(recent_stories) ? recent_stories : [];

        const assignedStoryOptions = rawAssigned
          .filter(t => t && (t.type === 'story' || t.title))
          .map(t => ({
            id: t.story_id || t.id,
            assignment_id: t.id,
            title: t.title,
            title_en: t.title,
            is_assignment: true,
            category: 'assignment',
            due_date: t.due_date
          }));

        const libraryStoryOptions = rawLibrary.map(s => ({
          id: s.id,
          title: s.title || s.title_en,
          title_en: s.title || s.title_en,
          language: s.language,
          category: 'library'
        }));

        const recentStoryOptions = rawRecent.map(s => ({
          id: s.story_id || s.id,
          title: s.title,
          title_en: s.title,
          category: 'recent'
        }));

        const seen = new Set();
        const combined = [...assignedStoryOptions, ...libraryStoryOptions, ...recentStoryOptions].filter(item => {
          if (!item.id || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });

        return (
          <ReadingLogModal 
            isOpen={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            onSave={handleSaveReadingLog}
            childName={child.name}
            stories={combined}
          />
        );
      })()}

      {/* Issue Certificate Modal */}
      <IssueCertificateModal
        isOpen={isIssueCertModalOpen}
        onClose={() => setIsIssueCertModalOpen(false)}
        onIssue={handleIssueCertificate}
        studentName={child.name}
        classroomName={child.classroom_name}
      />

      {/* Shared Certificate Modal */}
      <SharedCertificateModal
        isOpen={!!selectedCertToView}
        onClose={() => setSelectedCertToView(null)}
        certificate={selectedCertToView}
        childName={child.name}
        onRevoke={handleRevokeCertificate}
        isTeacher={true}
      />
    </div>
  );
};

export default StudentProfilePage;
