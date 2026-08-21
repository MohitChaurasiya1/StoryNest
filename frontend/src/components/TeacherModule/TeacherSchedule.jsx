import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaClock, 
  FaChalkboardTeacher, 
  FaBook, 
  FaUsers, 
  FaAward, 
  FaExclamationTriangle, 
  FaChevronLeft, 
  FaChevronRight, 
  FaRedo, 
  FaSearch, 
  FaFilter,
  FaFileAlt,
  FaCheckCircle,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarCheck,
  FaTasks
} from 'react-icons/fa';
import { teacherAPI } from '../../services/api';
import AddEventModal from './AddEventModal';
import EventDetailModal from './EventDetailModal';
import './TeacherModule.css';

export default function TeacherSchedule() {
  const navigate = useNavigate();

  // Calendar State
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data States
  const [events, setEvents] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [classroomFilter, setClassroomFilter] = useState('all');

  // Modal States
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState(null);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    fetchScheduleData();
  }, [currentDate, viewMode, search, eventTypeFilter, classroomFilter]);

  const fetchClassrooms = async () => {
    try {
      const res = await teacherAPI.getClassrooms({ status: 'active' });
      setClassrooms(res?.results || res || []);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    }
  };

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError('');

      // Calculate start and end date based on currentDate & viewMode
      const { startStr, endStr } = getDateRangeForView(currentDate, viewMode);

      const [schedRes, summaryRes] = await Promise.all([
        teacherAPI.getSchedule({
          start_date: startStr,
          end_date: endStr,
          search,
          event_type: eventTypeFilter,
          classroom: classroomFilter
        }),
        teacherAPI.getTodaySummary()
      ]);

      setEvents(schedRes?.events || []);
      setTodaySummary(summaryRes);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      setError('Failed to load live schedule data. Displaying fallback command metrics.');
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeForView = (dateObj, mode) => {
    const curr = new Date(dateObj);
    if (mode === 'day') {
      const dateStr = curr.toISOString().split('T')[0];
      return { startStr: dateStr, endStr: dateStr };
    } else if (mode === 'week') {
      const dayOfWeek = curr.getDay(); // 0 is Sun
      const distanceToMon = (dayOfWeek + 6) % 7;
      const monday = new Date(curr);
      monday.setDate(curr.getDate() - distanceToMon);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return {
        startStr: monday.toISOString().split('T')[0],
        endStr: sunday.toISOString().split('T')[0]
      };
    } else {
      // Month mode
      const firstDay = new Date(curr.getFullYear(), curr.getMonth(), 1);
      const lastDay = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
      return {
        startStr: firstDay.toISOString().split('T')[0],
        endStr: lastDay.toISOString().split('T')[0]
      };
    }
  };

  // Date Navigation Helpers
  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Safe Fallback Aggregates
  const summaryData = todaySummary || {
    today_date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    total_events_today: 4,
    classes_today: 2,
    deadlines_today: 1,
    meetings_today: 1,
    next_event: { title: 'Grade 3A — Reading Lesson', time: '10:00 AM', classroom: 'Grade 3 — Section A' },
    weekly_kpis: { classes_this_week: 14, upcoming_lessons: 7, deadlines_this_week: 4, free_hours_this_week: 12.5 }
  };

  // Format Helper for Category Colors
  const getCategoryStyle = (type) => {
    switch (type) {
      case 'class': return { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-900 dark:text-purple-200', border: 'border-purple-300' };
      case 'lesson': return { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-900 dark:text-blue-200', border: 'border-blue-300' };
      case 'assignment': return { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-900 dark:text-amber-200', border: 'border-amber-300' };
      case 'meeting': return { bg: 'bg-pink-100 dark:bg-pink-950/60', text: 'text-pink-900 dark:text-pink-200', border: 'border-pink-300' };
      case 'office_hours': return { bg: 'bg-teal-100 dark:bg-teal-950/60', text: 'text-teal-900 dark:text-teal-200', border: 'border-teal-300' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-300' };
    }
  };

  // Generate Week Days for Week View Grid
  const getWeekDays = () => {
    const dayOfWeek = currentDate.getDay();
    const distanceToMon = (dayOfWeek + 6) % 7;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - distanceToMon);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6 text-xs font-sans pb-16">
      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-600" />
            <span>{error}</span>
          </div>
          <button onClick={fetchScheduleData} className="sn-btn-secondary py-1 px-3 text-xs">
            <FaRedo /> Retry
          </button>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600" /> Teaching Schedule
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Plan classes, lessons, assignments, and important teaching events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleToday} className="sn-btn-secondary py-2 px-3 text-xs font-bold">
            Today
          </button>
          <button onClick={fetchScheduleData} className="sn-btn-secondary py-2 px-3 text-xs">
            <FaRedo /> Refresh
          </button>
          <button
            onClick={() => setIsAddEventOpen(true)}
            className="sn-btn-primary py-2.5 px-5 text-xs font-black shadow-md flex items-center gap-2"
          >
            <FaPlus /> + Add Event
          </button>
        </div>
      </div>

      {/* BANNER — TODAY'S SCHEDULE SUMMARY */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-800/40">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-[11px] font-bold border border-purple-400/30">
            🗓️ {summaryData.today_date}
          </div>
          <h2 className="text-xl font-black text-white">
            You have <span className="text-purple-300 underline">{summaryData.total_events_today}</span> events & deadlines scheduled today.
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Next: <strong className="text-amber-300 font-extrabold">{summaryData.next_event.time} — {summaryData.next_event.title}</strong> ({summaryData.next_event.classroom})
          </p>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[100px]">
            <div className="text-lg font-black text-purple-300">{summaryData.classes_today}</div>
            <div className="text-[10px] text-slate-300 font-bold uppercase">Classes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[100px]">
            <div className="text-lg font-black text-amber-300">{summaryData.deadlines_today}</div>
            <div className="text-[10px] text-slate-300 font-bold uppercase">Deadlines</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[100px]">
            <div className="text-lg font-black text-emerald-300">{summaryData.meetings_today}</div>
            <div className="text-[10px] text-slate-300 font-bold uppercase">Meetings</div>
          </div>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-purple-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Classes</span>
            <FaChalkboardTeacher className="text-base" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{summaryData.classes_today}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-blue-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Upcoming Lessons</span>
            <FaBook className="text-base" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{summaryData.weekly_kpis.upcoming_lessons}</div>
          <div className="text-[10px] text-slate-400 font-semibold">This week</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-amber-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Assignment Deadlines</span>
            <FaTasks className="text-base" />
          </div>
          <div className="text-2xl font-black text-amber-600">{summaryData.weekly_kpis.deadlines_this_week}</div>
          <div className="text-[10px] text-slate-400 font-semibold">This week</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-emerald-600">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Weekly Teaching Load</span>
            <FaClock className="text-base" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{summaryData.weekly_kpis.free_hours_this_week}h</div>
          <div className="text-[10px] text-emerald-600 font-bold">{summaryData.weekly_kpis.classes_this_week} classes total</div>
        </div>
      </div>

      {/* CALENDAR TOOLBAR & FILTERS */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button onClick={handlePrevDate} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-200">
                <FaChevronLeft />
              </button>
              <button onClick={handleNextDate} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-200">
                <FaChevronRight />
              </button>
            </div>

            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
              {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {viewMode === 'week' && `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>

          {/* View Switcher */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
            {[
              { id: 'day', label: 'Day', icon: FaCalendarDay },
              { id: 'week', label: 'Week', icon: FaCalendarWeek },
              { id: 'month', label: 'Month', icon: FaCalendarCheck }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 ${
                  viewMode === v.id ? 'sn-tab-active' : 'sn-tab-inactive'
                }`}
              >
                <v.icon /> {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search schedule..."
              className="sn-search-input pl-9 py-2 w-full text-xs rounded-2xl"
            />
          </div>

          <select
            value={eventTypeFilter}
            onChange={e => setEventTypeFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">All Event Categories</option>
            <option value="class">Classroom Sessions</option>
            <option value="lesson">Lessons</option>
            <option value="assignment">Assignment Deadlines</option>
            <option value="meeting">Meetings</option>
            <option value="office_hours">Office Hours</option>
          </select>

          <select
            value={classroomFilter}
            onChange={e => setClassroomFilter(e.target.value)}
            className="sn-filter-select py-2 px-3 rounded-2xl text-xs"
          >
            <option value="all">All Classrooms</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CALENDAR DISPLAY GRID & SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Calendar View (9 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[500px]">
          {loading ? (
            <div className="p-16 text-center text-slate-400">
              <div className="inline-block animate-spin text-2xl text-purple-600 mb-2">🌀</div>
              <p className="font-semibold text-xs">Loading consolidated teaching calendar...</p>
            </div>
          ) : viewMode === 'week' ? (
            /* WEEK VIEW GRID */
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(dayObj => {
                const dateStr = dayObj.toISOString().split('T')[0];
                const dayEvents = events.filter(e => e.date === dateStr);
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={dateStr}
                    className={`p-2.5 rounded-2xl border min-h-[400px] flex flex-col justify-between ${
                      isToday
                        ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
                    }`}
                  >
                    <div>
                      <div className="text-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60 mb-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          {dayObj.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-sm font-black ${isToday ? 'text-purple-600' : 'text-slate-800 dark:text-white'}`}>
                          {dayObj.getDate()}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {dayEvents.map(ev => {
                          const catStyle = getCategoryStyle(ev.event_type);
                          return (
                            <div
                              key={ev.id}
                              onClick={() => setSelectedEventForDetail(ev)}
                              className={`p-2 rounded-xl border ${catStyle.bg} ${catStyle.border} ${catStyle.text} cursor-pointer hover:scale-102 transition shadow-xs space-y-0.5`}
                            >
                              <div className="font-extrabold text-[11px] truncate">{ev.title}</div>
                              <div className="text-[9px] font-bold opacity-80">{ev.start_time}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => { setCurrentDate(dayObj); setViewMode('day'); }}
                      className="mt-2 text-[10px] text-purple-600 hover:underline font-bold text-center w-full"
                    >
                      + View Day
                    </button>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'day' ? (
            /* DAY VIEW TIMELINE */
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white pb-2 border-b">
                Schedule Timeline for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>

              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => {
                const hourEvents = events.filter(e => e.start_time?.startsWith(hour.slice(0, 2)));

                return (
                  <div key={hour} className="flex gap-4 items-start py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="w-14 text-[11px] font-bold text-slate-400 shrink-0">{hour}</span>
                    <div className="flex-1 space-y-2">
                      {hourEvents.length > 0 ? hourEvents.map(ev => {
                        const catStyle = getCategoryStyle(ev.event_type);
                        return (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEventForDetail(ev)}
                            className={`p-3 rounded-2xl border ${catStyle.bg} ${catStyle.border} ${catStyle.text} cursor-pointer transition flex items-center justify-between`}
                          >
                            <div>
                              <div className="font-extrabold text-xs">{ev.title}</div>
                              <div className="text-[10px] opacity-80">{ev.classroom_name || 'General Event'} • {ev.location}</div>
                            </div>
                            <span className="font-black text-xs">{ev.start_time} - {ev.end_time}</span>
                          </div>
                        );
                      }) : (
                        <div className="text-[11px] text-slate-300 font-medium py-1">Free Time Slot</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* MONTH VIEW GRID */
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="font-bold text-[10px] text-slate-400 uppercase pb-2">{d}</div>
              ))}
              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dStr);

                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                      setCurrentDate(d);
                      setViewMode('day');
                    }}
                    className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[60px] flex flex-col justify-between cursor-pointer hover:border-purple-300 transition"
                  >
                    <div className="font-bold text-xs text-slate-700 dark:text-slate-200">{dayNum}</div>
                    {dayEvents.length > 0 && (
                      <div className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {dayEvents.length} events
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Today's Agenda & Upcoming Events (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Today's Agenda Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FaClock className="text-purple-600" /> Today's Agenda
            </h3>

            <div className="space-y-3">
              {events.filter(e => e.date === new Date().toISOString().split('T')[0]).slice(0, 4).map(ev => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventForDetail(ev)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 cursor-pointer hover:bg-purple-50 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-slate-800 dark:text-white text-xs">{ev.title}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{ev.classroom_name || 'Room 204'}</div>
                  </div>
                  <span className="sn-badge-enrolled">{ev.start_time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events Stream Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <FaCalendarAlt className="text-indigo-600" /> Next Upcoming Events
            </h3>

            <div className="space-y-3">
              {events.slice(0, 5).map(ev => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventForDetail(ev)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 cursor-pointer hover:bg-indigo-50 transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-slate-800 dark:text-white text-xs">{ev.title}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{ev.date} @ {ev.start_time}</div>
                  </div>
                  <span className="sn-badge-on-track">Upcoming</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS INTEGRATION */}
      {isAddEventOpen && (
        <AddEventModal
          onClose={() => setIsAddEventOpen(false)}
          onCreated={() => fetchScheduleData()}
        />
      )}

      {selectedEventForDetail && (
        <EventDetailModal
          event={selectedEventForDetail}
          onClose={() => setSelectedEventForDetail(null)}
          onDeleted={() => fetchScheduleData()}
        />
      )}
    </div>
  );
}
