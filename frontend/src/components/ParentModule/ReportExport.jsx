import React, { useState } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ToastNotification from './ToastNotification';
import { parentReportsApi } from '../../services/api';
import { FaFileDownload, FaFilePdf, FaFileCsv, FaCheckSquare } from 'react-icons/fa';

export default function ReportExport() {
  const [format, setFormat] = useState('csv'); // 'csv' | 'pdf'
  const [sections, setSections] = useState({
    reading: true,
    quiz: true,
    achievements: true,
    certificates: true,
    goals: true,
  });
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await parentReportsApi.getExportData();

      if (format === 'csv') {
        let csvContent = "data:text/csv;charset=utf-8,Section,Detail\n";
        csvContent += `Generated At,${data.generated_at}\n`;
        csvContent += `Parent User,${data.parent}\n`;
        csvContent += `Total Children,${data.total_children}\n`;

        if (sections.reading && data.logs) {
          data.logs.forEach(l => {
            csvContent += `Reading Log,Child: ${l.child_name} | Story: ${l.story_title} | Mins: ${l.reading_time_minutes} | Rating: ${l.rating}\n`;
          });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `StoryNest_Report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setToast({ type: 'success', message: 'CSV Report downloaded!' });
      } else {
        window.print();
        setToast({ type: 'info', message: 'Print dialog opened for PDF report' });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to generate report export' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar title="Report Export" />

        <main className="p-6 max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FaFileDownload className="text-rose-500" /> Export Reports
            </h1>
            <p className="text-sm text-slate-500">Generate comprehensive reading and progress reports for school or personal records.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-900">Select Export Format</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`p-4 rounded-2xl border flex items-center gap-3 font-bold text-sm transition ${
                    format === 'csv' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <FaFileCsv className="text-2xl text-emerald-500" /> CSV Spreadsheet
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`p-4 rounded-2xl border flex items-center gap-3 font-bold text-sm transition ${
                    format === 'pdf' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <FaFilePdf className="text-2xl text-rose-500" /> PDF Document (Printable)
                </button>
              </div>
            </div>

            {/* Sections Selection */}
            <div className="space-y-3 pt-4 border-t">
              <label className="text-sm font-bold text-slate-900">Include Sections</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(sections).map((key) => (
                  <label key={key} className="flex items-center gap-3 text-xs font-bold text-slate-700 capitalize cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sections[key]}
                      onChange={(e) => setSections({ ...sections, [key]: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                    />
                    {key} Progress & Analytics
                  </label>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm shadow-lg hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
              >
                <FaFileDownload /> {exporting ? 'Generating...' : `Export ${format.toUpperCase()} Report`}
              </button>
            </div>
          </div>
        </main>
      </div>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
