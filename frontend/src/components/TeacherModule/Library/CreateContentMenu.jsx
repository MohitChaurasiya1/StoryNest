import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaBook, FaList, FaQuestionCircle, FaChevronDown } from 'react-icons/fa';

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
    <div className="relative inline-block text-left z-50" ref={menuRef} style={{ zIndex: 99999 }}>
      <button 
        type="button"
        className="flex items-center gap-2.5 px-5 py-3 rounded-full font-extrabold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        style={{
          backgroundColor: '#FFFFFF',
          color: '#FF6B6B',
          border: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.12)'
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <FaPlus style={{ color: '#FF6B6B', fontSize: '0.85rem' }} /> 
        <span style={{ color: '#FF6B6B' }}>Create Content</span>
        <FaChevronDown 
          style={{ color: '#FF6B6B', fontSize: '0.75rem' }} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2.5 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_45px_-5px_rgba(0,0,0,0.3)] border border-slate-200/90 dark:border-slate-800 p-2 animate-fade-in"
          style={{ zIndex: 999999 }}
        >
          <div className="space-y-1">
            <button 
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-800 dark:text-slate-200 group"
              onClick={() => handleCreate('story')}
            >
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                <FaBook />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight text-slate-900 dark:text-white">Create Story</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">AI or manual reader</div>
              </div>
            </button>

            <button 
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-800 dark:text-slate-200 group"
              onClick={() => handleCreate('lesson')}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                <FaList />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight text-slate-900 dark:text-white">Create Lesson</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Structured reading task</div>
              </div>
            </button>

            <button 
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-800 dark:text-slate-200 group"
              onClick={() => handleCreate('quiz')}
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                <FaQuestionCircle />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight text-slate-900 dark:text-white">Create Quiz</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Comprehension check</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateContentMenu;
