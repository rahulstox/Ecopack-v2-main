'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/Sidebar';
import Link from 'next/link';

export default function TrackerPage() {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [todayEmissions, setTodayEmissions] = useState(0);
    const [weekEmissions, setWeekEmissions] = useState(0);
    const [todayLogs, setTodayLogs] = useState<any[]>([]);
    const [isPro] = useState(false); // TODO: Check user subscription status

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

                const todayTotal = todayLogs.reduce((sum: number, log: any) => sum + Number(log.calculatedCo2e || 0), 0);
                const weekTotal = weekLogs.reduce((sum: number, log: any) => sum + Number(log.calculatedCo2e || 0), 0);

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 green:bg-green-50">
            <div className="flex">
                <Sidebar totalCo2eSaved={todayEmissions} />

                <div className="flex-1 ml-0 lg:ml-64">
                    <div className="p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white green:text-gray-900">Live Activity Tracker</h1>
                                <p className="text-gray-600 dark:text-gray-400 green:text-gray-700 mt-2">Track your emissions in real-time</p>
                            </div>
                            {!isPro && (
                                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg border border-white/20">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Premium Feature</span>
                                </div>
                            )}
                        </div>

                        {/* Locked Overlay */}
                        {!isPro && (
                            <div className="relative bg-white dark:bg-gray-800 green:bg-green-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px]">
                                {/* Animated gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-800/95 dark:from-black/95 dark:via-gray-900/95 dark:to-black/95 backdrop-blur-md z-10">
                                    {/* Decorative pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                                    </div>

                                    <div className="relative z-20 flex flex-col items-center justify-center text-center p-8 h-full min-h-[500px]">
                                        <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full p-4 mb-6 shadow-2xl animate-pulse">
                                            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div className="mb-4">
                                            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                                Live Activity Tracker
                                            </h2>
                                            <div className="h-1 w-24 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto rounded-full"></div>
                                        </div>
                                        <p className="text-lg sm:text-xl text-gray-300 mb-2 max-w-lg leading-relaxed">
                                            Unlock advanced real-time tracking features
                                        </p>
                                        <p className="text-base text-gray-400 mb-8 max-w-md">
                                            Get instant insights into your carbon footprint with GPS tracking, live maps, and intelligent analytics
                                        </p>
                                        <Link
                                            href="/#pricing"
                                            className="group bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-green-500/50 hover:scale-105 inline-flex items-center gap-3 border border-white/20"
                                        >
                                            <span>Upgrade to Pro</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>

                                {/* Blurred Preview Content */}
                                <div className="opacity-30 blur-sm">
                                    {/* Stats Cards */}
                                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg p-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Today's Emissions</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0.00 kg</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg p-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Week's Total</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0.00 kg</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg p-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Today's Actions</p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats Cards - Show only for Pro users */}
                        {isPro && (
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-gray-800 green:bg-green-100 rounded-lg shadow-lg p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Today's Emissions</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Number(todayEmissions || 0).toFixed(2)} kg</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 green:bg-green-100 rounded-lg shadow-lg p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Week's Total</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Number(weekEmissions || 0).toFixed(2)} kg</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 green:bg-green-100 rounded-lg shadow-lg p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Today's Actions</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayLogs.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Today's Activities */}
                        {isPro && (
                            <div className="bg-white dark:bg-gray-800 green:bg-green-100 rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white green:text-gray-900 mb-4">Today's Activities</h2>
                                {todayLogs.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <p>No activities logged today</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {todayLogs.map((log, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${log.category === 'TRANSPORT' ? 'bg-blue-500' :
                                                        log.category === 'FOOD' ? 'bg-green-500' :
                                                            log.category === 'ENERGY' ? 'bg-yellow-500' : 'bg-gray-500'
                                                        }`} />
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{log.activity}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{log.amount} {log.unit}</p>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-green-600 dark:text-green-400">{Number(log.calculatedCo2e || 0).toFixed(2)} kg</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Future Enhancements Section */}
                        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-3.5 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Future Enhancements</h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-400">Premium features coming soon with Pro plan</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                                {/* Live Maps */}
                                <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {/* Lock Badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            LOCKED
                                        </span>
                                    </div>
                                    {/* Dashed border effect */}
                                    <div className="absolute inset-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-50 pointer-events-none"></div>

                                    <div className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3.5 shadow-lg">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                🌍 Live Maps Integration
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                                Real-time GPS tracking with interactive maps showing your carbon footprint journey
                                            </p>
                                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">▸</span>
                                                    <span>Route visualization</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">▸</span>
                                                    <span>Heat maps of high-emission areas</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">▸</span>
                                                    <span>Location-based activity detection</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Real-time Alerts */}
                                <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            LOCKED
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-50 pointer-events-none"></div>
                                    <div className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-3.5 shadow-lg">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">🔔 Real-time Alerts</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                                Instant notifications when emission thresholds are reached
                                            </p>
                                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">▸</span><span>Smart threshold alerts</span></li>
                                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">▸</span><span>Daily/weekly summaries</span></li>
                                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">▸</span><span>Achievement milestones</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Smart Activity Detection */}
                                <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            LOCKED
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-50 pointer-events-none"></div>
                                    <div className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-3.5 shadow-lg">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">🤖 AI-Powered Auto-Detection</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                                Automatically detect and log activities using AI and sensors
                                            </p>
                                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">▸</span><span>Motion sensor integration</span></li>
                                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">▸</span><span>Voice command logging</span></li>
                                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">▸</span><span>Smart device sync</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Analytics */}
                                <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            LOCKED
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-50 pointer-events-none"></div>
                                    <div className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-3.5 shadow-lg">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">📊 Advanced Analytics Dashboard</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                                Deep insights with predictive analytics and trend analysis
                                            </p>
                                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <li className="flex items-start gap-2"><span className="text-purple-500 mt-1">▸</span><span>Predictive emission forecasting</span></li>
                                                <li className="flex items-start gap-2"><span className="text-purple-500 mt-1">▸</span><span>Comparative analysis</span></li>
                                                <li className="flex items-start gap-2"><span className="text-purple-500 mt-1">▸</span><span>Custom report generation</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Multi-Device Sync */}
                                <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            LOCKED
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-50 pointer-events-none"></div>
                                    <div className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl p-3.5 shadow-lg">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">📱 Multi-Device Sync</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                                Seamlessly sync across all your devices in real-time
                                            </p>
                                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">▸</span><span>Cross-platform sync</span></li>
                                                <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">▸</span><span>Wearable integration</span></li>
                                                <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">▸</span><span>Cloud backup & restore</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Team Collaboration */}
                                <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            LOCKED
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-50 pointer-events-none"></div>
                                    <div className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl p-3.5 shadow-lg">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">👥 Team Collaboration</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                                Share progress and compete with your team members
                                            </p>
                                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <li className="flex items-start gap-2"><span className="text-teal-500 mt-1">▸</span><span>Team leaderboards</span></li>
                                                <li className="flex items-start gap-2"><span className="text-teal-500 mt-1">▸</span><span>Shared goals & challenges</span></li>
                                                <li className="flex items-start gap-2"><span className="text-teal-500 mt-1">▸</span><span>Group analytics</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        Upgrade to Pro to unlock all premium features and take your carbon tracking to the next level
                                    </p>
                                    <Link
                                        href="/#pricing"
                                        className="group inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 border border-white/20"
                                    >
                                        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Unlock All Features with Pro Plan</span>
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


