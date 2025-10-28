'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react'; // Loading spinner icon

const TOTAL_STEPS = 4; // Example: 1. Welcome, 2. Transport, 3. Household, 4. Diet

export function OnboardingModal() {
    const { user } = useUser();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Initialize all fields from your UserProfileData interface
        primaryVehicleType: '',
        fuelType: '',
        householdSize: '',
        dietType: '',
        homeEnergySource: '',
        commuteDistance: '',
        commuteMode: '',
        // Add name, etc. if needed
    });
    const [errors, setErrors] = useState<Record<string, string>>({}); // For validation

    // Open the modal automatically if onboarding isn't complete
    useEffect(() => {
        if (user && !user.publicMetadata?.onboardingComplete) {
            setIsOpen(true);
        } else {
            setIsOpen(false); // Close if metadata changes later
        }
    }, [user, user?.publicMetadata?.onboardingComplete]);


    const handleSelectChange = (name: string) => (value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear related errors when changing selection
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Clear fuelType if vehicle changes to EV or None
        if (name === 'primaryVehicleType' && (value === 'Electric Car (EV)' || value === 'None')) {
            setFormData((prev) => ({ ...prev, fuelType: '' }));
            setErrors(prev => ({ ...prev, fuelType: '' }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // --- Basic Validation ---
    const validateStep = (step: number): boolean => {
        let stepErrors: Record<string, string> = {};
        if (step === 2) { // Transport Step
            if (!formData.primaryVehicleType) {
                stepErrors.primaryVehicleType = 'Vehicle type is required.';
            } else if (formData.primaryVehicleType && formData.primaryVehicleType !== 'None' && formData.primaryVehicleType !== 'Electric Car (EV)' && !formData.fuelType) {
                stepErrors.fuelType = 'Fuel type is required for this vehicle.';
            }
            // Add other transport validations if needed (e.g., commute distance > 0)
        }
        if (step === 3) { // Household Step
            if (!formData.householdSize) {
                stepErrors.householdSize = 'Household size is required.';
            } else if (parseInt(formData.householdSize, 10) <= 0) {
                stepErrors.householdSize = 'Must be at least 1.';
            }
            if (!formData.homeEnergySource) {
                stepErrors.homeEnergySource = 'Energy source is required.';
            }
        }
        if (step === 4) { // Diet Step
            if (!formData.dietType) {
                stepErrors.dietType = 'Diet type is required.';
            }
        }
        // Add validation for other steps here

        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0; // True if no errors
    };


    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < TOTAL_STEPS) {
                setCurrentStep(currentStep + 1);
            } else {
                // If on last step, "Next" becomes "Save"
                handleSubmit();
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({}); // Clear errors when going back
        }
    };

    const handleSkip = () => {
        // If skipping, clear errors for the current step and move to next
        setErrors({});
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        } else {
            // If skipping last step, treat as finish/save with potentially incomplete data
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        // Final validation check (optional, could rely on step validation)
        // if (!validateStep(TOTAL_STEPS)) return;

        if (!user) return; // Should not happen if modal is open
        setLoading(true);
        setErrors({}); // Clear previous errors

        const profileData = {
            userId: user.id,
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
                // IMPORTANT: Clerk metadata update happens server-side now
                // We just need to reload the user or refresh page potentially
                await user.reload(); // Attempt to reload user data to get new metadata
                setIsOpen(false); // Close modal on success
                router.refresh(); // Refresh server components if needed
                alert('Profile saved successfully!'); // Simple confirmation
            } else {
                alert(`Error: ${result.error}`);
                // Maybe set form-level errors based on API response?
            }
        } catch (error) {
            console.error('Failed to submit onboarding:', error);
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };


    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.firstName || 'User'}!</h2>
                        <p className="text-gray-600">
                            Help us personalize EcoImpact AI for you. We'll ask a few quick questions about your lifestyle.
                            Fields marked with <span className="text-red-500">*</span> are recommended for accurate calculations, but you can skip steps.
                        </p>
                    </div>
                );
            case 2: // Transport
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">🚗 Your Transport Habits</h2>
                        <div>
                            <Label htmlFor="primaryVehicleType">Primary Vehicle Type <span className="text-red-500">*</span></Label>
                            <Select name="primaryVehicleType" onValueChange={handleSelectChange('primaryVehicleType')} value={formData.primaryVehicleType}>
                                <SelectTrigger id="primaryVehicleType">
                                    <SelectValue placeholder="Select Vehicle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Petrol Car">Petrol Car</SelectItem>
                                    <SelectItem value="Diesel Car">Diesel Car</SelectItem>
                                    <SelectItem value="Electric Car (EV)">Electric Car (EV)</SelectItem>
                                    <SelectItem value="Hybrid Car">Hybrid Car</SelectItem>
                                    <SelectItem value="Motorbike">Motorbike</SelectItem>
                                    <SelectItem value="CNG Vehicle">CNG Vehicle</SelectItem>
                                    <SelectItem value="None">None / Use Public Transport</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.primaryVehicleType && <p className="text-sm text-red-500 mt-1">{errors.primaryVehicleType}</p>}
                        </div>

                        {/* Conditionally show Fuel Type */}
                        {formData.primaryVehicleType && formData.primaryVehicleType !== 'None' && formData.primaryVehicleType !== 'Electric Car (EV)' && (
                            <div>
                                <Label htmlFor="fuelType">Primary Fuel Type <span className="text-red-500">*</span></Label>
                                <Select name="fuelType" onValueChange={handleSelectChange('fuelType')} value={formData.fuelType}>
                                    <SelectTrigger id="fuelType">
                                        <SelectValue placeholder="Select Fuel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Petrol">Petrol</SelectItem>
                                        <SelectItem value="Diesel">Diesel</SelectItem>
                                        <SelectItem value="CNG">CNG</SelectItem>
                                        {formData.primaryVehicleType === 'Hybrid Car' && <SelectItem value="Hybrid">Hybrid</SelectItem>}
                                    </SelectContent>
                                </Select>
                                {errors.fuelType && <p className="text-sm text-red-500 mt-1">{errors.fuelType}</p>}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="commuteDistance">Typical Daily Commute Distance (One Way, km)</Label>
                            <Input id="commuteDistance" type="number" step="0.1" name="commuteDistance" value={formData.commuteDistance} onChange={handleInputChange} placeholder="e.g., 15.5" />
                            {errors.commuteDistance && <p className="text-sm text-red-500 mt-1">{errors.commuteDistance}</p>}
                        </div>
                        <div>
                            <Label htmlFor="commuteMode">Primary Commute Mode</Label>
                            <Select name="commuteMode" onValueChange={handleSelectChange('commuteMode')} value={formData.commuteMode}>
                                <SelectTrigger id="commuteMode">
                                    <SelectValue placeholder="Select Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Car">Car (Using Primary Vehicle)</SelectItem>
                                    <SelectItem value="Motorbike">Motorbike</SelectItem>
                                    <SelectItem value="Bus">Bus</SelectItem>
                                    <SelectItem value="Train / Metro">Train / Metro</SelectItem>
                                    <SelectItem value="Auto Rickshaw / Taxi">Auto Rickshaw / Taxi</SelectItem>
                                    <SelectItem value="Cycling">Cycling</SelectItem>
                                    <SelectItem value="Walking">Walking</SelectItem>
                                    <SelectItem value="Work From Home">Work From Home</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.commuteMode && <p className="text-sm text-red-500 mt-1">{errors.commuteMode}</p>}
                        </div>
                    </div>
                );
            case 3: // Household
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">🏠 Your Household</h2>
                        <div>
                            <Label htmlFor="householdSize">Household Size (Number of people) <span className="text-red-500">*</span></Label>
                            <Input id="householdSize" type="number" name="householdSize" value={formData.householdSize} onChange={handleInputChange} placeholder="e.g., 4" />
                            {errors.householdSize && <p className="text-sm text-red-500 mt-1">{errors.householdSize}</p>}
                        </div>
                        <div>
                            <Label htmlFor="homeEnergySource">Primary Home Energy Source <span className="text-red-500">*</span></Label>
                            <Select name="homeEnergySource" onValueChange={handleSelectChange('homeEnergySource')} value={formData.homeEnergySource}>
                                <SelectTrigger id="homeEnergySource">
                                    <SelectValue placeholder="Select Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Grid Coal">Grid Electricity (Mostly Coal)</SelectItem>
                                    <SelectItem value="Grid Mix">Grid Electricity (Mixed Sources)</SelectItem>
                                    <SelectItem value="Grid Renewables">Grid Electricity (Mostly Renewables)</SelectItem>
                                    <SelectItem value="Solar Panels">Solar Panels (Own)</SelectItem>
                                    <SelectItem value="Natural Gas">Natural Gas (Heating/Cooking)</SelectItem>
                                    <SelectItem value="LPG Cylinder">LPG Cylinder (Cooking)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.homeEnergySource && <p className="text-sm text-red-500 mt-1">{errors.homeEnergySource}</p>}
                        </div>
                    </div>
                );
            case 4: // Diet
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">🍲 Your Diet</h2>
                        <div>
                            <Label htmlFor="dietType">Typical Diet Type <span className="text-red-500">*</span></Label>
                            <Select name="dietType" onValueChange={handleSelectChange('dietType')} value={formData.dietType}>
                                <SelectTrigger id="dietType">
                                    <SelectValue placeholder="Select Diet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Omnivore">Omnivore (Eat everything)</SelectItem>
                                    <SelectItem value="Omnivore - Low Red Meat">Omnivore (Low Red Meat)</SelectItem>
                                    <SelectItem value="Pescatarian">Pescatarian (Fish, no other meat)</SelectItem>
                                    <SelectItem value="Vegetarian">Vegetarian (No meat or fish)</SelectItem>
                                    <SelectItem value="Vegan">Vegan (No animal products)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.dietType && <p className="text-sm text-red-500 mt-1">{errors.dietType}</p>}
                        </div>
                        <p className="text-sm text-gray-500 pt-4">You're all set! Click Finish to save your profile.</p>
                    </div>
                );
            default:
                return <div>Step {currentStep}</div>;
        }
    };

    if (!isOpen) return null; // Don't render anything if modal shouldn't be open

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()} > {/* Prevent closing by clicking outside */}
                <DialogHeader>
                    <DialogTitle>Complete Your Profile ({currentStep}/{TOTAL_STEPS})</DialogTitle>
                    <Progress value={(currentStep / TOTAL_STEPS) * 100} className="w-full mt-2" />
                </DialogHeader>

                <div className="py-4 min-h-[250px]"> {/* Content area */}
                    {renderStepContent()}
                </div>

                <DialogFooter className="flex justify-between w-full">
                    {/* Left side buttons: Previous / Close */}
                    <div>
                        {currentStep > 1 && (
                            <Button variant="outline" onClick={handlePrevious} disabled={loading}>
                                Previous
                            </Button>
                        )}
                        {/* Maybe add a close/later button? For now, we force completion or skip */}
                        {/* <DialogClose asChild>
                   <Button variant="ghost" disabled={loading}>Later</Button>
               </DialogClose> */}
                    </div>

                    {/* Right side buttons: Skip / Next / Finish */}
                    <div className="flex gap-2">
                        {currentStep < TOTAL_STEPS && ( // Show Skip only before the last step
                            <Button variant="ghost" onClick={handleSkip} disabled={loading}>
                                Skip
                            </Button>
                        )}
                        <Button onClick={handleNext} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {loading ? 'Saving...' : (currentStep === TOTAL_STEPS ? 'Finish & Save' : 'Next')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}