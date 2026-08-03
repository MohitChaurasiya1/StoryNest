import {
  FaCheckCircle,
  FaLock,
  FaMedal,
  FaStar,
  FaTrophy,
} from "react-icons/fa";

const badgeColors = {
  BOOKWORM: "from-blue-500 to-sky-600",
  EXPLORER: "from-green-500 to-emerald-600",
  BILINGUAL: "from-purple-500 to-violet-600",
  NIGHT_OWL: "from-slate-700 to-slate-900",
  STORYTELLER: "from-pink-500 to-rose-600",
  CHAMPION: "from-amber-500 to-orange-500",
  QUIZ_MASTER: "from-cyan-500 to-sky-600",
};

const badgeIcons = {
  BOOKWORM: FaMedal,
  EXPLORER: FaStar,
  BILINGUAL: FaStar,
  NIGHT_OWL: FaStar,
  STORYTELLER: FaMedal,
  CHAMPION: FaTrophy,
  QUIZ_MASTER: FaTrophy,
};

function AchievementCard({ achievement, onClick }) {
  const unlocked =
    achievement?.unlocked ??
    achievement?.is_unlocked ??
    achievement?.earned ??
    false;

  const BadgeIcon = badgeIcons[achievement?.code] || FaMedal;
  const badgeGradient =
    badgeColors[achievement?.code] || "from-rose-500 to-amber-500";

  return (
    <div
      onClick={() => onClick?.(achievement)}
      className={`group rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        unlocked
          ? "border-rose-200 dark:border-rose-900/60"
          : "border-slate-200 dark:border-slate-800 opacity-90"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${badgeGradient} text-white shadow-lg`}
        >
          <BadgeIcon className="text-4xl" />
        </div>

        {unlocked ? (
          <div className="flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <FaCheckCircle />
            Unlocked
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-black/70 dark:text-white/80">
            <FaLock />
            Locked
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-black dark:text-white">
          {achievement?.title || achievement?.name || "Achievement"}
        </h2>

        <p className="mt-2 text-sm leading-6 font-medium text-black/80 dark:text-white">
          {achievement?.description || "No description available."}
        </p>
      </div>

      {!unlocked && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-bold text-black dark:text-white">Progress</span>
            <span className="font-bold text-rose-500">
              {achievement?.progress || 0}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all"
              style={{
                width: `${achievement?.progress || 0}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
        {unlocked ? (
          <div className="flex justify-between text-sm">
            <span className="font-medium text-black/70 dark:text-white/80">Earned On</span>
            <span className="font-bold text-black dark:text-white">
              {achievement?.earned_date || achievement?.date_awarded || "-"}
            </span>
          </div>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="font-medium text-black/70 dark:text-white/80">Target</span>
            <span className="font-bold text-rose-500">
              {achievement?.target || "-"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AchievementCard;
