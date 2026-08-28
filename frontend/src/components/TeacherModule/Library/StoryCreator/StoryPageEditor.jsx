import React, { useState } from 'react';
import { 
  FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaBookOpen, 
  FaEye, FaSave, FaCheck, FaLanguage, FaPaintBrush, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

const StoryPageEditor = ({
  storyMeta,
  setStoryMeta,
  pages,
  setPages,
  onSaveDraft,
  onPublishClick,
  saving,
  savedSuccess
}) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  const activePage = pages[activePageIndex] || {
    page_number: activePageIndex + 1,
    text_en: '',
    text_hi: '',
    illustration_prompt: ''
  };

  const handlePageChange = (field, value) => {
    const updated = [...pages];
    updated[activePageIndex] = {
      ...updated[activePageIndex],
      [field]: value
    };
    setPages(updated);
  };

  const handleAddPage = () => {
    const newPage = {
      page_number: pages.length + 1,
      text_en: '',
      text_hi: '',
      illustration_prompt: `Illustration for page ${pages.length + 1}`
    };
    const updated = [...pages, newPage];
    setPages(updated);
    setActivePageIndex(updated.length - 1);
  };

  const handleDeletePage = (indexToDelete) => {
    if (pages.length <= 1) {
      alert('A story must have at least one page.');
      return;
    }
    if (!window.confirm(`Delete page ${indexToDelete + 1}?`)) return;

    const filtered = pages.filter((_, idx) => idx !== indexToDelete);
    // renumber pages
    const renumbered = filtered.map((p, idx) => ({
      ...p,
      page_number: idx + 1
    }));
    setPages(renumbered);
    setActivePageIndex(Math.min(activePageIndex, renumbered.length - 1));
  };

  const handleMovePage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // renumber
    const renumbered = updated.map((p, idx) => ({
      ...p,
      page_number: idx + 1
    }));

    setPages(renumbered);
    setActivePageIndex(targetIndex);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card with Title & Actions */}
      <div className="card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 w-full md:w-auto">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-1">
            Story Title
          </label>
          <input 
            type="text"
            className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-rose-500 focus:outline-none w-full transition-colors pb-1"
            value={storyMeta.title}
            onChange={(e) => setStoryMeta({ ...storyMeta, title: e.target.value })}
            placeholder="Untitled Story"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
            <span className="pill">{storyMeta.grade || 'Grade 2'}</span>
            <span className="pill">{storyMeta.reading_difficulty || 'Intermediate'}</span>
            <span className="pill">{storyMeta.genre || 'Adventure'}</span>
            <span>{pages.length} Pages</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button 
            type="button" 
            className="btn btn-outline flex items-center gap-2"
            onClick={() => {
              setPreviewPageIndex(0);
              setShowPreviewModal(true);
            }}
          >
            <FaEye /> Preview Story
          </button>

          <button 
            type="button" 
            className="btn btn-secondary flex items-center gap-2"
            onClick={onSaveDraft}
            disabled={saving}
          >
            {savedSuccess ? <FaCheck className="text-emerald-500" /> : <FaSave />}
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button 
            type="button" 
            className="btn btn-primary flex items-center gap-2"
            onClick={onPublishClick}
          >
            <FaBookOpen /> Publish...
          </button>
        </div>
      </div>

      {/* Editor Body Grid: Page Thumbnails + Active Page Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pages List (3 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Pages ({pages.length})
              </h4>
              <button 
                type="button" 
                onClick={handleAddPage}
                className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <FaPlus className="text-xs" /> Add Page
              </button>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {pages.map((p, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActivePageIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    activePageIndex === idx
                      ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 shadow-sm ring-1 ring-rose-300 dark:ring-rose-800'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-5 h-5 rounded-full text-[11px] font-extrabold flex items-center justify-center ${
                        activePageIndex === idx 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        Page {idx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.text_en || '(Empty page)'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMovePage(idx, -1)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 text-xs"
                      title="Move up"
                    >
                      <FaArrowUp />
                    </button>
                    <button 
                      type="button"
                      disabled={idx === pages.length - 1}
                      onClick={() => handleMovePage(idx, 1)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 text-xs"
                      title="Move down"
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Page Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
                  Editing Story Content
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Page {activePageIndex + 1} of {pages.length}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => handleDeletePage(activePageIndex)}
                  className="px-3 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                  title="Delete page"
                >
                  <FaTrash /> Delete Page
                </button>
              </div>
            </div>

            {/* English Text Content */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FaBookOpen className="text-rose-500" />
                English Story Text *
              </label>
              <textarea 
                rows={6}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base leading-relaxed focus:ring-2 focus:ring-rose-500 resize-y shadow-inner font-sans"
                placeholder="Write the narrative text for this page..."
                value={activePage.text_en || ''}
                onChange={(e) => handlePageChange('text_en', e.target.value)}
              />
            </div>

            {/* Hindi Translation (Bilingual support) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FaLanguage className="text-indigo-500" />
                Hindi Translation / Text (Optional)
              </label>
              <textarea 
                rows={3}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base leading-relaxed focus:ring-2 focus:ring-rose-500 resize-y"
                placeholder="हिंदी अनुवाद या कहानी का अंश..."
                value={activePage.text_hi || ''}
                onChange={(e) => handlePageChange('text_hi', e.target.value)}
              />
            </div>

            {/* Illustration Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FaPaintBrush className="text-amber-500" />
                Illustration Scene Description / Prompt
              </label>
              <input 
                type="text"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500"
                placeholder="e.g., Felix the little fox wearing goggles looking through a glowing golden telescope under starry skies"
                value={activePage.illustration_prompt || ''}
                onChange={(e) => handlePageChange('illustration_prompt', e.target.value)}
              />
            </div>

            {/* Page Pagination Bottom Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={activePageIndex === 0}
                onClick={() => setActivePageIndex(activePageIndex - 1)}
                className="btn btn-outline text-xs flex items-center gap-2 disabled:opacity-30"
              >
                <FaChevronLeft /> Previous Page
              </button>

              <span className="text-xs font-bold text-slate-400">
                {activePageIndex + 1} / {pages.length}
              </span>

              <button
                type="button"
                disabled={activePageIndex === pages.length - 1}
                onClick={() => setActivePageIndex(activePageIndex + 1)}
                className="btn btn-outline text-xs flex items-center gap-2 disabled:opacity-30"
              >
                Next Page <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-w-2xl w-full max-h-[85vh] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">
                  Student Story Preview
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {storyMeta.title || 'Untitled Story'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Preview Reader Page */}
            <div className="p-8 flex-1 overflow-y-auto min-h-[300px] flex flex-col justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-2xl mx-auto shadow-inner">
                📖
              </div>

              {pages[previewPageIndex]?.illustration_prompt && (
                <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 italic max-w-md mx-auto">
                  🎨 Scene: {pages[previewPageIndex].illustration_prompt}
                </div>
              )}

              <div className="space-y-4 max-w-lg mx-auto">
                <p className="text-xl font-serif text-slate-900 dark:text-white leading-relaxed">
                  {pages[previewPageIndex]?.text_en || '(No content on this page)'}
                </p>

                {pages[previewPageIndex]?.text_hi && (
                  <p className="text-base font-serif text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                    {pages[previewPageIndex].text_hi}
                  </p>
                )}
              </div>
            </div>

            {/* Preview Reader Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
              <button
                type="button"
                disabled={previewPageIndex === 0}
                onClick={() => setPreviewPageIndex(previewPageIndex - 1)}
                className="btn btn-outline text-xs flex items-center gap-2 disabled:opacity-30"
              >
                <FaChevronLeft /> Prev
              </button>

              <span className="text-xs font-bold text-slate-500">
                Page {previewPageIndex + 1} of {pages.length}
              </span>

              <button
                type="button"
                disabled={previewPageIndex === pages.length - 1}
                onClick={() => setPreviewPageIndex(previewPageIndex + 1)}
                className="btn btn-outline text-xs flex items-center gap-2 disabled:opacity-30"
              >
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryPageEditor;
