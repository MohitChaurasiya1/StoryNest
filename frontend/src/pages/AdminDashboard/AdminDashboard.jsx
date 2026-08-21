import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import LineChart from '../../components/LineChart';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FaFileDownload, 
  FaCheckCircle, 
  FaSearch, 
  FaShieldAlt,
  FaUserCheck,
  FaUserTimes,
  FaHistory,
  FaUsers,
  FaSpinner,
  FaSync,
  FaLock,
  FaUnlock,
  FaBook,
  FaQuestionCircle,
  FaChild,
  FaEye,
  FaTimes,
  FaExclamationTriangle,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCalendarAlt,
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const { tab: urlTab } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromLocation = () => {
    if (urlTab && ['overview', 'users', 'audit'].includes(urlTab)) return urlTab;
    const hash = location.hash.replace('#', '');
    if (['overview', 'users', 'audit'].includes(hash)) return hash;
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromLocation);

  useEffect(() => {
    const currentTab = getTabFromLocation();
    setActiveTab(currentTab);
  }, [urlTab, location.hash, location.pathname]);

  const handleTabSelect = (newTab) => {
    setActiveTab(newTab);
    navigate(`/admin/${newTab}`);
  };
  
  // Data states
  const [statsData, setStatsData] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  // Loading & error states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [logsError, setLogsError] = useState(null);
  const [usersError, setUsersError] = useState(null);

  // Filters
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('');
  
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');

  // Modals
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [userDetailError, setUserDetailError] = useState(null);
  
  const [userToToggle, setUserToToggle] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  // Notifications
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync hash route with activeTab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'users', 'audit'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchActivityLogs();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const res = await adminAPI.getStats();
      setStatsData(res);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setStatsError(err.response?.data?.detail || 'Failed to load system statistics.');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchActivityLogs = async (params = {}) => {
    try {
      setLoadingLogs(true);
      setLogsError(null);
      const res = await adminAPI.getActivityLogs({
        search: params.search !== undefined ? params.search : logSearch,
        action: params.action !== undefined ? params.action : logActionFilter,
      });
      setActivityLogs(res || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      setLogsError(err.response?.data?.detail || 'Failed to load activity logs.');
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchUsers = async (params = {}) => {
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const res = await adminAPI.getUsers({
        search: params.search !== undefined ? params.search : userSearch,
        role: params.role !== undefined ? params.role : userRoleFilter,
        status: params.status !== undefined ? params.status : userStatusFilter,
      });
      setUsersList(res || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsersError(err.response?.data?.detail || 'Failed to load user directory.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Inspect detailed user info
  const handleViewUserDetail = async (userId) => {
    try {
      setLoadingUserDetail(true);
      setUserDetailError(null);
      const res = await adminAPI.getUserDetail(userId);
      setSelectedUserDetail(res);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setUserDetailError(err.response?.data?.detail || 'Could not fetch details for this user.');
    } finally {
      setLoadingUserDetail(false);
    }
  };

  // Confirm and toggle active status
  const confirmToggleUserStatus = async () => {
    if (!userToToggle) return;
    try {
      setIsToggling(true);
      const res = await adminAPI.toggleUserActive(userToToggle.id);
      setSuccessMessage(res.detail || `Updated status for ${userToToggle.username}`);
      setTimeout(() => setSuccessMessage(''), 4000);
      
      setUserToToggle(null);
      fetchUsers();
      fetchStats();
      if (selectedUserDetail && selectedUserDetail.user.id === userToToggle.id) {
        handleViewUserDetail(userToToggle.id);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update user status.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setIsToggling(false);
    }
  };

  // Generate and Download PDF Report
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Header Banner
      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('STORYNEST PLATFORM AUDIT REPORT', 15, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('ADMINISTRATIVE USER ACCESS & SYSTEM AUDIT SUMMARY', 15, 30);
      
      // Timestamp
      doc.setTextColor(47, 59, 42);
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 125, 50);

      // Section 1: Dashboard KPIs
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('1. System Performance Summary', 15, 60);
      doc.line(15, 63, 195, 63);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Registered Users: ${statsData?.total_users || 0}`, 15, 73);
      doc.text(`Active Accounts: ${statsData?.active_users || 0} | Inactive Accounts: ${statsData?.inactive_users || 0}`, 15, 81);
      doc.text(`Role Breakdown - Parents: ${statsData?.roles_breakdown?.parents || 0} | Teachers: ${statsData?.roles_breakdown?.teachers || 0} | Admins: ${statsData?.roles_breakdown?.admins || 0}`, 15, 89);
      doc.text(`Platform Assets - Children: ${statsData?.platform_stats?.total_children || 0} | Stories: ${statsData?.platform_stats?.total_stories || 0} | Quizzes: ${statsData?.platform_stats?.total_quizzes || 0}`, 15, 97);
      doc.text(`Signups Today: ${statsData?.new_users_today || 0} | Unique Logins Today: ${statsData?.logins_today || 0}`, 15, 105);

      // Section 2: Audit Activity Logs
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Recent System Audit Trail', 15, 120);
      doc.line(15, 123, 195, 123);

      let currentY = 133;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('User', 15, currentY);
      doc.text('Role', 60, currentY);
      doc.text('Action', 95, currentY);
      doc.text('Timestamp', 140, currentY);
      doc.line(15, currentY + 2, 195, currentY + 2);

      currentY += 10;
      doc.setFont('helvetica', 'normal');
      activityLogs.slice(0, 15).forEach(log => {
        const formattedDate = new Date(log.timestamp).toLocaleString();
        doc.text((log.username || log.email || 'User').substring(0, 20), 15, currentY);
        doc.text(log.user_role || 'USER', 60, currentY);
        doc.text(log.action, 95, currentY);
        doc.text(formattedDate, 140, currentY);
        currentY += 8;
      });

      doc.save('StoryNest_System_Audit_Report.pdf');
      setSuccessMessage('Audit Report downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('PDF Generation Failed', error);
      setErrorMessage('Failed to generate PDF report.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'LOGIN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">Logged In</span>;
      case 'SIGNUP':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">Signed Up</span>;
      case 'USER_ACTIVATED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">User Activated</span>;
      case 'USER_DEACTIVATED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">User Deactivated</span>;
      case 'PASSWORD_RESET_REQUEST':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">OTP Requested</span>;
      case 'PASSWORD_RESET_SUCCESS':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">Password Reset</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{action}</span>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"><FaShieldAlt /> ADMIN</span>;
      case 'TEACHER':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300"><FaChalkboardTeacher /> TEACHER</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300"><FaUsers /> PARENT</span>;
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="admin" />

      <main className="dashboard-content">
        {/* Top Header Navbar */}
        <header className="dashboard-top-nav">
          <div className="top-nav-left">
            <h2 className="serif-heading dashboard-welcome">Admin Command Center</h2>
            <p className="text-muted font-sm">Platform metrics, user management, and security audit trail.</p>
          </div>
          <div className="top-nav-right">
            <button 
              className="top-nav-btn bell-btn" 
              onClick={() => { fetchStats(); fetchActivityLogs(); fetchUsers(); }}
              title="Refresh platform data"
            >
              <FaSync className={`text-slate-600 dark:text-slate-300 ${loadingStats ? 'animate-spin' : ''}`} />
            </button>
            <div className="admin-profile-avatar" title={currentUser?.username}>
              {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : 'AD'}
            </div>
          </div>
        </header>

        {/* Global Toast Banners */}
        {successMessage && (
          <div className="toast-success mb-4 p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm">
            <FaCheckCircle className="text-emerald-600" /> <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-rose-100 text-rose-900 border border-rose-300 rounded-xl flex items-center gap-2 text-sm font-semibold mb-4 shadow-sm">
            <FaExclamationTriangle className="text-rose-600" /> <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Header Banner */}
        <section className="action-banner-row flex items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">System Monitoring</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Real-Time Platform Controls</h3>
          </div>
          <button 
            className="btn btn-primary flex items-center gap-2" 
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <FaFileDownload /> {isExporting ? 'Generating PDF...' : 'Export System PDF Report'}
          </button>
        </section>

        {/* 4-Up Core KPI Cards */}
        <section className="grid-4 stats-grid-row">
          <div className="card stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label text-muted">Total Platform Users</span>
              <span className="stat-card-delta text-emerald-600 font-semibold flex items-center gap-1">
                <FaUserCheck className="text-xs" /> Real-time
              </span>
            </div>
            <div className="stat-card-value-row">
              <span className="stat-card-value serif-heading">
                {loadingStats ? <FaSpinner className="animate-spin text-lg" /> : statsData?.total_users || 0}
              </span>
              <span className="stat-card-desc text-muted">
                {statsData?.active_users || 0} Active • {statsData?.inactive_users || 0} Disabled
              </span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label text-muted">User Roles Breakdown</span>
              <span className="stat-card-delta text-indigo-600 font-semibold">Registered</span>
            </div>
            <div className="stat-card-value-row">
              <span className="stat-card-value serif-heading text-indigo-600 dark:text-indigo-400">
                {loadingStats ? <FaSpinner className="animate-spin text-lg" /> : (statsData?.roles_breakdown?.parents || 0) + (statsData?.roles_breakdown?.teachers || 0)}
              </span>
              <span className="stat-card-desc text-muted">
                {statsData?.roles_breakdown?.parents || 0} Parents, {statsData?.roles_breakdown?.teachers || 0} Teachers, {statsData?.roles_breakdown?.admins || 0} Admins
              </span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label text-muted">Children & Students</span>
              <span className="stat-card-delta text-purple-600 font-semibold">Enrolled</span>
            </div>
            <div className="stat-card-value-row">
              <span className="stat-card-value serif-heading text-purple-600 dark:text-purple-400">
                {loadingStats ? <FaSpinner className="animate-spin text-lg" /> : statsData?.platform_stats?.total_children || 0}
              </span>
              <span className="stat-card-desc text-muted">
                Active child learning profiles
              </span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label text-muted">AI Stories & Quizzes</span>
              <span className="stat-card-delta text-amber-600 font-semibold">Generated</span>
            </div>
            <div className="stat-card-value-row">
              <span className="stat-card-value serif-heading text-amber-600 dark:text-amber-400">
                {loadingStats ? <FaSpinner className="animate-spin text-lg" /> : statsData?.platform_stats?.total_stories || 0}
              </span>
              <span className="stat-card-desc text-muted">
                {statsData?.platform_stats?.total_quizzes || 0} Quizzes • {statsData?.platform_stats?.total_reading_logs || 0} Logs
              </span>
            </div>
          </div>
        </section>

        {/* Active View Container (Controlled by Left Sidebar) */}
        <div className="mt-6">

        {/* ─── TAB 1: OVERVIEW & SYSTEM STATS ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section className="dashboard-main-columns">
              <div className="column-left">
                <LineChart />
              </div>

              <div className="column-right">
                <div className="card agenda-card">
                  <div className="agenda-header flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
                    <h4 className="agenda-title font-bold text-slate-800 dark:text-white">Recent Platform Activity</h4>
                    <span className="pill pill-accent text-xs">Live</span>
                  </div>
                  
                  {loadingStats ? (
                    <div className="py-8 text-center text-slate-400">
                      <FaSpinner className="animate-spin text-xl mx-auto mb-2 text-indigo-500" />
                      <span>Loading recent activity...</span>
                    </div>
                  ) : statsError ? (
                    <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl">
                      {statsError}
                    </div>
                  ) : statsData?.recent_activity?.length > 0 ? (
                    <div className="space-y-3">
                      {statsData.recent_activity.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-white">{log.username || log.email}</div>
                            <div className="text-slate-400">{log.details || log.action}</div>
                          </div>
                          <div className="text-right">
                            {getActionBadge(log.action)}
                            <div className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No recent activity recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ─── TAB 2: USER DIRECTORY & MANAGEMENT ─── */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">User Accounts Directory</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  View, filter, inspect details, or modify access status for registered accounts.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search name/email/username..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    className="pl-8 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => { setUserRoleFilter(e.target.value); fetchUsers({ role: e.target.value }); }}
                  className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="PARENT">Parents</option>
                  <option value="TEACHER">Teachers</option>
                  <option value="ADMIN">Admins</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => { setUserStatusFilter(e.target.value); fetchUsers({ status: e.target.value }); }}
                  className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Disabled Only</option>
                </select>

                <button
                  onClick={() => fetchUsers()}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <div className="py-12 text-center text-slate-400">
                <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-indigo-500" />
                <span>Loading users directory...</span>
              </div>
            ) : usersError ? (
              <div className="py-8 text-center text-rose-500 text-sm">
                <p>{usersError}</p>
                <button onClick={() => fetchUsers()} className="mt-2 text-xs text-indigo-600 underline">Retry</button>
              </div>
            ) : usersList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p>No user accounts found matching the criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Last Activity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">
                          <div>{user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}</div>
                          <div className="text-xs text-slate-400">@{user.username} • {user.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                          {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.is_active !== false 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}>
                            {user.is_active !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleViewUserDetail(user.id)}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FaEye className="text-xs" /> Details
                          </button>
                          
                          <button
                            onClick={() => setUserToToggle(user)}
                            disabled={user.id === currentUser?.id}
                            title={user.id === currentUser?.id ? "You cannot deactivate your own account" : ""}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer ${
                              user.id === currentUser?.id 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : user.is_active !== false
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                            }`}
                          >
                            {user.is_active !== false ? <><FaLock className="text-xs" /> Deactivate</> : <><FaUnlock className="text-xs" /> Activate</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: LIVE AUDIT LOGS ─── */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Real-Time Access Audit Logs</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tracks authentication events, signups, password resets, and admin status updates.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search username/email/details..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchActivityLogs()}
                    className="pl-8 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={logActionFilter}
                  onChange={(e) => { setLogActionFilter(e.target.value); fetchActivityLogs({ action: e.target.value }); }}
                  className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN">Logins Only</option>
                  <option value="SIGNUP">Signups Only</option>
                  <option value="USER_ACTIVATED">User Activated</option>
                  <option value="USER_DEACTIVATED">User Deactivated</option>
                  <option value="PASSWORD_RESET_REQUEST">OTP Requests</option>
                  <option value="PASSWORD_RESET_SUCCESS">Password Resets</option>
                </select>

                <button
                  onClick={() => fetchActivityLogs()}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Filter Logs
                </button>
              </div>
            </div>

            {loadingLogs ? (
              <div className="py-12 text-center text-slate-400">
                <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-indigo-500" />
                <span>Loading activity audit logs...</span>
              </div>
            ) : logsError ? (
              <div className="py-8 text-center text-rose-500 text-sm">
                <p>{logsError}</p>
                <button onClick={() => fetchActivityLogs()} className="mt-2 text-xs text-indigo-600 underline">Retry</button>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p>No activity logs found matching the criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">
                          <div>{log.username || log.email || 'System'}</div>
                          <div className="text-xs text-slate-400">{log.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          {getRoleBadge(log.user_role)}
                        </td>
                        <td className="py-3 px-4">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {log.details || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        </div>

      </main>

      {/* ─── MODAL 1: USER DETAILS MODAL ─── */}
      {(selectedUserDetail || loadingUserDetail || userDetailError) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <FaEye className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">User Account Inspection</h3>
              </div>
              <button 
                onClick={() => { setSelectedUserDetail(null); setUserDetailError(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg p-1"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {loadingUserDetail ? (
                <div className="py-12 text-center text-slate-400">
                  <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-indigo-500" />
                  <span>Fetching deep user details...</span>
                </div>
              ) : userDetailError ? (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-center text-sm">
                  {userDetailError}
                </div>
              ) : selectedUserDetail ? (
                <>
                  {/* Basic Profile */}
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedUserDetail.user.first_name || selectedUserDetail.user.last_name 
                          ? `${selectedUserDetail.user.first_name} ${selectedUserDetail.user.last_name}` 
                          : selectedUserDetail.user.username}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        @{selectedUserDetail.user.username} • {selectedUserDetail.user.email}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Phone: {selectedUserDetail.user.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      {getRoleBadge(selectedUserDetail.user.role)}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          selectedUserDetail.user.is_active !== false 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {selectedUserDetail.user.is_active !== false ? 'Active Account' : 'Account Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role Specific Details */}
                  {selectedUserDetail.user.role === 'PARENT' && (
                    <div className="space-y-4">
                      <h5 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                        <FaChild className="text-indigo-500" /> Parent Profile & Children ({selectedUserDetail.role_details?.children_count || 0})
                      </h5>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                        <div><span className="text-slate-400">Total Stories Created:</span> <strong className="text-slate-700 dark:text-slate-200">{selectedUserDetail.role_details?.stories_count || 0}</strong></div>
                        <div><span className="text-slate-400">Reading Logs:</span> <strong className="text-slate-700 dark:text-slate-200">{selectedUserDetail.role_details?.reading_logs_count || 0}</strong></div>
                      </div>

                      {selectedUserDetail.role_details?.children?.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-xs text-slate-400 font-semibold uppercase">Registered Children Profiles:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedUserDetail.role_details.children.map(child => (
                              <div key={child.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs flex items-center gap-3">
                                <span className="text-2xl">{child.avatar || '🦁'}</span>
                                <div>
                                  <div className="font-bold text-slate-800 dark:text-white">{child.name}</div>
                                  <div className="text-slate-400">Age: {child.age} • {child.grade_level}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No child profiles registered under this parent yet.</p>
                      )}
                    </div>
                  )}

                  {selectedUserDetail.user.role === 'TEACHER' && (
                    <div className="space-y-3">
                      <h5 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                        <FaChalkboardTeacher className="text-indigo-500" /> Teacher Institutional Profile
                      </h5>
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                        <div><span className="text-slate-400">School:</span> <strong className="text-slate-700 dark:text-slate-200">{selectedUserDetail.role_details?.profile?.school_name || 'N/A'}</strong></div>
                        <div><span className="text-slate-400">Subject:</span> <strong className="text-slate-700 dark:text-slate-200">{selectedUserDetail.role_details?.profile?.subject || 'N/A'}</strong></div>
                        <div><span className="text-slate-400">Enrolled Students:</span> <strong className="text-slate-700 dark:text-slate-200">{selectedUserDetail.role_details?.students_count || 0}</strong></div>
                        <div><span className="text-slate-400">Lessons Created:</span> <strong className="text-slate-700 dark:text-slate-200">{selectedUserDetail.role_details?.lessons_count || 0}</strong></div>
                      </div>
                    </div>
                  )}

                  {selectedUserDetail.user.role === 'ADMIN' && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-300 rounded-xl">
                      <strong>Administrator Account:</strong> Has full administrative permissions, system activity monitoring, and user control access.
                    </div>
                  )}

                  {/* Activity History */}
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2">
                      <FaHistory className="text-indigo-500" /> Recent User Activity Logs
                    </h5>
                    {selectedUserDetail.recent_activity?.length > 0 ? (
                      <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto pr-1">
                        {selectedUserDetail.recent_activity.map(log => (
                          <div key={log.id} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-between">
                            <span className="font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{log.action}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No activity recorded for this user.</p>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => { setSelectedUserDetail(null); setUserDetailError(null); }}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Inspection
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── MODAL 2: STATUS TOGGLE CONFIRMATION MODAL ─── */}
      {userToToggle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-700 animate-scale-up">
            
            <div className="text-center">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl mb-4 ${
                userToToggle.is_active !== false ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {userToToggle.is_active !== false ? <FaLock /> : <FaUnlock />}
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {userToToggle.is_active !== false ? 'Deactivate User Account?' : 'Activate User Account?'}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Are you sure you want to {userToToggle.is_active !== false ? 'deactivate' : 'activate'} the account for 
                <strong className="text-slate-800 dark:text-white"> {userToToggle.username}</strong> ({userToToggle.email})?
              </p>

              {userToToggle.is_active !== false && (
                <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg mb-4 text-left">
                  ⚠️ Deactivating this user will revoke their login access across all StoryNest services until reactivated.
                </p>
              )}

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setUserToToggle(null)}
                  disabled={isToggling}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmToggleUserStatus}
                  disabled={isToggling}
                  className={`px-5 py-2 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer ${
                    userToToggle.is_active !== false 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isToggling ? <FaSpinner className="animate-spin text-xs" /> : null}
                  {userToToggle.is_active !== false ? 'Confirm Deactivation' : 'Confirm Activation'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
