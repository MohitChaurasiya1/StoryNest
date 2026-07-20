import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  FaDownload
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';

export default function StoryReader() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lang, setLang] = useState('en'); // 'en' or 'es'
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Sample Storybook Data
  const story = {
    title: 'Bruno\'s Sweet Lesson',
    titleEs: 'La Dulce Lección de Bruno',
    author: 'StoryNest AI',
    grade: 'Grade 2',
    pages: [
      {
        en: 'Bruno the bear woke up one sunny morning to find his honey jar overflowing. "There\'s too much for just me!" he laughed, golden drops rolling down his fuzzy chin.',
        es: 'El oso Bruno se despertó una mañana soleada y encontró su tarro de miel desbordando. "¡Es demasiado para mí solo!", se rió, mientras gotas doradas rodaban por su peluda barbilla.',
        illustration: (
          <svg viewBox="0 0 400 280" className="reader-svg">
            <defs>
              <linearGradient id="skyGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#418C84" />
                <stop offset="100%" stopColor="#5AB0A6" />
              </linearGradient>
              <linearGradient id="honeyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FCE38A" />
                <stop offset="100%" stopColor="#B5822A" />
              </linearGradient>
            </defs>
            <rect width="400" height="280" fill="url(#skyGrad1)" rx="16" />
            <circle cx="340" cy="60" r="30" fill="#FCE38A" opacity="0.85" />
            <circle cx="340" cy="60" r="45" fill="#FCE38A" opacity="0.15" />
            
            {/* Hills */}
            <path d="M 0 200 Q 120 170 240 210 T 400 185 L 400 280 L 0 280 Z" fill="#8FCB9B" opacity="0.9" />
            <path d="M 0 230 Q 160 210 320 240 T 400 225 L 400 280 L 0 280 Z" fill="#71A87D" />

            {/* Bear */}
            <g transform="translate(140, 140)">
              <ellipse cx="40" cy="50" rx="30" ry="24" fill="#8B6914" />
              <circle cx="40" cy="22" r="18" fill="#8B6914" />
              {/* Ears */}
              <circle cx="26" cy="10" r="6" fill="#8B6914" />
              <circle cx="54" cy="10" r="6" fill="#8B6914" />
              {/* Face details */}
              <circle cx="33" cy="18" r="2.5" fill="#2F3B2A" />
              <circle cx="47" cy="18" r="2.5" fill="#2F3B2A" />
              <ellipse cx="40" cy="24" rx="4" ry="2.5" fill="#3D2E0B" />
              {/* Honey drops on chin */}
              <circle cx="38" cy="30" r="2" fill="#FCE38A" />
              <circle cx="43" cy="32" r="2.5" fill="#FCE38A" />
            </g>

            {/* Overflowing honey jar */}
            <g transform="translate(250, 185)">
              <rect x="0" y="8" width="30" height="35" rx="6" fill="#B5822A" stroke="#FAF2DF" strokeWidth="1.5" />
              <ellipse cx="15" cy="8" rx="15" ry="4" fill="#FAF2DF" />
              {/* Overflowing honey */}
              <path d="M 5 8 Q 15 15 25 8 Q 28 20 22 28 Q 15 20 8 28 Z" fill="url(#honeyGrad)" />
            </g>
          </svg>
        ),
        dictionary: {
          bear: 'A large, heavy mammal with thick fur and a very short tail (Oso).',
          honey: 'A sweet, sticky yellowish-brown fluid made by bees (Miel).',
          overflowing: 'Flowing over the edge of its container because it is too full (Desbordando).',
          golden: 'Having the color or shine of gold (Dorado).',
          fuzzy: 'Having a frizzy, fluffy, or frayed texture or appearance (Peludo/Fuzzy).'
        }
      },
      {
        en: 'He walked through the whispering pines until he found Rosie the rabbit. "Would you like some honey?" Bruno asked, holding out a tiny cup. Rosie\'s ears perked up with joy.',
        es: 'Caminó a través de los pinos susurrantes hasta que encontró a la coneja Rosie. "¿Te gustaría un poco de miel?", preguntó Bruno, ofreciéndole una taza diminuta. Las orejas de Rosie se levantaron de alegría.',
        illustration: (
          <svg viewBox="0 0 400 280" className="reader-svg">
            <defs>
              <linearGradient id="skyGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#418C84" />
                <stop offset="100%" stopColor="#5AB0A6" />
              </linearGradient>
            </defs>
            <rect width="400" height="280" fill="url(#skyGrad2)" rx="16" />
            
            {/* Hills */}
            <path d="M 0 190 Q 150 160 300 200 T 400 180 L 400 280 L 0 280 Z" fill="#8FCB9B" opacity="0.9" />
            <path d="M 0 220 Q 180 200 360 230 L 400 220 L 400 280 L 0 280 Z" fill="#71A87D" />

            {/* Pine Trees */}
            <g transform="translate(40, 100)">
              <rect x="12" y="50" width="6" height="40" fill="#584833" />
              <polygon points="15,10 0,60 30,60" fill="#3D5C34" />
            </g>
            <g transform="translate(320, 90)">
              <rect x="12" y="60" width="6" height="40" fill="#584833" />
              <polygon points="15,15 0,70 30,70" fill="#3D5C34" opacity="0.8" />
            </g>

            {/* Bear */}
            <g transform="translate(100, 145)">
              <ellipse cx="30" cy="40" rx="24" ry="20" fill="#8B6914" />
              <circle cx="30" cy="18" r="14" fill="#8B6914" />
              <circle cx="25" cy="14" r="2" fill="#2F3B2A" />
              <circle cx="35" cy="14" r="2" fill="#2F3B2A" />
              {/* Offering cup */}
              <rect x="50" y="32" width="14" height="12" rx="2" fill="#FCE38A" />
            </g>

            {/* Rabbit */}
            <g transform="translate(230, 160)">
              <ellipse cx="25" cy="35" rx="15" ry="12" fill="#E0D5C0" />
              <circle cx="25" cy="18" r="10" fill="#E0D5C0" />
              {/* Long Ears perked up */}
              <ellipse cx="21" cy="4" rx="3.5" ry="10" fill="#E0D5C0" />
              <ellipse cx="21" cy="4" rx="2" ry="7" fill="#F4A5A0" />
              <ellipse cx="29" cy="4" rx="3.5" ry="10" fill="#E0D5C0" />
              <ellipse cx="29" cy="4" rx="2" ry="7" fill="#F4A5A0" />
              {/* Eye */}
              <circle cx="28" cy="16" r="1.5" fill="#2F3B2A" />
            </g>
          </svg>
        ),
        dictionary: {
          pines: 'Evergreen coniferous trees with needle-shaped leaves (Pinos).',
          whispering: 'Making a soft rustling or murmuring sound (Susurrantes).',
          rabbit: 'A small gregarious burrowing plant-eating mammal with long ears (Coneja/Conejo).',
          tiny: 'Very small or minute (Diminuta).',
          perked: 'To become more lively or raise up (Levantaron/Animaron).'
        }
      },
      {
        en: 'By sunset, every creature in the forest had tasted Bruno\'s honey. And Bruno discovered that sharing made every drop taste even sweeter.',
        es: 'Al atardecer, cada criatura en el bosque había probado la miel de Bruno. Y Bruno descubrió que compartir hacía que cada gota supiera aún más dulce.',
        illustration: (
          <svg viewBox="0 0 400 280" className="reader-svg">
            <defs>
              <linearGradient id="sunsetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F4A5A0" />
                <stop offset="60%" stopColor="#FCE38A" />
                <stop offset="100%" stopColor="#5AB0A6" />
              </linearGradient>
            </defs>
            <rect width="400" height="280" fill="url(#sunsetGrad)" rx="16" />
            <circle cx="200" cy="70" r="35" fill="#FFF1BE" opacity="0.6" filter="url(#glowGold)" />
            
            {/* Hills */}
            <path d="M 0 190 Q 120 160 240 200 T 400 175 L 400 280 L 0 280 Z" fill="#8FCB9B" opacity="0.9" />
            <path d="M 0 220 Q 200 200 400 230 L 400 280 L 0 280 Z" fill="#71A87D" />

            {/* Happy gather */}
            <g transform="translate(80, 160)">
              {/* Bear */}
              <ellipse cx="40" cy="40" rx="20" ry="16" fill="#8B6914" />
              <circle cx="40" cy="22" r="12" fill="#8B6914" />
            </g>
            <g transform="translate(160, 175)">
              {/* Rabbit */}
              <ellipse cx="20" cy="25" rx="11" ry="9" fill="#E0D5C0" />
              <circle cx="20" cy="12" r="7" fill="#E0D5C0" />
            </g>
            <g transform="translate(240, 170)">
              {/* Squirrel/other friend */}
              <ellipse cx="20" cy="28" rx="10" ry="8" fill="#B5822A" />
              <circle cx="20" cy="16" r="6.5" fill="#B5822A" />
              <path d="M 28 28 Q 35 20 30 15" stroke="#B5822A" strokeWidth="3.5" fill="none" />
            </g>

            {/* Sparkles of happiness */}
            <circle cx="100" cy="110" r="3" fill="#FFF" opacity="0.8" />
            <circle cx="210" cy="100" r="4" fill="#FFF" opacity="0.7" />
            <circle cx="300" cy="120" r="2.5" fill="#FFF" opacity="0.9" />
          </svg>
        ),
        dictionary: {
          sunset: 'The time in the evening when the sun disappears or sets (Atardecer).',
          creature: 'An animal, as distinct from a human being (Criatura).',
          tasted: 'Perceived or experienced the flavor of (Probado).',
          sharing: 'Giving a portion of something to others (Compartir).',
          sweeter: 'More sweet; having a pleasing taste like sugar (Más dulce).'
        }
      }
    ]
  };

  const wordsEn = story.pages[currentPage].en.split(" ");
  const wordsEs = story.pages[currentPage].es.split(" ");
  const words = lang === 'en' ? wordsEn : wordsEs;

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

  // Generate Completion Certificate using jsPDF
  const generateCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [11, 8.5]
    });

    // Outer Border
    doc.setDrawColor(65, 140, 132); // Teal Accent
    doc.setLineWidth(0.15);
    doc.rect(0.25, 0.25, 10.5, 8.0);

    // Inner Gold Accent Border
    doc.setDrawColor(181, 130, 42); // Muted Gold
    doc.setLineWidth(0.04);
    doc.rect(0.4, 0.4, 10.2, 7.7);

    // Header Background Accent Shape
    doc.setFillColor(65, 140, 132);
    doc.triangle(0.4, 0.4, 1.5, 0.4, 0.4, 1.5, 'F');
    doc.triangle(10.6, 0.4, 9.5, 0.4, 10.6, 1.5, 'F');
    doc.triangle(0.4, 8.1, 1.5, 8.1, 0.4, 7.0, 'F');
    doc.triangle(10.6, 8.1, 9.5, 8.1, 10.6, 7.0, 'F');

    // Title
    doc.setTextColor(47, 59, 42); // Primary Dark text
    doc.setFont('Times', 'italic');
    doc.setFontSize(26);
    doc.text('StoryNest Academy of Learning', 5.5, 1.8, { align: 'center' });

    doc.setFont('Times', 'bold');
    doc.setFontSize(44);
    doc.setTextColor(65, 140, 132);
    doc.text('CERTIFICATE OF READING', 5.5, 2.8, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(107, 122, 99);
    doc.text('This proud achievement is awarded to', 5.5, 3.6, { align: 'center' });

    // Kid Name (Leo)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(181, 130, 42); // Gold
    doc.text('LEO THE READER', 5.5, 4.4, { align: 'center' });

    // Description text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(47, 59, 42);
    doc.text(`For successfully reading and comprehending the Storybook:`, 5.5, 5.0, { align: 'center' });
    
    doc.setFont('Helvetica', 'bolditalic');
    doc.setFontSize(18);
    doc.setTextColor(65, 140, 132);
    doc.text(`"${story.title}"`, 5.5, 5.5, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(107, 122, 99);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    doc.text(`Awarded on: ${dateStr}`, 5.5, 6.1, { align: 'center' });

    // Signatures
    doc.setDrawColor(200, 200, 200);
    doc.line(2.0, 7.1, 4.5, 7.1);
    doc.line(6.5, 7.1, 9.0, 7.1);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(47, 59, 42);
    doc.text('StoryNest AI Guide', 3.25, 7.3, { align: 'center' });
    doc.text('Parent Signature', 7.75, 7.3, { align: 'center' });

    // Save Certificate
    doc.save(`StoryNest_Certificate_Leo.pdf`);
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
          <span className="serif-heading">{lang === 'en' ? story.title : story.titleEs}</span>
          <span className="badge-grade">{story.grade}</span>
        </div>

        <div className="reader-controls">
          <button 
            className="reader-icon-btn toggle-lang-btn"
            onClick={() => {
              setLang(lang === 'en' ? 'es' : 'en');
              setIsPlaying(false);
            }}
            title="Translate Page"
          >
            <FaLanguage />
            <span>{lang === 'en' ? 'Español' : 'English'}</span>
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

            <h2 className="serif-heading cert-heading-title">Congratulations, Leo!</h2>
            <p className="cert-sub">You have finished reading <strong>{story.title}</strong> and earned your reading medal!</p>

            <div className="badge-preview-container">
              <div className="gold-medal-seal">
                <FaAward className="seal-award-icon" />
                <span className="seal-text">STORYNEST CHAMPION</span>
              </div>
            </div>

            <div className="cert-actions-row">
              <button 
                className="btn btn-primary cert-download-btn"
                onClick={generateCertificate}
              >
                <FaDownload /> Download PDF Certificate
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

      <style>{`
        .reader-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #FAF8F5; /* Cozy Warm paper background */
          color: #2F3B2A;
          user-select: none;
        }

        .reader-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 3rem;
          background-color: #FFFFFF;
          border-bottom: 1px solid #EFE7D3;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          z-index: 10;
        }

        .reader-back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6B7A63;
          font-weight: 700;
          font-size: 0.9rem;
          transition: 0.2s ease;
        }

        .reader-back-btn:hover {
          color: #3D5C34;
        }

        .reader-title-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .badge-icon {
          color: #5AB0A6;
          font-size: 1.25rem;
        }

        .reader-title-badge span.serif-heading {
          font-size: 1.3rem;
          font-weight: 700;
        }

        .badge-grade {
          font-size: 0.7rem;
          font-weight: 700;
          background-color: #E4EEDB;
          color: #3D5C34;
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
        }

        .reader-controls {
          display: flex;
          gap: 0.75rem;
        }

        .reader-icon-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1.5px solid #EFE7D3;
          background-color: #FFFFFF;
          font-size: 0.85rem;
          font-weight: 600;
          color: #6B7A63;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .reader-icon-btn:hover {
          border-color: #5AB0A6;
          color: #5AB0A6;
        }

        .reader-icon-btn.active {
          background-color: #5AB0A6;
          border-color: #5AB0A6;
          color: #FFFFFF;
        }

        /* Workspace & Book */
        .reader-workspace {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 4rem;
        }

        .reader-storybook-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          width: 100%;
          max-width: 1200px;
          min-height: 520px;
          background-color: #FFFFFF;
          border: 1px solid #EFE7D3;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(47, 59, 42, 0.05);
          overflow: hidden;
        }

        .storybook-illustration-panel {
          padding: 2.5rem;
          background-color: #FAF6EC; /* Soft Cream inside book layout */
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid #EFE7D3;
        }

        .illustration-wrapper-card {
          width: 100%;
          max-width: 500px;
          position: relative;
          background-color: #FFFFFF;
          padding: 0.75rem;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
        }

        .reader-svg {
          width: 100%;
          height: auto;
          border-radius: 10px;
          display: block;
        }

        .illustration-page-tag {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #FAF8F5;
          background-color: rgba(47, 59, 42, 0.65);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          backdrop-filter: blur(2px);
        }

        /* Text area right */
        .storybook-text-panel {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .text-panel-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .hint-label {
          font-size: 0.75rem;
          color: #6B7A63;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .storybook-words-paragraph {
          font-size: 1.55rem;
          line-height: 1.7;
          color: #2F3B2A;
          margin-bottom: 2rem;
        }

        .storybook-word-element {
          display: inline-block;
          margin-right: 0.4rem;
          padding: 0.1rem 0.25rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
          border-bottom: 2px dashed transparent;
        }

        .storybook-word-element:hover {
          border-color: #5AB0A6;
          background-color: #E2ECEB;
        }

        .storybook-word-element.word-active {
          background-color: #5AB0A6;
          color: #FFFFFF;
          border-bottom-color: transparent;
        }

        /* Dictionary popup */
        .dictionary-card {
          margin-top: 1rem;
          background-color: #FAF6EC;
          border: 1px solid #EFE7D3;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          position: relative;
        }

        .dict-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .dict-word {
          font-size: 1.15rem;
          font-weight: 700;
          color: #5AB0A6;
        }

        .dict-close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          font-weight: 700;
          color: #6B7A63;
          cursor: pointer;
        }

        .dict-definition {
          font-size: 0.85rem;
          line-height: 1.45;
          color: #2F3B2A;
        }

        /* Footer Stepper */
        .storybook-footer-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
        }

        .reader-nav-btn {
          min-width: 120px;
        }

        .accent-teal-btn {
          background-color: #5AB0A6 !important;
          border-color: #5AB0A6 !important;
        }

        .accent-teal-btn:hover {
          background-color: #418C84 !important;
          border-color: #418C84 !important;
        }

        .pagination-dots {
          display: flex;
          gap: 0.5rem;
        }

        .pagination-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #EFE7D3;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .pagination-dot.active {
          background-color: #5AB0A6;
          transform: scale(1.3);
        }

        /* Certificate Modal Overlay */
        .certificate-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(47, 59, 42, 0.45);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .certificate-modal-content {
          background-color: #FFFFFF;
          border: 2px solid #5AB0A6;
          border-radius: 24px;
          padding: 3rem;
          max-width: 650px;
          width: 90%;
          text-align: center;
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .cert-celebration-head {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem auto;
        }

        .cert-trophy-icon {
          font-size: 4rem;
          color: #B5822A; /* Gold */
          display: block;
        }

        .cert-cap-icon {
          font-size: 2rem;
          color: #5AB0A6;
          position: absolute;
          top: -15px;
          right: -15px;
          transform: rotate(15deg);
        }

        .cert-heading-title {
          font-size: 2.25rem;
          margin-bottom: 0.5rem;
        }

        .cert-sub {
          font-size: 0.95rem;
          color: #6B7A63;
          margin-bottom: 2rem;
        }

        .badge-preview-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2.5rem;
        }

        .gold-medal-seal {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(circle, #FAF2DF 30%, #E8C27A 100%);
          border: 4px double #B5822A;
          box-shadow: 0 6px 20px rgba(181, 130, 42, 0.2);
          animation: float 3s ease-in-out infinite;
        }

        .seal-award-icon {
          font-size: 2.25rem;
          color: #B5822A;
          margin-bottom: 0.25rem;
        }

        .seal-text {
          font-size: 0.55rem;
          font-weight: 800;
          color: #3D2E0B;
          letter-spacing: 0.05em;
          text-align: center;
          padding: 0 0.25rem;
        }

        .cert-actions-row {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cert-download-btn {
          background-color: #B5822A !important;
          border-color: #B5822A !important;
        }

        .cert-download-btn:hover {
          background-color: #93681D !important;
          border-color: #93681D !important;
        }

        @media (max-width: 900px) {
          .reader-header-bar {
            padding: 1rem 1.5rem;
          }
          .reader-workspace {
            padding: 1.5rem 1.5rem;
          }
          .reader-storybook-layout {
            grid-template-columns: 1fr;
          }
          .storybook-illustration-panel {
            border-right: none;
            border-bottom: 1px solid #EFE7D3;
          }
        }
      `}</style>
    </div>
  );
}
