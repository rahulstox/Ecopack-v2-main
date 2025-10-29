'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { VisitorCounter } from '@/components/VisitorCounter';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [isScrolledUp, setIsScrolledUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [contactStatus, setContactStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsScrolledUp(true);
      } else if (currentScrollY > lastScrollY) {
        setIsScrolledUp(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setContactStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      const result = await response.json();

      if (result.success) {
        setContactStatus({ type: 'success', message: 'Message sent successfully! We\'ll get back to you soon.' });
        setContactForm({ name: '', email: '', company: '', message: '' });
      } else {
        setContactStatus({ type: 'error', message: result.error || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      setContactStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
      : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
      }`}>
      {/* Fixed Navigation with Glass Effect */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isScrolledUp ? 'translate-y-0' : '-translate-y-full'
        }`}>
        <div className={`backdrop-blur-lg border-b shadow-lg ${theme === 'dark'
          ? 'bg-gray-900/95 border-gray-600/30'
          : 'bg-white/70 border-white/20'
          }`}>
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className={`text-xl lg:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  EcoPack AI
                </span>
              </div>

              {/* Center Navigation Links */}
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-800' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}>Home</a>
                <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-800' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}>About</a>
                <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-800' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}>How It Works</a>
                <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-800' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}>Pricing</a>
                <a href="#team" onClick={(e) => handleNavClick(e, 'team')} className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-800' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}>Team</a>
                <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className={`px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-800' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}>Contact</a>
              </div>

              {/* Right Section: Quiz, Theme Switcher, Auth */}
              <div className="flex items-center gap-2 lg:gap-3">
                {/* Quiz Button - Desktop */}
                <Link href="/quiz" className="hidden lg:flex relative items-center gap-2 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden border border-green-400/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <svg className="relative w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="relative text-sm font-bold">Quiz</span>
                </Link>

                {/* Theme Switcher */}
                <div className={`hidden lg:flex items-center gap-1 backdrop-blur-sm rounded-lg px-1.5 py-1.5 ${theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/50'
                  }`}>
                  <button
                    onClick={() => setTheme('green')}
                    className={`p-1.5 rounded-md transition-all ${theme === 'green' ? 'bg-green-600 text-white shadow-md' : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-green-100')
                      }`}
                    title="Green Theme"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    title="Dark Theme"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`lg:hidden p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>

                {/* Auth Buttons */}
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="hidden lg:block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="hidden lg:flex items-center gap-2">
                    <Link href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm">
                      Dashboard
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className={`lg:hidden backdrop-blur-lg border-t ${theme === 'dark'
              ? 'bg-gray-800/95 border-gray-700/30'
              : 'bg-white/95 border-white/30'
              }`}>
              <div className="container mx-auto px-4 py-4">
                {/* Navigation Links */}
                <div className="space-y-1 mb-4">
                  <a
                    href="#home"
                    onClick={(e) => { handleNavClick(e, 'home'); setIsMobileMenuOpen(false); }}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                  >
                    Home
                  </a>
                  <a
                    href="#about"
                    onClick={(e) => { handleNavClick(e, 'about'); setIsMobileMenuOpen(false); }}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                  >
                    About
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={(e) => { handleNavClick(e, 'how-it-works'); setIsMobileMenuOpen(false); }}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                  >
                    How It Works
                  </a>
                  <a
                    href="#pricing"
                    onClick={(e) => { handleNavClick(e, 'pricing'); setIsMobileMenuOpen(false); }}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                  >
                    Pricing
                  </a>
                  <a
                    href="#team"
                    onClick={(e) => { handleNavClick(e, 'team'); setIsMobileMenuOpen(false); }}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                  >
                    Team
                  </a>
                  <a
                    href="#contact"
                    onClick={(e) => { handleNavClick(e, 'contact'); setIsMobileMenuOpen(false); }}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark' ? 'text-gray-200 hover:text-green-400 hover:bg-gray-700' : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                      }`}
                  >
                    Contact
                  </a>
                </div>

                {/* Quiz Button */}
                <Link
                  href="/quiz"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-bold px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-green-400/30 mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Take Quiz</span>
                </Link>

                {/* Theme Switcher */}
                <div className={`backdrop-blur-sm rounded-lg p-3 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/50'
                  }`}>
                  <p className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Theme</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setTheme('green'); setIsMobileMenuOpen(false); }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${theme === 'green' ? 'bg-green-600 text-white shadow-md' : (theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-green-50')
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span className="text-sm font-medium">Green</span>
                    </button>
                    <button
                      onClick={() => { setTheme('dark'); setIsMobileMenuOpen(false); }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                  </div>
                </div>

                {/* Auth Section */}
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-md">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="block w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-md text-center"
                  >
                    Dashboard
                  </Link>
                </SignedIn>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className={`container mx-auto px-6 pb-12 pt-8 ${theme === 'dark' ? 'text-white' : ''}`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Section - Content */}
          <div className="space-y-8">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${theme === 'dark' ? 'bg-green-700' : 'bg-green-600'
              } text-white`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              AI-Powered Sustainability
            </div>

            <div>
              <h1 className={`text-6xl md:text-7xl font-extrabold mb-4 leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                EcoPack{' '}
                <span className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>AI</span>
              </h1>
              <p className={`text-xl md:text-2xl leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Instant, eco-smart packaging picks for every SKU.{' '}
                <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  Reduce costs, save the planet.
                </span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6">
              <div>
                <div className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>85%</div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Plastic Reduction</div>
              </div>
              <div>
                <div className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>30%</div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cost Savings</div>
              </div>
              <div>
                <div className={`text-4xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>&lt;20s</div>
                <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Response Time</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Right Section - 3D Visualization */}
          <div className="relative lg:h-[600px] lg:w-full">
            <div className="relative bg-white rounded-3xl shadow-2xl p-12 h-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[400px] h-[400px] bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full animate-pulse opacity-20"></div>
              </div>

              <div className="relative z-10 w-[200px] h-[200px] cursor-pointer group">
                <div className="absolute inset-0 perspective-1000 animate-float" style={{
                  transformStyle: 'preserve-3d',
                  animation: 'float 6s ease-in-out infinite'
                }}>
                  <div className="absolute w-full h-full bg-gradient-to-br from-green-400 to-green-500 rounded-2xl shadow-2xl"
                    style={{
                      transform: 'rotateX(45deg) translateZ(80px)',
                      transformStyle: 'preserve-3d'
                    }}>
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white">
                      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" opacity="0.3" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl flex items-center justify-center"
                    style={{
                      transform: 'translateZ(100px)',
                      transformStyle: 'preserve-3d'
                    }}>
                    <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 6h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2ZM10 4h4v2h-4V4Zm10 16H4V10h16v10Z" />
                    </svg>
                  </div>

                  <div className="absolute w-full h-full bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-2xl"
                    style={{
                      transform: 'rotateY(45deg) translateZ(100px)',
                      transformStyle: 'preserve-3d'
                    }}>
                  </div>
                </div>
              </div>

              <div className="absolute top-8 right-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl px-4 py-2.5 shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-green-700">350g CO₂ Saved</span>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl px-4 py-2.5 shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-blue-700">$0.15/unit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              Why Choose EcoPack AI?
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Transform your packaging strategy with AI-powered sustainability recommendations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className={`rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${theme === 'dark'
              ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
              } border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sustainability First</h3>
              </div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Get personalized carbon footprint tracking and sustainable packaging recommendations tailored to your business needs
              </p>
              <div className={`rounded-xl p-4 mt-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-green-100'}`}>
                <div className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Real-time</div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>CO₂e Tracking</div>
              </div>
            </div>

            <div className={`rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${theme === 'dark'
              ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600'
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100'
              } border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cost Optimization</h3>
              </div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Smart AI recommendations help you balance sustainability and cost, saving up to 30% while meeting product requirements
              </p>
              <div className={`rounded-xl p-4 mt-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-blue-100'}`}>
                <div className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>30%</div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Cost Savings</div>
              </div>
            </div>

            <div className={`rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${theme === 'dark'
              ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600'
              : 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100'
              } border`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Lightning Fast</h3>
              </div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Get instant AI-powered packaging recommendations in under 20 seconds with detailed PDF reports and comparisons
              </p>
              <div className={`rounded-xl p-4 mt-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-purple-100'}`}>
                <div className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>&lt;20s</div>
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Processing Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className={`py-20 ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-green-50 to-emerald-50'
        }`}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>About Us</h2>
            <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
              EcoPack AI is a cutting-edge platform that combines artificial intelligence with environmental consciousness to revolutionize packaging decisions.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className={`rounded-2xl p-8 shadow-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                }`}>
                <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Our Mission</h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  To help businesses make sustainable packaging choices that reduce environmental impact while maintaining cost efficiency through AI-powered recommendations.
                </p>
              </div>
              <div className={`rounded-2xl p-8 shadow-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                }`}>
                <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Our Vision</h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  A world where every packaging decision is optimized for both business success and environmental protection, creating a sustainable future for all.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`py-20 ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'
        }`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-6xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>How It Works</h2>
            <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Get AI-powered packaging recommendations in just three simple steps
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative mb-12">
              {/* Connection Line */}
              <div className="hidden md:block absolute left-1/2 top-24 w-0.5 h-64 bg-gradient-to-b from-green-400 via-emerald-500 to-purple-400"></div>

              {/* Step Container */}
              <div className={`relative rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border group ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-100'
                }`}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Icon Circle */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden md:flex">
                      <div className="w-0 h-0 border-t-[12px] border-b-[12px] border-r-[12px] border-t-transparent border-b-transparent border-r-green-600"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${theme === 'dark' ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-700'
                      }`}>Step 1</div>
                    <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Enter Product Details</h3>
                    <p className={`text-lg leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Input your product specifications including weight, dimensions, category, and shipping requirements. Our intuitive interface makes it quick and easy.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-green-800 text-green-300' : 'bg-green-50 text-green-700'
                        }`}>Weight & Dimensions</span>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-green-800 text-green-300' : 'bg-green-50 text-green-700'
                        }`}>Category</span>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-green-800 text-green-300' : 'bg-green-50 text-green-700'
                        }`}>Shipping Needs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative mb-12">
              {/* Step Container */}
              <div className={`relative rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border group ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'
                }`}>
                <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                  {/* Icon Circle */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <div className="w-28 h-28 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden md:flex">
                      <div className="w-0 h-0 border-t-[12px] border-b-[12px] border-l-[12px] border-t-transparent border-b-transparent border-l-blue-600"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${theme === 'dark' ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>Step 2</div>
                    <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>AI Powered Analysis</h3>
                    <p className={`text-lg leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Our advanced AI analyzes your requirements and compares sustainable alternatives based on carbon footprint, cost, durability, and protection level.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700'
                        }`}>Carbon Analysis</span>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700'
                        }`}>Cost Comparison</span>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700'
                        }`}>Sustainability Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              {/* Step Container */}
              <div className={`relative rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border group ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'
                }`}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Icon Circle */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <div className="w-28 h-28 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${theme === 'dark' ? 'bg-purple-800 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>Step 3</div>
                    <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Get Instant Recommendations</h3>
                    <p className={`text-lg leading-relaxed mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      Receive instant AI-powered recommendations with detailed analysis of carbon impact, cost savings, environmental benefits, and packaging alternatives.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-purple-800 text-purple-300' : 'bg-purple-50 text-purple-700'
                        }`}>Detailed Report</span>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-purple-800 text-purple-300' : 'bg-purple-50 text-purple-700'
                        }`}>Cost Savings</span>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-purple-800 text-purple-300' : 'bg-purple-50 text-purple-700'
                        }`}>Eco Impact</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl group"
              >
                <span>Get Started Now</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-20 ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 to-cyan-50'
        }`}>
        <div className="container mx-auto px-6">
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Pricing</h2>
          <p className={`text-xl text-center mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Choose the plan that works for you</p>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className={`rounded-3xl p-8 shadow-xl border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
              <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Free</h3>
              <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>$0<span className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>/month</span></div>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Perfect to get started</p>
              <ul className="space-y-3 mb-8">
                {/* Included Features */}
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>10 recommendations/month</span>
                </li>
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic carbon tracking</span>
                </li>
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Standard support</span>
                </li>
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>PDF export</span>
                </li>
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>7-day history</span>
                </li>

                {/* Not Included Features - Pro Features Preview */}
                <li className={`flex items-center gap-2 opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="line-through">Unlimited recommendations</span>
                </li>
                <li className={`flex items-center gap-2 opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="line-through">Advanced analytics</span>
                </li>
                <li className={`flex items-center gap-2 opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="line-through">Priority support (24/7)</span>
                </li>
                <li className={`flex items-center gap-2 opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="line-through">Unlimited historical tracking</span>
                </li>
                <li className={`flex items-center gap-2 opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="line-through">Team collaboration</span>
                </li>
              </ul>
              <button className={`w-full py-3 rounded-xl font-semibold transition-all ${theme === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}>
                Get Started
              </button>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-8 shadow-2xl border-4 border-green-500 transform scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative">
                <div className="bg-green-700 text-white px-4 py-1.5 rounded-full text-sm font-bold inline-block mb-4 shadow-lg">
                  🌟 Most Popular
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
                <div className="text-4xl font-bold text-white mb-2">$29<span className="text-lg text-green-100">/month</span></div>
                <p className="text-green-100 text-sm mb-6">Everything you need to scale</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">✨ Unlimited recommendations</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">📊 Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">🚀 Priority support (24/7)</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">📈 Historical tracking (unlimited)</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">📄 Custom branded reports</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">👥 Team collaboration tools</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">🔔 Real-time alerts & notifications</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">📱 Multi-device sync</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 flex-shrink-0 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">🎯 Goal tracking & milestones</span>
                  </li>
                </ul>
                <button className="w-full bg-white text-green-600 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                  Get Started Now
                </button>
              </div>
            </div>
            <div className={`rounded-3xl p-8 shadow-xl border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
              <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Enterprise</h3>
              <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Custom</div>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Tailored for large organizations</p>
              <ul className="space-y-3 mb-8">
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Everything in Pro</span>
                </li>
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Full API access</span>
                </li>
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Custom integrations</span>
                </li>
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Dedicated account manager</span>
                </li>
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>SLA guarantee</span>
                </li>
                <li className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>White-label options</span>
                </li>
              </ul>
              <button className={`w-full py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${theme === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className={`py-20 ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-green-50 to-emerald-50'
        }`}>
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${theme === 'dark' ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-700'
              }`}>
              Our Team
            </div>
            <h2 className={`text-4xl md:text-6xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              Meet the Minds Behind EcoPack AI
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Passionate innovators dedicated to creating a sustainable future.
            </p>
          </div>

          {/* Team Members */}
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Rahul Gupta - Lead Developer */}
            <div className={`rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <img
                    src="/team/rahul.jpg"
                    alt="Rahul Gupta"
                    className="w-28 h-28 rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="112" height="112"%3E%3Crect fill="%23667eea" width="112" height="112" rx="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".35em" fill="white" font-size="48" font-family="Arial"%3ERG%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Rahul Gupta</h3>
                <p className="text-green-600 font-semibold text-lg mb-4">Lead Developer</p>
                <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  Full-stack developer passionate about building scalable applications and innovative solutions for sustainability.
                </p>
                <div className="flex items-center gap-3">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors group">
                    <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors group">
                    <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Pratistha Gupta - Lead Developer */}
            <div className={`rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <img
                    src="/team/pratistha.jpg"
                    alt="Pratistha Gupta"
                    className="w-28 h-28 rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="112" height="112"%3E%3Crect fill="%23f43f5e" width="112" height="112" rx="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".35em" fill="white" font-size="48" font-family="Arial"%3EPG%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Pratishtha Gupta</h3>
                <p className="text-green-600 font-semibold text-lg mb-4">Lead Developer</p>
                <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  Full-stack developer passionate about building sustainable applications and innovative solutions for environmental impact.
                </p>
                <div className="flex items-center gap-3">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors group">
                    <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors group">
                    <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}>
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className={`text-5xl md:text-6xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Get in Touch</h2>
            <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Form */}
            <div className={`rounded-3xl shadow-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Send us a Message</h2>

              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-green-200 bg-green-50/50'
                      }`}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-green-200 bg-green-50/50'
                      }`}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={contactForm.company}
                    onChange={handleContactChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-green-200 bg-green-50/50'
                      }`}
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    rows={5}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-green-200 bg-green-50/50'
                      }`}
                    placeholder="Tell us about your packaging needs..."
                  />
                </div>

                {contactStatus.message && (
                  <div className={`p-4 rounded-xl ${contactStatus.type === 'success'
                    ? 'bg-green-100 border-2 border-green-500 text-green-800'
                    : 'bg-red-100 border-2 border-red-500 text-red-800'
                    }`}>
                    {contactStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column - Contact Info & Benefits */}
            <div className="space-y-8">
              {/* Contact Information */}
              <div className={`rounded-3xl shadow-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Contact Information</h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-green-800' : 'bg-green-100'
                      }`}>
                      <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>Email</h3>
                      <a href="mailto:ecopackai@gmail.com" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                        ecopackai@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Office */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-green-800' : 'bg-green-100'
                      }`}>
                      <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>Office</h3>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>San Francisco, CA 94105</p>
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>United States</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Choose EcoPack AI */}
              <div className={`rounded-3xl shadow-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Why Choose EcoPack AI?</h2>

                <div className="space-y-4">
                  {[
                    'AI-powered recommendations in under 30 seconds',
                    'Real-time carbon footprint tracking',
                    'Detailed PDF reports with comparisons',
                    'Up to 25% cost savings on packaging',
                    'Free forever - no hidden costs'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-green-800' : 'bg-green-100'
                        }`}>
                        <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xl font-bold">EcoPack AI</span>
              </div>
              <p className="text-gray-400">Making packaging sustainable, one decision at a time.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-white transition-colors cursor-pointer">About Us</a></li>
                <li><a href="#team" onClick={(e) => handleNavClick(e, 'team')} className="hover:text-white transition-colors cursor-pointer">Our Team</a></li>
                <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-white transition-colors cursor-pointer">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 EcoPack AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Visitor Counter */}
      <VisitorCounter />
    </div>
  );
}
