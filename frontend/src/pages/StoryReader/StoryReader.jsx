import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FaVolumeUp, 
  FaLanguage, 
  FaBookOpen, 
  FaArrowLeft, 
  FaArrowRight, 
  FaRedo,
  FaHome,
  FaAward,
  FaTrophy,
  FaGraduationCap,
  FaDownload,
  FaFilePdf
} from 'react-icons/fa';
import { generateStoryPDF, generateCertificatePDF } from '../../utils/pdfGenerator';
import api, { getApiErrorMessage } from '../../services/api';
import './StoryReader.css';

export default function StoryReader() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [lang, setLang] = useState('en'); // 'en' or 'hi'
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Real DB Story state, loading, error & PDF download states
  const [dbStory, setDbStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      api.get(`/stories/${id}/`)
        .then(res => {
          setDbStory(res.data);
        })
        .catch(err => {
          console.error('Error fetching story:', err);
          setError(getApiErrorMessage(err, 'Story not found in PostgreSQL database.'));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('No story ID provided.');
    }
  }, [id]);

  useEffect(() => {
    if (dbStory && location.state?.downloadPdf) {
      // clear navigation state to avoid repeat on refresh
      navigate(location.pathname, { replace: true, state: {} });
      const exportData = {
        ...dbStory,
        child_name: dbStory.child_name || 'Young Reader',
        title_en: dbStory.title_en || dbStory.title || 'A Magical Adventure',
        title_hi: dbStory.title_hi || '',
        moral: dbStory.moral || dbStory.moral_lesson || 'Kindness & Growth',
        created_at: dbStory.created_at || new Date().toISOString(),
        pages: dbStory.pages || [],
      };
      generateStoryPDF(exportData);
    }
  }, [dbStory, location.state]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 font-semibold text-slate-600">Loading storybook from database...</p>
        </div>
      </div>
    );
  }

  if (error || !dbStory || !dbStory.pages || dbStory.pages.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
            <FaBookOpen />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-slate-900">Story Not Found</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {error || 'This story is not available in the PostgreSQL database.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/parent/library')}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-200"
          >
            Return to Story Library
          </button>
        </div>
      </div>
    );
  }

  const story = {
    title: dbStory.title_en || 'A New Adventure',
    titleHi: dbStory.title_hi || 'एक नया रोमांच',
    author: 'StoryNest AI',
    grade: dbStory.grade || 'Grade 2',
    childName: dbStory.child_name || 'Leo',
    moral: dbStory.moral || 'Kindness & Growth',
    raw: dbStory,
    pages: (dbStory.pages || []).map(p => ({
      en: p.text_en || '',
      hi: p.text_hi || '',
      illustration: (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#FAF7F2', borderRadius: '16px', border: '2px dashed #5AB0A6' }}>
          <span style={{ fontSize: '3.5rem' }}>🎨</span>
          <p style={{ marginTop: '0.75rem', fontWeight: 'bold', color: '#418C84', fontSize: '0.9rem' }}>
            {p.illustration_prompt || 'Story Illustration Details'}
          </p>
        </div>
      ),
      dictionary: p.dictionary || {}
    }))
  };

  const wordsEn = story.pages[currentPage].en.split(" ");
  const wordsHi = story.pages[currentPage].hi.split(" ");
  const words = lang === 'en' ? wordsEn : wordsHi;

  // Text-To-Speech word highlighter simulation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      setActiveWordIdx(0);
      interval = setInterval(() => {
        setActiveWordIdx(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return -1;
          }
          return prev + 1;
        });
      }, 380); // speed matching a natural read
    } else {
      setActiveWordIdx(-1);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentPage, lang, words.length]);

  const handleNextPage = () => {
    setIsPlaying(false);
    setSelectedWord(null);
    if (currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Completed the story book!
      setShowCertificate(true);
    }
  };

  const handlePrevPage = () => {
    setIsPlaying(false);
    setSelectedWord(null);
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleWordClick = (word) => {
    // Clean up punctuation for dict lookup
    const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"?]/g, "");
    const dict = story.pages[currentPage].dictionary;
    
    if (dict[cleanWord]) {
      setSelectedWord({
        word: cleanWord,
        definition: dict[cleanWord]
      });
    } else {
      // Fallback fallback definition
      setSelectedWord({
        word: cleanWord,
        definition: `A wonderful word used to paint this magical story.`
      });
    }
  };

  // Export PDF helper using real DB story or fallback
  const getExportStoryData = () => {
    if (dbStory) {
      return {
        ...dbStory,
        child_name: dbStory.child_name || 'Young Reader',
        title_en: dbStory.title_en || story.title,
        title_hi: dbStory.title_hi || story.titleHi,
        moral: dbStory.moral || 'Kindness & Growth',
        created_at: dbStory.created_at || new Date().toISOString(),
        pages: dbStory.pages || story.pages
      };
    }
    return {
      child_name: story.childName || 'Leo',
      title_en: story.title,
      title_hi: story.titleHi,
      moral: story.moral || 'Kindness & Sharing',
      created_at: new Date().toISOString(),
      pages: story.pages.map((p, idx) => ({
        page_number: idx + 1,
        text_en: p.en,
        text_hi: p.hi,
        illustration_prompt: 'Whimsical watercolor scene illustration',
        dictionary: p.dictionary
      }))
    };
  };

  const handleDownloadStoryPdf = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateStoryPDF(getExportStoryData());
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadCert = async () => {
    setIsGeneratingCert(true);
    try {
      await generateCertificatePDF(getExportStoryData());
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCert(false);
    }
  };

  return (
    <div className="reader-root animate-fade-in">
      {/* Header bar */}
      <header className="reader-header-bar">
        <Link to="/" className="reader-back-btn">
          <FaArrowLeft /> Exit Reader
        </Link>

        <div className="reader-title-badge">
          <FaBookOpen className="badge-icon" />
          <span className="serif-heading">{lang === 'en' ? story.title : story.titleHi}</span>
          <span className="badge-grade">{story.grade}</span>
        </div>

        <div className="reader-controls">
          <button 
            className="reader-icon-btn"
            onClick={handleDownloadStoryPdf}
            disabled={isGeneratingPDF}
            title="Download Story PDF"
          >
            <FaFilePdf />
            <span>{isGeneratingPDF ? 'Exporting...' : 'Story PDF'}</span>
          </button>

          <button 
            className="reader-icon-btn toggle-lang-btn"
            onClick={() => {
              setLang(lang === 'en' ? 'hi' : 'en');
              setIsPlaying(false);
            }}
            title="Translate Page"
          >
            <FaLanguage />
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
          
          <button 
            className={`reader-icon-btn audio-btn ${isPlaying ? 'active' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            title="Read Aloud"
          >
            <FaVolumeUp />
            <span>{isPlaying ? 'Stop' : 'Read Aloud'}</span>
          </button>
        </div>
      </header>

      {/* Main book reader workspace */}
      <main className="reader-workspace">
        <div className="reader-storybook-layout">
          {/* Left illustration panel */}
          <div className="storybook-illustration-panel">
            <div className="illustration-wrapper-card">
              {story.pages[currentPage].illustration}
              <div className="illustration-page-tag">
                Page {currentPage + 1} of {story.pages.length}
              </div>
            </div>
          </div>

          {/* Right text panel */}
          <div className="storybook-text-panel">
            <div className="text-panel-inner">
              <span className="hint-label">💡 Tip: Click any word to see its meaning</span>
              <p className="storybook-words-paragraph serif-heading">
                {words.map((word, idx) => (
                  <span 
                    key={idx}
                    className={`storybook-word-element ${idx === activeWordIdx ? 'word-active' : ''}`}
                    onClick={() => handleWordClick(word)}
                  >
                    {word}
                  </span>
                ))}
              </p>

              {/* Custom Dictionary Popup Widget */}
              {selectedWord && (
                <div className="dictionary-card animate-fade-in">
                  <div className="dict-header">
                    <span className="dict-word serif-heading">"{selectedWord.word}"</span>
                    <button className="dict-close-btn" onClick={() => setSelectedWord(null)}>×</button>
                  </div>
                  <p className="dict-definition">{selectedWord.definition}</p>
                </div>
              )}
            </div>

            {/* Stepper buttons at the bottom of text page */}
            <div className="storybook-footer-nav">
              <button 
                className="btn btn-outline reader-nav-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                <FaArrowLeft /> Previous
              </button>

              <div className="pagination-dots">
                {story.pages.map((_, i) => (
                  <span 
                    key={i} 
                    className={`pagination-dot ${i === currentPage ? 'active' : ''}`}
                    onClick={() => { setCurrentPage(i); setIsPlaying(false); setSelectedWord(null); }}
                  />
                ))}
              </div>

              <button 
                className="btn btn-primary reader-nav-btn accent-teal-btn"
                onClick={handleNextPage}
              >
                {currentPage === story.pages.length - 1 ? 'Finish Story' : 'Next'} <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Completion Modal / Certificate Celebration Overlay */}
      {showCertificate && (
        <div className="certificate-modal-overlay">
          <div className="certificate-modal-content animate-fade-in">
            <div className="cert-celebration-head">
              <FaTrophy className="cert-trophy-icon" />
              <FaGraduationCap className="cert-cap-icon" />
            </div>

            <h2 className="serif-heading cert-heading-title">Congratulations, {story.childName || 'Reader'}!</h2>
            <p className="cert-sub">You have finished reading <strong>{story.title}</strong> and earned your reading medal!</p>

            <div className="badge-preview-container">
              <div className="gold-medal-seal">
                <FaAward className="seal-award-icon" />
                <span className="seal-text">STORYNEST CHAMPION</span>
              </div>
            </div>

            <div className="cert-actions-row" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                className="btn btn-outline"
                onClick={handleDownloadStoryPdf}
                disabled={isGeneratingPDF}
              >
                <FaFilePdf /> {isGeneratingPDF ? 'Generating...' : 'Download Story PDF'}
              </button>

              <button 
                className="btn btn-primary cert-download-btn"
                onClick={handleDownloadCert}
                disabled={isGeneratingCert}
              >
                <FaDownload /> {isGeneratingCert ? 'Generating...' : 'Download Certificate'}
              </button>

              <button 
                className="btn btn-outline"
                onClick={() => { setShowCertificate(false); setCurrentPage(0); }}
              >
                <FaRedo /> Read Again
              </button>

              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/parent')}
              >
                <FaHome /> Back to Parent desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
