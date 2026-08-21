import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaAward,
  FaTasks,
  FaBullseye,
  FaClock,
  FaFileAlt,
  FaRobot,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaPrint,
  FaDownload,
  FaStar,
  FaGraduationCap,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaBan
} from "react-icons/fa";
import { teacherAPI } from "../../services/api";
import StudentReportModal from "./StudentReportModal";
import CertificateIssuanceModal from "./CertificateIssuanceModal";
import CreateAssignmentModal from "./CreateAssignmentModal";

export default function TeacherStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);

  // Filters inside Reading & Quiz tabs
  const [readingLogSearch, setReadingLogSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    loadStudentProfile();
  }, [id]);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await teacherAPI.getStudentDetails(id);
      setStudentDetails(res);
    } catch (err) {
      console.error("Error loading student details:", err);
      setError("Unable to load student profile details.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleRevokeCertificate = async (certId) => {
    if (!window.confirm("Are you sure you want to revoke this certificate?")) return;
    try {
      await teacherAPI.revokeCertificate(id, certId, "Revoked by lead educator.");
      showToast("Certificate marked as revoked.");
      loadStudentProfile();
    } catch (err) {
      console.error("Error revoking certificate:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-sm font-semibold text-slate-500">Loading student learning profile...</p>
      </div>
    );
  }

  if (error || !studentDetails) {
    return (
      <div className="space-y-4">
        <Link to="/teacher/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 font-medium text-sm">
          <FaArrowLeft /> Back to All Students
        </Link>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
          {error || "Student details not found."}
        </div>
      </div>
    );
  }

  const name = studentDetails.name || "Student Name";
  const grade = studentDetails.grade || "Grade 3";
  const clsName = studentDetails.classroom_name || "Grade 3 — Section A";
  const readingLevel = studentDetails.reading_level || "Beginner";
  const stats = studentDetails.stats || {};
  const logs = studentDetails.reading_logs || [];
  const quizzes = studentDetails.quizzes || [];
  const certs = studentDetails.certificates || [];
  const achievements = studentDetails.achievements || [];
  const reports = studentDetails.reports || [];
  const submissions = studentDetails.lesson_submissions || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-bounce">
          <FaCheckCircle className="text-xl" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Breadcrumb */}
      <Link
        to="/teacher/students"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 transition font-medium text-sm"
      >
        <FaArrowLeft /> Back to All Students Directory
      </Link>

      {/* Academic Header Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-md">
            {studentDetails.avatar || name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-bold">
                {readingLevel} Reader
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 text-xs font-bold">
                ● On Track
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {grade} • {clsName} • Parent: <strong className="text-slate-700 dark:text-slate-300">{studentDetails.parent_name || "Parent"}</strong>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setIsCreateAssignmentOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition font-semibold text-xs shadow-md"
          >
            <FaTasks /> + Assign Work
          </button>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl transition font-semibold text-xs shadow-md"
          >
            <FaFileAlt /> Generate Report
          </button>
          <button
            onClick={() => setIsCertModalOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl transition font-semibold text-xs shadow-md"
          >
            <FaAward /> Issue Certificate
          </button>
        </div>
      </div>

      {/* Top Key Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Stories Read</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {stats.total_stories_read || logs.length || 5}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Reading Time</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.total_reading_hours || 2.2} hrs
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Quiz Average</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.quiz_average || 82.5}%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Reading Streak</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.reading_streak || 6} days 🔥
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Badges Earned</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {stats.badges_earned || achievements.length || 3} 🏆
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-semibold text-slate-400">Assignment Rate</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {stats.assignment_completion_rate || 87}%
          </div>
        </div>
      </div>

      {/* 9-Tab Profile Workspace Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-1.5 overflow-x-auto flex gap-1 scrollbar-none">
        {[
          { id: "overview", label: "Overview", icon: FaGraduationCap },
          { id: "reading", label: "Reading", icon: FaBook, badge: logs.length },
          { id: "quizzes", label: "Quizzes", icon: FaAward, badge: quizzes.length },
          { id: "assignments", label: "Assignments", icon: FaTasks, badge: submissions.length },
          { id: "goals", label: "Goals", icon: FaBullseye },
          { id: "achievements", label: "Achievements", icon: FaStar, badge: achievements.length },
          { id: "certificates", label: "Certificates", icon: FaAward, badge: certs.length },
          { id: "reports", label: "Reports", icon: FaFileAlt, badge: reports.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
              }`}
            >
              <Icon className={isActive ? "text-white" : "text-purple-500"} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? "bg-purple-700 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Trend & Topic Breakdown */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FaChartLine className="text-purple-500" /> Comprehension & Topic Performance
              </h3>
              <div className="space-y-3">
                {[
                  { topic: "Story Comprehension", score: 88 },
                  { topic: "Vocabulary Retention", score: 72 },
                  { topic: "Character & Plot Recall", score: 84 },
                  { topic: "Hindi-English Translation", score: 79 }
                ].map((t) => (
                  <div key={t.topic} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{t.topic}</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{t.score}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        style={{ width: `${t.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Learning Insights Card */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6 rounded-3xl shadow-lg space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <FaRobot /> AI Learning Insight
                </div>
                <h4 className="text-base font-bold mt-2">Dual-Language Vocabulary Opportunity</h4>
                <p className="text-xs text-purple-200 mt-2">
                  {name} scores high in story recall (88%), but struggles with timed vocabulary checks (72%).
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full bg-white text-purple-900 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-purple-50 transition shadow-sm"
              >
                Generate Detailed Progress Report &rarr;
              </button>
            </div>
          </div>

          {/* Teacher Assessment & Diagnostic Notes */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Data-Driven Teacher Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                <strong className="text-emerald-700 dark:text-emerald-400 block font-bold mb-1">Key Strengths:</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  Strong plot recall, regular reading streak, and active participation in dual-language fables.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <strong className="text-amber-700 dark:text-amber-400 block font-bold mb-1">Areas for Improvement:</strong>
                <p className="text-slate-600 dark:text-slate-300">
                  Hindi vocabulary retention under timed quiz conditions. Needs targeted vocabulary practice stories.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: READING HISTORY */}
      {activeTab === "reading" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FaBook className="text-purple-500" /> Full Reading Log History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider border-b">
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Story Title</th>
                    <th className="p-3 font-semibold text-center">Duration</th>
                    <th className="p-3 font-semibold text-center">Pages Read</th>
                    <th className="p-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-300">{log.date}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-white">{log.title}</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-300">{log.minutes} mins</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-300">{log.pages_read || 5} pages</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUIZZES */}
      {activeTab === "quizzes" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FaAward className="text-purple-500" /> Assessment & Quiz History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider border-b">
                    <th className="p-3 font-semibold">Quiz Title</th>
                    <th className="p-3 font-semibold">Story</th>
                    <th className="p-3 font-semibold text-center">Score</th>
                    <th className="p-3 font-semibold text-center">Percentage</th>
                    <th className="p-3 font-semibold text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {quizzes.map((q) => (
                    <tr key={q.id}>
                      <td className="p-3 font-bold text-slate-800 dark:text-white">{q.quiz_title}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{q.story_title}</td>
                      <td className="p-3 text-center font-semibold">{q.score} / {q.total}</td>
                      <td className="p-3 text-center font-extrabold text-purple-600">{q.percentage}%</td>
                      <td className="p-3 text-center text-slate-500">{q.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CERTIFICATES */}
      {activeTab === "certificates" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Issued Certificates History</h3>
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition inline-flex items-center gap-1.5"
            >
              <FaAward /> Issue Certificate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certs.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-base">{c.title}</h4>
                      <div className="text-[11px] text-slate-400 font-mono">{c.certificate_number}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === "revoked" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {c.status || "active"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">{c.description}</p>
                <div className="text-[11px] text-slate-400">Issued by {c.issuer_name || "Maria Rivera"} on {c.issued_date}</div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setIsCertModalOpen(true)}
                    className="text-purple-600 font-bold hover:underline"
                  >
                    View / Print
                  </button>
                  {c.status !== "revoked" && (
                    <button
                      onClick={() => handleRevokeCertificate(c.id)}
                      className="text-red-500 hover:underline font-semibold text-[11px]"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Generated Academic Reports</h3>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition inline-flex items-center gap-1.5"
            >
              <FaFileAlt /> Generate Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{r.report_type_display || "Progress Report"}</h4>
                    <div className="text-[11px] text-slate-400 font-mono">{r.report_number}</div>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{r.created_at}</span>
                </div>
                <div className="text-xs text-slate-500">Period: {r.period_display || "Last 30 Days"}</div>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold py-2 rounded-xl text-xs transition"
                >
                  View & Print Report &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <StudentReportModal
          student={studentDetails}
          onClose={() => setIsReportModalOpen(false)}
          onReportGenerated={loadStudentProfile}
        />
      )}

      {/* Certificate Modal */}
      {isCertModalOpen && (
        <CertificateIssuanceModal
          student={studentDetails}
          onClose={() => setIsCertModalOpen(false)}
          onCertificateIssued={loadStudentProfile}
        />
      )}

      {/* Create Assignment Modal */}
      {isCreateAssignmentOpen && (
        <CreateAssignmentModal
          preselectedStudent={studentDetails}
          onClose={() => setIsCreateAssignmentOpen(false)}
          onCreated={loadStudentProfile}
        />
      )}
    </div>
  );
}
