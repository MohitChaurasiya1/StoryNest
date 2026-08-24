import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaTimes, FaAward, FaPrint, FaBan, FaCheckCircle, 
  FaExclamationTriangle, FaSpinner, FaCalendarAlt 
} from 'react-icons/fa';

export default function CertificateViewModal({ 
  isOpen, 
  onClose, 
  certificate, 
  studentName = "Student",
  onRevoke = null,
  isTeacher = true
}) {
  const [revoking, setRevoking] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmRevoke = async () => {
    if (!onRevoke) return;
    try {
      setRevoking(true);
      await onRevoke(certificate.id, revokeReason);
      setShowRevokeConfirm(false);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to revoke certificate');
    } finally {
      setRevoking(false);
    }
  };

  const isRevoked = certificate.status === 'revoked';

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎖️</span>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                Certificate Preview
              </h4>
              <span className="text-[11px] font-bold text-slate-400">
                #{certificate.certificate_number || `SN-${certificate.id}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-2 shadow-sm transition-all"
            >
              <FaPrint /> Print / Save PDF
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <FaTimes size={13} />
            </button>
          </div>
        </div>

        {/* Certificate Surface (Printable Area) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-100/60 dark:bg-slate-950/40">
          <div 
            id="printable-certificate"
            className="relative mx-auto bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F0] border-8 border-double border-amber-300 dark:border-amber-700 rounded-3xl p-8 sm:p-12 shadow-xl text-center overflow-hidden"
          >
            {/* Watermark if revoked */}
            {isRevoked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="rotate-[-25deg] border-4 border-rose-500/60 bg-rose-500/10 px-8 py-3 rounded-2xl">
                  <span className="text-3xl sm:text-5xl font-black text-rose-500 tracking-widest uppercase">
                    REVOKED
                  </span>
                </div>
              </div>
            )}

            {/* Corner Decorative Triangles */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-amber-400 to-rose-400 rotate-45 opacity-20 pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-gradient-to-tr from-amber-400 to-rose-400 rotate-45 opacity-20 pointer-events-none"></div>

            {/* Header Badge */}
            <div className="text-5xl mb-3 select-none">🎖️</div>
            <div className="text-xs font-black uppercase tracking-widest text-amber-600 mb-1">
              StoryNest Official Certificate
            </div>

            <h2 className="serif-heading text-2xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              {certificate.title}
            </h2>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              This Certificate is proudly awarded to
            </p>

            <div className="text-2xl sm:text-4xl font-extrabold text-rose-600 underline decoration-rose-300 decoration-wavy decoration-2 underline-offset-8 mb-5">
              {studentName || certificate.child_name}
            </div>

            <p className="text-sm sm:text-base font-semibold text-slate-700 max-w-xl mx-auto leading-relaxed whitespace-pre-line mb-6">
              {certificate.description}
            </p>

            {/* Bottom Signature & Date Row */}
            <div className="pt-6 border-t border-amber-200/80 flex justify-between items-end text-left mt-8">
              <div>
                <div className="text-xs font-bold text-slate-400">Classroom</div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-800">
                  {certificate.classroom_name || 'StoryNest Learning'}
                </div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Issued: {new Date(certificate.issued_date).toLocaleDateString()}
                </div>
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-400/80 bg-gradient-to-tr from-amber-100 to-amber-50 flex flex-col items-center justify-center shadow-inner select-none shrink-0">
                <span className="text-2xl">🌟</span>
                <span className="text-[8px] font-black text-amber-700 tracking-tighter uppercase">VERIFIED</span>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-400">Certified By</div>
                <div className="font-extrabold text-sm sm:text-base text-slate-800 font-serif italic">
                  {certificate.issuer_name || 'Lead Educator'}
                </div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  StoryNest Educator
                </div>
              </div>
            </div>
          </div>

          {/* Revoke confirmation box if triggered */}
          {showRevokeConfirm && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 animate-fade-in">
              <h5 className="text-xs font-extrabold text-rose-700 dark:text-rose-300 mb-1 flex items-center gap-2">
                <FaExclamationTriangle /> Revoke Certificate
              </h5>
              <p className="text-xs text-rose-600 dark:text-rose-400 mb-3">
                Are you sure you want to revoke this certificate? It will be marked as revoked in the student's dashboard.
              </p>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Reason for revoking (optional)"
                className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white mb-3"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRevokeConfirm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevoke}
                  disabled={revoking}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white shadow hover:bg-rose-700 disabled:opacity-50"
                >
                  {revoking ? 'Revoking...' : 'Confirm Revoke'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
              isRevoked 
                ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              {isRevoked ? 'Status: Revoked' : 'Status: Active'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isTeacher && !isRevoked && onRevoke && !showRevokeConfirm && (
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(true)}
                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1.5"
              >
                <FaBan /> Revoke Certificate
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-2xl text-xs font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
