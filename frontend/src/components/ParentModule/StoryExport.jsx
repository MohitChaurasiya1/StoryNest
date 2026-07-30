import React, { useState } from 'react';
import { FaDownload, FaPrint, FaShareAlt, FaFilePdf, FaCheck } from 'react-icons/fa';
import { generatePdfFromStory } from '../../utils/pdfGenerator';
import ToastNotification from './ToastNotification';

export default function StoryExport({ story }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  if (!story) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await generatePdfFromStory(story);
      setToast({ type: 'success', message: 'PDF generated and downloaded!' });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to generate PDF' });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: story.title_en,
      text: `Read "${story.title_en}" on StoryNest!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setToast({ type: 'info', message: 'Story link copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleDownloadPdf}
        disabled={downloading}
        className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
      >
        <FaFilePdf /> {downloading ? 'Exporting PDF...' : 'Download PDF'}
      </button>

      <button
        onClick={handlePrint}
        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
      >
        <FaPrint /> Print
      </button>

      <button
        onClick={handleShare}
        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
      >
        {copied ? <FaCheck className="text-emerald-500" /> : <FaShareAlt />} {copied ? 'Copied!' : 'Share'}
      </button>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
