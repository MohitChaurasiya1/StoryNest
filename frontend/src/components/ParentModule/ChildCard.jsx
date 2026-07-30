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
    FaStar,
    FaHeart,
    FaMagic,
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

    const isEmojiAvatar = child?.avatar && typeof child?.avatar === 'string' && child?.avatar.length <= 4;

    return (
        <div className="group relative rounded-3xl border border-rose-100/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-xl shadow-rose-500/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-500/10">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-rose-400/20 to-purple-500/20 blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                    <div className="h-16 w-16 min-w-[64px] rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-400 to-purple-600 p-0.5 shadow-md shadow-rose-500/20">
                        {isEmojiAvatar ? (
                            <div className="h-full w-full rounded-[14px] bg-white dark:bg-slate-800 flex items-center justify-center text-3xl">
                                {child.avatar}
                            </div>
                        ) : (
                            <img
                                src={
                                    child?.avatar ||
                                    "https://ui-avatars.com/api/?length=2&bold=true&background=ff6b6b&color=fff&name=" +
                                    encodeURIComponent(child?.name || "Child")
                                }
                                alt={child?.name}
                                className="h-full w-full rounded-[14px] object-cover"
                            />
                        )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] text-white font-black shadow">
                        ★
                    </span>
                </div>

                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <h2 className="truncate text-lg font-extrabold text-slate-900 dark:text-white" title={child?.name}>
                            {child?.name}
                        </h2>
                    </div>

                    <p className="text-xs font-semibold text-slate-400">
                        {child?.age ? `${child.age} Years Old` : "Young Reader"}
                    </p>

                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/60 dark:to-orange-950/60 px-3 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                        ✨ {child?.reading_level || "Beginner"}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 relative z-10">
                <div className="rounded-2xl bg-rose-50/70 dark:bg-slate-800/60 border border-rose-100/70 dark:border-slate-700/60 p-3 transition-transform duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <FaBookOpen className="text-xs" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">
                            Stories
                        </span>
                    </div>

                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                        {storiesRead}
                    </p>
                </div>

                <div className="rounded-2xl bg-teal-50/70 dark:bg-slate-800/60 border border-teal-100/70 dark:border-slate-700/60 p-3 transition-transform duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                        <FaGraduationCap className="text-xs" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">
                            Quiz Avg
                        </span>
                    </div>

                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                        {quizAverage}%
                    </p>
                </div>
            </div>

            {/* Overall Progress */}
            <div className="mt-5 relative z-10">
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <FaChartLine className="text-purple-500" />
                        Reading Progress
                    </span>

                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                        {progress}%
                    </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 transition-all duration-500"
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </div>
            </div>

            {/* Extra Details */}
            <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 relative z-10">
                {child?.favourite_animal && (
                    <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400">Favorite Animal</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                            {child.favourite_animal}
                        </span>
                    </div>
                )}

                {child?.learning_goals && (
                    <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400">Learning Goal</span>
                        <span className="max-w-[170px] truncate font-bold text-slate-800 dark:text-slate-200" title={child.learning_goals}>
                            {child.learning_goals}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-20">
                <div className="flex items-center gap-2">
                    <Link
                        to={`/parent/children/${child?.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-rose-500/30"
                    >
                        <FaEye />
                        View Profile
                    </Link>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onEdit(child); }}
                        className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-slate-800"
                        title="Edit Child Profile"
                    >
                        <FaEdit className="text-xs" />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(child); }}
                        className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 text-red-500 transition hover:bg-red-50 dark:hover:bg-slate-800"
                        title="Delete Child Profile"
                    >
                        <FaTrash className="text-xs" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleDownloadPdf}
                        className="flex items-center justify-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/50 px-2 py-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-100"
                        title="Download Certificate PDF"
                    >
                        <FaFilePdf />
                        PDF
                    </button>
                    <Link
                        to={`/parent/achievements?child=${child?.id}`}
                        className="flex items-center justify-center gap-1 rounded-xl border border-amber-200/80 dark:border-amber-900 bg-amber-50/80 dark:bg-amber-950/50 px-2 py-2 text-[11px] font-bold text-amber-700 dark:text-amber-300 transition hover:bg-amber-100"
                        title="View Achievements"
                    >
                        <FaAward />
                        Badges
                    </Link>
                    <Link
                        to={`/parent/certificates?child=${child?.id}`}
                        className="flex items-center justify-center gap-1 rounded-xl border border-purple-200/80 dark:border-purple-900 bg-purple-50/80 dark:bg-purple-950/50 px-2 py-2 text-[11px] font-bold text-purple-700 dark:text-purple-300 transition hover:bg-purple-100"
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