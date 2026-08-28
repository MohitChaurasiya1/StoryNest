import React from 'react';
import { FiLogOut, FiAlertTriangle } from 'react-icons/fi';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
            <FiLogOut className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign Out</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Are you sure you want to log out of StoryNest?</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          You will need to sign in again to access your teacher dashboard, classrooms, and assignments.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
