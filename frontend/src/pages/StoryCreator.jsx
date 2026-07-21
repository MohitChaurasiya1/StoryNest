import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheckCircle,
  FaPaintBrush,
  FaPen,
  FaBookOpen,
  FaMagic,
  FaChild,
  FaKeyboard,
  FaSmile,
  FaHeart,
  FaUserFriends,
  FaStar,
  FaBolt,
  FaMoon
} from 'react-icons/fa';

export default function StoryCreator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [builderMode, setBuilderMode] = useState('child'); // 'child' or 'custom'

  // --- Step 1: Basic Child Info (6 questions) ---
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('boy');
  const [familyDetails, setFamilyDetails] = useState('');
  const [favoriteThings, setFavoriteThings] = useState('');
  const [specialInterests, setSpecialInterests] = useState('');

  // --- Step 2 (Kid Mode): 8 Fun Questions ---
  const [heroAnimal, setHeroAnimal] = useState('lion');
  const [heroJob, setHeroJob] = useState('astronaut');
  const [heroColor, setHeroColor] = useState('gold');
  const [setting, setSetting] = useState('space');
  const [companion, setCompanion] = useState('funny-robot');
  const [storyMood, setStoryMood] = useState('happy');
  const [magicPower, setMagicPower] = useState('fly');
  const [storyEnding, setStoryEnding] = useState('happy');

  // --- Step 2 (Parent / Teacher Mode): 16 Detailed Questions ---
  const [moral, setMoral] = useState('kindness');
  const [vocabTheme, setVocabTheme] = useState('science');
  const [language, setLanguage] = useState('bilingual');
  const [storyLength, setStoryLength] = useState('medium');
  const [encouragedBehavior, setEncouragedBehavior] = useState('');
  const [sidekick, setSidekick] = useState('wise-owl');
  const [magicObject, setMagicObject] = useState('secret-map');
  const [artStyle, setArtStyle] = useState('watercolor');
  const [tone, setTone] = useState('whimsical');
  const [grade, setGrade] = useState('grade-2');
  const [pronoun, setPronoun] = useState('he');
  const [rival, setRival] = useState('none');
  const [numPages, setNumPages] = useState('5');
  const [readingDifficulty, setReadingDifficulty] = useState('medium');
  const [culturalElements, setCulturalElements] = useState('mixed');
  const [bedtimeSafe, setBedtimeSafe] = useState('yes');

  // API Generation State
  const [genProgress, setGenProgress] = useState(0);
  const [genMessages, setGenMessages] = useState([]);
  const [genDone, setGenDone] = useState(false);
  const [generatedStoryId, setGeneratedStoryId] = useState(null);

  // Generated Pages preview
  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);

  // ========== DATA OPTIONS ==========

  const genders = [
    { id: 'boy', label: '👦 Boy', desc: 'He / Him' },
    { id: 'girl', label: '👧 Girl', desc: 'She / Her' },
    { id: 'nonbinary', label: '🧒 Non-Binary', desc: 'They / Them' }
  ];

  const animals = [
    { id: 'lion', label: 'Lion 🦁', desc: 'Brave & Roaring' },
    { id: 'bear', label: 'Bear 🐻', desc: 'Cozy & Friendly' },
    { id: 'fox', label: 'Fox 🦊', desc: 'Smart & Clever' },
    { id: 'unicorn', label: 'Unicorn 🦄', desc: 'Sweet & Magic' },
    { id: 'frog', label: 'Frog 🐸', desc: 'Happy & Bouncy' },
    { id: 'rabbit', label: 'Rabbit 🐰', desc: 'Fast & Playful' },
    { id: 'owl', label: 'Owl 🦉', desc: 'Wise & Gentle' },
    { id: 'dragon', label: 'Dragon 🐉', desc: 'Fierce & Loyal' }
  ];

  const jobs = [
    { id: 'astronaut', label: 'Astronaut 🚀', desc: 'Explores stars' },
    { id: 'wizard', label: 'Wizard 🪄', desc: 'Casts fun spells' },
    { id: 'explorer', label: 'Explorer 🧭', desc: 'Finds lost paths' },
    { id: 'superhero', label: 'Superhero 🦸', desc: 'Helps everyone' },
    { id: 'chef', label: 'Master Chef 🧑‍🍳', desc: 'Bakes yummy cookies' },
    { id: 'detective', label: 'Detective 🔍', desc: 'Solves mysteries' }
  ];

  const settingsData = [
    { id: 'space', label: 'Cosmic Space 🌌' },
    { id: 'forest', label: 'Whispering Forest 🌲' },
    { id: 'candyland', label: 'Sweet Candy Land 🍬' },
    { id: 'sea', label: 'Deep Blue Sea 🌊' },
    { id: 'castle', label: 'Magic Castle 🏰' },
    { id: 'volcano', label: 'Fire Volcano 🌋' }
  ];

  const companions = [
    { id: 'funny-robot', label: 'Funny Robot 🤖' },
    { id: 'playful-puppy', label: 'Playful Puppy 🐶' },
    { id: 'wise-fairy', label: 'Wise Fairy 🧚' },
    { id: 'cute-squirrel', label: 'Cute Squirrel 🐿️' },
    { id: 'baby-dragon', label: 'Baby Dragon 🐲' }
  ];

  const colors = [
    { id: 'gold', label: 'Gold 🟡', value: '#FFD93D' },
    { id: 'blue', label: 'Blue 🔵', value: '#6BCBF5' },
    { id: 'pink', label: 'Pink 🌸', value: '#F472B6' },
    { id: 'green', label: 'Green 🟢', value: '#6BCB77' },
    { id: 'purple', label: 'Purple 🟣', value: '#A78BFA' }
  ];

  const moods = [
    { id: 'happy', label: '😊 Happy', desc: 'Bright & joyful' },
    { id: 'silly', label: '🤪 Silly', desc: 'Lots of giggles' },
    { id: 'mysterious', label: '🔮 Mysterious', desc: 'Full of secrets' },
    { id: 'exciting', label: '🎢 Exciting', desc: 'Heart-pounding' }
  ];

  const magicPowers = [
    { id: 'fly', label: '🦅 Fly', desc: 'Soar through skies' },
    { id: 'invisible', label: '👻 Invisible', desc: 'Disappear at will' },
    { id: 'time-travel', label: '⏰ Time Travel', desc: 'Visit past & future' },
    { id: 'talk-animals', label: '🐾 Talk to Animals', desc: 'Chat with critters' },
    { id: 'super-strength', label: '💪 Super Strength', desc: 'Lift anything' }
  ];

  const storyEndings = [
    { id: 'happy', label: '🌈 Happy Ending', desc: 'Everyone smiles' },
    { id: 'surprise', label: '🎁 Surprise Twist', desc: 'Unexpected turn' },
    { id: 'cliffhanger', label: '🧗 Cliffhanger', desc: 'To be continued...' },
    { id: 'lesson', label: '📚 Moral Lesson', desc: 'Learn something new' }
  ];

  // Dynamic loading messages
  const getLoadingMessages = () => {
    return [
      `✨ Reading ${childName || 'your child'}'s profile...`,
      `🧒 Setting up a ${childGender} protagonist...`,
      `🧠 Setting grade level difficulty to ${grade}...`,
      `📖 Building narrative arc incorporating ${builderMode === 'child' ? heroAnimal : moral}...`,
      `🧭 Constructing the setting: ${builderMode === 'child' ? setting : 'the magical world'}...`,
      `🎨 Instructing Gemini for structured page responses...`,
      `🦁 Drawing matching illustrations in ${artStyle} style...`,
      `🌍 Adding bilingual English & Hindi translations...`,
      `🔑 Generating interactive vocabulary blocks...`,
      `📘 Binding your custom Storybook...`
    ];
  };

  // Call Django API on entering Step 3
  useEffect(() => {
    if (step === 3 && !genDone) {
      setGenProgress(0);
      setGenMessages([]);
      let msgIdx = 0;
      const loadingMsgs = getLoadingMessages();
      
      const timer = setInterval(() => {
        setGenProgress(prev => {
          const next = Math.min(prev + Math.random() * 12 + 4, 99);
          return next;
        });
        if (msgIdx < loadingMsgs.length) {
          setGenMessages(prev => [...prev, loadingMsgs[msgIdx]]);
          msgIdx++;
        }
      }, 700);

      // Build API payload
      const payload = {
        childName: childName || 'Leo',
        childAge: childAge || '7',
        childGender,
        familyDetails: familyDetails || 'Mom, Dad',
        favoriteThings: favoriteThings || 'adventures',
        specialInterests: specialInterests || '',
        builderMode,
        // Kids mode fields
        heroAnimal,
        heroJob,
        heroColor,
        setting,
        companion,
        storyMood,
        magicPower,
        storyEnding,
        // Parent/Teacher mode fields
        moral,
        vocabTheme,
        language,
        storyLength,
        encouragedBehavior,
        sidekick,
        magicObject,
        artStyle,
        tone,
        grade,
        pronoun,
        rival,
        numPages: parseInt(numPages) || 5,
        readingDifficulty,
        culturalElements,
        bedtimeSafe
      };

      axios.post('http://localhost:8000/api/stories/generate/', payload)
        .then(response => {
          clearInterval(timer);
          setGenProgress(100);
          setGenMessages(prev => [...prev, '✨ Story generated successfully!']);
          setPages(response.data.pages || []);
          setGeneratedStoryId(response.data.id);
          setGenDone(true);
        })
        .catch(err => {
          console.error(err);
          clearInterval(timer);
          setGenProgress(100);
          setGenMessages(prev => [...prev, '❌ API Offline — Loading offline demo story...']);
          
          // Offline fallback
          setTimeout(() => {
            const pageCount = builderMode === 'custom' ? (parseInt(numPages) || 5) : 5;
            const fallbackPages = generateOfflineFallback(pageCount);
            setPages(fallbackPages);
            setGenDone(true);
          }, 1500);
        });

      return () => clearInterval(timer);
    }
  }, [step]);

  // Offline fallback story generator
  const generateOfflineFallback = (pageCount) => {
    const heroName = childName || 'Leo';
    const animal = heroAnimal || 'lion';
    const place = setting || 'space';
    const buddy = companion || sidekick || 'a friendly robot';
    const color = heroColor || 'gold';
    const power = magicPower || 'fly';
    const mood = storyMood || 'happy';

    const templates = [
      {
        text_en: `Once upon a time, ${heroName} the brave ${animal} woke up in the ${place} wearing a shimmering ${color} cape! Today was the day of the Grand Adventure.`,
        text_hi: `एक बार की बात है, बहादुर ${animal} ${heroName} ${place} में एक चमचमाती ${color} चादर पहनकर जागा! आज महान साहसिक यात्रा का दिन था।`,
        illustration_prompt: `A cute ${animal} character with a ${color} cape standing in ${place}, children's book illustration style`,
        dictionary: { adventure: 'An exciting journey into the unknown (साहसिक यात्रा)', cape: 'A flowing cloth worn on the shoulders (लबादा)' }
      },
      {
        text_en: `${heroName} discovered ${buddy} hiding behind a giant crystal. "Want to come along?" asked ${heroName}. The ${buddy} jumped with joy!`,
        text_hi: `${heroName} ने ${buddy} को एक विशाल क्रिस्टल के पीछे छिपा हुआ पाया। "क्या तुम साथ चलोगे?" ${heroName} ने पूछा। ${buddy} खुशी से उछल पड़ा!`,
        illustration_prompt: `The ${animal} meeting ${buddy} near a giant crystal in ${place}`,
        dictionary: { companion: 'A friend who travels with you (साथी)', crystal: 'A beautiful clear stone (क्रिस्टल)' }
      },
      {
        text_en: `Together, they faced the Twisting Tunnel of Echoes. ${heroName} used the power to ${power} and carried everyone safely across!`,
        text_hi: `साथ मिलकर, उन्होंने गूंजती सुरंग का सामना किया। ${heroName} ने ${power} की शक्ति का उपयोग किया और सबको सुरक्षित पार ले गया!`,
        illustration_prompt: `The heroes navigating through a magical tunnel with echoing lights`,
        dictionary: { tunnel: 'A long underground passage (सुरंग)', courage: 'Being brave when scared (साहस)' }
      },
      {
        text_en: `At the heart of the ${place}, they found a golden treasure chest glowing with rainbow light. Inside was the Jewel of ${mood === 'happy' ? 'Happiness' : mood === 'silly' ? 'Laughter' : 'Wonder'}.`,
        text_hi: `${place} के बीचोबीच, उन्हें एक सुनहरा खज़ाना मिला जो इंद्रधनुषी रोशनी से चमक रहा था। अंदर ${mood === 'happy' ? 'खुशी' : mood === 'silly' ? 'हंसी' : 'आश्चर्य'} का रत्न था।`,
        illustration_prompt: `A magical treasure chest glowing with rainbow light in ${place}`,
        dictionary: { treasure: 'Something very valuable and special (खज़ाना)', jewel: 'A precious sparkling stone (रत्न)' }
      },
      {
        text_en: `${heroName} brought the jewel home and shared its magic with the whole family. From that day on, every bedtime story became a new adventure! The End. 🌟`,
        text_hi: `${heroName} ने रत्न घर लाकर अपने पूरे परिवार के साथ उसका जादू बाँटा। उस दिन से, हर सोने की कहानी एक नई यात्रा बन गई! समाप्त। 🌟`,
        illustration_prompt: `The ${animal} hero back home sharing a glowing jewel with a happy family`,
        dictionary: { family: 'The people you love and live with (परिवार)', share: 'To give part of something to others (बाँटना)' }
      },
      {
        text_en: `But wait — the ${buddy} noticed a tiny map hidden inside the treasure chest. It pointed to an even BIGGER adventure beyond the stars!`,
        text_hi: `लेकिन रुको — ${buddy} ने खज़ाने के अंदर एक छोटा नक्शा छिपा हुआ देखा। वह तारों के पार एक और भी बड़ी यात्रा की ओर इशारा कर रहा था!`,
        illustration_prompt: `A tiny magical map unfurling from the treasure chest with glowing star paths`,
        dictionary: { map: 'A drawing that shows where places are (नक्शा)', mystery: 'Something secret waiting to be discovered (रहस्य)' }
      },
      {
        text_en: `${heroName} and ${buddy} looked at each other and smiled. "Are you ready?" asked ${heroName}. "Always!" replied the ${buddy}. And off they went, soaring into the sunset.`,
        text_hi: `${heroName} और ${buddy} ने एक-दूसरे को देखा और मुस्कुराए। "क्या तुम तैयार हो?" ${heroName} ने पूछा। "हमेशा!" ${buddy} ने जवाब दिया। और वे सूर्यास्त की ओर उड़ चले।`,
        illustration_prompt: `Two friends soaring into a colorful sunset sky together`,
        dictionary: { friendship: 'A close bond between two beings (दोस्ती)', sunset: 'When the sun goes down beautifully (सूर्यास्त)' }
      },
      {
        text_en: `And so, the legend of ${heroName} the ${animal} grew across the land. Every child who heard the tale felt a spark of bravery in their heart. 🌟✨`,
        text_hi: `और इस तरह, ${heroName} ${animal} की कहानी पूरी दुनिया में फैल गई। हर बच्चे ने जिसने यह कहानी सुनी, अपने दिल में बहादुरी की चिंगारी महसूस की। 🌟✨`,
        illustration_prompt: `A legendary hero ${animal} silhouette against a starry sky, children's storybook ending`,
        dictionary: { legend: 'A famous story passed down through time (किंवदंती)', bravery: 'Having the courage to do something hard (बहादुरी)' }
      }
    ];

    return templates.slice(0, pageCount).map((t, i) => ({
      page_number: i + 1,
      ...t
    }));
  };

  const handlePageEdit = (idx, newText) => {
    const updated = [...pages];
    updated[idx].text_en = newText;
    setPages(updated);
    setEditingPage(null);
  };

  const handlePageEditHi = (idx, newText) => {
    const updated = [...pages];
    updated[idx].text_hi = newText;
    setPages(updated);
    setEditingPage(null);
  };

  const canProceed = () => {
    if (step === 1) {
      return childName.trim() !== '' && childAge.trim() !== '';
    }
    return true;
  };

  return (
    <div className="creator-container animate-fade-in">
      {/* Header */}
      <header className="creator-header">
        <Link to="/" className="creator-back-link">
          <FaArrowLeft /> Back to Home
        </Link>
        <div className="creator-logo">
          <FaMagic style={{ color: 'var(--coral)' }} />
          <span className="serif-heading">StoryNest Creator</span>
        </div>
        <div className="mode-toggle-pill">
          <button 
            className={`mode-btn ${builderMode === 'child' ? 'active' : ''}`}
            onClick={() => setBuilderMode('child')}
          >
            <FaChild /> Kids Mode (8 Questions)
          </button>
          <button 
            className={`mode-btn ${builderMode === 'custom' ? 'active' : ''}`}
            onClick={() => setBuilderMode('custom')}
          >
            <FaKeyboard /> Parents/Teachers (16 Questions)
          </button>
        </div>
      </header>

      {/* Stepper */}
      <div className="stepper-bar">
        {[
          { num: 1, label: 'About the Child' },
          { num: 2, label: 'Story Options' },
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
        
        {/* STEP 1: Basic Child Info */}
        {step === 1 && (
          <div className="step-panel">
            <div className="step-heading-group">
              <span className="kid-badge">🧒 STEP 1: ABOUT THE CHILD</span>
              <h2>Let's personalize your story!</h2>
              <p>Tell us about the reader so we can make them the hero of their own adventure.</p>
            </div>

            <div className="child-builder-workspace">
              {/* Q1: Child Name */}
              <div className="question-block">
                <label className="question-title">
                  <FaSmile style={{ marginRight: '8px', color: 'var(--coral)' }} /> What is the child's name? <span className="required-star">*</span>
                </label>
                <input 
                  type="text"
                  className="form-control name-input"
                  placeholder="e.g. Leo, Mohit, Emma"
                  value={childName}
                  onChange={e => setChildName(e.target.value)}
                />
              </div>

              {/* Q2: Age */}
              <div className="question-block">
                <label className="question-title">
                  <FaChild style={{ marginRight: '8px', color: 'var(--sky)' }} /> How old is the child? <span className="required-star">*</span>
                </label>
                <input 
                  type="number"
                  className="form-control name-input"
                  placeholder="e.g. 7"
                  min="3"
                  max="14"
                  value={childAge}
                  onChange={e => setChildAge(e.target.value)}
                />
              </div>

              {/* Q3: Gender */}
              <div className="question-block">
                <label className="question-title">
                  <FaStar style={{ marginRight: '8px', color: 'var(--orange)' }} /> Child's Gender
                </label>
                <div className="avatar-grid-select compact-grid">
                  {genders.map(g => (
                    <button
                      key={g.id}
                      className={`avatar-select-card ${childGender === g.id ? 'active' : ''}`}
                      onClick={() => setChildGender(g.id)}
                    >
                      <span className="avatar-select-emoji">{g.label.split(' ')[0]}</span>
                      <span className="avatar-select-name">{g.label.split(' ')[1]}</span>
                      <span className="avatar-select-desc">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q4: Family Members */}
              <div className="question-block">
                <label className="question-title">
                  <FaUserFriends style={{ marginRight: '8px', color: 'var(--purple)' }} /> Family Details (Who lives at home? Name them!)
                </label>
                <input 
                  type="text"
                  className="form-control name-input"
                  placeholder="e.g. Mom, Dad, and baby sister Mira"
                  value={familyDetails}
                  onChange={e => setFamilyDetails(e.target.value)}
                />
              </div>

              {/* Q5: Favorite Things */}
              <div className="question-block">
                <label className="question-title">
                  <FaHeart style={{ marginRight: '8px', color: 'var(--pink)' }} /> Favorite Things (Hobbies, toys, favorite food)
                </label>
                <input 
                  type="text"
                  className="form-control name-input"
                  placeholder="e.g. dinosaurs, building blocks, and mangoes"
                  value={favoriteThings}
                  onChange={e => setFavoriteThings(e.target.value)}
                />
              </div>

              {/* Q6: Special Interests / Fears */}
              <div className="question-block">
                <label className="question-title">
                  <FaBolt style={{ marginRight: '8px', color: 'var(--mint)' }} /> Special Interests or Fears (Optional)
                </label>
                <input 
                  type="text"
                  className="form-control name-input"
                  placeholder="e.g. loves trains, scared of thunder, curious about volcanoes"
                  value={specialInterests}
                  onChange={e => setSpecialInterests(e.target.value)}
                />
                <span className="helper-text">We'll weave interests into the story and avoid scary triggers.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 (Kids Mode): 8 Fun Questions */}
        {step === 2 && builderMode === 'child' && (
          <div className="step-panel">
            <div className="step-heading-group">
              <span className="kid-badge">🧒 KIDS WORKSPACE</span>
              <h2>Let's build your story outline!</h2>
              <p>Answer these 8 fun questions to shape your adventure.</p>
            </div>

            <div className="child-builder-workspace">
              {/* Q1: Hero character */}
              <div className="question-block">
                <label className="question-title">1. 🦁 Choose your main character:</label>
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

              {/* Q2: Job */}
              <div className="question-block">
                <label className="question-title">2. 🎭 What is their job or superpower?</label>
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

              {/* Q3: Magic Cape Color */}
              <div className="question-block">
                <label className="question-title">3. 🎨 Pick a magic cape color:</label>
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

              {/* Q4: Setting */}
              <div className="question-block">
                <label className="question-title">4. 🌍 Where should the story take place?</label>
                <div className="location-cards-row">
                  {settingsData.map(s => (
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

              {/* Q5: Companion */}
              <div className="question-block">
                <label className="question-title">5. 🤝 Who is the funny sidekick?</label>
                <div className="location-cards-row">
                  {companions.map(c => (
                    <button
                      key={c.id}
                      className={`setting-select-card ${companion === c.id ? 'active' : ''}`}
                      onClick={() => setCompanion(c.id)}
                    >
                      <span className="setting-label">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q6: Story Mood */}
              <div className="question-block">
                <label className="question-title">6. 🎭 What mood should the story have?</label>
                <div className="avatar-grid-select compact-grid">
                  {moods.map(item => (
                    <button
                      key={item.id}
                      className={`avatar-select-card ${storyMood === item.id ? 'active' : ''}`}
                      onClick={() => setStoryMood(item.id)}
                    >
                      <span className="avatar-select-emoji">{item.label.split(' ')[0]}</span>
                      <span className="avatar-select-name">{item.label.split(' ').slice(1).join(' ')}</span>
                      <span className="avatar-select-desc">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q7: Magic Power */}
              <div className="question-block">
                <label className="question-title">7. ⚡ What magic power does your hero have?</label>
                <div className="avatar-grid-select">
                  {magicPowers.map(item => (
                    <button
                      key={item.id}
                      className={`avatar-select-card ${magicPower === item.id ? 'active' : ''}`}
                      onClick={() => setMagicPower(item.id)}
                    >
                      <span className="avatar-select-emoji">{item.label.split(' ')[0]}</span>
                      <span className="avatar-select-name">{item.label.split(' ').slice(1).join(' ')}</span>
                      <span className="avatar-select-desc">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q8: Story Ending */}
              <div className="question-block">
                <label className="question-title">8. 🏁 How should the story end?</label>
                <div className="avatar-grid-select compact-grid">
                  {storyEndings.map(item => (
                    <button
                      key={item.id}
                      className={`avatar-select-card ${storyEnding === item.id ? 'active' : ''}`}
                      onClick={() => setStoryEnding(item.id)}
                    >
                      <span className="avatar-select-emoji">{item.label.split(' ')[0]}</span>
                      <span className="avatar-select-name">{item.label.split(' ').slice(1).join(' ')}</span>
                      <span className="avatar-select-desc">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 (Parents / Teachers Mode): 16 Advanced Questions */}
        {step === 2 && builderMode === 'custom' && (
          <div className="step-panel">
            <div className="step-heading-group">
              <span className="kid-badge">🛠️ PARENT & TEACHER CONTROL</span>
              <h2>Customize the educational experience</h2>
              <p>Configure advanced plot outlines, moral lessons, and reading complexity parameters.</p>
            </div>

            <div className="child-builder-workspace">
              
              {/* GROUP 1: Learning Config */}
              <div className="style-section">
                <h4 className="style-section-title">📚 Reading & Learning Settings</h4>
                <div className="form-group">
                  <label className="form-label">Story Language</label>
                  <select className="form-control" value={language} onChange={e => setLanguage(e.target.value)}>
                    <option value="bilingual">Bilingual (English + Hindi Side-by-Side)</option>
                    <option value="en">English Only</option>
                    <option value="hi">Hindi Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Grade / Vocabulary Level</label>
                  <select className="form-control" value={grade} onChange={e => setGrade(e.target.value)}>
                    <option value="grade-1">Grade 1 (Ages 5-6)</option>
                    <option value="grade-2">Grade 2 (Ages 7-8)</option>
                    <option value="grade-3">Grade 3 (Ages 8-9)</option>
                    <option value="grade-4">Grade 4 (Ages 9-10)</option>
                    <option value="grade-5">Grade 5 (Ages 10-12)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Vocabulary Focus Theme</label>
                  <select className="form-control" value={vocabTheme} onChange={e => setVocabTheme(e.target.value)}>
                    <option value="science">Science & Space Vocabulary</option>
                    <option value="nature">Nature & Animals Vocabulary</option>
                    <option value="emotions">Emotions & Social-Emotional Words</option>
                    <option value="everyday">Everyday household objects & verbs</option>
                    <option value="math">Math & Numbers Vocabulary</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">📖 Reading Difficulty Level</label>
                  <select className="form-control" value={readingDifficulty} onChange={e => setReadingDifficulty(e.target.value)}>
                    <option value="easy">Easy — Short sentences, simple words</option>
                    <option value="medium">Medium — Mixed sentence lengths, some new words</option>
                    <option value="hard">Hard — Complex vocabulary, longer paragraphs</option>
                  </select>
                </div>
              </div>

              {/* GROUP 2: Moral & Behavior */}
              <div className="style-section">
                <h4 className="style-section-title">🌟 Moral & Behavioral Focus</h4>
                <div className="form-group">
                  <label className="form-label">Core Story Moral / Life Lesson</label>
                  <select className="form-control" value={moral} onChange={e => setMoral(e.target.value)}>
                    <option value="kindness">Kindness & Helping others</option>
                    <option value="sharing">Sharing and collaboration</option>
                    <option value="persistence">Persistence (Never giving up)</option>
                    <option value="honesty">Honesty and integrity</option>
                    <option value="empathy">Empathy & understanding feelings</option>
                    <option value="gratitude">Gratitude & being thankful</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Habit or Action to Encourage (e.g. bedtime, eating greens)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={encouragedBehavior} 
                    onChange={e => setEncouragedBehavior(e.target.value)} 
                    placeholder="e.g. brushing teeth, packing school bags"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">🌙 Bedtime Safe? (No scary elements)</label>
                  <select className="form-control" value={bedtimeSafe} onChange={e => setBedtimeSafe(e.target.value)}>
                    <option value="yes">Yes — Calm, cozy, no scary scenes</option>
                    <option value="no">No — Mild tension & suspense is OK</option>
                  </select>
                </div>
              </div>

              {/* GROUP 3: Characters & Artifacts */}
              <div className="style-section">
                <h4 className="style-section-title">🔮 Characters & Adventure Details</h4>
                <div className="form-group">
                  <label className="form-label">Hero's Companion / Sidekick</label>
                  <select className="form-control" value={sidekick} onChange={e => setSidekick(e.target.value)}>
                    <option value="wise-owl">A wise old owl 🦉</option>
                    <option value="helpful-robot">A helpful little robot 🤖</option>
                    <option value="bouncy-pup">A bouncy playful puppy 🐶</option>
                    <option value="magical-fairy">A guide fairy 🧚</option>
                    <option value="baby-dragon">A baby dragon 🐲</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Magical Tool / Artifact</label>
                  <select className="form-control" value={magicObject} onChange={e => setMagicObject(e.target.value)}>
                    <option value="secret-map">A secret glowing map 🧭</option>
                    <option value="talking-key">A talking key that fits any door 🔑</option>
                    <option value="truth-compass">A truth compass that points to what you need 🧭</option>
                    <option value="magic-wand">A bubble-blowing magic wand 🪄</option>
                    <option value="enchanted-book">An enchanted book of spells 📖</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Story Antagonist / Rival</label>
                  <select className="form-control" value={rival} onChange={e => setRival(e.target.value)}>
                    <option value="none">None (Focus entirely on exploration)</option>
                    <option value="silly-shadow">A silly shadow that hides things 👥</option>
                    <option value="greedy-goblin">A greedy goblin who keeps all the keys 👹</option>
                    <option value="mischief-monkey">A mischievous monkey causing chaos 🐒</option>
                  </select>
                </div>
              </div>

              {/* GROUP 4: Tone & Art Direction */}
              <div className="style-section">
                <h4 className="style-section-title">🎨 Art & Tone Direction</h4>
                <div className="form-group">
                  <label className="form-label">Illustration Art Style</label>
                  <select className="form-control" value={artStyle} onChange={e => setArtStyle(e.target.value)}>
                    <option value="watercolor">Watercolor Children's Book 🎨</option>
                    <option value="claymation">Cozy Claymation 🧸</option>
                    <option value="pixel-art">Retro 8-Bit Pixel Art 👾</option>
                    <option value="sketch">Beautiful Pencil Sketches ✏️</option>
                    <option value="anime">Anime / Manga Style 🎌</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Narrative Tone</label>
                  <select className="form-control" value={tone} onChange={e => setTone(e.target.value)}>
                    <option value="whimsical">Whimsical & Magical ✨</option>
                    <option value="cozy">Cozy & Calm (Good for bedtime) 🌙</option>
                    <option value="adventurous">Exciting & Action-Packed 🚀</option>
                    <option value="funny">Funny & Silly 🤣</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Child Pronoun Preferences</label>
                  <select className="form-control" value={pronoun} onChange={e => setPronoun(e.target.value)}>
                    <option value="he">He / Him</option>
                    <option value="she">She / Her</option>
                    <option value="they">They / Them</option>
                  </select>
                </div>
              </div>

              {/* GROUP 5: Story Structure */}
              <div className="style-section">
                <h4 className="style-section-title">📐 Story Structure</h4>
                <div className="form-group">
                  <label className="form-label">📄 Number of Story Pages</label>
                  <div className="page-count-selector">
                    {['3', '5', '8', '10'].map(n => (
                      <button
                        key={n}
                        type="button"
                        className={`page-count-btn ${numPages === n ? 'active' : ''}`}
                        onClick={() => setNumPages(n)}
                      >
                        {n} pages
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Story Length (words per page)</label>
                  <select className="form-control" value={storyLength} onChange={e => setStoryLength(e.target.value)}>
                    <option value="short">Short (30-50 words per page)</option>
                    <option value="medium">Medium (50-80 words per page)</option>
                    <option value="long">Long (80-120 words per page)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">🌏 Cultural Elements & Setting Inspiration</label>
                  <select className="form-control" value={culturalElements} onChange={e => setCulturalElements(e.target.value)}>
                    <option value="mixed">Mixed / Universal</option>
                    <option value="indian">Indian (Festivals, food, desi values)</option>
                    <option value="western">Western (Fairy tales, knights, forests)</option>
                    <option value="japanese">Japanese (Sakura, shrines, honor)</option>
                    <option value="african">African (Savannas, drums, oral tradition)</option>
                    <option value="latin-american">Latin American (Festivals, jungle, warmth)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: AI Generation Loader */}
        {step === 3 && (
          <div className="step-panel step-3-panel">
            <div className="gen-center-wrapper">
              <div className="gen-magic-orb">
                <FaMagic className={`gen-magic-icon ${genDone ? 'done' : 'spinning'}`} />
              </div>
              <h2 className="gen-title serif-heading">
                {genDone ? 'Storybook Bound & Ready!' : 'Calling Gemini to Write Story...'}
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
                  <div key={idx} className="gen-message-item">{msg}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Interactive Preview */}
        {step === 4 && (
          <div className="step-panel step-4-panel">
            <div className="step-heading-group">
              <FaBookOpen className="step-heading-icon" />
              <h2 className="serif-heading">Preview your Storybook</h2>
              <p className="text-muted">Click any page block below to edit or tweak the generated text.</p>
            </div>

            <div className="preview-pages">
              {pages.map((page, idx) => (
                <div key={idx} className="preview-page-card">
                  <div className="preview-page-illustration">
                    <span className="page-number-badge">Page {page.page_number}</span>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <span style={{ fontSize: '3rem' }}>🎨</span>
                      <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 700 }}>
                        {page.illustration_prompt || 'Custom illustration details'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="preview-page-text-area">
                    {editingPage === idx ? (
                      <div className="edit-mode">
                        <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>English Page Content</label>
                        <textarea
                          className="form-control page-edit-textarea"
                          rows="3"
                          defaultValue={page.text_en}
                          onBlur={(e) => handlePageEdit(idx, e.target.value)}
                        />
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '0.5rem' }}>Hindi Translation (हिंदी)</label>
                        <textarea
                          className="form-control page-edit-textarea"
                          rows="3"
                          defaultValue={page.text_hi}
                          onBlur={(e) => handlePageEditHi(idx, e.target.value)}
                        />
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Click out of input box to save changes</span>
                      </div>
                    ) : (
                      <div style={{ width: '100%' }}>
                        <p className="page-text serif-heading" onClick={() => setEditingPage(idx)} title="Click to edit English text">
                          {page.text_en}
                        </p>
                        {page.text_hi && (
                          <p className="page-text serif-heading text-muted" onClick={() => setEditingPage(idx)} title="Click to edit translation text" style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                            {page.text_hi}
                          </p>
                        )}
                        {page.dictionary && Object.keys(page.dictionary).length > 0 && (
                          <div className="page-vocab-section">
                            <span className="vocab-badge">📖 Vocabulary</span>
                            {Object.entries(page.dictionary).map(([word, def]) => (
                              <div key={word} className="vocab-entry">
                                <strong>{word}:</strong> {def}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
        {step > 1 && step !== 3 && (
          <button className="btn btn-outline" onClick={() => { setStep(step - 1); if (step === 4) setGenDone(false); }}>
            <FaArrowLeft /> Back
          </button>
        )}
        <div style={{ flex: 1 }}></div>
        {step < 3 ? (
          <button 
            className="btn btn-primary" 
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            title={!canProceed() ? 'Please fill required fields' : ''}
          >
            Continue <FaArrowRight />
          </button>
        ) : step === 3 ? (
          <button className="btn btn-primary" onClick={() => setStep(4)} disabled={!genDone}>
            See Preview <FaArrowRight />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => navigate(`/story/${generatedStoryId || 1}`)}>
            <FaBookOpen /> Open Reader
          </button>
        )}
      </div>

      {/* Stylesheet Block */}
      <style>{`
        .creator-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-warm);
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient background glow */
        .creator-container::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
          top: -200px;
          right: -200px;
          pointer-events: none;
        }

        .creator-container::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(107, 203, 245, 0.12) 0%, rgba(255, 255, 255, 0) 70%);
          bottom: -100px;
          left: -100px;
          pointer-events: none;
        }

        .creator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 3rem;
          border-bottom: 2px solid var(--border-color);
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .creator-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.95rem;
          transition: var(--transition-fast);
        }

        .creator-back-link:hover {
          color: var(--coral);
          transform: translateX(-4px);
        }

        .creator-logo {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .mode-toggle-pill {
          display: flex;
          background-color: var(--bg-color);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-full);
          padding: 3px;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-full);
          border: none;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-secondary);
          cursor: pointer;
          background: none;
          transition: var(--transition-bounce);
        }

        .mode-btn.active {
          background: linear-gradient(135deg, var(--coral), var(--pink));
          color: #FFFFFF;
          box-shadow: var(--shadow-glow-coral);
        }

        /* Stepper */
        .stepper-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.75rem 3rem;
          background-color: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(8px);
          border-bottom: 2px solid var(--border-color);
          z-index: 5;
        }

        .stepper-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .stepper-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2.5px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-muted);
          background-color: #FFFFFF;
          transition: var(--transition-bounce);
          flex-shrink: 0;
        }

        .stepper-item.active .stepper-circle {
          border-color: var(--coral);
          background: linear-gradient(135deg, var(--coral), var(--pink));
          color: #FFFFFF;
          box-shadow: var(--shadow-glow-coral);
          transform: scale(1.1);
        }

        .stepper-item.done .stepper-circle {
          border-color: var(--coral);
          color: var(--coral);
          background-color: var(--coral-light);
        }

        .stepper-label {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .stepper-item.active .stepper-label {
          color: var(--coral);
        }

        .stepper-item.done .stepper-label {
          color: var(--text-primary);
        }

        .stepper-line {
          width: 80px;
          height: 3px;
          background-color: var(--border-color);
          margin: 0 1rem;
          border-radius: 2px;
          transition: var(--transition-smooth);
        }

        .stepper-line.filled {
          background: linear-gradient(90deg, var(--coral), var(--pink));
        }

        /* Step Content */
        .step-content-wrapper {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 3rem 1.5rem;
          position: relative;
          z-index: 2;
        }

        .step-panel {
          width: 100%;
          max-width: 800px;
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .step-heading-group {
          text-align: center;
          margin-bottom: 3rem;
        }

        .kid-badge {
          background: linear-gradient(135deg, var(--sunshine-light), var(--orange-light));
          color: var(--orange);
          font-size: 0.75rem;
          font-weight: 900;
          padding: 0.35rem 1rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.08em;
          display: inline-block;
          margin-bottom: 0.75rem;
          box-shadow: var(--shadow-sm);
        }

        .step-heading-icon {
          font-size: 2rem;
          color: var(--coral);
          margin-bottom: 0.75rem;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .step-heading-group h2 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .step-heading-group p {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        /* Child Workspace Questionnaire */
        .child-builder-workspace {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .question-block {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background-color: #FFFFFF;
          border: 2px solid var(--border-color);
          padding: 2.25rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          position: relative;
          transition: var(--transition-smooth);
        }

        .question-block:hover {
          border-color: #CBD5E1;
          box-shadow: var(--shadow-md);
        }

        .question-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          position: relative;
          display: inline-block;
        }

        .name-input {
          font-size: 1.2rem;
          font-weight: 700;
          padding: 0.9rem 1.5rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-color);
          transition: var(--transition-fast);
        }

        .name-input:focus {
          background-color: #FFFFFF;
          border-color: var(--coral);
          outline: none;
          box-shadow: var(--shadow-glow-coral);
        }

        .avatar-grid-select {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 1rem;
        }

        /* Tactile 3D Cards */
        .avatar-select-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.25rem;
          background-color: #FFFFFF;
          border: 2px solid var(--border-color);
          border-bottom: 5px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .avatar-select-card:hover {
          border-color: var(--text-secondary);
          transform: translateY(-4px);
        }

        .avatar-select-card.active {
          background-color: var(--coral-light);
          border-color: var(--coral);
          border-bottom-color: var(--coral);
          transform: translateY(-6px);
          box-shadow: var(--shadow-glow-coral);
        }

        .avatar-select-emoji {
          font-size: 2.75rem;
          margin-bottom: 0.5rem;
          transition: var(--transition-bounce);
        }

        .avatar-select-card:hover .avatar-select-emoji {
          transform: scale(1.15) rotate(5deg);
        }

        .avatar-select-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .avatar-select-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-align: center;
          margin-top: 0.25rem;
        }

        .color-selectors-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .color-pill-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-full);
          border: 2px solid var(--border-color);
          border-bottom: 4px solid var(--border-color);
          background-color: #FFFFFF;
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .color-pill-btn:hover {
          transform: translateY(-2px);
        }

        .color-pill-btn.active {
          border-color: var(--color-tint);
          border-bottom-color: var(--color-tint);
          background-color: #FFFFFF;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }

        .color-swatch-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,0.06);
        }

        .location-cards-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .setting-select-card {
          padding: 1.5rem;
          border-radius: var(--radius-md);
          border: 2px solid var(--border-color);
          border-bottom: 5px solid var(--border-color);
          background-color: #FFFFFF;
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--text-primary);
          text-align: center;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .setting-select-card:hover {
          transform: translateY(-3px);
          border-color: var(--text-secondary);
        }

        .setting-select-card.active {
          background-color: var(--sky-light);
          border-color: var(--sky);
          border-bottom-color: var(--sky);
          transform: translateY(-5px);
          box-shadow: var(--shadow-glow-sky);
        }

        /* Parents / Teachers custom styling overrides */
        .style-section {
          margin-bottom: 2.5rem;
          background-color: #FFFFFF;
          border: 2px solid var(--border-color);
          padding: 2.25rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .style-section-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          border-bottom: 2px solid var(--bg-color);
          padding-bottom: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .form-control {
          font-size: 1rem;
          font-weight: 700;
          padding: 0.75rem 1.25rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-sm);
          background-color: var(--bg-color);
          transition: var(--transition-fast);
          width: 100%;
        }

        .form-control:focus {
          background-color: #FFFFFF;
          border-color: var(--coral);
          outline: none;
        }

        /* Required star styling */
        .required-star {
          color: var(--coral);
          font-weight: 800;
        }

        .helper-text {
          display: block;
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 0.4rem;
          font-style: italic;
        }

        .compact-grid {
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
        }

        .page-vocab-section {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-warm);
          border-radius: 12px;
          border: 1.5px dashed var(--coral);
        }

        .vocab-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--coral);
          margin-bottom: 0.4rem;
        }

        .vocab-entry {
          font-size: 0.82rem;
          margin-top: 0.25rem;
          color: var(--text-secondary);
        }

        .vocab-entry strong {
          color: var(--text-primary);
          text-transform: capitalize;
        }

        .page-count-selector {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .page-count-btn {
          padding: 0.6rem 1.4rem;
          border-radius: 50px;
          border: 2px solid var(--border-color);
          border-bottom: 4px solid var(--border-color);
          background: white;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .page-count-btn:hover {
          transform: translateY(-2px);
        }

        .page-count-btn.active {
          background: linear-gradient(135deg, var(--coral), var(--pink));
          color: white;
          border-color: transparent;
          box-shadow: var(--shadow-glow-coral);
          transform: translateY(-4px);
        }

        /* Step 3: Glowing Magic Orb Loader */
        .step-3-panel {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 450px;
        }

        .gen-center-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 540px;
          background-color: #FFFFFF;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 3rem 2.5rem;
          box-shadow: var(--shadow-md);
        }

        .gen-magic-orb {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B6B, #A78BFA, #6BCBF5);
          background-size: 200% 200%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px rgba(167, 139, 250, 0.35);
          animation: float 4s ease-in-out infinite, gradientShift 3s ease infinite;
        }

        .gen-magic-icon {
          font-size: 3rem;
          color: #FFFFFF;
        }

        .gen-magic-icon.spinning {
          animation: spin 4s linear infinite;
        }

        .gen-magic-icon.done {
          animation: none;
        }

        .gen-title {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }

        .gen-progress-bar-track {
          width: 100%;
          height: 12px;
          background-color: var(--bg-color);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 0.75rem;
          border: 2px solid var(--border-color);
        }

        .gen-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--coral), var(--purple), var(--sky));
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        .gen-progress-pct {
          font-weight: 800;
          font-size: 1rem;
          color: var(--coral);
          margin-bottom: 2rem;
          font-family: var(--font-display);
        }

        .gen-messages-feed {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          width: 100%;
          max-height: 150px;
          overflow-y: auto;
          padding: 0.5rem;
          background-color: var(--bg-color);
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-color);
        }

        .gen-message-item {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-secondary);
          padding: 0.25rem 0.5rem;
          animation: fadeInUp 0.3s ease-out forwards;
        }

        /* Step 4: Premium Storybook Layout Preview */
        .preview-pages {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .preview-page-card {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 0;
          background-color: #FFFFFF;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }

        .preview-page-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-4px);
        }

        .preview-page-illustration {
          position: relative;
          background-color: var(--bg-warm);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.75rem;
          border-right: 2px solid var(--border-color);
        }

        .page-number-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--coral);
          background-color: var(--coral-light);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-sm);
        }

        .preview-page-text-area {
          padding: 2.5rem;
          display: flex;
          align-items: center;
          background-color: #FFFFFF;
          position: relative;
        }

        .page-text {
          font-size: 1.15rem;
          line-height: 1.65;
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition-fast);
          padding: 1rem;
          border-radius: var(--radius-sm);
          border: 2.5px dashed transparent;
          font-weight: 600;
        }

        .page-text:hover {
          border-color: var(--coral);
          background-color: var(--coral-light);
          color: var(--text-primary);
        }

        .page-edit-textarea {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1.6;
        }

        .edit-mode {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* Nav Buttons */
        .creator-nav-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          border-top: 2px solid var(--border-color);
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          position: sticky;
          bottom: 0;
          z-index: 100;
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .creator-header {
            padding: 1rem 1.5rem;
            flex-direction: column;
            gap: 1rem;
          }
          .step-content-wrapper {
            padding: 1.5rem 1rem;
          }
          .stepper-label {
            display: none;
          }
          .stepper-line {
            width: 40px;
          }
          .preview-page-card {
            grid-template-columns: 1fr;
          }
          .preview-page-illustration {
            border-right: none;
            border-bottom: 2px solid var(--border-color);
          }
          .creator-nav-buttons {
            padding: 1.25rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
