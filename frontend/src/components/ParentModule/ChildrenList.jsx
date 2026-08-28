import { useEffect, useMemo, useState } from "react";
import {
  FaBookOpen,
  FaChild,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaUserGraduate,
} from "react-icons/fa";

import ParentSidebar from "./ParentSidebar";
import ParentNavbar from "./ParentNavbar";
import StatsCard from "./StatsCard";
import ChildCard from "./ChildCard";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

import {
  getApiErrorMessage,
  parentChildrenApi,
  parentDashboardApi,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const initialFormData = {
  name: "",
  dob: "",
  interests: "",
  favourite_colour: "",
  favourite_animal: "",
  reading_level: "Beginner",
  learning_goals: "",
  avatar: null,
};

const readingLevels = [
  "Beginner",
  "Early Reader",
  "Intermediate",
  "Advanced",
];

function ChildrenList() {
  const { refreshChildren } = useAuth();
  const [children, setChildren] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingChild, setEditingChild] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [childrenResponse, dashboardResponse] = await Promise.allSettled([
        parentChildrenApi.getChildren(),
        parentDashboardApi.getDashboard(),
      ]);

      if (childrenResponse.status === "fulfilled") {
        const childrenData = childrenResponse.value;

        setChildren(
          Array.isArray(childrenData)
            ? childrenData
            : childrenData?.results || []
        );
      } else {
        throw childrenResponse.reason;
      }

      if (dashboardResponse.status === "fulfilled") {
        setDashboard(dashboardResponse.value || {});
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to load children. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;

    const birthDate = new Date(dob);
    const today = new Date();

    if (Number.isNaN(birthDate.getTime())) return null;

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    return age;
  };

  const normalizedChildren = useMemo(() => {
    return children.map((child) => ({
      ...child,
      name:
        child.name ||
        child.child_name ||
        child.full_name ||
        child.user?.first_name ||
        "Child",
      age: child.age ?? calculateAge(child.dob),
      stories_read:
        child.stories_read ??
        child.completed_stories ??
        child.total_stories_read ??
        0,
      quiz_average:
        child.quiz_average ??
        child.average_quiz_score ??
        child.quiz_score ??
        0,
      completion_percentage:
        child.completion_percentage ??
        child.overall_progress ??
        child.progress_percentage ??
        0,
    }));
  }, [children]);

  const filteredChildren = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return normalizedChildren.filter((child) => {
      const matchesSearch =
        !query ||
        child.name?.toLowerCase().includes(query) ||
        child.favourite_animal?.toLowerCase().includes(query) ||
        child.interests?.toLowerCase().includes(query);

      const matchesLevel =
        levelFilter === "all" ||
        child.reading_level?.toLowerCase() === levelFilter.toLowerCase();

      return matchesSearch && matchesLevel;
    });
  }, [normalizedChildren, searchTerm, levelFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredChildren.length / itemsPerPage)
  );

  const paginatedChildren = filteredChildren.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const totalStoriesRead =
    dashboard.total_stories_read ??
    dashboard.stories_read ??
    normalizedChildren.reduce(
      (total, child) => total + Number(child.stories_read || 0),
      0
    );

  const averageQuizScore = normalizedChildren.length
    ? Math.round(
        normalizedChildren.reduce(
          (total, child) => total + Number(child.quiz_average || 0),
          0
        ) / normalizedChildren.length
      )
    : 0;

  const openAddModal = () => {
    setEditingChild(null);
    setFormData(initialFormData);
    setFormErrors({});
    setFormModalOpen(true);
  };

  const openEditModal = (child) => {
    setEditingChild(child);

    setFormData({
      name: child.name || child.child_name || "",
      dob: child.dob || "",
      interests: Array.isArray(child.interests)
        ? child.interests.join(", ")
        : child.interests || "",
      favourite_colour: child.favourite_colour || "",
      favourite_animal: child.favourite_animal || "",
      reading_level: child.reading_level || "Beginner",
      learning_goals: child.learning_goals || "",
      avatar: null,
    });

    setFormErrors({});
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;

    setFormModalOpen(false);
    setEditingChild(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const openDeleteModal = (child) => {
    setSelectedChild(child);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedChild(null);
    setDeleteModalOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files ? files[0] || null : value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Child name is required.";
    }

    if (!formData.dob) {
      validationErrors.dob = "Date of birth is required.";
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();

      if (selectedDate > today) {
        validationErrors.dob = "Date of birth cannot be in the future.";
      }
    }

    if (!formData.reading_level) {
      validationErrors.reading_level = "Reading level is required.";
    }

    if (
      formData.avatar &&
      !["image/jpeg", "image/png", "image/webp"].includes(formData.avatar.type)
    ) {
      validationErrors.avatar =
        "Avatar must be a JPG, PNG or WebP image.";
    }

    if (formData.avatar && formData.avatar.size > 5 * 1024 * 1024) {
      validationErrors.avatar = "Avatar must be smaller than 5 MB.";
    }

    setFormErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        name: formData.name.trim(),
        dob: formData.dob || null,
        interests: formData.interests.trim(),
        favourite_colour: formData.favourite_colour.trim(),
        favourite_animal: formData.favourite_animal.trim(),
        reading_level: formData.reading_level,
        learning_goals: formData.learning_goals.trim(),
      };

      if (formData.avatar) {
        payload.avatar = formData.avatar;
      }

      let response;

      if (editingChild) {
        response = await parentChildrenApi.updateChild(
          editingChild.id,
          payload
        );

        setChildren((previous) =>
          previous.map((child) =>
            child.id === editingChild.id
              ? {
                  ...child,
                  ...response,
                }
              : child
          )
        );

        setSuccessMessage("Child profile updated successfully.");
      } else {
        response = await parentChildrenApi.createChild(payload);

        setChildren((previous) => [response, ...previous]);
        setSuccessMessage("Child profile created successfully.");
      }

      await refreshChildren();
      closeFormModal();

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3500);
    } catch (requestError) {
      const responseData = requestError.response?.data;

      if (responseData && typeof responseData === "object") {
        const backendErrors = {};

        Object.entries(responseData).forEach(([field, value]) => {
          backendErrors[field] = Array.isArray(value)
            ? value[0]
            : String(value);
        });

        setFormErrors(backendErrors);
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to save child profile."
          )
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedChild?.id) return;

    try {
      setDeleting(true);
      setError("");

      await parentChildrenApi.deleteChild(selectedChild.id);

      setChildren((previous) =>
        previous.filter((child) => child.id !== selectedChild.id)
      );

      await refreshChildren();

      setDeleteModalOpen(false);
      setSelectedChild(null);
      setSuccessMessage("Child profile deleted successfully.");

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3500);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to delete child profile."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-purple-50/20 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Floating Background Blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30 dark:opacity-10">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-rose-400 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-amber-300 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-purple-400 blur-3xl" />
      </div>

      <ParentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72 relative z-10">
        <ParentNavbar
          title="All Children"
          subtitle="Manage your little adventurers and track their learning journeys"
          parentName={
            dashboard.parent_name ||
            dashboard.parent?.name ||
            "Parent"
          }
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
          {error && (
            <div className="flex items-start justify-between rounded-3xl border border-red-200 bg-red-50/90 dark:bg-red-950/50 p-5 text-red-700 dark:text-red-300 backdrop-blur-md shadow-lg shadow-red-500/5">
              <p className="font-semibold">{error}</p>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-4 rounded-xl p-1 hover:bg-red-100 dark:hover:bg-red-900"
                aria-label="Dismiss error"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/50 p-5 font-bold text-emerald-700 dark:text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-500/5">
              <span>✨</span>
              {successMessage}
            </div>
          )}

          {/* Hero Banner Section */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-6 sm:p-8 text-white shadow-2xl shadow-rose-500/20">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-10 h-32 w-32 rounded-full bg-amber-300/20 blur-lg pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md mb-3">
                  <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
                  AI-Powered Learning Platform 🚀
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                  Your Little <span>Story Adventurers</span>
                </h1>

                <p className="mt-2 text-sm sm:text-base leading-relaxed text-rose-100 font-medium">
                  Track reading stats, quiz performance, unlocked achievement badges, and certificates for all your children in one place.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-6 py-3.5 font-extrabold text-rose-600 shadow-xl transition-all duration-300 hover:bg-rose-50 hover:scale-105 active:scale-95"
              >
                <FaPlus className="text-sm" />
                Add New Child
              </button>
            </div>
          </section>

          {/* Dashboard Stats Row */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-rose-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-xl shadow-rose-500/5 backdrop-blur-xl flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 text-2xl font-black shadow-sm">
                👶
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Children</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{normalizedChildren.length}</h3>
                <p className="text-[11px] font-semibold text-rose-500">Active Profiles</p>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-xl shadow-sky-500/5 backdrop-blur-xl flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 text-2xl font-black shadow-sm">
                📚
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Stories Read</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalStoriesRead}</h3>
                <p className="text-[11px] font-semibold text-sky-500">Across All Children</p>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-xl shadow-emerald-500/5 backdrop-blur-xl flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 text-2xl font-black shadow-sm">
                🎯
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Quiz Average</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{averageQuizScore}%</h3>
                <p className="text-[11px] font-semibold text-emerald-500">Comprehension</p>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-xl shadow-amber-500/5 backdrop-blur-xl flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 text-2xl font-black shadow-sm">
                🌟
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Readers</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {dashboard.active_readers ?? normalizedChildren.filter((child) => Number(child.completion_percentage || 0) > 0).length}
                </h3>
                <p className="text-[11px] font-semibold text-amber-500">Currently Learning</p>
              </div>
            </div>
          </section>

          {/* Search & Filter Header */}
          <section className="rounded-3xl border border-rose-100/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-xl shadow-rose-500/5 backdrop-blur-xl space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-black dark:text-white flex items-center gap-2">
                  Child Profiles <span>🎈</span>
                </h2>

                <p className="mt-1 text-sm font-semibold text-black/80 dark:text-white">
                  Select a child to view detailed stories, quiz reports, achievements, and reading progress.
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-rose-200/70 dark:border-slate-700 bg-rose-50/40 dark:bg-slate-800/50 px-4 py-2.5 shadow-inner min-w-[280px]">
                  <FaSearch className="text-rose-400" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by child name or interests..."
                    className="w-full bg-transparent text-sm font-bold text-black dark:text-white placeholder:text-black/60 dark:placeholder:text-white/60 outline-none"
                  />
                </div>

                <select
                  value={levelFilter}
                  onChange={(event) => {
                    setLevelFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-2xl border border-rose-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-black dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">All Reading Levels</option>
                  {readingLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Children Grid Section */}
          <section>
            {loading ? (
              <div className="flex min-h-80 items-center justify-center rounded-3xl border border-rose-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-xl">
                <div className="text-center">
                  <FaSpinner className="mx-auto animate-spin text-4xl text-rose-500" />
                  <p className="mt-4 font-bold text-black dark:text-white">
                    Loading child profiles...
                  </p>
                </div>
              </div>
            ) : paginatedChildren.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-rose-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-12 text-center backdrop-blur-xl">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 dark:bg-rose-950 text-4xl shadow-md">
                  🦁
                </div>

                <h3 className="mt-5 text-2xl font-black text-black dark:text-white">
                  No child profiles found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-black/80 dark:text-white">
                  Create a child profile to start generating custom AI stories, tracking quiz history, and issuing certificates.
                </p>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-3 font-extrabold text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-105"
                >
                  <FaPlus />
                  Add First Child
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedChildren.map((child) => (
                    <ChildCard
                      key={child.id}
                      child={child}
                      onEdit={openEditModal}
                      onDelete={openDeleteModal}
                    />
                  ))}
                </div>


                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:flex-row">
                    <p className="text-sm font-semibold text-black dark:text-white">
                      Showing{" "}
                      {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredChildren.length
                      )}{" "}
                      of {filteredChildren.length} children
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((previous) => previous - 1)
                        }
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-black dark:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <span className="rounded-lg bg-rose-50 dark:bg-rose-950/60 px-4 py-2 text-sm font-bold text-rose-600 dark:text-rose-300">
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((previous) => previous + 1)
                        }
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-black dark:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      {formModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(15,23,42,0.7)' }}>
          <div
            className="flex flex-col w-full max-w-2xl rounded-3xl shadow-2xl"
            style={{
              maxHeight: '90vh',
              backgroundColor: 'var(--modal-bg, #ffffff)',
              border: '1px solid var(--modal-border, #e2e8f0)',
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-5 shrink-0"
              style={{
                borderBottom: '1px solid var(--modal-border, #e2e8f0)',
                backgroundColor: 'var(--modal-bg, #ffffff)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--modal-title, #0f172a)', margin: 0 }}>
                  {editingChild ? "Edit Child" : "Add Child"}
                </h2>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--modal-text, #64748b)', fontWeight: 600 }}>
                  Enter the child's profile and learning details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '2.5rem', height: '2.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--modal-text, #64748b)',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    label="Child Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={formErrors.name || formErrors.child_name}
                    placeholder="Enter child name"
                    required
                  />

                  <FormField
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    error={formErrors.dob}
                    required
                  />

                  <div>
                    <label className="mb-2 block text-sm font-bold text-black dark:text-white">
                      Reading Level
                    </label>

                    <select
                      name="reading_level"
                      value={formData.reading_level}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border px-4 py-3 outline-none bg-white dark:bg-slate-800 text-black dark:text-white ${
                        formErrors.reading_level
                          ? "border-red-400"
                          : "border-slate-300 dark:border-slate-700 focus:border-rose-500"
                      }`}
                    >
                      {readingLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>

                    {formErrors.reading_level && (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors.reading_level}
                      </p>
                    )}
                  </div>

                  <FormField
                    label="Favourite Colour"
                    name="favourite_colour"
                    value={formData.favourite_colour}
                    onChange={handleInputChange}
                    error={formErrors.favourite_colour}
                    placeholder="Example: Blue"
                  />

                  <FormField
                    label="Favourite Animal"
                    name="favourite_animal"
                    value={formData.favourite_animal}
                    onChange={handleInputChange}
                    error={formErrors.favourite_animal}
                    placeholder="Example: Lion"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Avatar
                    </label>

                    <input
                      type="file"
                      name="avatar"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-sm text-black dark:text-white ${
                        formErrors.avatar
                          ? "border-red-400"
                          : "border-slate-300 dark:border-slate-700 focus:border-rose-500"
                      }`}
                    />

                    {formErrors.avatar && (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors.avatar}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Interests (comma separated)
                  </label>

                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="Example: Animals, Space, Magic"
                    className={`w-full rounded-xl border px-4 py-3 outline-none bg-white dark:bg-slate-800 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 ${
                      formErrors.interests
                        ? "border-red-400"
                        : "border-slate-300 dark:border-slate-700 focus:border-rose-500"
                    }`}
                  />

                  {formErrors.interests && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.interests}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Learning Goals
                  </label>

                  <textarea
                    name="learning_goals"
                    value={formData.learning_goals}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe reading, language or learning goals"
                    className={`w-full resize-none rounded-xl border px-4 py-3 outline-none bg-white dark:bg-slate-800 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 ${
                      formErrors.learning_goals
                        ? "border-red-400"
                        : "border-slate-300 dark:border-slate-700 focus:border-rose-500"
                    }`}
                  />

                  {formErrors.learning_goals && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.learning_goals}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Sticky Footer — always visible, immune to CSS overrides ── */}
              <div
                className="shrink-0 flex items-center justify-end gap-3 px-6 py-4"
                style={{
                  borderTop: '1px solid var(--modal-border, #e2e8f0)',
                  backgroundColor: 'var(--modal-footer, #f8fafc)',
                }}
              >
                {/* Cancel */}
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: '2px solid var(--modal-border, #cbd5e1)',
                    backgroundColor: 'var(--modal-bg, #ffffff)',
                    color: 'var(--modal-title, #334155)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1,
                    transition: 'background-color 0.15s',
                  }}
                >
                  Cancel
                </button>

                {/* Update / Create */}
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                    boxShadow: '0 4px 12px rgba(244,63,94,0.35)',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {saving && <FaSpinner className="animate-spin" style={{ fontSize: '0.875rem' }} />}
                  {saving ? "Saving..." : editingChild ? "Update Child" : "Create Child"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Delete Child Profile"
        message="Are you sure you want to delete this child profile and its connected parent data?"
        itemName={selectedChild?.name || selectedChild?.child_name}
        loading={deleting}
        onCancel={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-black dark:text-white">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-3 outline-none bg-white dark:bg-slate-800 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 ${
          error
            ? "border-red-400"
            : "border-slate-300 dark:border-slate-700 focus:border-rose-500"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default ChildrenList;
