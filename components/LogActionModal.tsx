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

export function LogActionModal({ isOpen, onClose, userId }: LogActionModalProps) {
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
    const [loading, setLoading] = useState(false);
    const [manualForm, setManualForm] = useState({
        category: '',
        activity: '',
        amount: '',
        unit: '',
    });
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

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
                                onValueChange={(value) => setManualForm({ ...manualForm, category: value })}
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
                            <Input
                                id="activity"
                                value={manualForm.activity}
                                onChange={(e) => setManualForm({ ...manualForm, activity: e.target.value })}
                                placeholder="e.g., Petrol Car, Chicken Meal"
                                required
                            />
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
                                >
                                    <SelectTrigger id="unit">
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="KM">KM</SelectItem>
                                        <SelectItem value="KG">KG</SelectItem>
                                        <SelectItem value="G">G</SelectItem>
                                        <SelectItem value="KWH">KWH</SelectItem>
                                        <SelectItem value="L">L</SelectItem>
                                        <SelectItem value="DOZEN">Dozen</SelectItem>
                                        <SelectItem value="LITER">Liter</SelectItem>
                                    </SelectContent>
                                </Select>
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
