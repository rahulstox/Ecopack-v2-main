'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

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
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [userQuestions, setUserQuestions] = useState<any[]>([]);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

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
        }

        setShowExplanation(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < userQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
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
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="bg-white rounded-3xl shadow-2xl p-8">
                        <div className="text-center mb-8">
                            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${results.passed ? 'bg-green-100' : 'bg-orange-100'
                                }`}>
                                {results.passed ? (
                                    <svg className="w-16 h-16 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 011-1h.01a1 1 0 011 1v.01a1 1 0 01-1 1H10a1 1 0 01-1-1V9zm5 0a1 1 0 011-1h1a1 1 0 011 1v.01a1 1 0 01-1 1h-1a1 1 0 01-1-1V9zM5 9a1 1 0 011-1h1a1 1 0 011 1v.01a1 1 0 01-1 1H6a1 1 0 01-1-1V9z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">
                                {results.passed ? 'Congratulations!' : 'Keep Learning!'}
                            </h2>
                            <div className="text-6xl font-bold text-green-600 mb-4">
                                {results.score}/{results.total}
                            </div>
                            <div className="text-2xl text-gray-600 mb-2">
                                Score: {results.percentage.toFixed(0)}%
                            </div>
                            {results.passed ? (
                                <p className="text-green-600 font-semibold">You're an Eco Champion! 🌱</p>
                            ) : (
                                <p className="text-orange-600 font-semibold">Practice more to become an eco expert!</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Link
                                href="/"
                                className="block w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors text-center"
                            >
                                Back to Home
                            </Link>
                            <Link
                                href="/quiz"
                                onClick={() => window.location.reload()}
                                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-semibold text-lg transition-colors text-center"
                            >
                                Retake Quiz
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <SignedOut>
                    <div className="bg-white rounded-3xl shadow-2xl p-8 text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Test Your Eco Knowledge?</h2>
                        <p className="text-gray-600 mb-6">Sign in to take the quiz and see how much you know about sustainable packaging!</p>
                        <SignInButton mode="modal">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg">
                                Sign In to Start Quiz
                            </button>
                        </SignInButton>
                    </div>
                </SignedOut>

                {isLoaded && user && userQuestions.length > 0 && (
                    <div>
                        {/* Progress Bar */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600 font-medium">Question {currentQuestionIndex + 1} of {userQuestions.length}</span>
                                <span className="text-green-600 font-semibold">Score: {score}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-green-600 h-4 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex + 1) / userQuestions.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {userQuestions[currentQuestionIndex]?.question}
                            </h2>

                            {!showExplanation && (
                                <div className="space-y-4">
                                    {userQuestions[currentQuestionIndex]?.options.map((option: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(index)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAnswer === index
                                                ? 'border-green-600 bg-green-50'
                                                : 'border-gray-200 hover:border-green-300'
                                                }`}
                                        >
                                            <span className="font-semibold text-gray-700">{option}</span>
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={selectedAnswer === null}
                                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${selectedAnswer === null
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                                            }`}
                                    >
                                        Submit Answer
                                    </button>
                                </div>
                            )}

                            {showExplanation && (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-xl ${userQuestions[currentQuestionIndex]?.correct === selectedAnswer
                                        ? 'bg-green-100 border-2 border-green-600'
                                        : 'bg-orange-100 border-2 border-orange-600'
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            {userQuestions[currentQuestionIndex]?.correct === selectedAnswer ? (
                                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <div>
                                                <p className="font-semibold mb-2">
                                                    {userQuestions[currentQuestionIndex]?.correct === selectedAnswer
                                                        ? 'Correct Answer!'
                                                        : 'Wrong Answer'}
                                                </p>
                                                <p className="text-gray-700">{userQuestions[currentQuestionIndex]?.explanation}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        className="w-full py-4 rounded-xl font-semibold text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg transition-colors"
                                    >
                                        {currentQuestionIndex < userQuestions.length - 1 ? 'Next Question' : 'View Results'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="mt-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

