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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ padding: "16px" }}
      onClick={onCancel}
    >
      <div
        className="w-full rounded-2xl bg-white shadow-2xl"
        style={{ maxWidth: "380px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Icon + Title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 16px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaExclamationTriangle style={{ fontSize: "24px", color: "#dc2626" }} />
          </div>
          <h2 style={{ marginTop: "12px", fontSize: "20px", fontWeight: "700", color: "#0f172a", textAlign: "center" }}>
            {title}
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: "0 24px 16px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#475569" }}>{message}</p>
          {itemName && (
            <div style={{ marginTop: "12px", borderRadius: "12px", backgroundColor: "#f1f5f9", padding: "8px 16px" }}>
              <p style={{ fontWeight: "600", color: "#0f172a", wordBreak: "break-word" }}>{itemName}</p>
            </div>
          )}
          <p style={{ marginTop: "12px", fontSize: "12px", color: "#ef4444", fontWeight: "500" }}>
            This action cannot be undone.
          </p>
        </div>

        {/* Buttons - ALWAYS visible side by side */}
        <div style={{ display: "flex", gap: "12px", padding: "16px 24px 24px", borderTop: "1px solid #e2e8f0" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              fontWeight: "600",
              color: "#334155",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              fontSize: "14px",
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#dc2626",
              fontWeight: "600",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "14px",
            }}
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
