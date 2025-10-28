'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { VisitorCounter } from '@/components/VisitorCounter';

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Fixed Navigation with Glass Effect */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isScrolledUp ? 'translate-y-0' : '-translate-y-full'
        }`}>
        <div className="bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-lg">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-800">EcoPack AI</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer">Home</a>
              <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer">About Us</a>
              <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer">How It Works</a>
              <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer">Pricing</a>
              <a href="#team" onClick={(e) => handleNavClick(e, 'team')} className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer">Team</a>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer">Contact Us</Link>
              <Link href="/quiz" className="relative text-white font-semibold transition-all duration-300 cursor-pointer bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-5 py-2.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 group flex items-center gap-2 overflow-hidden border border-green-400/30">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <div className="relative">
                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                  </div>
                  <span className="font-bold">Quiz</span>
                </div>
              </Link>
            </div>

            {/* Right side with Auth and Mobile Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow hover:shadow-md">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white/70 backdrop-blur-lg border-t border-white/20 py-4">
              <div className="container mx-auto px-6 space-y-3">
                <a href="#home" onClick={(e) => { handleNavClick(e, 'home'); setIsMobileMenuOpen(false); }} className="block text-gray-700 hover:text-green-600 font-medium transition-colors">Home</a>
                <a href="#about" onClick={(e) => { handleNavClick(e, 'about'); setIsMobileMenuOpen(false); }} className="block text-gray-700 hover:text-green-600 font-medium transition-colors">About Us</a>
                <a href="#how-it-works" onClick={(e) => { handleNavClick(e, 'how-it-works'); setIsMobileMenuOpen(false); }} className="block text-gray-700 hover:text-green-600 font-medium transition-colors">How It Works</a>
                <a href="#pricing" onClick={(e) => { handleNavClick(e, 'pricing'); setIsMobileMenuOpen(false); }} className="block text-gray-700 hover:text-green-600 font-medium transition-colors">Pricing</a>
                <a href="#team" onClick={(e) => { handleNavClick(e, 'team'); setIsMobileMenuOpen(false); }} className="block text-gray-700 hover:text-green-600 font-medium transition-colors">Team</a>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-700 hover:text-green-600 font-medium transition-colors">Contact Us</Link>
                <Link href="/quiz" onClick={() => setIsMobileMenuOpen(false)} className="relative text-white font-bold transition-all duration-300 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-4 py-3 rounded-full shadow-xl flex items-center gap-2 justify-center group overflow-hidden border border-green-400/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="relative">
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                      Take Quiz
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="container mx-auto px-6 pb-12 pt-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Section - Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              AI-Powered Sustainability
            </div>

            <div>
              <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-4 leading-tight">
                EcoPack{' '}
                <span className="text-green-600">AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                Instant, eco-smart packaging picks for every SKU.{' '}
                <span className="font-bold text-green-600">
                  Reduce costs, save the planet.
                </span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6">
              <div>
                <div className="text-4xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-600 mt-1">Plastic Reduction</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">30%</div>
                <div className="text-sm text-gray-600 mt-1">Cost Savings</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600">&lt;1m</div>
                <div className="text-sm text-gray-600 mt-1">Response Time</div>
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose EcoPack AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your packaging strategy with AI-powered sustainability recommendations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Sustainability First</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Reduce environmental impact by up to 85% with biodegradable, compostable, and recycled packaging solutions
              </p>
              <div className="bg-green-100 rounded-xl p-4 mt-6">
                <div className="text-4xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-600 font-medium">Plastic Reduction</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Cost Optimization</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Smart algorithms find the perfect balance between protection and cost, saving up to 30% on packaging expenses
              </p>
              <div className="bg-blue-100 rounded-xl p-4 mt-6">
                <div className="text-4xl font-bold text-gray-900">30%</div>
                <div className="text-sm text-gray-600 font-medium">Cost Savings</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Lightning Fast</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Get instant AI-powered recommendations for any product specification in under 60 seconds
              </p>
              <div className="bg-purple-100 rounded-xl p-4 mt-6">
                <div className="text-4xl font-bold text-gray-900">&lt;1m</div>
                <div className="text-sm text-gray-600 font-medium">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About Us</h2>
            <p className="text-xl text-gray-700 mb-8">
              EcoPack AI is a cutting-edge platform that combines artificial intelligence with environmental consciousness to revolutionize packaging decisions.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To help businesses make sustainable packaging choices that reduce environmental impact while maintaining cost efficiency through AI-powered recommendations.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  A world where every packaging decision is optimized for both business success and environmental protection, creating a sustainable future for all.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Enter Details</h3>
                <p className="text-gray-600">
                  Simply input your product specifications including weight, dimensions, category, and shipping requirements.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h3>
                <p className="text-gray-600">
                  Our advanced AI analyzes your requirements and compares sustainable alternatives based on carbon footprint, cost, and protection.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Get Recommendations</h3>
                <p className="text-gray-600">
                  Receive instant recommendations with detailed analysis of carbon impact, cost savings, and environmental benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">Pricing</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Choose the plan that works for you</p>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">✓ 10 recommendations/month</li>
                <li className="flex items-center gap-2 text-gray-600">✓ Basic carbon footprint tracking</li>
                <li className="flex items-center gap-2 text-gray-600">✓ Standard support</li>
              </ul>
              <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors">
                Get Started
              </button>
            </div>
            <div className="bg-green-600 rounded-3xl p-8 shadow-2xl border-4 border-green-500 transform scale-105">
              <div className="bg-green-700 text-white px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
              <div className="text-4xl font-bold text-white mb-6">$29<span className="text-lg text-green-100">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white">✓ Unlimited recommendations</li>
                <li className="flex items-center gap-2 text-white">✓ Advanced analytics</li>
                <li className="flex items-center gap-2 text-white">✓ Priority support</li>
                <li className="flex items-center gap-2 text-white">✓ Historical tracking</li>
              </ul>
              <button className="w-full bg-white text-green-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </button>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">Custom</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">✓ Everything in Pro</li>
                <li className="flex items-center gap-2 text-gray-600">✓ API access</li>
                <li className="flex items-center gap-2 text-gray-600">✓ Custom integrations</li>
                <li className="flex items-center gap-2 text-gray-600">✓ Dedicated support</li>
              </ul>
              <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">Our Team</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Meet the people behind EcoPack AI</p>
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
            {[
              { name: 'John Doe', role: 'CEO & Founder', img: '👨‍💼' },
              { name: 'Jane Smith', role: 'CTO', img: '👩‍💻' },
              { name: 'Mike Johnson', role: 'Lead Developer', img: '👨‍💻' },
              { name: 'Sarah Williams', role: 'Sustainability Expert', img: '👩‍🔬' },
            ].map((member, idx) => (
              <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  {member.img}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-green-50/50"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-green-50/50"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={contactForm.company}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-green-50/50"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-green-50/50 resize-none"
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
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Email</h3>
                      <a href="mailto:ecopackai@gmail.com" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                        ecopackai@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Office */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Office</h3>
                      <p className="text-gray-600">San Francisco, CA 94105</p>
                      <p className="text-gray-600">United States</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Choose EcoPack AI */}
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose EcoPack AI?</h2>

                <div className="space-y-4">
                  {[
                    'Instant AI-powered recommendations',
                    'Reduce costs by up to 30%',
                    'Lower carbon footprint by 85%',
                    'Expert support team',
                    'Trusted by 500+ businesses'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{benefit}</span>
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
