import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBookOpen, 
  FaSearch, 
  FaFilter, 
  FaTasks, 
  FaHeart, 
  FaRegHeart, 
  FaClock, 
  FaAward, 
  FaLightbulb, 
  FaStar, 
  FaRedo, 
  FaBookReader, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import { teacherAPI } from '../../services/api';
import StoryPreviewModal from './StoryPreviewModal';
import CreateAssignmentModal from './CreateAssignmentModal';
import './TeacherModule.css';

export default function TeacherStoryLibrary() {
  const navigate = useNavigate();

  // Data States
  const [stories, setStories] = useState([]);
  const [recommendedStories, setRecommendedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [readingLevelFilter, setReadingLevelFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [hasQuizFilter, setHasQuizFilter] = useState('all');
  const [savedFilter, setSavedFilter] = useState('all');
  const [orderingFilter, setOrderingFilter] = useState('newest');

  // Modal States
  const [selectedStoryForPreview, setSelectedStoryForPreview] = useState(null);
  const [selectedStoryToAssign, setSelectedStoryToAssign] = useState(null);

  useEffect(() => {
    loadLibraryData();
  }, [search, gradeFilter, readingLevelFilter, languageFilter, hasQuizFilter, savedFilter, orderingFilter]);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        search,
        grade: gradeFilter,
        reading_level: readingLevelFilter,
        language: languageFilter,
        has_quiz: hasQuizFilter === 'true' ? 'true' : undefined,
        saved_only: savedFilter === 'saved' ? 'true' : undefined,
        ordering: orderingFilter
      };

      const [storiesRes, recsRes] = await Promise.all([
        teacherAPI.getTeacherStories(params),
        teacherAPI.getRecommendedStories()
      ]);

      const storyList = storiesRes?.results || storiesRes || [];
      setStories(storyList);
      setRecommendedStories(recsRes?.results || recsRes || []);
    } catch (err) {
      console.error('Error loading story library:', err);
      setError('Unable to load live story library. Displaying preview content.');
      // Fallback sample content
      setStories([
        { id: 1, title_en: "The Brave Little Acorn", language: "English", grade: "Grade 2", reading_difficulty: "Beginner", moral: "Courage & Patience", vocab_theme: "Nature & Forest", num_pages: 6, has_quiz: true, assigned_count: 3, lessons_count: 2 },
        { id: 2, title_en: "Ocean Friends", language: "Bilingual", grade: "Grade 3", reading_difficulty: "Intermediate", moral: "Teamwork", vocab_theme: "Aquatic Life", num_pages: 8, has_quiz: true, assigned_count: 5, lessons_count: 3 },
        { id: 3, title_en: "Leo and the Golden Tree", language: "English", grade: "Grade 2", reading_difficulty: "Beginner", moral: "Honesty & Friendship", vocab_theme: "Magical Forest", num_pages: 5, has_quiz: false, assigned_count: 1, lessons_count: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (e, storyId) => {
    e.stopPropagation();
    try {
      const res = await teacherAPI.toggleSaveStory(storyId);
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, is_saved: res.is_saved } : s));
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleUseInLesson = (story) => {
    navigate('/teacher/lessons');
  };

  return (
    <div className="space-y-6 text-xs font-sans pb-16">
      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-600" />
            <span>{error}</span>
          </div>
          <button onClick={loadLibraryData} className="sn-btn-secondary py-1 px-3 text-xs">
            <FaRedo /> Retry
          </button>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <FaBookOpen className="text-purple-600" /> Story & Learning Content Library
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Discover age-appropriate stories, preview learning skills, and assign them directly to your classrooms.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stories, moral themes, vocabulary..."
            className="sn-search-input pl-9 py-2.5 w-full text-xs rounded-2xl"
          />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">All Grades</option>
            <option value="grade-1">Grade 1</option>
            <option value="grade-2">Grade 2</option>
            <option value="grade-3">Grade 3</option>
            <option value="grade-4">Grade 4</option>
            <option value="grade-5">Grade 5</option>
          </select>

          <select
            value={readingLevelFilter}
            onChange={e => setReadingLevelFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">All Reading Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={languageFilter}
            onChange={e => setLanguageFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">All Languages</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="bilingual">Bilingual</option>
          </select>

          <select
            value={hasQuizFilter}
            onChange={e => setHasQuizFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">Quiz Availability</option>
            <option value="true">With Quiz Only</option>
          </select>

          <select
            value={savedFilter}
            onChange={e => setSavedFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">All Stories</option>
            <option value="saved">Saved Stories Only</option>
          </select>

          <select
            value={orderingFilter}
            onChange={e => setOrderingFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* RECOMMENDED FOR YOUR CLASS STRIP */}
      {recommendedStories.length > 0 && !search && savedFilter === 'all' && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-4 border border-purple-800/40">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2 text-white">
                <FaStar className="text-amber-400" /> Recommended for Your Classrooms
              </h2>
              <p className="text-xs text-purple-200 font-medium mt-0.5">
                Curated stories matched to your active grade levels and reading benchmarks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommendedStories.slice(0, 3).map(rec => (
              <div
                key={rec.id}
                onClick={() => setSelectedStoryForPreview(rec)}
                className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition cursor-pointer space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[10px]">
                    ★ Recommended
                  </span>
                  <span className="text-[10px] text-purple-200 font-bold">{rec.grade || 'Grade 2'}</span>
                </div>
                <h4 className="font-black text-sm text-white line-clamp-1">{rec.title_en}</h4>
                <p className="text-[11px] text-purple-100 line-clamp-2">{rec.moral || rec.description || 'Courage and Growth'}</p>
                <div className="flex justify-between items-center pt-1 text-[11px] font-bold text-amber-300">
                  <span>~10 min read</span>
                  <span>Preview &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN STORY GRID */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="inline-block animate-spin text-2xl text-purple-600 mb-2">🌀</div>
          <p className="font-semibold text-xs">Loading story library content...</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3 shadow-sm">
          <FaBookOpen className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">No stories match your filters</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Try resetting your search query or adjusting grade and language filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setGradeFilter('all');
              setReadingLevelFilter('all');
              setLanguageFilter('all');
              setHasQuizFilter('all');
              setSavedFilter('all');
            }}
            className="sn-btn-primary py-2 px-5 text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => {
            const readTime = Math.max(8, (story.num_pages || 5) * 2);

            return (
              <div
                key={story.id}
                onClick={() => setSelectedStoryForPreview(story)}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between hover:border-purple-300 transition cursor-pointer group"
              >
                <div>
                  {/* Cover Header */}
                  <div className="h-44 bg-slate-100 dark:bg-slate-700 relative flex items-center justify-center overflow-hidden">
                    {story.cover_image_url ? (
                      <img src={story.cover_image_url} alt={story.title_en} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <FaBookOpen className="text-5xl text-slate-300 dark:text-slate-500 group-hover:scale-110 transition duration-500" />
                    )}

                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="sn-badge-enrolled uppercase shadow-xs">{story.language || 'English'}</span>
                    </div>

                    <button
                      onClick={e => handleToggleSave(e, story.id)}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition shadow-xs ${
                        story.is_saved
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 hover:text-rose-500'
                      }`}
                      title={story.is_saved ? 'Unsave Story' : 'Save Story'}
                    >
                      {story.is_saved ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <span className="sn-badge-available">{story.grade || 'Grade 2'}</span>
                      <span className="sn-badge-on-track">{story.reading_difficulty || 'Beginner'}</span>
                      <span>• ~{readTime} min read</span>
                    </div>

                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug line-clamp-1">
                      {story.title_en}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                      {story.moral || story.description || 'A wonderful StoryNest adventure.'}
                    </p>

                    {/* Educational Skills Badges */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                        <span>Skills & Values</span>
                        <span className="text-purple-600 font-black">{story.has_quiz ? '🧠 Quiz Included' : 'No Quiz'}</span>
                      </div>
                      <div className="font-extrabold text-slate-700 dark:text-slate-200 text-xs truncate">
                        {story.vocab_theme || story. moral || 'Decision Making & Courage'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedStoryForPreview(story); }}
                    className="sn-btn-secondary py-1.5 px-3 text-xs font-bold"
                  >
                    Preview
                  </button>

                  <button
                    onClick={e => { e.stopPropagation(); setSelectedStoryToAssign(story); }}
                    className="sn-btn-primary py-1.5 px-4 text-xs font-black shadow-md inline-flex items-center gap-1.5"
                  >
                    <FaTasks /> Assign Story
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS INTEGRATION */}
      {selectedStoryForPreview && (
        <StoryPreviewModal
          story={selectedStoryForPreview}
          onClose={() => setSelectedStoryForPreview(null)}
          onAssign={st => setSelectedStoryToAssign(st)}
          onUseInLesson={st => handleUseInLesson(st)}
          onToggleSave={(id, isSaved) => {
            setStories(prev => prev.map(s => s.id === id ? { ...s, is_saved: isSaved } : s));
          }}
        />
      )}

      {selectedStoryToAssign && (
        <CreateAssignmentModal
          preselectedStory={selectedStoryToAssign}
          onClose={() => setSelectedStoryToAssign(null)}
          onCreated={() => loadLibraryData()}
        />
      )}
    </div>
  );
}
