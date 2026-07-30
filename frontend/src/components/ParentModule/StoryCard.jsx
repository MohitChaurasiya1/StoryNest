import {
    FaBookOpen,
    FaDownload,
    FaHeart,
    FaRegHeart,
    FaClock,
    FaQuestionCircle,
    FaLanguage,
} from "react-icons/fa";

function StoryCard({
    story,
    onFavourite,
    onRead,
    onDownload,
    onQuiz,
}) {
    const completion = story?.completion_percentage || 0;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            {/* Cover */}
            <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <img
                    src={
                        story?.cover_image ||
                        "https://placehold.co/600x400/E0E7FF/4F46E5?text=StoryNest"
                    }
                    alt={story?.title_en}
                    className="h-full w-full object-cover"
                />

                <button
                    onClick={() => onFavourite?.(story)}
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
                >
                    {story?.is_favourite ? (
                        <FaHeart className="text-red-500" />
                    ) : (
                        <FaRegHeart className="text-slate-500" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-5">
                <h2 className="line-clamp-2 text-xl font-bold text-slate-900">
                    {story?.title_en}
                </h2>

                {story?.title_hi && (
                    <p className="mt-1 text-sm text-slate-500">
                        {story.title_hi}
                    </p>
                )}

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                        <span>Child</span>
                        <span className="font-semibold">
                            {story?.child_name}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FaLanguage />
                            Language
                        </span>

                        <span className="font-semibold">
                            {story?.language || "English"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FaClock />
                            Reading Time
                        </span>

                        <span className="font-semibold">
                            {story?.reading_time || "10 min"}
                        </span>
                    </div>
                </div>

                {/* Progress */}
                <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600">
                            Progress
                        </span>

                        <span className="font-bold text-rose-500">
                            {completion}%
                        </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all"
                            style={{
                                width: `${completion}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        onClick={() => onRead?.(story)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-3 font-bold text-white transition hover:from-rose-600 hover:to-amber-600 shadow-md shadow-rose-500/20"
                    >
                        <FaBookOpen />
                        Read
                    </button>

                    <button
                        onClick={() => onDownload?.(story)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold transition hover:bg-slate-100"
                    >
                        <FaDownload />
                        PDF
                    </button>

                    <button
                        onClick={() => onQuiz?.(story)}
                        className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-bold text-rose-600 transition hover:bg-rose-100"
                    >
                        <FaQuestionCircle />
                        View Quiz
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StoryCard;