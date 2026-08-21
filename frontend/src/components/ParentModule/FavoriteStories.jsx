import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import StoryCard from './StoryCard';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import { parentLibraryApi } from '../../services/api';
import { FaHeart, FaSearch, FaSortAmountDown } from 'react-icons/fa';

export default function FavoriteStories() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [toast, setToast] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await parentLibraryApi.getLibrary({ favourite: 'true', search, sort });
      setStories(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load favorite stories' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [search, sort]);

  const handleToggleFav = async (story) => {
    try {
      await parentLibraryApi.toggleFavourite(story.id);
      setToast({ type: 'info', message: 'Favorites updated' });
      fetchFavorites();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update favorite' });
    }
  };

  const handleReadStory = (story) => {
    navigate(`/story/${story.id}`);
  };

  const handleQuiz = (story) => {
    navigate(`/parent/quizzes`, { state: { storyId: story.id } });
  };

  const handleDownload = (story) => {
    if (story.pdf_url) {
      window.open(story.pdf_url, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(`/story/${story.id}`, {
      state: { downloadPdf: true },
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar
          title="Favorite Stories"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaHeart className="text-rose-500" /> Favorite Stories
              </h1>
              <p className="text-sm text-slate-500">Your collection of starred and favorited stories.</p>
            </div>

            {/* Search and Sort controls */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <FaSearch className="absolute left-3 top-3 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-rose-500 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={6} />
          ) : stories.length === 0 ? (
            <EmptyState
              icon={FaHeart}
              title="No favorite stories yet"
              description="Click the heart icon on any story card to save it to your favorites."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onFavourite={handleToggleFav}
                  onRead={handleReadStory}
                  onDownload={handleDownload}
                  onQuiz={handleQuiz}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
