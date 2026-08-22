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
  FaExclamationTriangle,
  FaTimes,
  FaChalkboardTeacher,
  FaChevronDown,
  FaChevronUp
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
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Primary Filters State
  const [search, setSearch] = useState('');
  const [viewingClassroom, setViewingClassroom] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [readingLevelFilter, setReadingLevelFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  
  // Secondary Filters State
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [hasQuizFilter, setHasQuizFilter] = useState('all');
  const [savedFilter, setSavedFilter] = useState('all');
  const [orderingFilter, setOrderingFilter] = useState('newest');

  // Modal States
  const [selectedStoryForPreview, setSelectedStoryForPreview] = useState(null);
  const [selectedStoryToAssign, setSelectedStoryToAssign] = useState(null);

  useEffect(() => {
    loadClassrooms();
  }, []);

  useEffect(() => {
    // If viewing a specific classroom, try to match grade automatically (if user hasn't explicitly set grade)
    if (viewingClassroom !== 'all') {
      const cls = classrooms.find(c => c.id.toString() === viewingClassroom);
      if (cls && cls.grade_level) {
        // Just a hint, let's pre-set grade filter if it's currently 'all'
        if (gradeFilter === 'all') {
          const gradeMatch = cls.grade_level.toLowerCase().replace(' ', '-'); // "Grade 2" -> "grade-2"
          setGradeFilter(gradeMatch);
        }
      }
    }
  }, [viewingClassroom, classrooms]);

  useEffect(() => {
    loadLibraryData();
  }, [search, gradeFilter, readingLevelFilter, languageFilter, hasQuizFilter, savedFilter, orderingFilter]);

  const loadClassrooms = async () => {
    try {
      const res = await teacherAPI.getClassrooms();
      setClassrooms(res.results || res || []);
    } catch (err) {
      console.error("Failed to load classrooms for filter", err);
    }
  };

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

      setStories(storiesRes?.results || storiesRes || []);
      setRecommendedStories(recsRes?.results || recsRes || []);
    } catch (err) {
      console.error('Error loading story library:', err);
      // DO NOT populate fake data. Show error state.
      setError("Couldn't load your story library.");
      setStories([]);
      setRecommendedStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (e, storyId) => {
    e.stopPropagation();
    try {
      const res = await teacherAPI.toggleSaveStory(storyId);
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, is_saved: res.is_saved } : s));
      setRecommendedStories(prev => prev.map(s => s.id === storyId ? { ...s, is_saved: res.is_saved } : s));
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleUseInLesson = (story) => {
    // Navigate to lessons, in a real app you might pass story ID in state
    navigate('/teacher/lessons', { state: { prefilledStoryId: story.id, prefilledStoryTitle: story.title_en } });
  };

  const clearAllFilters = () => {
    setSearch('');
    setGradeFilter('all');
    setReadingLevelFilter('all');
    setLanguageFilter('all');
    setHasQuizFilter('all');
    setSavedFilter('all');
    setOrderingFilter('newest');
    setViewingClassroom('all');
  };

  const hasActiveFilters = search || gradeFilter !== 'all' || readingLevelFilter !== 'all' || 
                           languageFilter !== 'all' || hasQuizFilter !== 'all' || savedFilter !== 'all';

  // SVG Fallback for missing cover image
  const getCoverFallback = (title, theme) => {
    const hue = (title.charCodeAt(0) * 15) % 360;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center" style={{ background: `linear-gradient(135deg, hsl(${hue}, 80%, 90%), hsl(${hue + 40}, 80%, 80%))` }}>
        <FaBookOpen className="text-4xl mb-2 opacity-50" style={{ color: `hsl(${hue}, 80%, 40%)` }} />
        <span className="font-extrabold text-sm opacity-80 line-clamp-2" style={{ color: `hsl(${hue}, 80%, 30%)` }}>
          {title}
        </span>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between h-full animate-pulse">
      <div>
        <div className="h-44 bg-slate-200 dark:bg-slate-700 w-full"></div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
      <div className="p-4 bg-slate-50 border-t flex justify-between gap-2">
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-xs font-sans pb-16">
      
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

      {/* FILTER BAR SECTION */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        
        {/* Top Row: Classroom Context & Primary Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="font-bold text-slate-500 flex items-center gap-1.5"><FaChalkboardTeacher/> Viewing for:</span>
            <select
              value={viewingClassroom}
              onChange={e => setViewingClassroom(e.target.value)}
              className="sn-filter-select py-1.5 px-3 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 border-purple-200"
            >
              <option value="all">All Classrooms</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.grade_level})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} className="sn-filter-select py-2 px-3 rounded-xl text-xs">
              <option value="all">All Grades</option>
              <option value="grade-1">Grade 1</option>
              <option value="grade-2">Grade 2</option>
              <option value="grade-3">Grade 3</option>
              <option value="grade-4">Grade 4</option>
              <option value="grade-5">Grade 5</option>
            </select>

            <select value={readingLevelFilter} onChange={e => setReadingLevelFilter(e.target.value)} className="sn-filter-select py-2 px-3 rounded-xl text-xs">
              <option value="all">All Reading Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select value={languageFilter} onChange={e => setLanguageFilter(e.target.value)} className="sn-filter-select py-2 px-3 rounded-xl text-xs">
              <option value="all">All Languages</option>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="bilingual">Bilingual</option>
            </select>

            <button 
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="py-2 px-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition"
            >
              <FaFilter /> {showMoreFilters ? 'Hide Filters' : 'More Filters'} {showMoreFilters ? <FaChevronUp/> : <FaChevronDown/>}
            </button>
          </div>
        </div>

        {/* Secondary Filters (Expandable) */}
        {showMoreFilters && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            <select value={hasQuizFilter} onChange={e => setHasQuizFilter(e.target.value)} className="sn-filter-select py-2 px-3 rounded-xl text-xs">
              <option value="all">Quiz Availability</option>
              <option value="true">With Quiz Only</option>
            </select>
            <select value={savedFilter} onChange={e => setSavedFilter(e.target.value)} className="sn-filter-select py-2 px-3 rounded-xl text-xs">
              <option value="all">All Stories</option>
              <option value="saved">Saved Stories Only</option>
            </select>
            <select value={orderingFilter} onChange={e => setOrderingFilter(e.target.value)} className="sn-filter-select py-2 px-3 rounded-xl text-xs">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Filters:</span>
            
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                "{search}" <FaTimes className="cursor-pointer hover:text-indigo-900" onClick={() => setSearch('')}/>
              </span>
            )}
            {gradeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                {gradeFilter.replace('-', ' ').toUpperCase()} <FaTimes className="cursor-pointer hover:text-indigo-900" onClick={() => setGradeFilter('all')}/>
              </span>
            )}
            {readingLevelFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                {readingLevelFilter.toUpperCase()} <FaTimes className="cursor-pointer hover:text-indigo-900" onClick={() => setReadingLevelFilter('all')}/>
              </span>
            )}
            {languageFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                {languageFilter.toUpperCase()} <FaTimes className="cursor-pointer hover:text-indigo-900" onClick={() => setLanguageFilter('all')}/>
              </span>
            )}
            {hasQuizFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                HAS QUIZ <FaTimes className="cursor-pointer hover:text-indigo-900" onClick={() => setHasQuizFilter('all')}/>
              </span>
            )}
            {savedFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                SAVED ONLY <FaTimes className="cursor-pointer hover:text-indigo-900" onClick={() => setSavedFilter('all')}/>
              </span>
            )}

            <button onClick={clearAllFilters} className="text-[10px] font-bold text-slate-500 hover:text-slate-800 ml-2 underline">
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-sm">
          <FaExclamationTriangle className="mx-auto text-4xl text-rose-300" />
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">{error}</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            We encountered a network issue while retrieving your stories. Please check your connection and try again.
          </p>
          <button onClick={loadLibraryData} className="sn-btn-primary py-2.5 px-6 text-xs font-bold mt-2">
            Try Again
          </button>
        </div>
      )}

      {/* RECOMMENDED FOR YOUR CLASS STRIP */}
      {recommendedStories.length > 0 && !search && savedFilter === 'all' && !loading && !error && (
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
                className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition cursor-pointer space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[10px]">
                      ★ Recommended
                    </span>
                    <span className="text-[10px] text-purple-200 font-bold bg-black/20 px-2 py-0.5 rounded-md">{rec.grade || 'Grade 2'}</span>
                  </div>
                  <h4 className="font-black text-sm text-white line-clamp-1">{rec.title_en}</h4>
                  <p className="text-[11px] text-purple-100 line-clamp-2 mt-1">{rec.moral || rec.description}</p>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10 text-[11px] font-bold text-amber-300">
                  <span>~{Math.max(8, (rec.num_pages || 5) * 2)} min read</span>
                  <span className="flex items-center gap-1"><FaBookReader/> Preview</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN STORY GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !error && stories.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3 shadow-sm">
          <FaBookOpen className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
            {hasActiveFilters ? "No stories match your filters" : "Your Story Library is Empty"}
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            {hasActiveFilters ? "Try clearing your filters or searching for a different topic." : "Stories available to your account will appear here."}
          </p>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="sn-btn-primary py-2 px-5 text-xs font-bold mt-2">
              Clear Filters
            </button>
          )}
        </div>
      ) : !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {stories.map(story => {
            const readTime = Math.max(8, (story.num_pages || 5) * 2);
            
            // Context label logic
            let contextLabel = null;
            if (viewingClassroom !== 'all' && classrooms.length > 0) {
              const cls = classrooms.find(c => c.id.toString() === viewingClassroom);
              if (cls && story.grade === cls.grade_level) {
                contextLabel = <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">🎯 Matches {cls.name}</span>;
              }
            } else if (story.reading_difficulty === 'Beginner' && !contextLabel) {
              contextLabel = <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">📚 Good for Beginners</span>;
            }

            return (
              <div
                key={story.id}
                onClick={() => setSelectedStoryForPreview(story)}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition cursor-pointer group h-full"
              >
                <div>
                  {/* Cover Header (16:9 / ~4:3 aspect ratio) */}
                  <div className="h-44 w-full bg-slate-100 dark:bg-slate-700 relative overflow-hidden shrink-0">
                    {story.cover_image_url ? (
                      <img src={story.cover_image_url} alt={story.title_en} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      getCoverFallback(story.title_en, story.theme)
                    )}

                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="sn-badge-enrolled uppercase shadow-sm bg-white/90 backdrop-blur-sm text-slate-800 border-none">
                        {story.language || 'English'}
                      </span>
                    </div>

                    <button
                      onClick={e => handleToggleSave(e, story.id)}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition shadow-sm ${
                        story.is_saved
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 hover:text-rose-500 hover:bg-white'
                      }`}
                      title={story.is_saved ? 'Unsave Story' : 'Save Story'}
                    >
                      {story.is_saved ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex flex-col flex-1">
                    {/* Context Label row */}
                    {contextLabel && <div className="mb-1">{contextLabel}</div>}

                    {/* Metadata row */}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <span className="text-slate-700 dark:text-slate-300">{story.grade || 'Grade 2'}</span>
                      <span>·</span>
                      <span>{story.reading_difficulty || 'Beginner'}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><FaClock/> ~{readTime} min</span>
                    </div>

                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug line-clamp-2">
                      {story.title_en}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                      {story.moral || story.description || 'A wonderful StoryNest adventure.'}
                    </p>

                    {/* Educational Skills row */}
                    <div className="pt-2 mt-auto">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-2">
                        <div className="text-[10px] font-bold text-slate-500 truncate">
                          Learning Skills: <span className="text-slate-700 dark:text-slate-300">{story.vocab_theme || 'Vocabulary'} · {story.encouraged_behavior || 'Growth'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          {story.has_quiz ? (
                            <span className="text-emerald-600 flex items-center gap-1"><FaAward/> ✓ Quiz Available</span>
                          ) : (
                            <span className="text-slate-400">No Quiz</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center gap-2 shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedStoryForPreview(story); }}
                    className="py-2 px-3 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                  >
                    Preview
                  </button>

                  <button
                    onClick={e => { e.stopPropagation(); handleUseInLesson(story); }}
                    className="sn-btn-primary py-2 px-4 text-xs font-black shadow-md inline-flex items-center gap-1.5"
                  >
                    <FaChalkboardTeacher /> Use in Lesson
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
            setRecommendedStories(prev => prev.map(s => s.id === id ? { ...s, is_saved: isSaved } : s));
          }}
        />
      )}

      {selectedStoryToAssign && (
        <CreateAssignmentModal
          preselectedStory={selectedStoryToAssign}
          onClose={() => setSelectedStoryToAssign(null)}
          onCreated={() => loadLibraryData()} // Optional: reload to update usage stats
        />
      )}
    </div>
  );
}
