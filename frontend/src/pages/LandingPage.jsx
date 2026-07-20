import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaMagic, 
  FaChalkboardTeacher, 
  FaUserShield, 
  FaBook, 
  FaArrowRight, 
  FaLock, 
  FaHeart
} from 'react-icons/fa';
import StoryBookPreview from '../components/StoryBookPreview';

export default function LandingPage() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (rolePath) => {
    setShowRoleModal(false);
    navigate(rolePath);
  };

  return (
    <div className="landing-container animate-fade-in">
      {/* Top Navigation */}
      <header className="landing-header">
        <div className="header-logo">
          <FaMagic className="logo-sparkle" />
          <span>StoryNest</span>
        </div>
        
        <nav className="header-nav">
          <a href="#product" className="nav-link">Product</a>
          <a href="#schools" className="nav-link">For Schools</a>
          <a href="#families" className="nav-link">For Parents</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </nav>

        <div className="header-actions">
          <button 
            className="btn btn-ghost"
            onClick={() => setShowRoleModal(true)}
          >
            Sign in
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRoleModal(true)}
          >
            Start free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="eyebrow-pill-container">
            <span className="pill pill-accent">
              <FaMagic style={{ marginRight: '6px' }} />
               storybooks
            </span>
          </div>

          <h1 className="serif-heading hero-title">
            One platform to create, teach and manage story-based learning
          </h1>

          <p className="hero-subtitle text-muted">
            Transform reading education by merging advanced generative storytelling with real-time analytics. Build confidence and language skills through custom-tailored tales.
          </p>

          <div className="hero-ctas">
            <Link to="/create" className="btn btn-primary">
              Create a story <FaArrowRight />
            </Link>
            <Link to="/story/1" className="btn btn-secondary">
              View demo
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">120K+</span>
              <span className="stat-label text-muted">Stories read</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-gold">98%</span>
              <span className="stat-label text-muted">Comprehension rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">450+</span>
              <span className="stat-label text-muted">Partner schools</span>
            </div>
          </div>
        </div>

        <div className="hero-preview">
          <StoryBookPreview />
        </div>
      </section>

      {/* Role Selection Showcase */}
      <section className="roles-section">
        <div className="section-header-centered">
          <h2 className="serif-heading section-title">Explore different workspaces</h2>
          <p className="section-subtitle text-muted">StoryNest adapts to classrooms, homes, and administrative offices seamlessly.</p>
        </div>

        <div className="grid-4 roles-grid">
          {/* Parent Card */}
          <div className="card role-card" onClick={() => navigate('/parent')}>
            <div className="role-icon-box parent-box">
              <FaHeart />
            </div>
            <h3 className="role-title">Parent Dashboard</h3>
            <p className="role-desc text-muted">Track reading streaks, explore custom story ideas, and practice spelling at home.</p>
            <div className="role-action-link">
              <span>Go to parent portal</span> <FaArrowRight />
            </div>
          </div>

          {/* Teacher Card */}
          <div className="card role-card" onClick={() => navigate('/teacher')}>
            <div className="role-icon-box teacher-box">
              <FaChalkboardTeacher />
            </div>
            <h3 className="role-title">Teacher Dashboard</h3>
            <p className="role-desc text-muted">Manage classes, assign custom vocabulary tests, and view reading logs.</p>
            <div className="role-action-link">
              <span>Go to teacher desk</span> <FaArrowRight />
            </div>
          </div>

          {/* Admin Card */}
          <div className="card role-card" onClick={() => navigate('/admin')}>
            <div className="role-icon-box admin-box">
              <FaUserShield />
            </div>
            <h3 className="role-title">Admin Analytics</h3>
            <p className="role-desc text-muted">Review school-wide metrics, export PDF summaries, and edit student enrollments.</p>
            <div className="role-action-link">
              <span>Go to admin console</span> <FaArrowRight />
            </div>
          </div>

          {/* AI Creator Card */}
          <div className="card role-card creator-card" onClick={() => navigate('/create')}>
            <div className="role-icon-box creator-box">
              <FaMagic />
            </div>
            <h3 className="role-title"> Story Creator</h3>
            <p className="role-desc text-muted">Generate instant bedtime stories with vocabulary parameters and matching art.</p>
            <div className="role-action-link">
              <span>Launch builder wizard</span> <FaArrowRight />
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Modal (Popup Sign-In) */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="serif-heading modal-title">Choose Your Workspace</h3>
            <p className="modal-subtitle text-muted">Select a dashboard role to experience the integrated platform:</p>
            
            <div className="modal-buttons">
              <button className="modal-role-btn" onClick={() => handleRoleSelect('/admin')}>
                <FaUserShield className="role-btn-icon admin-color" />
                <div className="role-btn-text">
                  <span className="role-btn-name">Admin Analytics</span>
                  <span className="role-btn-desc">Manage school rosters & view KPIs</span>
                </div>
              </button>
 
              <button className="modal-role-btn" onClick={() => handleRoleSelect('/teacher')}>
                <FaChalkboardTeacher className="role-btn-icon teacher-color" />
                <div className="role-btn-text">
                  <span className="role-btn-name">Teacher Console</span>
                  <span className="role-btn-desc">Roster grades & assign story readings</span>
                </div>
              </button>

              <button className="modal-role-btn" onClick={() => handleRoleSelect('/parent')}>
                <FaHeart className="role-btn-icon parent-color" />
                <div className="role-btn-text">
                  <span className="role-btn-name">Parent Portal</span>
                  <span className="role-btn-desc">Read at home & track homework streaks</span>
                </div>
              </button>

              <button className="modal-role-btn creator-btn-special" onClick={() => handleRoleSelect('/create')}>
                <FaMagic className="role-btn-icon creator-color" />
                <div className="role-btn-text">
                  <span className="role-btn-name">AI Story Wizard</span>
                  <span className="role-btn-desc">Generate tailored bedtime illustrations</span>
                </div>
              </button>
            </div>

            <button className="btn btn-outline close-modal-btn" onClick={() => setShowRoleModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="landing-footer-section">
        <div className="footer-content">
          <div className="footer-left">
            <div className="header-logo">
              <FaMagic className="logo-sparkle" />
              <span>StoryNest</span>
            </div>
            <p className="footer-tagline text-muted">Nurturing reading comprehension through interactive AI-assisted storytelling.</p>
          </div>
          <div className="footer-right">
            <span>© 2026 StoryNest Education Technologies. Crafted with love.</span>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-container {
          background-color: var(--bg-color);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 5rem;
          background-color: transparent;
          border-bottom: 1px solid var(--border-color);
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-serif);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .header-logo .logo-sparkle {
          color: var(--secondary-accent);
        }

        .header-nav {
          display: flex;
          gap: 2.5rem;
        }

        .nav-link {
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--text-muted);
          transition: var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--primary-accent);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* Hero Section Styling */
        .hero-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5rem 5rem 6rem 5rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          gap: 4rem;
        }

        .hero-content {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .eyebrow-pill-container {
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3.25rem;
          line-height: 1.15;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .hero-subtitle {
          font-size: 1.15rem;
          line-height: 1.6;
          margin-bottom: 2.5rem;
          max-width: 600px;
        }

        .hero-ctas {
          display: flex;
          gap: 1rem;
          margin-bottom: 3.5rem;
        }

        .hero-stats {
          display: flex;
          gap: 3rem;
          border-top: 1px solid var(--border-color);
          padding-top: 2rem;
          width: 100%;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .hero-preview {
          flex: 0.8;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Roles Section */
        .roles-section {
          background-color: var(--surface-color);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 6rem 5rem;
          width: 100%;
        }

        .section-header-centered {
          text-align: center;
          margin-bottom: 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title {
          font-size: 2.25rem;
          color: var(--text-primary);
        }

        .section-subtitle {
          max-width: 600px;
          font-size: 1.05rem;
        }

        .roles-grid {
          max-width: 1200px;
          margin: 0 auto;
        }

        .role-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          min-height: 280px;
        }

        .role-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .parent-box {
          background-color: #FDF2F2;
          color: var(--danger-color);
        }

        .teacher-box {
          background-color: var(--soft-accent-bg);
          color: var(--primary-accent);
        }

        .admin-box {
          background-color: #FAF2DF;
          color: var(--secondary-accent);
        }

        .creator-box {
          background-color: #E2ECF7;
          color: #2F649A;
        }

        .role-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .role-desc {
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .role-action-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary-accent);
          transition: var(--transition-fast);
        }

        .role-card:hover .role-action-link {
          gap: 0.75rem;
        }

        .creator-card {
          border-color: #D2E4F9;
        }

        /* Modal / Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(47, 59, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          max-width: 520px;
          width: 90%;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
        }

        .modal-title {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .modal-subtitle {
          font-size: 0.95rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .modal-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .modal-role-btn {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background-color: var(--bg-color);
          text-align: left;
          transition: var(--transition-smooth);
        }

        .modal-role-btn:hover {
          transform: translateY(-2px);
          border-color: var(--primary-accent);
          box-shadow: var(--shadow-sm);
        }

        .creator-btn-special {
          background-color: #F0F6FC;
          border-color: #D2E4F9;
        }

        .creator-btn-special:hover {
          border-color: #2F649A;
        }

        .role-btn-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .admin-color { color: var(--secondary-accent); }
        .teacher-color { color: var(--primary-accent); }
        .parent-color { color: var(--danger-color); }
        .creator-color { color: #2F649A; }

        .role-btn-text {
          display: flex;
          flex-direction: column;
        }

        .role-btn-name {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .role-btn-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .close-modal-btn {
          align-self: center;
        }

        /* Footer Section */
        .landing-footer-section {
          background-color: var(--bg-color);
          padding: 3.5rem 5rem;
          border-top: 1px solid var(--border-color);
          width: 100%;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .footer-tagline {
          font-size: 0.85rem;
          margin-top: 0.5rem;
          max-width: 320px;
        }

        .footer-right {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        /* Responsive Layouts */
        @media (max-width: 1024px) {
          .landing-header {
            padding: 1.5rem 2rem;
          }
          .hero-section {
            flex-direction: column;
            padding: 3rem 2rem 5rem 2rem;
            text-align: center;
            gap: 3rem;
          }
          .hero-content {
            align-items: center;
          }
          .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-stats {
            justify-content: center;
          }
          .roles-section {
            padding: 4rem 2rem;
          }
          .landing-footer-section {
            padding: 3rem 2rem;
          }
          .footer-content {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-stats {
            flex-direction: column;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
