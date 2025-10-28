'use client';

import { useState } from 'react';

interface ActionLog {
    id: number;
    category: string;
    activity: string;
    amount: number;
    unit: string;
    calculatedCo2e: number;
    loggedAt: string;
}

interface ActionLogTableProps {
    logs: ActionLog[];
    onDelete?: (id: number) => void;
}

export function ActionLogTable({ logs, onDelete }: ActionLogTableProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Debug: Log the first log entry to see what data we're receiving
    if (logs.length > 0 && typeof window !== 'undefined') {
        console.log('📊 ActionLogTable received logs:', logs);
        console.log('📅 Sample log data:', {
            id: logs[0].id,
            loggedAt: logs[0].loggedAt,
            category: logs[0].category,
            activity: logs[0].activity
        });
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this action?')) {
            return;
        }

        setDeletingId(id);
        try {
            const response = await fetch(`/api/action-logs/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success && onDelete) {
                onDelete(id);
            } else {
                alert(result.error || 'Failed to delete action');
            }
        } catch (error) {
            console.error('Error deleting action:', error);
            alert('An error occurred while deleting the action.');
        } finally {
            setDeletingId(null);
        }
    };

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-medium">No actions logged yet</p>
                <p className="text-sm text-gray-500 mt-1">Start tracking your carbon footprint by logging your first action</p>
            </div>
        );
    }

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';

        // Handle both string and Date objects
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return 'N/A';
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            TRANSPORT: 'bg-blue-100 text-blue-800',
            FOOD: 'bg-green-100 text-green-800',
            ENERGY: 'bg-yellow-100 text-yellow-800',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CO₂e (kg)
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(log.loggedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(log.category)}`}>
                                    {log.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {log.activity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {log.amount} {log.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                {Number(log.calculatedCo2e || 0).toFixed(3)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                    onClick={() => handleDelete(log.id)}
                                    disabled={deletingId === log.id}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete this action"
                                >
                                    {deletingId === log.id ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </>
                                    )}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
