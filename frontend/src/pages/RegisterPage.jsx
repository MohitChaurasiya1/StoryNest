import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaBookOpen, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaPhone, 
  FaUserTag, 
  FaSpinner, 
  FaArrowRight, 
  FaExclamationCircle 
} from 'react-icons/fa';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryRole = searchParams.get('role');
  const initialRole = (queryRole || 'PARENT').toUpperCase();
  const validRole = ['PARENT', 'TEACHER', 'ADMIN'].includes(initialRole) ? initialRole : 'PARENT';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: validRole,
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === 'first_name' || name === 'last_name') {
      // Allow only letters, spaces, apostrophes, and hyphens
      sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
    } else if (name === 'username') {
      // Allow only letters, numbers, underscores, and hyphens
      sanitizedValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
    } else if (name === 'email') {
      // Allow only alphanumeric, dot, underscore, hyphen, plus, and @ sign (strips symbols like $%^&*)
      sanitizedValue = value.replace(/[^a-zA-Z0-9._\-+@]/g, '');
    } else if (name === 'phone') {
      // Allow only phone numbers, plus sign, spaces, and hyphens
      sanitizedValue = value.replace(/[^0-9+()\s-]/g, '');
    }

    setFormData({ ...formData, [name]: sanitizedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Basic required fields check
    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all required fields (Username, Email, Password).');
      return;
    }

    // 2. First & Last Name validation (letters only, no numbers like 4567)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (formData.first_name.trim() && !nameRegex.test(formData.first_name.trim())) {
      setErrorMessage('First Name can only contain alphabetic letters (numbers and special characters are not allowed).');
      return;
    }
    if (formData.last_name.trim() && !nameRegex.test(formData.last_name.trim())) {
      setErrorMessage('Last Name can only contain alphabetic letters (numbers and special characters are not allowed).');
      return;
    }

    // 3. Username validation (letters, numbers, underscores, hyphens only; min 3 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(formData.username.trim())) {
      setErrorMessage('Username can only contain letters, numbers, underscores (_), and hyphens (-). Special characters like %^&*() are not allowed.');
      return;
    }
    if (formData.username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    // 4. Strict Email validation (must be valid domain format, no random symbols like $%^&*)
    const strictEmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!strictEmailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. user@example.com). Special symbols like $%^&* are not allowed in email.');
      return;
    }

    // 5. Phone validation (10 to 15 digits if provided)
    if (formData.phone.trim()) {
      const digitsOnly = formData.phone.trim().replace(/\D/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        setErrorMessage('Phone number must contain between 10 and 15 digits.');
        return;
      }
    }

    // 6. Password validation & match
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter matching passwords.');
      return;
    }

    setLoading(true);

    try {
      // 1. Register user
      const registerPayload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role,
        phone: formData.phone.trim(),
        password: formData.password,
      };

      await register(registerPayload);

      // Redirect to login page with success message
      navigate('/login', {
        replace: true,
        state: {
          successMessage: 'Account created successfully! Please sign in with your credentials.',
          prefillUsername: formData.username.trim(),
          selectedRole: formData.role,
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Username or email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700/60 overflow-hidden p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold text-2xl mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <FaBookOpen className="text-xl" />
            </div>
            <span>StoryNest</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Create Your Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Join StoryNest to explore personalized learning & storybooks
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
            <FaExclamationCircle className="text-lg mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. John"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. Doe"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Username *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FaUser />
              </div>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a unique username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FaEnvelope />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Role & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Account Role *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FaUserTag />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="PARENT">Parent</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FaPhone />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FaLock />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 chars"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FaLock />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: '#ffffff' }}
            className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-4"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Login Link Footer */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-4">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            Sign in here
          </Link>
        </div>

      </div>
    </div>
  );
}
