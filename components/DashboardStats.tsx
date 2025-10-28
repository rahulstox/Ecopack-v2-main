'use client';

import {
    TrendingUp,
    TrendingDown,
    Leaf,
    Activity,
    Target,
    Zap
} from 'lucide-react';

interface DashboardStatsProps {
    stats: {
        totalCo2e?: number;
        totalActions?: number;
        thisMonthCo2e?: number;
        thisMonthActions?: number;
        categoryBreakdown?: Record<string, number>;
        averagePerAction?: number;
    };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const formatNumber = (num: number | undefined) => {
        const numValue = Number(num || 0);
        if (numValue >= 1000) {
            return `${(numValue / 1000).toFixed(2)}k`;
        }
        return numValue.toFixed(2);
    };

    const statCards = [
        {
            title: 'Total CO₂e',
            value: `${formatNumber(stats.totalCo2e)} kg`,
            subtitle: 'All time',
            icon: Leaf,
            color: 'green',
            trend: null,
        },
        {
            title: 'This Month',
            value: `${formatNumber(stats.thisMonthCo2e)} kg`,
            subtitle: 'CO₂e emissions',
            icon: Activity,
            color: 'blue',
            trend: (stats.thisMonthCo2e || 0) > 0 ? 'up' : null,
        },
        {
            title: 'Total Actions',
            value: stats.totalActions || 0,
            subtitle: `${stats.thisMonthActions || 0} this month`,
            icon: Target,
            color: 'purple',
            trend: null,
        },
        {
            title: 'Avg/Action',
            value: `${formatNumber(stats.averagePerAction)} kg`,
            subtitle: 'CO₂e per activity',
            icon: Zap,
            color: 'yellow',
            trend: null,
        },
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            green: 'bg-green-50 text-green-700',
            blue: 'bg-blue-50 text-blue-700',
            purple: 'bg-purple-50 text-purple-700',
            yellow: 'bg-yellow-50 text-yellow-700',
        };
        return colors[color as keyof typeof colors] || 'bg-gray-50 text-gray-700';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            {stat.trend && (
                                <div className={`flex items-center ${stat.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                </div>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm font-medium text-gray-700">{stat.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                    </div>
                );
            })}
        </div>
    );
}
