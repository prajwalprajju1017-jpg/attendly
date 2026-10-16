import React, { useState, useRef } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Upload,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit,
  X,
  FileImage,
  RefreshCw,
  Info,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DayOfWeek, SubjectType, TimetableSlot, ScannedTimetableEntry } from '../types';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TimetablePage: React.FC = () => {
  const {
    timetable,
    subjects,
    semester,
    createTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    importTimetableScanned,
    showConfirmDialog,
  } = useApp();

  // View state
  const [viewMode, setViewMode] = useState<'week' | 'agenda'>('week');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Manual Add/Edit Class Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [slotSubjectId, setSlotSubjectId] = useState('');
  const [slotDay, setSlotDay] = useState<DayOfWeek>('Monday');
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:15');
  const [slotRoom, setSlotRoom] = useState('');
  const [slotType, setSlotType] = useState<SubjectType>('Lecture');

  // Timetable Scanner Modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerStep, setScannerStep] = useState<'upload' | 'review'>('upload');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [scannedEntries, setScannedEntries] = useState<ScannedTimetableEntry[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current day highlighting
  const currentDayName: DayOfWeek = DAYS_OF_WEEK[(new Date().getDay() + 6) % 7];

  // Week Date calculation
  const getWeekRange = (offset: number) => {
    const now = new Date();
    const currentMonday = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
    currentMonday.setDate(diff);

    const sunday = new Date(currentMonday);
    sunday.setDate(currentMonday.getDate() + 6);

    const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${currentMonday.toLocaleDateString(undefined, formatOpts)} - ${sunday.toLocaleDateString(undefined, formatOpts)}, ${sunday.getFullYear()}`;
  };

  // Open Add slot modal
  const openAddSlot = (day: DayOfWeek = 'Monday') => {
    setEditingSlot(null);
    setSlotSubjectId(subjects[0]?.id || '');
    setSlotDay(day);
    setSlotStartTime('09:00');
    setSlotEndTime('10:15');
    setSlotRoom('');
    setSlotType('Lecture');
    setIsSlotModalOpen(true);
  };

  const openEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotSubjectId(slot.subjectId);
    setSlotDay(slot.day);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);
    setSlotRoom(slot.room);
    setSlotType(slot.type);
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotSubjectId) return;

    if (editingSlot) {
      updateTimetableSlot(editingSlot.id, {
        subjectId: slotSubjectId,
        day: slotDay,
        startTime: slotStartTime,
        endTime: slotEndTime,
        room: slotRoom.trim() || 'TBD',
        type: slotType,
      });
    } else {
      createTimetableSlot({
        subjectId: slotSubjectId,
        day: slotDay,
        startTime: slotStartTime,
        endTime: slotEndTime,
        room: slotRoom.trim() || 'TBD',
        type: slotType,
      });
    }
    setIsSlotModalOpen(false);
  };

  const handleDeleteSlotPrompt = (slot: TimetableSlot) => {
    const sub = subjects.find((s) => s.id === slot.subjectId);
    showConfirmDialog({
      title: 'Remove Class from Timetable?',
      message: `Are you sure you want to delete ${sub?.name || 'this class'} on ${slot.day} (${slot.startTime} - ${slot.endTime})? Historical attendance records will remain preserved.`,
      confirmLabel: 'Remove Class',
      isDestructive: true,
      onConfirm: () => {
        deleteTimetableSlot(slot.id);
      },
    });
  };

  // --- SCANNER LOGIC ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImagePreview(reader.result as string);
      setScannerStep('review');
      // No fake dummy courses. Start with empty entries ready for student input/transcription
      setScannedEntries([]);
    };
    reader.readAsDataURL(file);
  };

  const handleAddScannedRow = () => {
    const newEntry: ScannedTimetableEntry = {
      id: `manual-entry-${Date.now()}`,
      day: 'Monday',
      subjectName: '',
      isNewSubject: true,
      startTime: '09:00',
      endTime: '10:15',
      room: '',
      type: 'Lecture',
      confidence: 100,
    };
    setScannedEntries((prev) => [...prev, newEntry]);
  };

  const handleUpdateScannedEntry = (id: string, updates: Partial<ScannedTimetableEntry>) => {
    setScannedEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const handleRemoveScannedEntry = (id: string) => {
    setScannedEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleConfirmImport = () => {
    showConfirmDialog({
      title: 'Confirm Timetable Import',
      message: `Import ${scannedEntries.length} timetable entries using mode: "${importMode.toUpperCase()}". Your historical attendance records will remain preserved.`,
      confirmLabel: 'Import Entries',
      onConfirm: () => {
        importTimetableScanned(scannedEntries, importMode);
        setIsScannerOpen(false);
        setUploadedImagePreview(null);
        setScannedEntries([]);
        setScannerStep('upload');
      },
    });
  };

  // Group timetable by day
  const slotsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = timetable
      .filter((s) => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<DayOfWeek, TimetableSlot[]>);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Weekly Timetable
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your university schedule, upload timetable photos, and organize study periods.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scanner Button */}
          <button
            onClick={() => {
              setScannerStep('upload');
              setUploadedImagePreview(null);
              setIsScannerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-200/60 dark:border-indigo-800/50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Scan Timetable Image
          </button>

          {/* Add Class Manual Button */}
          <button
            onClick={() => openAddSlot('Monday')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        </div>
      </div>

      {/* Week Navigator & View Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Week pagination */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Current Week
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">
            {getWeekRange(weekOffset)}
          </span>
        </div>

        {/* View Toggle (Week vs Agenda) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Week Grid
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Agenda View
          </button>
        </div>
      </div>

      {/* Break period notice */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 px-4 py-2.5 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Scheduled Campus Break:</strong> Daily lunch break from 12:30 PM to 1:30 PM.
          </span>
        </div>
        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium hidden sm:inline">
          {semester.name}
        </span>
      </div>

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day === currentDayName && weekOffset === 0;
            const slots = slotsByDay[day] || [];

            return (
              <div
                key={day}
                className={`flex flex-col bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                  isToday
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-3.5 rounded-t-2xl flex items-center justify-between border-b ${
                    isToday
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">{day}</span>
                    {isToday && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white text-indigo-700">
                        Today
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openAddSlot(day)}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      isToday
                        ? 'hover:bg-indigo-500 text-white'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'
                    }`}
                    title={`Add class on ${day}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Slots */}
                <div className="p-3 space-y-2.5 flex-1 min-h-[160px]">
                  {slots.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <p className="text-xs text-slate-400">No classes</p>
                    </div>
                  ) : (
                    slots.map((slot) => {
                      const sub = subjects.find((s) => s.id === slot.subjectId);

                      return (
                        <div
                          key={slot.id}
                          className="group relative p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all text-xs"
                        >
                          <div
                            className="w-1.5 absolute left-0 top-2 bottom-2 rounded-r"
                            style={{ backgroundColor: sub?.color || '#6366f1' }}
                          />
                          <div className="pl-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                                {sub?.code || 'CLASS'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {slot.type}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                              {sub?.name || 'Unknown Subject'}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <span className="font-mono text-[10px]">
                                {slot.room}
                              </span>
                            </div>
                          </div>

                          {/* Hover action overlay */}
                          <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 rounded p-0.5 shadow-xs">
                            <button
                              onClick={() => openEditSlot(slot)}
                              className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                              title="Edit class"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlotPrompt(slot)}
                              className="p-1 text-slate-500 hover:text-rose-600 cursor-pointer"
                              title="Remove class"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Day Selector Pills */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto p-2 bg-slate-50/50 dark:bg-slate-800/50 gap-1.5">
            {DAYS_OF_WEEK.map((day) => {
              const count = (slotsByDay[day] || []).length;
              const isSelected = selectedDay === day;
              const isToday = day === currentDayName;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Agenda List for Selected Day */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {selectedDay}&apos;s Class Schedule
                {selectedDay === currentDayName && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-bold">
                    Today
                  </span>
                )}
              </h3>
              <button
                onClick={() => openAddSlot(selectedDay)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add session to {selectedDay}
              </button>
            </div>

            {slotsByDay[selectedDay].length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-medium text-sm">No classes on {selectedDay}</p>
                <p className="text-xs text-slate-500 mt-0.5">Use this day for revision, labs, or coursework.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {slotsByDay[selectedDay].map((slot) => {
                  const sub = subjects.find((s) => s.id === slot.subjectId);

                  return (
                    <div
                      key={slot.id}
                      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-3 h-12 rounded-full shrink-0"
                          style={{ backgroundColor: sub?.color || '#6366f1' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                              {sub?.code || 'CLASS'}
                            </span>
                            <span className="text-xs font-medium text-slate-500">{slot.type}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                            {sub?.name || 'Unknown Class'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              Room {slot.room}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditSlot(slot)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlotPrompt(slot)}
                          className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIMETABLE IMAGE SCANNER MODAL */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Timetable Image Scanner
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload your university schedule image (PNG, JPG, JPEG) to extract weekly slots.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content by step */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* STEP 1: UPLOAD */}
              {scannerStep === 'upload' && (
                <div className="space-y-4 text-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-8 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <FileImage className="w-12 h-12 mx-auto text-indigo-500 mb-3" />
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      Click to browse or drop your timetable screenshot
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PNG, JPG, or JPEG up to 10MB
                    </p>
                  </div>

                  <div className="text-left bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl text-xs space-y-1 text-indigo-950 dark:text-indigo-200">
                    <p className="font-bold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-indigo-600" />
                      Timetable Schedule Digitizer
                    </p>
                    <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
                      Upload your timetable image as a side-by-side reference. You can review, transcribe, and map each slot to your enrolled courses before adding them to your weekly schedule.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & CORRECTION TABLE */}
              {scannerStep === 'review' && (
                <div className="space-y-4">
                  {/* Upload preview thumbnail & status banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      {uploadedImagePreview && (
                        <img
                          src={uploadedImagePreview}
                          alt="Timetable Preview"
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Uploaded Timetable Screenshot
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Automatic OCR requires an active recognition service. Use your image as reference to add or review sessions below.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={handleAddScannedRow}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Row
                      </button>

                      <select
                        value={importMode}
                        onChange={(e) => setImportMode(e.target.value as any)}
                        className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        <option value="append">Append to Schedule</option>
                        <option value="replace">Replace Schedule</option>
                      </select>
                    </div>
                  </div>

                  {/* Empty state when scannedEntries is empty */}
                  {scannedEntries.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-500">
                      <FileImage className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No rows added to import table yet
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Click &ldquo;Add Row&rdquo; above to enter class slots matching your uploaded timetable.
                      </p>
                    </div>
                  ) : (
                    /* Editable Table */
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-2.5">Day</th>
                          <th className="p-2.5">Extracted Name</th>
                          <th className="p-2.5">Course Match</th>
                          <th className="p-2.5">Time Interval</th>
                          <th className="p-2.5">Room</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {scannedEntries.map((entry) => (
                          <tr
                            key={entry.id}
                            className={entry.flagged ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}
                          >
                            {/* Day select */}
                            <td className="p-2">
                              <select
                                value={entry.day}
                                onChange={(e) =>
                                  handleUpdateScannedEntry(entry.id, { day: e.target.value as DayOfWeek })
                                }
                                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                              >
                                {DAYS_OF_WEEK.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Extracted Subject Name */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={entry.subjectName}
                                onChange={(e) =>
                                  handleUpdateScannedEntry(entry.id, { subjectName: e.target.value })
                                }
                                className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                              />
                            </td>

                            {/* Subject Match / Create New */}
                            <td className="p-2">
                              <select
                                value={entry.matchedSubjectId || (entry.isNewSubject ? 'NEW' : '')}
                                onChange={(e) => {
                                  if (e.target.value === 'NEW') {
                                    handleUpdateScannedEntry(entry.id, { isNewSubject: true, matchedSubjectId: undefined });
                                  } else {
                                    handleUpdateScannedEntry(entry.id, { isNewSubject: false, matchedSubjectId: e.target.value });
                                  }
                                }}
                                className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                              >
                                <option value="NEW">+ Create as New Subject</option>
                                {subjects.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    Map: {s.code} - {s.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Start & End Times */}
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="time"
                                  value={entry.startTime}
                                  onChange={(e) =>
                                    handleUpdateScannedEntry(entry.id, { startTime: e.target.value })
                                  }
                                  className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  value={entry.endTime}
                                  onChange={(e) =>
                                    handleUpdateScannedEntry(entry.id, { endTime: e.target.value })
                                  }
                                  className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                                />
                              </div>
                            </td>

                            {/* Room */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={entry.room}
                                onChange={(e) =>
                                  handleUpdateScannedEntry(entry.id, { room: e.target.value })
                                }
                                className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px]"
                              />
                            </td>

                            {/* Type */}
                            <td className="p-2">
                              <select
                                value={entry.type}
                                onChange={(e) =>
                                  handleUpdateScannedEntry(entry.id, { type: e.target.value as SubjectType })
                                }
                                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                              >
                                <option value="Lecture">Lecture</option>
                                <option value="Lab">Lab</option>
                                <option value="Practical">Practical</option>
                                <option value="Tutorial">Tutorial</option>
                              </select>
                            </td>

                            {/* Remove button */}
                            <td className="p-2 text-right">
                              <button
                                onClick={() => handleRemoveScannedEntry(entry.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                title="Remove row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              {scannerStep === 'review' && (
                <button
                  type="button"
                  disabled={scannedEntries.length === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Import Timetable
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL CLASS ADD / EDIT MODAL */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingSlot ? 'Edit Scheduled Class' : 'Schedule New Class'}
              </h3>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <select
                  required
                  value={slotSubjectId}
                  onChange={(e) => setSlotSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Day of Week
                  </label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Class Type
                  </label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Practical">Practical</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Room / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hall B-204"
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingSlot ? 'Save Changes' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
