import React, { useState, useEffect } from 'react';
import ParentSidebar from './ParentSidebar';
import ParentNavbar from './ParentNavbar';
import ChildSelector from '../ChildSelector/ChildSelector';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import ToastNotification from './ToastNotification';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { useAuth } from '../../context/AuthContext';
import { parentNotesApi } from '../../services/api';
import { FaStickyNote, FaPlus, FaEdit, FaTrash, FaSave, FaClock, FaTimes } from 'react-icons/fa';

export default function ParentNotes() {
  const { childrenList, activeChild, activeChildId, setActiveChildId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const maxChars = 2000;

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await parentNotesApi.getNotes();
      const list = Array.isArray(data) ? data : data?.results || [];
      // Filter by active child if selected
      const filtered = activeChildId
        ? list.filter((n) => n.child === activeChildId || n.child_id === activeChildId)
        : list;
      setNotes(filtered);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load notes' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [activeChildId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      if (editingId) {
        await parentNotesApi.updateNote(editingId, { note: noteText });
        setToast({ type: 'success', message: 'Note updated successfully!' });
      } else {
        await parentNotesApi.createNote({
          child: activeChildId || (childrenList[0] && childrenList[0].id),
          note: noteText,
        });
        setToast({ type: 'success', message: 'Note added successfully!' });
      }
      setNoteText('');
      setEditingId(null);
      fetchNotes();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save note' });
    }
  };

  const handleEdit = (n) => {
    setEditingId(n.id);
    setNoteText(n.note);
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      await parentNotesApi.deleteNote(isDeleting.id);
      setToast({ type: 'success', message: 'Note deleted' });
      setIsDeleting(null);
      fetchNotes();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete note' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-72">
        <ParentNavbar
          title="Parent Notes Management"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FaStickyNote className="text-amber-500" /> Parent Notes
              </h1>
              <p className="text-sm text-slate-500">Record observations and progress notes for your child.</p>
            </div>
            <ChildSelector
              childrenList={childrenList}
              activeChildId={activeChildId}
              onSelectChild={setActiveChildId}
            />
          </div>

          {/* Note Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              {editingId ? <FaEdit className="text-rose-500" /> : <FaPlus className="text-emerald-500" />}
              {editingId ? 'Edit Note' : `Add Note for ${activeChild?.name || 'Child'}`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={maxChars}
                  placeholder="Write your note here... (e.g. Leo learned 5 new Hindi words today and loved the lion story!)"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-rose-500 focus:outline-none"
                />
                <div className="absolute bottom-3 right-4 text-xs text-slate-400 font-semibold">
                  {noteText.length} / {maxChars}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setNoteText(''); }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm shadow-md hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <FaSave /> {editingId ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Notes List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Notes</h2>
            {loading ? (
              <SkeletonLoader count={3} />
            ) : notes.length === 0 ? (
              <EmptyState
                icon={FaStickyNote}
                title="No notes added yet"
                description={`Start adding personalized notes for ${activeChild?.name || 'your child'}.`}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 relative group">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                      <span className="flex items-center gap-1 text-rose-500 font-bold bg-rose-50 px-2.5 py-1 rounded-full">
                        {n.child_name || activeChild?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock /> {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{n.note}</p>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleEdit(n)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition text-sm"
                        title="Edit note"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setIsDeleting(n)}
                        className="p-2 text-slate-400 hover:text-red-500 transition text-sm"
                        title="Delete note"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmDeleteModal
        isOpen={Boolean(isDeleting)}
        title="Delete Note"
        message="Are you sure you want to delete this parent note?"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(null)}
      />

      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
