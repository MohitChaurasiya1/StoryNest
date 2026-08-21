import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import { parentApprovalsApi } from '../../services/api';
import { FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaCheck, FaTimes } from 'react-icons/fa';

export default function StoryApprovals() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending'); // 'pending' | 'history'
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await parentApprovalsApi.getApprovals();
      const list = Array.isArray(data) ? data : data?.results || [];
      setApprovals(list);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load story approvals' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id, statusAction) => {
    try {
      if (statusAction === 'approve') {
        await parentApprovalsApi.approveStory(id, notes);
        setToast({ type: 'success', message: 'Story approved successfully!' });
      } else {
        await parentApprovalsApi.rejectStory(id, notes);
        setToast({ type: 'info', message: 'Story rejected.' });
      }
      setSelectedApproval(null);
      setNotes('');
      fetchApprovals();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update approval status' });
    }
  };

  const filteredApprovals = approvals.filter((a) =>
    tab === 'pending' ? a.status === 'pending' : a.status !== 'pending'
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar
          title="Story Approval System"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" /> Story Approvals
              </h1>
              <p className="text-sm text-slate-500">Approve teacher-assigned stories before your child reads them.</p>
            </div>

            {/* Tab Filter */}
            <div className="flex bg-slate-200 p-1 rounded-2xl">
              <button
                onClick={() => setTab('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  tab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Pending ({approvals.filter((a) => a.status === 'pending').length})
              </button>
              <button
                onClick={() => setTab('history')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  tab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                History
              </button>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={3} />
          ) : filteredApprovals.length === 0 ? (
            <EmptyState
              icon={FaCheckCircle}
              title={tab === 'pending' ? 'No pending approvals' : 'No approval history'}
              description={tab === 'pending' ? 'All teacher-assigned stories have been reviewed.' : 'Reviewed stories will appear here.'}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredApprovals.map((a) => (
                <div key={a.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                        a.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        a.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {a.status}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                        <FaClock /> {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{a.story_title}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Child: {a.child_name || 'Assigned Student'}</p>
                    {a.reviewer_notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mt-3 italic">
                        "{a.reviewer_notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    {a.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(a.id, 'approve')}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(a.id, 'reject')}
                          className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center text-xs font-semibold text-slate-400 py-1">
                        Reviewed on {new Date(a.reviewed_at || a.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
