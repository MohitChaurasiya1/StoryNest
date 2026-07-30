import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import StoryCard from './StoryCard';
import { parentSearchApi } from '../../services/api';
import { FaSearch, FaFilter, FaBook, FaCertificate, FaBullseye } from 'react-icons/fa';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ stories: [], certificates: [], goals: [] });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'stories' | 'certificates' | 'goals'
  const [toast, setToast] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await parentSearchApi.search(query);
      setResults(data);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to perform search' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar title="Search Everywhere" />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FaSearch className="text-rose-500" /> Search & Filters
            </h1>
            <p className="text-sm text-slate-500">Find stories, certificates, goals, and logs across your account.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by story title, theme, certificate, goal name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 pl-12 pr-4 py-3.5 text-sm focus:border-rose-500 focus:outline-none shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm shadow-md hover:scale-105 transition"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex gap-2 border-b pb-3">
            {['all', 'stories', 'certificates', 'goals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                  filter === tab ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Results */}
          {loading ? (
            <SkeletonLoader count={4} />
          ) : (
            <div className="space-y-8">
              {/* Stories */}
              {(filter === 'all' || filter === 'stories') && results.stories?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FaBook className="text-rose-500" /> Stories ({results.stories.length})
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.stories.map((story) => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {(filter === 'all' || filter === 'certificates') && results.certificates?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FaCertificate className="text-amber-500" /> Certificates ({results.certificates.length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.certificates.map((c) => (
                      <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h4 className="font-bold text-slate-900">{c.title}</h4>
                        <p className="text-xs text-slate-500">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {(filter === 'all' || filter === 'goals') && results.goals?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FaBullseye className="text-indigo-500" /> Goals ({results.goals.length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.goals.map((g) => (
                      <div key={g.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h4 className="font-bold text-slate-900">{g.title}</h4>
                        <p className="text-xs text-slate-500">Target: {g.target_value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {query && !loading && !results.stories?.length && !results.certificates?.length && !results.goals?.length && (
                <EmptyState
                  icon={FaSearch}
                  title="No matching results"
                  description={`No items matched your query "${query}". Try different keywords.`}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
