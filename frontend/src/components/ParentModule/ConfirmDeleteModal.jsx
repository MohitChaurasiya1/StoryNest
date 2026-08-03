import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaExclamationTriangle, FaSpinner, FaTrash } from "react-icons/fa";

function ConfirmDeleteModal({
  isOpen = false,
  title = "Delete Item",
  message = "Are you sure you want to delete this item?",
  itemName = "",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Icon + Title */}
        <div className="flex flex-col items-center p-6 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60">
            <FaExclamationTriangle className="text-2xl text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-black dark:text-white text-center">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 pb-4 text-center">
          <p className="text-sm text-black/80 dark:text-white/90">{message}</p>
          {itemName && (
            <div className="mt-3 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2">
              <p className="font-semibold text-black dark:text-white break-words">{itemName}</p>
            </div>
          )}
          <p className="mt-3 text-xs font-semibold text-rose-500">
            This action cannot be undone.
          </p>
        </div>

        {/* Buttons - ALWAYS visible side by side */}
        <div className="flex gap-3 p-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-black dark:text-white text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 font-semibold text-white text-sm flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash />
                {confirmText}
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

export default ConfirmDeleteModal;
