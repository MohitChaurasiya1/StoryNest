import React, { useState, useEffect } from 'react';
import { FaPlay, FaVolumeUp, FaLanguage } from 'react-icons/fa';

export default function StoryBookPreview() {
  const [lang, setLang] = useState('en'); // 'en' or 'es'
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);

  const textEn = "Leo the little lion found a hidden path in the ancient forest, leading to a tree of gold.";
  const textEs = "Leo el pequeño león encontró un camino oculto en el bosque antiguo, que llevaba a un árbol de oro.";

  const wordsEn = textEn.split(" ");
  const wordsEs = textEs.split(" ");

  const words = lang === 'en' ? wordsEn : wordsEs;

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      setActiveWordIdx(0);
      interval = setInterval(() => {
        setActiveWordIdx((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return -1;
          }
          return prev + 1;
        });
      }, 350); // Highlight word every 350ms
    } else {
      setActiveWordIdx(-1);
    }
    return () => clearInterval(interval);
  }, [isPlaying, lang, words.length]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="preview-card-wrapper animate-float">
      <div className="preview-card-inner">
        {/* Story Illustration Header */}
        <div className="preview-illustration-container">
          <svg viewBox="0 0 400 220" className="preview-svg" width="100%">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#418C84" /> {/* Dark teal */}
                <stop offset="100%" stopColor="#5AB0A6" /> {/* Teal */}
              </linearGradient>
              <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8C27A" />
                <stop offset="100%" stopColor="#D5AF67" />
              </linearGradient>
              <linearGradient id="goldTree" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFF1BE" />
                <stop offset="50%" stopColor="#FCE38A" />
                <stop offset="100%" stopColor="#E5BE39" />
              </linearGradient>
              <filter id="glowGold">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Sky */}
            <rect width="400" height="220" fill="url(#skyGrad)" rx="16" />

            {/* Moon / Sun Gold */}
            <circle cx="340" cy="50" r="24" fill="#FCE38A" opacity="0.85" />
            <circle cx="340" cy="50" r="32" fill="#FCE38A" opacity="0.2" filter="url(#glowGold)" />

            {/* Sand Hills Ground */}
            <path d="M 0 170 Q 120 140 240 180 T 400 150 L 400 220 L 0 220 Z" fill="url(#sandGrad)" />
            <path d="M 120 185 Q 260 165 400 190 L 400 220 L 120 220 Z" fill="#D5AF67" opacity="0.6" />

            {/* Magic Leaves / Sparks */}
            <circle cx="100" cy="60" r="3" fill="#FCE38A" opacity="0.7" />
            <circle cx="120" cy="85" r="2.5" fill="#F4A5A0" opacity="0.8" />
            <circle cx="150" cy="50" r="3.5" fill="#FCE38A" opacity="0.9" />

            {/* The Golden Tree */}
            <path d="M 110 180 L 115 110 L 105 110 Z" fill="#584833" /> {/* Trunk */}
            {/* Branches and leaves */}
            <circle cx="110" cy="100" r="30" fill="url(#goldTree)" filter="url(#glowGold)" />
            <circle cx="85" cy="110" r="20" fill="url(#goldTree)" opacity="0.9" />
            <circle cx="135" cy="115" r="18" fill="url(#goldTree)" opacity="0.9" />
            <circle cx="100" cy="80" r="22" fill="#FCE38A" opacity="0.9" />

            {/* Character Silhouette: Leo the Lion */}
            {/* Body */}
            <ellipse cx="260" cy="175" rx="16" ry="12" fill="#3A2E6B" />
            {/* Head */}
            <circle cx="272" cy="160" r="10" fill="#3A2E6B" />
            {/* Mane */}
            <circle cx="272" cy="160" r="14" fill="#B5822A" opacity="0.45" />
            {/* Tail */}
            <path d="M 245 175 Q 235 170 238 160" stroke="#3A2E6B" strokeWidth="2.5" fill="none" />
            <circle cx="238" cy="160" r="2" fill="#3A2E6B" />

            {/* Path lines */}
            <path d="M 400 200 C 330 200, 290 190, 275 185" stroke="#FFF1BE" strokeWidth="3" strokeDasharray="3 3" fill="none" opacity="0.8" />

            {/* UI overlay label */}
            <g transform="translate(15, 15)">
              <rect width="105" height="24" rx="12" fill="rgba(47, 59, 42, 0.45)" backdrop-filter="blur(4px)" />
              <text x="12" y="16" fill="#FBF6EC" fontSize="10" fontWeight="700" letterSpacing="0.05em">
                STORY MODE ON
              </text>
              <circle cx="95" cy="12" r="3.5" fill="#8FCB9B" className="pulse-indicator" />
            </g>
          </svg>

          {/* Interactive controls overlay */}
          <div className="preview-controls-overlay">
            <button 
              className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`} 
              onClick={handlePlay}
              title="Listen to Narration"
            >
              {isPlaying ? <FaVolumeUp className="icon-pulse" /> : <FaPlay />}
              <span>{isPlaying ? 'Reading...' : 'Play Audio'}</span>
            </button>

            <button 
              className="control-btn lang-btn" 
              onClick={() => {
                setLang(lang === 'en' ? 'es' : 'en');
                setIsPlaying(false);
              }}
              title="Toggle Language"
            >
              <FaLanguage />
              <span>{lang === 'en' ? 'Español' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Subtitle / Text panel */}
        <div className="preview-text-panel">
          <div className="text-panel-header">
            <span className="reader-badge">Language: {lang === 'en' ? 'English (EN)' : 'Spanish (ES)'}</span>
            <div className="mini-audio-waves">
              <span className={`wave-bar ${isPlaying ? 'wave-active' : ''}`}></span>
              <span className={`wave-bar ${isPlaying ? 'wave-active' : ''}`}></span>
              <span className={`wave-bar ${isPlaying ? 'wave-active' : ''}`}></span>
            </div>
          </div>

          <p className="preview-story-sentence">
            {words.map((word, idx) => (
              <span 
                key={idx}
                className={`story-word ${idx === activeWordIdx ? 'word-highlighted' : ''}`}
                style={{
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  display: 'inline-block',
                  marginRight: '0.3rem',
                  padding: '0.1rem 0.2rem',
                  borderRadius: '3px'
                }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>

      <style>{`
        .preview-card-wrapper {
          transform: rotate(2.5deg) translateY(10px);
          transition: var(--transition-smooth);
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .preview-card-wrapper:hover {
          transform: rotate(0deg) translateY(-2px) scale(1.03);
          box-shadow: var(--shadow-lg);
        }

        .preview-card-inner {
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .preview-illustration-container {
          position: relative;
          background-color: #5AB0A6;
          overflow: hidden;
          aspect-ratio: 400 / 220;
        }

        .preview-svg {
          display: block;
          width: 100%;
          height: auto;
        }

        .preview-controls-overlay {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          z-index: 5;
        }

        .control-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: var(--transition-fast);
        }

        .control-btn:hover {
          background-color: #FFFFFF;
          transform: translateY(-1px);
        }

        .play-btn {
          background-color: var(--story-gold);
          border: 1px solid rgba(255,255,255,0.4);
        }

        .play-btn:hover {
          background-color: #FFF2CC;
        }

        .play-btn.playing {
          background-color: var(--story-teal);
          color: #FFFFFF;
        }

        .icon-pulse {
          animation: iconPulse 0.8s infinite alternate;
        }

        @keyframes iconPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.2); }
        }

        .preview-text-panel {
          padding: 1.25rem;
          background-color: #FFFFFF;
          border-top: 1px solid var(--border-color);
        }

        .text-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .reader-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .mini-audio-waves {
          display: flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 12px;
        }

        .wave-bar {
          width: 2.5px;
          height: 4px;
          background-color: var(--text-muted);
          border-radius: 1px;
          transition: var(--transition-fast);
        }

        .wave-bar:nth-child(1) { height: 6px; }
        .wave-bar:nth-child(2) { height: 10px; }
        .wave-bar:nth-child(3) { height: 5px; }

        .wave-active {
          animation: soundWave 0.8s ease-in-out infinite alternate;
          background-color: var(--primary-accent);
        }

        .wave-active:nth-child(1) { animation-delay: 0.1s; }
        .wave-active:nth-child(2) { animation-delay: 0.3s; }
        .wave-active:nth-child(3) { animation-delay: 0.2s; }

        @keyframes soundWave {
          0% { height: 3px; }
          100% { height: 12px; }
        }

        .preview-story-sentence {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--text-primary);
          line-height: 1.55;
          margin: 0;
        }

        .story-word {
          cursor: pointer;
        }

        .story-word:hover {
          background-color: var(--soft-accent-bg);
          color: var(--primary-accent);
        }

        .word-highlighted {
          background-color: var(--story-gold) !important;
          color: #000000 !important;
          box-shadow: 0 0 6px var(--story-gold);
        }

        .pulse-indicator {
          animation: pulseGreen 1.5s infinite;
        }

        @keyframes pulseGreen {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
