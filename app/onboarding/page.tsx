'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';

export default function OnboardingPage() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        primaryVehicleType: '',
        fuelType: '',
        householdSize: '',
        dietType: '',
        homeEnergySource: '',
        commuteDistance: '',
        commuteMode: '',
        notificationPreferences: 'email',
        carbonGoal: '',
        language: 'en',
        timezone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('User not found. Please try logging in again.');
            return;
        }
        setLoading(true);

        const profileData = {
            userId: user.id,
            primaryVehicleType: formData.primaryVehicleType || null,
            fuelType: formData.fuelType || null,
            householdSize: formData.householdSize ? parseInt(formData.householdSize, 10) : null,
            dietType: formData.dietType || null,
            homeEnergySource: formData.homeEnergySource || null,
            commuteDistance: formData.commuteDistance ? parseFloat(formData.commuteDistance) : null,
            commuteMode: formData.commuteMode || null,
            notificationPreferences: formData.notificationPreferences || 'email',
            carbonGoal: formData.carbonGoal ? parseFloat(formData.carbonGoal) : null,
            language: formData.language || 'en',
            timezone: formData.timezone || null,
        };

        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            const result = await response.json();

            if (result.success) {
                alert('Profile saved successfully!');
                router.push('/dashboard');
                router.refresh();
            } else {
                alert(`Error saving profile: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error submitting onboarding form:', error);
            alert('An error occurred while saving your profile.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        if (user?.id) {
            try {
                const response = await fetch('/api/profile');
                const data = await response.json();
                if (data.success && data.data) {
                    setFormData({
                        primaryVehicleType: data.data.primaryVehicleType || '',
                        fuelType: data.data.fuelType || '',
                        householdSize: data.data.householdSize?.toString() || '',
                        dietType: data.data.dietType || '',
                        homeEnergySource: data.data.homeEnergySource || '',
                        commuteDistance: data.data.commuteDistance?.toString() || '',
                        commuteMode: data.data.commuteMode || '',
                        notificationPreferences: data.data.notificationPreferences || 'email',
                        carbonGoal: data.data.carbonGoal?.toString() || '',
                        language: data.data.language || 'en',
                        timezone: data.data.timezone || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        }
    };

    useEffect(() => {
        if (isLoaded && user) {
            fetchUserProfile();
        }
    }, [isLoaded, user]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 green:bg-green-50 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 green:bg-green-50 flex items-center justify-center">
                <div className="text-xl">Please sign in to continue.</div>
            </div>
        );
    }

    const labelClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
    const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const headingClass = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const inputClass = theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 green:bg-green-50">
            <div className="flex">
                <Sidebar totalCo2eSaved={0} />
                <div className="flex-1 ml-0 lg:ml-64">
                    <div className="p-6 max-w-4xl mx-auto">
                        <div className={`bg-white dark:bg-gray-800 green:bg-green-100 rounded-lg shadow-xl p-8`}>
                            <div className="mb-6">
                                <h1 className={`text-3xl font-bold mb-2 ${headingClass}`}>Profile & Settings</h1>
                                <p className={`${textClass}`}>
                                    Manage your profile information and carbon footprint calculation settings
                                </p>
                            </div>

                            {/* User Info Section */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-bold ${headingClass}`}>{user.fullName || user.firstName || 'User'}</h2>
                                        <p className={textClass}>{user.primaryEmailAddress?.emailAddress}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                                                Verified Account
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Personalize Your Experience</h2>
                                <p className={`${textClass} mb-6`}>
                                    Help us calculate your carbon footprint accurately by providing information about your lifestyle. All fields are optional.
                                </p>
                            </div>

                            {/* Settings Section */}
                            <div className="mb-8">
                                <h2 className={`text-xl font-bold mb-4 ${headingClass}`}>Preferences & Settings</h2>

                                <div className={`bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 mb-6`}>
                                    <h3 className={`text-lg font-semibold mb-4 ${headingClass}`}>⚙️ Notifications & Goals</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Notification Preferences</label>
                                            <select name="notificationPreferences" value={formData.notificationPreferences} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}>
                                                <option value="email">Email Notifications</option>
                                                <option value="push">Push Notifications</option>
                                                <option value="both">Both Email & Push</option>
                                                <option value="none">No Notifications</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Monthly Carbon Reduction Goal (kg CO₂e)</label>
                                            <input type="number" step="0.1" name="carbonGoal" value={formData.carbonGoal} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`} placeholder="e.g., 50" />
                                            <p className={`text-xs ${textClass} mt-1`}>Set a personal goal for monthly carbon reduction</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 mb-6`}>
                                    <h3 className={`text-lg font-semibold mb-4 ${headingClass}`}>🌍 Language & Region</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Language</label>
                                            <select name="language" value={formData.language} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}>
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                                <option value="hi">Hindi</option>
                                                <option value="zh">Chinese</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Timezone</label>
                                            <select name="timezone" value={formData.timezone} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}>
                                                <option value="">Select Timezone</option>
                                                <option value="UTC">UTC (Coordinated Universal Time)</option>
                                                <option value="America/New_York">Eastern Time (ET)</option>
                                                <option value="America/Chicago">Central Time (CT)</option>
                                                <option value="America/Denver">Mountain Time (MT)</option>
                                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                                <option value="Europe/London">London (GMT)</option>
                                                <option value="Europe/Paris">Paris (CET)</option>
                                                <option value="Asia/Dubai">Dubai (GST)</option>
                                                <option value="Asia/Kolkata">Mumbai/New Delhi (IST)</option>
                                                <option value="Asia/Tokyo">Tokyo (JST)</option>
                                                <option value="Asia/Shanghai">Shanghai (CST)</option>
                                                <option value="Australia/Sydney">Sydney (AEDT)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Transport Section */}
                                <fieldset className={`border-2 p-6 rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-green-100 bg-green-50/30'}`}>
                                    <legend className={`text-lg font-semibold px-3 ${headingClass}`}>🚗 Transport</legend>
                                    <div className="space-y-4 mt-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Primary Vehicle Type</label>
                                            <select name="primaryVehicleType" value={formData.primaryVehicleType} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}>
                                                <option value="">Select Vehicle</option>
                                                <option value="Petrol Car">Petrol Car</option>
                                                <option value="Diesel Car">Diesel Car</option>
                                                <option value="Electric Car (EV)">Electric Car (EV)</option>
                                                <option value="Hybrid Car">Hybrid Car</option>
                                                <option value="Motorbike">Motorbike</option>
                                                <option value="CNG Vehicle">CNG Vehicle</option>
                                                <option value="None">None / Primarily use Public Transport</option>
                                            </select>
                                        </div>
                                        {formData.primaryVehicleType && formData.primaryVehicleType !== 'None' && formData.primaryVehicleType !== 'Electric Car (EV)' && (
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Primary Fuel Type</label>
                                                <select name="fuelType" value={formData.fuelType} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}>
                                                    <option value="">Select Fuel</option>
                                                    <option value="Petrol">Petrol</option>
                                                    <option value="Diesel">Diesel</option>
                                                    <option value="CNG">CNG</option>
                                                    <option value="Hybrid">Hybrid</option>
                                                </select>
                                            </div>
                                        )}
                                        {formData.primaryVehicleType === 'Electric Car (EV)' && (
                                            <input type="hidden" name="fuelType" value="Electric" />
                                        )}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Typical Daily Commute Distance (One Way, in km)</label>
                                            <input type="number" step="0.1" name="commuteDistance" value={formData.commuteDistance} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`} placeholder="e.g., 15.5" />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Primary Commute Mode</label>
                                            <select name="commuteMode" value={formData.commuteMode} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}>
                                                <option value="">Select Mode</option>
                                                <option value="Car">Car (Using Primary Vehicle)</option>
                                                <option value="Motorbike">Motorbike</option>
                                                <option value="Bus">Bus</option>
                                                <option value="Train / Metro">Train / Metro</option>
                                                <option value="Auto Rickshaw / Taxi">Auto Rickshaw / Taxi</option>
                                                <option value="Cycling">Cycling</option>
                                                <option value="Walking">Walking</option>
                                                <option value="Work From Home">Work From Home</option>
                                            </select>
                                        </div>
                                    </div>
                                </fieldset>

                                {/* Household Section */}
                                <fieldset className={`border-2 p-6 rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-blue-100 bg-blue-50/30'}`}>
                                    <legend className={`text-lg font-semibold px-3 ${headingClass}`}>🏠 Household</legend>
                                    <div className="space-y-4 mt-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Household Size (Number of people)</label>
                                            <input type="number" name="householdSize" value={formData.householdSize} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`} placeholder="e.g., 4" />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Primary Home Energy Source</label>
                                            <select name="homeEnergySource" value={formData.homeEnergySource} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}>
                                                <option value="">Select Source</option>
                                                <option value="Grid Coal">Grid Electricity (Mostly Coal)</option>
                                                <option value="Grid Mix">Grid Electricity (Mixed Sources)</option>
                                                <option value="Grid Renewables">Grid Electricity (Mostly Renewables)</option>
                                                <option value="Solar Panels">Solar Panels (Own)</option>
                                                <option value="Natural Gas">Natural Gas (for heating/cooking)</option>
                                                <option value="LPG Cylinder">LPG Cylinder (for cooking)</option>
                                            </select>
                                        </div>
                                    </div>
                                </fieldset>

                                {/* Diet Section */}
                                <fieldset className={`border-2 p-6 rounded-lg ${theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-purple-100 bg-purple-50/30'}`}>
                                    <legend className={`text-lg font-semibold px-3 ${headingClass}`}>🍲 Diet</legend>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Typical Diet Type</label>
                                        <select name="dietType" value={formData.dietType} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}>
                                            <option value="">Select Diet</option>
                                            <option value="Omnivore">Omnivore (Eat everything)</option>
                                            <option value="Omnivore - Low Red Meat">Omnivore (Low Red Meat)</option>
                                            <option value="Pescatarian">Pescatarian (Fish, no other meat)</option>
                                            <option value="Vegetarian">Vegetarian (No meat or fish)</option>
                                            <option value="Vegan">Vegan (No animal products)</option>
                                        </select>
                                    </div>
                                </fieldset>

                                {/* Account Management Section */}
                                <div className={`bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 mb-6`}>
                                    <h3 className={`text-lg font-semibold mb-4 ${headingClass}`}>🔐 Account Management</h3>
                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={labelClass}>Download My Data</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-500 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={labelClass}>Export Activity History</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                    <p className={`text-xs ${textClass} mt-3`}>
                                        You can download your data or export your activity history at any time.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 shadow-lg hover:shadow-xl"
                                    >
                                        {loading ? 'Saving...' : '💾 Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/dashboard')}
                                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}