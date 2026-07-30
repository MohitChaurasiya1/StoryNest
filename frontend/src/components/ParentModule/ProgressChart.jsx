import { useState } from "react";

function ProgressChart({
    title = "Progress",
    subtitle,
    data = [],
    type = "line",
    dataKey = "value",
    xKey = "name",
    color = "#4F46E5",
    height = 320,
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
                <div className="flex h-[220px] items-center justify-center rounded-xl bg-slate-50 text-sm font-medium text-slate-400">
                    No activity data available yet
                </div>
            </div>
        );
    }

    const padding = 40;
    const chartWidth = 600;
    const chartHeight = Math.max(200, height - 80);

    const values = data.map((d) => Number(d[dataKey] ?? 0));
    const maxDataValue = Math.max(10, ...values);
    const maxValue = Math.ceil(maxDataValue * 1.1);
    const minValue = 0;

    const points = data.map((item, index) => {
        const x = padding + (index / Math.max(1, data.length - 1)) * (chartWidth - padding * 2);
        const y = chartHeight - padding - ((Number(item[dataKey] ?? 0) - minValue) / (maxValue - minValue)) * (chartHeight - padding * 2);
        return { x, y, item, index };
    });

    const pathD = points.length > 0
        ? points.reduce((acc, point, i) => `${acc} ${i === 0 ? "M" : "L"} ${point.x} ${point.y}`, "")
        : "";

    const areaD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
        : "";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
                {type === "bar" && (
                    <span className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                        Total: {values.reduce((a, b) => a + b, 0)}
                    </span>
                )}
            </div>

            <div className="relative w-full overflow-x-auto">
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-auto overflow-visible"
                    style={{ minHeight: `${height - 80}px` }}
                >
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Y-Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const yVal = chartHeight - padding - ratio * (chartHeight - padding * 2);
                        const numVal = Math.round(maxValue * ratio);
                        return (
                            <g key={i}>
                                <line
                                    x1={padding}
                                    y1={yVal}
                                    x2={chartWidth - padding}
                                    y2={yVal}
                                    stroke="#E2E8F0"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={padding - 8}
                                    y={yVal + 4}
                                    textAnchor="end"
                                    fill="#94A3B8"
                                    fontSize="10"
                                >
                                    {numVal}
                                </text>
                            </g>
                        );
                    })}

                    {/* Render Bar Chart */}
                    {type === "bar" &&
                        data.map((item, index) => {
                            const barWidth = Math.min(36, (chartWidth - padding * 2) / data.length - 8);
                            const x = padding + (index + 0.5) * ((chartWidth - padding * 2) / data.length) - barWidth / 2;
                            const barHeight = ((Number(item[dataKey] ?? 0)) / maxValue) * (chartHeight - padding * 2);
                            const y = chartHeight - padding - barHeight;

                            return (
                                <g
                                    key={index}
                                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={Math.max(4, barHeight)}
                                        fill={color}
                                        rx="6"
                                    />
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight - padding + 18}
                                        textAnchor="middle"
                                        fill="#64748B"
                                        fontSize="11"
                                        fontWeight="500"
                                    >
                                        {String(item[xKey] || "").slice(0, 8)}
                                    </text>
                                </g>
                            );
                        })}

                    {/* Render Area/Line Chart */}
                    {type !== "bar" && (
                        <>
                            {type === "area" && <path d={areaD} fill="url(#chartGradient)" />}
                            <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                            {points.map((pt, i) => (
                                <g
                                    key={i}
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={hoveredIndex === i ? "6" : "4"}
                                        fill={color}
                                        stroke="#FFFFFF"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={pt.x}
                                        y={chartHeight - padding + 18}
                                        textAnchor="middle"
                                        fill="#64748B"
                                        fontSize="11"
                                        fontWeight="500"
                                    >
                                        {String(pt.item[xKey] || "").slice(0, 8)}
                                    </text>
                                </g>
                            ))}
                        </>
                    )}
                </svg>

                {/* Hover Tooltip */}
                {hoveredIndex !== null && data[hoveredIndex] && (
                    <div className="absolute top-2 right-4 rounded-xl border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg">
                        <span className="font-bold">{data[hoveredIndex][xKey]}: </span>
                        <span className="text-rose-300 font-semibold">{data[hoveredIndex][dataKey]}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProgressChart;