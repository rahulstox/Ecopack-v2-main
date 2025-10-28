'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/Sidebar';
import { ActionLogTable } from '@/components/ActionLogTable';
import { LogActionModal } from '@/components/LogActionModal';
import { DashboardStats } from '@/components/DashboardStats';
import { UserProfile } from '@/components/UserProfile';
import { CategoryBreakdownChart } from '@/components/CategoryBreakdownChart';

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [actionLogs, setActionLogs] = useState([]);
    const [stats, setStats] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

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
        try {
            setLoading(true);
            const response = await fetch('/api/recalculate-actions', {
                method: 'POST',
            });
            const result = await response.json();

            if (result.success) {
                alert(`Successfully recalculated ${result.updated} actions!`);
                fetchDashboardData();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error recalculating:', error);
            alert('Failed to recalculate actions');
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar totalCo2eSaved={stats?.thisMonthCo2e || 0} />

                {/* Main Content */}
                <div className="flex-1 ml-0 lg:ml-64">
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Welcome back, {user.firstName || 'User'}!
                                </h1>
                                <p className="text-gray-600 mt-1">Track your carbon footprint and make a difference.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRecalculate}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                                    title="Recalculate CO₂e for all existing actions"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Recalculate
                                </button>
                                <button
                                    onClick={handleLogAction}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                        {/* Action Logs Section */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activities</h2>
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
        </div>
    );
}
