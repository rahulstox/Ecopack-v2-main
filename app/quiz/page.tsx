'use client';

import { useState, useEffect } from 'react';
import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { CheckCircle2, XCircle, Sparkles, Award, RefreshCw, Home, TrendingUp, Leaf, Lightbulb, Target, Zap, Trophy, ArrowLeft, Clock, Star, BarChart3 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// Quiz questions database
const quizQuestions = [
    {
        id: 1,
        question: "What percentage of plastic waste is recycled globally?",
        options: ["10-15%", "25-30%", "35-40%", "50-55%"],
        correct: 0,
        explanation: "Only about 10-15% of plastic waste is recycled globally."
    },
    {
        id: 2,
        question: "Which material has the lowest carbon footprint for packaging?",
        options: ["Plastic", "Aluminum", "Cardboard", "Glass"],
        correct: 2,
        explanation: "Cardboard typically has the lowest carbon footprint."
    },
    {
        id: 3,
        question: "How long does it take for a plastic bottle to decompose?",
        options: ["5-10 years", "20-30 years", "450 years", "1000+ years"],
        correct: 2,
        explanation: "Plastic bottles can take 450 years or more to decompose."
    },
    {
        id: 4,
        question: "What is the most sustainable packaging material?",
        options: ["Single-use plastic", "Recycled cardboard", "Expanded polystyrene", "Virgin plastic"],
        correct: 1,
        explanation: "Recycled cardboard is one of the most sustainable packaging options."
    },
    {
        id: 5,
        question: "How much CO2 can be saved by switching to biodegradable packaging?",
        options: ["10-20%", "30-40%", "50-70%", "80-100%"],
        correct: 2,
        explanation: "Biodegradable packaging can save 50-70% of CO2 emissions."
    },
    {
        id: 6,
        question: "Which packaging is best for food preservation and sustainability?",
        options: ["Styrofoam", "Plastic wrap", "Biodegradable containers", "Aluminum foil"],
        correct: 2,
        explanation: "Biodegradable containers offer both preservation and sustainability."
    },
    {
        id: 7,
        question: "What is the carbon footprint of packaging in global supply chains?",
        options: ["2-5%", "8-12%", "15-20%", "25-30%"],
        correct: 1,
        explanation: "Packaging contributes to 8-12% of carbon emissions in supply chains."
    },
    {
        id: 8,
        question: "Which is the most recyclable packaging material?",
        options: ["Polyethylene plastic", "Aluminum", "Glass", "Compostable materials"],
        correct: 1,
        explanation: "Aluminum is infinitely recyclable without losing quality."
    },
    {
        id: 9,
        question: "How much landfill space could be saved by using sustainable packaging?",
        options: ["10-15%", "20-30%", "40-50%", "60-70%"],
        correct: 2,
        explanation: "Sustainable packaging could save 40-50% of landfill space."
    },
    {
        id: 10,
        question: "What makes packaging 'biodegradable'?",
        options: ["It breaks down quickly", "It decomposes naturally", "It meets compostable standards", "All of the above"],
        correct: 3,
        explanation: "Biodegradable packaging breaks down naturally and meets environmental standards."
    },
    {
        id: 11,
        question: "Which is more sustainable: single-use or reusable packaging?",
        options: ["Single-use is always better", "Reusable is always better", "Depends on material type", "They are equal"],
        correct: 2,
        explanation: "Sustainability depends on material type and usage patterns."
    },
    {
        id: 12,
        question: "What percentage of packaging waste ends up in oceans?",
        options: ["5-8%", "10-15%", "18-25%", "30-40%"],
        correct: 1,
        explanation: "Approximately 10-15% of packaging waste ends up in oceans."
    },
    {
        id: 13,
        question: "Carbon footprint is measured in what unit?",
        options: ["Kilograms of CO2", "Tons of CO2", "CO2 equivalent (CO2e)", "All of the above"],
        correct: 3,
        explanation: "Carbon footprint uses CO2e (carbon dioxide equivalent) which includes all greenhouse gases."
    },
    {
        id: 14,
        question: "What is the environmental benefit of using recycled packaging?",
        options: ["Saves water", "Reduces energy", "Lowers emissions", "All of the above"],
        correct: 3,
        explanation: "Recycled packaging saves water, reduces energy, and lowers emissions."
    },
    {
        id: 15,
        question: "Which certification ensures packaging is eco-friendly?",
        options: ["FSC", "USDA Organic", "Energy Star", "FTC Green"],
        correct: 0,
        explanation: "FSC (Forest Stewardship Council) certifies eco-friendly packaging materials."
    }
];

export default function QuizPage() {
    const { user, isLoaded } = useUser();
    const { theme } = useTheme();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [userQuestions, setUserQuestions] = useState<any[]>([]);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [questionAnimating, setQuestionAnimating] = useState(false);
    const [celebration, setCelebration] = useState(false);
    const [confettiActive, setConfettiActive] = useState(false);

    // Select random 8 questions when quiz starts
    useEffect(() => {
        const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
        setUserQuestions(shuffled.slice(0, 8));
    }, []);

    const handleAnswerSelect = (index: number) => {
        if (!showExplanation) {
            setSelectedAnswer(index);
        }
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        const currentQuestion = userQuestions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correct;

        if (isCorrect) {
            setScore(score + 1);
            setCelebration(true);
            setConfettiActive(true);
            setTimeout(() => {
                setCelebration(false);
                setConfettiActive(false);
            }, 2500);
        }

        setShowExplanation(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < userQuestions.length - 1) {
            setQuestionAnimating(true);
            setTimeout(() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null);
                setShowExplanation(false);
                setQuestionAnimating(false);
            }, 300);
        } else {
            // Quiz complete
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setLoading(true);
        const finalScore = selectedAnswer === userQuestions[currentQuestionIndex]?.correct ? score + 1 : score;
        const percentage = (finalScore / userQuestions.length) * 100;
        const result = {
            score: finalScore,
            total: userQuestions.length,
            percentage,
            passed: finalScore >= 5,
            timestamp: new Date().toISOString()
        };
        setResults(result);
        setShowResult(true);

        // Save quiz result to database if user is signed in
        if (user) {
            try {
                await fetch('/api/quiz/save-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        score: finalScore,
                        total: userQuestions.length,
                        percentage
                    })
                });
            } catch (error) {
                console.error('Failed to save quiz result:', error);
            }
        }

        setLoading(false);
    };

    if (showResult) {
        return (
            <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'
                } pt-16 pb-6 animate-in fade-in duration-500 relative overflow-hidden`}>
                {/* Navbar */}
                <nav className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark'
                    ? 'bg-gray-900/95 border-gray-600/30'
                    : 'bg-white/70 border-white/20'
                    } backdrop-blur-lg border-b shadow-lg`}>
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-14">
                            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                    EcoPack AI
                                </span>
                            </Link>
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className={`hidden sm:block text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-200 hover:text-green-400' : 'text-gray-700 hover:text-green-600'}`}>
                                    Dashboard
                                </Link>
                                <SignedIn>
                                    <UserButton />
                                </SignedIn>
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <button className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                                            Sign In
                                        </button>
                                    </SignInButton>
                                </SignedOut>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative container mx-auto px-4 max-w-3xl">
                    <div className={`bg-white ${theme === 'dark' ? 'bg-gray-800' : ''} rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all animate-in zoom-in-95 duration-500 relative overflow-hidden border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-green-100'}`}>
                        {/* Decorative gradient overlay */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
                        <div className="text-center mb-6">
                            {/* Animated Icon */}
                            <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-500 transform scale-100 animate-in zoom-in-95 ${results.passed
                                ? 'bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg shadow-green-200'
                                : 'bg-gradient-to-br from-orange-100 to-amber-100 shadow-lg shadow-orange-200'
                                }`}>
                                {results.passed ? (
                                    <Award className="w-16 h-16 text-green-600 animate-in zoom-in-95 delay-300" />
                                ) : (
                                    <Target className="w-16 h-16 text-orange-600 animate-in zoom-in-95 delay-300" />
                                )}
                                {results.passed && (
                                    <Sparkles className="absolute w-6 h-6 text-yellow-400 animate-pulse -top-2 -right-2" />
                                )}
                            </div>

                            <h2 className={`text-4xl md:text-5xl font-bold mb-4 animate-in slide-in-from-bottom-4 duration-700 ${results.passed ? 'text-green-700' : 'text-orange-700'}`}>
                                {results.passed ? '🎉 Congratulations! 🎉' : '📚 Keep Learning!'}
                            </h2>

                            {/* Score Display */}
                            <div className="my-6 animate-in zoom-in-95 delay-500 duration-500">
                                <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl px-8 py-6 shadow-lg">
                                    <div className="text-7xl md:text-8xl font-black bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        {results.score}/{results.total}
                                    </div>
                                </div>
                            </div>

                            {/* Percentage Circle */}
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <svg className="transform -rotate-90 w-32 h-32">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="none"
                                        className="text-gray-200"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 56}`}
                                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - results.percentage / 100)}`}
                                        className={`transition-all duration-1000 ${results.passed ? 'text-green-600' : 'text-orange-600'}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-3xl font-bold ${results.passed ? 'text-green-600' : 'text-orange-600'}`}>
                                        {results.percentage.toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            {results.passed ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <p className="text-2xl text-green-700 font-bold flex items-center gap-2">
                                            <Leaf className="w-7 h-7" />
                                            You're an Eco Champion! 🌱
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                        <p className="text-gray-700 font-medium">Great job! You're well-versed in sustainable packaging and environmental impact.</p>
                                    </div>
                                    {/* Achievement badges */}
                                    <div className="flex justify-center gap-3 mt-4">
                                        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-semibold text-yellow-700">Achievement Unlocked</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <p className="text-2xl text-orange-700 font-bold flex items-center gap-2">
                                            <TrendingUp className="w-7 h-7" />
                                            Practice More to Become an Eco Expert!
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                                        <p className="text-gray-700 font-medium">Keep learning about sustainable packaging and try again! Every attempt helps you grow.</p>
                                    </div>
                                    {/* Encouragement */}
                                    <div className="text-center text-gray-600 text-sm">
                                        💡 Tip: Review the explanations carefully to improve your score!
                                    </div>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className={`grid grid-cols-3 gap-4 mt-6 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="text-center">
                                    <div className={`text-3xl font-black mb-1 ${results.passed ? 'text-green-600' : 'text-orange-600'}`}>
                                        {results.score}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Correct</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-3xl font-black mb-1 ${results.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {results.percentage.toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Score</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-3xl font-black mb-1 ${results.passed ? 'text-teal-600' : 'text-red-600'}`}>
                                        {results.total - results.score}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Incorrect</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 mt-6">
                            <Link
                                href="/"
                                className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                <Home className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">Back to Home</span>
                            </Link>
                            <Link
                                href="/quiz"
                                onClick={() => window.location.reload()}
                                className="group flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                Retake Quiz
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'
            } pt-14 pb-4 relative overflow-hidden`}>
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark'
                ? 'bg-gray-900/95 border-gray-600/30'
                : 'bg-white/70 border-white/20'
                } backdrop-blur-lg border-b shadow-lg`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                EcoPack AI
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className={`hidden sm:block text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-200 hover:text-green-400' : 'text-gray-700 hover:text-green-600'}`}>
                                Dashboard
                            </Link>
                            <Link href="/" className={`hidden sm:block text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-200 hover:text-green-400' : 'text-gray-700 hover:text-green-600'}`}>
                                Home
                            </Link>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative container mx-auto px-4 max-w-4xl">

                {/* Confetti Effect */}
                {confettiActive && (
                    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className={`absolute w-2 h-2 ${['bg-yellow-400', 'bg-green-400', 'bg-emerald-400', 'bg-teal-400', 'bg-blue-400'][i % 5]
                                    } rounded-full animate-confetti`}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                    animationDuration: `${1 + Math.random()}s`
                                }}
                            />
                        ))}
                    </div>
                )}
                <SignedOut>
                    <div className={`relative bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 via-gray-700 to-gray-800' : 'from-white via-green-50 to-emerald-50'} rounded-2xl shadow-2xl p-6 md:p-8 text-center mb-4 animate-in zoom-in-95 duration-500 border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-green-100'} overflow-hidden`}>
                        {/* Decorative background pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, rgb(34, 197, 94) 1px, transparent 0)`,
                                backgroundSize: '40px 40px'
                            }}></div>
                        </div>

                        <div className="relative z-10">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 mb-4 animate-pulse shadow-lg">
                                    <Lightbulb className="w-12 h-12 text-green-600 animate-bounce" style={{ animationDuration: '2s' }} />
                                </div>
                                <div className="absolute top-6 right-6 w-16 h-16 bg-yellow-200 rounded-full opacity-20 animate-ping"></div>
                                <div className="absolute bottom-6 left-6 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
                            </div>
                            <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent'} mb-3`}>
                                Ready to Test Your Eco Knowledge?
                            </h2>
                            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1 text-base font-medium`}>
                                Challenge yourself with our sustainability quiz!
                            </p>
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                                Test your knowledge about sustainable packaging and carbon footprint
                            </p>
                            <SignInButton mode="modal">
                                <button className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                    <Zap className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
                                    <span className="relative z-10">Sign In to Start Quiz</span>
                                </button>
                            </SignInButton>

                            {/* Feature highlights */}
                            <div className="mt-6 grid grid-cols-3 gap-4 max-w-md mx-auto">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">8</div>
                                    <div className="text-xs text-gray-600 mt-1">Questions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">~5</div>
                                    <div className="text-xs text-gray-600 mt-1">Minutes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-teal-600">70%</div>
                                    <div className="text-xs text-gray-600 mt-1">Pass Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SignedOut>

                {isLoaded && user && userQuestions.length > 0 && (
                    <div className={`transition-all duration-300 ${questionAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                        {/* Enhanced Progress Bar */}
                        <div className={`relative bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 via-gray-700 to-gray-800' : 'from-white via-green-50 to-emerald-50'} rounded-xl shadow-xl p-4 mb-4 border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-green-100'} animate-in slide-in-from-top-4 duration-500 overflow-hidden`}>
                            {/* Decorative corner elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent opacity-30 rounded-bl-full"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-100 to-transparent opacity-30 rounded-tr-full"></div>

                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white font-bold shadow-2xl border-4 border-white">
                                            <span className="text-xl">{currentQuestionIndex + 1}</span>
                                            <div className="absolute inset-0 rounded-full bg-green-400 opacity-50 animate-ping"></div>
                                        </div>
                                        <div>
                                            <div className="text-gray-700 font-bold text-lg">
                                                Question {currentQuestionIndex + 1} of {userQuestions.length}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>~{Math.max(1, userQuestions.length - currentQuestionIndex)} min remaining</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 px-5 py-3 rounded-full shadow-lg border-2 border-green-200">
                                        <Trophy className="w-6 h-6 text-yellow-500" />
                                        <div>
                                            <div className="text-xs text-gray-600">Score</div>
                                            <div className="text-green-700 font-bold text-xl">{score}/{userQuestions.length}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 h-4 rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
                                        style={{ width: `${((currentQuestionIndex + 1) / userQuestions.length) * 100}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer"></div>
                                        {/* Progress dots */}
                                        {userQuestions.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all ${index <= currentQuestionIndex
                                                    ? 'bg-white opacity-100'
                                                    : 'bg-gray-300 opacity-0'
                                                    }`}
                                                style={{ left: `${((index + 1) / userQuestions.length) * 100}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {/* Percent indicator */}
                                <div className="text-right mt-2 text-xs text-gray-500 font-medium">
                                    {Math.round(((currentQuestionIndex + 1) / userQuestions.length) * 100)}% Complete
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Celebration Effect */}
                        {celebration && (
                            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                                <div className="relative">
                                    <div className="text-8xl animate-bounce">🎉</div>
                                    <div className="absolute -top-4 -left-4 text-4xl animate-pulse">✨</div>
                                    <div className="absolute -top-4 -right-4 text-4xl animate-pulse delay-150">⭐</div>
                                    <div className="absolute -bottom-4 left-4 text-4xl animate-pulse delay-300">🌟</div>
                                    <div className="absolute -bottom-4 right-4 text-4xl animate-pulse delay-500">💫</div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced Question Card */}
                        <div className={`relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-5 md:p-7 border-2 transition-all duration-300 overflow-hidden ${showExplanation ? (theme === 'dark' ? 'border-green-500' : 'border-green-300') : (theme === 'dark' ? 'border-gray-700' : 'border-green-100')}`}>
                            {/* Decorative gradient overlay */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>

                            {/* Question Header */}
                            <div className="flex items-start gap-4 mb-6 mt-2">
                                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 flex items-center justify-center shadow-lg border-2 border-green-200">
                                    <Lightbulb className="w-7 h-7 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                            Question {currentQuestionIndex + 1}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <BarChart3 className="w-3 h-3" />
                                            Multiple Choice
                                        </span>
                                    </div>
                                    <h2 className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} leading-tight`}>
                                        {userQuestions[currentQuestionIndex]?.question}
                                    </h2>
                                </div>
                            </div>

                            {!showExplanation && (
                                <div className="space-y-3 animate-in fade-in duration-300">
                                    {userQuestions[currentQuestionIndex]?.options.map((option: string, index: number) => {
                                        const optionLetters = ['A', 'B', 'C', 'D'];
                                        const isSelected = selectedAnswer === index;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleAnswerSelect(index)}
                                                className={`group relative w-full text-left p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] overflow-hidden ${isSelected
                                                    ? 'border-green-600 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shadow-xl scale-[1.02] ring-2 ring-green-200'
                                                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md'
                                                    }`}
                                            >
                                                {/* Selection indicator line */}
                                                {isSelected && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500"></div>
                                                )}

                                                <div className="flex items-center gap-4">
                                                    <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${isSelected
                                                        ? 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white shadow-xl'
                                                        : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-700'
                                                        }`}>
                                                        {optionLetters[index]}
                                                        {isSelected && (
                                                            <div className="absolute inset-0 bg-white opacity-20 rounded-xl animate-pulse"></div>
                                                        )}
                                                    </div>
                                                    <span className={`font-semibold text-base md:text-lg flex-1 ${isSelected ? 'text-green-900' : 'text-gray-700'
                                                        }`}>
                                                        {option}
                                                    </span>
                                                    {isSelected && (
                                                        <CheckCircle2 className="w-7 h-7 text-green-600 animate-in zoom-in-95" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={selectedAnswer === null}
                                        className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 transform flex items-center justify-center gap-2 ${selectedAnswer === null
                                            ? theme === 'dark' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl hover:scale-105'
                                            }`}
                                    >
                                        <Zap className="w-5 h-5" />
                                        Submit Answer
                                    </button>
                                </div>
                            )}

                            {showExplanation && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className={`relative p-6 rounded-xl border-2 transition-all overflow-hidden ${userQuestions[currentQuestionIndex]?.correct === selectedAnswer
                                        ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-500 shadow-xl'
                                        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 border-orange-500 shadow-xl'
                                        }`}>
                                        {/* Decorative corner */}
                                        <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 ${userQuestions[currentQuestionIndex]?.correct === selectedAnswer
                                            ? 'bg-green-200'
                                            : 'bg-orange-200'
                                            } rounded-bl-full`}></div>

                                        <div className="relative flex items-start gap-4">
                                            <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${userQuestions[currentQuestionIndex]?.correct === selectedAnswer
                                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                                : 'bg-gradient-to-br from-orange-500 to-red-600'
                                                }`}>
                                                {userQuestions[currentQuestionIndex]?.correct === selectedAnswer ? (
                                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                                ) : (
                                                    <XCircle className="w-8 h-8 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <p className={`font-bold text-xl ${userQuestions[currentQuestionIndex]?.correct === selectedAnswer
                                                        ? 'text-green-700'
                                                        : 'text-orange-700'
                                                        }`}>
                                                        {userQuestions[currentQuestionIndex]?.correct === selectedAnswer
                                                            ? '✨ Correct Answer!'
                                                            : '❌ Wrong Answer'}
                                                    </p>
                                                    {userQuestions[currentQuestionIndex]?.correct === selectedAnswer && (
                                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                                                    )}
                                                </div>
                                                <div className={`p-4 rounded-lg ${userQuestions[currentQuestionIndex]?.correct === selectedAnswer
                                                    ? 'bg-green-100 border border-green-200'
                                                    : 'bg-orange-100 border border-orange-200'
                                                    }`}>
                                                    <p className="text-gray-800 leading-relaxed font-medium">
                                                        {userQuestions[currentQuestionIndex]?.explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        className="group relative w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        {currentQuestionIndex < userQuestions.length - 1 ? (
                                            <>
                                                <span className="relative z-10">Next Question</span>
                                                <TrendingUp className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        ) : (
                                            <>
                                                <span className="relative z-10">View Results</span>
                                                <Award className="w-5 h-5 relative z-10" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="mt-8 text-center">
                                <div className="inline-flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
                                    <span className="text-gray-600 font-medium">Calculating your results...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

