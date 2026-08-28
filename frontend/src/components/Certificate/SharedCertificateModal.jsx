import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaTimes, FaCertificate, FaAward, FaPrint, FaDownload, 
  FaBan, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaCalendarAlt 
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function SharedCertificateModal({
  isOpen,
  onClose,
  certificate,
  childName = "Reader",
  onRevoke = null,
  isTeacher = false,
  onDownload = null
}) {
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  if (!isOpen || !certificate) return null;

  const recipientName = (
    childName || 
    certificate.child_name || 
    certificate.childName || 
    "Young Reader"
  ).toUpperCase();

  const title = certificate.title || "Certificate of Reading";
  const description = certificate.description || 
    (certificate.story_title 
      ? `For successfully reading, comprehending, and completing "${certificate.story_title}".`
      : "For outstanding dedication, consistency, and achievement in learning with StoryNest.");

  const certNumber = certificate.certificate_number || `SN-${certificate.id || 'CERT'}`;
  const issueDate = certificate.issued_date || certificate.issued_at || certificate.created_at || new Date().toISOString();
  const formattedDate = new Date(issueDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const issuerName = certificate.issuer_name || certificate.teacher_name || "Lead Educator";
  const classroomName = certificate.classroom_name || "StoryNest Learning Academy";
  const isRevoked = certificate.status === 'revoked';

  // PDF Download Handler using html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (onDownload) {
      onDownload(certificate);
      return;
    }
    if (!certificateRef.current) return;
    try {
      setDownloading(true);
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FAF7F2',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`StoryNest_Certificate_${recipientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error("Failed to export certificate PDF:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

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

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-base">
              <FaAward />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                Certificate Details
              </h4>
              <span className="text-[11px] font-bold text-slate-400">
                #{certNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <FaPrint /> Print
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <FaTimes size={13} />
            </button>
          </div>
        </div>

        {/* Certificate Display Area (Exact Shared Template) */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100/70 dark:bg-slate-950/60">
          <div 
            ref={certificateRef}
            id="printable-shared-certificate"
            className="relative mx-auto max-w-3xl bg-white border-[10px] border-rose-500 rounded-3xl p-4 sm:p-6 shadow-2xl text-center overflow-hidden"
          >
            {/* Inner Gold Border & Container */}
            <div className="relative border-4 border-amber-400 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-between min-h-[500px] bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FFF9F2]">
              
              {/* Revoked Watermark */}
              {isRevoked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <div className="rotate-[-25deg] border-4 border-rose-500/70 bg-rose-500/10 px-8 py-3 rounded-2xl">
                    <span className="text-4xl sm:text-6xl font-black text-rose-500 tracking-widest uppercase">
                      REVOKED
                    </span>
                  </div>
                </div>
              )}

              {/* Top Academy Header */}
              <div className="w-full">
                <div className="flex items-center justify-center gap-2 text-amber-500 mb-2">
                  <FaCertificate className="text-3xl sm:text-4xl" />
                </div>
                <div className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-emerald-700 dark:text-emerald-800 mb-1">
                  STORYNEST ACADEMY OF LEARNING
                </div>
                <h1 className="serif-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-900 tracking-tight mb-2">
                  {title.toUpperCase()}
                </h1>
                <div className="w-28 sm:w-36 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 mx-auto rounded-full"></div>
              </div>

              {/* Certificate Recipient Section */}
              <div className="my-6 w-full">
                <p className="text-xs sm:text-sm font-medium text-slate-500 italic mb-2">
                  This proud achievement is officially awarded to
                </p>
                <div className="text-2xl sm:text-4xl font-black text-rose-600 border-b-2 border-amber-400 inline-block px-8 pb-1 tracking-wide font-serif">
                  {recipientName}
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-700 max-w-xl mx-auto leading-relaxed mt-4 whitespace-pre-line">
                  {description}
                </p>

                {certificate.story_title && (
                  <div className="mt-3 inline-block px-4 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600">
                    📖 Story: "{certificate.story_title}"
                  </div>
                )}
              </div>

              {/* Achievement Medallion & Date Row */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 my-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <span>🌟 Milestone:</span>
                  <span>{certificate.certificate_type === 'reading_completion' ? 'Story Completed' : 'Excellence'}</span>
                </div>

                {/* Center Seal */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-amber-400 bg-gradient-to-tr from-amber-400 to-amber-200 text-white flex flex-col items-center justify-center shadow-lg shrink-0">
                  <span className="text-xl sm:text-2xl">🏆</span>
                  <span className="text-[7px] font-black tracking-widest text-amber-900 uppercase">CHAMPION</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold">
                  <span>📅 Date:</span>
                  <span>{formattedDate}</span>
                </div>
              </div>

              {/* Bottom Signatures & Serial Line */}
              <div className="w-full pt-6 border-t border-slate-200/80 flex justify-between items-end text-left mt-6">
                <div>
                  <div className="text-[11px] font-bold text-slate-400">Classroom / Source</div>
                  <div className="font-extrabold text-xs text-slate-800">{classroomName}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Cert ID: {certNumber}</div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-400">Certified Educator / Parent</div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-800 font-serif italic text-base">
                    {issuerName}
                  </div>
                  <div className="text-[10px] text-rose-500 font-bold">StoryNest Official Platform</div>
                </div>
              </div>

            </div>
          </div>

          {/* Revoke Confirmation Box */}
          {showRevokeConfirm && (
            <div className="mt-4 max-w-3xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 animate-fade-in">
              <h5 className="text-xs font-extrabold text-rose-700 dark:text-rose-300 mb-1 flex items-center gap-2">
                <FaExclamationTriangle /> Revoke Certificate
              </h5>
              <p className="text-xs text-rose-600 dark:text-rose-400 mb-3">
                Are you sure you want to revoke this certificate? It will be marked as revoked.
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevoke}
                  disabled={revoking}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white shadow hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
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
              {isRevoked ? 'Status: Revoked' : 'Status: Active Verified'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isTeacher && !isRevoked && onRevoke && !showRevokeConfirm && (
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(true)}
                className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <FaBan /> Revoke Certificate
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-2xl text-xs font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
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
