import { FaExclamationTriangle, FaSpinner, FaTrash } from "react-icons/fa";

function ConfirmDeleteModal({
  isOpen = false,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-col items-center border-b border-slate-200 px-6 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            {title}
          </h2>
        </div>

        <div className="px-6 py-5 text-center">
          <p className="text-slate-600 leading-7">
            {message}
          </p>

          {itemName && (
            <div className="mt-5 rounded-xl bg-slate-100 px-4 py-3">
              <p className="font-semibold text-slate-900 break-words">
                {itemName}
              </p>
            </div>
          )}

          <p className="mt-5 text-sm text-red-600 font-medium">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}

export default ConfirmDeleteModal;
