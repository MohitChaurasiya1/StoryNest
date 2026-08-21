import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaChalkboardTeacher, FaTimes, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { teacherAPI } from '../../services/api';

export default function EventDetailModal({ event, onClose, onDeleted }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete '${event.title}'?`)) {
      try {
        if (event.raw_id) {
          await teacherAPI.deleteEvent(event.raw_id);
        }
        if (onDeleted) onDeleted();
        onClose();
      } catch (err) {
        console.error('Error deleting event:', err);
      }
    }
  };

  const getCategoryBadgeClass = (type) => {
    switch (type) {
      case 'class': return 'sn-badge-on-track';
      case 'lesson': return 'sn-badge-available';
      case 'assignment': return 'sn-badge-attention';
      case 'meeting': return 'sn-badge-behind';
      case 'office_hours': return 'sn-badge-enrolled';
      default: return 'sn-badge-already';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-black text-lg">
              <FaCalendarAlt />
            </div>
            <div>
              <span className={getCategoryBadgeClass(event.event_type)}>
                ● {event.event_type ? event.event_type.replace('_', ' ') : 'Event'}
              </span>
              <h3 className="font-extrabold text-base text-white mt-1">{event.title}</h3>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition">
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Body Details */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
              <FaClock className="text-purple-600" />
              <span>{event.date} • {event.start_time} – {event.end_time}</span>
            </div>

            {event.classroom_name && (
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                <FaChalkboardTeacher className="text-indigo-600" />
                <span>Classroom: <strong className="text-purple-700">{event.classroom_name}</strong></span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                <FaMapMarkerAlt className="text-rose-500" />
                <span>Location: {event.location}</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="space-y-1">
              <div className="font-bold text-slate-400 uppercase text-[10px]">Event Notes & Agenda</div>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border">
                {event.description}
              </p>
            </div>
          )}

          {/* Source Action Link */}
          {event.source === 'assignment' ? (
            <button
              onClick={() => { onClose(); navigate(`/teacher/assignments/${event.raw_id}`); }}
              className="sn-btn-primary w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              View Assignment Details <FaExternalLinkAlt className="text-[10px]" />
            </button>
          ) : event.classroom_id ? (
            <button
              onClick={() => { onClose(); navigate(`/teacher/classrooms/${event.classroom_id}`); }}
              className="sn-btn-secondary w-full py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5"
            >
              Open Classroom Workspace <FaExternalLinkAlt className="text-[10px]" />
            </button>
          ) : null}

          {/* Footer Actions */}
          <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
            {event.is_editable ? (
              <button
                type="button"
                onClick={handleDelete}
                className="sn-btn-secondary text-rose-600 py-1.5 px-3 text-xs inline-flex items-center gap-1"
              >
                <FaTrash /> Delete Event
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-semibold">Source-Controlled Event</span>
            )}

            <button type="button" onClick={onClose} className="sn-btn-secondary py-1.5 px-4 text-xs font-bold">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
