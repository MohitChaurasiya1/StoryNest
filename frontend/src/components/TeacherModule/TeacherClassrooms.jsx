import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaUsers,
  FaChartLine,
  FaChalkboardTeacher,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaEllipsisV,
  FaEdit,
  FaArchive,
  FaUndo,
  FaTimes,
  FaCheckCircle,
  FaGraduationCap,
  FaSchool,
  FaBookOpen,
  FaAward
} from "react-icons/fa";
import { teacherAPI } from "../../services/api";
import "./TeacherModule.css";

function TeacherClassrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [stats, setStats] = useState({
    total_classrooms: 0,
    total_students: 0,
    active_students: 0,
    avg_progress: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedPerformance, setSelectedPerformance] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    grade_level: "Grade 3",
    section: "A",
    school_name: "Oakridge Elementary",
    description: "",
    academic_year: "2026–2027",
    subject: "Reading & Literature",
    max_students: 30
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    loadClassroomData();
  }, [selectedGrade, selectedStatus, selectedPerformance]);

  const loadClassroomData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (selectedGrade !== "all") params.grade = selectedGrade;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (searchTerm) params.search = searchTerm;

      const [classRes, statsRes] = await Promise.all([
        teacherAPI.getClassrooms(params),
        teacherAPI.getClassroomSummaryStats()
      ]);

      setClassrooms(Array.isArray(classRes) ? classRes : classRes.results || []);
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err) {
      console.error("Error loading classrooms:", err);
      setError("We couldn't retrieve your classrooms right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadClassroomData();
  };

  const openCreateModal = () => {
    setEditingClassroom(null);
    setFormData({
      name: "",
      grade_level: "Grade 3",
      section: "A",
      school_name: "Oakridge Elementary",
      description: "Primary reading and storytelling classroom",
      academic_year: "2026–2027",
      subject: "Reading & Literature",
      max_students: 30
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cls, e) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingClassroom(cls);
    setFormData({
      name: cls.name || "",
      grade_level: cls.grade_level || "Grade 3",
      section: cls.section || "A",
      school_name: cls.school_name || "Oakridge Elementary",
      description: cls.description || "",
      academic_year: cls.academic_year || "2026–2027",
      subject: cls.subject || "Reading & Literature",
      max_students: cls.max_students || 30
    });
    setFormError("");
    setActiveMenuId(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Classroom name is required.");
      return;
    }
    if (!formData.grade_level) {
      setFormError("Grade is required.");
      return;
    }
    if (!formData.section.trim()) {
      setFormError("Section is required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      if (editingClassroom) {
        await teacherAPI.updateClassroom(editingClassroom.id, formData);
        setSuccessToast(`Classroom '${formData.name}' updated successfully.`);
      } else {
        await teacherAPI.createClassroom(formData);
        setSuccessToast(`Classroom '${formData.name}' created successfully!`);
      }

      setIsModalOpen(false);
      loadClassroomData();
      setTimeout(() => setSuccessToast(""), 4000);
    } catch (err) {
      console.error("Form submission error:", err);
      setFormError(err.response?.data?.message || "Failed to save classroom. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveToggle = async (cls, e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveMenuId(null);
    try {
      if (cls.status === "archived") {
        await teacherAPI.restoreClassroom(cls.id);
        setSuccessToast(`Classroom '${cls.name}' restored.`);
      } else {
        await teacherAPI.archiveClassroom(cls.id);
        setSuccessToast(`Classroom '${cls.name}' archived.`);
      }
      loadClassroomData();
      setTimeout(() => setSuccessToast(""), 4000);
    } catch (err) {
      console.error("Error toggling archive:", err);
    }
  };

  // Client-side filtering by search & performance
  const filteredClassrooms = classrooms.filter((cls) => {
    const matchesSearch =
      !searchTerm ||
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.grade_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesPerformance = true;
    if (selectedPerformance === "on_track") {
      matchesPerformance = (cls.overall_progress || 0) >= 75;
    } else if (selectedPerformance === "needs_attention") {
      matchesPerformance = (cls.students_needing_attention_count || 0) > 0;
    } else if (selectedPerformance === "behind") {
      matchesPerformance = (cls.overall_progress || 0) < 60;
    }

    return matchesSearch && matchesPerformance;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-bounce">
          <FaCheckCircle className="text-xl" />
          <span className="font-medium text-sm">{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl">
              <FaChalkboardTeacher />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Classrooms</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your classes, students, lessons, and learning progress.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="sn-btn-primary"
        >
          <FaPlus />
          <span>New Classroom</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xl font-bold">
            <FaChalkboardTeacher />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {stats.total_classrooms || classrooms.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Classrooms</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-xl font-bold">
            <FaUsers />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {stats.total_students || 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Students</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <FaGraduationCap />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {stats.active_students || 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Students</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FaChartLine />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {stats.avg_progress || 78}%
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg Class Progress</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by class name, grade, section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sn-search-input"
          />
        </form>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <FaFilter className="text-purple-600" /> Filters:
          </div>

          {/* Grade Dropdown */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="sn-filter-select"
          >
            <option value="all">All Grades</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="sn-filter-select"
          >
            <option value="active">Active Classes</option>
            <option value="archived">Archived Classes</option>
            <option value="all">All Statuses</option>
          </select>

          {/* Performance Dropdown */}
          <select
            value={selectedPerformance}
            onChange={(e) => setSelectedPerformance(e.target.value)}
            className="sn-filter-select"
          >
            <option value="all">All Performance</option>
            <option value="on_track">On Track (75%+)</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="behind">Behind (&lt;60%)</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              </div>
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              <div className="h-10 w-full bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-8 rounded-2xl border border-red-200 dark:border-red-900/50 text-center space-y-4">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-500" />
          <h3 className="text-lg font-bold">Couldn't Load Classrooms</h3>
          <p className="text-sm text-red-500/80 max-w-md mx-auto">{error}</p>
          <button
            onClick={loadClassroomData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium text-sm transition shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : filteredClassrooms.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-6">
          <div className="h-20 w-20 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-4xl mx-auto mb-4">
            <FaChalkboardTeacher />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            {searchTerm || selectedGrade !== "all" ? "No Matching Classrooms Found" : "No Classrooms Yet"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-6 max-w-md mx-auto">
            {searchTerm || selectedGrade !== "all"
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : "Create your first classroom to start managing your students, lessons, and learning progress."}
          </p>
          <button
            onClick={openCreateModal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition text-sm shadow-md inline-flex items-center gap-2"
          >
            <FaPlus />
            <span>Create Classroom</span>
          </button>
        </div>
      ) : (
        /* Classroom Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClassrooms.map((cls) => {
            const overallProg = cls.overall_progress || 76;
            const needingAttention = cls.students_needing_attention_count || 0;

            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between relative group"
              >
                <div>
                  {/* Card Top Meta */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-inner">
                      📚
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                        {cls.academic_year || "2026–2027"}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setActiveMenuId(activeMenuId === cls.id ? null : cls.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                          <FaEllipsisV />
                        </button>
                        {activeMenuId === cls.id && (
                          <div className="absolute right-0 top-8 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-20">
                            <button
                              onClick={(e) => openEditModal(cls, e)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                              <FaEdit className="text-purple-500" /> Edit Classroom
                            </button>
                            <button
                              onClick={(e) => handleArchiveToggle(cls, e)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                              {cls.status === "archived" ? (
                                <>
                                  <FaUndo className="text-emerald-500" /> Restore Classroom
                                </>
                              ) : (
                                <>
                                  <FaArchive className="text-amber-500" /> Archive Classroom
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Details */}
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-purple-600 transition-colors">
                    {cls.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                    <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                      {cls.grade_level} {cls.section ? `— Sec ${cls.section}` : ""}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FaSchool className="text-slate-400" /> {cls.school_name || "Oakridge Elementary"}
                    </span>
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase">Reading Avg</div>
                      <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {cls.reading_avg || 76}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase">Quiz Avg</div>
                      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {cls.quiz_avg || 81}%
                      </div>
                    </div>
                  </div>

                  {/* Classroom Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>Classroom Progress</span>
                      <span>{overallProg}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${overallProg}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Attention Alert Tag */}
                  {needingAttention > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/50 mb-4">
                      <FaExclamationTriangle className="text-amber-500 shrink-0" />
                      <span>
                        {needingAttention} {needingAttention === 1 ? "student needs" : "students need"} attention
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <FaUsers className="text-purple-500" />
                    <span>{cls.enrolled_count || 0} Students</span>
                  </div>

                  <Link
                    to={`/teacher/classrooms/${cls.id}`}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-purple-600 hover:text-white dark:bg-slate-700 dark:hover:bg-purple-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    View Classroom &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Classroom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <FaTimes />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
              {editingClassroom ? "Edit Classroom" : "Create New Classroom"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Organize your students, set grade levels, and track learning progress.
            </p>

            {formError && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl border border-red-200 dark:border-red-900/50 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Classroom Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade 3 — Section A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Grade Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A, B, Owls"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    School Name
                  </label>
                  <input
                    type="text"
                    placeholder="Oakridge Elementary"
                    value={formData.school_name}
                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    placeholder="2026–2027"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Primary reading and storytelling classroom..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="sn-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="sn-btn-primary"
                >
                  {submitting ? "Saving..." : editingClassroom ? "Update Classroom" : "Create Classroom"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherClassrooms;
