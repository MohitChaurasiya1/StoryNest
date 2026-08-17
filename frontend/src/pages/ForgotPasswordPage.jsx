import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, getApiErrorMessage } from '../services/api';
import {
  FaBookOpen,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaArrowRight,
  FaArrowLeft,
  FaExclamationCircle,
  FaCheckCircle,
  FaKey,
  FaShieldAlt,
} from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Steps: 'email' -> 'otp' -> 'success'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const data = await authApi.forgotPassword(email.trim());
      setSuccessMessage(data.detail || 'OTP has been sent to your email.');
      setStep('otp');
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Failed to send OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit OTP.');
      return;
    }
    if (otp.trim().length !== 6) {
      setErrorMessage('OTP must be exactly 6 digits.');
      return;
    }
    if (!newPassword) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const data = await authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword,
      });
      setSuccessMessage(data.detail || 'Password reset successfully!');
      setStep('success');
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Failed to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700/60 overflow-hidden p-8">
        
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold text-2xl mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <FaBookOpen className="text-xl" />
            </div>
            <span>StoryNest</span>
          </Link>
        </div>

        {/* ─── Step 1: Enter Email ─── */}
        {step === 'email' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <FaKey className="text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Forgot Password?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Enter your email address and we'll send you a 6-digit OTP to reset your password.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
                <FaExclamationCircle className="text-lg mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: '#ffffff' }}
                className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset OTP</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-5">
              <Link
                to="/login"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <FaArrowLeft className="text-xs" />
                Back to Login
              </Link>
            </div>
          </>
        )}

        {/* ─── Step 2: Enter OTP + New Password ─── */}
        {step === 'otp' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                <FaShieldAlt className="text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Verify & Reset</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Enter the 6-digit OTP sent to <strong className="text-slate-700 dark:text-slate-200">{email}</strong> and set your new password.
              </p>
            </div>

            {successMessage && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-sm">
                <FaCheckCircle className="text-lg mt-0.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
                <FaExclamationCircle className="text-lg mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* OTP Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  6-Digit OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FaKey />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm tracking-[0.3em] font-mono text-center"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', color: '#ffffff' }}
                className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-5">
              <button
                type="button"
                onClick={() => { setStep('email'); setErrorMessage(''); setSuccessMessage(''); }}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <FaArrowLeft className="text-xs" />
                Change email
              </button>
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={loading}
                className="font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {/* ─── Step 3: Success ─── */}
        {step === 'success' && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-tr from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-xl shadow-green-500/30">
                <FaCheckCircle className="text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Password Reset!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#ffffff' }}
              className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Login</span>
              <FaArrowRight />
            </button>
          </>
        )}

      </div>
    </div>
  );
}
