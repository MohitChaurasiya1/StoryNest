import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMagic, FaBookOpen, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import StoryDetailsForm from './StoryDetailsForm';
import StoryPageEditor from './StoryPageEditor';
import PublishStoryModal from './PublishStoryModal';
import teacherStoryService from '../../../../services/teacherStoryService';

const CreateStoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState('details'); // 'details' | 'editor'
  const [creationMode, setCreationMode] = useState('ai'); // 'ai' | 'manual'

  const queryParams = new URLSearchParams(location.search);

  // Story Form Meta
  const [formData, setFormData] = useState({
    title: queryParams.get('title') || location.state?.title || '',
    grade: queryParams.get('grade') || location.state?.grade || 'Grade 2',
    reading_difficulty: queryParams.get('reading_difficulty') || queryParams.get('reading_level') || location.state?.reading_difficulty || 'Intermediate',
    genre: queryParams.get('genre') || location.state?.genre || 'Adventure',
    num_pages: queryParams.get('num_pages') || location.state?.num_pages || '5',
    characters: queryParams.get('characters') || location.state?.characters || 'Felix the curious fox',
    companion: queryParams.get('companion') || location.state?.companion || 'Barnaby the wise owl',
    setting: queryParams.get('setting') || location.state?.setting || 'Enchanted Forest',
    learning_objective: queryParams.get('learning_objective') || location.state?.learning_objective || 'Teamwork and creative problem solving',
    custom_prompt: queryParams.get('custom_prompt') || queryParams.get('prompt') || location.state?.custom_prompt || ''
  });

  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const s = location.state || {};
    setFormData(prev => ({
      ...prev,
      title: qp.get('title') || s.title || prev.title,
      grade: qp.get('grade') || s.grade || prev.grade,
      reading_difficulty: qp.get('reading_difficulty') || qp.get('reading_level') || s.reading_difficulty || prev.reading_difficulty,
      genre: qp.get('genre') || s.genre || prev.genre,
      characters: qp.get('characters') || s.characters || prev.characters,
      custom_prompt: qp.get('custom_prompt') || qp.get('prompt') || s.custom_prompt || prev.custom_prompt
    }));
  }, [location.state, location.search]);

  // Story Pages
  const [pages, setPages] = useState([]);
  const [savedStoryId, setSavedStoryId] = useState(null);

  // Loading & Feedback states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const [showPublishModal, setShowPublishModal] = useState(false);

  // Unsaved changes listener
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (pages.length > 0 && !savedSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pages, savedSuccess]);

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a story title.');
      return;
    }

    setError(null);

    if (creationMode === 'ai') {
      setLoading(true);
      try {
        const generated = await teacherStoryService.generateStory({
          title: formData.title,
          grade: formData.grade,
          reading_difficulty: formData.reading_difficulty,
          genre: formData.genre,
          num_pages: formData.num_pages,
          characters: formData.characters,
          companion: formData.companion,
          setting: formData.setting,
          learning_objective: formData.learning_objective,
          custom_prompt: formData.custom_prompt
        });

        if (generated.pages && generated.pages.length > 0) {
          setPages(generated.pages);
          if (generated.title_en) {
            setFormData(prev => ({ ...prev, title: generated.title_en }));
          }
        }
        setStep('editor');
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to generate story. You can switch to "Write Manually" or try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Manual Mode -> Setup blank pages based on length
      const count = parseInt(formData.num_pages) || 5;
      const initialPages = Array.from({ length: count }, (_, idx) => ({
        page_number: idx + 1,
        text_en: idx === 0 ? 'Once upon a time...' : '',
        text_hi: '',
        illustration_prompt: `Scene illustration for page ${idx + 1}`
      }));
      setPages(initialPages);
      setStep('editor');
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      alert('Please give your story a title.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title_en: formData.title,
        grade: formData.grade,
        reading_difficulty: formData.reading_difficulty,
        story_mood: formData.genre,
        moral: formData.learning_objective,
        setting: formData.setting,
        hero_animal: formData.characters,
        companion: formData.companion,
        pages: pages
      };

      let result;
      if (savedStoryId) {
        result = await teacherStoryService.updateStory(savedStoryId, payload);
      } else {
        result = await teacherStoryService.createStory(payload);
        setSavedStoryId(result.id);
      }

      setSavedSuccess(true);
      setSuccessToast('Draft saved successfully.');
      setTimeout(() => setSavedSuccess(false), 3000);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishClick = async () => {
    // Save draft first if not yet saved or if modified
    try {
      setSaving(true);
      const payload = {
        title_en: formData.title,
        grade: formData.grade,
        reading_difficulty: formData.reading_difficulty,
        story_mood: formData.genre,
        moral: formData.learning_objective,
        setting: formData.setting,
        hero_animal: formData.characters,
        companion: formData.companion,
        pages: pages
      };

      let storyId = savedStoryId;
      if (!storyId) {
        const saved = await teacherStoryService.createStory(payload);
        storyId = saved.id;
        setSavedStoryId(storyId);
      } else {
        await teacherStoryService.updateStory(storyId, payload);
      }
      setSaving(false);
      setShowPublishModal(true);
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Failed to prepare story for publishing.');
    }
  };

  const handlePublishSuccess = (result) => {
    setSuccessToast(`Story "${formData.title}" published successfully!`);
    setTimeout(() => {
      navigate('/teacher/library');
    }, 1200);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-[999999] p-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl flex items-center gap-3 animate-bounce">
          <FaCheckCircle className="text-xl" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="parent-header parent-hero-card mb-8">
        <div className="parent-header-left">
          <button 
            type="button" 
            onClick={() => {
              if (step === 'editor') {
                if (window.confirm('Back to Story Details? Any unsaved generated text will be preserved.')) {
                  setStep('details');
                }
              } else {
                navigate('/teacher/library');
              }
            }}
            className="text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2 transition-colors"
          >
            <FaArrowLeft /> {step === 'editor' ? 'Back to Details' : 'Back to Library'}
          </button>
          <h2 className="serif-heading text-white">Teacher Story Creator</h2>
          <p className="text-white/85 mt-1" style={{ fontSize: '0.95rem' }}>
            {step === 'details' 
              ? 'Craft AI-powered or bespoke reading material customized to your curriculum.' 
              : 'Edit, illustrate, and publish your custom classroom story.'}
          </p>
        </div>

        <div className="parent-header-right flex items-center gap-3">
          {step === 'editor' && (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handlePublishClick}
            >
              Publish Story
            </button>
          )}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm font-semibold mb-6 animate-fade-in">
          <FaExclamationTriangle className="shrink-0 text-base" />
          <p className="m-0 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Step Content */}
      {step === 'details' ? (
        <StoryDetailsForm 
          formData={formData}
          setFormData={setFormData}
          creationMode={creationMode}
          setCreationMode={setCreationMode}
          onSubmit={handleDetailsSubmit}
          loading={loading}
        />
      ) : (
        <StoryPageEditor 
          storyMeta={formData}
          setStoryMeta={setFormData}
          pages={pages}
          setPages={setPages}
          onSaveDraft={handleSaveDraft}
          onPublishClick={handlePublishClick}
          saving={saving}
          savedSuccess={savedSuccess}
        />
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishStoryModal 
          story={{ id: savedStoryId, title: formData.title }}
          onClose={() => setShowPublishModal(false)}
          onSuccess={handlePublishSuccess}
        />
      )}
    </div>
  );
};

export default CreateStoryPage;
