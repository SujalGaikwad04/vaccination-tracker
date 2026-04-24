import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const Login = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [otpSent, setOtpSent] = useState(false);
    const [email, setEmail] = useState('');
    const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(59);

    useEffect(() => {
        let timer;
        if (otpSent && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [otpSent, countdown]);

    const handleGetOtp = async () => {
        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`${API_URL}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (response.ok) {
                    setOtpSent(true);
                    setCountdown(59);
                } else {
                    setError(data.error || 'Failed to send OTP');
                }
            } catch (err) {
                setError('Cannot connect to server. Ensure backend is running.');
            } finally {
                setLoading(false);
            }
        } else {
            setError("Please enter a valid email address");
        }
    };

    const handleVerifyOtp = async () => {
        const otpString = otpValue.join('');
        if (otpString.length !== 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpString })
            });

            const data = await response.json();
            if (response.ok) {
                if (setIsLoggedIn) setIsLoggedIn(true);
                // Save user info into localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                navigate('/profile');
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Cannot connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otpValue];
        newOtp[index] = value;
        setOtpValue(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    return (
        <div className="bg-indigo-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
            {/* Header (Login Specific) */}
            <header className="w-full px-6 py-4 lg:px-20 flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600">
                        <span className="material-symbols-outlined text-2xl">child_care</span>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 -ml-4 mt-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 text-indigo-600">
                        <span className="material-symbols-outlined text-sm font-bold">shield</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white ml-1">
                        Vaxi<span className="text-indigo-600">Care</span>
                    </h1>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Go Back</span>
                </button>
            </header>

            <main className="flex-grow flex items-center justify-center px-6 py-12 lg:py-20">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left Column: Branding & Features */}
                    <div className="hidden lg:flex flex-col space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">
                                Welcome to <span className="text-indigo-600">VaxiCare</span>
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                                Track your child’s vaccination schedule and never miss an important vaccine with our smart reminders and digital records.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/50 shadow-sm border border-indigo-100 dark:border-slate-800">
                                <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                                    <span className="material-symbols-outlined">assignment</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Track Records</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Complete immunization history in one secure dashboard.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/50 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="p-3 rounded-lg bg-orange-100 text-orange-400">
                                    <span className="material-symbols-outlined">notifications_active</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Smart Reminders</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Automated alerts for upcoming doses and boosters.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/50 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="p-3 rounded-lg bg-green-100 text-green-400">
                                    <span className="material-symbols-outlined">share_reviews</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Share Digital Cards</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Easy access for school admissions and travel requirements.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Login Card */}
                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="text-center lg:text-left">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Login to Your Account</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your email address to receive a one-time password.</p>
                                </div>

                                {/* Email Section */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                                        <div className="flex gap-2 relative">
                                            <input
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-3 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-indigo-600 focus:border-indigo-600"
                                                placeholder="you@example.com"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={otpSent || loading}
                                            />
                                        </div>
                                    </div>

                                    {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}

                                    {!otpSent && (
                                        <button
                                            onClick={handleGetOtp}
                                            disabled={loading}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Sending...' : 'Get OTP'}
                                        </button>
                                    )}
                                </div>

                                {/* OTP Section */}
                                <div className={`pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6 ${!otpSent ? 'opacity-40 pointer-events-none' : ''}`}>
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center block">Enter 6-digit OTP</label>
                                        <div className="flex justify-between gap-2">
                                            {otpValue.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    id={`otp-${i}`}
                                                    className="w-10 h-14 sm:w-12 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-indigo-600 focus:border-indigo-600"
                                                    maxLength="1"
                                                    type="text"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={loading}
                                        className={`w-full font-bold py-3.5 rounded-lg transition-all ${otpSent ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]' : 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed'} disabled:opacity-75 disabled:cursor-not-allowed`}
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                    <div className="text-center">
                                        <p className="text-sm text-slate-500">
                                            Didn't receive code?{' '}
                                            {countdown > 0 ? (
                                                <span className="text-slate-500 font-semibold cursor-not-allowed">
                                                    Resend in 0:{countdown.toString().padStart(2, '0')}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={handleGetOtp}
                                                    disabled={loading}
                                                    className="text-indigo-600 font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 inline"
                                                >
                                                    {loading ? 'Resending...' : 'Resend OTP'}
                                                </button>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center">
                                <p className="text-sm text-slate-500">New to VaxiCare? <a className="text-indigo-600 font-bold hover:underline cursor-pointer">Create an account</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Features */}
            <section className="w-full bg-white dark:bg-slate-900 py-12 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Secure OTP Login</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Passwordless entry with encrypted one-time codes.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-400 flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined">event_available</span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Never Miss a Vaccine</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Personalized schedules based on international health standards.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-green-100 text-green-400 flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined">verified</span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Verified Digital Records</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Authenticated vaccination cards ready for any use case.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Links */}
            <footer className="w-full px-6 py-8 bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400 order-2 md:order-1">
                        © 2026 VaxiCare. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 order-1 md:order-2">
                        <a className="text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
                        <a className="text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
                        <a className="text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Login;
