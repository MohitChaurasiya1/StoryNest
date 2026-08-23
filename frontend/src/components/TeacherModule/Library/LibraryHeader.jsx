import React from 'react';
import CreateContentMenu from './CreateContentMenu';

const LibraryHeader = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, color: 'var(--text-color)' }}>Content Library</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-light)' }}>
          Discover, create, and manage your teaching resources.
        </p>
      </div>
      <div>
        <CreateContentMenu />
      </div>
    </div>
  );
};

export default LibraryHeader;
