import React, { useState } from 'react';
import { FiShield, FiKey, FiLogOut } from 'react-icons/fi';
import teacherSettingsService from '../../../../services/teacherSettingsService';
import LogoutModal from './LogoutModal';

const SecuritySettingsSection = ({ onLogout }) => {
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMessage(null);

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passData.newPassword.length < 8) {
      setPassMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    try {
      setIsChangingPass(true);
      await teacherSettingsService.changePassword(passData.oldPassword, passData.newPassword);
      setPassMessage({ type: 'success', text: '✓ Password changed successfully.' });
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.old_password || err.response?.data?.detail || 'The current password is incorrect.';
      setPassMessage({ type: 'error', text: errMsg });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password Card */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FiKey className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your account uses a strong, secure password</p>
          </div>
        </div>

        {passMessage && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-semibold ${
              passMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300'
            }`}
          >
            {passMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Current Password *
            </label>
            <input
              type="password"
              name="oldPassword"
              value={passData.oldPassword}
              onChange={handlePassChange}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              New Password *
            </label>
            <input
              type="password"
              name="newPassword"
              value={passData.newPassword}
              onChange={handlePassChange}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Confirm New Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passData.confirmPassword}
              onChange={handlePassChange}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPass}
              className="btn btn-primary disabled:opacity-50"
            >
              {isChangingPass ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger / Session Actions */}
      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Account Session</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sign out of your active teacher session on this device</p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="inline-flex items-center px-4 py-2.5 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/20 hover:bg-rose-100 rounded-xl text-sm font-semibold transition-colors"
        >
          <FiLogOut className="mr-2 h-4 w-4" /> Sign Out
        </button>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={onLogout}
      />
    </div>
  );
};

export default SecuritySettingsSection;
