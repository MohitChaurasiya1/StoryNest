import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  FaFire, 
  FaTrophy, 
  FaStar, 
  FaBookOpen, 
  FaArrowRight, 
  FaCheckCircle, 
  FaClock,
  FaHeart,
  FaMagic
} from 'react-icons/fa';

export default function ParentDashboard() {
  // Leo's 7-day streak data
  const weekDays = [
    { day: 'Mon', read: true, mins: 32 },
    { day: 'Tue', read: true, mins: 45 },
    { day: 'Wed', read: true, mins: 28 },
    { day: 'Thu', read: false, mins: 0 },
    { day: 'Fri', read: true, mins: 38 },
    { day: 'Sat', read: true, mins: 55 },
    { day: 'Sun', read: true, mins: 42 },
  ];

  const currentStreak = 3;
  const totalBooksRead = 14;
  const totalMinutes = 240;

  const badges = [
    { name: 'Bookworm', emoji: '📚', desc: 'Read 10+ stories', earned: true },
    { name: 'Explorer', emoji: '🧭', desc: 'Tried 3 genres', earned: true },
    { name: 'Bilingual', emoji: '🌍', desc: 'Read in 2 languages', earned: true },
    { name: 'Night Owl', emoji: '🦉', desc: '5 bedtime reads', earned: false },
    { name: 'Storyteller', emoji: '✍️', desc: 'Co-created a story', earned: false },
    { name: 'Champion', emoji: '🏆', desc: '30-day streak', earned: false },
  ];

  const recentStories = [
    { title: 'Leo and the Golden Tree', lang: 'EN/ES', date: 'Today', progress: 100 },
    { title: 'The Brave Little Acorn', lang: 'EN', date: 'Yesterday', progress: 100 },
    { title: 'Ocean Friends', lang: 'EN/ES', date: 'Jul 14', progress: 65 },
  ];

  const storyIdeas = [
    { prompt: 'A friendly dragon who learns to bake cookies', theme: 'Kindness', difficulty: 'Grade 1' },
    { prompt: 'Two siblings who discover a map inside an old clock', theme: 'Adventure', difficulty: 'Grade 2' },
    { prompt: 'A shy caterpillar who finds its singing voice', theme: 'Confidence', difficulty: 'Grade 1' },
  ];

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="parent" />

      <main className="dashboard-content">
        {/* Header */}
        <header className="parent-header">
          <div className="parent-header-left">
            <h2 className="serif-heading">Leo's Reading Hub</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Track streaks, celebrate achievements, and create new stories together.
            </p>
          </div>
          <div className="parent-header-right">
            <Link to="/create" className="btn btn-primary">
              <FaMagic /> Create a Story
            </Link>
          </div>
        </header>

        {/* Stats Summary Row */}
        <section className="parent-stats-row">
          <div className="card parent-stat-card">
            <div className="p-stat-icon fire-icon"><FaFire /></div>
            <div className="p-stat-info">
              <span className="p-stat-value">{currentStreak} days</span>
              <span className="p-stat-label text-muted">Current Streak</span>
            </div>
          </div>
          <div className="card parent-stat-card">
            <div className="p-stat-icon book-icon"><FaBookOpen /></div>
            <div className="p-stat-info">
              <span className="p-stat-value">{totalBooksRead}</span>
              <span className="p-stat-label text-muted">Stories Read</span>
            </div>
          </div>
          <div className="card parent-stat-card">
            <div className="p-stat-icon time-icon"><FaClock /></div>
            <div className="p-stat-info">
              <span className="p-stat-value">{totalMinutes}m</span>
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
              <span className="pill pill-accent"><FaFire style={{ marginRight: '4px' }} /> {currentStreak}-day streak</span>
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
              <h5 className="sub-section-title">Recent Reads</h5>
              {recentStories.map((story, idx) => (
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
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="card badges-card">
            <div className="badges-card-header">
              <h4>Leo's Achievements</h4>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                {badges.filter(b => b.earned).length}/{badges.length} earned
              </span>
            </div>
            <div className="badges-grid">
              {badges.map((badge, idx) => (
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
              <h4>Story Ideas for Leo</h4>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>AI-suggested prompts based on Leo's interests and reading level.</p>
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
      </main>

      <style>{`
        .parent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .parent-header .serif-heading {
          font-size: 1.75rem;
        }

        /* Stats Row */
        .parent-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .parent-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
        }

        .p-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .fire-icon { background-color: #FFF4E6; color: #E67E22; }
        .book-icon { background-color: var(--soft-accent-bg); color: var(--primary-accent); }
        .time-icon { background-color: #FAF2DF; color: var(--secondary-accent); }

        .p-stat-info {
          display: flex;
          flex-direction: column;
        }

        .p-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .p-stat-label {
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* Two column */
        .parent-two-col {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        /* Streak Card */
        .streak-card {
          padding: 1.5rem;
        }

        .streak-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .streak-card-header h4 {
          font-size: 1.1rem;
        }

        .streak-calendar {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .streak-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .streak-day-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .streak-day-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          transition: var(--transition-smooth);
        }

        .streak-day.read .streak-day-circle {
          background-color: var(--soft-accent-bg);
          color: var(--primary-accent);
        }

        .streak-day.missed .streak-day-circle {
          background-color: var(--bg-color);
          color: var(--text-muted);
          border: 1px dashed var(--border-color);
        }

        .streak-day-mins {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .missed-x {
          font-weight: 700;
          color: var(--text-muted);
        }

        /* Recent Stories */
        .sub-section-title {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .recent-story-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.65rem 0;
          border-bottom: 1px solid var(--bg-color);
        }

        .recent-story-info {
          display: flex;
          flex-direction: column;
        }

        .recent-story-title {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .recent-story-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mini-progress-track {
          width: 60px;
          height: 4px;
          background-color: var(--bg-color);
          border-radius: 9999px;
          overflow: hidden;
        }

        .mini-progress-fill {
          height: 100%;
          background-color: var(--primary-accent);
          border-radius: 9999px;
        }

        /* Badges Card */
        .badges-card {
          padding: 1.5rem;
        }

        .badges-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .badges-card-header h4 {
          font-size: 1.1rem;
        }

        .badges-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .badge-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.75rem;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
        }

        .badge-item:hover {
          background-color: var(--bg-color);
        }

        .badge-item.locked {
          opacity: 0.5;
        }

        .badge-emoji {
          font-size: 1.5rem;
          width: 36px;
          text-align: center;
          flex-shrink: 0;
        }

        .badge-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .badge-name {
          font-size: 0.9rem;
          font-weight: 700;
        }

        .badge-desc {
          font-size: 0.75rem;
        }

        .badge-lock {
          font-size: 0.9rem;
        }

        /* Story Ideas */
        .ideas-section {
          margin-bottom: 2rem;
        }

        .ideas-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .ideas-header h4 {
          font-size: 1.1rem;
          margin-bottom: 0.15rem;
        }

        .ideas-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .idea-card {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
        }

        .idea-theme-pill {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .idea-prompt {
          font-size: 1.05rem;
          line-height: 1.4;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          flex: 1;
        }

        .idea-create-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary-accent);
          transition: var(--transition-fast);
        }

        .idea-create-link:hover {
          gap: 0.65rem;
        }

        @media (max-width: 1024px) {
          .parent-two-col {
            grid-template-columns: 1fr;
          }
          .parent-stats-row {
            grid-template-columns: 1fr;
          }
          .ideas-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
