import { useEffect, useMemo, useState } from "react";
import {
    FaAward,
    FaChartBar,
    FaCheckCircle,
    FaClipboardList,
    FaSearch,
    FaSpinner,
    FaTimes,
    FaTrophy,
    FaUserGraduate,
} from "react-icons/fa";

import ParentSidebar from "../../components/ParentModule/ParentSidebar";
import ParentNavbar from "../../components/ParentModule/ParentNavbar";
import StatsCard from "../../components/ParentModule/StatsCard";
import ProgressChart from "../../components/ParentModule/ProgressChart";

import {
    getApiErrorMessage,
    parentChildrenApi,
    parentQuizApi,
} from "../../services/api";

function QuizReports() {
    const [children, setChildren] = useState([]);
    const [quizReports, setQuizReports] = useState([]);
    const [summary, setSummary] = useState({});

    const [selectedChildId, setSelectedChildId] = useState("all");
    const [scoreFilter, setScoreFilter] = useState("all");
    const [timeRange, setTimeRange] = useState("30");
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 10;

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!loading) {
            loadQuizReports();
        }
    }, [selectedChildId, timeRange]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError("");

            const childrenResponse =
                await parentChildrenApi.getChildren();

            const childData = Array.isArray(childrenResponse)
                ? childrenResponse
                : childrenResponse?.results ||
                childrenResponse?.children ||
                [];

            setChildren(childData);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load children."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const loadQuizReports = async () => {
        try {
            setReportLoading(true);
            setError("");

            const params = {
                days: timeRange,
            };

            if (selectedChildId !== "all") {
                params.child = selectedChildId;
            }

            const results = await Promise.allSettled([
                parentQuizApi.getQuizReports(params),
                parentQuizApi.getQuizSummary(params),
            ]);

            const [reportsResult, summaryResult] = results;

            if (reportsResult.status === "fulfilled") {
                const reportData = reportsResult.value;

                setQuizReports(
                    Array.isArray(reportData)
                        ? reportData
                        : reportData?.results ||
                        reportData?.reports ||
                        reportData?.quiz_attempts ||
                        []
                );
            } else {
                throw reportsResult.reason;
            }

            if (summaryResult.status === "fulfilled") {
                setSummary(summaryResult.value || {});
            }
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to load quiz reports."
                )
            );
        } finally {
            setReportLoading(false);
        }
    };

    const getChildName = (child) =>
        child?.name ||
        child?.child_name ||
        child?.full_name ||
        child?.user?.first_name ||
        "Child";

    const normalizedReports = useMemo(() => {
        return quizReports.map((report, index) => {
            const score = Number(
                report.percentage_score ??
                report.score_percentage ??
                report.percentage ??
                report.score ??
                0
            );

            return {
                id: report.id || index,
                child_name:
                    report.child_name ||
                    report.child?.name ||
                    report.child?.child_name ||
                    "Child",
                story_title:
                    report.story_title ||
                    report.story?.title_en ||
                    report.story?.title ||
                    "Story",
                quiz_title:
                    report.quiz_title ||
                    report.quiz?.title ||
                    "Story Quiz",
                score,
                correct_answers:
                    report.correct_answers ??
                    report.correct_count ??
                    0,
                total_questions:
                    report.total_questions ??
                    report.question_count ??
                    0,
                attempted_at:
                    report.attempted_at ||
                    report.created_at ||
                    report.date ||
                    "",
                time_taken:
                    report.time_taken_minutes ??
                    report.duration_minutes ??
                    report.time_taken ??
                    0,
                passed:
                    report.passed ??
                    report.is_passed ??
                    score >= 60,
            };
        });
    }, [quizReports]);

    const filteredReports = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return normalizedReports.filter((report) => {
            const matchesSearch =
                !query ||
                report.child_name.toLowerCase().includes(query) ||
                report.story_title.toLowerCase().includes(query) ||
                report.quiz_title.toLowerCase().includes(query);

            let matchesScore = true;

            if (scoreFilter === "excellent") {
                matchesScore = report.score >= 80;
            }

            if (scoreFilter === "good") {
                matchesScore =
                    report.score >= 60 && report.score < 80;
            }

            if (scoreFilter === "needs_improvement") {
                matchesScore = report.score < 60;
            }

            if (scoreFilter === "passed") {
                matchesScore = report.passed;
            }

            if (scoreFilter === "failed") {
                matchesScore = !report.passed;
            }

            return matchesSearch && matchesScore;
        });
    }, [normalizedReports, searchTerm, scoreFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, scoreFilter, selectedChildId, timeRange]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredReports.length / reportsPerPage)
    );

    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * reportsPerPage,
        currentPage * reportsPerPage
    );

    const totalAttempts =
        summary.total_attempts ??
        normalizedReports.length;

    const averageScore =
        summary.average_score ??
        summary.average_quiz_score ??
        (normalizedReports.length
            ? Math.round(
                normalizedReports.reduce(
                    (total, report) => total + report.score,
                    0
                ) / normalizedReports.length
            )
            : 0);

    const passedAttempts =
        summary.passed_attempts ??
        normalizedReports.filter((report) => report.passed)
            .length;

    const highestScore =
        summary.highest_score ??
        summary.best_score ??
        (normalizedReports.length
            ? Math.max(
                ...normalizedReports.map(
                    (report) => report.score
                )
            )
            : 0);

    const passRate =
        summary.pass_rate ??
        (totalAttempts > 0
            ? Math.round((passedAttempts / totalAttempts) * 100)
            : 0);

    const scoreChartData = useMemo(() => {
        const source =
            summary.score_chart ||
            summary.quiz_performance ||
            [];

        if (Array.isArray(source) && source.length > 0) {
            return source.map((item, index) => ({
                name:
                    item.label ||
                    item.quiz_title ||
                    item.date ||
                    `Quiz ${index + 1}`,
                value: Number(
                    item.score ??
                    item.percentage ??
                    item.value ??
                    0
                ),
            }));
        }

        return normalizedReports
            .slice(-10)
            .map((report) => ({
                name: report.quiz_title,
                value: report.score,
            }));
    }, [summary, normalizedReports]);

    const childPerformanceData = useMemo(() => {
        const groupedChildren = {};

        normalizedReports.forEach((report) => {
            if (!groupedChildren[report.child_name]) {
                groupedChildren[report.child_name] = {
                    total: 0,
                    attempts: 0,
                };
            }

            groupedChildren[report.child_name].total +=
                report.score;
            groupedChildren[report.child_name].attempts += 1;
        });

        return Object.entries(groupedChildren).map(
            ([name, data]) => ({
                name,
                value: Math.round(data.total / data.attempts),
            })
        );
    }, [normalizedReports]);

    const scoreDistribution = useMemo(() => {
        const excellent = normalizedReports.filter(
            (report) => report.score >= 80
        ).length;

        const good = normalizedReports.filter(
            (report) =>
                report.score >= 60 && report.score < 80
        ).length;

        const needsImprovement = normalizedReports.filter(
            (report) => report.score < 60
        ).length;

        return [
            {
                label: "Excellent",
                value: excellent,
                percentage: totalAttempts
                    ? Math.round((excellent / totalAttempts) * 100)
                    : 0,
                className: "bg-emerald-500",
            },
            {
                label: "Good",
                value: good,
                percentage: totalAttempts
                    ? Math.round((good / totalAttempts) * 100)
                    : 0,
                className: "bg-amber-500",
            },
            {
                label: "Needs Improvement",
                value: needsImprovement,
                percentage: totalAttempts
                    ? Math.round(
                        (needsImprovement / totalAttempts) * 100
                    )
                    : 0,
                className: "bg-red-500",
            },
        ];
    }, [normalizedReports, totalAttempts]);

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

    const getScoreStyle = (score) => {
        if (score >= 80) {
            return "bg-emerald-100 text-emerald-700";
        }

        if (score >= 60) {
            return "bg-amber-100 text-amber-700";
        }

        return "bg-red-100 text-red-700";
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
                        title="Quiz Reports"
                        subtitle="Loading quiz reports"
                        onMenuClick={() => setSidebarOpen(true)}
                    />

                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="text-center">
                            <FaSpinner className="mx-auto animate-spin text-5xl text-indigo-600" />

                            <p className="mt-4 font-medium text-slate-600">
                                Loading quiz reports...
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
                    title="Quiz Reports"
                    subtitle="Review quiz performance and learning results"
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
                        <div className="grid gap-5 lg:grid-cols-[1fr_220px_220px_220px]">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Search Reports
                                </label>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 focus-within:border-indigo-500">
                                    <FaSearch className="text-slate-400" />

                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="Search child, story or quiz..."
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
                                label="Score"
                                value={scoreFilter}
                                onChange={setScoreFilter}
                                options={[
                                    {
                                        value: "all",
                                        label: "All Scores",
                                    },
                                    {
                                        value: "excellent",
                                        label: "Excellent (80%+)",
                                    },
                                    {
                                        value: "good",
                                        label: "Good (60–79%)",
                                    },
                                    {
                                        value: "needs_improvement",
                                        label: "Below 60%",
                                    },
                                    {
                                        value: "passed",
                                        label: "Passed",
                                    },
                                    {
                                        value: "failed",
                                        label: "Not Passed",
                                    },
                                ]}
                            />

                            <FilterSelect
                                label="Time Range"
                                value={timeRange}
                                onChange={setTimeRange}
                                options={[
                                    {
                                        value: "7",
                                        label: "Last 7 Days",
                                    },
                                    {
                                        value: "30",
                                        label: "Last 30 Days",
                                    },
                                    {
                                        value: "90",
                                        label: "Last 3 Months",
                                    },
                                    {
                                        value: "365",
                                        label: "Last Year",
                                    },
                                ]}
                            />
                        </div>
                    </section>

                    <section className="relative mt-6">
                        {reportLoading && (
                            <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-slate-50/70 backdrop-blur-sm">
                                <FaSpinner className="animate-spin text-4xl text-indigo-600" />
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                            <StatsCard
                                title="Quiz Attempts"
                                value={totalAttempts}
                                icon={FaClipboardList}
                                color="indigo"
                                description={`Last ${timeRange} days`}
                            />

                            <StatsCard
                                title="Average Score"
                                value={`${Math.round(averageScore)}%`}
                                icon={FaChartBar}
                                color="blue"
                                description="Overall average"
                            />

                            <StatsCard
                                title="Passed"
                                value={passedAttempts}
                                icon={FaCheckCircle}
                                color="emerald"
                                description={`${passRate}% pass rate`}
                            />

                            <StatsCard
                                title="Highest Score"
                                value={`${highestScore}%`}
                                icon={FaTrophy}
                                color="amber"
                                description="Best performance"
                            />

                            <StatsCard
                                title="Children"
                                value={
                                    selectedChildId === "all"
                                        ? children.length
                                        : 1
                                }
                                icon={FaUserGraduate}
                                color="rose"
                                description="Included in report"
                            />
                        </div>

                        <section className="mt-6 grid gap-6 xl:grid-cols-2">
                            <ProgressChart
                                title="Quiz Score Trend"
                                subtitle="Scores from recent quiz attempts"
                                data={scoreChartData}
                                type="line"
                                dataKey="value"
                                xKey="name"
                            />

                            <ProgressChart
                                title="Child Performance"
                                subtitle="Average quiz score by child"
                                data={childPerformanceData}
                                type="bar"
                                dataKey="value"
                                xKey="name"
                            />
                        </section>

                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                    <FaAward />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Score Distribution
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Quiz attempts grouped by performance
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-5 md:grid-cols-3">
                                {scoreDistribution.map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-slate-700">
                                                {item.label}
                                            </p>

                                            <span className="text-xl font-bold text-slate-900">
                                                {item.value}
                                            </span>
                                        </div>

                                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className={`h-full rounded-full ${item.className}`}
                                                style={{
                                                    width: `${item.percentage}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="mt-2 text-right text-sm font-semibold text-slate-500">
                                            {item.percentage}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-5">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Quiz Attempt History
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Detailed results for every quiz attempt
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <TableHeading>Child</TableHeading>
                                            <TableHeading>Story and Quiz</TableHeading>
                                            <TableHeading align="center">
                                                Correct
                                            </TableHeading>
                                            <TableHeading align="center">
                                                Score
                                            </TableHeading>
                                            <TableHeading align="center">
                                                Result
                                            </TableHeading>
                                            <TableHeading>Time Taken</TableHeading>
                                            <TableHeading>Date</TableHeading>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paginatedReports.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-6 py-16 text-center"
                                                >
                                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                                                        <FaClipboardList />
                                                    </div>

                                                    <h3 className="mt-4 font-bold text-slate-700">
                                                        No quiz reports found
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Try changing the child, score or time
                                                        filters.
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedReports.map((report) => (
                                                <tr
                                                    key={report.id}
                                                    className="border-t border-slate-100 hover:bg-slate-50"
                                                >
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                                                {report.child_name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <span className="font-semibold text-slate-900">
                                                                {report.child_name}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="min-w-64 px-5 py-4">
                                                        <p className="font-semibold text-slate-900">
                                                            {report.quiz_title}
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {report.story_title}
                                                        </p>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-center font-medium">
                                                        {report.correct_answers} /{" "}
                                                        {report.total_questions}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-center">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getScoreStyle(
                                                                report.score
                                                            )}`}
                                                        >
                                                            {report.score}%
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-center">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${report.passed
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            {report.passed
                                                                ? "Passed"
                                                                : "Not Passed"}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                        {report.time_taken
                                                            ? `${report.time_taken} min`
                                                            : "-"}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                                                        {formatDate(report.attempted_at)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row">
                                    <p className="text-sm text-slate-500">
                                        Showing{" "}
                                        {(currentPage - 1) * reportsPerPage + 1} to{" "}
                                        {Math.min(
                                            currentPage * reportsPerPage,
                                            filteredReports.length
                                        )}{" "}
                                        of {filteredReports.length} reports
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
                                            disabled={currentPage === totalPages}
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
                        </section>
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

function TableHeading({
    children,
    align = "left",
}) {
    return (
        <th
            className={`whitespace-nowrap px-5 py-4 text-${align} text-xs font-bold uppercase tracking-wide text-slate-500`}
        >
            {children}
        </th>
    );
}

export default QuizReports;