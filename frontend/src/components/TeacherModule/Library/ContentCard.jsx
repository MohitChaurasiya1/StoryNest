import React from 'react';
import { 
  FaBook as BookIcon, 
  FaList as ListIcon, 
  FaQuestionCircle as QuizIcon, 
  FaUser as UserIcon, 
  FaBuilding as BuildingIcon, 
  FaClock as ClockIcon, 
  FaEye as EyeIcon 
} from 'react-icons/fa';

const ContentCard = ({ item, onPreview }) => {
  const getIcon = () => {
    switch(item.type) {
      case 'story': return <BookIcon className="text-xs" />;
      case 'lesson': return <ListIcon className="text-xs" />;
      case 'quiz': return <QuizIcon className="text-xs" />;
      default: return <BookIcon className="text-xs" />;
    }
  };

  const getTheme = () => {
    switch(item.type) {
      case 'story': return { 
        bg: 'bg-sky-50 dark:bg-sky-950/40', 
        pillBg: 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        label: 'Story',
        placeholderGrad: 'from-sky-400 to-indigo-500'
      };
      case 'lesson': return { 
        bg: 'bg-amber-50 dark:bg-amber-950/40', 
        pillBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        label: 'Lesson',
        placeholderGrad: 'from-amber-400 to-orange-500'
      };
      case 'quiz': return { 
        bg: 'bg-rose-50 dark:bg-rose-950/40', 
        pillBg: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        label: 'Quiz',
        placeholderGrad: 'from-rose-400 to-pink-500'
      };
      default: return { 
        bg: 'bg-slate-50 dark:bg-slate-900', 
        pillBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        label: 'Item',
        placeholderGrad: 'from-slate-400 to-slate-600'
      };
    }
  };

  const theme = getTheme();

  return (
    <div className="card p-0 overflow-hidden flex flex-col h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border border-slate-200/80 dark:border-slate-800 group">
      {/* Cover Image or Gradient Header */}
      <div 
        className={`h-36 relative overflow-hidden flex items-center justify-center ${
          item.cover_image ? '' : `bg-gradient-to-br ${theme.placeholderGrad}`
        }`}
        style={item.cover_image ? { background: `url(${item.cover_image}) center/cover no-repeat` } : {}}
      >
        {!item.cover_image && (
          <span className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300 select-none">
            {item.type === 'story' ? '📖' : item.type === 'lesson' ? '📝' : '🎯'}
          </span>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wide border flex items-center gap-1.5 shadow-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm ${theme.pillBg}`}>
              {getIcon()} {theme.label}
            </span>
            {item.grade && (
              <span className="px-2 py-0.5 rounded-xl text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-white/50 dark:border-slate-700 shadow-sm backdrop-blur-sm">
                {item.grade}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-rose-500 transition-colors">
            {item.title}
          </h3>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {item.description || 'Interactive educational content designed for classroom learning.'}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              {item.creator?.type === 'system' ? (
                <BuildingIcon className="text-indigo-400" />
              ) : (
                <UserIcon className="text-rose-400" />
              )}
              <span className="truncate max-w-[120px]">{item.creator?.name || 'StoryNest'}</span>
            </div>

            {item.estimated_minutes && (
              <div className="flex items-center gap-1">
                <ClockIcon className="text-slate-400" />
                <span>{item.estimated_minutes} min</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button 
            type="button"
            className="w-full btn btn-secondary text-xs py-2 flex items-center justify-center gap-2 group-hover:border-rose-300 dark:group-hover:border-rose-900 transition-colors"
            onClick={() => onPreview(item)}
          >
            <EyeIcon className="text-xs" /> Preview Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
