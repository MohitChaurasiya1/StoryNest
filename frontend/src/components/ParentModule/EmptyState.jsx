import React from 'react';
import { FaInbox } from 'react-icons/fa';

export default function EmptyState({
  icon: Icon = FaInbox,
  title = "No items found",
  description = "There is no data available to display right now.",
  actionText,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center my-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 shadow-sm mb-4">
        <Icon className="text-3xl" />
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-500/20 hover:scale-105 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
