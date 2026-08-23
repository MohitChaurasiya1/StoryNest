import React, { useState, useEffect } from 'react';
import teacherLibraryService from '../../../services/teacherLibraryService';
import { FaTimes, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const ContentPreviewModal = ({ item, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await teacherLibraryService.getContentDetails(item.type, item.id);
        setDetails(data);
      } catch (err) {
        setError(err.message || 'Could not load preview details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [item]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div className="card animate-fade-in" style={{ 
        width: '100%', maxWidth: '800px', maxHeight: '90vh', 
        display: 'flex', flexDirection: 'column', padding: 0,
        overflow: 'hidden' 
      }}>
        
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', borderBottom: '1px solid #e2e8f0', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div>
            <span className="pill mb-2" style={{ display: 'inline-block', background: '#e2e8f0', color: '#475569' }}>
              {item.type.toUpperCase()} PREVIEW
            </span>
            <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.25rem' }}>{item.title}</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'white', border: '1px solid #e2e8f0', width: '36px', height: '36px', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <FaSpinner className="spinner-icon" size={24} style={{ marginBottom: '1rem' }} />
              <p>Loading preview...</p>
            </div>
          )}

          {error && (
            <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaExclamationTriangle size={20} />
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          {!loading && !error && details && (
            <div>
              {item.type === 'story' && (
                <div>
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {details.cover_image_url && (
                      <img 
                        src={details.cover_image_url} 
                        alt="Cover" 
                        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px' }} 
                      />
                    )}
                    <div>
                      <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>{details.description}</p>
                      <p><strong>Grade:</strong> {details.grade}</p>
                      <p><strong>Difficulty:</strong> {details.reading_difficulty}</p>
                      <p><strong>Pages:</strong> {details.num_pages}</p>
                    </div>
                  </div>
                  
                  <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Pages Preview</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {details.pages?.map((page, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b' }}>Page {page.page_number}</strong>
                        <p style={{ margin: 0, lineHeight: 1.6 }}>{page.text_en}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.type === 'lesson' && (
                <div>
                  <p><strong>Description:</strong> {details.description}</p>
                  <p><strong>Status:</strong> <span className="pill">{details.status}</span></p>
                </div>
              )}

              {item.type === 'quiz' && (
                <div>
                  <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Questions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {details.questions?.map((q, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontWeight: '600', margin: '0 0 1rem 0' }}>{i + 1}. {q.question_text}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          {q.options.map((opt, oIdx) => (
                            <div 
                              key={oIdx} 
                              style={{ 
                                padding: '0.75rem', 
                                background: String.fromCharCode(65 + oIdx) === q.correct_option ? '#dcfce7' : 'white',
                                border: String.fromCharCode(65 + oIdx) === q.correct_option ? '1px solid #22c55e' : '1px solid #e2e8f0',
                                borderRadius: '6px'
                              }}
                            >
                              <span style={{ fontWeight: '600', marginRight: '0.5rem', color: '#94a3b8' }}>{String.fromCharCode(65 + oIdx)}</span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {!loading && !error && (
            <button className="btn btn-primary" onClick={() => {
              // Note: Using it directly or assigning is not built in this phase
              alert(`Action to assign this ${item.type} will be built in the Assignment Module.`);
            }}>
              Use this {item.type}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentPreviewModal;
