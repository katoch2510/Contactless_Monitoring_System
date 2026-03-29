import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UserPlus, LogIn, ChevronRight, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 font-sans selection:bg-indigo-500 selection:text-white">
            {/* Navbar */}
            <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="font-bold tracking-tight text-xl dark:text-white text-gray-900">
                            SmartCampus.
                        </span>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <Link
                            to="/scanner"
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                            Gate Terminal
                        </Link>
                        <Link
                            to="/visit-register"
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                            Visitor Booking
                        </Link>
                        <Link
                            to="/login"
                            className="px-5 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-sm"
                        >
                            Admin Portal
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
                <div className="absolute top-0 left-0 -ml-20 mt-40 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-tight">
                        Welcome to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">SmartCampus.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
                        Our institution uses a modern Contactless Entry System to ensure safety, speed, and security at all our gates. Students enter via facial recognition, and Visitors must pre-register to obtain a digital gate pass.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/visit-register"
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition flex items-center justify-center group"
                        >
                            <UserPlus className="w-5 h-5 mr-3" />
                            Register a Visit
                            <ChevronRight className="w-5 h-5 ml-1 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                        </Link>

                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl font-bold text-lg shadow-sm transition flex items-center justify-center"
                        >
                            <LogIn className="w-5 h-5 mr-3 text-indigo-500" />
                            Faculty & Admin Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="bg-gray-50 dark:bg-gray-800/50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-bold tracking-widest text-indigo-600 uppercase">Seamless Security</h2>
                        <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">How it works for Visitors</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
                        {/* Step 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative hover:-translate-y-1 transition duration-300">
                            <div className="absolute -top-6 left-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border-4 border-white dark:border-gray-800">
                                1
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white mb-2">Book a Visit</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Fill out the quick pre-registration form before arriving at the campus to request entry from a specific host faculty.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative hover:-translate-y-1 transition duration-300">
                            <div className="absolute -top-6 left-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border-4 border-white dark:border-gray-800">
                                2
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white mb-2">Get Approved</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Once the admin or host faculty approves the visit request, you'll receive a unique 6-digit Visitor ID and Secure QR code.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative hover:-translate-y-1 transition duration-300">
                            <div className="absolute -top-6 left-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border-4 border-white dark:border-gray-800">
                                3
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white mb-2">Scan & Enter</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Present your digital QR pass at the security gate to seamlessly enter the campus without manually signing paper registers.</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LandingPage;
