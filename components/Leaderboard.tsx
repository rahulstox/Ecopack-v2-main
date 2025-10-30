'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';

type Leader = {
    userId: string;
    totalSaved: number;
    username?: string | null;
};

function getInitials(idOrName: string) {
    if (!idOrName) return 'U';
    const words = idOrName.split(/[\s._-]+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return idOrName.slice(0, 2).toUpperCase();
}

export function Leaderboard() {
    const { user } = useUser();
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch('/api/leaderboard', { cache: 'no-store' });
                const data = await res.json();
                if (mounted && data.success) setLeaders(data.data || []);
            } catch {
                // noop
            } finally {
                mounted = false;
                setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const sorted = useMemo(() => {
        return leaders
            .slice()
            .sort((a, b) => (b.totalSaved || 0) - (a.totalSaved || 0))
            .map((l, idx) => ({ ...l, rank: idx + 1 }));
    }, [leaders]);

    const current = useMemo(() => {
        if (!user) return null;
        const idx = sorted.findIndex((e: any) => e.userId === user.id);
        return idx >= 0 ? sorted[idx] : null;
    }, [sorted, user]);

    return (
        <div className="w-full">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Community Impact
                    </div>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        CO₂e Savings Leaderboard
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        Celebrating top contributors driving real climate impact.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header row */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-7">User</div>
                        <div className="col-span-4 text-right">Total CO₂e Saved</div>
                    </div>

                    {/* Rows */}
                    <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                        {loading && (
                            <li className="p-6 text-center text-gray-500">Loading leaderboard...</li>
                        )}
                        {!loading && sorted.length === 0 && (
                            <li className="p-6 text-center text-gray-500">No data yet. Log actions to appear here!</li>
                        )}
                        {sorted.map((entry) => {
                            const isCurrent = user && entry.userId === user.id;
                            const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';
                            return (
                                <li
                                    key={entry.userId}
                                    className={`px-3 sm:px-4 py-3 sm:py-4 grid grid-cols-12 gap-2 items-center ${isCurrent ? 'bg-emerald-50/70 dark:bg-emerald-900/20' : ''}`}
                                >
                                    <div className="col-span-2 sm:col-span-1 font-extrabold text-gray-900 dark:text-white text-lg sm:text-base">
                                        {entry.rank}
                                    </div>
                                    <div className="col-span-7 sm:col-span-7 flex items-center gap-3">
                                        <div className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shadow ${entry.rank === 1 ? 'bg-yellow-500' : entry.rank === 2 ? 'bg-gray-400' : entry.rank === 3 ? 'bg-orange-500' : 'bg-emerald-600'}`}>
                                            <span className="text-sm font-bold">{medal || getInitials(entry.userId)}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`truncate font-semibold ${isCurrent ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>
                                                {isCurrent ? 'You' : (entry.username || entry.userId)}
                                            </p>
                                            {!entry.username && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {entry.userId.slice(0, 6)}…</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-3 sm:col-span-4 text-right">
                                        <span className="text-base sm:text-sm font-extrabold text-gray-900 dark:text-white">
                                            {Number(entry.totalSaved || 0).toFixed(2)} kg
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {current && (
                    <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
                        Your rank: <span className="font-bold">#{current.rank}</span> • Total saved: <span className="font-bold">{Number(current.totalSaved).toFixed(2)} kg</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export function MiniLeaderboard() {
    const { user } = useUser();
    const [leaders, setLeaders] = useState<Leader[]>([]);
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/leaderboard', { cache: 'no-store' });
                const data = await res.json();
                if (data.success) setLeaders(data.data || []);
            } catch { }
        })();
    }, []);
    const sorted = leaders
        .slice()
        .sort((a, b) => (b.totalSaved || 0) - (a.totalSaved || 0))
        .map((l, idx) => ({ ...l, rank: idx + 1 })) as any[];
    const current = user ? sorted.find((x) => x.userId === user.id) : null;

    return (
        <div className="w-full">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                    {sorted.slice(0, 5).map((e) => (
                        <li key={e.userId} className={`px-4 py-3 flex items-center justify-between ${current && current.userId === e.userId ? 'bg-emerald-50/70 dark:bg-emerald-900/20' : ''}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-extrabold">{e.rank}</span>
                                <span className="font-semibold">{e.username || e.userId}</span>
                            </div>
                            <div className="text-right font-bold">{Number(e.totalSaved).toFixed(2)} kg</div>
                        </li>
                    ))}
                </ul>
            </div>
            {current && (
                <p className="mt-3 text-sm text-center text-gray-600 dark:text-gray-300">Your rank: <span className="font-bold">#{current.rank}</span></p>
            )}
        </div>
    );
}


