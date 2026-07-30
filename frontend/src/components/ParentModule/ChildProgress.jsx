import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    FaBookOpen,
    FaChartBar,
    FaCheckCircle,
    FaClock,
    FaFire,
    FaMedal,
    FaSearch,
    FaSpinner,
    FaTimes,
    FaUserGraduate,
} from "react-icons/fa";

import ParentSidebar from "./ParentSidebar";
import ParentNavbar from "./ParentNavbar";
import StatsCard from "../../components/ParentModule/StatsCard";
import ProgressChart from "../../components/ParentModule/ProgressChart";

import {
    getApiErrorMessage,
    parentChildrenApi,
    parentProgressApi,
    parentQuizApi,
} from "../../services/api";

function ChildProgress() {
    const [searchParams] = useSearchParams();
    const [children, setChildren] = useState([]);
    const [progressData, setProgressData] = useState({});
    const [readingHistory, setReadingHistory] = useState([]);
    const [quizHistory, setQuizHistory] = useState([]);

    const [selectedChildId, setSelectedChildId] = useState(
        searchParams.get("child") || "all"
    );
    const [timeRange, setTimeRange] = useState("7");
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [progressLoading, setProgressLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, [selectedChildId, timeRange, searchParams]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            loadData();
        }, 60000);
        return () => clearInterval(intervalId);
    }, [selectedChildId, timeRange, searchParams]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const urlChild = searchParams.get("child");
            const activeChildId = urlChild || selectedChildId;

            const params = { days: timeRange };
            if (activeChildId && activeChildId !== "all") {
                params.child = activeChildId;
            }

            const results = await Promise.allSettled([
                parentChildrenApi.getChildren(),
                parentProgressApi.getProgress(params),
                parentProgressApi.getReadingHistory(params),
                parentQuizApi.getQuizReports(params),
            ]);

            const [
                childrenResult,
                progressResult,
                readingResult,
                quizResult,
            ] = results;

            if (childrenResult.status === "fulfilled") {
                const childData = childrenResult.value;
                setChildren(
                    Array.isArray(childData)
                        ? childData
                        : childData?.results || childData?.children || childData?.data || []
                );
            }

            if (progressResult.status === "fulfilled") {
                setProgressData(progressResult.value || {});
            }

            if (readingResult.status === "fulfilled") {
                const readingData = readingResult.value;
                setReadingHistory(
                    Array.isArray(readingData)
                        ? readingData
                        : readingData?.results || readingData?.logs || []
                );
            }

            if (quizResult.status === "fulfilled") {
                const quizData = quizResult.value;
                setQuizHistory(
                    Array.isArray(quizData)
                        ? quizData
                        : quizData?.results || quizData?.history || []
                );
            }
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load progress data."
                )
            );
        } finally {
            setLoading(false);
            setProgressLoading(false);
        }
    };

    const selectedChild = useMemo(() => {
        if (selectedChildId === "all") {
            return null;
        }

        return children.find(
            (child) => String(child.id) === String(selectedChildId)
        );
    }, [children, selectedChildId]);

    const childName = (child) =>
        child?.name ||
        child?.child_name ||
        child?.full_name ||
        child?.user?.first_name ||
        "Child";

    const filteredChildren = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) {
            return children;
        }

        return children.filter((child) =>
            childName(child).toLowerCase().includes(query)
        );
    }, [children, searchTerm]);

    const normalizedReadingHistory = useMemo(() => {
        return readingHistory.map((item, index) => ({
            id: item.id || index,
            child_name:
                item.child_name ||
                item.child?.name ||
                item.child?.child_name ||
                "Child",
            story_title:
                item.story_title ||
                item.story?.title_en ||
                item.story?.title ||
                "Story",
            date:
                item.date ||
                item.created_at?.slice(0, 10) ||
                item.started_at?.slice(0, 10) ||
                "-",
            duration:
                Number(
                    item.duration ??
                    item.duration_minutes ??
                    item.reading_minutes ??
                    0
                ),
            pages:
                Number(
                    item.pages_read ??
                    item.pages_completed ??
                    item.current_page ??
                    0
                ),
            progress:
                Number(
                    item.completion_percentage ??
                    item.progress_percentage ??
                    item.progress ??
                    0
                ),
            completed:
                item.completed ??
                item.is_completed ??
                Number(
                    item.completion_percentage ??
                    item.progress_percentage ??
                    0
                ) >= 100,
        }));
    }, [readingHistory]);

    const normalizedQuizHistory = useMemo(() => {
        return quizHistory.map((item, index) => ({
            id: item.id || index,
            child_name:
                item.child_name ||
                item.child?.name ||
                item.child?.child_name ||
                "Child",
            quiz_title:
                item.quiz_title ||
                item.quiz?.title ||
                item.story_title ||
                item.story?.title_en ||
                `Quiz ${index + 1}`,
            date:
                item.created_at?.slice(0, 10) ||
                item.attempted_at?.slice(0, 10) ||
                item.date ||
                "-",
            score: Number(
                item.percentage_score ??
                item.score_percentage ??
                item.percentage ??
                item.score ??
                0
            ),
            correct:
                item.correct_answers ??
                item.correct_count ??
                0,
            total:
                item.total_questions ??
                item.question_count ??
                0,
        }));
    }, [quizHistory]);

    const totalStories =
        progressData.total_stories_read ??
        progressData.stories_read ??
        normalizedReadingHistory.length;

    const completedStories =
        progressData.completed_stories ??
        normalizedReadingHistory.filter(
            (item) => item.completed
        ).length;

    const totalReadingMinutes =
        progressData.total_reading_minutes ??
        progressData.reading_minutes ??
        normalizedReadingHistory.reduce(
            (total, item) => total + item.duration,
            0
        );

    const averageQuizScore =
        progressData.average_quiz_score ??
        progressData.quiz_average ??
        (normalizedQuizHistory.length
            ? Math.round(
                normalizedQuizHistory.reduce(
                    (total, item) => total + item.score,
                    0
                ) / normalizedQuizHistory.length
            )
            : 0);

    const readingStreak =
        progressData.reading_streak ??
        progressData.current_streak ??
        0;

    const achievements =
        progressData.achievements_count ??
        progressData.total_achievements ??
        0;

    const weeklyReadingChart = useMemo(() => {
        const source =
            progressData.weekly_reading ||
            progressData.reading_chart ||
            progressData.daily_reading ||
            [];

        if (Array.isArray(source) && source.length > 0) {
            return source.map((item, index) => ({
                name:
                    item.day ||
                    item.label ||
                    item.date ||
                    `Day ${index + 1}`,
                value: Number(
                    item.minutes ??
                    item.reading_minutes ??
                    item.duration ??
                    item.value ??
                    0
                ),
            }));
        }

        const groupedData = {};

        normalizedReadingHistory.forEach((item) => {
            groupedData[item.date] =
                (groupedData[item.date] || 0) + item.duration;
        });

        return Object.entries(groupedData)
            .slice(-7)
            .map(([date, value]) => ({
                name: date,
                value,
            }));
    }, [progressData, normalizedReadingHistory]);

    const quizPerformanceChart = useMemo(() => {
        const source =
            progressData.quiz_chart ||
            progressData.quiz_performance ||
            [];

        if (Array.isArray(source) && source.length > 0) {
            return source.map((item, index) => ({
                name:
                    item.label ||
                    item.quiz_title ||
                    item.name ||
                    `Quiz ${index + 1}`,
                value: Number(
                    item.score ??
                    item.percentage ??
                    item.value ??
                    0
                ),
            }));
        }

        return normalizedQuizHistory
            .slice(-10)
            .map((item) => ({
                name: item.quiz_title,
                value: item.score,
            }));
    }, [progressData, normalizedQuizHistory]);

    const storyCompletionChart = useMemo(() => {
        const source =
            progressData.story_completion_chart ||
            progressData.completion_chart ||
            [];

        if (Array.isArray(source) && source.length > 0) {
            return source.map((item, index) => ({
                name:
                    item.label ||
                    item.story_title ||
                    item.name ||
                    `Story ${index + 1}`,
                value: Number(
                    item.completion_percentage ??
                    item.progress ??
                    item.value ??
                    0
                ),
            }));
        }

        return normalizedReadingHistory
            .slice(-10)
            .map((item) => ({
                name: item.story_title,
                value: item.progress,
            }));
    }, [progressData, normalizedReadingHistory]);

    const calculateProgressWidth = (value) => {
        const number = Number(value) || 0;

        return `${Math.min(100, Math.max(0, number))}%`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <ParentSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <div className="lg:pl-72">
                    <ParentNavbar
                        title="Child Progress"
                        subtitle="Loading learning progress"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="text-center">
                            <FaSpinner className="mx-auto animate-spin text-5xl text-rose-500" />

                            <p className="mt-4 font-medium text-slate-600">
                                Loading progress data...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <ParentSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="lg:pl-72">
                <ParentNavbar
                    title="Child Progress"
                    subtitle="Track reading, quizzes and learning milestones"
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

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="grid gap-5 lg:grid-cols-[1fr_220px_220px]">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Search Child
                                </label>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-rose-500">
                                    <FaSearch className="text-slate-400" />

                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="Search child name..."
                                        className="w-full bg-transparent text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Select Child
                                </label>

                                <select
                                    value={selectedChildId}
                                    onChange={(event) =>
                                        setSelectedChildId(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-rose-500"
                                >
                                    <option value="all">All Children</option>

                                    {filteredChildren.map((child) => (
                                        <option
                                            key={child.id}
                                            value={child.id}
                                        >
                                            {childName(child)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Time Range
                                </label>

                                <select
                                    value={timeRange}
                                    onChange={(event) =>
                                        setTimeRange(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-rose-500"
                                >
                                    <option value="7">Last 7 Days</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 3 Months</option>
                                    <option value="365">Last Year</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {selectedChild && (
                        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-6 text-white shadow-2xl shadow-rose-500/20">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <img
                                    src={
                                        selectedChild.avatar ||
                                        `https://ui-avatars.com/api/?background=ffffff&color=4f46e5&size=160&name=${encodeURIComponent(
                                            childName(selectedChild)
                                        )}`
                                    }
                                    alt={childName(selectedChild)}
                                    className="h-24 w-24 rounded-full border-4 border-white/40 object-cover"
                                />

                                <div>
                                    <p className="text-sm font-medium text-rose-100">
                                        Progress report for
                                    </p>

                                    <h1 className="mt-1 text-3xl font-bold">
                                        {childName(selectedChild)}
                                    </h1>

                                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                                        <span className="rounded-full bg-white/20 px-4 py-2">
                                            {selectedChild.reading_level ||
                                                "Beginner"}
                                        </span>

                                        <span className="rounded-full bg-white/20 px-4 py-2">
                                            {timeRange} day report
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="relative mt-6">
                        {progressLoading && (
                            <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-slate-50/70 backdrop-blur-sm">
                                <FaSpinner className="animate-spin text-4xl text-rose-500" />
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            <StatsCard
                                title="Stories Read"
                                value={totalStories}
                                icon={FaBookOpen}
                                color="rose"
                                description={`${completedStories} completed`}
                            />

                            <StatsCard
                                title="Reading Time"
                                value={`${totalReadingMinutes} min`}
                                icon={FaClock}
                                color="blue"
                                description={`Last ${timeRange} days`}
                            />

                            <StatsCard
                                title="Quiz Average"
                                value={`${Math.round(averageQuizScore)}%`}
                                icon={FaUserGraduate}
                                color="emerald"
                                description={`${normalizedQuizHistory.length} attempts`}
                            />

                            <StatsCard
                                title="Reading Streak"
                                value={`${readingStreak} days`}
                                icon={FaFire}
                                color="orange"
                                description="Current streak"
                            />

                            <StatsCard
                                title="Achievements"
                                value={achievements}
                                icon={FaMedal}
                                color="amber"
                                description="Unlocked rewards"
                            />

                            <StatsCard
                                title="Completion Rate"
                                value={
                                    totalStories > 0
                                        ? `${Math.round(
                                            (completedStories / totalStories) * 100
                                        )}%`
                                        : "0%"
                                }
                                icon={FaCheckCircle}
                                color="rose"
                                description="Story completion"
                            />
                        </div>

                        <section className="mt-6 grid gap-6 xl:grid-cols-2">
                            <ProgressChart
                                title="Reading Activity"
                                subtitle={`Reading time during the last ${timeRange} days`}
                                data={weeklyReadingChart}
                                type="area"
                                dataKey="value"
                                xKey="name"
                            />

                            <ProgressChart
                                title="Quiz Performance"
                                subtitle="Scores across recent quiz attempts"
                                data={quizPerformanceChart}
                                type="bar"
                                dataKey="value"
                                xKey="name"
                            />
                        </section>

                        <section className="mt-6">
                            <ProgressChart
                                title="Story Completion"
                                subtitle="Progress percentage across recent stories"
                                data={storyCompletionChart}
                                type="line"
                                dataKey="value"
                                xKey="name"
                            />
                        </section>

                        <section className="mt-6 grid gap-6 xl:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                                            <FaBookOpen />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Recent Reading Activity
                                            </h2>

                                            <p className="text-sm text-slate-500">
                                                Latest story reading sessions
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {normalizedReadingHistory.length === 0 ? (
                                        <EmptyState
                                            text="No reading activity found."
                                        />
                                    ) : (
                                        normalizedReadingHistory
                                            .slice(0, 6)
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-5"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h3 className="font-bold text-slate-900">
                                                                {item.story_title}
                                                            </h3>

                                                            <p className="mt-1 text-sm text-slate-500">
                                                                {selectedChildId === "all" &&
                                                                    `${item.child_name} • `}
                                                                {item.date}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold ${item.completed
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-blue-100 text-blue-700"
                                                                }`}
                                                        >
                                                            {item.completed
                                                                ? "Completed"
                                                                : "In Progress"}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4">
                                                        <div className="mb-2 flex items-center justify-between text-sm">
                                                            <span className="text-slate-500">
                                                                {item.duration} minutes •{" "}
                                                                {item.pages} pages
                                                            </span>

                                                            <span className="font-bold text-rose-500">
                                                                {item.progress}%
                                                            </span>
                                                        </div>

                                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all"
                                                                style={{
                                                                    width:
                                                                        calculateProgressWidth(
                                                                            item.progress
                                                                        ),
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                            <FaChartBar />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Recent Quiz Results
                                            </h2>

                                            <p className="text-sm text-slate-500">
                                                Latest quiz scores and attempts
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {normalizedQuizHistory.length === 0 ? (
                                        <EmptyState
                                            text="No quiz attempts found."
                                        />
                                    ) : (
                                        normalizedQuizHistory
                                            .slice(0, 6)
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between gap-4 p-5"
                                                >
                                                    <div className="min-w-0">
                                                        <h3 className="truncate font-bold text-slate-900">
                                                            {item.quiz_title}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {selectedChildId === "all" &&
                                                                `${item.child_name} • `}
                                                            {item.date}
                                                        </p>

                                                        {item.total > 0 && (
                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {item.correct} of {item.total} correct
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold ${item.score >= 70
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : item.score >= 40
                                                                ? "bg-amber-100 text-amber-700"
                                                                : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {item.score}%
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </section>
                    </section>
                </main>
            </div>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                <FaChartBar />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
                {text}
            </p>
        </div>
    );
}

export default ChildProgress;