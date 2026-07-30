import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBookOpen,
    FaFilter,
    FaHeart,
    FaSearch,
    FaSpinner,
    FaTimes,
} from "react-icons/fa";

import ParentSidebar from "../../components/ParentModule/ParentSidebar";
import ParentNavbar from "../../components/ParentModule/ParentNavbar";
import StatsCard from "../../components/ParentModule/StatsCard";
import StoryCard from "../../components/ParentModule/StoryCard";

import {
    getApiErrorMessage,
    parentLibraryApi,
} from "../../services/api";

const languageOptions = [
    { value: "all", label: "All Languages" },
    { value: "English", label: "English" },
    { value: "Hindi", label: "Hindi" },
    { value: "Bilingual", label: "Bilingual" },
];

const statusOptions = [
    { value: "all", label: "All Stories" },
    { value: "completed", label: "Completed" },
    { value: "in_progress", label: "In Progress" },
    { value: "not_started", label: "Not Started" },
    { value: "favourites", label: "Favourites" },
];

function ParentStoryLibrary() {
    const navigate = useNavigate();

    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favouriteLoadingId, setFavouriteLoadingId] = useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [languageFilter, setLanguageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const [currentPage, setCurrentPage] = useState(1);
    const storiesPerPage = 8;

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await parentLibraryApi.getLibrary();

            const storyData = Array.isArray(response)
                ? response
                : response?.results ||
                response?.stories ||
                response?.library ||
                [];

            setStories(storyData);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load the story library."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const normalizedStories = useMemo(() => {
        return stories.map((story) => {
            const completionPercentage = Number(
                story.completion_percentage ??
                story.progress_percentage ??
                story.progress?.completion_percentage ??
                0
            );

            const language =
                story.language ||
                story.story_language ||
                (story.title_hi ? "Bilingual" : "English");

            return {
                ...story,
                title_en:
                    story.title_en ||
                    story.title ||
                    story.name ||
                    "Untitled Story",
                child_name:
                    story.child_name ||
                    story.child?.name ||
                    story.child?.child_name ||
                    "All Children",
                cover_image:
                    story.cover_image ||
                    story.cover_url ||
                    story.thumbnail ||
                    story.pages?.[0]?.illustration_url ||
                    "",
                reading_time:
                    story.reading_time ||
                    story.estimated_reading_time ||
                    `${story.reading_duration || 10} min`,
                completion_percentage: Math.min(
                    100,
                    Math.max(0, completionPercentage)
                ),
                is_favourite:
                    story.is_favourite ??
                    story.favourite ??
                    story.is_bookmarked ??
                    false,
                language,
                created_at:
                    story.created_at ||
                    story.generated_at ||
                    story.updated_at ||
                    "",
            };
        });
    }, [stories]);

    const filteredStories = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        const result = normalizedStories.filter((story) => {
            const matchesSearch =
                !query ||
                story.title_en?.toLowerCase().includes(query) ||
                story.title_hi?.toLowerCase().includes(query) ||
                story.child_name?.toLowerCase().includes(query) ||
                story.moral?.toLowerCase().includes(query) ||
                story.setting?.toLowerCase().includes(query);

            const matchesLanguage =
                languageFilter === "all" ||
                story.language?.toLowerCase() === languageFilter.toLowerCase();

            let matchesStatus = true;

            if (statusFilter === "completed") {
                matchesStatus = story.completion_percentage >= 100;
            }

            if (statusFilter === "in_progress") {
                matchesStatus =
                    story.completion_percentage > 0 &&
                    story.completion_percentage < 100;
            }

            if (statusFilter === "not_started") {
                matchesStatus = story.completion_percentage === 0;
            }

            if (statusFilter === "favourites") {
                matchesStatus = Boolean(story.is_favourite);
            }

            return matchesSearch && matchesLanguage && matchesStatus;
        });

        return [...result].sort((first, second) => {
            if (sortBy === "oldest") {
                return (
                    new Date(first.created_at || 0) -
                    new Date(second.created_at || 0)
                );
            }

            if (sortBy === "title") {
                return first.title_en.localeCompare(second.title_en);
            }

            if (sortBy === "progress") {
                return (
                    second.completion_percentage -
                    first.completion_percentage
                );
            }

            return (
                new Date(second.created_at || 0) -
                new Date(first.created_at || 0)
            );
        });
    }, [
        normalizedStories,
        searchTerm,
        languageFilter,
        statusFilter,
        sortBy,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredStories.length / storiesPerPage)
    );

    const paginatedStories = filteredStories.slice(
        (currentPage - 1) * storiesPerPage,
        currentPage * storiesPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, languageFilter, statusFilter, sortBy]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const completedStories = normalizedStories.filter(
        (story) => story.completion_percentage >= 100
    ).length;

    const favouriteStories = normalizedStories.filter(
        (story) => story.is_favourite
    ).length;

    const inProgressStories = normalizedStories.filter(
        (story) =>
            story.completion_percentage > 0 &&
            story.completion_percentage < 100
    ).length;

    const handleFavourite = async (story) => {
        if (!story?.id || favouriteLoadingId) return;

        const previousFavouriteValue = story.is_favourite;
        const nextFavouriteValue = !previousFavouriteValue;

        try {
            setFavouriteLoadingId(story.id);
            setError("");

            setStories((previous) =>
                previous.map((item) =>
                    item.id === story.id
                        ? {
                            ...item,
                            is_favourite: nextFavouriteValue,
                            favourite: nextFavouriteValue,
                        }
                        : item
                )
            );

            if (nextFavouriteValue) {
                await parentLibraryApi.addFavourite(story.id);
                setSuccessMessage("Story added to favourites.");
            } else {
                await parentLibraryApi.removeFavourite(story.id);
                setSuccessMessage("Story removed from favourites.");
            }

            window.setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (requestError) {
            setStories((previous) =>
                previous.map((item) =>
                    item.id === story.id
                        ? {
                            ...item,
                            is_favourite: previousFavouriteValue,
                            favourite: previousFavouriteValue,
                        }
                        : item
                )
            );

            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to update favourite status."
                )
            );
        } finally {
            setFavouriteLoadingId(null);
        }
    };

    const handleReadStory = (story) => {
        navigate(`/story/${story.id}`);
    };

    const handleQuiz = (story) => {
        navigate(`/parent/stories/${story.id}/quiz`);
    };

    const handleDownload = (story) => {
        if (story.pdf_url) {
            window.open(story.pdf_url, "_blank", "noopener,noreferrer");
            return;
        }

        navigate(`/story/${story.id}`, {
            state: {
                downloadPdf: true,
            },
        });
    };

    const clearFilters = () => {
        setSearchTerm("");
        setLanguageFilter("all");
        setStatusFilter("all");
        setSortBy("newest");
    };

    const hasActiveFilters =
        searchTerm ||
        languageFilter !== "all" ||
        statusFilter !== "all" ||
        sortBy !== "newest";

    return (
        <div className="min-h-screen bg-slate-50">
            <ParentSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="lg:pl-72">
                <ParentNavbar
                    title="Story Library"
                    subtitle="Browse, manage and track your children's stories"
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="p-4 sm:p-6 lg:p-8">
                    {error && (
                        <div className="mb-6 flex items-start justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() => setError("")}
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
                            title="Total Stories"
                            value={normalizedStories.length}
                            icon={FaBookOpen}
                            color="rose"
                            description="Available stories"
                        />

                        <StatsCard
                            title="Completed"
                            value={completedStories}
                            icon={FaBookOpen}
                            color="emerald"
                            description="Finished stories"
                        />

                        <StatsCard
                            title="In Progress"
                            value={inProgressStories}
                            icon={FaBookOpen}
                            color="blue"
                            description="Currently reading"
                        />

                        <StatsCard
                            title="Favourites"
                            value={favouriteStories}
                            icon={FaHeart}
                            color="rose"
                            description="Bookmarked stories"
                        />
                    </section>

                    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Search Stories
                                </label>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-rose-500">
                                    <FaSearch className="text-slate-400" />

                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="Search by title, child, moral or setting..."
                                        className="w-full bg-transparent text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3 xl:w-[650px]">
                                <FilterSelect
                                    label="Language"
                                    value={languageFilter}
                                    onChange={setLanguageFilter}
                                    options={languageOptions}
                                />

                                <FilterSelect
                                    label="Status"
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    options={statusOptions}
                                />

                                <FilterSelect
                                    label="Sort By"
                                    value={sortBy}
                                    onChange={setSortBy}
                                    options={[
                                        {
                                            value: "newest",
                                            label: "Newest First",
                                        },
                                        {
                                            value: "oldest",
                                            label: "Oldest First",
                                        },
                                        {
                                            value: "title",
                                            label: "Story Title",
                                        },
                                        {
                                            value: "progress",
                                            label: "Highest Progress",
                                        },
                                    ]}
                                />
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-600"
                                >
                                    <FaFilter />
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="mt-6">
                        {loading ? (
                            <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                                <div className="text-center">
                                    <FaSpinner className="mx-auto animate-spin text-5xl text-rose-500" />

                                    <p className="mt-4 font-medium text-slate-600">
                                        Loading story library...
                                    </p>
                                </div>
                            </div>
                        ) : paginatedStories.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-3xl text-rose-500">
                                    <FaBookOpen />
                                </div>

                                <h2 className="mt-5 text-xl font-bold text-slate-900">
                                    No stories found
                                </h2>

                                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                    No stories match the selected filters. Try clearing
                                    the filters or create a new story.
                                </p>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 font-bold text-white hover:from-rose-600 hover:to-amber-600 shadow-md"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                    {paginatedStories.map((story) => (
                                        <div key={story.id} className="relative">
                                            {favouriteLoadingId === story.id && (
                                                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
                                                    <FaSpinner className="animate-spin text-3xl text-rose-500" />
                                                </div>
                                            )}

                                            <StoryCard
                                                story={story}
                                                onFavourite={handleFavourite}
                                                onRead={handleReadStory}
                                                onDownload={handleDownload}
                                                onQuiz={handleQuiz}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
                                        <p className="text-sm text-slate-500">
                                            Showing{" "}
                                            {(currentPage - 1) * storiesPerPage + 1} to{" "}
                                            {Math.min(
                                                currentPage * storiesPerPage,
                                                filteredStories.length
                                            )}{" "}
                                            of {filteredStories.length} stories
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

                                            <span className="rounded-lg bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600">
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
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-rose-500"
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default ParentStoryLibrary;