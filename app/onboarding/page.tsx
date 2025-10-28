'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs'; // Import useUser hook

export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useUser(); // Get user info from Clerk
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        primaryVehicleType: '',
        fuelType: '',
        householdSize: '',
        dietType: '',
        homeEnergySource: '',
        commuteDistance: '',
        commuteMode: '',
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

        // Convert numeric fields from string to number
        const profileData = {
            userId: user.id, // Include the Clerk User ID
            primaryVehicleType: formData.primaryVehicleType || null,
            fuelType: formData.fuelType || null,
            householdSize: formData.householdSize ? parseInt(formData.householdSize, 10) : null,
            dietType: formData.dietType || null,
            homeEnergySource: formData.homeEnergySource || null,
            commuteDistance: formData.commuteDistance ? parseFloat(formData.commuteDistance) : null,
            commuteMode: formData.commuteMode || null,
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
                router.push('/'); // Redirect to homepage (or dashboard later)
                router.refresh(); // Ensure layout re-renders if needed
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

    // Simple loading state
    if (!user && loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading user data...</div>
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Ecopack-AI!</h1>
                    <p className="text-gray-600 mb-6">
                        Let's personalize your experience. Please provide some details to help us calculate your impact accurately. (You can skip fields if unsure).
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Transport Section */}
                        <fieldset className="border p-4 rounded-md">
                            <legend className="text-lg font-semibold px-2 text-gray-700">🚗 Transport</legend>
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Vehicle Type</label>
                                    <select name="primaryVehicleType" value={formData.primaryVehicleType} onChange={handleChange} className="w-full input-field">
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Fuel Type</label>
                                        <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full input-field">
                                            <option value="">Select Fuel</option>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="CNG">CNG</option>
                                            <option value="Hybrid">Hybrid</option> {/* Keep Hybrid if vehicle type is Hybrid */}
                                        </select>
                                    </div>
                                )}
                                {formData.primaryVehicleType === 'Electric Car (EV)' && (
                                    <input type="hidden" name="fuelType" value="Electric" /> // Auto-set for EV
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Typical Daily Commute Distance (One Way, in km)</label>
                                    <input type="number" step="0.1" name="commuteDistance" value={formData.commuteDistance} onChange={handleChange} className="w-full input-field" placeholder="e.g., 15.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Commute Mode</label>
                                    <select name="commuteMode" value={formData.commuteMode} onChange={handleChange} className="w-full input-field">
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
                        <fieldset className="border p-4 rounded-md">
                            <legend className="text-lg font-semibold px-2 text-gray-700">🏠 Household</legend>
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Household Size (Number of people)</label>
                                    <input type="number" name="householdSize" value={formData.householdSize} onChange={handleChange} className="w-full input-field" placeholder="e.g., 4" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Home Energy Source</label>
                                    <select name="homeEnergySource" value={formData.homeEnergySource} onChange={handleChange} className="w-full input-field">
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
                        <fieldset className="border p-4 rounded-md">
                            <legend className="text-lg font-semibold px-2 text-gray-700">🍲 Diet</legend>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Typical Diet Type</label>
                                <select name="dietType" value={formData.dietType} onChange={handleChange} className="w-full input-field">
                                    <option value="">Select Diet</option>
                                    <option value="Omnivore">Omnivore (Eat everything)</option>
                                    <option value="Omnivore - Low Red Meat">Omnivore (Low Red Meat)</option>
                                    <option value="Pescatarian">Pescatarian (Fish, no other meat)</option>
                                    <option value="Vegetarian">Vegetarian (No meat or fish)</option>
                                    <option value="Vegan">Vegan (No animal products)</option>
                                </select>
                            </div>
                        </fieldset>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Saving Profile...' : 'Save and Continue'}
                        </button>
                    </form>
                </div>
            </div>
            {/* Simple styling for input fields - add to globals.css if needed */}
            <style jsx>{`
        .input-field {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db; /* gray-300 */
          border-radius: 0.375rem; /* rounded-md */
          box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .input-field:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
          border-color: #4f46e5; /* indigo-600 */
          box-shadow: 0 0 0 2px #a5b4fc; /* indigo-300 ring */
        }
      `}</style>
        </div>
    );
}