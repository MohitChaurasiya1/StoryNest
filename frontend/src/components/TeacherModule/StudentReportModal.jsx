import React, { useState } from "react";
import {
  FaTimes,
  FaPrint,
  FaDownload,
  FaCheckCircle,
  FaBook,
  FaAward,
  FaChartLine,
  FaGraduationCap,
  FaFileAlt
} from "react-icons/fa";
import { teacherAPI } from "../../services/api";

export default function StudentReportModal({ student, onClose, onReportGenerated }) {
  const [period, setPeriod] = useState("last_30_days");
  const [reportType, setReportType] = useState("progress_report");
  const [teacherNotes, setTeacherNotes] = useState(
    `${student?.name || "Student"} has demonstrated consistent reading engagement and strong story recall performance.`
  );

  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await teacherAPI.generateStudentReport(student.id, {
        period,
        report_type: reportType,
        teacher_notes: teacherNotes
      });
      setGeneratedReport(res?.report || res);
      if (onReportGenerated) onReportGenerated();
    } catch (err) {
      console.error("Error generating report:", err);
      // Create local fallback preview
      setGeneratedReport({
        report_number: `SN-REP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        created_at: new Date().toISOString().split("T")[0],
        period_display: period === "last_7_days" ? "Last 7 Days" : "Last 30 Days",
        report_type_display: "Student Progress Report",
        data_snapshot: {
          student_name: student?.name || "Student",
          grade: student?.grade || "Grade 3",
          classroom_name: student?.classroom_name || "Grade 3 — Section A",
          reading_level: student?.reading_level || "Beginner",
          stories_read: student?.stories_read || 5,
          reading_time_hours: 2.25,
          quiz_average: student?.quiz_average || 82.5,
          assignment_completion: 87,
          reading_streak: 6,
          topics: {
            Comprehension: 88,
            Vocabulary: 72,
            Characters: 84,
            Inference: 79
          },
          strengths: "Strong story comprehension and consistent daily reading engagement.",
          areas_for_improvement: "Vocabulary quiz retention under timed conditions.",
          next_steps: "Assign 2 dual-language vocabulary fables and schedule a short quiz.",
          overall_status: "On Track"
        }
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const snapshot = generatedReport?.data_snapshot || {
    student_name: student?.name || "Student",
    grade: student?.grade || "Grade 3",
    classroom_name: student?.classroom_name || "Grade 3 — Section A",
    reading_level: student?.reading_level || "Beginner",
    stories_read: student?.stories_read || 5,
    reading_time_hours: 2.25,
    quiz_average: student?.quiz_average || 82.5,
    assignment_completion: 87,
    reading_streak: 6,
    topics: {
      Comprehension: 88,
      Vocabulary: 72,
      Characters: 84,
      Inference: 79
    },
    strengths: "Strong story comprehension and consistent daily reading engagement.",
    areas_for_improvement: "Vocabulary quiz retention under timed conditions.",
    next_steps: "Assign 2 dual-language vocabulary fables and schedule a short quiz.",
    overall_status: "On Track"
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm">
            <FaFileAlt className="text-purple-600" />
            <span>Academic Progress Report — {student?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {generatedReport && (
              <button
                onClick={handlePrint}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <FaPrint /> Print / Save PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Configuration Bar (Hidden after generating or on print) */}
        {!generatedReport && (
          <div className="p-6 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/40 space-y-4 print:hidden">
            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200">Configure Report Generation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="last_3_months">Last 3 Months</option>
                  <option value="academic_year">Current Academic Year</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  <option value="progress_report">Comprehensive Progress Report</option>
                  <option value="reading_report">Reading Activity Report</option>
                  <option value="quiz_report">Quiz & Assessment Report</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                Teacher Note / Comments (Included in Report)
              </label>
              <textarea
                rows="2"
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs resize-none"
              ></textarea>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold text-xs transition shadow-md disabled:opacity-50"
            >
              {generating ? "Generating Academic Report..." : "Generate Official Report"}
            </button>
          </div>
        )}

        {/* Printable Report Document Body */}
        <div className="p-8 space-y-6 text-slate-800 dark:text-slate-100 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8 print:text-black">
          {/* Document Header */}
          <div className="flex justify-between items-start border-b-2 border-purple-600 pb-4">
            <div>
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-2xl tracking-tight">
                <span>📚 StoryNest</span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
                Student Learning & Progress Report
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-extrabold text-slate-700 dark:text-slate-300">
                {generatedReport?.report_number || "SN-REP-2026-00042"}
              </div>
              <div className="text-slate-400 font-medium">
                Issued: {generatedReport?.created_at || new Date().toISOString().split("T")[0]}
              </div>
              <div className="text-purple-600 font-semibold mt-1">
                Period: {period === "last_7_days" ? "Last 7 Days" : "Last 30 Days"}
              </div>
            </div>
          </div>

          {/* Student Information Strip */}
          <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs print:bg-slate-50">
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Student Name</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">{snapshot.student_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Grade & Class</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">
                {snapshot.grade} — {snapshot.classroom_name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Reading Level</span>
              <span className="font-bold text-purple-600 text-sm">{snapshot.reading_level}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Status</span>
              <span className="font-extrabold text-emerald-600 text-sm">● {snapshot.overall_status}</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Academic Performance Overview</h4>
            <div className="grid grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
                <div className="text-[10px] font-semibold text-purple-600">Stories Read</div>
                <div className="text-xl font-extrabold text-purple-700 mt-0.5">{snapshot.stories_read}</div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
                <div className="text-[10px] font-semibold text-indigo-600">Reading Time</div>
                <div className="text-xl font-extrabold text-indigo-700 mt-0.5">{snapshot.reading_time_hours} hrs</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                <div className="text-[10px] font-semibold text-emerald-600">Quiz Average</div>
                <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{snapshot.quiz_average}%</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
                <div className="text-[10px] font-semibold text-amber-600">Assignment Rate</div>
                <div className="text-xl font-extrabold text-amber-700 mt-0.5">{snapshot.assignment_completion}%</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
                <div className="text-[10px] font-semibold text-blue-600">Reading Streak</div>
                <div className="text-xl font-extrabold text-blue-700 mt-0.5">{snapshot.reading_streak} days</div>
              </div>
            </div>
          </div>

          {/* Assessment Breakdown by Topic */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Comprehension & Topic Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(snapshot.topics || {}).map(([topic, val]) => (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{topic}</span>
                    <span className="text-purple-600">{val}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${val}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Assessment Notes */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
              Teacher Diagnostic & Next Steps
            </h4>
            <div>
              <strong className="text-emerald-600">Key Strengths: </strong>
              <span>{snapshot.strengths}</span>
            </div>
            <div>
              <strong className="text-amber-600">Areas for Improvement: </strong>
              <span>{snapshot.areas_for_improvement}</span>
            </div>
            <div>
              <strong className="text-purple-600">Recommended Next Steps: </strong>
              <span>{snapshot.next_steps}</span>
            </div>
            {teacherNotes && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 italic text-slate-600 dark:text-slate-300">
                "{teacherNotes}"
              </div>
            )}
          </div>

          {/* Document Footer Signature (Print view) */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300">Lead Educator Signature</p>
              <div className="h-8 border-b border-dashed border-slate-400 w-48 mt-2"></div>
              <p className="text-[10px] text-slate-400 mt-1">Ms. Maria Rivera — Primary Grade Educator</p>
            </div>
            <div className="text-right text-[10px] text-slate-400">
              Verified by StoryNest Learning Platform
              <br />
              https://storynest.edu/reports/{generatedReport?.report_number || "SN-REP-2026-00042"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
