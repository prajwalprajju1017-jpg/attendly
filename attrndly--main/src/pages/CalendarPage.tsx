import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  BookOpen,
  CalendarDays,
  List,
  Grid,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalendarEvent, CalendarEventType } from '../types';

export const CalendarPage: React.FC = () => {
  const { calendarEvents, tasks, timetable, subjects, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, showConfirmDialog } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedDayEventsDate, setSelectedDayEventsDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('Exam');
  const [eventSubjectId, setEventSubjectId] = useState('');
  const [eventStartDate, setEventStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventStartTime, setEventStartTime] = useState('10:00');
  const [eventEndTime, setEventEndTime] = useState('11:30');
  const [eventLocation, setEventLocation] = useState('');
  const [eventColor, setEventColor] = useState('#6366f1');

  // Helper date math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayEventsDate(today.toISOString().split('T')[0]);
  };

  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Unified items (Calendar Events + Tasks deadlines displayed without duplicating records)
  const unifiedEvents = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      date: string;
      time?: string;
      type: CalendarEventType;
      subjectId?: string;
      color: string;
      isFromTask?: boolean;
      originalEvent?: CalendarEvent;
    }> = [];

    // Add native calendar events
    calendarEvents.forEach((e) => {
      items.push({
        id: e.id,
        title: e.title,
        date: e.startDate,
        time: e.startTime,
        type: e.eventType,
        subjectId: e.subjectId,
        color: e.color || (e.eventType === 'Exam' ? '#ef4444' : e.eventType === 'Holiday' ? '#10b981' : '#6366f1'),
        originalEvent: e,
      });
    });

    // Add tasks as deadlines
    tasks.forEach((t) => {
      const sub = subjects.find((s) => s.id === t.subjectId);
      items.push({
        id: `task-cal-${t.id}`,
        title: `[Due] ${t.title}`,
        date: t.dueDate,
        time: t.dueTime,
        type: t.category === 'Project' ? 'Project' : 'Assignment',
        subjectId: t.subjectId,
        color: sub?.color || '#f59e0b',
        isFromTask: true,
      });
    });

    return items.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (subjectFilter !== 'all' && item.subjectId !== subjectFilter) return false;
      return true;
    });
  }, [calendarEvents, tasks, subjects, typeFilter, subjectFilter]);

  // Calendar matrix calculation for Month view
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const paddingDays = (firstDayOfMonth + 6) % 7; // Monday as first day

  const totalGridCells = Math.ceil((paddingDays + daysInMonth) / 7) * 7;

  // Selected date events
  const selectedDayItems = unifiedEvents.filter((item) => item.date === selectedDayEventsDate);

  const openAddModal = (dateStr?: string) => {
    setEditingEvent(null);
    setEventTitle('');
    setEventType('Exam');
    setEventSubjectId(subjects[0]?.id || '');
    setEventStartDate(dateStr || selectedDayEventsDate);
    setEventStartTime('10:00');
    setEventEndTime('12:00');
    setEventLocation('');
    setEventColor('#6366f1');
    setIsModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventType(event.eventType);
    setEventSubjectId(event.subjectId || '');
    setEventStartDate(event.startDate);
    setEventStartTime(event.startTime || '10:00');
    setEventEndTime(event.endTime || '12:00');
    setEventLocation(event.location || '');
    setEventColor(event.color || '#6366f1');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, {
        title: eventTitle.trim(),
        eventType,
        subjectId: eventSubjectId || undefined,
        startDate: eventStartDate,
        startTime: eventStartTime || undefined,
        endTime: eventEndTime || undefined,
        location: eventLocation.trim() || undefined,
        color: eventColor,
      });
    } else {
      createCalendarEvent({
        title: eventTitle.trim(),
        eventType,
        subjectId: eventSubjectId || undefined,
        startDate: eventStartDate,
        startTime: eventStartTime || undefined,
        endTime: eventEndTime || undefined,
        location: eventLocation.trim() || undefined,
        color: eventColor,
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    showConfirmDialog({
      title: `Delete Event "${title}"?`,
      message: 'Are you sure you want to remove this academic event?',
      confirmLabel: 'Delete Event',
      isDestructive: true,
      onConfirm: () => deleteCalendarEvent(id),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Academic Calendar
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage semester deadlines, exam sessions, holidays, and revision schedules.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Navigation & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white">
            {monthName}
          </h3>
        </div>

        {/* View Mode & Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Agenda
            </button>
          </div>

          {/* Event Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Types</option>
            <option value="Exam">Exams</option>
            <option value="Assignment">Assignments</option>
            <option value="Project">Projects</option>
            <option value="Holiday">Holidays</option>
            <option value="Study">Study Sessions</option>
            <option value="Personal">Personal</option>
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Courses</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Calendar Area: Grid + Selected Day Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month View (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden p-4 md:p-6">
          {viewMode === 'month' ? (
            <div>
              {/* Day Headers (Mon - Sun) */}
              <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Day Matrix */}
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {Array.from({ length: totalGridCells }).map((_, index) => {
                  const dayNum = index - paddingDays + 1;
                  const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;

                  if (!isCurrentMonth) {
                    return (
                      <div
                        key={index}
                        className="h-20 md:h-24 p-1 rounded-xl bg-slate-50/40 dark:bg-slate-950/20 border border-transparent opacity-30"
                      />
                    );
                  }

                  const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isToday = cellDateStr === new Date().toISOString().split('T')[0];
                  const isSelected = cellDateStr === selectedDayEventsDate;
                  const dayItems = unifiedEvents.filter((item) => item.date === cellDateStr);

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDayEventsDate(cellDateStr)}
                      className={`h-20 md:h-24 p-1.5 md:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                          : isToday
                          ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/10'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                            isToday
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {dayItems.length > 0 && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            {dayItems.length}
                          </span>
                        )}
                      </div>

                      {/* Mini pill badges */}
                      <div className="space-y-1 overflow-hidden mt-1">
                        {dayItems.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded truncate text-white shadow-2xs"
                            style={{ backgroundColor: item.color }}
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        ))}
                        {dayItems.length > 2 && (
                          <p className="text-[9px] text-slate-400 pl-1">
                            +{dayItems.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda List of Upcoming Events */
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">
                All Scheduled Academic Events
              </h4>
              {unifiedEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No events match your filter.</p>
              ) : (
                unifiedEvents
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.date} {item.time ? `at ${item.time}` : ''}
                          </p>
                        </div>
                      </div>

                      {item.originalEvent && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(item.originalEvent!)}
                            className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(item.originalEvent!.id, item.originalEvent!.title)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Selected Day Events Drawer (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Events for {new Date(selectedDayEventsDate + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <p className="text-xs text-slate-400">{selectedDayItems.length} items scheduled</p>
            </div>
            <button
              onClick={() => openAddModal(selectedDayEventsDate)}
              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 cursor-pointer"
              title="Add event on this date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {selectedDayItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">
                  No events on this day
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click the plus icon to add a study session, exam date, or event.
                </p>
                <button
                  onClick={() => openAddModal(selectedDayEventsDate)}
                  className="mt-3 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg cursor-pointer"
                >
                  Schedule Event
                </button>
              </div>
            ) : (
              selectedDayItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                    </div>

                    {item.originalEvent && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(item.originalEvent!)}
                          className="text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(item.originalEvent!.id, item.originalEvent!.title)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      {item.type}
                    </span>
                    {item.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.time}
                      </span>
                    )}
                    {item.isFromTask && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700">
                        Coursework Deadline
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingEvent ? 'Edit Event' : 'Create Academic Event'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Database Systems Midterm"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Exam">Exam</option>
                    <option value="Assignment">Assignment Deadline</option>
                    <option value="Project">Project Presentation</option>
                    <option value="Study">Study Session</option>
                    <option value="Holiday">University Holiday</option>
                    <option value="Personal">Personal Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Related Subject
                  </label>
                  <select
                    value={eventSubjectId}
                    onChange={(e) => setEventSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">General (No subject)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Start
                  </label>
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    End
                  </label>
                  <input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Location / Room
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exam Hall 3, Library Study Room"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingEvent ? 'Save Changes' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
