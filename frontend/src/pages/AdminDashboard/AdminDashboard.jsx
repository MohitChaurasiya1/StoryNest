import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import LineChart from '../../components/LineChart';
import { adminAPI } from '../../services/api';
import { 
  FaUserPlus, 
  FaFileDownload, 
  FaArrowUp, 
  FaCheckCircle, 
  FaSearch, 
  FaBell,
  FaShieldAlt,
  FaUserCheck,
  FaUserClock,
  FaHistory,
  FaUsers,
  FaSpinner,
  FaSync,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'users' | 'overview'
  const [statsData, setStatsData] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('');
  
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchStats();
    fetchActivityLogs();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await adminAPI.getStats();
      setStatsData(res);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchActivityLogs = async (params = {}) => {
    try {
      setLoadingLogs(true);
      const res = await adminAPI.getActivityLogs({
        search: logSearch,
        action: logActionFilter,
        ...params
      });
      setActivityLogs(res || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchUsers = async (params = {}) => {
    try {
      setLoadingUsers(true);
      const res = await adminAPI.getUsers({
        search: userSearch,
        role: userRoleFilter,
        ...params
      });
      setUsersList(res || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleUserActive = async (userId, currentUsername) => {
    try {
      const res = await adminAPI.toggleUserActive(userId);
      setSuccessMessage(res.detail || `Updated status for ${currentUsername}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
      fetchStats();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update user status.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Generate and Download PDF Report
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('STORYNEST PLATFORM AUDIT REPORT', 15, 20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('ADMINISTRATIVE USER ACCESS & LOG ACTIVITY', 15, 30);
      
      // Date
      doc.setTextColor(47, 59, 42);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 130, 50);

      // Section 1: Dashboard KPIs
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('1. System Summary', 15, 60);
      doc.line(15, 63, 195, 63);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Registered Users: ${statsData?.total_users || 0}`, 15, 75);
      doc.text(`Logins Today: ${statsData?.logins_today || 0}`, 15, 85);
      doc.text(`New Signups Today: ${statsData?.new_users_today || 0}`, 15, 95);
      doc.text(`Parents: ${statsData?.roles_breakdown?.parents || 0} | Teachers: ${statsData?.roles_breakdown?.teachers || 0} | Admins: ${statsData?.roles_breakdown?.admins || 0}`, 15, 105);

      // Section 2: Recent Activity Logs
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Recent Activity Logs', 15, 120);
      doc.line(15, 123, 195, 123);

      let currentY = 135;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('User', 15, currentY);
      doc.text('Role', 65, currentY);
      doc.text('Action', 105, currentY);
      doc.text('Timestamp', 155, currentY);
      doc.line(15, currentY + 2, 195, currentY + 2);

      currentY += 10;
      doc.setFont('helvetica', 'normal');
      activityLogs.slice(0, 10).forEach(log => {
        const formattedDate = new Date(log.timestamp).toLocaleString();
        doc.text(log.username || log.email || 'User', 15, currentY);
        doc.text(log.user_role || 'USER', 65, currentY);
        doc.text(log.action, 105, currentY);
        doc.text(formattedDate, 155, currentY);
        currentY += 8;
      });

      doc.save('StoryNest_Audit_Report.pdf');
      setSuccessMessage('Audit Report downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('PDF Generation Failed', error);
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
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">TEACHER</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">PARENT</span>;
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role="admin" />

      <main className="dashboard-content">
        {/* Top Navbar */}
        <header className="dashboard-top-nav">
          <div className="top-nav-left">
            <h2 className="serif-heading dashboard-welcome">Admin Command Center</h2>
            <p className="text-muted font-sm">Real-time user login tracking, audit logs & system health.</p>
          </div>
          <div className="top-nav-right">
            <button 
              className="top-nav-btn bell-btn" 
              onClick={() => { fetchStats(); fetchActivityLogs(); fetchUsers(); }}
              title="Refresh data"
            >
              <FaSync className="text-slate-600 dark:text-slate-300" />
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
          {errorMessage && (
            <div className="p-3 bg-rose-100 text-rose-800 rounded-xl font-semibold text-sm mb-2">
              {errorMessage}
            </div>
          )}
          
          <div className="action-buttons-group">
            <button 
              className="btn btn-primary" 
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              <FaFileDownload /> {isExporting ? 'Exporting PDF...' : 'Export Audit PDF'}
            </button>
          </div>
        </section>

        {/* 4-Up Stat Grid */}
        <section className="grid-4 stats-grid-row">
          <div className="card stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label text-muted">Total Registered Users</span>
              <span className="stat-card-delta text-emerald-600">Active</span>
            </div>
            <div className="stat-card-value-row">
              <span className="stat-card-value serif-heading">
                {loadingStats ? <FaSpinner className="animate-spin text-lg" /> : statsData?.total_users || 0}
              </span>
              <span className="stat-card-desc text-muted">
                {statsData?.roles_breakdown?.parents || 0} Parents, {statsData?.roles_breakdown?.teachers || 0} Teachers
              </span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label text-muted">Logins Today</span>
              <span className="stat-card-delta text-indigo-600">Real-time</span>
            </div>
            <div className="stat-card-value-row">
              <span className="stat-card-value serif-heading">
                {loadingStats ? <FaSpinner className="animate-spin text-lg" /> : statsData?.logins_today || 0}
              </span>
              <span className="stat-card-desc text-muted">Unique user logins</span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label text-muted">New Signups Today</span>
              <span className="stat-card-delta text-purple-600">Today</span>
            </div>
            <div className="stat-card-value-row">
              <span className="stat-card-value serif-heading">
                {loadingStats ? <FaSpinner className="animate-spin text-lg" /> : statsData?.new_users_today || 0}
              </span>
              <span className="stat-card-desc text-muted">
                +{statsData?.new_users_this_week || 0} this week
              </span>
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label text-muted">AI Stories Created</span>
              <span className="stat-card-delta text-amber-600">Platform</span>
            </div>
            <div className="stat-card-value-row">
              <span className="stat-card-value serif-heading">
                {loadingStats ? <FaSpinner className="animate-spin text-lg" /> : statsData?.platform_stats?.total_stories || 0}
              </span>
              <span className="stat-card-desc text-muted">Across all child profiles</span>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 my-6">
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-6 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FaHistory />
            <span>Live Audit Logs (Who Logged In / Signed Up)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-6 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FaUsers />
            <span>User Directory & Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-6 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FaUserClock />
            <span>Analytics & Agenda</span>
          </button>
        </div>

        {/* ─── TAB 1: LIVE AUDIT LOGS ─── */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Real-Time Access Audit Logs</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tracks exact dates, times, roles, and IP addresses when users Log In or Sign Up.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search username/email..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchActivityLogs()}
                    className="pl-8 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>

                <select
                  value={logActionFilter}
                  onChange={(e) => { setLogActionFilter(e.target.value); fetchActivityLogs({ action: e.target.value }); }}
                  className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN">Logins Only</option>
                  <option value="SIGNUP">Signups Only</option>
                  <option value="PASSWORD_RESET_REQUEST">OTP Requests</option>
                  <option value="PASSWORD_RESET_SUCCESS">Password Resets</option>
                </select>

                <button
                  onClick={() => fetchActivityLogs()}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {loadingLogs ? (
              <div className="py-12 text-center text-slate-400">
                <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-indigo-500" />
                <span>Loading activity audit logs...</span>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p>No activity logs found matching criteria.</p>
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
                          <div>{log.username || log.email}</div>
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

        {/* ─── TAB 2: USER DIRECTORY ─── */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">User Accounts Directory</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage all Parents, Teachers, and Administrators registered on the platform.
                </p>
              </div>

              {/* User search & filter */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search by name/email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    className="pl-8 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => { setUserRoleFilter(e.target.value); fetchUsers({ role: e.target.value }); }}
                  className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                >
                  <option value="">All Roles</option>
                  <option value="PARENT">Parents</option>
                  <option value="TEACHER">Teachers</option>
                  <option value="ADMIN">Admins</option>
                </select>

                <button
                  onClick={() => fetchUsers()}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Filter
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <div className="py-12 text-center text-slate-400">
                <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-indigo-500" />
                <span>Loading users directory...</span>
              </div>
            ) : usersList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p>No user accounts found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Joined Date</th>
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
                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {user.phone || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                          {new Date().toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            user.is_active !== false 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}>
                            {user.is_active !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserActive(user.id, user.username)}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            {user.is_active !== false ? <><FaLock className="text-rose-500 text-[10px]" /> Deactivate</> : <><FaUnlock className="text-emerald-500 text-[10px]" /> Activate</>}
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

        {/* ─── TAB 3: OVERVIEW & ANALYTICS ─── */}
        {activeTab === 'overview' && (
          <section className="dashboard-main-columns">
            {/* Chart Column */}
            <div className="column-left">
              <LineChart />
            </div>

            {/* Agenda Column */}
            <div className="column-right">
              <div className="card agenda-card">
                <div className="agenda-header">
                  <h4 className="agenda-title">System Agenda & Status</h4>
                  <span className="pill pill-accent">Healthy</span>
                </div>
                
                <div className="agenda-list">
                  <div className="agenda-item-box border-system">
                    <div className="agenda-item-time">08:30 AM</div>
                    <div className="agenda-item-content">
                      <h5 className="agenda-item-title">System Backups & Log Maintenance</h5>
                      <p className="agenda-item-desc text-muted">Auto-tuned authentication audit indexes.</p>
                    </div>
                  </div>

                  <div className="agenda-item-box border-board">
                    <div className="agenda-item-time">10:00 AM</div>
                    <div className="agenda-item-content">
                      <h5 className="agenda-item-title">Platform Access Review</h5>
                      <p className="agenda-item-desc text-muted">Reviewing Parent & Teacher user session curves.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
