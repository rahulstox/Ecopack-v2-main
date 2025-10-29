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

                <div className="flex-1 ml-0 lg:ml-64 relative pt-16 lg:pt-0">
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white green:text-gray-900 mb-2">Emissions & Sustainability Reports</h1>
                                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 green:text-gray-700">
                                    Comprehensive analytics and actionable insights to reduce your carbon footprint
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b-2 border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 overflow-x-auto -mx-4 sm:mx-0">
                            <div className="flex gap-3 sm:gap-6 px-4 sm:px-0 min-w-max sm:min-w-0">
                                <button
                                    onClick={() => setActiveTab('emissions')}
                                    className={`pb-3 sm:pb-4 px-1 font-semibold text-sm sm:text-base transition-all relative whitespace-nowrap ${activeTab === 'emissions'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 sm:gap-2.5">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span>Emissions Report</span>
                                    </div>
                                    {activeTab === 'emissions' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-full"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('recommendations')}
                                    className={`pb-3 sm:pb-4 px-1 font-semibold text-sm sm:text-base transition-all relative flex items-center gap-2 sm:gap-2.5 whitespace-nowrap ${activeTab === 'recommendations'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span className="hidden xs:inline">Packaging Recommendations</span>
                                    <span className="xs:hidden">Packaging</span>
                                    {recommendationReports.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                                            {recommendationReports.length}
                                        </span>
                                    )}
                                    {activeTab === 'recommendations' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-full"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading report data...</div>
                        ) : activeTab === 'recommendations' ? (
                            <>
                                {recommendationReports.length === 0 ? (
                                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                        <div className="max-w-md mx-auto">
                                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                                                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 sm:mb-3">No Packaging Recommendations Yet</h2>
                                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                                                Get AI-powered packaging recommendations tailored to your products. Our system analyzes your product specifications and suggests the most sustainable, cost-effective packaging solutions.
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-6 sm:mb-8">
                                                Each recommendation includes detailed carbon footprint analysis, cost comparisons, and material suggestions.
                                            </p>
                                            <a
                                                href="/recommend"
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                            >
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Get Your First Recommendation
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Summary Info */}
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800 mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-500 rounded-lg p-2">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {recommendationReports.length} {recommendationReports.length === 1 ? 'Recommendation' : 'Recommendations'} Generated
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        AI-powered packaging solutions tailored to your specific needs
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recommendations Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            {recommendationReports.map((report) => {
                                                const formInput = report.form_input;
                                                const aiOutput = report.ai_output;
                                                const date = new Date(report.created_at);
                                                const formattedDate = date.toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                });
                                                const formattedTime = date.toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });

                                                const carbonFootprint = aiOutput.carbon_footprint?.total_carbon_kg
                                                    ? parseFloat(aiOutput.carbon_footprint.total_carbon_kg.toString()).toFixed(2)
                                                    : '0.96';
                                                const estimatedCost = aiOutput.estimated_cost || aiOutput.cost_comparison?.sustainable_cost || 'N/A';

                                                // Get carbon score color
                                                const getScoreColor = (score: number) => {
                                                    if (score >= 4) return 'from-green-500 to-emerald-600';
                                                    if (score >= 3) return 'from-yellow-500 to-orange-600';
                                                    return 'from-red-500 to-pink-600';
                                                };

                                                return (
                                                    <div key={report.id} className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600">
                                                        {/* Header */}
                                                        <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-1.5">
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                        </svg>
                                                                    </div>
                                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                                        {formInput.product_category || 'Package Recommendation'}
                                                                    </h3>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                                    <span className="flex items-center gap-1">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                        {formattedDate}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>{formattedTime}</span>
                                                                </div>
                                                            </div>
                                                            <div className={`bg-gradient-to-r ${getScoreColor(report.carbon_score)} text-white px-4 py-2 rounded-xl shadow-lg ml-4`}>
                                                                <div className="text-center">
                                                                    <p className="text-xs font-medium opacity-90">Carbon Score</p>
                                                                    <p className="text-2xl font-extrabold">{report.carbon_score}/5</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Product Details Section */}
                                                        <div className="mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Product Specifications</p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Product Weight</p>
                                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                                        {formInput.product_weight || 'Not specified'}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fragility Level</p>
                                                                    <p className="font-bold text-gray-900 dark:text-white text-sm capitalize">
                                                                        {formInput.fragility_level || 'Not specified'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {formInput.dimensions && (
                                                                <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dimensions</p>
                                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                                        {formInput.dimensions.length} × {formInput.dimensions.width} × {formInput.dimensions.height} {formInput.dimensions.unit || 'cm'}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Recommended Materials */}
                                                        {aiOutput.recommended_materials && aiOutput.recommended_materials.length > 0 && (
                                                            <div className="mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Recommended Materials</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {aiOutput.recommended_materials.slice(0, 3).map((material: string, idx: number) => (
                                                                        <span key={idx} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-green-200 dark:border-green-800">
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                            {material}
                                                                        </span>
                                                                    ))}
                                                                    {aiOutput.recommended_materials.length > 3 && (
                                                                        <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400 px-2">
                                                                            +{aiOutput.recommended_materials.length - 3} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                                                                    These materials are optimized for your product's weight, dimensions, and fragility requirements while minimizing environmental impact.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Key Metrics */}
                                                        <div className="mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Key Metrics</p>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Estimated Cost</p>
                                                                    </div>
                                                                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                                                        ₹{estimatedCost}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per unit</p>
                                                                </div>
                                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 6 6 0 0012 0 2 2 0 012-2v-1a2 2 0 012-2h1.945M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">CO₂ Emissions</p>
                                                                    </div>
                                                                    <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                                                                        {carbonFootprint} <span className="text-sm text-gray-500">kg</span>
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Carbon footprint</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    window.location.href = `/recommend?view=${report.id}`;
                                                                }}
                                                                className="flex-1 group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                View Full Analysis
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    const jsPDF = (await import('jspdf')).default;
                                                                    const doc = new jsPDF();
                                                                    alert('PDF export functionality will be added here');
                                                                }}
                                                                className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                                                                title="Export to PDF"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                {reportData && (
                                    <>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total CO₂e Saved</p>
                                                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                                                {(reportData.totalCo2e || 0).toFixed(2)} <span className="text-lg text-gray-500">kg</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        <span className="font-semibold text-green-700 dark:text-green-300">Estimated impact:</span> Equivalent to planting approximately {Math.round((reportData.totalCo2e || 0) * 7)} trees or driving {(reportData.totalCo2e || 0) * 37.5} fewer miles.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                                                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                                                {(reportData.thisMonthCo2e || 0).toFixed(2)} <span className="text-lg text-gray-500">kg</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-600 dark:text-gray-400">Progress this month</span>
                                                        <span className="font-semibold text-blue-700 dark:text-blue-300">
                                                            {reportData.thisMonthCo2e > 0 ? '📈 On track' : '📊 Getting started'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-800 hover:shadow-xl transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Actions Logged</p>
                                                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{reportData.totalActions || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        <span className="font-semibold text-purple-700 dark:text-purple-300">Average per action:</span> {reportData.averagePerAction ? `${(reportData.averagePerAction || 0).toFixed(2)} kg CO₂e` : 'Calculating...'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Banner */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Understanding CO₂e</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        CO₂e (Carbon Dioxide Equivalent) measures the total greenhouse gas emissions, accounting for the global warming potential of all gases. This metric helps you understand your complete environmental impact in a single, comparable unit.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Category Breakdown */}
                                {reportData && Object.keys(reportData.categoryBreakdown || {}).length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Emissions by Category</h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Breakdown of your carbon footprint across different activity categories
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {Object.entries(reportData.categoryBreakdown)
                                                .filter(([_, value]) => value > 0)
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([category, value]) => {
                                                    const total = Object.values(reportData.categoryBreakdown || {}).reduce((sum: number, val: any) => sum + val, 0);
                                                    const percentage = total > 0 ? (value / total) * 100 : 0;
                                                    const categoryInfo: Record<string, { icon: string; description: string; color: string }> = {
                                                        'FOOD': { icon: '🍽️', description: 'Emissions from food production, transportation, and preparation', color: 'green' },
                                                        'TRANSPORT': { icon: '🚗', description: 'Emissions from vehicles, flights, and transportation methods', color: 'blue' },
                                                        'ENERGY': { icon: '⚡', description: 'Emissions from electricity, heating, and energy consumption', color: 'yellow' },
                                                        'WASTE': { icon: '🗑️', description: 'Emissions from waste disposal and recycling processes', color: 'orange' },
                                                    };
                                                    const info = categoryInfo[category] || { icon: '📊', description: 'Emissions from this category', color: 'gray' };

                                                    return (
                                                        <div key={category} className="group bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow-md">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <div className="text-3xl">{info.icon}</div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-1">
                                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category}</h3>
                                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(category)}`}>
                                                                                {category}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{info.description}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <p className="text-xl font-extrabold text-green-600 dark:text-green-400 mb-1">
                                                                        {value.toFixed(2)} <span className="text-sm text-gray-500">kg CO₂e</span>
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {percentage.toFixed(1)}% of total
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {/* Progress Bar */}
                                                            <div className="mt-4">
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${category === 'FOOD' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                                                            category === 'TRANSPORT' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                                                                                category === 'ENERGY' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                                                                                    'bg-gradient-to-r from-purple-500 to-pink-600'
                                                                            }`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-2.5">
                                                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Personalized Recommendations</h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    Actionable insights tailored to your emission patterns
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {suggestions.length === 0 ? (
                                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Recommendations Yet</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                                Start logging your daily activities to receive personalized suggestions based on your carbon footprint
                                            </p>
                                            <a href="/dashboard" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Start Logging Activities
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {suggestions.map((suggestion) => {
                                                const difficultyIcons: Record<string, { icon: string; bg: string }> = {
                                                    'easy': { icon: '✅', bg: 'from-green-500 to-emerald-600' },
                                                    'medium': { icon: '⚠️', bg: 'from-yellow-500 to-orange-600' },
                                                    'hard': { icon: '🔧', bg: 'from-red-500 to-pink-600' },
                                                };
                                                const diffInfo = difficultyIcons[suggestion.difficulty] || { icon: '📌', bg: 'from-gray-500 to-gray-600' };

                                                return (
                                                    <div key={suggestion.id} className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:shadow-xl">
                                                        {/* Difficulty Badge */}
                                                        <div className="absolute top-4 right-4">
                                                            <div className={`bg-gradient-to-r ${diffInfo.bg} text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5`}>
                                                                <span>{diffInfo.icon}</span>
                                                                <span className="capitalize">{suggestion.difficulty}</span>
                                                            </div>
                                                        </div>

                                                        {/* Category Badge */}
                                                        <div className="mb-4">
                                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${getCategoryColor(suggestion.category)}`}>
                                                                <span>{suggestion.category}</span>
                                                            </span>
                                                        </div>

                                                        {/* Title & Description */}
                                                        <div className="mb-4 pr-20">
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                                                {suggestion.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                                {suggestion.description}
                                                            </p>
                                                        </div>

                                                        {/* Impact Section */}
                                                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                                    </svg>
                                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Potential Impact</span>
                                                                </div>
                                                                <span className="text-base font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                                    {suggestion.potentialReduction}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Action Tips */}
                                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                                💡 {suggestion.difficulty === 'easy'
                                                                    ? 'This is a simple change you can implement today'
                                                                    : suggestion.difficulty === 'medium'
                                                                        ? 'This requires moderate effort but offers significant impact'
                                                                        : 'This is a substantial change that may require planning'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
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

