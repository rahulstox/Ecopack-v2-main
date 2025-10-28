'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
    Home,
    Activity,
    BarChart3,
    FileText,
    Settings,
    Leaf
} from 'lucide-react';

interface SidebarProps {
    totalCo2eSaved?: number;
}

export function Sidebar({ totalCo2eSaved = 0 }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useUser();

    const menuItems = [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Activity, label: 'Live Tracker', href: '/tracker' },
        { icon: BarChart3, label: 'Reports', href: '/reports' },
        { icon: Leaf, label: 'Recommendations', href: '/recommend' },
        { icon: FileText, label: 'History', href: '/history' },
        { icon: Settings, label: 'Profile & Settings', href: '/onboarding' },
    ];

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-green-600 to-emerald-700 text-white hidden lg:block z-40">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Ecopack-Ai</h1>
                        <p className="text-xs text-white/70">Greener Packaging</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        const linkContent = (
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-white/20 backdrop-blur-sm text-white font-semibold'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    } ${item.href === '#' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {item.href === '#' && <span className="text-xs ml-auto opacity-50">Soon</span>}
                            </div>
                        );

                        if (item.href === '#') {
                            return (
                                <div key={`sidebar-item-${index}`}>
                                    {linkContent}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={`sidebar-item-${index}`}
                                href={item.href}
                            >
                                {linkContent}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="absolute bottom-0 w-full p-6 border-t border-white/20">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-white/90 mb-2">Total CO₂e Saved</p>
                    <p className="text-2xl font-bold">{totalCo2eSaved.toFixed(2)} kg</p>
                    <p className="text-xs text-white/70 mt-1">This month</p>
                </div>
                {user && (
                    <div className="mt-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">{user.firstName?.[0] || 'U'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {user.firstName || 'User'} {user.lastName || ''}
                            </p>
                            <p className="text-xs text-white/70 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
