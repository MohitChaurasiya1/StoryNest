import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../../../services/teacherDashboardService';
import DashboardSkeleton from './DashboardSkeleton';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import AttentionSection from './AttentionSection';
import ClassroomOverview from './ClassroomOverview';
import UpcomingAssignments from './UpcomingAssignments';
import RecentActivity from './RecentActivity';
import { FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      setError(err.message || 'We couldn\'t load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <FaSpinner className="spinner-icon" />
        <p>Loading your classroom hub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card error-banner">
        <FaExclamationTriangle className="error-icon" />
        <div>
          <h4>Oops! Could not load dashboard</h4>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-fade-in">
      <DashboardHeader teacherName={data.teacher.name} />
      
      <DashboardStats summary={data.summary} />
      
      <div className="grid-3 mb-8">
        <div style={{ gridColumn: 'span 2' }} className="flex flex-col gap-8">
          <QuickActions onUpdateDashboard={fetchDashboardData} />
          <AttentionSection items={data.attention_items} />
          <ClassroomOverview classrooms={data.classrooms} />
        </div>
        
        <div className="flex flex-col gap-8">
          <UpcomingAssignments assignments={data.upcoming_assignments} />
          <RecentActivity activities={data.recent_activity} />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
