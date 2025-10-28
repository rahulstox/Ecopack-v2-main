'use client';

import Link from 'next/link';

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
