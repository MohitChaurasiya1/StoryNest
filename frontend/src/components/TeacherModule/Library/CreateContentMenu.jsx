import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaBook, FaList, FaQuestionCircle } from 'react-icons/fa';

const CreateContentMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = (type) => {
    setIsOpen(false);
    navigate(`/teacher/library/create-${type}`);
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        className="btn btn-primary flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaPlus /> Create Content
      </button>

      {isOpen && (
        <div 
          className="card shadow-lg" 
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '0.5rem', 
            width: '200px', 
            zIndex: 50,
            padding: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button 
              className="btn btn-secondary flex items-center gap-3" 
              style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
              onClick={() => handleCreate('story')}
            >
              <div className="icon-circle" style={{ background: '#e0f2fe', color: '#0ea5e9', width: '30px', height: '30px', padding: 0 }}>
                <FaBook size={14} />
              </div>
              Story
            </button>
            <button 
              className="btn btn-secondary flex items-center gap-3" 
              style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
              onClick={() => handleCreate('lesson')}
            >
              <div className="icon-circle" style={{ background: '#fef08a', color: '#ca8a04', width: '30px', height: '30px', padding: 0 }}>
                <FaList size={14} />
              </div>
              Lesson
            </button>
            <button 
              className="btn btn-secondary flex items-center gap-3" 
              style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent' }}
              onClick={() => handleCreate('quiz')}
            >
              <div className="icon-circle" style={{ background: '#fce7f3', color: '#db2777', width: '30px', height: '30px', padding: 0 }}>
                <FaQuestionCircle size={14} />
              </div>
              Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateContentMenu;
