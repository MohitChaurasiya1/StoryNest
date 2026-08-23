import React from 'react';
import { FaBook as BookIcon, FaList as ListIcon, FaQuestionCircle as QuizIcon, FaUser as UserIcon, FaBuilding as BuildingIcon, FaClock as ClockIcon, FaEllipsisV as DotsIcon } from 'react-icons/fa';

const ContentCard = ({ item, onPreview }) => {
  const getIcon = () => {
    switch(item.type) {
      case 'story': return <BookIcon size={16} />;
      case 'lesson': return <ListIcon size={16} />;
      case 'quiz': return <QuizIcon size={16} />;
      default: return <BookIcon size={16} />;
    }
  };

  const getTheme = () => {
    switch(item.type) {
      case 'story': return { bg: '#e0f2fe', color: '#0ea5e9', label: 'Story' };
      case 'lesson': return { bg: '#fef08a', color: '#ca8a04', label: 'Lesson' };
      case 'quiz': return { bg: '#fce7f3', color: '#db2777', label: 'Quiz' };
      default: return { bg: '#f1f5f9', color: '#64748b', label: 'Item' };
    }
  };

  const theme = getTheme();

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Cover Image or Pattern */}
      <div 
        style={{ 
          height: '140px', 
          background: item.cover_image ? `url(${item.cover_image}) center/cover no-repeat` : theme.bg,
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.5rem' }}>
          <span className="pill" style={{ background: 'white', color: theme.color, border: `1px solid ${theme.bg}`, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {getIcon()} {theme.label}
          </span>
          {item.grade && (
            <span className="pill" style={{ background: 'rgba(255,255,255,0.9)', color: '#334155' }}>
              {item.grade}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)', fontSize: '1.1rem' }}>
          {item.title}
        </h3>
        
        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-light)', fontSize: '0.9rem', flex: 1 }}>
          {item.description?.length > 80 ? item.description.substring(0, 80) + '...' : item.description}
        </p>

        {/* Metadata */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
          {item.estimated_minutes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ClockIcon /> {item.estimated_minutes} min
            </div>
          )}
          {item.creator && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {item.creator.type === 'system' ? <BuildingIcon /> : <UserIcon />}
              {item.creator.name}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            onClick={() => onPreview(item)}
          >
            Preview
          </button>
          
          <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}>
            <DotsIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
