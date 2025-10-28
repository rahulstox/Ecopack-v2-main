'use client';

import { useState, useEffect } from 'react';

export function VisitorCounter() {
    const [count, setCount] = useState(25);

    useEffect(() => {
        // Check if visitor is unique for this session
        const hasVisited = sessionStorage.getItem('hasVisited');

        if (!hasVisited) {
            // First visit in this session - increment count
            fetch('/api/visitors', {
                method: 'POST'
            }).then(() => {
                sessionStorage.setItem('hasVisited', 'true');
            });
        }

        // Get current count
        fetch('/api/visitors')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.count) {
                    setCount(data.count);
                }
            })
            .catch(err => console.error('Error fetching visitor count:', err));
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-6 py-3 shadow-2xl border-4 border-white flex items-center gap-3 hover:scale-110 transition-transform cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
                <div className="w-4 h-4 bg-white rounded-full absolute"></div>
                <span className="text-white font-bold text-lg">
                    <span>{count.toLocaleString()}+</span> <span className="text-sm">Visitors</span>
                </span>
            </div>
        </div>
    );
}

