import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export default function ToastNotification({
  type = 'success',
  message,
  onClose
}) {
  if (!message) return null;

  const bgMap = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-sky-50 border-sky-200 text-sky-800',
  };

  const iconMap = {
    success: <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />,
    error: <FaExclamationCircle className="text-rose-500 text-lg flex-shrink-0" />,
    info: <FaInfoCircle className="text-sky-500 text-lg flex-shrink-0" />,
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border p-4 shadow-xl transition-all ${bgMap[type] || bgMap.success}`}>
      {iconMap[type]}
      <p className="text-sm font-semibold">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-slate-600 transition"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}
