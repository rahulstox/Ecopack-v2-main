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
        <div className="fixed bottom-6 right-6 z-40">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-6 py-3 shadow-xl flex items-center gap-3 hover:scale-110 transition-transform cursor-pointer">
                <div className="relative w-3.5 h-3.5">
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-80"></div>
                    <div className="absolute inset-0 bg-white rounded-full"></div>
                </div>
                <span className="text-white font-bold text-base sm:text-lg">
                    <span>{count.toLocaleString()}+</span> <span className="text-xs sm:text-sm">Visitors</span>
                </span>
            </div>
        </div>
    );
}

