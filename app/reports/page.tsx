'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/Sidebar';

interface ReportData {
    totalCo2e: number;
    thisMonthCo2e: number;
    totalActions: number;
    categoryBreakdown: Record<string, number>;
    averagePerAction: number;
}

interface Suggestion {
    id: string;
    title: string;
    description: string;
    category: string;
    potentialReduction: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export default function ReportsPage() {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        if (isLoaded && user) {
            fetchReportData();
        }
    }, [isLoaded, user]);

    const fetchReportData = async () => {
        try {
            const response = await fetch('/api/dashboard-stats');
            const data = await response.json();

            if (data.success) {
                setReportData(data);
                generateSuggestions(data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSuggestions = (data: ReportData) => {
        const suggestionsArray: Suggestion[] = [];
        const categoryBreakdown = data.categoryBreakdown || {};
        const totalEmissions = data.totalCo2e || 0;

        // FOOD category suggestions
        if (categoryBreakdown['FOOD'] > 0 && categoryBreakdown['FOOD'] > 5) {
            suggestionsArray.push({
                id: 'food-1',
                title: 'Reduce Meat Consumption',
                description: 'Consider plant-based alternatives. Meat production has high CO₂ emissions.',
                category: 'FOOD',
                potentialReduction: 'Reduce by 50-70%',
                difficulty: 'medium'
            });

            suggestionsArray.push({
                id: 'food-2',
                title: 'Choose Local & Seasonal Food',
                description: 'Buy local produce to reduce transportation emissions.',
                category: 'FOOD',
                potentialReduction: 'Reduce by 10-15%',
                difficulty: 'easy'
            });
        }

        // TRANSPORT category suggestions
        if (categoryBreakdown['TRANSPORT'] > 0 && categoryBreakdown['TRANSPORT'] > 3) {
            suggestionsArray.push({
                id: 'transport-1',
                title: 'Switch to Public Transport',
                description: 'Use buses, trains, or carpooling instead of personal vehicles.',
                category: 'TRANSPORT',
                potentialReduction: 'Reduce by 60-80%',
                difficulty: 'medium'
            });

            suggestionsArray.push({
                id: 'transport-2',
                title: 'Walk or Cycle for Short Distances',
                description: 'Choose walking or cycling for trips under 5km.',
                category: 'TRANSPORT',
                potentialReduction: 'Reduce by 100%',
                difficulty: 'easy'
            });

            suggestionsArray.push({
                id: 'transport-3',
                title: 'Optimize Your Driving',
                description: 'Maintain steady speeds, avoid rapid acceleration, and keep tires properly inflated.',
                category: 'TRANSPORT',
                potentialReduction: 'Reduce by 10-20%',
                difficulty: 'easy'
            });
        }

        // ENERGY category suggestions
        if (categoryBreakdown['ENERGY'] > 0) {
            suggestionsArray.push({
                id: 'energy-1',
                title: 'Use Energy-Efficient Appliances',
                description: 'Replace old appliances with Energy Star certified ones.',
                category: 'ENERGY',
                potentialReduction: 'Reduce by 15-25%',
                difficulty: 'medium'
            });

            suggestionsArray.push({
                id: 'energy-2',
                title: 'Switch to LED Bulbs',
                description: 'LED bulbs use 75% less energy than traditional bulbs.',
                category: 'ENERGY',
                potentialReduction: 'Reduce by 75%',
                difficulty: 'easy'
            });
        }

        // General suggestions
        if (totalEmissions > 50) {
            suggestionsArray.push({
                id: 'general-1',
                title: 'Calculate Your Baseline',
                description: 'Track your emissions for at least one month to establish your baseline.',
                category: 'GENERAL',
                potentialReduction: 'Better awareness',
                difficulty: 'easy'
            });
        }

        if (suggestionsArray.length === 0) {
            suggestionsArray.push({
                id: 'start',
                title: 'Start Tracking Your Carbon Footprint',
                description: 'Begin logging your daily activities to get personalized suggestions.',
                category: 'GENERAL',
                potentialReduction: 'Build awareness',
                difficulty: 'easy'
            });
        }

        setSuggestions(suggestionsArray);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'FOOD': 'bg-green-100 text-green-800',
            'TRANSPORT': 'bg-blue-100 text-blue-800',
            'ENERGY': 'bg-yellow-100 text-yellow-800',
            'GENERAL': 'bg-purple-100 text-purple-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    if (!isLoaded) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Please sign in.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar totalCo2eSaved={reportData?.thisMonthCo2e || 0} />

                <div className="flex-1 ml-0 lg:ml-64">
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Emissions Report</h1>
                            <p className="text-gray-600 mt-1">Insights and recommendations to reduce your carbon footprint</p>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading report data...</div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                {reportData && (
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="bg-white rounded-lg shadow-lg p-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Total CO₂e Saved</p>
                                                    <p className="text-2xl font-bold text-gray-900">{(reportData.totalCo2e || 0).toFixed(2)} kg</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow-lg p-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">This Month</p>
                                                    <p className="text-2xl font-bold text-gray-900">{(reportData.thisMonthCo2e || 0).toFixed(2)} kg</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow-lg p-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Total Actions</p>
                                                    <p className="text-2xl font-bold text-gray-900">{reportData.totalActions || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Category Breakdown */}
                                {reportData && Object.keys(reportData.categoryBreakdown || {}).length > 0 && (
                                    <div className="bg-white rounded-lg shadow-lg p-6">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Emissions by Category</h2>
                                        <div className="space-y-3">
                                            {Object.entries(reportData.categoryBreakdown)
                                                .filter(([_, value]) => value > 0)
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([category, value]) => (
                                                    <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(category)}`}>
                                                                {category}
                                                            </span>
                                                            <p className="font-semibold text-gray-900">{category}</p>
                                                        </div>
                                                        <p className="font-bold text-green-600">{value.toFixed(2)} kg CO₂e</p>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
                                    </div>

                                    {suggestions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Start logging your actions to get personalized suggestions</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {suggestions.map((suggestion) => (
                                                <div key={suggestion.id} className="border border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(suggestion.difficulty)}`}>
                                                            {suggestion.difficulty}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mb-3">{suggestion.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(suggestion.category)}`}>
                                                            {suggestion.category}
                                                        </span>
                                                        <span className="text-sm font-semibold text-green-600">{suggestion.potentialReduction}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

