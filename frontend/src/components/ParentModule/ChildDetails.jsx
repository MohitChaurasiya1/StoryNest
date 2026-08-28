import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaBookOpen,
    FaCertificate,
    FaChartLine,
    FaClock,
    FaEdit,
    FaMedal,
    FaPlus,
    FaQuestionCircle,
    FaSpinner,
    FaTimes,
    FaTrash,
    FaUserGraduate,
} from "react-icons/fa";

import ParentSidebar from "./ParentSidebar";
import ParentNavbar from "./ParentNavbar";
import StatsCard from "./StatsCard";
import ProgressChart from "./ProgressChart";
import AchievementCard from "./AchievementCard";
import ReadingLogTable from "./ReadingLogTable";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import StoryCard from "./StoryCard";

import {
    getApiErrorMessage,
    parentAchievementsApi,
    parentCertificatesApi,
    parentChildrenApi,
    parentDashboardApi,
    parentFamilyLogsApi,
    parentLibraryApi,
    parentQuizApi,
} from "../../services/api";

const initialNoteForm = {
    story: "",
    note: "",
};

function ChildDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [child, setChild] = useState(null);
    const [dashboard, setDashboard] = useState({});
    const [insights, setInsights] = useState({});
    const [quizHistory, setQuizHistory] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [readingLogs, setReadingLogs] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [stories, setStories] = useState([]);
    const [favouriteLoadingId, setFavouriteLoadingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [savingNote, setSavingNote] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState("overview");
    const [noteForm, setNoteForm] = useState(initialNoteForm);
    const [noteErrors, setNoteErrors] = useState({});

    useEffect(() => {
        loadChildDetails();
    }, [id]);

    const loadChildDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const results = await Promise.allSettled([
                parentChildrenApi.getChild(id),
                parentDashboardApi.getChildDashboard(id),
                parentDashboardApi.getChildInsights(id),
                parentQuizApi.getChildQuizHistory(id),
                parentAchievementsApi.getChildAchievements(id),
                parentFamilyLogsApi.getChildReadingLogs(id),
                parentCertificatesApi.getCertificates({
                    child: id,
                }),
                parentLibraryApi.getChildStories(id),
            ]);

            const [
                childResult,
                dashboardResult,
                insightsResult,
                quizResult,
                achievementsResult,
                logsResult,
                certificatesResult,
                storiesResult,
            ] = results;

            if (childResult.status === "fulfilled") {
                setChild(childResult.value);
            } else {
                throw childResult.reason;
            }

            if (dashboardResult.status === "fulfilled") {
                setDashboard(dashboardResult.value || {});
            }

            if (insightsResult.status === "fulfilled") {
                setInsights(insightsResult.value || {});
            }

            if (quizResult.status === "fulfilled") {
                const quizData = quizResult.value;

                setQuizHistory(
                    Array.isArray(quizData)
                        ? quizData
                        : quizData?.results || quizData?.history || []
                );
            }

            if (achievementsResult.status === "fulfilled") {
                const achievementData = achievementsResult.value;

                setAchievements(
                    Array.isArray(achievementData)
                        ? achievementData
                        : achievementData?.results ||
                        achievementData?.achievements ||
                        []
                );
            }

            if (logsResult.status === "fulfilled") {
                const logsData = logsResult.value;

                setReadingLogs(
                    Array.isArray(logsData)
                        ? logsData
                        : logsData?.results || logsData?.logs || []
                );
            }

            if (certificatesResult.status === "fulfilled") {
                const certificateData = certificatesResult.value;

                setCertificates(
                    Array.isArray(certificateData)
                        ? certificateData
                        : certificateData?.results ||
                        certificateData?.certificates ||
                        []
                );
            }

            if (storiesResult.status === "fulfilled") {
                const storyData = storiesResult.value;

                setStories(
                    Array.isArray(storyData)
                        ? storyData
                        : storyData?.results ||
                        storyData?.stories ||
                        []
                );
            }
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load child details."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const childName =
        child?.name ||
        child?.child_name ||
        child?.full_name ||
        child?.user?.first_name ||
        "Child";

    const calculateAge = (dob) => {
        if (!dob) return "-";

        const birthDate = new Date(dob);
        const today = new Date();

        if (Number.isNaN(birthDate.getTime())) {
            return "-";
        }

        let age = today.getFullYear() - birthDate.getFullYear();

        const monthDifference =
            today.getMonth() - birthDate.getMonth();

        if (
            monthDifference < 0 ||
            (monthDifference === 0 &&
                today.getDate() < birthDate.getDate())
        ) {
            age -= 1;
        }

        return age;
    };

    const age = child?.age ?? calculateAge(child?.dob);

    const storiesRead =
        dashboard?.stories_read ??
        dashboard?.total_stories_read ??
        insights?.stories_read ??
        child?.stories_read ??
        0;

    const totalReadingMinutes =
        dashboard?.total_reading_minutes ??
        dashboard?.reading_minutes ??
        insights?.total_reading_minutes ??
        0;

    const averageQuizScore =
        dashboard?.average_quiz_score ??
        insights?.average_quiz_score ??
        child?.quiz_average ??
        0;

    const completedStories =
        dashboard?.completed_stories ??
        insights?.completed_stories ??
        0;

    const unlockedAchievements = achievements.filter(
        (achievement) =>
            achievement?.unlocked ??
            achievement?.is_unlocked ??
            achievement?.earned ??
            achievement?.date_awarded
    ).length;

    const weeklyReadingData = useMemo(() => {
        const source =
            insights?.weekly_reading ||
            insights?.weekly_activity ||
            dashboard?.weekly_reading ||
            [];

        if (Array.isArray(source) && source.length > 0) {
            return source.map((item, index) => ({
                name:
                    item.name ||
                    item.day ||
                    item.label ||
                    `Day ${index + 1}`,
                value:
                    item.value ??
                    item.minutes ??
                    item.reading_minutes ??
                    0,
            }));
        }

        return [
            { name: "Mon", value: 0 },
            { name: "Tue", value: 0 },
            { name: "Wed", value: 0 },
            { name: "Thu", value: 0 },
            { name: "Fri", value: 0 },
            { name: "Sat", value: 0 },
            { name: "Sun", value: 0 },
        ];
    }, [dashboard, insights]);

    const quizChartData = useMemo(() => {
        return quizHistory.slice(0, 10).map((attempt, index) => ({
            name:
                attempt.story_title ||
                attempt.quiz_title ||
                `Quiz ${index + 1}`,
            value:
                attempt.percentage_score ??
                attempt.score_percentage ??
                attempt.percentage ??
                attempt.score ??
                0,
        }));
    }, [quizHistory]);

    const normalizedLogs = useMemo(() => {
        return readingLogs.map((log) => ({
            id: log.id,
            date:
                log.date ||
                log.created_at?.slice(0, 10) ||
                log.started_at?.slice(0, 10) ||
                "-",
            child_name:
                log.child_name ||
                log.child?.name ||
                childName,
            story_title:
                log.story_title ||
                log.story?.title_en ||
                log.story?.title ||
                "-",
            pages_read:
                log.pages_read ??
                log.current_page ??
                log.pages_completed ??
                0,
            duration:
                log.duration ??
                log.duration_minutes ??
                log.reading_duration ??
                0,
            completion_percentage:
                log.completion_percentage ??
                log.progress_percentage ??
                0,
            parent_note:
                log.parent_note ||
                log.note ||
                log.notes ||
                "",
        }));
    }, [readingLogs, childName]);

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
                    childName,
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
    }, [stories, childName]);

    const handleDeleteChild = async () => {
        try {
            setDeleting(true);
            setError("");

            await parentChildrenApi.deleteChild(id);

            navigate("/parent/children", {
                replace: true,
            });
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to delete child profile."
                )
            );
        } finally {
            setDeleting(false);
            setDeleteModalOpen(false);
        }
    };

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

    const validateNote = () => {
        const errors = {};

        if (!noteForm.note.trim()) {
            errors.note = "Parent note is required.";
        }

        setNoteErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleNoteSubmit = async (event) => {
        event.preventDefault();

        if (!validateNote()) return;

        try {
            setSavingNote(true);
            setError("");

            const payload = {
                note: noteForm.note.trim(),
            };

            if (noteForm.story) {
                payload.story = noteForm.story;
            }

            const createdLog =
                await parentFamilyLogsApi.createChildReadingLog(
                    id,
                    payload
                );

            setReadingLogs((previous) => [
                createdLog,
                ...previous,
            ]);

            setNoteForm(initialNoteForm);
            setNoteModalOpen(false);
            setSuccessMessage("Parent note added successfully.");

            window.setTimeout(() => {
                setSuccessMessage("");
            }, 3500);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to add parent note."
                )
            );
        } finally {
            setSavingNote(false);
        }
    };

    const tabs = [
        {
            id: "overview",
            label: "Overview",
            icon: FaChartLine,
        },
        {
            id: "stories",
            label: "Story Library",
            icon: FaBookOpen,
        },
        {
            id: "quizzes",
            label: "Quiz History",
            icon: FaQuestionCircle,
        },
        {
            id: "achievements",
            label: "Achievements",
            icon: FaMedal,
        },
        {
            id: "certificates",
            label: "Certificates",
            icon: FaCertificate,
        },
        {
            id: "logs",
            label: "Reading Logs",
            icon: FaBookOpen,
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <ParentSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="lg:pl-72">
                    <ParentNavbar
                        title="Child Details"
                        subtitle="Loading child information"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="text-center">
                            <FaSpinner className="mx-auto animate-spin text-5xl text-rose-500" />

                            <p className="mt-4 font-medium text-slate-600">
                                Loading child details...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!child) {
        return (
            <div className="min-h-screen bg-slate-50">
                <ParentSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="lg:pl-72">
                    <ParentNavbar
                        title="Child Details"
                        subtitle="Child profile not found"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <main className="p-6">
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                            <h2 className="text-xl font-bold text-red-700">
                                Child profile not found
                            </h2>

                            <Link
                                to="/parent/children"
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 font-bold text-white shadow-md"
                            >
                                <FaArrowLeft />
                                Back to Children
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

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
                    title={childName}
                    subtitle="Child profile, progress and learning activity"
                    parentName={
                        dashboard?.parent_name ||
                        dashboard?.parent?.name ||
                        "Parent"
                    }
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="p-4 sm:p-6 lg:p-8 space-y-6">
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

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            to="/parent/children"
                            className="inline-flex items-center gap-2 font-bold text-rose-600 hover:text-rose-700 transition"
                        >
                            <FaArrowLeft />
                            Back to All Children
                        </Link>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50/80 dark:bg-red-950/50 px-4 py-2.5 font-bold text-red-600 dark:text-red-300 hover:bg-red-100 transition"
                            >
                                <FaTrash />
                                Delete Child
                            </button>
                        </div>
                    </div>

                    {/* Hero Header Card */}
                    <section className="overflow-hidden rounded-3xl border border-rose-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl shadow-rose-500/10 backdrop-blur-xl">
                        <div className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 px-6 py-8 text-white sm:px-8 relative">
                            <div className="absolute top-0 right-0 -mt-6 -mr-6 h-40 w-40 rounded-full bg-white/10 blur-xl pointer-events-none" />

                            <div className="flex flex-col gap-6 md:flex-row md:items-center relative z-10">
                                <div className="h-28 w-28 min-w-[112px] rounded-3xl bg-white/20 p-1 backdrop-blur-md shadow-2xl">
                                    {child?.avatar && typeof child.avatar === 'string' && child.avatar.length <= 4 ? (
                                        <div className="h-full w-full rounded-[22px] bg-white dark:bg-slate-900 flex items-center justify-center text-5xl">
                                            {child.avatar}
                                        </div>
                                    ) : (
                                        <img
                                            src={
                                                child.avatar ||
                                                `https://ui-avatars.com/api/?background=ffffff&color=ff6b6b&size=200&name=${encodeURIComponent(
                                                    childName
                                                )}`
                                            }
                                            alt={childName}
                                            className="h-full w-full rounded-[22px] object-cover"
                                        />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl sm:text-4xl font-black drop-shadow-sm">
                                            {childName}
                                        </h1>
                                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold backdrop-blur-md">
                                            ✨ Super Reader
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2.5 text-xs font-bold">
                                        <span className="rounded-full bg-white/20 px-3.5 py-1.5 backdrop-blur-md">
                                            🎈 Age: {age} years
                                        </span>

                                        <span className="rounded-full bg-white/20 px-3.5 py-1.5 backdrop-blur-md">
                                            📖 {child.reading_level || "Beginner"}
                                        </span>

                                        {child.favourite_animal && (
                                            <span className="rounded-full bg-white/20 px-3.5 py-1.5 backdrop-blur-md">
                                                🦁 Favorite Animal: {child.favourite_animal}
                                            </span>
                                        )}

                                        {child.favourite_colour && (
                                            <span className="rounded-full bg-white/20 px-3.5 py-1.5 backdrop-blur-md">
                                                🎨 Favorite Color: {child.favourite_colour}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-4 sm:px-6">
                            <div className="flex gap-2 py-3">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;

                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={[
                                                "flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200 whitespace-nowrap",
                                                isActive
                                                    ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20"
                                                    : "text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800",
                                            ].join(" ")}
                                        >
                                            <Icon className="text-sm" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-5 p-6 sm:grid-cols-2 xl:grid-cols-4">
                        <ProfileDetail
                            label="Date of Birth"
                            value={child.dob || "-"}
                        />

                        <ProfileDetail
                            label="Favourite Colour"
                            value={child.favourite_colour || "-"}
                        />

                        <ProfileDetail
                            label="Favourite Animal"
                            value={child.favourite_animal || "-"}
                        />

                        <ProfileDetail
                            label="Interests"
                            value={
                                Array.isArray(child.interests)
                                    ? child.interests.join(", ")
                                    : child.interests || "-"
                            }
                        />
                    </div>

                    <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <StatsCard
                            title="Stories Read"
                            value={storiesRead}
                            icon={FaBookOpen}
                            color="rose"
                            description={`${completedStories} completed`}
                        />

                        <StatsCard
                            title="Reading Time"
                            value={`${totalReadingMinutes} min`}
                            icon={FaClock}
                            color="blue"
                            description="Total duration"
                        />

                        <StatsCard
                            title="Quiz Average"
                            value={`${Math.round(averageQuizScore)}%`}
                            icon={FaUserGraduate}
                            color="emerald"
                            description={`${quizHistory.length} attempts`}
                        />

                        <StatsCard
                            title="Achievements"
                            value={unlockedAchievements}
                            icon={FaMedal}
                            color="amber"
                            description={`${certificates.length} certificates`}
                        />
                    </section>


                    <div className="flex overflow-x-auto border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-4 sm:px-6 backdrop-blur-md">
                        <div className="flex gap-2 py-3">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 whitespace-nowrap cursor-pointer ${isActive
                                            ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/25"
                                            : "text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                                            }`}
                                    >
                                        <Icon className="text-sm shrink-0" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    {activeTab === "overview" && (
                        <section className="mt-6 space-y-6">
                            <div className="grid gap-6 xl:grid-cols-2">
                                <ProgressChart
                                    title="Weekly Reading Activity"
                                    subtitle="Reading time during the last seven days"
                                    data={weeklyReadingData}
                                    type="area"
                                    dataKey="value"
                                    xKey="name"
                                />

                                <ProgressChart
                                    title="Recent Quiz Scores"
                                    subtitle="Performance across recent quizzes"
                                    data={quizChartData}
                                    type="bar"
                                    dataKey="value"
                                    xKey="name"
                                />
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Learning Insights
                                </h2>

                                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    <InsightCard
                                        title="Reading Streak"
                                        value={
                                            insights.reading_streak ??
                                            dashboard.reading_streak ??
                                            0
                                        }
                                        suffix=" days"
                                    />

                                    <InsightCard
                                        title="Favourite Language"
                                        value={
                                            insights.favourite_language ||
                                            insights.preferred_language ||
                                            "English"
                                        }
                                    />

                                    <InsightCard
                                        title="Books This Week"
                                        value={
                                            insights.books_this_week ??
                                            dashboard.books_this_week ??
                                            0
                                        }
                                    />

                                    <InsightCard
                                        title="Best Quiz Score"
                                        value={
                                            insights.best_quiz_score ??
                                            dashboard.best_quiz_score ??
                                            0
                                        }
                                        suffix="%"
                                    />

                                    <InsightCard
                                        title="Average Session"
                                        value={
                                            insights.average_session_minutes ??
                                            dashboard.average_session_minutes ??
                                            0
                                        }
                                        suffix=" min"
                                    />

                                    <InsightCard
                                        title="Completion Rate"
                                        value={
                                            insights.completion_rate ??
                                            dashboard.completion_rate ??
                                            0
                                        }
                                        suffix="%"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === "quizzes" && (
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 p-6">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Quiz History
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Review quiz attempts and scores.
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-5 py-4 text-left text-sm font-semibold">
                                                Story
                                            </th>
                                            <th className="px-5 py-4 text-left text-sm font-semibold">
                                                Quiz
                                            </th>
                                            <th className="px-5 py-4 text-center text-sm font-semibold">
                                                Correct
                                            </th>
                                            <th className="px-5 py-4 text-center text-sm font-semibold">
                                                Score
                                            </th>
                                            <th className="px-5 py-4 text-left text-sm font-semibold">
                                                Attempted On
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {quizHistory.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-5 py-12 text-center text-slate-500"
                                                >
                                                    No quiz attempts found.
                                                </td>
                                            </tr>
                                        ) : (
                                            quizHistory.map((attempt, index) => {
                                                const score =
                                                    attempt.percentage_score ??
                                                    attempt.score_percentage ??
                                                    attempt.percentage ??
                                                    attempt.score ??
                                                    0;

                                                return (
                                                    <tr
                                                        key={attempt.id || index}
                                                        className="border-t border-slate-100 hover:bg-slate-50"
                                                    >
                                                        <td className="px-5 py-4 font-medium">
                                                            {attempt.story_title ||
                                                                attempt.story?.title_en ||
                                                                "-"}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {attempt.quiz_title ||
                                                                attempt.quiz?.title ||
                                                                "Story Quiz"}
                                                        </td>

                                                        <td className="px-5 py-4 text-center">
                                                            {attempt.correct_answers ?? "-"} /{" "}
                                                            {attempt.total_questions ?? "-"}
                                                        </td>

                                                        <td className="px-5 py-4 text-center">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-bold ${score >= 70
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : score >= 40
                                                                        ? "bg-amber-100 text-amber-700"
                                                                        : "bg-red-100 text-red-700"
                                                                    }`}
                                                            >
                                                                {score}%
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            {attempt.created_at?.slice(0, 10) ||
                                                                attempt.attempted_at?.slice(0, 10) ||
                                                                "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === "achievements" && (
                        <section className="mt-6">
                            {achievements.length === 0 ? (
                                <EmptyState
                                    icon={FaMedal}
                                    title="No achievements available"
                                    description="Achievements will appear as the child reaches reading and quiz milestones."
                                />
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {achievements.map((achievement, index) => (
                                        <AchievementCard
                                            key={achievement.id || index}
                                            achievement={achievement}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === "certificates" && (
                        <section className="mt-6">
                            {certificates.length === 0 ? (
                                <EmptyState
                                    icon={FaCertificate}
                                    title="No certificates issued"
                                    description="Certificates will appear when this child completes important milestones."
                                />
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {certificates.map((certificate, index) => (
                                        <div
                                            key={certificate.id || index}
                                            className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-sm"
                                        >
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-2xl text-white">
                                                <FaCertificate />
                                            </div>

                                            <h3 className="mt-5 text-xl font-bold text-slate-900">
                                                {certificate.title ||
                                                    certificate.certificate_type ||
                                                    "Achievement Certificate"}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {certificate.description ||
                                                    certificate.milestone ||
                                                    "Awarded for completing a StoryNest learning milestone."}
                                            </p>

                                            <div className="mt-5 border-t border-amber-200 pt-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">
                                                        Issued
                                                    </span>

                                                    <span className="font-semibold">
                                                        {certificate.issued_at?.slice(0, 10) ||
                                                            certificate.created_at?.slice(0, 10) ||
                                                            "-"}
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                to="/parent/certificates"
                                                className="mt-5 flex items-center justify-center rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600"
                                            >
                                                View Certificate
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === "stories" && (
                        <section className="mt-6">
                            {normalizedStories.length === 0 ? (
                                <EmptyState
                                    icon={FaBookOpen}
                                    title="No stories created yet"
                                    description="Bilingual stories generated for this child will appear here."
                                />
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {normalizedStories.map((story) => (
                                        <StoryCard
                                            key={story.id}
                                            story={story}
                                            onFavourite={handleFavourite}
                                            onRead={handleReadStory}
                                            onDownload={handleDownload}
                                            onQuiz={handleQuiz}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === "logs" && (
                        <section className="mt-6">
                            <div className="mb-5 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setNoteModalOpen(true)}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 font-bold text-white hover:from-rose-600 hover:to-amber-600 shadow-md shadow-rose-500/20 transition"
                                >
                                    <FaPlus />
                                    Add Parent Note
                                </button>
                            </div>

                            <ReadingLogTable logs={normalizedLogs} />
                        </section>
                    )}
                </main>
            </div>

            {noteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Add Parent Note
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Add a note to {childName}&apos;s reading log.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!savingNote) {
                                        setNoteModalOpen(false);
                                        setNoteForm(initialNoteForm);
                                        setNoteErrors({});
                                    }
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleNoteSubmit} className="p-6">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Story ID
                                </label>

                                <input
                                    type="number"
                                    value={noteForm.story}
                                    onChange={(event) =>
                                        setNoteForm((previous) => ({
                                            ...previous,
                                            story: event.target.value,
                                        }))
                                    }
                                    placeholder="Optional story ID"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                                />
                            </div>

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Parent Note
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <textarea
                                    rows={5}
                                    value={noteForm.note}
                                    onChange={(event) => {
                                        setNoteForm((previous) => ({
                                            ...previous,
                                            note: event.target.value,
                                        }));

                                        setNoteErrors({});
                                    }}
                                    placeholder="Write your observations or comments..."
                                    className={`w-full resize-none rounded-xl border px-4 py-3 outline-none ${noteErrors.note
                                        ? "border-red-400"
                                        : "border-slate-300 focus:border-rose-500"
                                        }`}
                                />

                                {noteErrors.note && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {noteErrors.note}
                                    </p>
                                )}
                            </div>

                            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={savingNote}
                                    onClick={() => {
                                        setNoteModalOpen(false);
                                        setNoteForm(initialNoteForm);
                                        setNoteErrors({});
                                    }}
                                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingNote}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 font-bold text-white hover:from-rose-600 hover:to-amber-600 shadow-md shadow-rose-500/20 disabled:opacity-60 transition"
                                >
                                    {savingNote && (
                                        <FaSpinner className="animate-spin" />
                                    )}

                                    {savingNote ? "Saving..." : "Save Note"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                title="Delete Child Profile"
                message="This will permanently delete the child profile and may remove related progress data."
                itemName={childName}
                loading={deleting}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteChild}
            />
        </div>
    );
}

function ProfileDetail({ label, value }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p className="mt-2 break-words font-semibold text-slate-900">
                {value}
            </p>
        </div>
    );
}

function InsightCard({ title, value, suffix = "" }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
                {title}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
                {value}
                {suffix}
            </p>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-3xl text-rose-500">
                <Icon />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
                {title}
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                {description}
            </p>
        </div>
    );
}

export default ChildDetails;
