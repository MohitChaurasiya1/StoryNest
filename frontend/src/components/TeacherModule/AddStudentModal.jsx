import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaSearch,
  FaUserPlus,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGraduationCap,
  FaBookReader,
  FaUsers,
  FaUserCircle,
  FaPlusCircle,
  FaArrowRight,
  FaArrowLeft,
  FaRedo
} from "react-icons/fa";
import { teacherAPI } from "../../services/api";
import "./TeacherModule.css";

export default function AddStudentModal({
  classroomId: initialClassroomId = null,
  classrooms = [],
  onClose,
  onStudentsAdded
}) {
  const navigate = useNavigate();

  // Mode: 'existing' vs 'new'
  const [enrollMode, setEnrollMode] = useState("existing");

  const [selectedClassroomId, setSelectedClassroomId] = useState(
    initialClassroomId || (classrooms.length > 0 ? classrooms[0].id : "")
  );

  // Existing Students State
  const [availableStudents, setAvailableStudents] = useState([]);
  const [capacityInfo, setCapacityInfo] = useState({
    max_students: 30,
    current_enrolled_count: 0,
    available_capacity: 30
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // New Student Form State
  const [createStep, setCreateStep] = useState(1); // 1: Form, 2: Review, 3: Success
  const [newStudentForm, setNewStudentForm] = useState({
    firstName: "",
    lastName: "",
    age: 8,
    gradeLevel: "Grade 3",
    readingLevel: "Beginner",
    gender: "boy",
    avatar: "👦",
    interests: "Reading, Science, Art",
    learningGoals: "Improve Hindi-English reading comprehension and vocabulary.",
    parentEmail: ""
  });

  const [createdStudentResult, setCreatedStudentResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const avatarOptions = ["👦", "👧", "🧒", "🦁", "🦊", "🚀", "🐼", "🌟", "📚", "🎨"];

  useEffect(() => {
    if (selectedClassroomId) {
      loadAvailableStudents();
    }
  }, [selectedClassroomId, searchTerm]);

  const loadAvailableStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (searchTerm) params.search = searchTerm;

      const res = await teacherAPI.getAvailableStudentsForClassroom(selectedClassroomId, params);
      setAvailableStudents(res?.students || []);
      setCapacityInfo({
        max_students: res?.max_students || 30,
        current_enrolled_count: res?.current_enrolled_count || 0,
        available_capacity: res?.available_capacity ?? 30
      });
    } catch (err) {
      console.error("Error loading eligible students:", err);
      setAvailableStudents([
        {
          id: 101,
          name: "Aisha Patel",
          avatar: "AP",
          grade_level: "Grade 3",
          reading_level: "Beginner",
          current_classrooms: [],
          is_already_enrolled: false
        },
        {
          id: 102,
          name: "Emma Chen",
          avatar: "EC",
          grade_level: "Grade 3",
          reading_level: "Intermediate",
          current_classrooms: ["Grade 3B"],
          is_already_enrolled: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (studentId, isAlreadyEnrolled) => {
    if (isAlreadyEnrolled) return;
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      if (selectedStudentIds.length >= capacityInfo.available_capacity) {
        setError(`Cannot select more than ${capacityInfo.available_capacity} available spot(s).`);
        return;
      }
      setError("");
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleRemoveChip = (studentId) => {
    setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
  };

  // Submit Existing Students
  const handleSubmitExisting = async (e) => {
    e.preventDefault();
    if (!selectedClassroomId) {
      setError("Please select a classroom.");
      return;
    }
    if (selectedStudentIds.length === 0) {
      setError("Please select at least one student to enroll.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await teacherAPI.addStudentsToClassroomBulk(selectedClassroomId, selectedStudentIds);
      setSuccessMessage(res?.message || `${selectedStudentIds.length} student(s) added successfully!`);

      setTimeout(() => {
        if (onStudentsAdded) onStudentsAdded(res);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error adding students:", err);
      setError(err.response?.data?.error || "Failed to add students. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Create New Student
  const handleCreateStudentSubmit = async () => {
    if (!newStudentForm.firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!selectedClassroomId) {
      setError("Please select a target classroom.");
      return;
    }

    const fullName = `${newStudentForm.firstName.trim()} ${newStudentForm.lastName.trim()}`.strip() || newStudentForm.firstName.trim();

    try {
      setSubmitting(true);
      setError("");

      const res = await teacherAPI.createAndEnrollStudent(selectedClassroomId, {
        name: fullName,
        age: parseInt(newStudentForm.age, 10) || 8,
        grade_level: newStudentForm.gradeLevel,
        reading_level: newStudentForm.readingLevel,
        gender: newStudentForm.gender,
        avatar: newStudentForm.avatar,
        interests: newStudentForm.interests,
        learning_goals: newStudentForm.learningGoals,
        parent_email: newStudentForm.parentEmail
      });

      const stdRes = res?.student || res;
      setCreatedStudentResult(stdRes);
      setCreateStep(3); // Go to Success Screen
      if (onStudentsAdded) onStudentsAdded(res);
    } catch (err) {
      console.error("Error creating student:", err);
      setError(err.response?.data?.error || "Failed to create student. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetCreateFormForAnother = () => {
    setNewStudentForm({
      firstName: "",
      lastName: "",
      age: 8,
      gradeLevel: "Grade 3",
      readingLevel: "Beginner",
      gender: "boy",
      avatar: "👦",
      interests: "Reading, Science, Art",
      learningGoals: "Improve Hindi-English reading comprehension and vocabulary.",
      parentEmail: ""
    });
    setCreatedStudentResult(null);
    setError("");
    setCreateStep(1);
  };

  const selectedStudentObjects = availableStudents.filter((st) => selectedStudentIds.includes(st.id));
  const selectedClassroomObj = classrooms.find((c) => String(c.id) === String(selectedClassroomId));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center text-lg font-bold">
              <FaUserPlus />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Classroom Student Enrollment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Add an existing StoryNest student or create a new student profile.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => setEnrollMode("existing")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              enrollMode === "existing" ? "sn-tab-active" : "sn-tab-inactive"
            }`}
          >
            <FaUserCircle /> 👤 Add Existing Student
          </button>
          <button
            type="button"
            onClick={() => setEnrollMode("new")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              enrollMode === "new" ? "sn-tab-active" : "sn-tab-inactive"
            }`}
          >
            <FaPlusCircle /> ＋ Create New Student
          </button>
        </div>

        {/* ========================================================= */}
        {/* MODE A: ADD EXISTING STUDENT */}
        {/* ========================================================= */}
        {enrollMode === "existing" && (
          <form onSubmit={handleSubmitExisting} className="p-6 space-y-4 text-xs">
            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 flex items-center gap-2 font-bold">
                <FaCheckCircle className="text-emerald-500 text-lg" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 border border-red-200 flex items-center gap-2 font-semibold">
                <FaExclamationTriangle className="text-red-500 text-lg shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!initialClassroomId && classrooms.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Target Classroom *
                </label>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => {
                    setSelectedClassroomId(e.target.value);
                    setSelectedStudentIds([]);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 font-semibold"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.enrolled_count || 0}/{c.max_students || 30} students)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-between items-center p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 font-semibold">
              <span className="flex items-center gap-1.5">
                <FaUsers className="text-purple-600" /> Target: <strong>{selectedClassroomObj?.name || "Classroom"}</strong>
              </span>
              <span className="text-[11px] bg-purple-200 text-purple-900 px-2.5 py-0.5 rounded-full font-bold">
                {capacityInfo.current_enrolled_count} / {capacityInfo.max_students} Students Enrolled
              </span>
            </div>

            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div className="border rounded-2xl max-h-56 overflow-y-auto divide-y bg-white dark:bg-slate-900/40">
              {loading ? (
                <div className="p-6 text-center text-slate-400 font-semibold">Loading eligible students...</div>
              ) : availableStudents.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-semibold">No eligible students found matching query.</div>
              ) : (
                availableStudents.map((st) => {
                  const isSelected = selectedStudentIds.includes(st.id);
                  const isEnrolled = st.is_already_enrolled;
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleToggleSelect(st.id, isEnrolled)}
                      className={`p-3 flex items-center justify-between transition cursor-pointer ${
                        isEnrolled ? "opacity-60 bg-slate-50 cursor-not-allowed" : isSelected ? "bg-purple-50/80" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isSelected || isEnrolled} disabled={isEnrolled} onChange={() => {}} className="accent-purple-600 h-4 w-4" />
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm">
                          {st.avatar || st.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white text-xs">{st.name}</div>
                          <div className="text-[10px] text-slate-500">{st.grade_level || "Grade 3"} • {st.reading_level || "Beginner"}</div>
                        </div>
                      </div>
                      <div>
                        {isEnrolled ? (
                          <span className="sn-badge-already">Already Enrolled</span>
                        ) : st.current_classrooms && st.current_classrooms.length > 0 ? (
                          <span className="sn-badge-enrolled">Enrolled in {st.current_classrooms[0]}</span>
                        ) : (
                          <span className="sn-badge-available">Available</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {selectedStudentObjects.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Selected ({selectedStudentObjects.length} student{selectedStudentObjects.length > 1 ? "s" : ""}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudentObjects.map((st) => (
                    <span key={st.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
                      <span>✓ {st.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveChip(st.id); }} className="text-purple-400 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t flex justify-end gap-3">
              <button type="button" onClick={onClose} className="sn-btn-secondary">Cancel</button>
              <button
                type="submit"
                disabled={submitting || selectedStudentIds.length === 0}
                className="sn-btn-primary"
              >
                {submitting ? "Adding Students..." : `Add ${selectedStudentIds.length} Student${selectedStudentIds.length > 1 ? "s" : ""}`}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* MODE B: CREATE NEW STUDENT */}
        {/* ========================================================= */}
        {enrollMode === "new" && (
          <div className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 border border-red-200 flex items-center gap-2 font-semibold">
                <FaExclamationTriangle className="text-red-500 text-lg shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Classroom Bar */}
            {!initialClassroomId && classrooms.length > 0 && createStep < 3 && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Classroom *
                </label>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 font-semibold"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.enrolled_count || 0}/{c.max_students || 30} students)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* STEP 1: Student Details Form */}
            {createStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">First Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav"
                      value={newStudentForm.firstName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={newStudentForm.lastName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Age</label>
                    <input
                      type="number"
                      min="3"
                      max="18"
                      value={newStudentForm.age}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, age: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Grade Level</label>
                    <select
                      value={newStudentForm.gradeLevel}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, gradeLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 font-semibold"
                    >
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Reading Level</label>
                    <select
                      value={newStudentForm.readingLevel}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, readingLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 font-semibold text-purple-600"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Avatar Choice */}
                <div>
                  <label className="block font-semibold mb-1">Select Avatar Emoji</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {avatarOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewStudentForm({ ...newStudentForm, avatar: emoji })}
                        className={`h-9 w-9 rounded-xl text-xl flex items-center justify-center border transition ${
                          newStudentForm.avatar === emoji ? "border-purple-600 bg-purple-100 scale-110 shadow-sm" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Parent Email */}
                <div>
                  <label className="block font-semibold mb-1">Parent Email (Optional Link)</label>
                  <input
                    type="email"
                    placeholder="e.g. parent@example.com (or leave empty)"
                    value={newStudentForm.parentEmail}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parentEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newStudentForm.firstName.trim()) {
                        setError("First Name is required.");
                        return;
                      }
                      setError("");
                      setCreateStep(2);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition inline-flex items-center gap-1.5"
                  >
                    Review Details <FaArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Review Screen */}
            {createStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Review New Student Creation</h4>

                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white text-2xl flex items-center justify-center shadow-sm">
                      {newStudentForm.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white text-base">
                        {newStudentForm.firstName} {newStudentForm.lastName}
                      </div>
                      <div className="text-xs text-purple-600 font-semibold">
                        {newStudentForm.gradeLevel} • {newStudentForm.readingLevel} Reader
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-purple-200/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Age</span>
                      <strong className="text-slate-800 dark:text-white">{newStudentForm.age} years old</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Enrolling Into</span>
                      <strong className="text-purple-700">{selectedClassroomObj?.name || "Target Classroom"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Parent Account</span>
                      <strong className="text-slate-700">{newStudentForm.parentEmail || "Not linked (Can be linked later)"}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCreateStep(1)}
                    className="px-4 py-2 text-slate-600 font-bold inline-flex items-center gap-1"
                  >
                    <FaArrowLeft /> Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateStudentSubmit}
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? "Creating & Enrolling..." : "Create & Enroll Student"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Success Screen */}
            {createStep === 3 && (
              <div className="space-y-6 text-center py-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-md">
                  <FaCheckCircle />
                </div>

                <div>
                  <h4 className="text-lg font-extrabold text-slate-800 dark:text-white">Student Created & Enrolled!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    <strong className="text-slate-800 dark:text-white">{createdStudentResult?.name || "Student"}</strong> has been created and enrolled into{" "}
                    <strong className="text-purple-600">{createdStudentResult?.classroom_name || "the classroom"}</strong>.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (createdStudentResult?.id) {
                        navigate(`/teacher/students/${createdStudentResult.id}`);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition"
                  >
                    View Student Profile &rarr;
                  </button>

                  <button
                    type="button"
                    onClick={resetCreateFormForAnother}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-md transition inline-flex items-center justify-center gap-1.5"
                  >
                    <FaRedo /> Create Another Student
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
