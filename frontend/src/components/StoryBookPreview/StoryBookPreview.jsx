import React, { useState, useEffect } from 'react';
import { FaPlay, FaVolumeUp, FaLanguage } from 'react-icons/fa';
import './StoryBookPreview.css';

export default function StoryBookPreview() {
  const [lang, setLang] = useState('en'); // 'en' or 'es'
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);

  const textEn = "Leo the little lion found a hidden path in the ancient forest, leading to a tree of gold.";
  const textHi = "छोटे शेर लियो ने प्राचीन जंगल में एक छिपा हुआ रास्ता खोजा, जो सोने के पेड़ तक जाता था।";

  const wordsEn = textEn.split(" ");
  const wordsHi = textHi.split(" ");

  const words = lang === 'en' ? wordsEn : wordsHi;

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
                setLang(lang === 'en' ? 'hi' : 'en');
                setIsPlaying(false);
              }}
              title="Toggle Language"
            >
              <FaLanguage />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Subtitle / Text panel */}
        <div className="preview-text-panel">
          <div className="text-panel-header">
            <span className="reader-badge">Language: {lang === 'en' ? 'English (EN)' : 'Hindi (HI)'}</span>
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
    </div>
  );
}
