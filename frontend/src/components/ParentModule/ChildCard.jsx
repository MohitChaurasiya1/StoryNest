import {
    FaBookOpen,
    FaChartLine,
    FaEdit,
    FaEye,
    FaGraduationCap,
    FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function ChildCard({
    child,
    onEdit,
    onDelete,
}) {
    const progress = child?.completion_percentage || 0;
    const quizAverage = child?.quiz_average || 0;
    const storiesRead = child?.stories_read || 0;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <img
                    src={
                        child?.avatar ||
                        "https://ui-avatars.com/api/?background=6366f1&color=fff&name=" +
                        encodeURIComponent(child?.name || "Child")
                    }
                    alt={child?.name}
                    className="h-20 w-20 rounded-full border-4 border-indigo-100 object-cover"
                />

                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">
                        {child?.name}
                    </h2>

                    <p className="text-sm text-slate-500">
                        {child?.age} Years
                    </p>

                    <span className="mt-2 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {child?.reading_level || "Beginner"}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <FaBookOpen />
                        <span className="text-xs font-semibold uppercase">
                            Stories
                        </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold">
                        {storiesRead}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <FaGraduationCap />
                        <span className="text-xs font-semibold uppercase">
                            Quiz Avg
                        </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold">
                        {quizAverage}%
                    </p>
                </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <FaChartLine />
                        Overall Progress
                    </span>

                    <span className="text-sm font-bold text-indigo-600">
                        {progress}%
                    </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all"
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </div>
            </div>

            {/* Extra Details */}
            <div className="mt-6 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                    <span>Favourite Animal</span>
                    <span className="font-semibold">
                        {child?.favourite_animal || "-"}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Favourite Colour</span>
                    <span className="font-semibold">
                        {child?.favourite_colour || "-"}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Learning Goal</span>
                    <span className="font-semibold text-right">
                        {child?.learning_goals || "-"}
                    </span>
                </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-3">
                <Link
                    to={`/parent/children/${child?.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                    <FaEye />
                    View
                </Link>

                <button
                    onClick={() => onEdit(child)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 text-indigo-600 transition hover:bg-indigo-50"
                >
                    <FaEdit />
                </button>

                <button
                    onClick={() => onDelete(child)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
}

export default ChildCard;