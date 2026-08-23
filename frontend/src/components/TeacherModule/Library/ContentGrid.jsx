import React from 'react';
import ContentCard from './ContentCard';
import { FaInbox } from 'react-icons/fa';

const ContentGrid = ({ content, loading, onPreview }) => {
  if (loading) {
    return (
      <div className="grid-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="card" style={{ height: '300px', padding: 0 }}>
            <div className="shimmer" style={{ height: '140px', width: '100%', borderBottom: '1px solid #f1f5f9' }} />
            <div style={{ padding: '1rem' }}>
              <div className="shimmer mb-4" style={{ height: '24px', width: '80%', borderRadius: '4px' }} />
              <div className="shimmer mb-2" style={{ height: '16px', width: '100%', borderRadius: '4px' }} />
              <div className="shimmer mb-6" style={{ height: '16px', width: '60%', borderRadius: '4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="shimmer" style={{ height: '36px', width: '80px', borderRadius: '4px' }} />
                <div className="shimmer" style={{ height: '36px', width: '36px', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <FaInbox style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>No Content Found</h3>
        <p style={{ color: 'var(--text-light)', maxWidth: '400px', margin: '0 auto' }}>
          Try adjusting your filters or use the "+ Create Content" button above to add something new.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-3">
      {content.map(item => (
        <ContentCard key={`${item.type}-${item.id}`} item={item} onPreview={onPreview} />
      ))}
    </div>
  );
};

export default ContentGrid;
