'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"; // <-- Add this line
import { OnboardingModal } from '@/components/OnboardingModal'; // <-- Add this
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">Ecopack AI</span>
        </div>
        <div> {/* <-- Add this div for auth buttons */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow hover:shadow-md">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </nav>

      <div className="container mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Section - Content */}
          <div className="space-y-8">
            {/* AI Tag */}
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              AI-Powered Sustainability
            </div>

            {/* Main Heading */}
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

            {/* Key Metrics */}
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

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/recommend"
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

            {/* Footer Note */}
            <div className="flex items-center gap-2 text-gray-600 pt-6">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">100% Sustainable</span>
            </div>
          </div>

          {/* Right Section - 3D Visualization */}
          <div className="relative lg:h-[600px] lg:w-full">
            {/* Main Container with 3D Effect */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-12 h-full flex items-center justify-center overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[400px] h-[400px] bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full animate-pulse opacity-20"></div>
              </div>

              {/* 3D Floating Package - CSS Transform */}
              <div className="relative z-10 w-[200px] h-[200px] cursor-pointer group">
                <div className="absolute inset-0 perspective-1000 animate-float" style={{
                  transformStyle: 'preserve-3d',
                  animation: 'float 6s ease-in-out infinite'
                }}>
                  {/* Top Face */}
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

                  {/* Front Face */}
                  <div className="absolute w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl flex items-center justify-center"
                    style={{
                      transform: 'translateZ(100px)',
                      transformStyle: 'preserve-3d'
                    }}>
                    <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 6h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2ZM10 4h4v2h-4V4Zm10 16H4V10h16v10Z" />
                    </svg>
                  </div>

                  {/* Side Face */}
                  <div className="absolute w-full h-full bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-2xl"
                    style={{
                      transform: 'rotateY(45deg) translateZ(100px)',
                      transformStyle: 'preserve-3d'
                    }}>
                  </div>
                </div>
              </div>

              {/* Floating Data Particles */}
              <div className="absolute top-12 left-12 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-60"></div>
              <div className="absolute top-20 right-12 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-60 delay-150"></div>
              <div className="absolute bottom-16 left-16 w-4 h-4 bg-orange-400 rounded-full animate-ping opacity-60 delay-300"></div>
              <div className="absolute bottom-12 right-20 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-60 delay-500"></div>

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                <line x1="10%" y1="20%" x2="50%" y2="50%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" strokeDasharray="4" />
                <line x1="90%" y1="20%" x2="50%" y2="50%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" strokeDasharray="4" />
                <line x1="15%" y1="80%" x2="50%" y2="50%" stroke="rgba(251, 146, 60, 0.3)" strokeWidth="2" strokeDasharray="4" />
                <line x1="85%" y1="75%" x2="50%" y2="50%" stroke="rgba(234, 179, 8, 0.3)" strokeWidth="2" strokeDasharray="4" />
              </svg>

              {/* Floating Labels */}
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

              {/* Hexagonal Grid */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-20">
                <div className="flex gap-2">
                  <div className="w-12 h-12 border-2 border-green-300 rounded-lg transform -rotate-12"></div>
                  <div className="w-12 h-12 border-2 border-green-300 rounded-lg transform rotate-12"></div>
                  <div className="w-12 h-12 border-2 border-green-300 rounded-lg transform -rotate-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Why Choose EcoPack AI?" Section */}
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
            {/* Card 1 - Sustainability */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">Sustainability First</h3>

                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Reduce environmental impact by up to 85% with biodegradable, compostable, and recycled packaging solutions
              </p>
              <div className="bg-green-100 rounded-xl p-4 mt-6">
                <div className="text-4xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-600 font-medium">Plastic Reduction</div>
              </div>
            </div>

            {/* Card 2 - Cost */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">Cost Optimization</h3>

                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Smart algorithms find the perfect balance between protection and cost, saving up to 30% on packaging expenses
              </p>
              <div className="bg-blue-100 rounded-xl p-4 mt-6">
                <div className="text-4xl font-bold text-gray-900">30%</div>
                <div className="text-sm text-gray-600 font-medium">Cost Savings</div>
              </div>
            </div>

            {/* Card 3 - Speed */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">Lightning Fast</h3>


                  </div>
                </div>
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
      <OnboardingModal />
    </div>
  );
}

