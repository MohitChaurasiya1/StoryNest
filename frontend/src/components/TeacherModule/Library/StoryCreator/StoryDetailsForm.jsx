import React from 'react';
import { FaMagic, FaPen, FaBookOpen, FaLightbulb } from 'react-icons/fa';

const GENRE_OPTIONS = [
  { value: 'Adventure', label: '🌟 Adventure & Exploration' },
  { value: 'Friendship', label: '🤝 Friendship & Empathy' },
  { value: 'Science & Discovery', label: '🔬 Science & Discovery' },
  { value: 'Nature & Wildlife', label: '🌿 Nature & Wildlife' },
  { value: 'Fantasy & Magic', label: '✨ Fantasy & Magic' },
  { value: 'Mystery & Puzzle', label: '🔍 Mystery & Puzzle' },
  { value: 'Historical & Culture', label: '🏛️ History & Culture' },
  { value: 'Bedtime & Calm', label: '🌙 Calm & Bedtime' },
];

const GRADE_OPTIONS = [
  { value: 'Pre-K', label: 'Pre-K (Age 3-4)' },
  { value: 'Kindergarten', label: 'Kindergarten (Age 5-6)' },
  { value: 'Grade 1', label: 'Grade 1 (Age 6-7)' },
  { value: 'Grade 2', label: 'Grade 2 (Age 7-8)' },
  { value: 'Grade 3', label: 'Grade 3 (Age 8-9)' },
  { value: 'Grade 4', label: 'Grade 4 (Age 9-10)' },
  { value: 'Grade 5', label: 'Grade 5 (Age 10-11)' },
];

const SETTING_SUGGESTIONS = [
  'Enchanted Pine Forest',
  'Intergalactic Space Station',
  'Ancient Indian Palace',
  'Underwater Coral Reef',
  'Futuristic Smart City',
  'School Science Laboratory',
  'Himalayan Mountain Village',
  'Secret Treehouse Library'
];

const StoryDetailsForm = ({ 
  formData, 
  setFormData, 
  creationMode, 
  setCreationMode, 
  onSubmit, 
  loading 
}) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSettingClick = (settingName) => {
    setFormData({ ...formData, setting: settingName });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-fade-in">
      {/* Creation Mode Switcher */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          1. Select Creation Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setCreationMode('ai')}
            className={`p-5 rounded-3xl border text-left flex items-start gap-4 transition-all relative overflow-hidden ${
              creationMode === 'ai'
                ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 ring-2 ring-rose-300 dark:ring-rose-900 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              creationMode === 'ai'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-500'
            }`}>
              <FaMagic />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Create with AI</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">Recommended</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Provide learning goals and parameters. Gemini AI generates a rich, structured story you can edit.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCreationMode('manual')}
            className={`p-5 rounded-3xl border text-left flex items-start gap-4 transition-all relative overflow-hidden ${
              creationMode === 'manual'
                ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 ring-2 ring-rose-300 dark:ring-rose-900 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              creationMode === 'manual'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <FaPen />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Write Manually</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Compose every story page and illustration prompt manually from a blank canvas.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Story Core Details Card */}
      <div className="card p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <FaBookOpen className="text-rose-500" />
          Story Fundamentals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Story Title *
            </label>
            <input 
              type="text" 
              name="title"
              placeholder="e.g., The Secret of the Whispering Whisps"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-semibold focus:ring-2 focus:ring-rose-500 transition-all shadow-sm"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Target Grade Level
            </label>
            <select
              name="grade"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
              value={formData.grade}
              onChange={handleChange}
            >
              {GRADE_OPTIONS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Reading Difficulty
            </label>
            <select
              name="reading_difficulty"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
              value={formData.reading_difficulty}
              onChange={handleChange}
            >
              <option value="Beginner">Beginner (Simple sentence structures, phonics)</option>
              <option value="Intermediate">Intermediate (Paragraphs, richer vocabulary)</option>
              <option value="Advanced">Advanced (Complex themes, figurative language)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Genre & Mood
            </label>
            <select
              name="genre"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
              value={formData.genre}
              onChange={handleChange}
            >
              {GENRE_OPTIONS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Story Length
            </label>
            <select
              name="num_pages"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
              value={formData.num_pages}
              onChange={handleChange}
            >
              <option value="3">Short (3 Pages — 2-3 min read)</option>
              <option value="5">Standard (5 Pages — 4-6 min read)</option>
              <option value="8">Extended (8 Pages — 7-10 min read)</option>
              <option value="10">Long Chapter (10 Pages — 10+ min read)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Characters, Setting & Learning Objectives */}
      <div className="card p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <FaLightbulb className="text-amber-500" />
          Pedagogy & World Building
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Hero / Main Character
            </label>
            <input 
              type="text" 
              name="characters"
              placeholder="e.g., Mia the Curious Owl"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
              value={formData.characters}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Companion / Sidekick
            </label>
            <input 
              type="text" 
              name="companion"
              placeholder="e.g., Pip the energetic squirrel"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
              value={formData.companion}
              onChange={handleChange}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Setting / Location
            </label>
            <input 
              type="text" 
              name="setting"
              placeholder="e.g., An enchanted clockwork observatory on top of Mount Lumina"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500 mb-2"
              value={formData.setting}
              onChange={handleChange}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-slate-400 self-center">Ideas:</span>
              {SETTING_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSettingClick(s)}
                  className="px-2.5 py-1 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Learning Objective / Moral
            </label>
            <input 
              type="text" 
              name="learning_objective"
              placeholder="e.g., Learning that making mistakes is part of science and discovery"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500"
              value={formData.learning_objective}
              onChange={handleChange}
            />
          </div>

          {creationMode === 'ai' && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Curriculum Keywords / Custom Prompt (Optional)
              </label>
              <textarea 
                rows={3}
                name="custom_prompt"
                placeholder="e.g., Include vocabulary words: solar eclipse, orbit, gravity. Make the ending encouraging."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-rose-500 resize-none"
                value={formData.custom_prompt}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="flex justify-end gap-3 pt-2">
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
          style={{ minWidth: '220px', padding: '0.9rem 2rem', fontSize: '1rem' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin text-lg">⏳</span> Generating Story Draft...
            </span>
          ) : creationMode === 'ai' ? (
            <span className="flex items-center gap-2">
              <FaMagic /> Generate with AI
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FaPen /> Open Story Editor
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default StoryDetailsForm;
