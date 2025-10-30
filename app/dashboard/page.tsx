'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/Sidebar';
import { ActionLogTable } from '@/components/ActionLogTable';
import { LogActionModal } from '@/components/LogActionModal';
import { DashboardStats } from '@/components/DashboardStats';
import { UserProfile } from '@/components/UserProfile';
import { CategoryBreakdownChart } from '@/components/CategoryBreakdownChart';
import { OnboardingModal } from '@/components/OnboardingModal';

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [actionLogs, setActionLogs] = useState([]);
    const [stats, setStats] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recalcMessage, setRecalcMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (isLoaded && user) {
            fetchDashboardData();
        }
    }, [isLoaded, user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [logsResponse, statsResponse, profileResponse] = await Promise.all([
                fetch('/api/action-logs'),
                fetch('/api/dashboard-stats'),
                fetch('/api/profile')
            ]);

            const logs = await logsResponse.json();
            const statsData = await statsResponse.json();
            const profileData = await profileResponse.json();

            setActionLogs(logs.success ? (logs.data || []) : []);
            setStats(statsData.success ? statsData : null);
            setProfile(profileData.success ? profileData.data : null);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogAction = () => {
        setIsLogModalOpen(true);
    };

    const handleModalClose = () => {
        setIsLogModalOpen(false);
        // Refresh data when modal closes
        fetchDashboardData();
    };

    const handleRecalculate = async () => {
        // If no actions yet, guide user to log one
        if (!actionLogs || actionLogs.length === 0) {
            setIsLogModalOpen(true);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/recalculate-actions', { method: 'POST' });
            const result = await response.json();

            if (result.success) {
                setRecalcMessage({ type: 'success', text: `Recalculated ${result.updated} actions successfully.` });
                fetchDashboardData();
            } else {
                setRecalcMessage({ type: 'error', text: result.error || 'Failed to recalculate actions.' });
            }
        } catch (e) {
            setRecalcMessage({ type: 'error', text: 'Failed to recalculate actions.' });
        } finally {
            setLoading(false);
            setTimeout(() => setRecalcMessage(null), 3000);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Please sign in to access the dashboard.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="flex relative">
                <Sidebar totalCo2eSaved={stats?.thisMonthCo2e || 0} />

                {/* Main Content */}
                <div className="flex-1 ml-0 lg:ml-64 relative pt-16 lg:pt-0">
                    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                        {recalcMessage && (
                            <div className={`rounded-lg px-4 py-2 text-sm border ${recalcMessage.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                                {recalcMessage.text}
                            </div>
                        )}
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white green:text-gray-900">
                                    Welcome back, {user.firstName || 'User'}!
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 green:text-gray-700 mt-1">Track your carbon footprint and make a difference.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={handleRecalculate}
                                    disabled={loading}
                                    className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                                    title="Recalculate CO₂e for all existing actions"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="hidden xs:inline">Recalculate</span>
                                    <span className="xs:hidden">Recalc</span>
                                </button>
                                <button
                                    onClick={handleLogAction}
                                    className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Log New Action
                                </button>
                            </div>
                        </div>

                        {/* User Profile Section */}
                        {profile && <UserProfile profile={profile} />}

                        {/* Stats Section */}
                        {stats && <DashboardStats stats={stats} />}

                        {/* Charts Section */}
                        {stats && (
                            <CategoryBreakdownChart
                                categoryBreakdown={stats.categoryBreakdown || {}}
                            />
                        )}

                        {/* Enhanced Action Logs Section */}
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Recent Activities</h2>
                            </div>
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading actions...</div>
                            ) : (
                                <ActionLogTable
                                    logs={actionLogs}
                                    onDelete={() => fetchDashboardData()}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Action Modal */}
            <LogActionModal
                isOpen={isLogModalOpen}
                onClose={handleModalClose}
                userId={user.id}
            />

            {/* Onboarding Modal */}
            <OnboardingModal />
        </div>
    );
}
