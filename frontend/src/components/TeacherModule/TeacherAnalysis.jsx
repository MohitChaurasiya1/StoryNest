import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../../services/api';
import LineChart from '../LineChart';
import DonutChart from '../DonutChart';
import { FaChartLine, FaClock, FaTrophy, FaExclamationTriangle, FaDownload } from 'react-icons/fa';
import './TeacherModule.css';

export default function TeacherAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const res = await teacherAPI.getAnalysis();
      setData(res);
    } catch (err) {
      console.error('Error fetching teacher analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-view-container animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="text-muted">Loading class analysis data...</p>
      </div>
    );
  }

  const overview = data?.overview || {
    total_reading_hours: 5.6,
    avg_comprehension_accuracy: 84.5,
    stories_completed_this_month: 68,
    active_reading_streak_days: 12
  };

  const distribution = data?.distribution || {
    high_performers: 14,
    mid_performers: 7,
    low_performers: 3
  };

  const topics = data?.comprehension_topics || [
    { topic: 'Vocabulary Retention', score: 88 },
    { topic: 'Plot Identification', score: 82 },
    { topic: 'Moral & Inference', score: 76 },
    { topic: 'Hindi Word Translation', score: 91 },
  ];

  return (
    <div className="teacher-view-container animate-fade-in">
      <div className="teacher-view-header">
        <div>
          <h3>Class Performance & Analytics</h3>
          <p>Real-time insights into student comprehension, reading velocity, and topic mastery.</p>
        </div>
        <button 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#7C3AED', color: '#FFF', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
          onClick={() => alert('Downloading Class Analytical Report (PDF)...')}
        >
          <FaDownload /> Download PDF Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="teacher-stats-grid">
        <div className="teacher-stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{overview.total_reading_hours} hrs</div>
            <div className="stat-label">Total Reading Time</div>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <div className="stat-value">{overview.avg_comprehension_accuracy}%</div>
            <div className="stat-label">Quiz Accuracy</div>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <FaTrophy />
          </div>
          <div className="stat-content">
            <div className="stat-value">{overview.stories_completed_this_month}</div>
            <div className="stat-label">Stories Completed</div>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{distribution.low_performers} Students</div>
            <div className="stat-label">Need Intervention</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="analysis-charts-row">
        {/* Line Chart */}
        <div className="analysis-card">
          <div className="analysis-card-title">
            <h4>Weekly Reading Engagement</h4>
            <span className="pill pill-accent">Past 7 Days</span>
          </div>
          <LineChart />
        </div>

        {/* Donut Chart */}
        <div className="analysis-card">
          <div className="analysis-card-title">
            <h4>Student Performance Split</h4>
          </div>
          <DonutChart />
        </div>
      </div>

      {/* Topic Mastery Section */}
      <div className="analysis-card" style={{ marginBottom: '2rem' }}>
        <div className="analysis-card-title">
          <h4>Key Learning Objectives Mastery</h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {topics.map((t, idx) => (
            <div key={idx} className="topic-progress-item">
              <div className="topic-header">
                <span>{t.topic}</span>
                <span>{t.score}%</span>
              </div>
              <div className="topic-track">
                <div 
                  className="topic-fill" 
                  style={{ 
                    width: `${t.score}%`, 
                    backgroundColor: idx % 2 === 0 ? '#7C3AED' : '#2563EB' 
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
