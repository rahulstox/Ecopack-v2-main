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
    const [co2eSaved, setCo2eSaved] = useState(0);
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
            // Fetch CO2e saved data
            const fetchCo2e = async () => {
                try {
                    const response = await fetch('/api/dashboard-stats');
                    const data = await response.json();
                    if (data.success && data.thisMonthCo2e) {
                        setCo2eSaved(data.thisMonthCo2e);
                    }
                } catch (error) {
                    console.error('Error fetching CO2e:', error);
                }
            };
            fetchCo2e();
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
                <Sidebar totalCo2eSaved={co2eSaved} />
                <div className="flex-1 ml-0 lg:ml-64">
                    <div className="p-6 max-w-4xl mx-auto">
                        <div className={`bg-white dark:bg-gray-800 green:bg-green-100 rounded-xl shadow-2xl p-8 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                            {/* Enhanced Header Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg`}>
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className={`text-4xl font-bold mb-2 ${headingClass}`}>Profile & Settings</h1>
                                        <p className={`text-lg ${textClass}`}>
                                            Personalize your experience and configure carbon footprint calculation settings
                                        </p>
                                    </div>
                                </div>

                                {/* Info Banner */}
                                <div className={`mt-6 p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 ${theme === 'dark' ? 'from-blue-900/30 to-indigo-900/30' : ''} border border-blue-200 ${theme === 'dark' ? 'border-blue-700' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className={`font-semibold text-base ${textClass}`}>Why update your profile?</p>
                                            <p className={`text-sm mt-2 ${textClass}`}>
                                                Providing accurate information about your lifestyle, transportation, and household helps us calculate your carbon footprint more precisely.
                                                All fields are optional, but more details lead to better insights and personalized recommendations.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced User Info Section */}
                            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-xl p-8 mb-8 border-2 border-green-200 dark:border-green-800 shadow-lg">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    <div className={`w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-xl`}>
                                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className={`text-3xl font-bold mb-2 ${headingClass}`}>{user.fullName || user.firstName || 'User'}</h2>
                                        <p className={`text-lg mb-3 ${textClass}`}>{user.primaryEmailAddress?.emailAddress}</p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-md ${theme === 'dark' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-green-100 text-green-700 border border-green-300'}`}>
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Verified Account
                                            </span>
                                            <span className={`text-sm px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Enhanced Settings Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center`}>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h2 className={`text-2xl font-bold ${headingClass}`}>Preferences & Settings</h2>
                                </div>

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
                                {/* Enhanced Transport Section */}
                                <fieldset className={`border-2 p-8 rounded-xl shadow-lg ${theme === 'dark' ? 'border-green-700 bg-gray-700/40' : 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'}`}>
                                    <legend className={`text-xl font-bold px-4 flex items-center gap-2 ${headingClass}`}>
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center`}>
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </div>
                                        <span>Transportation & Commute</span>
                                    </legend>
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

                                {/* Enhanced Household Section */}
                                <fieldset className={`border-2 p-8 rounded-xl shadow-lg ${theme === 'dark' ? 'border-blue-700 bg-gray-700/40' : 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50'}`}>
                                    <legend className={`text-xl font-bold px-4 flex items-center gap-2 ${headingClass}`}>
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center`}>
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </div>
                                        <span>Household & Energy</span>
                                    </legend>
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

                                {/* Enhanced Diet Section */}
                                <fieldset className={`border-2 p-8 rounded-xl shadow-lg ${theme === 'dark' ? 'border-purple-700 bg-gray-700/40' : 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                                    <legend className={`text-xl font-bold px-4 flex items-center gap-2 ${headingClass}`}>
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center`}>
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <span>Diet & Nutrition</span>
                                    </legend>
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

                                {/* Enhanced Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:bg-gray-400 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save All Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/dashboard')}
                                        className={`px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg`}
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