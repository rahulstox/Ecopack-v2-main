'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/Sidebar';

export default function TrackerPage() {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [todayEmissions, setTodayEmissions] = useState(0);
    const [weekEmissions, setWeekEmissions] = useState(0);
    const [todayLogs, setTodayLogs] = useState<any[]>([]);

    useEffect(() => {
        if (isLoaded && user) {
            fetchTrackerData();
        }
    }, [isLoaded, user]);

    const fetchTrackerData = async () => {
        try {
            const response = await fetch('/api/action-logs?limit=50');
            const data = await response.json();

            if (data.success) {
                const logs = data.data || [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const todayLogs = logs.filter((log: any) => {
                    const logDate = new Date(log.loggedAt || Date.now());
                    return logDate >= today;
                });

                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const weekLogs = logs.filter((log: any) => {
                    const logDate = new Date(log.loggedAt || Date.now());
                    return logDate >= weekAgo;
                });

                const todayTotal = todayLogs.reduce((sum: number, log: any) => sum + (log.calculatedCo2e || 0), 0);
                const weekTotal = weekLogs.reduce((sum: number, log: any) => sum + (log.calculatedCo2e || 0), 0);

                setTodayEmissions(todayTotal);
                setWeekEmissions(weekTotal);
                setTodayLogs(todayLogs);
            }
        } catch (error) {
            console.error('Error fetching tracker data:', error);
        } finally {
            setLoading(false);
        }
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
                <Sidebar totalCo2eSaved={todayEmissions} />

                <div className="flex-1 ml-0 lg:ml-64">
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Live Activity Tracker</h1>
                                <p className="text-gray-600 mt-1">Track your emissions in real-time</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Today's Emissions</p>
                                        <p className="text-2xl font-bold text-gray-900">{todayEmissions.toFixed(2)} kg</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Week's Total</p>
                                        <p className="text-2xl font-bold text-gray-900">{weekEmissions.toFixed(2)} kg</p>
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
                                        <p className="text-sm text-gray-600">Today's Actions</p>
                                        <p className="text-2xl font-bold text-gray-900">{todayLogs.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Today's Activities */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Activities</h2>
                            {todayLogs.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No activities logged today</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todayLogs.map((log, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${log.category === 'TRANSPORT' ? 'bg-blue-500' :
                                                    log.category === 'FOOD' ? 'bg-green-500' :
                                                        log.category === 'ENERGY' ? 'bg-yellow-500' : 'bg-gray-500'
                                                    }`} />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{log.activity}</p>
                                                    <p className="text-sm text-gray-600">{log.amount} {log.unit}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-green-600">{(log.calculatedCo2e || 0).toFixed(2)} kg</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


