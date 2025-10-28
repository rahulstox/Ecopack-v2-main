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

interface RecommendationReport {
    id: number;
    userid: string;
    form_input: any;
    ai_output: any;
    carbon_score: number;
    created_at: string;
}

export default function ReportsPage() {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [recommendationReports, setRecommendationReports] = useState<RecommendationReport[]>([]);
    const [activeTab, setActiveTab] = useState<'emissions' | 'recommendations'>('emissions');

    useEffect(() => {
        if (isLoaded && user) {
            fetchReportData();
        }
    }, [isLoaded, user]);

    const fetchReportData = async () => {
        try {
            const [statsResponse, recResponse] = await Promise.all([
                fetch('/api/dashboard-stats'),
                fetch('/api/recommendations/user')
            ]);

            const statsData = await statsResponse.json();
            const recData = await recResponse.json();

            if (statsData.success) {
                setReportData(statsData);
                generateSuggestions(statsData);
            }

            if (recData.success) {
                setRecommendationReports(recData.data || []);
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 green:bg-green-50">
            <div className="flex">
                <Sidebar totalCo2eSaved={reportData?.thisMonthCo2e || 0} />

                <div className="flex-1 ml-0 lg:ml-64">
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white green:text-gray-900">Reports</h1>
                                <p className="text-gray-600 dark:text-gray-400 green:text-gray-700 mt-1">View your emissions data and packaging recommendations</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab('emissions')}
                                    className={`pb-4 px-2 font-semibold transition-colors ${activeTab === 'emissions'
                                        ? 'border-b-2 border-green-600 text-green-600'
                                        : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Emissions Report
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('recommendations')}
                                    className={`pb-4 px-2 font-semibold transition-colors flex items-center gap-2 ${activeTab === 'recommendations'
                                        ? 'border-b-2 border-green-600 text-green-600'
                                        : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Packaging Recommendations ({recommendationReports.length})
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading report data...</div>
                        ) : activeTab === 'recommendations' ? (
                            <>
                                {recommendationReports.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                                        <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Recommendation Reports Yet</h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">Generate your first packaging recommendation to view reports here.</p>
                                        <a href="/recommend" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Get Recommendation
                                        </a>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {recommendationReports.map((report) => {
                                            const formInput = report.form_input;
                                            const aiOutput = report.ai_output;
                                            const date = new Date(report.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            });

                                            return (
                                                <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                                {formInput.product_category || 'Package Recommendation'}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">{date}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                                                            <span className="text-xs font-semibold">Score: {report.carbon_score}/5</span>
                                                        </div>
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Weight</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{formInput.product_weight}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Fragility</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{formInput.fragility_level}</p>
                                                        </div>
                                                    </div>

                                                    {/* Recommended Materials */}
                                                    {aiOutput.recommended_materials && (
                                                        <div className="mb-4">
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Recommended Materials:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {aiOutput.recommended_materials.slice(0, 2).map((material: string, idx: number) => (
                                                                    <span key={idx} className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                                                                        {material}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Key Stats */}
                                                    <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-t border-b border-gray-200 dark:border-gray-700">
                                                        <div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Cost</p>
                                                            <p className="font-bold text-gray-900 dark:text-white">
                                                                ₹{aiOutput.estimated_cost || aiOutput.cost_comparison?.sustainable_cost || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">CO2 Emissions</p>
                                                            <p className="font-bold text-green-600">
                                                                {aiOutput.carbon_footprint?.total_carbon_kg
                                                                    ? `${parseFloat(aiOutput.carbon_footprint.total_carbon_kg.toString()).toFixed(2)} kg`
                                                                    : '0.96 kg'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                // Redirect to recommend page with the recommendation ID
                                                                window.location.href = `/recommend?view=${report.id}`;
                                                            }}
                                                            className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                                                        >
                                                            View Full Report
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                // Generate PDF for this report
                                                                const jsPDF = (await import('jspdf')).default;
                                                                const doc = new jsPDF();
                                                                // ... PDF generation code (reuse from handleExportReport)
                                                                alert('PDF export functionality will be added here');
                                                            }}
                                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                                                        >
                                                            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                {reportData && (
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="bg-white dark:bg-gray-800 green:bg-green-100 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 green:bg-green-200 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total CO₂e Saved</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(reportData.totalCo2e || 0).toFixed(2)} kg</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(reportData.thisMonthCo2e || 0).toFixed(2)} kg</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Actions</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.totalActions || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Category Breakdown */}
                                {reportData && Object.keys(reportData.categoryBreakdown || {}).length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Emissions by Category</h2>
                                        <div className="space-y-3">
                                            {Object.entries(reportData.categoryBreakdown)
                                                .filter(([_, value]) => value > 0)
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([category, value]) => (
                                                    <div key={category} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(category)}`}>
                                                                {category}
                                                            </span>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{category}</p>
                                                        </div>
                                                        <p className="font-bold text-green-600 dark:text-green-400">{value.toFixed(2)} kg CO₂e</p>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-6">
                                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personalized Recommendations</h2>
                                    </div>

                                    {suggestions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <p>Start logging your actions to get personalized suggestions</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {suggestions.map((suggestion) => (
                                                <div key={suggestion.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-green-500 transition-colors bg-gray-50 dark:bg-gray-700">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{suggestion.title}</h3>
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(suggestion.difficulty)}`}>
                                                            {suggestion.difficulty}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 mb-3">{suggestion.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(suggestion.category)}`}>
                                                            {suggestion.category}
                                                        </span>
                                                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">{suggestion.potentialReduction}</span>
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

