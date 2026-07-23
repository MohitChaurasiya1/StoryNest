import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ChildSelector from '../../components/ChildSelector/ChildSelector';
import ChildModal from '../../components/ChildModal/ChildModal';
import ReadingLogModal from '../../components/ReadingLogModal/ReadingLogModal';
import { useAuth } from '../../context/AuthContext';
import { parentApi } from '../../services/api';
import { 
  FaFire, 
  FaTrophy, 
  FaStar, 
  FaBookOpen, 
  FaArrowRight, 
  FaCheckCircle, 
  FaClock,
  FaHeart,
  FaMagic,
  FaPlus,
  FaEdit,
  FaTrash,
  FaChartLine,
  FaBook,
  FaUser,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import './ParentDashboard.css';

export default function ParentDashboard() {
  const { 
    childrenList, 
    activeChild, 
    activeChildId, 
    setActiveChildId, 
    createChild, 
    updateChild, 
    deleteChild 
  } = useAuth();

  const location = useLocation();
  const currentTab = location.hash ? location.hash.replace('#', '') : 'dashboard';

  // Dashboard & Module Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [readingLogs, setReadingLogs] = useState([]);
  const [childStories, setChildStories] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [childToEdit, setChildToEdit] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Fetch data whenever activeChildId or tab changes
  const fetchParentData = async () => {
    if (!activeChildId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const [dashRes, achRes, logsRes, storiesRes, insRes] = await Promise.allSettled([
        parentApi.getDashboard(activeChildId),
        parentApi.getAchievements(activeChildId),
        parentApi.getReadingLogs(activeChildId),
        parentApi.getChildStories(activeChildId),
        parentApi.getInsights(activeChildId)
      ]);

      if (dashRes.status === 'fulfilled') setDashboardData(dashRes.value);
      if (achRes.status === 'fulfilled') setAchievements(achRes.value);
      if (logsRes.status === 'fulfilled') setReadingLogs(logsRes.value);
      if (storiesRes.status === 'fulfilled') setChildStories(storiesRes.value);
      if (insRes.status === 'fulfilled') setInsightsData(insRes.value);

    } catch (err) {
      console.error("Error loading parent dashboard:", err);
      setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [activeChildId]);

  // Modal Handlers
  const handleOpenAddChild = () => {
    setChildToEdit(null);
    setIsChildModalOpen(true);
  };

  const handleOpenEditChild = () => {
    setChildToEdit(activeChild);
    setIsChildModalOpen(true);
  };

  const handleSaveChild = async (formData) => {
    if (childToEdit) {
      await updateChild(childToEdit.id, formData);
    } else {
      await createChild(formData);
    }
    fetchParentData();
  };

  const handleDeleteActiveChild = async () => {
    if (!activeChild) return;
    if (window.confirm(`Are you sure you want to delete ${activeChild.name}'s profile? All logs will be deleted.`)) {
      await deleteChild(activeChild.id);
      fetchParentData();
    }
  };

  const handleSaveReadingLog = async (logData) => {
    if (!activeChildId) return;
    await parentApi.createReadingLog(activeChildId, logData);
    fetchParentData();
  };

  const handleDeleteLog = async (logId) => {
    if (window.confirm("Are you sure you want to delete this reading log?")) {
      await parentApi.deleteReadingLog(activeChildId, logId);
      fetchParentData();
    }
  };

  // -------------------------------------------------------------
  // Render sub-views depending on active tab
  // -------------------------------------------------------------

  const renderDashboardTab = () => {
    const streak = dashboardData?.current_streak || 0;
    const booksRead = dashboardData?.total_books_read || 0;
    const totalMins = dashboardData?.total_minutes || 0;
    const weekDays = dashboardData?.weekly_activity || [
      { day: 'Mon', read: false, mins: 0 },
      { day: 'Tue', read: false, mins: 0 },
      { day: 'Wed', read: false, mins: 0 },
      { day: 'Thu', read: false, mins: 0 },
      { day: 'Fri', read: false, mins: 0 },
      { day: 'Sat', read: false, mins: 0 },
      { day: 'Sun', read: false, mins: 0 }
    ];
    const recentStories = dashboardData?.recent_stories || [];
    const storyIdeas = dashboardData?.story_ideas || [];
    const badgeList = achievements.length > 0 ? achievements : [
      { name: 'Bookworm', emoji: '📚', desc: 'Read 10+ stories', earned: false },
      { name: 'Explorer', emoji: '🧭', desc: 'Tried 3 genres', earned: false },
      { name: 'Bilingual', emoji: '🌍', desc: 'Read in 2 languages', earned: false },
      { name: 'Night Owl', emoji: '🦉', desc: '5 bedtime reads', earned: false },
      { name: 'Storyteller', emoji: '✍️', desc: 'Co-created a story', earned: false },
      { name: 'Champion', emoji: '🏆', desc: '7-day streak', earned: false },
    ];
    const earnedCount = badgeList.filter(b => b.earned).length;

    return (
      <>
        {/* Stats Summary Row */}
        <section className="parent-stats-row">
          <div className="card parent-stat-card">
            <div className="p-stat-icon fire-icon"><FaFire /></div>
            <div className="p-stat-info">
              <span className="p-stat-value">{streak} days</span>
              <span className="p-stat-label text-muted">Current Streak</span>
            </div>
          </div>
          <div className="card parent-stat-card">
            <div className="p-stat-icon book-icon"><FaBookOpen /></div>
            <div className="p-stat-info">
              <span className="p-stat-value">{booksRead}</span>
              <span className="p-stat-label text-muted">Stories Read</span>
            </div>
          </div>
          <div className="card parent-stat-card">
            <div className="p-stat-icon time-icon"><FaClock /></div>
            <div className="p-stat-info">
              <span className="p-stat-value">{totalMins}m</span>
              <span className="p-stat-label text-muted">Total Reading</span>
            </div>
          </div>
        </section>

        {/* Streak Calendar + Badges */}
        <section className="parent-two-col">
          {/* Weekly Streak Calendar */}
          <div className="card streak-card">
            <div className="streak-card-header">
              <h4>This Week's Reading Streak</h4>
              <span className="pill pill-accent"><FaFire style={{ marginRight: '4px' }} /> {streak}-day streak</span>
            </div>

            <div className="streak-calendar">
              {weekDays.map((d, idx) => (
                <div key={idx} className={`streak-day ${d.read ? 'read' : 'missed'}`}>
                  <div className="streak-day-label">{d.day}</div>
                  <div className="streak-day-circle">
                    {d.read ? <FaCheckCircle /> : <span className="missed-x">—</span>}
                  </div>
                  <div className="streak-day-mins">
                    {d.read ? `${d.mins}m` : '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Stories */}
            <div className="recent-stories-section">
              <div className="recent-stories-header">
                <h5 className="sub-section-title">Recent Reads</h5>
                <button onClick={() => setIsLogModalOpen(true)} className="btn-inline-log">
                  <FaPlus /> Log Session
                </button>
              </div>
              
              {recentStories.length === 0 ? (
                <p className="text-muted empty-inline-text">No recent reading logs found. Log a reading session to build your streak!</p>
              ) : (
                recentStories.map((story, idx) => (
                  <div key={idx} className="recent-story-row">
                    <div className="recent-story-info">
                      <span className="recent-story-title">{story.title}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{story.lang} · {story.date}</span>
                    </div>
                    <div className="recent-story-progress">
                      <div className="mini-progress-track">
                        <div className="mini-progress-fill" style={{ width: `${story.progress}%` }} />
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{story.progress}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dynamic Badges */}
          <div className="card badges-card">
            <div className="badges-card-header">
              <h4>{activeChild?.name}'s Achievements</h4>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                {earnedCount}/{badgeList.length} earned
              </span>
            </div>
            <div className="badges-grid">
              {badgeList.map((badge, idx) => (
                <div key={idx} className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}>
                  <div className="badge-emoji">{badge.emoji}</div>
                  <div className="badge-info">
                    <span className="badge-name">{badge.name}</span>
                    <span className="badge-desc text-muted">{badge.desc}</span>
                  </div>
                  {!badge.earned && <span className="badge-lock">🔒</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Co-Creation Ideas */}
        <section className="ideas-section">
          <div className="ideas-header">
            <div>
              <h4>Story Ideas for {activeChild?.name}</h4>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>AI-suggested prompts based on {activeChild?.name}'s reading level.</p>
            </div>
            <Link to="/create" className="btn btn-secondary">
              <FaMagic /> Custom Prompt
            </Link>
          </div>

          <div className="ideas-grid">
            {storyIdeas.map((idea, idx) => (
              <div key={idx} className="card idea-card">
                <div className="idea-theme-pill">
                  <span className="pill pill-accent">{idea.theme}</span>
                  <span className="pill pill-gold">{idea.difficulty}</span>
                </div>
                <p className="idea-prompt serif-heading">"{idea.prompt}"</p>
                <Link to="/create" className="idea-create-link">
                  Create this story <FaArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };

  const renderProfileTab = () => {
    if (!activeChild) return null;
    return (
      <div className="profile-tab-container animate-fade-in">
        <div className="card profile-main-card">
          <div className="profile-header-banner">
            <div className="profile-avatar-large">{activeChild.avatar || '👦'}</div>
            <div className="profile-header-info">
              <h2>{activeChild.name}</h2>
              <p className="text-muted">{activeChild.grade_level} · Age {activeChild.age} · {activeChild.preferred_language}</p>
            </div>
            <div className="profile-actions-top">
              <button onClick={handleOpenEditChild} className="btn btn-secondary">
                <FaEdit /> Edit Profile
              </button>
              <button onClick={handleDeleteActiveChild} className="btn btn-danger-outline">
                <FaTrash /> Delete Profile
              </button>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-detail-item">
              <span className="text-muted detail-label">Gender</span>
              <span className="detail-value">{activeChild.gender}</span>
            </div>
            <div className="profile-detail-item">
              <span className="text-muted detail-label">Grade Level</span>
              <span className="detail-value">{activeChild.grade_level}</span>
            </div>
            <div className="profile-detail-item">
              <span className="text-muted detail-label">Reading Language</span>
              <span className="detail-value">{activeChild.preferred_language}</span>
            </div>
            <div className="profile-detail-item">
              <span className="text-muted detail-label">Profile Created</span>
              <span className="detail-value">{new Date(activeChild.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLogsTab = () => {
    return (
      <div className="logs-tab-container animate-fade-in">
        <div className="logs-header">
          <div>
            <h2>Reading Logs — {activeChild?.name}</h2>
            <p className="text-muted">Track history, ratings, and time spent reading together.</p>
          </div>
          <button onClick={() => setIsLogModalOpen(true)} className="btn btn-primary">
            <FaPlus /> Add Reading Log
          </button>
        </div>

        {readingLogs.length === 0 ? (
          <div className="card empty-card">
            <FaBook className="empty-icon" />
            <h4>No Reading Logs Yet</h4>
            <p className="text-muted">Start tracking reading time to earn streaks and badges for {activeChild?.name}.</p>
            <button onClick={() => setIsLogModalOpen(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <FaPlus /> Log First Session
            </button>
          </div>
        ) : (
          <div className="card logs-table-card">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Story Title</th>
                  <th>Duration</th>
                  <th>Pages</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {readingLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.read_date}</td>
                    <td className="font-bold">{log.story_title || "Custom Story Read"}</td>
                    <td>{log.reading_time_minutes} mins</td>
                    <td>{log.pages_read} pages</td>
                    <td>{'⭐'.repeat(log.rating || 5)}</td>
                    <td>
                      <span className={`pill ${log.completed ? 'pill-mint' : 'pill-gold'}`}>
                        {log.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteLog(log.id)} className="btn-icon-delete" title="Delete log">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderLibraryTab = () => {
    return (
      <div className="library-tab-container animate-fade-in">
        <div className="library-header">
          <div>
            <h2>Story Library — {activeChild?.name}</h2>
            <p className="text-muted">Browse all AI-generated stories created for {activeChild?.name}.</p>
          </div>
          <Link to="/create" className="btn btn-primary">
            <FaMagic /> Create New Story
          </Link>
        </div>

        {childStories.length === 0 ? (
          <div className="card empty-card">
            <FaMagic className="empty-icon" />
            <h4>No Stories Created Yet</h4>
            <p className="text-muted">Generate interactive bilingual stories for {activeChild?.name} using Gemini AI.</p>
            <Link to="/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <FaMagic /> Create Story Now
            </Link>
          </div>
        ) : (
          <div className="story-library-grid">
            {childStories.map((story) => (
              <div key={story.id} className="card story-card">
                <div className="story-card-top">
                  <span className="pill pill-accent">{story.language || 'Bilingual'}</span>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(story.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="story-card-title">{story.title_en}</h4>
                <p className="story-card-title-hi">{story.title_hi}</p>
                <p className="story-card-meta text-muted">{story.num_pages} pages · {story.art_style} style</p>
                <div className="story-card-actions">
                  <Link to={`/story/${story.id}`} className="btn btn-secondary btn-full">
                    Read Story <FaArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderInsightsTab = () => {
    const totalTime = insightsData?.total_reading_time_mins || 0;
    const langDist = insightsData?.language_distribution || { Bilingual: 0, English: 0, Hindi: 0 };
    const recs = insightsData?.recommendations || [];

    return (
      <div className="insights-tab-container animate-fade-in">
        <div className="insights-header">
          <h2>Reading Insights — {activeChild?.name}</h2>
          <p className="text-muted">Analytics and AI recommendations to build strong reading habits.</p>
        </div>

        <div className="insights-grid">
          <div className="card insight-card">
            <h4>Total Time Invested</h4>
            <div className="insight-stat">{totalTime} mins</div>
            <p className="text-muted">Accumulated reading time logged for {activeChild?.name}.</p>
          </div>

          <div className="card insight-card">
            <h4>Language Mix</h4>
            <div className="lang-mix-list">
              <div className="lang-mix-item">
                <span>Bilingual</span>
                <span className="font-bold">{langDist.Bilingual} stories</span>
              </div>
              <div className="lang-mix-item">
                <span>English</span>
                <span className="font-bold">{langDist.English} stories</span>
              </div>
              <div className="lang-mix-item">
                <span>Hindi</span>
                <span className="font-bold">{langDist.Hindi} stories</span>
              </div>
            </div>
          </div>

          <div className="card insight-card recs-card">
            <h4><FaMagic style={{ color: 'var(--coral)', marginRight: '8px' }} /> Smart Recommendations</h4>
            <ul className="recs-list">
              {recs.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="parent" />

      <main className="dashboard-content">
        {/* Top Header */}
        <header className="parent-header">
          <div className="parent-header-left">
            <h2 className="serif-heading">{activeChild ? `${activeChild.name}'s Reading Hub` : "Parent Dashboard"}</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Track streaks, celebrate achievements, and create new stories together.
            </p>
          </div>

          <div className="parent-header-right">
            <ChildSelector
              childrenList={childrenList}
              activeChildId={activeChildId}
              onSelectChild={setActiveChildId}
              onOpenAddModal={handleOpenAddChild}
            />

            <Link to="/create" className="btn btn-primary btn-header-create">
              <FaMagic /> Create a Story
            </Link>
          </div>
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="dashboard-loading-state">
            <FaSpinner className="spinner-icon" />
            <p>Loading {activeChild?.name || 'child'}'s reading hub...</p>
          </div>
        ) : error ? (
          <div className="card error-banner">
            <FaExclamationTriangle className="error-icon" />
            <div>
              <h4>Oops! Could not load dashboard</h4>
              <p>{error}</p>
              <button onClick={fetchParentData} className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
                Retry
              </button>
            </div>
          </div>
        ) : !activeChild ? (
          <div className="card empty-card">
            <FaUser className="empty-icon" />
            <h4>No Child Profile Selected</h4>
            <p className="text-muted">Create a child profile to track reading streaks and custom AI stories.</p>
            <button onClick={handleOpenAddChild} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <FaPlus /> Create Child Profile
            </button>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && renderDashboardTab()}
            {currentTab === 'profile' && renderProfileTab()}
            {currentTab === 'logs' && renderLogsTab()}
            {currentTab === 'library' && renderLibraryTab()}
            {currentTab === 'insights' && renderInsightsTab()}
          </>
        )}
      </main>

      {/* Modals */}
      <ChildModal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        onSave={handleSaveChild}
        childToEdit={childToEdit}
      />

      <ReadingLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSave={handleSaveReadingLog}
        childName={activeChild?.name}
        stories={childStories}
      />
    </div>
  );
}
