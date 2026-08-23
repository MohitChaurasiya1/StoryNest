
import React, { useState, useEffect } from 'react';
import { FiSearch as Search, FiBookOpen as BookOpen, FiHelpCircle as FileQuestion, FiPlayCircle as MonitorPlay } from 'react-icons/fi';
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
        const results = await teacherLibraryService.getLibraryFeed({
          search: searchQuery,
          type: filterType
        });
        setContent(results);
      } catch (err) {
        console.error(err);
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
    switch(type) {
      case 'story': return <BookOpen className="w-5 h-5" />;
      case 'quiz': return <FileQuestion className="w-5 h-5" />;
      case 'lesson': return <MonitorPlay className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose learning content</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Select a story, quiz, or lesson to assign to your students.</p>
      </div>

      {data.content_id && (
        <div className="p-4 border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-lg">
              {getIcon(data.content_type)}
            </div>
            <div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium capitalize">Selected {data.content_type}</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">{data.content_title}</p>
            </div>
          </div>
          <button 
            onClick={() => updateData({ content_type: '', content_id: null, content_title: '' })}
            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
          >
            Change
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-xl border border-slate-200 py-2 px-4 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="story">Stories</option>
          <option value="lesson">Lessons</option>
          <option value="quiz">Quizzes</option>
        </select>
      </div>

      <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : content.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No content found.</div>
        ) : (
          content.map(item => (
            <div 
              key={item.type + item.id}
              onClick={() => handleSelect(item)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                data.content_id === item.id && data.content_type === item.type
                  ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                  {getIcon(item.type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {item.type} {item.grade ? `• ${item.grade}` : ''} {item.estimated_minutes ? `• ${item.estimated_minutes} min` : ''}
                  </p>
                </div>
              </div>
              
              <button 
                className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                  data.content_id === item.id && data.content_type === item.type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {data.content_id === item.id && data.content_type === item.type ? 'Selected' : 'Select'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!data.content_id}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default ContentSelector;
