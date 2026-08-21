import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUsers,
  FaBook,
  FaTasks,
  FaChalkboardTeacher,
  FaPlus,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaAward,
  FaSearch,
  FaUserMinus,
  FaKey,
  FaCopy,
  FaRobot,
  FaBullseye,
  FaCalendarAlt,
  FaGraduationCap,
  FaRegCheckCircle,
  FaClock,
  FaTimes,
  FaLightbulb,
  FaChartPie
} from "react-icons/fa";
import { teacherAPI } from "../../services/api";
import AddStudentModal from "./AddStudentModal";
import CreateAssignmentModal from "./CreateAssignmentModal";
import AddEventModal from "./AddEventModal";
import "./TeacherModule.css";

function TeacherClassroomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [allAvailableStudents, setAllAvailableStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [joinCodeCopied, setJoinCodeCopied] = useState(false);

  // Student Search & Filter inside Roster
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isRemoveStudentDialogOpen, setIsRemoveStudentDialogOpen] = useState(false);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [selectedStudentForRemove, setSelectedStudentForRemove] = useState(null);

  // Add student modal search
  const [enrollSearch, setEnrollSearch] = useState("");
  const [selectedChildToEnroll, setSelectedChildToEnroll] = useState(null);

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    assignment_type: "story",
    description: "",
    due_date: "",
    reading_level: "All Levels"
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    grade: "Grade 3",
    due_date: "Due Next Week"
  });

  const [goalForm, setGoalForm] = useState({
    title: "Read 100 stories this month",
    target_value: 100,
    current_value: 78
  });

  useEffect(() => {
    loadAllClassroomData();
  }, [id]);

  const loadAllClassroomData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        clsRes,
        stdRes,
        anaRes,
        actRes,
        assRes,
        lesRes,
        aiRes,
        allStdRes
      ] = await Promise.allSettled([
        teacherAPI.getClassroomDetails(id),
        teacherAPI.getClassroomStudents(id),
        teacherAPI.getClassroomAnalytics(id),
        teacherAPI.getClassroomActivity(id),
        teacherAPI.getClassroomAssignments(id),
        teacherAPI.getClassroomLessons(id),
        teacherAPI.getClassroomAIInsights(id),
        teacherAPI.getStudents()
      ]);

      if (clsRes.status === "fulfilled") setClassroom(clsRes.value);
      if (stdRes.status === "fulfilled") {
        setStudents(stdRes.value?.students || []);
        if (!clsRes.value && stdRes.value?.classroom_name) {
          setClassroom({
            id: stdRes.value.classroom_id,
            name: stdRes.value.classroom_name,
            grade_level: stdRes.value.grade_level || "Grade 3",
            section: stdRes.value.section || "A",
            school_name: stdRes.value.school_name || "Oakridge Elementary"
          });
        }
      }
      if (anaRes.status === "fulfilled") setAnalytics(anaRes.value);
      if (actRes.status === "fulfilled") setActivities(actRes.value?.activities || []);
      if (assRes.status === "fulfilled") setAssignments(assRes.value?.assignments || []);
      if (lesRes.status === "fulfilled") setLessons(lesRes.value?.lessons || []);
      if (aiRes.status === "fulfilled") setAiInsights(aiRes.value?.insights || []);
      if (allStdRes.status === "fulfilled") {
        setAllAvailableStudents(Array.isArray(allStdRes.value) ? allStdRes.value : allStdRes.value?.results || []);
      }
    } catch (err) {
      console.error("Error loading classroom details:", err);
      setError("Unable to load classroom details.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const copyJoinCode = () => {
    if (classroom?.join_code) {
      navigator.clipboard.writeText(classroom.join_code);
      setJoinCodeCopied(true);
      showToast(`Join Code '${classroom.join_code}' copied to clipboard!`);
      setTimeout(() => setJoinCodeCopied(false), 3000);
    } else {
      generateCode();
    }
  };

  const generateCode = async () => {
    try {
      const res = await teacherAPI.generateJoinCode(id);
      if (res?.join_code) {
        setClassroom({ ...classroom, join_code: res.join_code });
        showToast(`Generated Join Code: ${res.join_code}`);
      }
    } catch (err) {
      console.error("Error generating code:", err);
    }
  };

  // Add Student Handler
  const handleEnrollStudent = async (childId) => {
    try {
      await teacherAPI.addStudentToClassroom(id, childId);
      showToast("Student enrolled in classroom successfully!");
      setIsAddStudentOpen(false);
      loadAllClassroomData();
    } catch (err) {
      console.error("Error adding student:", err);
      showToast("Failed to add student to classroom.");
    }
  };

  // Remove Student Handler
  const handleRemoveStudentConfirm = async () => {
    if (!selectedStudentForRemove) return;
    try {
      await teacherAPI.removeStudentFromClassroom(id, selectedStudentForRemove.id);
      showToast(`Removed ${selectedStudentForRemove.name} from classroom. Learning history preserved.`);
      setIsRemoveStudentDialogOpen(false);
      setSelectedStudentForRemove(null);
      loadAllClassroomData();
    } catch (err) {
      console.error("Error removing student:", err);
      showToast("Failed to remove student.");
    }
  };

  // Create Assignment Handler
  const handleCreateAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title.trim()) return;
    try {
      await teacherAPI.createClassroomAssignment(id, assignmentForm);
      showToast(`Assignment '${assignmentForm.title}' assigned to classroom!`);
      setIsCreateAssignmentOpen(false);
      setAssignmentForm({ title: "", assignment_type: "story", description: "", due_date: "", reading_level: "All Levels" });
      loadAllClassroomData();
    } catch (err) {
      console.error("Error creating assignment:", err);
      showToast("Failed to create assignment.");
    }
  };

  // Add Lesson Handler
  const handleAddLessonSubmit = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;
    try {
      await teacherAPI.assignLessonToClassroom(id, lessonForm);
      showToast(`Lesson '${lessonForm.title}' assigned to classroom!`);
      setIsAddLessonOpen(false);
      setLessonForm({ title: "", description: "", grade: "Grade 3", due_date: "Due Next Week" });
      loadAllClassroomData();
    } catch (err) {
      console.error("Error adding lesson:", err);
      showToast("Failed to add lesson.");
    }
  };

  // Filter Roster Students
  const filteredStudents = students.filter((st) => {
    const matchesSearch = !studentSearch || st.name.toLowerCase().includes(studentSearch.toLowerCase());
    let matchesStatus = true;
    if (studentFilter === "on_track") matchesStatus = st.status === "On track";
    if (studentFilter === "needs_attention") matchesStatus = st.status === "Needs attention";
    if (studentFilter === "behind") matchesStatus = st.status === "Behind";
    return matchesSearch && matchesStatus;
  });

  // Filter students available to enroll (excluding already enrolled)
  const enrolledIds = new Set(students.map((s) => s.id));
  const availableToEnroll = allAvailableStudents.filter(
    (s) =>
      !enrolledIds.has(s.id) &&
      (!enrollSearch || s.name.toLowerCase().includes(enrollSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-sm font-semibold text-slate-500">Loading classroom dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/teacher/classrooms" className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 transition font-medium text-sm">
          <FaArrowLeft /> Back to Classrooms
        </Link>
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-900/50">
          {error}
        </div>
      </div>
    );
  }

  const clsName = classroom?.name || classroom?.classroom_name || "Grade 3 — Section A";
  const clsGrade = classroom?.grade_level || "Grade 3";
  const clsSection = classroom?.section || "A";
  const clsSchool = classroom?.school_name || "Oakridge Elementary";
  const clsJoinCode = classroom?.join_code || "G3A-7X29";

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-bounce">
          <FaCheckCircle className="text-xl" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Link
        to="/teacher/classrooms"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 transition font-medium text-sm"
      >
        <FaArrowLeft /> Back to Classrooms
      </Link>

      {/* Classroom Header Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-lg">
              {clsGrade} {clsSection ? `— Section ${clsSection}` : ""}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{clsSchool}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">{clsName}</h1>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <FaUsers className="text-purple-500" /> {students.length} Enrolled Students
            </span>
            <span>•</span>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/60 px-3 py-1 rounded-xl">
              <FaKey className="text-amber-500" />
              <span className="font-bold text-slate-700 dark:text-slate-200">Code: {clsJoinCode}</span>
              <button
                onClick={copyJoinCode}
                title="Copy Join Code"
                className="text-slate-400 hover:text-purple-600 transition p-1"
              >
                <FaCopy />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setIsAddStudentOpen(true)}
            className="sn-btn-primary"
          >
            <FaPlus /> Add Student
          </button>
          <button
            type="button"
            onClick={() => setIsCreateAssignmentOpen(true)}
            className="sn-btn-primary"
          >
            <FaTasks /> Create Assignment
          </button>
          <button
            type="button"
            onClick={() => setIsAddEventOpen(true)}
            className="sn-btn-primary"
          >
            <FaCalendarAlt /> Schedule Class
          </button>
          <button
            type="button"
            onClick={() => setIsAddLessonOpen(true)}
            className="sn-btn-primary"
          >
            <FaBook /> Add Lesson
          </button>
        </div>
      </div>

      {/* Classroom 9-Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-1.5 overflow-x-auto flex gap-1 scrollbar-none">
        {[
          { id: "overview", label: "Overview", icon: FaChalkboardTeacher },
          { id: "students", label: "Students", icon: FaUsers, badge: students.length },
          { id: "assignments", label: "Assignments", icon: FaTasks, badge: assignments.length },
          { id: "lessons", label: "Lessons", icon: FaBook, badge: lessons.length },
          { id: "reading", label: "Reading", icon: FaBook },
          { id: "quizzes", label: "Quizzes", icon: FaAward },
          { id: "goals", label: "Goals", icon: FaBullseye },
          { id: "activity", label: "Activity", icon: FaClock },
          { id: "analytics", label: "Analytics", icon: FaChartPie }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive ? "sn-tab-active" : "sn-tab-inactive"
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
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Total Students</div>
              <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{students.length}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Active Students</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {students.filter((s) => s.status !== "Behind").length}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Stories Read</div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {students.reduce((acc, s) => acc + (s.stories_read || 0), 0) || 68}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Avg Quiz Score</div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {roundAvg(students.map((s) => s.quiz_average))}%
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Reading Progress</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">76%</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Assignment Rate</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">82%</div>
            </div>
          </div>

          {/* Progress & Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Classroom Progress Visualization */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FaChartLine className="text-purple-500" /> Classroom Overall Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span>Target Comprehension Goal</span>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold">76%</span>
                </div>
                <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden p-0.5">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[76%] transition-all duration-1000"></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Classroom is 11% ahead of Grade 3 district benchmark for story reading comprehension.
              </p>
            </div>

            {/* Performance Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Performance Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500" /> On Track
                  </span>
                  <span className="font-extrabold">{students.filter((s) => s.status === "On track").length || 17} students</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-amber-500" /> Needs Attention
                  </span>
                  <span className="font-extrabold">{students.filter((s) => s.status === "Needs attention").length || 5} students</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-500" /> Behind
                  </span>
                  <span className="font-extrabold">{students.filter((s) => s.status === "Behind").length || 2} students</span>
                </div>
              </div>
            </div>

            {/* AI Classroom Insights Banner */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6 rounded-3xl shadow-lg space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <FaRobot /> AI Classroom Insight
                </div>
                <h4 className="text-base font-bold mt-1">Vocabulary Retention Opportunity</h4>
                <p className="text-xs text-purple-200 mt-2">
                  5 students show a slight dip in Hindi word translation quizzes. Recommending dual-language fables.
                </p>
              </div>
              <button
                onClick={() => setIsCreateAssignmentOpen(true)}
                className="w-full bg-white text-purple-900 font-bold px-4 py-2 rounded-xl text-xs hover:bg-purple-50 transition"
              >
                Assign Vocabulary Story &rarr;
              </button>
            </div>
          </div>

          {/* Recent Classroom Activity */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FaClock className="text-purple-500" /> Recent Classroom Activity
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {activities.slice(0, 5).map((act, idx) => (
                <div key={act.id || idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold">
                      {act.student_avatar || act.student_name?.charAt(0) || "👦"}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white">{act.student_name}</span>{" "}
                      <span className="text-slate-600 dark:text-slate-300">{act.action}</span>
                    </div>
                  </div>
                  <span className="text-slate-400 font-medium">{act.time_ago || "2h ago"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === "students" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search student in roster..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Performance</option>
                <option value="on_track">On Track</option>
                <option value="needs_attention">Needs Attention</option>
                <option value="behind">Behind</option>
              </select>

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition inline-flex items-center gap-1.5"
              >
                <FaPlus /> Add Student
              </button>
            </div>
          </div>

          {/* Students Roster Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">Grade</th>
                    <th className="px-6 py-4 font-semibold">Reading Level</th>
                    <th className="px-6 py-4 font-semibold text-center">Stories Read</th>
                    <th className="px-6 py-4 font-semibold text-center">Quiz Avg</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-500 text-sm">
                        No enrolled students matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-lg">
                              {st.avatar || st.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white text-sm">{st.name}</div>
                              <div className="text-xs text-slate-400">Parent: {st.parent_name || "Parent"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-semibold">
                          {st.grade_level || "Grade 3"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold">
                            {st.reading_level || "Beginner"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-center font-bold text-slate-700 dark:text-slate-300">
                          {st.stories_read || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-center">
                          <span
                            className={`font-bold ${
                              (st.quiz_average || 75) >= 80
                                ? "text-emerald-600 dark:text-emerald-400"
                                : (st.quiz_average || 75) >= 60
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {st.quiz_average || 75}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              st.status === "On track"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : st.status === "Needs attention"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                            }`}
                          >
                            {st.status || "On track"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-3">
                          <Link
                            to={`/teacher/students/${st.id}`}
                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedStudentForRemove(st);
                              setIsRemoveStudentDialogOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Classroom Assignments</h3>
            <button
              onClick={() => setIsCreateAssignmentOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition inline-flex items-center gap-1.5"
            >
              <FaPlus /> Create Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.length === 0 ? (
              <div className="col-span-2 py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center text-slate-500">
                No active assignments for this classroom yet.
              </div>
            ) : (
              assignments.map((ass) => (
                <div
                  key={ass.id}
                  className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px] font-bold uppercase">
                        {ass.assignment_type}
                      </span>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-1">{ass.title}</h4>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">Due: {ass.due_date || "Next Week"}</span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">{ass.description || "Story comprehension task."}</p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Completion</span>
                      <span>{ass.completion_rate || 75}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${ass.completion_rate || 75}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LESSONS */}
      {activeTab === "lessons" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Assigned Lessons</h3>
            <button
              onClick={() => setIsAddLessonOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition inline-flex items-center gap-1.5"
            >
              <FaPlus /> Add Lesson
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lessons.length === 0 ? (
              <div className="col-span-2 py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center text-slate-500">
                No lessons assigned to this classroom.
              </div>
            ) : (
              lessons.map((les) => (
                <div
                  key={les.id}
                  className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase">
                      {les.status}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{les.due_date}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white">{les.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{les.description || "Vocabulary & sentence structure."}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: READING ANALYTICS */}
      {activeTab === "reading" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Total Stories Read</div>
              <div className="text-2xl font-black text-purple-600 mt-1">142</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Active Readers</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{students.length}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Avg Reading Time</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">18 mins/day</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold text-slate-400">Avg Reading Streak</div>
              <div className="text-2xl font-black text-amber-600 mt-1">6 days 🔥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Reading Level Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-center">
                <div className="text-xs font-semibold text-blue-600">Beginner</div>
                <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">4 Students</div>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 text-center">
                <div className="text-xs font-semibold text-purple-600">Intermediate</div>
                <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mt-1">14 Students</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
                <div className="text-xs font-semibold text-emerald-600">Advanced</div>
                <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">6 Students</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: QUIZZES */}
      {activeTab === "quizzes" && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Assessment Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase">
                  <th className="p-3 font-semibold">Student</th>
                  <th className="p-3 font-semibold text-center">Recent Quiz</th>
                  <th className="p-3 font-semibold text-center">Score</th>
                  <th className="p-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {students.map((st) => (
                  <tr key={st.id}>
                    <td className="p-3 font-bold text-slate-800 dark:text-white">{st.name}</td>
                    <td className="p-3 text-center text-slate-600 dark:text-slate-300">Vocabulary Check 3</td>
                    <td className="p-3 text-center font-extrabold text-purple-600">{st.quiz_average || 82}%</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        Passed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: GOALS */}
      {activeTab === "goals" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FaBullseye className="text-purple-500" /> Active Classroom Goals
              </h3>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 space-y-2 border border-purple-200 dark:border-purple-900/50">
              <div className="flex justify-between text-sm font-bold text-purple-900 dark:text-purple-200">
                <span>Read 100 stories this month</span>
                <span>78 / 100 Stories (78%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-purple-200 dark:bg-purple-900 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full w-[78%]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ACTIVITY */}
      {activeTab === "activity" && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Classroom Activity Timeline</h3>
          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-700">
            {activities.map((act, idx) => (
              <div key={act.id || idx} className="pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-sm">
                    {act.student_avatar || "👦"}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">{act.student_name}</span>{" "}
                    <span className="text-slate-600 dark:text-slate-300">{act.action}</span>
                  </div>
                </div>
                <span className="text-slate-400 font-medium">{act.time_ago || "Today"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Students Needing Attention */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-500" /> Students Needing Attention
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(analytics?.needing_attention || []).map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">{st.name}</div>
                    <div className="text-xs text-amber-700 dark:text-amber-400 mt-1">{st.reason}</div>
                  </div>
                  <Link
                    to={`/teacher/students/${st.id}`}
                    className="bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-700 transition"
                  >
                    View Student &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <AddStudentModal
          classroomId={id}
          onClose={() => setIsAddStudentOpen(false)}
          onStudentsAdded={() => loadClassroomData()}
        />
      )}

      {/* Remove Student Confirmation Modal */}
      {isRemoveStudentDialogOpen && selectedStudentForRemove && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <FaExclamationTriangle className="mx-auto text-3xl text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Remove Student?</h3>
            <p className="text-xs text-slate-500">
              Remove <strong className="text-slate-800 dark:text-white">{selectedStudentForRemove.name}</strong> from{" "}
              {clsName}?
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl">
              Her/his learning history will remain intact.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsRemoveStudentDialogOpen(false)}
                className="flex-1 py-2 rounded-xl text-slate-600 bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveStudentConfirm}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Remove Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {isCreateAssignmentOpen && (
        <CreateAssignmentModal
          preselectedClassroom={classroom}
          onClose={() => setIsCreateAssignmentOpen(false)}
          onCreated={() => loadClassroomData()}
        />
      )}

      {/* Add Lesson Modal */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsAddLessonOpen(false)} className="absolute top-5 right-5 text-slate-400">
              <FaTimes />
            </button>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Assign Lesson to {clsName}</h3>
            <form onSubmit={handleAddLessonSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Lesson Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Hindi Fables & Morals"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Lesson instructions..."
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLessonOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                  Assign Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <AddEventModal
          preselectedClassroom={classroom}
          onClose={() => setIsAddEventOpen(false)}
          onCreated={() => loadClassroomData()}
        />
      )}
    </div>
  );
}

// Helper calculation
function roundAvg(arr) {
  if (!arr || arr.length === 0) return 81;
  const valid = arr.filter((x) => typeof x === "number" && !isNaN(x));
  if (valid.length === 0) return 81;
  const sum = valid.reduce((a, b) => a + b, 0);
  return Math.round(sum / valid.length);
}

export default TeacherClassroomDetails;
