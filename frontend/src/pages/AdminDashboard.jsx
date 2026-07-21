import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import LineChart from '../components/LineChart';
import { 
  FaUserPlus, 
  FaFileDownload, 
  FaArrowUp, 
  FaCheckCircle, 
  FaSearch, 
  FaBell 
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';

export default function AdminDashboard() {
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Stats Grid Data
  const stats = [
    { label: 'New Students', value: '128', delta: '+12%', desc: 'this week' },
    { label: 'Total Students', value: '1,420', delta: '+4.2%', desc: 'active base' },
    { label: 'Stories Created', value: '3,892', delta: '+18.5%', desc: 'by AI engine' },
    { label: 'Avg Reading Time', value: '38.5m', delta: '+8.1%', desc: 'per student/day' }
  ];

  // Agenda Data
  const agendaItems = [
    { time: '08:30 AM', title: 'System Backups & Prompt Optimizations', type: 'system', desc: 'Auto-tuning GPT models for spelling parameters.' },
    { time: '10:00 AM', title: 'School Board Analytics Review', type: 'board', desc: 'Presenting weekly progress and comprehension curves.' },
    { time: '01:30 PM', title: 'Parent Portal Feedback Synthesis', type: 'feedback', desc: 'Reviewing Leo and Emma\'s customized story logs.' },
    { time: '04:00 PM', title: 'Server Maintenance Window', type: 'maintenance', desc: 'Scheduled database indexing for high concurrency.' }
  ];

  // Generate and Download PDF Report
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(47, 59, 42); // Primary green (#2F3B2A)
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('STORYNEST EDUCATION PLATFORM', 15, 20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('ADMINISTRATIVE SCHOOL PERFORMANCE REPORT', 15, 30);
      
      // Report Date
      doc.setTextColor(47, 59, 42);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 140, 50);

      // Section 1: Dashboard KPIs
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Core Metrics Summary', 15, 60);
      doc.line(15, 63, 195, 63);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Category', 15, 75);
      doc.text('Value', 85, 75);
      doc.text('Growth Rate (W-o-W)', 140, 75);
      doc.line(15, 78, 195, 78);

      let currentY = 85;
      stats.forEach(stat => {
        doc.text(stat.label, 15, currentY);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value, 85, currentY);
        doc.setTextColor(181, 130, 42); // Secondary accent gold
        doc.text(stat.delta, 140, currentY);
        doc.setTextColor(47, 59, 42); // Restore green
        doc.setFont('helvetica', 'normal');
        currentY += 10;
      });

      // Section 2: Platform Status
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('2. System Health & Agenda', 15, currentY + 15);
      doc.line(15, currentY + 18, 195, currentY + 18);

      currentY += 28;
      agendaItems.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.time} — ${item.title}`, 15, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(item.desc, 15, currentY + 5);
        doc.setFontSize(11);
        currentY += 15;
      });

      // Footer
      doc.setFillColor(239, 231, 211); // #EFE7D3
      doc.rect(0, 275, 210, 22, 'F');
      doc.setTextColor(47, 59, 42);
      doc.setFontSize(8);
      doc.text('StoryNest AI Storybooks © 2026. All rights reserved. Confidential document.', 15, 285);
      
      // Save PDF
      doc.save('StoryNest_School_Report.pdf');
      setSuccessMessage('Report downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('PDF Generation Failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="admin" />

      <main className="dashboard-content">
        {/* Top Navbar */}
        <header className="dashboard-top-nav">
          <div className="top-nav-left">
            <h2 className="serif-heading dashboard-welcome">Welcome back, Chief Admin</h2>
            <p className="text-muted font-sm">Platform status is healthy. 2 servers online.</p>
          </div>
          <div className="top-nav-right">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search student records..." />
            </div>
            <button className="top-nav-btn bell-btn" title="View alerts">
              <FaBell />
              <span className="bell-badge"></span>
            </button>
            <div className="admin-profile-avatar">CA</div>
          </div>
        </header>

        {/* Action Header Banner */}
        <section className="action-banner-row">
          {successMessage && (
            <div className="toast-success">
              <FaCheckCircle /> <span>{successMessage}</span>
            </div>
          )}
          
          <div className="action-buttons-group">
            <button 
              className="btn btn-primary" 
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              <FaFileDownload /> {isExporting ? 'Exporting PDF...' : 'Export PDF Report'}
            </button>
            <button className="btn btn-secondary">
              <FaUserPlus /> Create Account
            </button>
          </div>
        </section>

        {/* 4-Up Stat Grid */}
        <section className="grid-4 stats-grid-row">
          {stats.map((stat, idx) => (
            <div key={idx} className="card stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label text-muted">{stat.label}</span>
                <span className="stat-card-delta">
                  <FaArrowUp style={{ fontSize: '0.75rem', marginRight: '2px' }} />
                  {stat.delta}
                </span>
              </div>
              <div className="stat-card-value-row">
                <span className="stat-card-value serif-heading">{stat.value}</span>
                <span className="stat-card-desc text-muted">{stat.desc}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Main Panel Content (Chart + Agenda Grid) */}
        <section className="dashboard-main-columns">
          {/* Chart Column */}
          <div className="column-left">
            <LineChart />
          </div>

          {/* Agenda Column */}
          <div className="column-right">
            <div className="card agenda-card">
              <div className="agenda-header">
                <h4 className="agenda-title">Today's Agenda</h4>
                <span className="pill pill-accent">4 tasks remaining</span>
              </div>
              
              <div className="agenda-list">
                {agendaItems.map((item, idx) => (
                  <div key={idx} className={`agenda-item-box border-${item.type}`}>
                    <div className="agenda-item-time">{item.time}</div>
                    <div className="agenda-item-content">
                      <h5 className="agenda-item-title">{item.title}</h5>
                      <p className="agenda-item-desc text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .dashboard-top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid var(--border-color);
        }

        .dashboard-welcome {
          font-size: 1.8rem;
          color: var(--text-primary);
        }

        .font-sm {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .top-nav-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
          font-size: 1rem;
        }

        .search-bar input {
          padding: 0.65rem 1rem 0.65rem 2.5rem;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-full);
          background-color: var(--surface-color);
          font-size: 0.9rem;
          font-weight: 600;
          width: 240px;
          transition: var(--transition-bounce);
        }

        .search-bar input:focus {
          outline: none;
          border-color: var(--coral);
          width: 280px;
          box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.12);
        }

        .bell-btn {
          position: relative;
          padding: 0.65rem;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          background-color: var(--surface-color);
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .bell-btn:hover {
          border-color: var(--coral);
          color: var(--coral);
        }

        .bell-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 9px;
          height: 9px;
          background-color: var(--coral);
          border-radius: 50%;
          border: 2px solid #FFFFFF;
        }

        .admin-profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--coral), var(--pink));
          color: #FFFFFF;
          font-weight: 800;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-glow-coral);
        }

        .action-banner-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          gap: 1rem;
        }

        .action-buttons-group {
          display: flex;
          gap: 1rem;
          margin-left: auto;
        }

        .toast-success {
          background-color: var(--mint-light);
          color: var(--mint);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          border: 2px solid rgba(107, 203, 119, 0.15);
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          box-shadow: var(--shadow-sm);
          animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Stat Grid Card Customizations */
        .stats-grid-row {
          margin-bottom: 3rem;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-radius: var(--radius-md);
        }

        .stat-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-card-label {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-card-delta {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--coral);
          background-color: var(--coral-light);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
        }

        .stat-card-value-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }

        .stat-card-value {
          font-size: 2.5rem;
          color: var(--text-primary);
          font-weight: 800;
          font-family: var(--font-display);
        }

        .stat-card-desc {
          font-size: 0.8rem;
          font-weight: 700;
        }

        /* Dashboard main grid columns */
        .dashboard-main-columns {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 2rem;
        }

        .column-left {
          display: flex;
          flex-direction: column;
        }

        .column-right {
          display: flex;
          flex-direction: column;
        }

        /* Agenda Card Customizations */
        .agenda-card {
          padding: 1.75rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-md);
        }

        .agenda-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
        }

        .agenda-title {
          font-size: 1.25rem;
          color: var(--text-primary);
          font-weight: 800;
        }

        .agenda-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          flex: 1;
        }

        .agenda-item-box {
          display: flex;
          gap: 1rem;
          padding-left: 1.25rem;
          border-left: 4px solid var(--border-color);
          transition: var(--transition-bounce);
        }

        .agenda-item-box:hover {
          transform: translateX(6px);
        }

        /* Left-border colors based on item type */
        .border-system { border-left-color: var(--coral); }
        .border-board { border-left-color: var(--orange); }
        .border-feedback { border-left-color: var(--sky); }
        .border-maintenance { border-left-color: var(--purple); }

        .agenda-item-time {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-muted);
          width: 75px;
          flex-shrink: 0;
          text-align: right;
        }

        .agenda-item-content {
          display: flex;
          flex-direction: column;
        }

        .agenda-item-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .agenda-item-desc {
          font-size: 0.85rem;
          line-height: 1.5;
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .dashboard-main-columns {
            grid-template-columns: 1fr;
          }
          .action-banner-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .action-buttons-group {
            margin-left: 0;
            width: 100%;
          }
          .action-buttons-group button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
