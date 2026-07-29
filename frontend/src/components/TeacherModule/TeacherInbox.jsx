import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../../services/api';
import { FaInbox, FaPen, FaCheckDouble, FaTrash, FaPaperPlane, FaTimes } from 'react-icons/fa';
import './TeacherModule.css';

export default function TeacherInbox() {
  const [messages, setMessages] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Compose Modal state
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    recipient_name: 'All Class Parents',
    subject: '',
    content: '',
    message_type: 'parent'
  });

  useEffect(() => {
    loadMessages();
  }, [activeFilter]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeFilter === 'unread') params.unread = 'true';
      else if (activeFilter !== 'all') params.type = activeFilter;

      const res = await teacherAPI.getInbox(params);
      setMessages(res || []);
      if (res && res.length > 0 && !selectedMessage) {
        setSelectedMessage(res[0]);
      }
    } catch (err) {
      console.error('Error loading inbox messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        await teacherAPI.markMessageRead(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch (err) {
        console.error('Error marking message read:', err);
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await teacherAPI.deleteMessage(id);
        const remaining = messages.filter(m => m.id !== id);
        setMessages(remaining);
        setSelectedMessage(remaining.length > 0 ? remaining[0] : null);
      } catch (err) {
        console.error('Error deleting message:', err);
      }
    }
  };

  const handleSendCompose = async (e) => {
    e.preventDefault();
    if (!composeData.subject || !composeData.content) {
      alert('Please enter a subject and message body.');
      return;
    }
    try {
      await teacherAPI.sendMessage(composeData);
      alert('Message sent successfully!');
      setShowCompose(false);
      setComposeData({ recipient_name: 'All Class Parents', subject: '', content: '', message_type: 'parent' });
      loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message.');
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="teacher-view-container animate-fade-in">
      <div className="teacher-view-header">
        <div>
          <h3>Teacher Inbox</h3>
          <p>Communicate with parents, system notifications, and school administration.</p>
        </div>
      </div>

      <div className="inbox-layout">
        {/* Left Filter Sidebar */}
        <div className="inbox-sidebar">
          <button className="compose-btn" onClick={() => setShowCompose(true)}>
            <FaPen /> Compose Message
          </button>

          <div className="inbox-filter-list">
            {[
              { id: 'all', label: 'All Messages' },
              { id: 'unread', label: 'Unread', badge: unreadCount },
              { id: 'parent', label: 'Parent Messages' },
              { id: 'system', label: 'System Alerts' },
              { id: 'admin', label: 'Administration' },
            ].map(filter => (
              <button
                key={filter.id}
                className={`inbox-filter-item ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span>{filter.label}</span>
                {filter.badge > 0 && <span className="inbox-unread-pill">{filter.badge}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Message List */}
        <div className="inbox-messages-list">
          {loading ? (
            <p style={{ padding: '1.5rem', color: '#64748B' }}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ padding: '1.5rem', color: '#64748B' }}>No messages found in this view.</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`message-item ${!msg.is_read ? 'unread' : ''} ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
                onClick={() => handleSelectMessage(msg)}
              >
                <div className="msg-header-row">
                  <span className="msg-sender">{msg.sender_name}</span>
                  <span className="msg-date">
                    {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="msg-subject">{msg.subject}</div>
                <div className="msg-snippet">{msg.content}</div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail Pane */}
        <div className="message-detail-pane">
          {selectedMessage ? (
            <>
              <div className="message-detail-header">
                <div className="message-detail-title">{selectedMessage.subject}</div>
                <div className="message-detail-meta">
                  <span>From: <strong>{selectedMessage.sender_name}</strong></span>
                  <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="message-detail-body">
                {selectedMessage.content}
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn" 
                  style={{ background: '#EF4444', color: '#FFF', padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: '#94A3B8' }}>
              <FaInbox style={{ fontSize: '3rem', marginBottom: '1rem' }} />
              <p>Select a message from the list to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h4>New Message</h4>
              <button className="close-modal-btn" onClick={() => setShowCompose(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSendCompose}>
              <div className="form-field">
                <label>Recipient Category</label>
                <select
                  value={composeData.message_type}
                  onChange={e => setComposeData({ ...composeData, message_type: e.target.value })}
                >
                  <option value="parent">Class Parents</option>
                  <option value="admin">School Administration</option>
                  <option value="student">Student Direct Note</option>
                </select>
              </div>
              <div className="form-field">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Enter message subject..."
                  value={composeData.subject}
                  onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <label>Message Content</label>
                <textarea
                  rows="5"
                  placeholder="Write your message here..."
                  value={composeData.content}
                  onChange={e => setComposeData({ ...composeData, content: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ background: '#E2E8F0', padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowCompose(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ background: '#7C3AED', color: '#FFF', padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FaPaperPlane /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
