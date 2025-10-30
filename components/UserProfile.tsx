'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface UserProfileProps {
    profile: {
        primaryVehicleType?: string;
        fuelType?: string;
        householdSize?: number;
        dietType?: string;
        homeEnergySource?: string;
        commuteDistance?: number;
        commuteMode?: string;
    };
}

export function UserProfile({ profile }: UserProfileProps) {
    const [username, setUsername] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/profile/username');
                const data = await res.json();
                if (data.success) {
                    setUsername(data.username);
                    setInput(data.username || '');
                }
            } catch { }
        })();
    }, []);

    const profileItems = [
        { label: 'Vehicle Type', value: profile.primaryVehicleType },
        { label: 'Fuel Type', value: profile.fuelType },
        { label: 'Household Size', value: profile.householdSize },
        { label: 'Diet Type', value: profile.dietType },
        { label: 'Energy Source', value: profile.homeEnergySource },
        { label: 'Commute Distance', value: profile.commuteDistance ? `${profile.commuteDistance} km` : null },
        { label: 'Commute Mode', value: profile.commuteMode },
    ].filter(item => item.value); // Only show items with values

    if (profileItems.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Profile
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setEditing(v => !v)}
                        className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {editing ? 'Cancel' : 'Edit Username'}
                    </button>
                    <Link
                        href="/onboarding"
                        className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                    </Link>
                </div>
            </div>

            {/* Username */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                {!editing ? (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Username</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{username || 'Not set'}</p>
                        </div>
                        <button onClick={() => setEditing(true)} className="text-sm font-semibold text-green-700 hover:text-green-800">Update</button>
                    </div>
                ) : (
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setStatus(null);
                            try {
                                const res = await fetch('/api/profile/username', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: input }) });
                                const data = await res.json();
                                if (data.success) { setUsername(data.username); setEditing(false); setStatus('Saved'); }
                                else setStatus(data.error || 'Failed');
                            } catch { setStatus('Failed'); }
                        }}
                        className="flex items-end gap-3"
                    >
                        <div className="flex-1">
                            <label className="text-sm text-gray-600 font-medium">New Username</label>
                            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., rahul_gupta" className="mt-1 w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                            <p className="text-xs text-gray-500 mt-1">3–24 chars, letters/numbers/._- only</p>
                        </div>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">Save</button>
                        {status && <span className="text-sm text-gray-600">{status}</span>}
                    </form>
                )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
