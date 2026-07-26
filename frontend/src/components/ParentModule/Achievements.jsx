import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    FaAward,
    FaCheckCircle,
    FaFilter,
    FaLock,
    FaMedal,
    FaSearch,
    FaSpinner,
    FaStar,
    FaTimes,
    FaTrophy,
} from "react-icons/fa";

import ParentSidebar from "./ParentSidebar";
import ParentNavbar from "./ParentNavbar";
import StatsCard from "./StatsCard";
import AchievementCard from "./AchievementCard";

import {
    getApiErrorMessage,
    parentAchievementsApi,
    parentChildrenApi,
} from "../../services/api";

function Achievements() {
    const [searchParams] = useSearchParams();
    const [children, setChildren] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [summary, setSummary] = useState({});

    const [selectedChildId, setSelectedChildId] = useState(
        searchParams.get("child") || "all"
    );
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [achievementLoading, setAchievementLoading] =
        useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const achievementsPerPage = 9;

    useEffect(() => {
        loadData();
    }, [selectedChildId, searchParams]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const urlChild = searchParams.get("child");
            const activeChildId = urlChild || selectedChildId;

            const params = {};
            if (activeChildId && activeChildId !== "all") {
                params.child = activeChildId;
            }

            const results = await Promise.allSettled([
                parentChildrenApi.getChildren(),
                parentAchievementsApi.getAchievements(params),
                parentAchievementsApi.getAchievementSummary(params),
            ]);

            const [childrenResult, achievementsResult, summaryResult] = results;

            if (childrenResult.status === "fulfilled") {
                const childData = childrenResult.value;
                setChildren(
                    Array.isArray(childData)
                        ? childData
                        : childData?.results || childData?.children || childData?.data || []
                );
            }

            if (achievementsResult.status === "fulfilled") {
                const achievementData = achievementsResult.value;
                setAchievements(
                    Array.isArray(achievementData)
                        ? achievementData
                        : achievementData?.results || achievementData?.achievements || achievementData?.data || []
                );
            }

            if (summaryResult.status === "fulfilled") {
                setSummary(summaryResult.value || {});
            }
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load achievements."
                )
            );
        } finally {
            setLoading(false);
            setAchievementLoading(false);
        }
    };

    const getChildName = (child) =>
        child?.name ||
        child?.child_name ||
        child?.full_name ||
        child?.user?.first_name ||
        "Child";

    const normalizedAchievements = useMemo(() => {
        return achievements.map((achievement, index) => {
            const unlocked = Boolean(
                achievement.unlocked ??
                achievement.is_unlocked ??
                achievement.earned ??
                achievement.date_awarded ??
                achievement.unlocked_at
            );

            const progress = Number(
                achievement.progress_percentage ??
                achievement.progress ??
                achievement.completion_percentage ??
                (unlocked ? 100 : 0)
            );

            return {
                ...achievement,
                id: achievement.id || index,
                title:
                    achievement.title ||
                    achievement.name ||
                    achievement.badge_name ||
                    "Achievement",
                description:
                    achievement.description ||
                    achievement.badge_description ||
                    "Complete learning activities to unlock this achievement.",
                category:
                    achievement.category ||
                    achievement.achievement_type ||
                    achievement.badge_type ||
                    "General",
                child_name:
                    achievement.child_name ||
                    achievement.child?.name ||
                    achievement.child?.child_name ||
                    "Child",
                icon:
                    achievement.icon ||
                    achievement.icon_url ||
                    achievement.badge_image ||
                    "",
                unlocked,
                progress: Math.min(100, Math.max(0, progress)),
                current_value: Number(
                    achievement.current_value ??
                    achievement.current_progress ??
                    achievement.completed_count ??
                    0
                ),
                target_value: Number(
                    achievement.target_value ??
                    achievement.target ??
                    achievement.required_count ??
                    0
                ),
                unlocked_at:
                    achievement.unlocked_at ||
                    achievement.date_awarded ||
                    achievement.earned_at ||
                    "",
                points: Number(
                    achievement.points ??
                    achievement.reward_points ??
                    0
                ),
                rarity:
                    achievement.rarity ||
                    achievement.level ||
                    "Common",
            };
        });
    }, [achievements]);

    const categories = useMemo(() => {
        return [
            ...new Set(
                normalizedAchievements
                    .map((achievement) => achievement.category)
                    .filter(Boolean)
            ),
        ];
    }, [normalizedAchievements]);

    const filteredAchievements = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return normalizedAchievements.filter((achievement) => {
            const matchesSearch =
                !query ||
                achievement.title.toLowerCase().includes(query) ||
                achievement.description
                    .toLowerCase()
                    .includes(query) ||
                achievement.child_name
                    .toLowerCase()
                    .includes(query) ||
                achievement.category
                    .toLowerCase()
                    .includes(query);

            let matchesStatus = true;

            if (statusFilter === "unlocked") {
                matchesStatus = achievement.unlocked;
            }

            if (statusFilter === "locked") {
                matchesStatus = !achievement.unlocked;
            }

            if (statusFilter === "almost_complete") {
                matchesStatus =
                    !achievement.unlocked &&
                    achievement.progress >= 70;
            }

            const matchesCategory =
                categoryFilter === "all" ||
                achievement.category === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );
        });
    }, [
        normalizedAchievements,
        searchTerm,
        statusFilter,
        categoryFilter,
    ]);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        selectedChildId,
        statusFilter,
        categoryFilter,
        searchTerm,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredAchievements.length / achievementsPerPage
        )
    );

    const paginatedAchievements =
        filteredAchievements.slice(
            (currentPage - 1) * achievementsPerPage,
            currentPage * achievementsPerPage
        );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const unlockedCount =
        summary.unlocked_count ??
        summary.total_unlocked ??
        normalizedAchievements.filter(
            (achievement) => achievement.unlocked
        ).length;

    const lockedCount =
        summary.locked_count ??
        summary.total_locked ??
        normalizedAchievements.filter(
            (achievement) => !achievement.unlocked
        ).length;

    const totalPoints =
        summary.total_points ??
        summary.points_earned ??
        normalizedAchievements
            .filter((achievement) => achievement.unlocked)
            .reduce(
                (total, achievement) =>
                    total + achievement.points,
                0
            );

    const almostCompletedCount =
        summary.almost_completed_count ??
        normalizedAchievements.filter(
            (achievement) =>
                !achievement.unlocked &&
                achievement.progress >= 70
        ).length;

    const completionPercentage =
        normalizedAchievements.length > 0
            ? Math.round(
                (unlockedCount /
                    normalizedAchievements.length) *
                100
            )
            : 0;

    const categorySummary = useMemo(() => {
        const grouped = {};

        normalizedAchievements.forEach((achievement) => {
            if (!grouped[achievement.category]) {
                grouped[achievement.category] = {
                    total: 0,
                    unlocked: 0,
                };
            }

            grouped[achievement.category].total += 1;

            if (achievement.unlocked) {
                grouped[achievement.category].unlocked += 1;
            }
        });

        return Object.entries(grouped).map(
            ([category, data]) => ({
                category,
                total: data.total,
                unlocked: data.unlocked,
                percentage:
                    data.total > 0
                        ? Math.round(
                            (data.unlocked / data.total) * 100
                        )
                        : 0,
            })
        );
    }, [normalizedAchievements]);

    const recentAchievements = useMemo(() => {
        return normalizedAchievements
            .filter(
                (achievement) =>
                    achievement.unlocked &&
                    achievement.unlocked_at
            )
            .sort(
                (first, second) =>
                    new Date(second.unlocked_at) -
                    new Date(first.unlocked_at)
            )
            .slice(0, 5);
    }, [normalizedAchievements]);

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setCategoryFilter("all");
    };

    const hasActiveFilters =
        searchTerm ||
        statusFilter !== "all" ||
        categoryFilter !== "all";

    const formatDate = (dateValue) => {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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
                        title="Achievements"
                        subtitle="Loading achievements"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="text-center">
                            <FaSpinner className="mx-auto animate-spin text-5xl text-indigo-600" />

                            <p className="mt-4 font-medium text-slate-600">
                                Loading achievements...
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
                    title="Achievements"
                    subtitle="Track badges, milestones and rewards"
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

                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                        <StatsCard
                            title="Total Achievements"
                            value={normalizedAchievements.length}
                            icon={FaTrophy}
                            color="indigo"
                            description="Available badges"
                        />

                        <StatsCard
                            title="Unlocked"
                            value={unlockedCount}
                            icon={FaCheckCircle}
                            color="emerald"
                            description={`${completionPercentage}% completed`}
                        />

                        <StatsCard
                            title="Locked"
                            value={lockedCount}
                            icon={FaLock}
                            color="slate"
                            description="Still available"
                        />

                        <StatsCard
                            title="Almost Complete"
                            value={almostCompletedCount}
                            icon={FaStar}
                            color="amber"
                            description="70% progress or more"
                        />

                        <StatsCard
                            title="Reward Points"
                            value={totalPoints}
                            icon={FaAward}
                            color="rose"
                            description="Points earned"
                        />
                    </section>

                    <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-100">
                                    Achievement progress
                                </p>

                                <h2 className="mt-1 text-3xl font-bold">
                                    {completionPercentage}% Complete
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                                    Keep reading stories, completing quizzes and
                                    maintaining learning streaks to unlock more
                                    achievements.
                                </p>
                            </div>

                            <div className="w-full lg:max-w-md">
                                <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                                    <span>{unlockedCount} unlocked</span>

                                    <span>
                                        {normalizedAchievements.length} total
                                    </span>
                                </div>

                                <div className="h-4 overflow-hidden rounded-full bg-white/20">
                                    <div
                                        className="h-full rounded-full bg-white transition-all duration-500"
                                        style={{
                                            width: `${completionPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="grid gap-5 lg:grid-cols-[1fr_220px_220px_220px]">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Search Achievements
                                </label>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-indigo-500">
                                    <FaSearch className="text-slate-400" />

                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="Search badge, category or child..."
                                        className="w-full bg-transparent text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <FilterSelect
                                label="Child"
                                value={selectedChildId}
                                onChange={setSelectedChildId}
                                options={[
                                    {
                                        value: "all",
                                        label: "All Children",
                                    },
                                    ...children.map((child) => ({
                                        value: String(child.id),
                                        label: getChildName(child),
                                    })),
                                ]}
                            />

                            <FilterSelect
                                label="Status"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    {
                                        value: "all",
                                        label: "All Status",
                                    },
                                    {
                                        value: "unlocked",
                                        label: "Unlocked",
                                    },
                                    {
                                        value: "locked",
                                        label: "Locked",
                                    },
                                    {
                                        value: "almost_complete",
                                        label: "Almost Complete",
                                    },
                                ]}
                            />

                            <FilterSelect
                                label="Category"
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={[
                                    {
                                        value: "all",
                                        label: "All Categories",
                                    },
                                    ...categories.map((category) => ({
                                        value: category,
                                        label: category,
                                    })),
                                ]}
                            />
                        </div>

                        {hasActiveFilters && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                >
                                    <FaFilter />
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="relative mt-6">
                        {achievementLoading && (
                            <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-slate-50/70 backdrop-blur-sm">
                                <FaSpinner className="animate-spin text-4xl text-indigo-600" />
                            </div>
                        )}

                        {paginatedAchievements.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl text-indigo-600">
                                    <FaMedal />
                                </div>

                                <h2 className="mt-5 text-xl font-bold text-slate-900">
                                    No achievements found
                                </h2>

                                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                    No achievements match the selected filters.
                                    Try changing or clearing the filters.
                                </p>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {paginatedAchievements.map(
                                        (achievement) => (
                                            <AchievementCard
                                                key={achievement.id}
                                                achievement={achievement}
                                            />
                                        )
                                    )}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
                                        <p className="text-sm text-slate-500">
                                            Showing{" "}
                                            {(currentPage - 1) *
                                                achievementsPerPage +
                                                1}{" "}
                                            to{" "}
                                            {Math.min(
                                                currentPage *
                                                achievementsPerPage,
                                                filteredAchievements.length
                                            )}{" "}
                                            of {filteredAchievements.length} achievements
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={currentPage === 1}
                                                onClick={() =>
                                                    setCurrentPage(
                                                        (previous) => previous - 1
                                                    )
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
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                                onClick={() =>
                                                    setCurrentPage(
                                                        (previous) => previous + 1
                                                    )
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

                    <section className="mt-8 grid gap-6 xl:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                    <FaTrophy />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Category Progress
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Achievement completion by category
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-5">
                                {categorySummary.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-slate-500">
                                        No category progress available.
                                    </p>
                                ) : (
                                    categorySummary.map((item) => (
                                        <div key={item.category}>
                                            <div className="mb-2 flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {item.category}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {item.unlocked} of {item.total} unlocked
                                                    </p>
                                                </div>

                                                <span className="font-bold text-indigo-600">
                                                    {item.percentage}%
                                                </span>
                                            </div>

                                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                                                    style={{
                                                        width: `${item.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                        <FaStar />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            Recently Unlocked
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Latest learning milestones
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {recentAchievements.length === 0 ? (
                                    <div className="px-6 py-14 text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                                            <FaLock />
                                        </div>

                                        <p className="mt-4 text-sm font-medium text-slate-500">
                                            No recent achievements unlocked.
                                        </p>
                                    </div>
                                ) : (
                                    recentAchievements.map((achievement) => (
                                        <div
                                            key={achievement.id}
                                            className="flex items-center gap-4 p-5"
                                        >
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-100 text-2xl text-amber-600">
                                                {achievement.icon ? (
                                                    <img
                                                        src={achievement.icon}
                                                        alt={achievement.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <FaMedal />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate font-bold text-slate-900">
                                                    {achievement.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {achievement.child_name} •{" "}
                                                    {formatDate(
                                                        achievement.unlocked_at
                                                    )}
                                                </p>
                                            </div>

                                            {achievement.points > 0 && (
                                                <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                                    +{achievement.points} pts
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
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

export default Achievements;