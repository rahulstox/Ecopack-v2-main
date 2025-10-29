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
        if (isNaN(numValue) || numValue === 0) {
            return '0.00';
        }
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
            green: 'bg-gradient-to-br from-green-100 to-green-200 text-green-700 dark:from-green-600 dark:to-green-700 dark:text-white',
            blue: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 dark:from-blue-600 dark:to-blue-700 dark:text-white',
            purple: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 dark:from-purple-600 dark:to-purple-700 dark:text-white',
            yellow: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 dark:from-yellow-500 dark:to-yellow-600 dark:text-white',
        };
        return colors[color as keyof typeof colors] || 'bg-gray-50 text-gray-700';
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                const gradientClasses = {
                    green: 'from-green-500 to-emerald-600',
                    blue: 'from-blue-500 to-cyan-600',
                    purple: 'from-purple-500 to-pink-600',
                    yellow: 'from-yellow-400 to-orange-500',
                };
                return (
                    <div
                        key={index}
                        className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] overflow-hidden"
                    >
                        {/* Decorative gradient overlay */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientClasses[stat.color as keyof typeof gradientClasses]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                        <div className="relative">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradientClasses[stat.color as keyof typeof gradientClasses]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                {stat.trend && (
                                    <div className={`flex items-center ${stat.trend === 'up' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                                        {stat.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1 sm:mb-1.5 bg-clip-text">{stat.value}</h3>
                            <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-0.5 sm:mb-1">{stat.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.subtitle}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
