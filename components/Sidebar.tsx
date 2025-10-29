'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useTheme } from '@/contexts/ThemeContext';
import {
    Home,
    Activity,
    BarChart3,
    FileText,
    Settings,
    Leaf,
    Sun,
    Moon,
    Menu,
    X
} from 'lucide-react';

interface SidebarProps {
    totalCo2eSaved?: number;
}

export function Sidebar({ totalCo2eSaved = 0 }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useUser();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Leaf, label: 'Recommendations', href: '/recommend' },
        { icon: Activity, label: 'Live Tracker', href: '/tracker' },
        { icon: BarChart3, label: 'Reports', href: '/reports' },
        { icon: Settings, label: 'Profile & Settings', href: '/onboarding' },
    ];

    const sidebarContent = (
        <>
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative h-full flex flex-col">
                <div className="p-4 sm:p-6 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6 lg:mb-8">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all cursor-pointer group flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                                <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Ecopack-Ai</h1>
                                <p className="text-xs text-white/80 font-medium">Greener Packaging</p>
                            </div>
                        </Link>
                        {/* Mobile close button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    <nav className="space-y-1.5">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            const linkContent = (
                                <div
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-white/25 backdrop-blur-md text-white font-semibold shadow-lg scale-[1.02]'
                                        : 'text-white/85 hover:bg-white/15 hover:text-white hover:scale-[1.01]'
                                        } ${item.href === '#' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                >
                                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : ''}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm">{item.label}</span>
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

                {/* Theme Switcher */}
                <div className="px-4 sm:px-6 mb-4 flex-shrink-0">
                    <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 sm:p-3.5 shadow-lg border border-white/10">
                        <p className="text-xs text-white/90 mb-2.5 font-semibold">Theme</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTheme('green')}
                                className={`flex-1 p-2 sm:p-2.5 rounded-lg transition-all duration-300 ${theme === 'green'
                                    ? 'bg-white text-green-600 shadow-md scale-105'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:scale-105'
                                    }`}
                                title="Light Theme"
                            >
                                <Sun className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex-1 p-2 sm:p-2.5 rounded-lg transition-all duration-300 ${theme === 'dark'
                                    ? 'bg-white text-green-600 shadow-md scale-105'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:scale-105'
                                    }`}
                                title="Dark Theme"
                            >
                                <Moon className="w-4 h-4 mx-auto" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - CO2e Saved */}
                <div className="mt-auto px-4 sm:px-6 pb-4 sm:pb-6 flex-shrink-0">
                    <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/20 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-white">Total CO₂e Saved</p>
                        </div>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1 tracking-tight">{Number(totalCo2eSaved || 0).toFixed(2)} kg</p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                            <p className="text-xs text-white/90 font-medium">This month</p>
                        </div>
                    </div>
                    {user && (
                        <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/10">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg flex-shrink-0">
                                <span className="text-sm sm:text-base font-bold text-white">{user.firstName?.[0] || 'U'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-white truncate">
                                    {user.firstName || 'User'} {user.lastName || ''}
                                </p>
                                <p className="text-xs text-white/75 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="fixed top-4 left-4 lg:hidden z-50 bg-gradient-to-br from-emerald-600 to-green-600 text-white p-3 rounded-xl shadow-2xl hover:scale-105 transition-transform"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar - Desktop */}
            <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white hidden lg:block z-40 shadow-2xl">
                {sidebarContent}
            </div>

            {/* Sidebar - Mobile */}
            <div
                className={`fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </div>
        </>
    );
}
