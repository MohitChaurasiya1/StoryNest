import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import axios from 'axios';

import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaBookOpen,
  FaMagic,
  FaChild,
  FaKeyboard,
  FaSmile,
  FaHeart,
  FaUserFriends,
  FaStar,
  FaBolt,
} from 'react-icons/fa';


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000/api';


export default function StoryCreator() {
  const navigate = useNavigate();

  const requestStartedRef = useRef(false);
  const loadingTimerRef = useRef(null);

  const [step, setStep] = useState(1);
  const [builderMode, setBuilderMode] = useState('child');

  // ---------------------------------------------------------
  // Step 1: Child information
  // ---------------------------------------------------------

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('boy');
  const [familyDetails, setFamilyDetails] = useState('');
  const [favoriteThings, setFavoriteThings] = useState('');
  const [specialInterests, setSpecialInterests] = useState('');

  // ---------------------------------------------------------
  // Step 2: Kids mode
  // ---------------------------------------------------------

  const [heroAnimal, setHeroAnimal] = useState('lion');
  const [heroJob, setHeroJob] = useState('astronaut');
  const [heroColor, setHeroColor] = useState('gold');
  const [setting, setSetting] = useState('space');
  const [companion, setCompanion] = useState('funny-robot');
  const [storyMood, setStoryMood] = useState('happy');
  const [magicPower, setMagicPower] = useState('fly');
  const [storyEnding, setStoryEnding] = useState('happy');

  // ---------------------------------------------------------
  // Step 2: Parent / Teacher mode
  // ---------------------------------------------------------

  const [moral, setMoral] = useState('kindness');
  const [vocabTheme, setVocabTheme] = useState('science');
  const [language, setLanguage] = useState('bilingual');
  const [storyLength, setStoryLength] = useState('medium');

  const [
    encouragedBehavior,
    setEncouragedBehavior,
  ] = useState('');

  const [sidekick, setSidekick] = useState('wise-owl');
  const [magicObject, setMagicObject] = useState('secret-map');
  const [artStyle, setArtStyle] = useState('watercolor');
  const [tone, setTone] = useState('whimsical');
  const [grade, setGrade] = useState('grade-2');
  const [pronoun, setPronoun] = useState('he');
  const [rival, setRival] = useState('none');
  const [numPages, setNumPages] = useState('5');

  const [
    readingDifficulty,
    setReadingDifficulty,
  ] = useState('medium');

  const [
    culturalElements,
    setCulturalElements,
  ] = useState('mixed');

  const [bedtimeSafe, setBedtimeSafe] = useState('yes');

  // ---------------------------------------------------------
  // Gemini generation state
  // ---------------------------------------------------------

  const [genProgress, setGenProgress] = useState(0);
  const [genMessages, setGenMessages] = useState([]);
  const [genDone, setGenDone] = useState(false);
  const [genError, setGenError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [
    generatedStoryId,
    setGeneratedStoryId,
  ] = useState(null);

  const [generatedBy, setGeneratedBy] = useState('');

  // ---------------------------------------------------------
  // Generated preview pages
  // ---------------------------------------------------------

  const [pages, setPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null);

  const [draftEnglish, setDraftEnglish] = useState('');
  const [draftHindi, setDraftHindi] = useState('');

  // ---------------------------------------------------------
  // Form options
  // ---------------------------------------------------------

  const genders = [
    {
      id: 'boy',
      label: '👦 Boy',
      desc: 'He / Him',
    },
    {
      id: 'girl',
      label: '👧 Girl',
      desc: 'She / Her',
    },
  ];

  const animals = [
    {
      id: 'lion',
      label: 'Lion 🦁',
      desc: 'Brave & Roaring',
    },
    {
      id: 'bear',
      label: 'Bear 🐻',
      desc: 'Cozy & Friendly',
    },
    {
      id: 'fox',
      label: 'Fox 🦊',
      desc: 'Smart & Clever',
    },
    {
      id: 'unicorn',
      label: 'Unicorn 🦄',
      desc: 'Sweet & Magic',
    },
    {
      id: 'frog',
      label: 'Frog 🐸',
      desc: 'Happy & Bouncy',
    },
    {
      id: 'rabbit',
      label: 'Rabbit 🐰',
      desc: 'Fast & Playful',
    },
    {
      id: 'owl',
      label: 'Owl 🦉',
      desc: 'Wise & Gentle',
    },
    {
      id: 'dragon',
      label: 'Dragon 🐉',
      desc: 'Fierce & Loyal',
    },
  ];

  const jobs = [
    {
      id: 'astronaut',
      label: 'Astronaut 🚀',
      desc: 'Explores stars',
    },
    {
      id: 'wizard',
      label: 'Wizard 🪄',
      desc: 'Casts fun spells',
    },
    {
      id: 'explorer',
      label: 'Explorer 🧭',
      desc: 'Finds lost paths',
    },
    {
      id: 'superhero',
      label: 'Superhero 🦸',
      desc: 'Helps everyone',
    },
    {
      id: 'chef',
      label: 'Master Chef 🧑‍🍳',
      desc: 'Bakes yummy cookies',
    },
    {
      id: 'detective',
      label: 'Detective 🔍',
      desc: 'Solves mysteries',
    },
  ];

  const settingsData = [
    {
      id: 'space',
      label: 'Cosmic Space 🌌',
    },
    {
      id: 'forest',
      label: 'Whispering Forest 🌲',
    },
    {
      id: 'candyland',
      label: 'Sweet Candy Land 🍬',
    },
    {
      id: 'sea',
      label: 'Deep Blue Sea 🌊',
    },
    {
      id: 'castle',
      label: 'Magic Castle 🏰',
    },
    {
      id: 'volcano',
      label: 'Fire Volcano 🌋',
    },
  ];

  const companions = [
    {
      id: 'funny-robot',
      label: 'Funny Robot 🤖',
    },
    {
      id: 'playful-puppy',
      label: 'Playful Puppy 🐶',
    },
    {
      id: 'wise-fairy',
      label: 'Wise Fairy 🧚',
    },
    {
      id: 'cute-squirrel',
      label: 'Cute Squirrel 🐿️',
    },
    {
      id: 'baby-dragon',
      label: 'Baby Dragon 🐲',
    },
  ];

  const colors = [
    {
      id: 'gold',
      label: 'Gold 🟡',
      value: '#FFD93D',
    },
    {
      id: 'blue',
      label: 'Blue 🔵',
      value: '#6BCBF5',
    },
    {
      id: 'pink',
      label: 'Pink 🌸',
      value: '#F472B6',
    },
    {
      id: 'green',
      label: 'Green 🟢',
      value: '#6BCB77',
    },
    {
      id: 'purple',
      label: 'Purple 🟣',
      value: '#A78BFA',
    },
  ];

  const moods = [
    {
      id: 'happy',
      label: '😊 Happy',
      desc: 'Bright & joyful',
    },
    {
      id: 'silly',
      label: '🤪 Silly',
      desc: 'Lots of giggles',
    },
    {
      id: 'mysterious',
      label: '🔮 Mysterious',
      desc: 'Full of secrets',
    },
    {
      id: 'exciting',
      label: '🎢 Exciting',
      desc: 'Heart-pounding',
    },
  ];

  const magicPowers = [
    {
      id: 'fly',
      label: '🦅 Fly',
      desc: 'Soar through skies',
    },
    {
      id: 'invisible',
      label: '👻 Invisible',
      desc: 'Disappear at will',
    },
    {
      id: 'time-travel',
      label: '⏰ Time Travel',
      desc: 'Visit past & future',
    },
    {
      id: 'talk-animals',
      label: '🐾 Talk to Animals',
      desc: 'Chat with critters',
    },
    {
      id: 'super-strength',
      label: '💪 Super Strength',
      desc: 'Lift anything',
    },
  ];

  const storyEndings = [
    {
      id: 'happy',
      label: '🌈 Happy Ending',
      desc: 'Everyone smiles',
    },
    {
      id: 'surprise',
      label: '🎁 Surprise Twist',
      desc: 'Unexpected turn',
    },
    {
      id: 'cliffhanger',
      label: '🧗 Cliffhanger',
      desc: 'To be continued...',
    },
    {
      id: 'lesson',
      label: '📚 Moral Lesson',
      desc: 'Learn something new',
    },
  ];

  // ---------------------------------------------------------
  // API payload
  // ---------------------------------------------------------

  const buildStoryPayload = useCallback(() => {
    return {
      childName: childName.trim() || 'Leo',

      childAge:
        Number.parseInt(childAge, 10) || 7,

      childGender,

      familyDetails:
        familyDetails.trim() || 'Family',

      favoriteThings:
        favoriteThings.trim() || 'adventures',

      specialInterests:
        specialInterests.trim(),

      builderMode,

      // Kids mode
      heroAnimal,
      heroJob,
      heroColor,
      setting,
      companion,
      storyMood,
      magicPower,
      storyEnding,

      // Parent / Teacher mode
      moral,
      vocabTheme,
      language,
      storyLength,

      encouragedBehavior:
        encouragedBehavior.trim(),

      sidekick,
      magicObject,
      artStyle,
      tone,
      grade,
      pronoun,
      rival,

      numPages:
        builderMode === 'custom'
          ? Number.parseInt(numPages, 10) || 5
          : 5,

      readingDifficulty,
      culturalElements,
      bedtimeSafe,
    };
  }, [
    childName,
    childAge,
    childGender,
    familyDetails,
    favoriteThings,
    specialInterests,
    builderMode,
    heroAnimal,
    heroJob,
    heroColor,
    setting,
    companion,
    storyMood,
    magicPower,
    storyEnding,
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
    numPages,
    readingDifficulty,
    culturalElements,
    bedtimeSafe,
  ]);

  // ---------------------------------------------------------
  // Loading messages
  // ---------------------------------------------------------

  const getLoadingMessages = useCallback(() => {
    return [
      `✨ Reading ${
        childName.trim() || 'the child'
      }'s profile...`,

      `🧒 Creating a personalized ${childGender} hero...`,

      `🧠 Setting reading difficulty to ${readingDifficulty}...`,

      `📖 Building a ${
        builderMode === 'child'
          ? storyMood
          : tone
      } story...`,

      `🧭 Creating the story world...`,

      `🤖 Sending story instructions to Gemini AI...`,

      `🌍 Generating English and Hindi pages...`,

      `🔑 Creating vocabulary blocks...`,

      `💾 Saving the story in PostgreSQL...`,

      `📘 Preparing your Storybook...`,
    ];
  }, [
    childName,
    childGender,
    readingDifficulty,
    builderMode,
    storyMood,
    tone,
  ]);

  // ---------------------------------------------------------
  // Stop loading animation
  // ---------------------------------------------------------

  const stopLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, []);

  // ---------------------------------------------------------
  // Start loading animation
  // ---------------------------------------------------------

  const startLoadingAnimation = useCallback(() => {
    stopLoadingTimer();

    setGenProgress(4);
    setGenMessages([]);

    const loadingMessages = getLoadingMessages();
    let messageIndex = 0;

    setGenMessages([loadingMessages[0]]);
    messageIndex = 1;

    loadingTimerRef.current = setInterval(() => {
      setGenProgress((currentProgress) => {
        if (currentProgress >= 94) {
          return 94;
        }

        const increment =
          Math.floor(Math.random() * 8) + 3;

        return Math.min(
          currentProgress + increment,
          94,
        );
      });

      if (messageIndex < loadingMessages.length) {
        setGenMessages((currentMessages) => [
          ...currentMessages,
          loadingMessages[messageIndex],
        ]);

        messageIndex += 1;
      }
    }, 900);
  }, [
    getLoadingMessages,
    stopLoadingTimer,
  ]);

  // ---------------------------------------------------------
  // Generate story using Django + Gemini
  // ---------------------------------------------------------

  const generateStory = useCallback(async () => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setGenDone(false);
    setGenError('');
    setGeneratedBy('');
    setGeneratedStoryId(null);
    setPages([]);
    setEditingPage(null);

    startLoadingAnimation();

    try {
      const payload = buildStoryPayload();

      const response = await axios.post(
        `${API_BASE_URL}/stories/generate/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        },
      );

      const responseData = response.data;

      if (
        responseData?.generated_by !== 'gemini'
      ) {
        throw new Error(
          'Story was not generated by Gemini AI.',
        );
      }

      if (
        !responseData?.id ||
        !Array.isArray(responseData?.pages) ||
        responseData.pages.length === 0
      ) {
        throw new Error(
          'Backend returned incomplete story data.',
        );
      }

      stopLoadingTimer();

      setGenProgress(100);

      setGenMessages((currentMessages) => [
        ...currentMessages,
        '✅ Gemini AI generated the story successfully!',
        '✅ Story saved successfully in the database!',
      ]);

      setPages(responseData.pages);
      setGeneratedStoryId(responseData.id);
      setGeneratedBy(responseData.generated_by);
      setGenDone(true);
    } catch (error) {
      stopLoadingTimer();

      console.error(
        'Story generation failed:',
        error,
      );

      let errorMessage =
        'Gemini story generation failed. Please try again.';

      if (error.code === 'ECONNABORTED') {
        errorMessage =
          'The request took too long. Gemini may still be processing. Please try again.';
      } else if (!error.response) {
        errorMessage =
          'Cannot connect to Django backend. Make sure the backend server is running on port 8000.';
      } else if (
        error.response?.data?.details
      ) {
        errorMessage =
          error.response.data.details;
      } else if (
        error.response?.data?.error
      ) {
        errorMessage =
          error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setGenProgress(0);
      setGenDone(false);
      setGenError(errorMessage);

      setGenMessages((currentMessages) => [
        ...currentMessages,
        `❌ ${errorMessage}`,
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [
    isGenerating,
    startLoadingAnimation,
    stopLoadingTimer,
    buildStoryPayload,
  ]);

  // ---------------------------------------------------------
  // Generate automatically after entering Step 3
  // ---------------------------------------------------------

  useEffect(() => {
    if (
      step === 3 &&
      !requestStartedRef.current
    ) {
      requestStartedRef.current = true;
      generateStory();
    }
  }, [
    step,
    generateStory,
  ]);

  // ---------------------------------------------------------
  // Timer cleanup
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      stopLoadingTimer();
    };
  }, [stopLoadingTimer]);

  // ---------------------------------------------------------
  // Retry Gemini generation
  // ---------------------------------------------------------

  const handleRetryGeneration = () => {
    requestStartedRef.current = true;
    generateStory();
  };

  // ---------------------------------------------------------
  // Reset generated story when going back
  // ---------------------------------------------------------

  const resetGeneratedStory = () => {
    stopLoadingTimer();

    requestStartedRef.current = false;

    setGenProgress(0);
    setGenMessages([]);
    setGenDone(false);
    setGenError('');
    setIsGenerating(false);
    setGeneratedStoryId(null);
    setGeneratedBy('');
    setPages([]);
    setEditingPage(null);
  };

  // ---------------------------------------------------------
  // Step navigation
  // ---------------------------------------------------------

  const handleContinue = () => {
    if (step === 1 && !canProceed()) {
      return;
    }

    if (step === 2) {
      resetGeneratedStory();
      setStep(3);
      return;
    }

    setStep((currentStep) =>
      Math.min(currentStep + 1, 4),
    );
  };

  const handleBack = () => {
    if (step === 4) {
      setStep(3);
      return;
    }

    if (step === 3) {
      resetGeneratedStory();
      setStep(2);
      return;
    }

    setStep((currentStep) =>
      Math.max(currentStep - 1, 1),
    );
  };

  const handleOpenReader = () => {
    if (!generatedStoryId) {
      setGenError(
        'Story ID is missing. Please generate the story again.',
      );
      return;
    }

    navigate(`/story/${generatedStoryId}`);
  };

  // ---------------------------------------------------------
  // Page editing
  // These preview edits are frontend-only until an update API
  // is connected.
  // ---------------------------------------------------------

  const startEditingPage = (index) => {
    setEditingPage(index);

    setDraftEnglish(
      pages[index]?.text_en || '',
    );

    setDraftHindi(
      pages[index]?.text_hi || '',
    );
  };

  const cancelEditingPage = () => {
    setEditingPage(null);
    setDraftEnglish('');
    setDraftHindi('');
  };

  const savePageEdit = (index) => {
    setPages((currentPages) => {
      return currentPages.map((page, pageIndex) => {
        if (pageIndex !== index) {
          return page;
        }

        return {
          ...page,
          text_en: draftEnglish.trim(),
          text_hi: draftHindi.trim(),
        };
      });
    });

    cancelEditingPage();
  };

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------

  const canProceed = () => {
    if (step !== 1) {
      return true;
    }

    const parsedAge =
      Number.parseInt(childAge, 10);

    return (
      childName.trim().length > 0 &&
      Number.isInteger(parsedAge) &&
      parsedAge >= 3 &&
      parsedAge <= 14
    );
  };

  const getLanguageLabel = () => {
    if (language === 'en') {
      return 'English';
    }

    if (language === 'hi') {
      return 'English + Hindi';
    }

    return 'English + Hindi';
  };

  // PART 2 WILL START FROM THE return STATEMENT

    return (
    <div className="creator-container animate-fade-in">
      {/* Header */}
      <header className="creator-header">
        <Link to="/" className="creator-back-link">
          <FaArrowLeft />
          Back to Home
        </Link>

        <div className="creator-logo">
          <FaMagic
            style={{
              color: 'var(--coral)',
            }}
          />

          <span className="serif-heading">
            StoryNest Creator
          </span>
        </div>

        <div className="mode-toggle-pill">
          <button
            type="button"
            className={`mode-btn ${
              builderMode === 'child'
                ? 'active'
                : ''
            }`}
            onClick={() => {
              if (step <= 2) {
                setBuilderMode('child');
              }
            }}
            disabled={step > 2}
          >
            <FaChild />
            Kids Mode
          </button>

          <button
            type="button"
            className={`mode-btn ${
              builderMode === 'custom'
                ? 'active'
                : ''
            }`}
            onClick={() => {
              if (step <= 2) {
                setBuilderMode('custom');
              }
            }}
            disabled={step > 2}
          >
            <FaKeyboard />
            Parents / Teachers
          </button>
        </div>
      </header>

      {/* Stepper */}
      <div className="stepper-bar">
        {[
          {
            num: 1,
            label: 'About the Child',
          },
          {
            num: 2,
            label: 'Story Options',
          },
          {
            num: 3,
            label: 'AI Generation',
          },
          {
            num: 4,
            label: 'Preview',
          },
        ].map((stepItem, index) => (
          <div
            key={stepItem.num}
            className={`stepper-item ${
              step === stepItem.num
                ? 'active'
                : ''
            } ${
              step > stepItem.num
                ? 'done'
                : ''
            }`}
          >
            <div className="stepper-circle">
              {step > stepItem.num ? (
                <FaCheckCircle />
              ) : (
                stepItem.num
              )}
            </div>

            <span className="stepper-label">
              {stepItem.label}
            </span>

            {index < 3 && (
              <div
                className={`stepper-line ${
                  step > stepItem.num
                    ? 'filled'
                    : ''
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <main className="step-content-wrapper">
        {/* Step 1 */}
        {step === 1 && (
          <section className="step-panel">
            <div className="step-heading-group">
              <span className="kid-badge">
                🧒 STEP 1: ABOUT THE CHILD
              </span>

              <h2>
                Let&apos;s personalize the story
              </h2>

              <p>
                Enter the child&apos;s details so
                Gemini can create a personalized
                story.
              </p>
            </div>

            <div className="child-builder-workspace">
              <div className="question-block">
                <label className="question-title">
                  <FaSmile
                    style={{
                      marginRight: '8px',
                      color: 'var(--coral)',
                    }}
                  />

                  Child&apos;s name

                  <span className="required-star">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  className="form-control name-input"
                  placeholder="Example: Mohit, Emma, Leo"
                  value={childName}
                  maxLength={50}
                  onChange={(event) =>
                    setChildName(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="question-block">
                <label className="question-title">
                  <FaChild
                    style={{
                      marginRight: '8px',
                      color: 'var(--sky)',
                    }}
                  />

                  Child&apos;s age

                  <span className="required-star">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  className="form-control name-input"
                  placeholder="Example: 7"
                  min="3"
                  max="14"
                  value={childAge}
                  onChange={(event) =>
                    setChildAge(
                      event.target.value,
                    )
                  }
                />

                <span className="helper-text">
                  Age must be between 3 and 14
                  years.
                </span>
              </div>

              <div className="question-block">
                <label className="question-title">
                  <FaStar
                    style={{
                      marginRight: '8px',
                      color: 'var(--orange)',
                    }}
                  />

                  Child&apos;s gender
                </label>

                <div className="avatar-grid-select compact-grid">
                  {genders.map((gender) => (
                    <button
                      key={gender.id}
                      type="button"
                      className={`avatar-select-card ${
                        childGender === gender.id
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setChildGender(gender.id)
                      }
                    >
                      <span className="avatar-select-emoji">
                        {
                          gender.label.split(
                            ' ',
                          )[0]
                        }
                      </span>

                      <span className="avatar-select-name">
                        {
                          gender.label.split(
                            ' ',
                          )[1]
                        }
                      </span>

                      <span className="avatar-select-desc">
                        {gender.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="question-block">
                <label className="question-title">
                  <FaUserFriends
                    style={{
                      marginRight: '8px',
                      color: 'var(--purple)',
                    }}
                  />

                  Family details
                </label>

                <input
                  type="text"
                  className="form-control name-input"
                  placeholder="Example: Mom, Dad and sister Mira"
                  value={familyDetails}
                  maxLength={200}
                  onChange={(event) =>
                    setFamilyDetails(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="question-block">
                <label className="question-title">
                  <FaHeart
                    style={{
                      marginRight: '8px',
                      color: 'var(--pink)',
                    }}
                  />

                  Favourite things
                </label>

                <input
                  type="text"
                  className="form-control name-input"
                  placeholder="Example: dinosaurs, mangoes and trains"
                  value={favoriteThings}
                  maxLength={200}
                  onChange={(event) =>
                    setFavoriteThings(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="question-block">
                <label className="question-title">
                  <FaBolt
                    style={{
                      marginRight: '8px',
                      color: 'var(--mint)',
                    }}
                  />

                  Special interests or fears
                </label>

                <input
                  type="text"
                  className="form-control name-input"
                  placeholder="Example: loves space but is scared of thunder"
                  value={specialInterests}
                  maxLength={250}
                  onChange={(event) =>
                    setSpecialInterests(
                      event.target.value,
                    )
                  }
                />

                <span className="helper-text">
                  This field is optional. Gemini
                  can use interests and avoid scary
                  triggers.
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Kids Mode */}
        {step === 2 &&
          builderMode === 'child' && (
            <section className="step-panel">
              <div className="step-heading-group">
                <span className="kid-badge">
                  🧒 KIDS MODE
                </span>

                <h2>
                  Build a fun adventure
                </h2>

                <p>
                  Choose the hero, world, power
                  and ending.
                </p>
              </div>

              <div className="child-builder-workspace">
                <div className="question-block">
                  <label className="question-title">
                    1. Choose the main character
                  </label>

                  <div className="avatar-grid-select">
                    {animals.map((animal) => {
                      const parts =
                        animal.label.split(' ');

                      return (
                        <button
                          key={animal.id}
                          type="button"
                          className={`avatar-select-card ${
                            heroAnimal ===
                            animal.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            setHeroAnimal(
                              animal.id,
                            )
                          }
                        >
                          <span className="avatar-select-emoji">
                            {parts.at(-1)}
                          </span>

                          <span className="avatar-select-name">
                            {parts
                              .slice(0, -1)
                              .join(' ')}
                          </span>

                          <span className="avatar-select-desc">
                            {animal.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="question-block">
                  <label className="question-title">
                    2. Choose the hero&apos;s job
                  </label>

                  <div className="avatar-grid-select">
                    {jobs.map((job) => {
                      const parts =
                        job.label.split(' ');

                      return (
                        <button
                          key={job.id}
                          type="button"
                          className={`avatar-select-card ${
                            heroJob === job.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            setHeroJob(job.id)
                          }
                        >
                          <span className="avatar-select-emoji">
                            {parts.at(-1)}
                          </span>

                          <span className="avatar-select-name">
                            {parts
                              .slice(0, -1)
                              .join(' ')}
                          </span>

                          <span className="avatar-select-desc">
                            {job.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="question-block">
                  <label className="question-title">
                    3. Choose a magic colour
                  </label>

                  <div className="color-selectors-row">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        className={`color-pill-btn ${
                          heroColor === color.id
                            ? 'active'
                            : ''
                        }`}
                        style={{
                          '--color-tint':
                            color.value,
                        }}
                        onClick={() =>
                          setHeroColor(color.id)
                        }
                      >
                        <span
                          className="color-swatch-circle"
                          style={{
                            backgroundColor:
                              color.value,
                          }}
                        />

                        <span>{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="question-block">
                  <label className="question-title">
                    4. Choose the story world
                  </label>

                  <div className="location-cards-row">
                    {settingsData.map(
                      (storySetting) => (
                        <button
                          key={storySetting.id}
                          type="button"
                          className={`setting-select-card ${
                            setting ===
                            storySetting.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            setSetting(
                              storySetting.id,
                            )
                          }
                        >
                          {
                            storySetting.label
                          }
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="question-block">
                  <label className="question-title">
                    5. Choose a companion
                  </label>

                  <div className="location-cards-row">
                    {companions.map(
                      (companionItem) => (
                        <button
                          key={companionItem.id}
                          type="button"
                          className={`setting-select-card ${
                            companion ===
                            companionItem.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            setCompanion(
                              companionItem.id,
                            )
                          }
                        >
                          {
                            companionItem.label
                          }
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="question-block">
                  <label className="question-title">
                    6. Choose the story mood
                  </label>

                  <div className="avatar-grid-select compact-grid">
                    {moods.map((mood) => {
                      const parts =
                        mood.label.split(' ');

                      return (
                        <button
                          key={mood.id}
                          type="button"
                          className={`avatar-select-card ${
                            storyMood === mood.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            setStoryMood(mood.id)
                          }
                        >
                          <span className="avatar-select-emoji">
                            {parts[0]}
                          </span>

                          <span className="avatar-select-name">
                            {parts
                              .slice(1)
                              .join(' ')}
                          </span>

                          <span className="avatar-select-desc">
                            {mood.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="question-block">
                  <label className="question-title">
                    7. Choose a magic power
                  </label>

                  <div className="avatar-grid-select">
                    {magicPowers.map(
                      (power) => {
                        const parts =
                          power.label.split(' ');

                        return (
                          <button
                            key={power.id}
                            type="button"
                            className={`avatar-select-card ${
                              magicPower ===
                              power.id
                                ? 'active'
                                : ''
                            }`}
                            onClick={() =>
                              setMagicPower(
                                power.id,
                              )
                            }
                          >
                            <span className="avatar-select-emoji">
                              {parts[0]}
                            </span>

                            <span className="avatar-select-name">
                              {parts
                                .slice(1)
                                .join(' ')}
                            </span>

                            <span className="avatar-select-desc">
                              {power.desc}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="question-block">
                  <label className="question-title">
                    8. Choose the story ending
                  </label>

                  <div className="avatar-grid-select compact-grid">
                    {storyEndings.map(
                      (ending) => {
                        const parts =
                          ending.label.split(
                            ' ',
                          );

                        return (
                          <button
                            key={ending.id}
                            type="button"
                            className={`avatar-select-card ${
                              storyEnding ===
                              ending.id
                                ? 'active'
                                : ''
                            }`}
                            onClick={() =>
                              setStoryEnding(
                                ending.id,
                              )
                            }
                          >
                            <span className="avatar-select-emoji">
                              {parts[0]}
                            </span>

                            <span className="avatar-select-name">
                              {parts
                                .slice(1)
                                .join(' ')}
                            </span>

                            <span className="avatar-select-desc">
                              {ending.desc}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* Step 2: Parent / Teacher Mode */}
        {step === 2 &&
          builderMode === 'custom' && (
            <section className="step-panel">
              <div className="step-heading-group">
                <span className="kid-badge">
                  🛠️ PARENT & TEACHER MODE
                </span>

                <h2>
                  Customize the learning experience
                </h2>

                <p>
                  Configure language, education,
                  moral, characters and story
                  structure.
                </p>
              </div>

              <div className="child-builder-workspace">
                <div className="style-section">
                  <h3 className="style-section-title">
                    📚 Reading and learning
                  </h3>

                  <div className="form-group">
                    <label className="form-label">
                      Story language
                    </label>

                    <select
                      className="form-control"
                      value={language}
                      onChange={(event) =>
                        setLanguage(
                          event.target.value,
                        )
                      }
                    >
                      <option value="bilingual">
                        English + Hindi
                      </option>

                      <option value="en">
                        English only
                      </option>

                      <option value="hi">
                        Hindi + English
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Grade level
                    </label>

                    <select
                      className="form-control"
                      value={grade}
                      onChange={(event) =>
                        setGrade(
                          event.target.value,
                        )
                      }
                    >
                      <option value="grade-1">
                        Grade 1 — Ages 5–6
                      </option>

                      <option value="grade-2">
                        Grade 2 — Ages 7–8
                      </option>

                      <option value="grade-3">
                        Grade 3 — Ages 8–9
                      </option>

                      <option value="grade-4">
                        Grade 4 — Ages 9–10
                      </option>

                      <option value="grade-5">
                        Grade 5 — Ages 10–12
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Vocabulary theme
                    </label>

                    <select
                      className="form-control"
                      value={vocabTheme}
                      onChange={(event) =>
                        setVocabTheme(
                          event.target.value,
                        )
                      }
                    >
                      <option value="science">
                        Science and space
                      </option>

                      <option value="nature">
                        Nature and animals
                      </option>

                      <option value="emotions">
                        Emotions and social skills
                      </option>

                      <option value="everyday">
                        Everyday objects and actions
                      </option>

                      <option value="math">
                        Maths and numbers
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Reading difficulty
                    </label>

                    <select
                      className="form-control"
                      value={readingDifficulty}
                      onChange={(event) =>
                        setReadingDifficulty(
                          event.target.value,
                        )
                      }
                    >
                      <option value="easy">
                        Easy — Short and simple
                        sentences
                      </option>

                      <option value="medium">
                        Medium — Balanced vocabulary
                      </option>

                      <option value="hard">
                        Hard — Longer sentences and
                        advanced words
                      </option>
                    </select>
                  </div>
                </div>

                <div className="style-section">
                  <h3 className="style-section-title">
                    🌟 Moral and behaviour
                  </h3>

                  <div className="form-group">
                    <label className="form-label">
                      Core moral
                    </label>

                    <select
                      className="form-control"
                      value={moral}
                      onChange={(event) =>
                        setMoral(
                          event.target.value,
                        )
                      }
                    >
                      <option value="kindness">
                        Kindness and helping others
                      </option>

                      <option value="sharing">
                        Sharing and collaboration
                      </option>

                      <option value="persistence">
                        Persistence and never giving
                        up
                      </option>

                      <option value="honesty">
                        Honesty and integrity
                      </option>

                      <option value="empathy">
                        Empathy and understanding
                        feelings
                      </option>

                      <option value="gratitude">
                        Gratitude and thankfulness
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Habit to encourage
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Example: brushing teeth or sharing toys"
                      value={encouragedBehavior}
                      maxLength={200}
                      onChange={(event) =>
                        setEncouragedBehavior(
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Bedtime safe
                    </label>

                    <select
                      className="form-control"
                      value={bedtimeSafe}
                      onChange={(event) =>
                        setBedtimeSafe(
                          event.target.value,
                        )
                      }
                    >
                      <option value="yes">
                        Yes — Calm and non-scary
                      </option>

                      <option value="no">
                        Mild suspense is allowed
                      </option>
                    </select>
                  </div>
                </div>

                <div className="style-section">
                  <h3 className="style-section-title">
                    🔮 Characters and adventure
                  </h3>

                  <div className="form-group">
                    <label className="form-label">
                      Sidekick
                    </label>

                    <select
                      className="form-control"
                      value={sidekick}
                      onChange={(event) =>
                        setSidekick(
                          event.target.value,
                        )
                      }
                    >
                      <option value="wise-owl">
                        Wise owl
                      </option>

                      <option value="helpful-robot">
                        Helpful robot
                      </option>

                      <option value="bouncy-pup">
                        Playful puppy
                      </option>

                      <option value="magical-fairy">
                        Magical fairy
                      </option>

                      <option value="baby-dragon">
                        Baby dragon
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Magic object
                    </label>

                    <select
                      className="form-control"
                      value={magicObject}
                      onChange={(event) =>
                        setMagicObject(
                          event.target.value,
                        )
                      }
                    >
                      <option value="secret-map">
                        Secret glowing map
                      </option>

                      <option value="talking-key">
                        Talking magic key
                      </option>

                      <option value="truth-compass">
                        Truth compass
                      </option>

                      <option value="magic-wand">
                        Magic wand
                      </option>

                      <option value="enchanted-book">
                        Enchanted book
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Rival
                    </label>

                    <select
                      className="form-control"
                      value={rival}
                      onChange={(event) =>
                        setRival(
                          event.target.value,
                        )
                      }
                    >
                      <option value="none">
                        No rival
                      </option>

                      <option value="silly-shadow">
                        Silly shadow
                      </option>

                      <option value="greedy-goblin">
                        Greedy goblin
                      </option>

                      <option value="mischief-monkey">
                        Mischievous monkey
                      </option>
                    </select>
                  </div>
                </div>

                <div className="style-section">
                  <h3 className="style-section-title">
                    🎨 Art and tone
                  </h3>

                  <div className="form-group">
                    <label className="form-label">
                      Illustration style
                    </label>

                    <select
                      className="form-control"
                      value={artStyle}
                      onChange={(event) =>
                        setArtStyle(
                          event.target.value,
                        )
                      }
                    >
                      <option value="watercolor">
                        Watercolour storybook
                      </option>

                      <option value="claymation">
                        Cozy claymation
                      </option>

                      <option value="pixel-art">
                        Pixel art
                      </option>

                      <option value="sketch">
                        Pencil sketch
                      </option>

                      <option value="anime">
                        Anime style
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Narrative tone
                    </label>

                    <select
                      className="form-control"
                      value={tone}
                      onChange={(event) =>
                        setTone(
                          event.target.value,
                        )
                      }
                    >
                      <option value="whimsical">
                        Whimsical and magical
                      </option>

                      <option value="cozy">
                        Cozy and calm
                      </option>

                      <option value="adventurous">
                        Adventurous and exciting
                      </option>

                      <option value="funny">
                        Funny and silly
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Pronouns
                    </label>

                    <select
                      className="form-control"
                      value={pronoun}
                      onChange={(event) =>
                        setPronoun(
                          event.target.value,
                        )
                      }
                    >
                      <option value="he">
                        He / Him
                      </option>

                      <option value="she">
                        She / Her
                      </option>

                      <option value="they">
                        They / Them
                      </option>
                    </select>
                  </div>
                </div>

                <div className="style-section">
                  <h3 className="style-section-title">
                    📐 Story structure
                  </h3>

                  <div className="form-group">
                    <label className="form-label">
                      Number of pages
                    </label>

                    <div className="page-count-selector">
                      {[
                        '3',
                        '5',
                        '8',
                        '10',
                      ].map((pageCount) => (
                        <button
                          key={pageCount}
                          type="button"
                          className={`page-count-btn ${
                            numPages ===
                            pageCount
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            setNumPages(
                              pageCount,
                            )
                          }
                        >
                          {pageCount} pages
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Words per page
                    </label>

                    <select
                      className="form-control"
                      value={storyLength}
                      onChange={(event) =>
                        setStoryLength(
                          event.target.value,
                        )
                      }
                    >
                      <option value="short">
                        Short — 30 to 50 words
                      </option>

                      <option value="medium">
                        Medium — 50 to 80 words
                      </option>

                      <option value="long">
                        Long — 80 to 120 words
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Cultural inspiration
                    </label>

                    <select
                      className="form-control"
                      value={culturalElements}
                      onChange={(event) =>
                        setCulturalElements(
                          event.target.value,
                        )
                      }
                    >
                      <option value="mixed">
                        Mixed / Universal
                      </option>

                      <option value="indian">
                        Indian
                      </option>

                      <option value="western">
                        Western
                      </option>

                      <option value="japanese">
                        Japanese
                      </option>

                      <option value="african">
                        African
                      </option>

                      <option value="latin-american">
                        Latin American
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* PART 3 WILL START HERE */}

                {/* Step 3: Gemini Generation */}
        {step === 3 && (
          <section className="step-panel step-3-panel">
            <div className="gen-center-wrapper">
              <div
                className={`gen-magic-orb ${
                  genError ? 'error' : ''
                }`}
              >
                <FaMagic
                  className={`gen-magic-icon ${
                    genDone
                      ? 'done'
                      : isGenerating
                        ? 'spinning'
                        : ''
                  }`}
                />
              </div>

              <h2 className="gen-title serif-heading">
                {genError
                  ? 'Story Generation Failed'
                  : genDone
                    ? 'Your Storybook is Ready!'
                    : 'Gemini is Writing Your Story...'}
              </h2>

              {!genError && (
                <>
                  <div className="gen-progress-bar-track">
                    <div
                      className="gen-progress-bar-fill"
                      style={{
                        width: `${genProgress}%`,
                      }}
                    />
                  </div>

                  <span className="gen-progress-pct">
                    {Math.round(genProgress)}%
                  </span>
                </>
              )}

              {genError && (
                <div className="generation-error-box">
                  <strong>
                    Gemini API Error
                  </strong>

                  <p>{genError}</p>

                  <button
                    type="button"
                    className="btn btn-primary retry-btn"
                    onClick={handleRetryGeneration}
                    disabled={isGenerating}
                  >
                    <FaMagic />

                    {isGenerating
                      ? 'Trying Again...'
                      : 'Retry Gemini Generation'}
                  </button>
                </div>
              )}

              <div className="gen-messages-feed">
                {genMessages.map(
                  (message, index) => (
                    <div
                      key={`${message}-${index}`}
                      className="gen-message-item"
                    >
                      {message}
                    </div>
                  ),
                )}
              </div>

              {genDone &&
                generatedBy === 'gemini' && (
                  <div className="gemini-success-badge">
                    <FaCheckCircle />
                    Generated by Gemini AI
                  </div>
                )}
            </div>
          </section>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <section className="step-panel step-4-panel">
            <div className="step-heading-group">
              <FaBookOpen className="step-heading-icon" />

              <h2 className="serif-heading">
                Preview Your Storybook
              </h2>

              <p>
                Review the Gemini-generated pages
                before opening the story reader.
              </p>

              <div className="preview-meta-row">
                <span className="preview-meta-badge">
                  <FaMagic />
                  Gemini AI
                </span>

                <span className="preview-meta-badge">
                  <FaBookOpen />
                  {pages.length} pages
                </span>

                <span className="preview-meta-badge">
                  🌐 {getLanguageLabel()}
                </span>
              </div>
            </div>

            {pages.length === 0 ? (
              <div className="empty-preview-box">
                <FaBookOpen />

                <h3>
                  No story pages are available
                </h3>

                <p>
                  Return to the generation step and
                  create the story again.
                </p>
              </div>
            ) : (
              <div className="preview-pages">
                {pages.map((page, index) => {
                  const pageNumber =
                    page.page_number ||
                    index + 1;

                  const illustrationUrl =
                    page.illustration_url ||
                    page.image_url ||
                    page.illustration_image ||
                    '';

                  return (
                    <article
                      key={
                        page.id ||
                        `page-${pageNumber}`
                      }
                      className="preview-page-card"
                    >
                      <div className="preview-page-illustration">
                        <span className="page-number-badge">
                          Page {pageNumber}
                        </span>

                        {illustrationUrl ? (
                          <img
                            src={illustrationUrl}
                            alt={`Illustration for page ${pageNumber}`}
                            className="preview-illustration-image"
                          />
                        ) : (
                          <div className="illustration-placeholder">
                            <span className="illustration-placeholder-icon">
                              🎨
                            </span>

                            <p>
                              {page.illustration_prompt ||
                                'Gemini illustration prompt'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="preview-page-text-area">
                        {editingPage === index ? (
                          <div className="edit-mode">
                            <label className="edit-label">
                              English content
                            </label>

                            <textarea
                              className="form-control page-edit-textarea"
                              rows={6}
                              value={draftEnglish}
                              onChange={(event) =>
                                setDraftEnglish(
                                  event.target
                                    .value,
                                )
                              }
                            />

                            <label className="edit-label">
                              Hindi translation
                            </label>

                            <textarea
                              className="form-control page-edit-textarea"
                              rows={6}
                              value={draftHindi}
                              onChange={(event) =>
                                setDraftHindi(
                                  event.target
                                    .value,
                                )
                              }
                            />

                            <div className="edit-action-row">
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={
                                  cancelEditingPage
                                }
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() =>
                                  savePageEdit(index)
                                }
                                disabled={
                                  draftEnglish.trim()
                                    .length === 0
                                }
                              >
                                Save Preview Edit
                              </button>
                            </div>

                            <span className="helper-text">
                              These edits currently
                              update the frontend
                              preview only.
                            </span>
                          </div>
                        ) : (
                          <div className="page-content-wrapper">
                            <div className="language-block">
                              <span className="language-label">
                                English
                              </span>

                              <p className="page-text serif-heading">
                                {page.text_en ||
                                  'English text was not returned.'}
                              </p>
                            </div>

                            {page.text_hi && (
                              <div className="language-block hindi-block">
                                <span className="language-label">
                                  हिन्दी
                                </span>

                                <p className="page-text serif-heading">
                                  {page.text_hi}
                                </p>
                              </div>
                            )}

                            {page.dictionary &&
                              Object.keys(
                                page.dictionary,
                              ).length > 0 && (
                                <div className="page-vocab-section">
                                  <span className="vocab-badge">
                                    📖 Vocabulary
                                  </span>

                                  {Object.entries(
                                    page.dictionary,
                                  ).map(
                                    ([
                                      word,
                                      definition,
                                    ]) => (
                                      <div
                                        key={word}
                                        className="vocab-entry"
                                      >
                                        <strong>
                                          {word}:
                                        </strong>{' '}
                                        {definition}
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}

                            <button
                              type="button"
                              className="edit-page-btn"
                              onClick={() =>
                                startEditingPage(
                                  index,
                                )
                              }
                            >
                              Edit page text
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Navigation */}
      <div className="creator-nav-buttons">
        {step > 1 && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleBack}
            disabled={isGenerating}
          >
            <FaArrowLeft />
            Back
          </button>
        )}

        <div className="nav-spacer" />

        {step < 3 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={!canProceed()}
            title={
              !canProceed()
                ? 'Enter a valid name and age between 3 and 14'
                : ''
            }
          >
            Continue
            <FaArrowRight />
          </button>
        )}

        {step === 3 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStep(4)}
            disabled={
              !genDone ||
              Boolean(genError) ||
              pages.length === 0
            }
          >
            See Preview
            <FaArrowRight />
          </button>
        )}

        {step === 4 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenReader}
            disabled={!generatedStoryId}
          >
            <FaBookOpen />
            Open Reader
          </button>
        )}
      </div>

      <style>{`
        .creator-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-warm);
          position: relative;
          overflow-x: hidden;
        }

        .creator-container::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          top: -220px;
          right: -220px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(167, 139, 250, 0.16),
            transparent 70%
          );
          pointer-events: none;
        }

        .creator-container::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          left: -180px;
          bottom: -180px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(107, 203, 245, 0.13),
            transparent 70%
          );
          pointer-events: none;
        }

        .creator-header {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 3rem;
          border-bottom: 2px solid var(--border-color);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
        }

        .creator-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-weight: 700;
          transition: 0.2s ease;
        }

        .creator-back-link:hover {
          color: var(--coral);
          transform: translateX(-3px);
        }

        .creator-logo {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 1.45rem;
          font-weight: 800;
        }

        .mode-toggle-pill {
          display: flex;
          padding: 3px;
          border: 2px solid var(--border-color);
          border-radius: 999px;
          background: var(--bg-color);
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.1rem;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .mode-btn.active {
          color: white;
          background: linear-gradient(
            135deg,
            var(--coral),
            var(--pink)
          );
          box-shadow: var(--shadow-glow-coral);
        }

        .mode-btn:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .stepper-bar {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.6rem 2rem;
          border-bottom: 2px solid var(--border-color);
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(8px);
        }

        .stepper-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .stepper-circle {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid var(--border-color);
          border-radius: 50%;
          background: white;
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 800;
          transition: 0.25s ease;
        }

        .stepper-item.active .stepper-circle {
          color: white;
          border-color: var(--coral);
          background: linear-gradient(
            135deg,
            var(--coral),
            var(--pink)
          );
          transform: scale(1.08);
          box-shadow: var(--shadow-glow-coral);
        }

        .stepper-item.done .stepper-circle {
          color: var(--coral);
          border-color: var(--coral);
          background: var(--coral-light);
        }

        .stepper-label {
          color: var(--text-muted);
          font-size: 0.88rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .stepper-item.active .stepper-label {
          color: var(--coral);
        }

        .stepper-item.done .stepper-label {
          color: var(--text-primary);
        }

        .stepper-line {
          width: 70px;
          height: 3px;
          margin: 0 0.9rem;
          border-radius: 3px;
          background: var(--border-color);
        }

        .stepper-line.filled {
          background: linear-gradient(
            90deg,
            var(--coral),
            var(--pink)
          );
        }

        .step-content-wrapper {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 3rem 1.5rem;
        }

        .step-panel {
          width: 100%;
          max-width: 850px;
          animation: fadeInUp 0.45s ease forwards;
        }

        .step-heading-group {
          margin-bottom: 3rem;
          text-align: center;
        }

        .step-heading-group h2 {
          margin: 0 0 0.65rem;
          color: var(--text-primary);
          font-size: 2.2rem;
          font-weight: 800;
        }

        .step-heading-group p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 1.02rem;
          font-weight: 600;
        }

        .kid-badge {
          display: inline-block;
          margin-bottom: 0.8rem;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            var(--sunshine-light),
            var(--orange-light)
          );
          color: var(--orange);
          font-size: 0.74rem;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .step-heading-icon {
          display: block;
          margin: 0 auto 0.75rem;
          color: var(--coral);
          font-size: 2rem;
        }

        .child-builder-workspace {
          display: flex;
          flex-direction: column;
          gap: 2.2rem;
        }

        .question-block,
        .style-section {
          padding: 2.1rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          background: white;
          box-shadow: var(--shadow-sm);
        }

        .question-block {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .question-title {
          color: var(--text-primary);
          font-size: 1.18rem;
          font-weight: 800;
        }

        .required-star {
          margin-left: 0.3rem;
          color: var(--coral);
        }

        .helper-text {
          color: var(--text-muted);
          font-size: 0.78rem;
          font-style: italic;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          margin-bottom: 1.4rem;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          color: var(--text-primary);
          font-size: 0.94rem;
          font-weight: 800;
        }

        .form-control {
          width: 100%;
          padding: 0.8rem 1.15rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-color);
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 650;
          transition: 0.2s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--coral);
          background: white;
          box-shadow: var(--shadow-glow-coral);
        }

        .name-input {
          padding: 0.95rem 1.35rem;
          font-size: 1.12rem;
          font-weight: 700;
        }

        .style-section-title {
          margin: 0 0 1.5rem;
          padding-bottom: 0.65rem;
          border-bottom: 2px solid var(--bg-color);
          color: var(--text-primary);
          font-size: 1.15rem;
          font-weight: 800;
        }

        .avatar-grid-select {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(140px, 1fr)
          );
          gap: 1rem;
        }

        .compact-grid {
          grid-template-columns: repeat(
            auto-fill,
            minmax(130px, 1fr)
          );
        }

        .avatar-select-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.2rem;
          border: 2px solid var(--border-color);
          border-bottom-width: 5px;
          border-radius: var(--radius-md);
          background: white;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .avatar-select-card:hover {
          transform: translateY(-3px);
          border-color: var(--text-secondary);
        }

        .avatar-select-card.active {
          transform: translateY(-5px);
          border-color: var(--coral);
          background: var(--coral-light);
          box-shadow: var(--shadow-glow-coral);
        }

        .avatar-select-emoji {
          margin-bottom: 0.5rem;
          font-size: 2.6rem;
        }

        .avatar-select-name {
          color: var(--text-primary);
          font-size: 0.94rem;
          font-weight: 800;
          text-align: center;
        }

        .avatar-select-desc {
          margin-top: 0.25rem;
          color: var(--text-muted);
          font-size: 0.74rem;
          font-weight: 600;
          text-align: center;
        }

        .color-selectors-row,
        .page-count-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
        }

        .color-pill-btn,
        .page-count-btn {
          padding: 0.7rem 1.3rem;
          border: 2px solid var(--border-color);
          border-bottom-width: 4px;
          border-radius: 999px;
          background: white;
          color: var(--text-primary);
          font-size: 0.88rem;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .color-pill-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .color-pill-btn:hover,
        .page-count-btn:hover {
          transform: translateY(-2px);
        }

        .color-pill-btn.active {
          transform: translateY(-3px);
          border-color: var(--color-tint);
        }

        .page-count-btn.active {
          transform: translateY(-3px);
          border-color: transparent;
          color: white;
          background: linear-gradient(
            135deg,
            var(--coral),
            var(--pink)
          );
          box-shadow: var(--shadow-glow-coral);
        }

        .color-swatch-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .location-cards-row {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(190px, 1fr)
          );
          gap: 1rem;
        }

        .setting-select-card {
          padding: 1.35rem;
          border: 2px solid var(--border-color);
          border-bottom-width: 5px;
          border-radius: var(--radius-md);
          background: white;
          color: var(--text-primary);
          font-size: 0.93rem;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .setting-select-card:hover {
          transform: translateY(-3px);
        }

        .setting-select-card.active {
          transform: translateY(-4px);
          border-color: var(--sky);
          background: var(--sky-light);
          box-shadow: var(--shadow-glow-sky);
        }

        .step-3-panel {
          min-height: 470px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gen-center-wrapper {
          width: 100%;
          max-width: 570px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 2.5rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          background: white;
          text-align: center;
          box-shadow: var(--shadow-md);
        }

        .gen-magic-orb {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #ff6b6b,
            #a78bfa,
            #6bcbf5
          );
          background-size: 200% 200%;
          box-shadow:
            0 12px 40px rgba(167, 139, 250, 0.35);
          animation:
            float 4s ease-in-out infinite,
            gradientShift 3s ease infinite;
        }

        .gen-magic-orb.error {
          background: linear-gradient(
            135deg,
            #ef4444,
            #f97316
          );
        }

        .gen-magic-icon {
          color: white;
          font-size: 3rem;
        }

        .gen-magic-icon.spinning {
          animation: spin 3s linear infinite;
        }

        .gen-title {
          margin: 0 0 1.8rem;
          color: var(--text-primary);
          font-size: 1.8rem;
          font-weight: 800;
        }

        .gen-progress-bar-track {
          width: 100%;
          height: 13px;
          overflow: hidden;
          margin-bottom: 0.7rem;
          border: 2px solid var(--border-color);
          border-radius: 999px;
          background: var(--bg-color);
        }

        .gen-progress-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            var(--coral),
            var(--purple),
            var(--sky)
          );
          transition: width 0.3s ease;
        }

        .gen-progress-pct {
          margin-bottom: 1.7rem;
          color: var(--coral);
          font-size: 1rem;
          font-weight: 800;
        }

        .gen-messages-feed {
          width: 100%;
          max-height: 180px;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          overflow-y: auto;
          padding: 0.7rem;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-color);
        }

        .gen-message-item {
          padding: 0.3rem 0.5rem;
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 700;
          animation: fadeInUp 0.3s ease;
        }

        .generation-error-box {
          width: 100%;
          margin-bottom: 1.5rem;
          padding: 1.25rem;
          border: 2px solid #fecaca;
          border-radius: var(--radius-md);
          background: #fef2f2;
          color: #991b1b;
        }

        .generation-error-box strong {
          display: block;
          margin-bottom: 0.45rem;
          font-size: 1rem;
        }

        .generation-error-box p {
          margin: 0 0 1rem;
          line-height: 1.55;
        }

        .retry-btn {
          margin: 0 auto;
        }

        .gemini-success-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          margin-top: 1.25rem;
          padding: 0.55rem 1rem;
          border-radius: 999px;
          background: #ecfdf5;
          color: #047857;
          font-size: 0.85rem;
          font-weight: 800;
        }

        .preview-meta-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.7rem;
          margin-top: 1.2rem;
        }

        .preview-meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.8rem;
          border: 1.5px solid var(--border-color);
          border-radius: 999px;
          background: white;
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 800;
        }

        .preview-pages {
          display: flex;
          flex-direction: column;
          gap: 2.3rem;
        }

        .preview-page-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          background: white;
          box-shadow: var(--shadow-sm);
          transition: 0.25s ease;
        }

        .preview-page-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .preview-page-illustration {
          position: relative;
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          border-right: 2px solid var(--border-color);
          background: var(--bg-warm);
        }

        .page-number-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          z-index: 2;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          background: var(--coral-light);
          color: var(--coral);
          font-size: 0.74rem;
          font-weight: 800;
        }

        .preview-illustration-image {
          width: 100%;
          height: 100%;
          max-height: 420px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }

        .illustration-placeholder {
          max-width: 300px;
          text-align: center;
        }

        .illustration-placeholder-icon {
          display: block;
          margin-bottom: 0.8rem;
          font-size: 3.5rem;
        }

        .illustration-placeholder p {
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 700;
          line-height: 1.5;
        }

        .preview-page-text-area {
          display: flex;
          align-items: center;
          padding: 2rem;
          background: white;
        }

        .page-content-wrapper {
          width: 100%;
        }

        .language-block {
          margin-bottom: 1.2rem;
        }

        .hindi-block {
          padding-top: 1.1rem;
          border-top: 1.5px solid var(--border-color);
        }

        .language-label {
          display: inline-block;
          margin-bottom: 0.45rem;
          padding: 0.25rem 0.55rem;
          border-radius: 999px;
          background: var(--bg-color);
          color: var(--text-secondary);
          font-size: 0.68rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .page-text {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.08rem;
          font-weight: 600;
          line-height: 1.65;
          white-space: pre-wrap;
        }

        .page-vocab-section {
          margin-top: 1rem;
          padding: 0.85rem;
          border: 1.5px dashed var(--coral);
          border-radius: 12px;
          background: var(--bg-warm);
        }

        .vocab-badge {
          display: inline-block;
          margin-bottom: 0.4rem;
          color: var(--coral);
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .vocab-entry {
          margin-top: 0.3rem;
          color: var(--text-secondary);
          font-size: 0.82rem;
          line-height: 1.45;
        }

        .vocab-entry strong {
          color: var(--text-primary);
          text-transform: capitalize;
        }

        .edit-page-btn {
          margin-top: 1.2rem;
          padding: 0.55rem 0.9rem;
          border: 2px solid var(--border-color);
          border-radius: 999px;
          background: white;
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .edit-page-btn:hover {
          color: var(--coral);
          border-color: var(--coral);
          background: var(--coral-light);
        }

        .edit-mode {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .edit-label {
          color: var(--text-primary);
          font-size: 0.78rem;
          font-weight: 800;
        }

        .page-edit-textarea {
          resize: vertical;
          min-height: 130px;
          font-family: inherit;
          line-height: 1.55;
        }

        .edit-action-row {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 0.7rem;
          margin-top: 0.5rem;
        }

        .empty-preview-box {
          padding: 3rem 2rem;
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-lg);
          background: white;
          color: var(--text-secondary);
          text-align: center;
        }

        .empty-preview-box svg {
          margin-bottom: 1rem;
          color: var(--coral);
          font-size: 2.5rem;
        }

        .empty-preview-box h3 {
          margin: 0 0 0.5rem;
          color: var(--text-primary);
        }

        .empty-preview-box p {
          margin: 0;
        }

        .creator-nav-buttons {
          position: sticky;
          bottom: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          padding: 1.4rem 3rem;
          border-top: 2px solid var(--border-color);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
        }

        .nav-spacer {
          flex: 1;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 44px;
          padding: 0.7rem 1.3rem;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .btn-primary {
          border: 2px solid transparent;
          background: linear-gradient(
            135deg,
            var(--coral),
            var(--pink)
          );
          color: white;
          box-shadow: var(--shadow-glow-coral);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-outline {
          border: 2px solid var(--border-color);
          background: white;
          color: var(--text-secondary);
        }

        .btn-outline:hover:not(:disabled) {
          color: var(--coral);
          border-color: var(--coral);
        }

        .btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
          box-shadow: none;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .creator-header {
            flex-direction: column;
            padding: 1rem 1.5rem;
          }

          .stepper-label {
            display: none;
          }

          .stepper-line {
            width: 42px;
            margin: 0 0.55rem;
          }

          .preview-page-card {
            grid-template-columns: 1fr;
          }

          .preview-page-illustration {
            min-height: 300px;
            border-right: none;
            border-bottom: 2px solid var(--border-color);
          }
        }

        @media (max-width: 600px) {
          .mode-toggle-pill {
            width: 100%;
          }

          .mode-btn {
            flex: 1;
            justify-content: center;
            padding: 0.55rem 0.6rem;
            font-size: 0.74rem;
          }

          .stepper-bar {
            padding: 1.2rem 0.7rem;
          }

          .stepper-circle {
            width: 34px;
            height: 34px;
          }

          .stepper-line {
            width: 25px;
            margin: 0 0.3rem;
          }

          .step-content-wrapper {
            padding: 2rem 0.9rem;
          }

          .step-heading-group h2 {
            font-size: 1.75rem;
          }

          .question-block,
          .style-section,
          .gen-center-wrapper {
            padding: 1.4rem;
          }

          .creator-nav-buttons {
            padding: 1rem;
          }

          .creator-nav-buttons .btn {
            padding: 0.65rem 0.9rem;
            font-size: 0.8rem;
          }

          .preview-page-text-area {
            padding: 1.4rem;
          }

          .preview-meta-row {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}