import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheckCircle,
  FaPaintBrush,
  FaPen,
  FaBookOpen,
  FaMagic,
  FaChild,
  FaKeyboard
} from 'react-icons/fa';

export default function StoryCreator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Toggle mode: 'child' (Visual builder/questionnaire) or 'custom' (parent writes text prompt)
  const [builderMode, setBuilderMode] = useState('child');

  // Step 1 - Child Friendly state
  const [childName, setChildName] = useState('Leo');
  const [heroAnimal, setHeroAnimal] = useState('lion'); // 'bear', 'lion', 'fox', 'unicorn', 'frog', 'rabbit', 'owl'
  const [heroColor, setHeroColor] = useState('gold'); // 'blue', 'gold', 'pink', 'green'
  const [heroJob, setHeroJob] = useState('astronaut'); // 'astronaut', 'wizard', 'explorer', 'superhero', 'chef'
  const [setting, setSetting] = useState('space'); // 'forest', 'space', 'candyland', 'sea', 'castle'
  const [goal, setGoal] = useState('rocket'); // 'sharing', 'lostkey', 'rocket', 'honey', 'singing'

  // Step 1 - Custom text state
  const [prompt, setPrompt] = useState('A friendly bear learns how to share honey with forest friends');

  // Step 2 state
  const [artStyle, setArtStyle] = useState('watercolor');
  const [tone, setTone] = useState('whimsical');
  const [grade, setGrade] = useState('grade-2');

  // Step 3 state
  const [genProgress, setGenProgress] = useState(0);
  const [genMessages, setGenMessages] = useState([]);
  const [genDone, setGenDone] = useState(false);

  // Step 4 state — generated pages
  const [pages, setPages] = useState([
    {
      text: 'Bruno the bear woke up one sunny morning to find his honey jar overflowing. "There\'s too much for just me!" he laughed, golden drops rolling down his fuzzy chin.',
      editText: '',
    },
    {
      text: 'He walked through the whispering pines until he found Rosie the rabbit. "Would you like some honey?" Bruno asked, holding out a tiny cup. Rosie\'s ears perked up with joy.',
      editText: '',
    },
    {
      text: 'By sunset, every creature in the forest had tasted Bruno\'s honey. And Bruno discovered that sharing made every drop taste even sweeter.',
      editText: '',
    },
  ]);
  const [editingPage, setEditingPage] = useState(null);

  // Construct prompt dynamic text based on child options
  useEffect(() => {
    if (builderMode === 'child') {
      const animalMap = {
        bear: '🐻 bear',
        lion: '🦁 lion',
        fox: '🦊 fox',
        unicorn: '🦄 unicorn',
        frog: '🐸 frog',
        rabbit: '🐰 rabbit',
        owl: '🦉 owl'
      };
      const jobMap = {
        astronaut: 'an astronaut 🚀',
        wizard: 'a wizard 🪄',
        explorer: 'a brave explorer 🧭',
        superhero: 'a superhero 🦸',
        chef: 'a master chef 🧑‍🍳'
      };
      const settingMap = {
        forest: 'the whispering pines forest 🌲',
        space: 'cosmic outer space 🌌',
        candyland: 'sweet candy land 🍬',
        sea: 'the deep blue sea 🌊',
        castle: 'an ancient magic castle 🏰'
      };
      const goalMap = {
        sharing: 'learns how to share sweet treats with forest friends 🤝',
        lostkey: 'searches for a mysterious lost key that opens a secret door 🔑',
        rocket: 'works together with friends to build a shiny new rocket ship 🚀',
        honey: 'gathers delicious golden honey for a big cozy campfire party 🍯',
        singing: 'discovers their voice and learns a beautiful happy song 🎵'
      };

      const builtPrompt = `A child-created story about a friendly ${animalMap[heroAnimal]} named ${childName || 'Leo'} who is ${jobMap[heroJob]} wearing a beautiful ${heroColor} cape. The adventure takes place in ${settingMap[setting]} where they must ${goalMap[goal]}.`;
      setPrompt(builtPrompt);
    }
  }, [childName, heroAnimal, heroColor, heroJob, setting, goal, builderMode]);

  // Construct Custom Story Content based on Child Selection when entering step 4
  useEffect(() => {
    if (step === 3 && builderMode === 'child') {
      const animalName = heroAnimal === 'bear' ? 'bear' : heroAnimal === 'lion' ? 'lion' : heroAnimal === 'fox' ? 'fox' : heroAnimal === 'unicorn' ? 'unicorn' : heroAnimal === 'frog' ? 'frog' : heroAnimal === 'rabbit' ? 'rabbit' : 'owl';
      const mainCharacter = `${childName || 'Leo'} the ${animalName}`;
      const friendCharacter = heroAnimal === 'rabbit' ? 'Rosie the rabbit' : 'Rosie';

      const customPages = [
        {
          text: `${childName || 'Leo'} the ${animalName} woke up one sunny morning in ${
            setting === 'forest' ? 'the whispering pines forest 🌲' : setting === 'space' ? 'cosmic outer space 🌌' : setting === 'candyland' ? 'sweet candy land 🍬' : setting === 'sea' ? 'the deep blue sea 🌊' : 'the ancient magic castle 🏰'
          }. With a beautiful ${heroColor} cape shining, it was time for a great adventure!`,
          editText: ''
        },
        {
          text: `As ${mainCharacter} explored, they met their friend Rosie. "Will you help me?" ${childName || 'Leo'} asked, showing their plan to ${
            goal === 'sharing' ? 'share sweet treats with everyone' : goal === 'lostkey' ? 'find the secret lost key' : goal === 'rocket' ? 'build a shiny space rocket' : goal === 'honey' ? 'gather golden honey jars' : 'learn a happy new song'
          }. Rosie perked up with joy!`,
          editText: ''
        },
        {
          text: `By sunset, they had completed their quest! ${mainCharacter} and Rosie laughed happily together. Working together made the entire day even sweeter.`,
          editText: ''
        }
      ];
      setPages(customPages);
    }
  }, [step, builderMode, childName, heroAnimal, heroColor, setting, goal]);

  // Dynamic loading messages reflecting choice
  const getLoadingMessages = () => {
    if (builderMode === 'child') {
      const animalName = heroAnimal;
      const setLabel = setting === 'forest' ? 'pine forest 🌲' : setting === 'space' ? 'cosmic space 🌌' : setting === 'candyland' ? 'candy land 🍬' : setting === 'sea' ? 'deep sea 🌊' : 'magic castle 🏰';
      return [
        '🎨 Analyzing kid-created prompt...',
        `📖 Setting narrative arc in the ${setLabel}...`,
        `🖌️ Loading matching ${artStyle} textures...`,
        `🦁 Sketching ${childName || 'Leo'} the ${animalName}...`,
        `🌌 Rendering ${setLabel}...`,
        `✨ Adding magical ${heroColor} cape detailing...`,
        '🐰 Illustrating companion characters...',
        '✨ Applying final magic touches...',
        '📘 Binding your customized storybook...',
      ];
    }
    return [
      '🎨 Analyzing your story prompt...',
      '📖 Building narrative arc...',
      '🖌️ Selecting watercolor textures...',
      '🐻 Sketching Bruno the bear...',
      '🌲 Rendering whispering pine forest...',
      '🍯 Adding golden honey details...',
      '🐰 Illustrating Rosie the rabbit...',
      '✨ Applying final magic touches...',
      '📘 Binding your storybook pages...',
    ];
  };

  useEffect(() => {
    if (step === 3 && !genDone) {
      setGenProgress(0);
      setGenMessages([]);
      let msgIdx = 0;
      const loadingMsgs = getLoadingMessages();
      const interval = setInterval(() => {
        setGenProgress(prev => {
          const next = Math.min(prev + Math.random() * 15 + 5, 100);
          if (next >= 100) {
            clearInterval(interval);
            setGenDone(true);
            return 100;
          }
          return next;
        });
        if (msgIdx < loadingMsgs.length) {
          setGenMessages(prev => [...prev, loadingMsgs[msgIdx]]);
          msgIdx++;
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handlePageEdit = (idx, newText) => {
    const updated = [...pages];
    updated[idx].text = newText;
    setPages(updated);
    setEditingPage(null);
  };

  const animals = [
    { id: 'lion', label: 'Lion 🦁', desc: 'Brave & Roaring' },
    { id: 'bear', label: 'Bear 🐻', desc: 'Cozy & Friendly' },
    { id: 'fox', label: 'Fox 🦊', desc: 'Smart & Clever' },
    { id: 'unicorn', label: 'Unicorn 🦄', desc: 'Sweet & Magic' },
    { id: 'frog', label: 'Frog 🐸', desc: 'Happy & Bouncy' },
    { id: 'rabbit', label: 'Rabbit 🐰', desc: 'Fast & Playful' },
    { id: 'owl', label: 'Owl 🦉', desc: 'Wise & Gentle' }
  ];

  const jobs = [
    { id: 'astronaut', label: 'Astronaut 🚀', desc: 'Explores stars' },
    { id: 'wizard', label: 'Wizard 🪄', desc: 'Casts fun spells' },
    { id: 'explorer', label: 'Explorer 🧭', desc: 'Finds lost paths' },
    { id: 'superhero', label: 'Superhero 🦸', desc: 'Helps everyone' },
    { id: 'chef', label: 'Master Chef 🧑‍🍳', desc: 'Bakes yummy cookies' }
  ];

  const settings = [
    { id: 'space', label: 'Cosmic Outer Space 🌌', bg: '#4A3E72' },
    { id: 'forest', label: 'Whispering Pine Forest 🌲', bg: '#3D5C34' },
    { id: 'candyland', label: 'Sweet Candy Land 🍬', bg: '#D38F9B' },
    { id: 'sea', label: 'Deep Blue Sea 🌊', bg: '#418C84' },
    { id: 'castle', label: 'Ancient Magic Castle 🏰', bg: '#726053' }
  ];

  const goals = [
    { id: 'rocket', label: 'Building a space rocket 🚀' },
    { id: 'sharing', label: 'Learning to share sweet treats 🤝' },
    { id: 'lostkey', label: 'Finding a secret lost key 🔑' },
    { id: 'honey', label: 'Gathering honey for a campfire 🍯' },
    { id: 'singing', label: 'Learning to sing a happy song 🎵' }
  ];

  const colors = [
    { id: 'gold', label: 'Gold 🟡', value: '#B5822A' },
    { id: 'blue', label: 'Blue 🔵', value: '#3A86C8' },
    { id: 'pink', label: 'Pink 🌸', value: '#E47DA2' },
    { id: 'green', label: 'Green 🟢', value: '#3D5C34' }
  ];

  const artStyles = [
    { id: 'watercolor', label: 'Watercolor', emoji: '🎨' },
    { id: 'oil-paint', label: 'Oil Paint', emoji: '🖼️' },
    { id: 'claymation', label: 'Claymation', emoji: '🧸' },
    { id: 'pixel-art', label: 'Pixel Art', emoji: '👾' },
  ];

  const tones = [
    { id: 'whimsical', label: 'Whimsical' },
    { id: 'cozy', label: 'Cozy' },
    { id: 'adventurous', label: 'Adventurous' },
    { id: 'educational', label: 'Educational' },
  ];

  const grades = [
    { id: 'grade-1', label: 'Grade 1 (Ages 5–6)' },
    { id: 'grade-2', label: 'Grade 2 (Ages 7–8)' },
    { id: 'grade-3', label: 'Grade 3 (Ages 8–9)' },
    { id: 'grade-4', label: 'Grade 4 (Ages 9–10)' },
  ];

  const pageIllustrations = [
    (
      <svg viewBox="0 0 400 280" className="page-illustration">
        <defs>
          <linearGradient id="morningGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FCE38A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#5AB0A6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect width="400" height="280" fill="url(#morningGrad)" rx="12" />
        <circle cx="340" cy="60" r="30" fill="#FCE38A" opacity="0.7" />
        <path d="M 0 200 Q 100 170 200 210 T 400 180 L 400 280 L 0 280 Z" fill="#8FCB9B" opacity="0.5" />
        <path d="M 0 220 Q 150 200 300 240 L 400 230 L 400 280 L 0 280 Z" fill="#E8C27A" opacity="0.4" />
        {/* Customized Animal Icon */}
        <g transform="translate(140, 120)">
          {heroAnimal === 'lion' ? (
            <text x="0" y="50" fontSize="60">🦁</text>
          ) : heroAnimal === 'bear' ? (
            <text x="0" y="50" fontSize="60">🐻</text>
          ) : heroAnimal === 'fox' ? (
            <text x="0" y="50" fontSize="60">🦊</text>
          ) : heroAnimal === 'unicorn' ? (
            <text x="0" y="50" fontSize="60">🦄</text>
          ) : heroAnimal === 'frog' ? (
            <text x="0" y="50" fontSize="60">🐸</text>
          ) : heroAnimal === 'rabbit' ? (
            <text x="0" y="50" fontSize="60">🐰</text>
          ) : (
            <text x="0" y="50" fontSize="60">🦉</text>
          )}
          {/* Cape */}
          <path d="M -10 50 Q -30 65 -20 85 Q 0 80 5 55 Z" fill={colors.find(c => c.id === heroColor)?.value || '#B5822A'} opacity="0.8" />
        </g>
        {/* Dynamic accessory */}
        {heroJob === 'astronaut' && <text x="130" y="140" fontSize="20">🚀</text>}
        {heroJob === 'wizard' && <text x="130" y="140" fontSize="20">🪄</text>}
        {heroJob === 'explorer' && <text x="130" y="140" fontSize="20">🧭</text>}
        {heroJob === 'superhero' && <text x="130" y="140" fontSize="20">🦸</text>}
        {heroJob === 'chef' && <text x="130" y="140" fontSize="20">🧑‍🍳</text>}
      </svg>
    ),
    (
      <svg viewBox="0 0 400 280" className="page-illustration">
        <rect width="400" height="280" fill="#5AB0A6" opacity="0.15" rx="12" />
        <path d="M 0 180 Q 80 160 160 190 T 400 170 L 400 280 L 0 280 Z" fill="#8FCB9B" opacity="0.4" />
        {/* Hero character */}
        <g transform="translate(100, 130)">
          {heroAnimal === 'lion' ? <text fontSize="50">🦁</text> : heroAnimal === 'bear' ? <text fontSize="50">🐻</text> : <text fontSize="50">🦊</text>}
        </g>
        {/* Rosie Rabbit friend */}
        <g transform="translate(230, 140)">
          <text fontSize="50">🐰</text>
        </g>
        {/* Goal accessory */}
        {goal === 'rocket' && <text x="180" y="170" fontSize="30">🚀</text>}
        {goal === 'sharing' && <text x="180" y="170" fontSize="30">🤝</text>}
        {goal === 'lostkey' && <text x="180" y="170" fontSize="30">🔑</text>}
        {goal === 'honey' && <text x="180" y="170" fontSize="30">🍯</text>}
        {goal === 'singing' && <text x="180" y="170" fontSize="30">🎵</text>}
      </svg>
    ),
    (
      <svg viewBox="0 0 400 280" className="page-illustration">
        <defs>
          <linearGradient id="sunsetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4A5A0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FCE38A" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect width="400" height="280" fill="url(#sunsetGrad)" rx="12" />
        <circle cx="200" cy="50" r="35" fill="#FCE38A" opacity="0.5" />
        <path d="M 0 190 Q 100 160 200 200 T 400 180 L 400 280 L 0 280 Z" fill="#8FCB9B" opacity="0.45" />
        {/* Happy group */}
        <g transform="translate(130, 140)">
          <text fontSize="45">🦁</text>
        </g>
        <g transform="translate(190, 150)">
          <text fontSize="40">🐰</text>
        </g>
        <g transform="translate(240, 145)">
          <text fontSize="40">🦊</text>
        </g>
        <circle cx="150" cy="110" r="3" fill="#FCE38A" opacity="0.7" />
        <circle cx="210" cy="105" r="2.5" fill="#FCE38A" opacity="0.5" />
      </svg>
    ),
  ];

  return (
    <div className="creator-container animate-fade-in">
      {/* Header */}
      <header className="creator-header">
        <Link to="/" className="creator-back-link">
          <FaArrowLeft /> Back to Home
        </Link>
        <div className="creator-logo">
          <FaMagic style={{ color: 'var(--secondary-accent)' }} />
          <span className="serif-heading">StoryNest Creator</span>
        </div>
        <div className="mode-toggle-pill">
          <button 
            className={`mode-btn ${builderMode === 'child' ? 'active' : ''}`}
            onClick={() => setBuilderMode('child')}
          >
            <FaChild /> Kid Mode
          </button>
          <button 
            className={`mode-btn ${builderMode === 'custom' ? 'active' : ''}`}
            onClick={() => setBuilderMode('custom')}
          >
            <FaKeyboard /> Custom Mode
          </button>
        </div>
      </header>

      {/* Stepper */}
      <div className="stepper-bar">
        {[
          { num: 1, label: builderMode === 'child' ? 'Choose Hero & Goal' : 'Write Prompt' },
          { num: 2, label: 'Choose Style' },
          { num: 3, label: 'AI Generation' },
          { num: 4, label: 'Preview & Edit' },
        ].map((s, idx) => (
          <div key={idx} className={`stepper-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}>
            <div className="stepper-circle">
              {step > s.num ? <FaCheckCircle /> : s.num}
            </div>
            <span className="stepper-label">{s.label}</span>
            {idx < 3 && <div className={`stepper-line ${step > s.num ? 'filled' : ''}`}></div>}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="step-content-wrapper">
        {/* Step 1: Write Prompt / Visual questionnaire */}
        {step === 1 && builderMode === 'child' && (
          <div className="step-panel step-1-panel child-builder-workspace">
            <div className="step-heading-group">
              <span className="kid-badge">🧒 KIDS WORKSPACE</span>
              <h2 className="serif-heading">Let's build your story!</h2>
              <p className="text-muted">Answer these simple questions to make a magical tale.</p>
            </div>

            {/* Q1: Child Name */}
            <div className="question-block">
              <label className="question-title">What is your hero's name?</label>
              <input 
                type="text"
                className="form-control name-input"
                placeholder="e.g. Leo, Bruno, Mohit"
                value={childName}
                onChange={e => setChildName(e.target.value)}
              />
            </div>

            {/* Q2: Select Hero Character */}
            <div className="question-block">
              <label className="question-title">Who is the main hero?</label>
              <div className="avatar-grid-select">
                {animals.map(item => (
                  <button
                    key={item.id}
                    className={`avatar-select-card ${heroAnimal === item.id ? 'active' : ''}`}
                    onClick={() => setHeroAnimal(item.id)}
                  >
                    <span className="avatar-select-emoji">{item.label.split(' ')[1]}</span>
                    <span className="avatar-select-name">{item.label.split(' ')[0]}</span>
                    <span className="avatar-select-desc">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Job/Superpower */}
            <div className="question-block">
              <label className="question-title">What is their job or superpower?</label>
              <div className="avatar-grid-select">
                {jobs.map(item => (
                  <button
                    key={item.id}
                    className={`avatar-select-card ${heroJob === item.id ? 'active' : ''}`}
                    onClick={() => setHeroJob(item.id)}
                  >
                    <span className="avatar-select-emoji">{item.label.split(' ')[1]}</span>
                    <span className="avatar-select-name">{item.label.split(' ')[0]}</span>
                    <span className="avatar-select-desc">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Q4: Favorite Cape Color */}
            <div className="question-block">
              <label className="question-title">What color is their magic cape?</label>
              <div className="color-selectors-row">
                {colors.map(c => (
                  <button
                    key={c.id}
                    className={`color-pill-btn ${heroColor === c.id ? 'active' : ''}`}
                    style={{ '--color-tint': c.value }}
                    onClick={() => setHeroColor(c.id)}
                  >
                    <span className="color-swatch-circle" style={{ backgroundColor: c.value }}></span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Q5: Location Setting */}
            <div className="question-block">
              <label className="question-title">Where does the adventure happen?</label>
              <div className="location-cards-row">
                {settings.map(s => (
                  <button
                    key={s.id}
                    className={`setting-select-card ${setting === s.id ? 'active' : ''}`}
                    onClick={() => setSetting(s.id)}
                  >
                    <span className="setting-label">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Q6: Story Goal */}
            <div className="question-block">
              <label className="question-title">What is the story's challenge or goal?</label>
              <div className="goals-selectors-stack">
                {goals.map(g => (
                  <button
                    key={g.id}
                    className={`goal-stack-bar ${goal === g.id ? 'active' : ''}`}
                    onClick={() => setGoal(g.id)}
                  >
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Box of dynamic prompt for parents to see */}
            <div className="prompt-live-preview-box">
              <h5 className="preview-label">📝 AI STORY PROMPT CONSTRUCTED:</h5>
              <p className="preview-text">"{prompt}"</p>
            </div>
          </div>
        )}

        {/* Step 1 (Custom Mode): Traditional prompt textarea */}
        {step === 1 && builderMode === 'custom' && (
          <div className="step-panel step-1-panel">
            <div className="step-heading-group">
              <FaPen className="step-heading-icon" />
              <h2 className="serif-heading">Write your custom prompt</h2>
              <p className="text-muted">Perfect for parents or teachers. Describe any custom narrative outline you want.</p>
            </div>
            <div className="prompt-input-group">
              <textarea
                className="form-control prompt-textarea"
                rows="5"
                placeholder="A friendly bear learns how to share honey..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
              <div className="prompt-char-count text-muted">
                {prompt.length} / 500 characters
              </div>
            </div>

            <div className="prompt-suggestions">
              <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Try these:</span>
              {[
                'A brave kite that flies above the clouds',
                'Two siblings discover a map inside an old clock',
                'A shy caterpillar finds its singing voice'
              ].map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => setPrompt(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose Style */}
        {step === 2 && (
          <div className="step-panel step-2-panel">
            <div className="step-heading-group">
              <FaPaintBrush className="step-heading-icon" />
              <h2 className="serif-heading">Choose your art direction</h2>
              <p className="text-muted">Select illustration style, tone, and reading level for the story.</p>
            </div>

            <div className="style-section">
              <h4 className="style-section-title">Illustration Style</h4>
              <div className="style-options-row">
                {artStyles.map(s => (
                  <button 
                    key={s.id} 
                    className={`style-option-card ${artStyle === s.id ? 'selected' : ''}`}
                    onClick={() => setArtStyle(s.id)}
                  >
                    <span className="style-emoji">{s.emoji}</span>
                    <span className="style-label">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="style-section">
              <h4 className="style-section-title">Story Tone</h4>
              <div className="style-options-row">
                {tones.map(t => (
                  <button 
                    key={t.id} 
                    className={`tone-chip ${tone === t.id ? 'selected' : ''}`}
                    onClick={() => setTone(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="style-section">
              <h4 className="style-section-title">Grade Level</h4>
              <div className="grade-options">
                {grades.map(g => (
                  <button
                    key={g.id}
                    className={`grade-option ${grade === g.id ? 'selected' : ''}`}
                    onClick={() => setGrade(g.id)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: AI Generation Loader */}
        {step === 3 && (
          <div className="step-panel step-3-panel">
            <div className="gen-center-wrapper">
              <div className="gen-magic-orb">
                <FaMagic className={`gen-magic-icon ${genDone ? 'done' : 'spinning'}`} />
              </div>

              <h2 className="serif-heading gen-title">
                {genDone ? 'Your story is ready!' : 'Creating your storybook...'}
              </h2>

              <div className="gen-progress-bar-track">
                <div 
                  className="gen-progress-bar-fill" 
                  style={{ width: `${genProgress}%` }}
                />
              </div>
              <span className="gen-progress-pct">{Math.round(genProgress)}%</span>

              <div className="gen-messages-feed">
                {genMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className="gen-message-item"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preview & Edit */}
        {step === 4 && (
          <div className="step-panel step-4-panel">
            <div className="step-heading-group">
              <FaBookOpen className="step-heading-icon" />
              <h2 className="serif-heading">Preview your storybook</h2>
              <p className="text-muted">Review and edit each page before publishing. Click any text to modify it.</p>
            </div>

            <div className="preview-pages">
              {pages.map((page, idx) => (
                <div key={idx} className="preview-page-card">
                  <div className="preview-page-illustration">
                    {pageIllustrations[idx]}
                    <span className="page-number-badge">Page {idx + 1}</span>
                  </div>
                  <div className="preview-page-text-area">
                    {editingPage === idx ? (
                      <div className="edit-mode">
                        <textarea
                          className="form-control page-edit-textarea"
                          rows="4"
                          defaultValue={page.text}
                          autoFocus
                          onBlur={(e) => handlePageEdit(idx, e.target.value)}
                        />
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Click away or Tab to save</span>
                      </div>
                    ) : (
                      <p 
                        className="page-text serif-heading" 
                        onClick={() => setEditingPage(idx)}
                        title="Click to edit"
                      >
                        {page.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="creator-nav-buttons">
        {step > 1 && (
          <button className="btn btn-outline" onClick={() => { setStep(step - 1); if (step === 4) setGenDone(false); }}>
            <FaArrowLeft /> Back
          </button>
        )}
        <div style={{ flex: 1 }}></div>
        {step < 4 ? (
          <button 
            className="btn btn-primary" 
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && builderMode === 'custom' && !prompt.trim()}
          >
            {step === 3 ? (genDone ? 'See Preview' : 'Generating...') : 'Continue'} <FaArrowRight />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate('/story/1')}>
            <FaBookOpen /> Read This Story
          </button>
        )}
      </div>

      <style>{`
        .creator-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-color);
        }

        .creator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 3rem;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--surface-color);
        }

        .creator-back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          transition: var(--transition-fast);
        }

        .creator-back-link:hover {
          color: var(--primary-accent);
        }

        .creator-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.35rem;
        }

        .mode-toggle-pill {
          display: flex;
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          border-radius: 9999px;
          padding: 2px;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          border: none;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
          background: none;
          transition: var(--transition-fast);
        }

        .mode-btn.active {
          background-color: var(--primary-accent);
          color: #FFFFFF;
        }

        /* Stepper */
        .stepper-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem 3rem;
          gap: 0;
          background-color: var(--surface-color);
          border-bottom: 1px solid var(--border-color);
        }

        .stepper-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stepper-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-muted);
          background-color: var(--surface-color);
          transition: var(--transition-smooth);
          flex-shrink: 0;
        }

        .stepper-item.active .stepper-circle {
          border-color: var(--primary-accent);
          background-color: var(--primary-accent);
          color: #FFFFFF;
        }

        .stepper-item.done .stepper-circle {
          border-color: var(--primary-accent);
          color: var(--primary-accent);
          background-color: var(--soft-accent-bg);
        }

        .stepper-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .stepper-item.active .stepper-label {
          color: var(--primary-accent);
        }

        .stepper-item.done .stepper-label {
          color: var(--text-primary);
        }

        .stepper-line {
          width: 60px;
          height: 2px;
          background-color: var(--border-color);
          margin: 0 0.75rem;
          transition: var(--transition-smooth);
        }

        .stepper-line.filled {
          background-color: var(--primary-accent);
        }

        /* Step Content */
        .step-content-wrapper {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 3rem;
        }

        .step-panel {
          width: 100%;
          max-width: 800px;
          animation: fadeIn 0.4s ease-out;
        }

        .step-heading-group {
          text-align: center;
          margin-bottom: 2.5rem;
          position: relative;
        }

        .kid-badge {
          background-color: #FAF2DF;
          color: var(--secondary-accent);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          letter-spacing: 0.08em;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .step-heading-icon {
          font-size: 1.5rem;
          color: var(--primary-accent);
          margin-bottom: 0.75rem;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .step-heading-group h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .step-heading-group p {
          font-size: 1rem;
        }

        /* Child Workspace Questionnaire */
        .child-builder-workspace {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          max-width: 700px;
        }

        .question-block {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          padding: 1.75rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .question-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .name-input {
          font-size: 1.1rem;
          padding: 0.75rem 1rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .name-input:focus {
          border-color: var(--primary-accent);
        }

        .avatar-grid-select {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 0.75rem;
        }

        .avatar-select-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background-color: var(--bg-color);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .avatar-select-card:hover {
          border-color: var(--text-muted);
        }

        .avatar-select-card.active {
          background-color: var(--soft-accent-bg);
          border-color: var(--primary-accent);
          transform: translateY(-2px);
        }

        .avatar-select-emoji {
          font-size: 2.25rem;
          margin-bottom: 0.5rem;
        }

        .avatar-select-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .avatar-select-desc {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 0.2rem;
        }

        .color-selectors-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .color-pill-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 9999px;
          border: 2px solid var(--border-color);
          background-color: var(--bg-color);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .color-pill-btn.active {
          border-color: var(--color-tint);
          background-color: #FFFFFF;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .color-swatch-circle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }

        .location-cards-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.75rem;
        }

        .setting-select-card {
          padding: 1.25rem;
          border-radius: var(--radius-md);
          border: 2px solid var(--border-color);
          background-color: var(--bg-color);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
          text-align: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .setting-select-card.active {
          background-color: var(--soft-accent-bg);
          border-color: var(--primary-accent);
        }

        .goals-selectors-stack {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .goal-stack-bar {
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 2px solid var(--border-color);
          background-color: var(--bg-color);
          font-size: 0.95rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .goal-stack-bar.active {
          background-color: var(--soft-accent-bg);
          border-color: var(--primary-accent);
          font-weight: 700;
        }

        .prompt-live-preview-box {
          background-color: var(--soft-accent-bg);
          border: 1px dashed var(--primary-accent);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .preview-label {
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: var(--primary-accent);
          margin-bottom: 0.5rem;
          font-weight: 800;
        }

        .preview-text {
          font-size: 1.05rem;
          line-height: 1.5;
          font-family: var(--font-serif);
          color: var(--text-primary);
          margin: 0;
        }

        /* Step 1 (Custom) */
        .prompt-textarea {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          line-height: 1.5;
          resize: vertical;
          min-height: 120px;
        }

        .prompt-char-count {
          text-align: right;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        .prompt-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.5rem;
          align-items: center;
        }

        .suggestion-chip {
          padding: 0.4rem 0.8rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 500;
          background-color: var(--surface-color);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          transition: var(--transition-fast);
        }

        .suggestion-chip:hover {
          border-color: var(--primary-accent);
          color: var(--primary-accent);
          background-color: var(--soft-accent-bg);
        }

        /* Step 2 */
        .style-section {
          margin-bottom: 2rem;
        }

        .style-section-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .style-options-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .style-option-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem 2rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--surface-color);
          transition: var(--transition-smooth);
          flex: 1;
          min-width: 100px;
        }

        .style-option-card:hover {
          border-color: var(--text-muted);
        }

        .style-option-card.selected {
          border-color: var(--primary-accent);
          background-color: var(--soft-accent-bg);
        }

        .style-emoji {
          font-size: 2rem;
        }

        .style-label {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .tone-chip {
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          border: 2px solid var(--border-color);
          font-size: 0.9rem;
          font-weight: 600;
          background-color: var(--surface-color);
          transition: var(--transition-smooth);
        }

        .tone-chip:hover {
          border-color: var(--text-muted);
        }

        .tone-chip.selected {
          border-color: var(--primary-accent);
          background-color: var(--soft-accent-bg);
          color: var(--primary-accent);
        }

        .grade-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .grade-option {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          text-align: left;
          font-weight: 500;
          font-size: 0.9rem;
          background-color: var(--surface-color);
          transition: var(--transition-fast);
        }

        .grade-option:hover {
          background-color: var(--bg-color);
        }

        .grade-option.selected {
          border-color: var(--primary-accent);
          background-color: var(--soft-accent-bg);
          color: var(--primary-accent);
          font-weight: 700;
        }

        /* Step 3 */
        .step-3-panel {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .gen-center-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 500px;
        }

        .gen-magic-orb {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--soft-accent-bg), #E2ECF7);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          box-shadow: 0 0 40px rgba(61, 92, 52, 0.15);
        }

        .gen-magic-icon {
          font-size: 2.5rem;
          color: var(--primary-accent);
        }

        .gen-magic-icon.spinning {
          animation: spin 3s linear infinite;
        }

        .gen-magic-icon.done {
          color: var(--primary-accent);
          animation: none;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .gen-title {
          font-size: 1.75rem;
          margin-bottom: 2rem;
        }

        .gen-progress-bar-track {
          width: 100%;
          height: 8px;
          background-color: var(--bg-color);
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 0.5rem;
          border: 1px solid var(--border-color);
        }

        .gen-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-accent), var(--secondary-accent));
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .gen-progress-pct {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--primary-accent);
          margin-bottom: 2rem;
        }

        .gen-messages-feed {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          width: 100%;
          max-height: 200px;
          overflow-y: auto;
        }

        .gen-message-item {
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 0.35rem 0;
          animation: fadeIn 0.3s ease-out;
        }

        /* Step 4 */
        .preview-pages {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .preview-page-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }

        .preview-page-card:hover {
          box-shadow: var(--shadow-md);
        }

        .preview-page-illustration {
          position: relative;
          background-color: #F5F9F2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .page-illustration {
          width: 100%;
          height: auto;
          border-radius: var(--radius-sm);
        }

        .page-number-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          background-color: rgba(255, 255, 255, 0.9);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .preview-page-text-area {
          padding: 2rem;
          display: flex;
          align-items: center;
        }

        .page-text {
          font-size: 1.1rem;
          line-height: 1.55;
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition-fast);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          border: 2px dashed transparent;
        }

        .page-text:hover {
          border-color: var(--border-color);
          background-color: var(--bg-color);
        }

        .page-edit-textarea {
          font-family: var(--font-serif);
          font-size: 1rem;
          line-height: 1.5;
        }

        .edit-mode {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        /* Nav Buttons */
        .creator-nav-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          border-top: 1px solid var(--border-color);
          background-color: var(--surface-color);
        }

        @media (max-width: 768px) {
          .creator-header {
            padding: 1rem 1.5rem;
            flex-direction: column;
            gap: 0.75rem;
          }
          .step-content-wrapper {
            padding: 2rem 1.5rem;
          }
          .stepper-label {
            display: none;
          }
          .stepper-line {
            width: 30px;
          }
          .preview-page-card {
            grid-template-columns: 1fr;
          }
          .creator-nav-buttons {
            padding: 1rem 1.5rem;
          }
          .style-options-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
