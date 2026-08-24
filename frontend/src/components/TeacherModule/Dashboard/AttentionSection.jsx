import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle as AlertCircle, FiAlertTriangle as AlertTriangle, FiChevronRight as ChevronRight } from 'react-icons/fi';

const AttentionSection = ({ items = [] }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return (
      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-4">Needs Attention</h2>
        <div className="empty-card" style={{ padding: '2rem' }}>
          <div className="empty-icon text-3xl mb-2">✨</div>
          <p className="font-bold">Everything looks good!</p>
          <p className="text-muted text-sm mt-1">No students currently need your attention.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-8">
      <h2 className="text-lg font-bold mb-4">Needs Attention</h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-[var(--border-color)] rounded-[var(--radius-sm)] hover:bg-[var(--bg-color)] transition-colors gap-4">
            <div className="flex gap-4 items-start">
              <div className="mt-1">
                {item.severity === 'high' ? (
                  <AlertCircle className="text-[var(--danger-color)]" size={20} />
                ) : (
                  <AlertTriangle className="text-[var(--orange)]" size={20} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{item.student_name}</span>
                  <span className="pill" style={{ backgroundColor: 'var(--bg-color)', fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                    {item.classroom_name}
                  </span>
                </div>
                <p className="text-sm text-muted">{item.issue}</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => navigate('/teacher/progress')}
              className="flex items-center gap-1 text-sm font-bold text-[var(--coral)] hover:underline self-end sm:self-auto shrink-0 cursor-pointer"
            >
              {item.action_text || 'Review'} <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttentionSection;
