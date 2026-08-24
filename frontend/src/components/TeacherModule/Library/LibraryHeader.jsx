import React from 'react';
import CreateContentMenu from './CreateContentMenu';

const LibraryHeader = () => {
  return (
    <div className="parent-header parent-hero-card mb-6" style={{ overflow: 'visible', zIndex: 40 }}>
      <div className="parent-header-left">
        <h2 className="serif-heading text-white">Content Library</h2>
        <p className="text-white/85 mt-2" style={{ fontSize: '0.95rem' }}>
          Discover, create, and manage teaching resources, interactive stories, and classroom lessons.
        </p>
      </div>
      <div className="parent-header-right flex flex-wrap items-center gap-3" style={{ overflow: 'visible', zIndex: 50 }}>
        <CreateContentMenu />
      </div>
    </div>
  );
};

export default LibraryHeader;
