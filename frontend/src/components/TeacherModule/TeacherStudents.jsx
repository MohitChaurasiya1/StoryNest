import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaThLarge,
  FaList,
  FaUserGraduate,
  FaBookOpen,
  FaAward,
  FaChartLine,
  FaExclamationTriangle,
  FaEllipsisV,
  FaFileAlt,
  FaCheckCircle,
  FaUsers,
  FaPlus,
  FaRegSmile
} from "react-icons/fa";
import { teacherAPI } from "../../services/api";
import StudentReportModal from "./StudentReportModal";
import CertificateIssuanceModal from "./CertificateIssuanceModal";
import AddStudentModal from "./AddStudentModal";
import "./TeacherModule.css";

export default function TeacherStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [stats, setStats] = useState({
    total_students: 0,
    active_readers: 0,
    avg_reading_progress: 76,
    avg_quiz_score: 81,
    needs_attention_count: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'list'

  // Multi-condition Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("all");
  const [selectedReadingLevel, setSelectedReadingLevel] = useState("all");
  const [selectedPerformance, setSelectedPerformance] = useState("all");
  const [selectedQuizPerformance, setSelectedQuizPerformance] = useState("all");

  // Context Menu & Modal states
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    loadDirectoryData();
  }, [selectedClassroom, selectedReadingLevel, selectedPerformance, selectedQuizPerformance]);

  const loadDirectoryData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedClassroom !== "all") params.classroom = selectedClassroom;
      if (selectedReadingLevel !== "all") params.reading_level = selectedReadingLevel;
      if (selectedPerformance !== "all") params.performance = selectedPerformance;
      if (selectedQuizPerformance !== "all") params.quiz_performance = selectedQuizPerformance;

      const [stdRes, statsRes, clsRes] = await Promise.allSettled([
        teacherAPI.getStudents(params),
        teacherAPI.getStudentSummaryStats(),
        teacherAPI.getClassrooms()
      ]);

      if (stdRes.status === "fulfilled") {
        setStudents(Array.isArray(stdRes.value) ? stdRes.value : stdRes.value?.results || []);
      }
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value || {});
      }
      if (clsRes.status === "fulfilled") {
        setClassrooms(Array.isArray(clsRes.value) ? clsRes.value : clsRes.value?.results || []);
      }
    } catch (err) {
      console.error("Error loading student directory:", err);
      setError("Unable to load student directory right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDirectoryData();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Client filtering fallback
  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      !searchTerm ||
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.grade && st.grade.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesClassroom = true;
    if (selectedClassroom !== "all") {
      matchesClassroom = String(st.classroom_id) === String(selectedClassroom);
    }

    let matchesPerformance = true;
    if (selectedPerformance === "on_track") matchesPerformance = st.status === "On track";
    if (selectedPerformance === "needs_attention") matchesPerformance = st.status === "Needs attention";
    if (selectedPerformance === "behind") matchesPerformance = st.status === "Behind";

    let matchesQuiz = true;
    if (selectedQuizPerformance === "excellent") matchesQuiz = (st.quiz_average || 78) >= 85;
    if (selectedQuizPerformance === "good") matchesQuiz = (st.quiz_average || 78) >= 70 && (st.quiz_average || 78) < 85;
    if (selectedQuizPerformance === "needs_improvement") matchesQuiz = (st.quiz_average || 78) < 70;

    return matchesSearch && matchesClassroom && matchesPerformance && matchesQuiz;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-bounce">
          <FaCheckCircle className="text-xl" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">All Students</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor student learning journeys, reading progress, assessments, and academic growth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddStudentModalOpen(true)}
            className="sn-btn-primary"
          >
            <FaPlus /> Add Student
          </button>

          {/* View Toggle Buttons */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-2xl">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "card"
                  ? "bg-white dark:bg-slate-800 text-purple-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <FaThLarge /> Card View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-800 text-purple-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <FaList /> List View
            </button>
          </div>
        </div>
      </div>

      {/* Top Summary Statistics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-lg font-bold">
            <FaUsers />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white">
              {stats.total_students || filteredStudents.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">Total Students</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-lg font-bold">
            <FaBookOpen />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white">
              {stats.active_readers || 21}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">Active Readers</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-lg font-bold">
            <FaChartLine />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white">
              {stats.avg_reading_progress || 76}%
            </div>
            <div className="text-[11px] font-semibold text-slate-400">Avg Progress</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-lg font-bold">
            <FaAward />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white">
              {stats.avg_quiz_score || 81}%
            </div>
            <div className="text-[11px] font-semibold text-slate-400">Quiz Average</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-lg font-bold">
            <FaExclamationTriangle />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800 dark:text-white">
              {stats.needs_attention_count || 4}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">Needs Attention</div>
          </div>
        </div>
      </div>

      {/* Multi-Condition Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sn-search-input"
          />
        </form>

        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto items-center">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <FaFilter className="text-purple-600" /> Filters:
          </div>

          {/* Classroom Filter */}
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="sn-filter-select"
          >
            <option value="all">All Classrooms</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Reading Level Filter */}
          <select
            value={selectedReadingLevel}
            onChange={(e) => setSelectedReadingLevel(e.target.value)}
            className="sn-filter-select"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Performance Status Filter */}
          <select
            value={selectedPerformance}
            onChange={(e) => setSelectedPerformance(e.target.value)}
            className="sn-filter-select"
          >
            <option value="all">All Performance</option>
            <option value="on_track">On Track</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="behind">Behind</option>
          </select>

          {/* Quiz Performance Filter */}
          <select
            value={selectedQuizPerformance}
            onChange={(e) => setSelectedQuizPerformance(e.target.value)}
            className="sn-filter-select"
          >
            <option value="all">All Quiz Performance</option>
            <option value="excellent">Excellent (85%+)</option>
            <option value="good">Good (70-84%)</option>
            <option value="needs_improvement">Needs Improvement (&lt;70%)</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
              <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-8 rounded-3xl border border-red-200 text-center space-y-3">
          <FaExclamationTriangle className="mx-auto text-3xl text-red-500" />
          <h3 className="font-bold text-base">Couldn't Load Students</h3>
          <p className="text-xs text-red-500/80">{error}</p>
          <button
            onClick={loadDirectoryData}
            className="bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm px-6 space-y-3">
          <div className="h-16 w-16 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-3xl mx-auto">
            <FaUserGraduate />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Matching Students Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or filters to find enrolled students.
          </p>
        </div>
      ) : viewMode === "card" ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between relative group"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                      {st.avatar || st.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-purple-600 transition-colors">
                        {st.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {st.grade || "Grade 3"} • {st.classroom_name || "Grade 3 — Section A"}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === st.id ? null : st.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                    >
                      <FaEllipsisV />
                    </button>

                    {activeMenuId === st.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-20">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            navigate(`/teacher/students/${st.id}`);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 flex items-center gap-2"
                        >
                          <FaUserGraduate className="text-purple-500" /> View Learning Profile
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setSelectedStudentForReport(st);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 flex items-center gap-2"
                        >
                          <FaFileAlt className="text-indigo-500" /> Generate Progress Report
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setSelectedStudentForCert(st);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 flex items-center gap-2"
                        >
                          <FaAward className="text-amber-500" /> Issue Certificate
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Stories Read</div>
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {st.stories_read || 4}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Quiz Avg</div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {st.quiz_average || 78}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>Learning Progress</span>
                    <span>{st.progress || 76}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${st.progress || 76}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span
                  className={
                    st.status === "Needs attention"
                      ? "sn-badge-attention"
                      : st.status === "Behind"
                      ? "sn-badge-behind"
                      : "sn-badge-on-track"
                  }
                >
                  ● {st.status || "On track"}
                </span>

                <Link
                  to={`/teacher/students/${st.id}`}
                  className="bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950/40 dark:text-purple-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  View Profile &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-[11px] uppercase tracking-wider border-b">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Classroom</th>
                  <th className="px-6 py-4 font-semibold">Reading Level</th>
                  <th className="px-6 py-4 font-semibold text-center">Stories</th>
                  <th className="px-6 py-4 font-semibold text-center">Quiz Avg</th>
                  <th className="px-6 py-4 font-semibold text-center">Progress</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold">
                          {st.avatar || st.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white text-xs">{st.name}</div>
                          <div className="text-[10px] text-slate-400">{st.grade}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {st.classroom_name || "Grade 3A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold">
                        {st.reading_level || "Beginner"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-center font-bold text-slate-700 dark:text-slate-300">
                      {st.stories_read || 4}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-center font-extrabold text-purple-600">
                      {st.quiz_average || 78}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-center font-bold text-indigo-600">
                      {st.progress || 76}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          st.status === "On track"
                            ? "bg-emerald-50 text-emerald-700"
                            : st.status === "Needs attention"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {st.status || "On track"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-3">
                      <Link
                        to={`/teacher/students/${st.id}`}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => setSelectedStudentForReport(st)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Report
                      </button>
                      <button
                        onClick={() => setSelectedStudentForCert(st)}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        Cert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Report Generator Modal */}
      {selectedStudentForReport && (
        <StudentReportModal
          student={selectedStudentForReport}
          onClose={() => setSelectedStudentForReport(null)}
          onReportGenerated={loadDirectoryData}
        />
      )}

      {/* Certificate Issuance Wizard Modal */}
      {selectedStudentForCert && (
        <CertificateIssuanceModal
          student={selectedStudentForCert}
          onClose={() => setSelectedStudentForCert(null)}
          onCertificateIssued={loadDirectoryData}
        />
      )}

      {/* Global Add Student Modal */}
      {isAddStudentModalOpen && (
        <AddStudentModal
          classrooms={classrooms}
          onClose={() => setIsAddStudentModalOpen(false)}
          onStudentsAdded={loadDirectoryData}
        />
      )}
    </div>
  );
}
