import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    AreaChart,
    Area,
    BarChart,
    Bar,
} from "recharts";

const chartTypes = {
    line: LineChart,
    area: AreaChart,
    bar: BarChart,
};

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
    const Chart = chartTypes[type] || LineChart;

    const renderChart = () => {
        switch (type) {
            case "area":
                return (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="progressGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={color}
                                    stopOpacity={0.45}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={color}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey={xKey} />

                        <YAxis />

                        <Tooltip />

                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            fill="url(#progressGradient)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                );

            case "bar":
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey={xKey} />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey={dataKey}
                            radius={[8, 8, 0, 0]}
                            fill={color}
                        />
                    </BarChart>
                );

            default:
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey={xKey} />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 7 }}
                        />
                    </LineChart>
                );
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                    {title}
                </h2>

                {subtitle && (
                    <p className="mt-1 text-sm text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>

            <div style={{ width: "100%", height }}>
                <ResponsiveContainer>
                    <Chart data={data}>
                        {renderChart().props.children}
                    </Chart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default ProgressChart;