'use client';

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryBreakdownChartProps {
    categoryBreakdown: Record<string, number>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

// Custom label renderer for pie chart to prevent overlapping
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;

    // Position all labels outside the pie chart to prevent overlapping
    const labelRadius = outerRadius + 30; // 30px padding outside the pie
    const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN);

    // Determine text anchor based on position relative to center
    const textAnchor = labelX > cx ? 'start' : 'end';

    // Format percentage
    const percentage = (percent * 100).toFixed(0);

    // Only show label if it's at least 1%
    if (percent < 0.01) {
        return null;
    }

    return (
        <g>
            <text
                x={labelX}
                y={labelY}
                fill="currentColor"
                textAnchor={textAnchor}
                dominantBaseline="central"
                className="text-xs font-semibold fill-gray-900 dark:fill-gray-100"
                style={{ fontWeight: 600 }}
            >
                {`${name}: ${percentage}%`}
            </text>
        </g>
    );
};

// Custom labelLine renderer for better visibility
const renderCustomLabelLine = ({ cx, cy, midAngle, innerRadius, outerRadius }: any) => {
    const RADIAN = Math.PI / 180;
    const x1 = cx + (outerRadius - 5) * Math.cos(-midAngle * RADIAN);
    const y1 = cy + (outerRadius - 5) * Math.sin(-midAngle * RADIAN);
    const x2 = cx + (outerRadius + 15) * Math.cos(-midAngle * RADIAN);
    const y2 = cy + (outerRadius + 15) * Math.sin(-midAngle * RADIAN);

    return (
        <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={1.5}
            className="stroke-gray-400 dark:stroke-gray-500"
        />
    );
};

export function CategoryBreakdownChart({ categoryBreakdown }: CategoryBreakdownChartProps) {
    const chartData = Object.entries(categoryBreakdown)
        .map(([key, value]) => ({
            name: key,
            value: parseFloat(Number(value || 0).toFixed(2)),
        }))
        .filter(item => item.value > 0) // Only show categories with data
        .sort((a, b) => b.value - a.value); // Sort by value descending

    const totalEmissions = Object.values(categoryBreakdown).reduce((sum, val) => sum + (val || 0), 0);

    // If no data, show empty state
    if (chartData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 green:bg-green-100 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Category Breakdown</h2>
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">No emissions data yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start logging actions to see breakdown charts</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 green:bg-green-100 rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">CO₂e by Category</h2>
                <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#10b981" name="CO₂e (kg)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 green:bg-green-100 rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Emissions Distribution</h2>
                <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={renderCustomLabelLine}
                            label={renderCustomLabel}
                            outerRadius={65}
                            innerRadius={0}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                            minAngle={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number, name: string) => [`${value.toFixed(2)} kg CO₂e`, name]}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '8px 12px',
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => value}
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
