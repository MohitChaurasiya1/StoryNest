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
        className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col"
        style={{ backgroundColor: 'var(--modal-bg, #ffffff)', border: '1px solid var(--modal-border, #e2e8f0)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex flex-col items-center p-6 pb-3">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: '#fee2e2' }}
          >
            <FaExclamationTriangle style={{ fontSize: '1.75rem', color: '#dc2626' }} />
          </div>
          <h2
            className="mt-4 text-xl font-bold text-center"
            style={{ color: 'var(--modal-title, #0f172a)' }}
          >
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 pb-5 text-center">
          <p style={{ fontSize: '0.875rem', color: 'var(--modal-text, #475569)', fontWeight: 500 }}>
            {message}
          </p>
          {itemName && (
            <div
              className="mt-3 rounded-xl px-4 py-3"
              style={{ backgroundColor: 'var(--modal-chip, #f1f5f9)' }}
            >
              <p style={{ fontWeight: 700, color: 'var(--modal-title, #0f172a)', wordBreak: 'break-word' }}>
                {itemName}
              </p>
            </div>
          )}
          <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#e11d48' }}>
            This action cannot be undone.
          </p>
        </div>

        {/* Buttons — forced visible in both light AND dark mode */}
        <div
          className="flex items-stretch gap-3 p-4"
          style={{ borderTop: '1px solid var(--modal-border, #e2e8f0)', backgroundColor: 'var(--modal-footer, #f8fafc)' }}
        >
          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.625rem 1rem',
              borderRadius: '0.75rem',
              border: '2px solid var(--modal-border, #cbd5e1)',
              backgroundColor: 'var(--modal-bg, #ffffff)',
              color: 'var(--modal-title, #334155)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'background-color 0.15s',
            }}
          >
            {cancelText}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.625rem 1rem',
              borderRadius: '0.75rem',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(220,38,38,0.35)',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#b91c1c'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" style={{ fontSize: '0.875rem' }} />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash style={{ fontSize: '0.75rem' }} />
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
