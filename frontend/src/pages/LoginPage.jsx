import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaBookOpen, 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner, 
  FaArrowRight, 
  FaExclamationCircle,
  FaCheckCircle,
  FaChalkboardTeacher,
  FaShieldAlt,
  FaMagic,
  FaUserFriends
} from 'react-icons/fa';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryRole = searchParams.get('role');
  const stateRole = location.state?.selectedRole;
  const initialRole = (queryRole || stateRole || 'PARENT').toUpperCase();

  const [activeRole, setActiveRole] = useState(
    ['PARENT', 'TEACHER', 'ADMIN'].includes(initialRole) ? initialRole : 'PARENT'
  );

  const [username, setUsername] = useState(location.state?.prefillUsername || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

  const fromPath = location.state?.from?.pathname;

  // Pre-fill demo credentials on quick fill button click
  const handleQuickFill = (roleKey) => {
    setErrorMessage('');
    if (roleKey === 'PARENT') {
      setUsername('parent_demo');
      setPassword('pass1234');
    } else if (roleKey === 'TEACHER') {
      setUsername('teacher_demo');
      setPassword('pass1234');
    } else if (roleKey === 'ADMIN') {
      setUsername('admin_demo');
      setPassword('pass1234');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please fill in both username/email and password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const loggedUser = await login(username.trim(), password);
      
      // Determine target redirect route based on role or previous location
      let targetRoute = '/parent';
      if (loggedUser.role === 'TEACHER') {
        targetRoute = '/teacher';
      } else if (loggedUser.role === 'ADMIN') {
        targetRoute = '/admin';
      }

      navigate(fromPath || targetRoute, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Welcome Back!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Choose your portal and sign in to continue
          </p>
        </div>

        {/* Portal Role Selector Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl mb-6 border border-slate-200/60 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => { setActiveRole('PARENT'); setErrorMessage(''); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'PARENT'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FaUserFriends className="text-sm" />
            <span>Parent</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('TEACHER'); setErrorMessage(''); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'TEACHER'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-md font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FaChalkboardTeacher className="text-sm" />
            <span>Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('ADMIN'); setErrorMessage(''); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'ADMIN'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-md font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FaShieldAlt className="text-sm" />
            <span>Admin</span>
          </button>
        </div>

        {/* Selected Portal Helper Info */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-400">
            Portal: <strong className="text-slate-700 dark:text-slate-200 capitalize">{activeRole.toLowerCase()} Portal</strong>
          </span>
          <button
            type="button"
            onClick={() => handleQuickFill(activeRole)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <FaMagic className="text-xs" />
            <span>Fill Demo Credentials</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-sm">
            <FaCheckCircle className="text-lg mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
            <FaExclamationCircle className="text-lg mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FaUser />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  activeRole === 'TEACHER'
                    ? 'e.g. teacher_demo or kartikeyasingh225@gmail.com'
                    : activeRole === 'ADMIN'
                    ? 'e.g. admin_demo or mohitkumar339900@gmail.com'
                    : 'e.g. parent_demo or parent@storynest.com'
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FaLock />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          {/* Forgot Password Link */}
          <div className="flex justify-end -mt-1">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#ffffff' }}
            className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to {activeRole.charAt(0) + activeRole.slice(1).toLowerCase()} Portal</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Register Footer */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-5">
          <span>Don't have an account? </span>
          <Link
            to={`/register?role=${activeRole}`}
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            Create {activeRole.toLowerCase()} account
          </Link>
        </div>

      </div>
    </div>
  );
}
