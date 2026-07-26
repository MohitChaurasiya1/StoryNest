import {
    FaBookOpen,
    FaChartLine,
    FaEdit,
    FaEye,
    FaGraduationCap,
    FaTrash,
    FaFilePdf,
    FaAward,
    FaCertificate,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { generateCertificatePDF } from "../../utils/pdfGenerator";

function ChildCard({
    child,
    onEdit,
    onDelete,
}) {
    const progress = child?.completion_percentage || 0;
    const quizAverage = child?.quiz_average || 0;
    const storiesRead = child?.stories_read || 0;

    const handleDownloadPdf = () => {
        generateCertificatePDF({
            child_name: child?.name || "Young Reader",
            title_en: "Super Reader Certificate",
            moral: child?.learning_goals || "Outstanding Reading Progress",
            created_at: new Date().toISOString(),
        });
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <img
                    src={
                        child?.avatar ||
                        "https://ui-avatars.com/api/?length=2&bold=true&background=6366f1&color=fff&name=" +
                        encodeURIComponent(child?.name || "Child")
                    }
                    alt={child?.name}
                    className="h-16 w-16 min-w-[64px] rounded-full border-2 border-indigo-100 object-cover shadow-sm"
                />

                <div className="flex-1 overflow-hidden">
                    <h2 className="truncate text-lg font-bold text-slate-900" title={child?.name}>
                        {child?.name}
                    </h2>

                    <p className="text-xs text-slate-500">
                        {child?.age} Years
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                        {child?.reading_level || "Beginner"}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-1.5 text-indigo-600">
                        <FaBookOpen className="text-xs" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                            Stories
                        </span>
                    </div>

                    <p className="mt-1 text-xl font-bold text-slate-800">
                        {storiesRead}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                        <FaGraduationCap className="text-xs" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                            Quiz Avg
                        </span>
                    </div>

                    <p className="mt-1 text-xl font-bold text-slate-800">
                        {quizAverage}%
                    </p>
                </div>
            </div>

            {/* Progress */}
            <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <FaChartLine className="text-indigo-500" />
                        Overall Progress
                    </span>

                    <span className="text-xs font-bold text-indigo-600">
                        {progress}%
                    </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all"
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </div>
            </div>

            {/* Extra Details */}
            <div className="mt-5 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                    <span>Favourite Animal</span>
                    <span className="font-semibold text-slate-800">
                        {child?.favourite_animal || "-"}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Favourite Colour</span>
                    <span className="font-semibold text-slate-800">
                        {child?.favourite_colour || "-"}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Learning Goal</span>
                    <span className="max-w-[170px] truncate font-semibold text-slate-800" title={child?.learning_goals}>
                        {child?.learning_goals || "-"}
                    </span>
                </div>
            </div>

            {/* Structured 2-Row Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <Link
                        to={`/parent/children/${child?.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-sm"
                    >
                        <FaEye />
                        View Profile
                    </Link>

                    <button
                        onClick={() => onEdit(child)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 text-indigo-600 transition hover:bg-indigo-50"
                        title="Edit Child Profile"
                    >
                        <FaEdit className="text-xs" />
                    </button>

                    <button
                        onClick={() => onDelete(child)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50"
                        title="Delete Child Profile"
                    >
                        <FaTrash className="text-xs" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleDownloadPdf}
                        className="flex items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        title="Download Certificate PDF"
                    >
                        <FaFilePdf />
                        PDF
                    </button>
                    <Link
                        to={`/parent/achievements?child=${child?.id}`}
                        className="flex items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100"
                        title="View Achievements"
                    >
                        <FaAward />
                        Badges
                    </Link>
                    <Link
                        to={`/parent/certificates?child=${child?.id}`}
                        className="flex items-center justify-center gap-1 rounded-xl border border-purple-200 bg-purple-50 px-2 py-1.5 text-[11px] font-semibold text-purple-700 transition hover:bg-purple-100"
                        title="View Certificates"
                    >
                        <FaCertificate />
                        Certs
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ChildCard;