import React, { useState, useEffect } from 'react';
import { FiSearch as Search, FiBookOpen as BookOpen, FiHelpCircle as FileQuestion, FiPlayCircle as MonitorPlay, FiCheck, FiX } from 'react-icons/fi';
import teacherLibraryService from '../../../../services/teacherLibraryService';

const ContentSelector = ({ data, updateData, onNext }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const res = await teacherLibraryService.getContent({
          search: searchQuery,
          type: filterType
        });
        const items = res?.results || (Array.isArray(res) ? res : []);
        setContent(items);
      } catch (err) {
        console.error('Failed to load content:', err);
        setContent([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce
    const timeoutId = setTimeout(() => {
      fetchContent();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterType]);

  const handleSelect = (item) => {
    updateData({
      content_type: item.type,
      content_id: item.id,
      content_title: item.title,
      title: item.title // Default assignment title
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'story':
        return <BookOpen className="w-5 h-5" />;
      case 'quiz':
        return <FileQuestion className="w-5 h-5" />;
      case 'lesson':
        return <MonitorPlay className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Choose Learning Content</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select a story, quiz, or lesson from the library to assign to your students.
        </p>
      </div>

      {/* Selected Content Banner */}
      {data.content_id && (
        <div className="p-4 border-2 border-[#FF6B6B] bg-gradient-to-r from-coral-50/90 to-orange-50/60 dark:from-coral-950/40 dark:to-orange-950/20 rounded-2xl flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 bg-white dark:bg-slate-800 text-[#FF6B6B] rounded-xl shadow-2xs shrink-0">
              {getIcon(data.content_type)}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF6B6B]">
                Selected {data.content_type}
              </span>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {data.content_title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateData({ content_type: '', content_id: null, content_title: '', title: '' })}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 transition-all shrink-0 ml-2"
          >
            <FiX className="w-3.5 h-3.5" /> Change
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stories, lessons, quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B6B] transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 px-4 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B6B] transition-all"
        >
          <option value="all">All Content Types</option>
          <option value="story">Stories</option>
          <option value="lesson">Lessons</option>
          <option value="quiz">Quizzes</option>
        </select>
      </div>

      {/* Content Feed List */}
      <div className="grid gap-3 max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500 flex items-center justify-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-[#FF6B6B] border-t-transparent rounded-full"></div>
            Loading library content...
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
            <BookOpen className="text-3xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No content found matching your search.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different term or change the content filter.</p>
          </div>
        ) : (
          content.map((item) => {
            const isSelected = data.content_id === item.id && data.content_type === item.type;

            return (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#FF6B6B] bg-gradient-to-r from-coral-50/80 to-orange-50/40 dark:from-coral-950/40 dark:to-orange-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {item.cover_image ? (
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 bg-slate-100"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-coral-50 dark:bg-coral-950/40 text-[#FF6B6B] flex items-center justify-center shadow-2xs shrink-0">
                      {getIcon(item.type)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {item.type}
                      </span>
                      {item.grade && (
                        <span className="text-[11px] font-bold text-slate-400">
                          {item.grade}
                        </span>
                      )}
                      {item.estimated_minutes && (
                        <span className="text-[11px] font-medium text-slate-400">
                          • {item.estimated_minutes} min
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  <div
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FF6B6B] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <FiCheck className="w-3.5 h-3.5 stroke-[3]" /> Selected
                      </>
                    ) : (
                      'Select'
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/60">
        <button
          type="button"
          onClick={onNext}
          disabled={!data.content_id}
          className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold px-6 py-2.5 shadow-md"
        >
          Next Step: Choose Recipients →
        </button>
      </div>
    </div>
  );
};

export default ContentSelector;
