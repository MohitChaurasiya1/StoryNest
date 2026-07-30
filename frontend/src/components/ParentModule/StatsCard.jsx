import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

function StatsCard({
  title,
  value,
  icon: Icon,
  color = "rose",
  change,
  changeType = "increase",
  description,
}) {
  const colorClasses = {
    indigo:
      "bg-rose-100 text-rose-500 border-indigo-100 shadow-rose-100",
    emerald:
      "bg-emerald-100 text-emerald-600 border-emerald-100 shadow-emerald-100",
    blue: "bg-blue-100 text-blue-600 border-blue-100 shadow-blue-100",
    amber:
      "bg-amber-100 text-amber-600 border-amber-100 shadow-amber-100",
    rose: "bg-rose-100 text-rose-600 border-rose-100 shadow-rose-100",
    violet:
      "bg-violet-100 text-violet-600 border-violet-100 shadow-violet-100",
    cyan: "bg-cyan-100 text-cyan-600 border-cyan-100 shadow-cyan-100",
    teal: "bg-teal-100 text-teal-600 border-teal-100 shadow-teal-100",
  };

  const selectedColor = colorClasses[color] || colorClasses.rose;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${selectedColor}`}
        >
          {Icon && <Icon className="text-2xl" />}
        </div>
      </div>

      {(change || description) && (
        <div className="mt-5 flex items-center justify-between">
          {change ? (
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                changeType === "increase"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {changeType === "increase" ? (
                <FaArrowTrendUp />
              ) : (
                <FaArrowTrendDown />
              )}

              <span>{change}</span>
            </div>
          ) : (
            <span />
          )}

          {description && (
            <p className="text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default StatsCard;
