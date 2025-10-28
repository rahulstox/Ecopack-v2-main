'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface LogActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

// Define activities and units by category
const ACTIVITIES_BY_CATEGORY = {
    TRANSPORT: ['Car Drive', 'Bus Ride', 'Train Ride', 'Flight', 'Motorcycle', 'Bike Ride', 'Walk'],
    FOOD: ['Beef Meal', 'Chicken Meal', 'Pork Meal', 'Fish Meal', 'Eggs', 'Milk', 'Cheese', 'Rice', 'Vegetables', 'Fruits', 'Veg Meal'],
    ENERGY: ['Electricity', 'Natural Gas', 'Solar Power', 'Heating', 'Cooling'],
    PACKAGING: ['Plastic Packaging', 'Cardboard', 'Paper', 'Glass Bottle', 'Metal Can', 'Aluminum'],
    WASTE: ['Plastic Waste', 'Paper Waste', 'Glass Waste', 'Metal Waste', 'Organic Waste', 'Electronic Waste'],
};

const UNITS_BY_CATEGORY = {
    TRANSPORT: ['KM', 'Miles'],
    FOOD: ['G', 'KG', 'L', 'LITER', 'DOZEN'],
    ENERGY: ['KWH', 'MWh'],
    PACKAGING: ['KG', 'G', 'Pieces'],
    WASTE: ['KG', 'G', 'Bags'],
};

export function LogActionModal({ isOpen, onClose, userId }: LogActionModalProps) {
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
    const [loading, setLoading] = useState(false);
    const [manualForm, setManualForm] = useState({
        category: '',
        activity: '',
        amount: '',
        unit: '',
    });
    const [activitySearch, setActivitySearch] = useState('');
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // Get filtered activities based on search
    const getFilteredActivities = () => {
        if (!manualForm.category) return [];
        const activities = ACTIVITIES_BY_CATEGORY[manualForm.category as keyof typeof ACTIVITIES_BY_CATEGORY] || [];
        if (!activitySearch) return activities;
        return activities.filter(activity =>
            activity.toLowerCase().includes(activitySearch.toLowerCase())
        );
    };

    // Get available units based on category
    const getAvailableUnits = () => {
        if (!manualForm.category) return [];
        return UNITS_BY_CATEGORY[manualForm.category as keyof typeof UNITS_BY_CATEGORY] || [];
    };

    // Auto-select first unit when category changes
    const handleCategoryChange = (category: string) => {
        const units = UNITS_BY_CATEGORY[category as keyof typeof UNITS_BY_CATEGORY] || [];
        setManualForm({
            ...manualForm,
            category,
            activity: '',
            unit: units[0] || '',
        });
        setActivitySearch('');
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/log-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    category: manualForm.category,
                    activity: manualForm.activity,
                    amount: parseFloat(manualForm.amount),
                    unit: manualForm.unit,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Reset form
                setManualForm({ category: '', activity: '', amount: '', unit: '' });
                onClose();
            } else {
                alert(`Error: ${result.error || 'Failed to log action'}`);
            }
        } catch (error) {
            console.error('Error logging action:', error);
            alert('An error occurred while logging the action.');
        } finally {
            setLoading(false);
        }
    };

    const handleAISubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAiLoading(true);

        try {
            const response = await fetch('/api/log-action-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    rawInput: aiInput,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Reset form
                setAiInput('');
                onClose();
            } else {
                alert(`Error: ${result.error || 'Failed to process AI request'}`);
            }
        } catch (error) {
            console.error('Error processing AI input:', error);
            alert('An error occurred while processing your request.');
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Log New Action</DialogTitle>
                    <DialogClose />
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-2 px-4 font-medium transition-colors ${activeTab === 'manual'
                            ? 'border-b-2 border-green-600 text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Manual Entry
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('ai')}
                        className={`flex-1 py-2 px-4 font-medium transition-colors ${activeTab === 'ai'
                            ? 'border-b-2 border-green-600 text-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Log with AI
                    </button>
                </div>

                {/* Manual Entry Tab */}
                {activeTab === 'manual' && (
                    <form onSubmit={handleManualSubmit} className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={manualForm.category}
                                onValueChange={handleCategoryChange}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TRANSPORT">Transport</SelectItem>
                                    <SelectItem value="FOOD">Food</SelectItem>
                                    <SelectItem value="ENERGY">Energy</SelectItem>
                                    <SelectItem value="PACKAGING">Packaging</SelectItem>
                                    <SelectItem value="WASTE">Waste</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="activity">Activity *</Label>
                            <div className="relative">
                                <Input
                                    id="activity"
                                    value={activitySearch}
                                    onChange={(e) => {
                                        setActivitySearch(e.target.value);
                                        setManualForm({ ...manualForm, activity: e.target.value });
                                    }}
                                    placeholder="Search or type activity..."
                                    required
                                />
                                {activitySearch && getFilteredActivities().length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                        {getFilteredActivities().map((activity) => (
                                            <button
                                                key={activity}
                                                type="button"
                                                className="w-full text-left px-4 py-2 hover:bg-green-50 hover:text-green-700 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                                                onClick={() => {
                                                    setManualForm({ ...manualForm, activity });
                                                    setActivitySearch(activity);
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                    <span className="font-medium">{activity}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {!activitySearch && manualForm.category && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Start typing to search: {getFilteredActivities().slice(0, 3).join(', ')}...
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={manualForm.amount}
                                    onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                                    placeholder="e.g., 10"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="unit">Unit *</Label>
                                <Select
                                    value={manualForm.unit}
                                    onValueChange={(value) => setManualForm({ ...manualForm, unit: value })}
                                    disabled={!manualForm.category}
                                >
                                    <SelectTrigger id="unit">
                                        <SelectValue placeholder={manualForm.category ? "Select unit" : "Select category first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableUnits().map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {manualForm.category && manualForm.unit && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        ✓ Unit auto-selected for {manualForm.category.toLowerCase()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Manually'
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                {/* AI Tab */}
                {activeTab === 'ai' && (
                    <form onSubmit={handleAISubmit} className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="ai-input">Describe your activity</Label>
                            <textarea
                                id="ai-input"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder="e.g., I drove 15 km to work today, or I had 200g of chicken for lunch"
                                className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                The AI will automatically categorize and calculate your carbon footprint.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={aiLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={aiLoading}>
                                {aiLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Log with AI'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
