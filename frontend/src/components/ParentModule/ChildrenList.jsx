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
    if (deleting) return;

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
        child_name: formData.name.trim(),
        dob: formData.dob,
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
    <div className="min-h-screen bg-slate-50">
      <ParentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <ParentNavbar
          title="My Children"
          subtitle="Manage child profiles and monitor learning progress"
          parentName={
            dashboard.parent_name ||
            dashboard.parent?.name ||
            "Parent"
          }
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-6 flex items-start justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-4"
                aria-label="Dismiss error"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Children"
              value={normalizedChildren.length}
              icon={FaChild}
              color="indigo"
              description="Active profiles"
            />

            <StatsCard
              title="Stories Read"
              value={totalStoriesRead}
              icon={FaBookOpen}
              color="blue"
              description="All children"
            />

            <StatsCard
              title="Average Quiz Score"
              value={`${averageQuizScore}%`}
              icon={FaUserGraduate}
              color="emerald"
              description="Overall average"
            />

            <StatsCard
              title="Active Readers"
              value={
                dashboard.active_readers ??
                normalizedChildren.filter(
                  (child) =>
                    Number(child.completion_percentage || 0) > 0
                ).length
              }
              icon={FaBookOpen}
              color="violet"
              description="Currently learning"
            />
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Child Profiles
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add, edit and manage your children's learning
                  information.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                <FaPlus />
                Add Child
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                <FaSearch className="text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, interest or animal..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <select
                value={levelFilter}
                onChange={(event) => {
                  setLevelFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option value="all">All reading levels</option>

                {readingLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="mt-6">
            {loading ? (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="text-center">
                  <FaSpinner className="mx-auto animate-spin text-4xl text-indigo-600" />

                  <p className="mt-4 font-medium text-slate-600">
                    Loading child profiles...
                  </p>
                </div>
              </div>
            ) : paginatedChildren.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl text-indigo-600">
                  <FaChild />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  No child profiles found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Create a child profile to start tracking stories,
                  quizzes, achievements and reading progress.
                </p>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  <FaPlus />
                  Add First Child
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
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
                  <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
                    <p className="text-sm text-slate-500">
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
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <span className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((previous) => previous + 1)
                        }
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingChild ? "Edit Child" : "Add Child"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the child's profile and learning details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Reading Level
                  </label>

                  <select
                    name="reading_level"
                    value={formData.reading_level}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border px-4 py-3 outline-none ${
                      formErrors.reading_level
                        ? "border-red-400"
                        : "border-slate-300 focus:border-indigo-500"
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Avatar
                  </label>

                  <input
                    type="file"
                    name="avatar"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm ${
                      formErrors.avatar
                        ? "border-red-400"
                        : "border-slate-300"
                    }`}
                  />

                  {formErrors.avatar && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.avatar}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Interests
                  </label>

                  <textarea
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Example: Space, animals, magic and adventure"
                    className={`w-full resize-none rounded-xl border px-4 py-3 outline-none ${
                      formErrors.interests
                        ? "border-red-400"
                        : "border-slate-300 focus:border-indigo-500"
                    }`}
                  />

                  {formErrors.interests && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.interests}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Learning Goals
                  </label>

                  <textarea
                    name="learning_goals"
                    value={formData.learning_goals}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe reading, language or learning goals"
                    className={`w-full resize-none rounded-xl border px-4 py-3 outline-none ${
                      formErrors.learning_goals
                        ? "border-red-400"
                        : "border-slate-300 focus:border-indigo-500"
                    }`}
                  />

                  {formErrors.learning_goals && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.learning_goals}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <FaSpinner className="animate-spin" />}

                  {saving
                    ? "Saving..."
                    : editingChild
                    ? "Update Child"
                    : "Create Child"}
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
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-3 outline-none ${
          error
            ? "border-red-400"
            : "border-slate-300 focus:border-indigo-500"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default ChildrenList;
