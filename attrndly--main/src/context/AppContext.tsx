import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Subject,
  TimetableSlot,
  AttendanceRecord,
  Task,
  Note,
  CalendarEvent,
  UserProfile,
  SemesterSettings,
  UserPreferences,
  AttendanceStatus,
  ScannedTimetableEntry,
  LabBatch,
} from '../types';
import { DataService, calculateAttendanceStats } from '../services/dataService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

export interface ConfirmDialogOptions {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AppContextType {
  // State
  subjects: Subject[];
  timetable: TimetableSlot[];
  attendanceRecords: AttendanceRecord[];
  tasks: Task[];
  notes: Note[];
  calendarEvents: CalendarEvent[];
  profile: UserProfile;
  semester: SemesterSettings;
  preferences: UserPreferences;
  toasts: ToastMessage[];

  // All timetable slots (unfiltered master)
  allTimetableSlots: TimetableSlot[];

  // Lab Batch Onboarding / Selection Modal
  isBatchModalOpen: boolean;
  openBatchModal: () => void;
  closeBatchModal: () => void;
  setStudentLabBatch: (batch: import('../types').LabBatch) => void;

  // Modals & UI Controls
  isQuickAddOpen: boolean;
  quickAddType: 'task' | 'note' | 'event' | 'subject';
  openQuickAdd: (type?: 'task' | 'note' | 'event' | 'subject') => void;
  closeQuickAdd: () => void;

  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  confirmDialog: ConfirmDialogOptions;
  showConfirmDialog: (options: Omit<ConfirmDialogOptions, 'isOpen'>) => void;
  hideConfirmDialog: () => void;

  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Actions
  refreshAll: () => void;
  
  // Subjects
  createSubject: (data: Parameters<typeof DataService.createSubject>[0]) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  archiveSubject: (id: string, archived?: boolean) => void;

  // Attendance
  markAttendance: (
    subjectId: string,
    status: AttendanceStatus,
    date?: string,
    timetableSlotId?: string,
    notes?: string
  ) => void;

  // Timetable
  createTimetableSlot: (slot: Parameters<typeof DataService.createTimetableSlot>[0]) => void;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  importTimetableScanned: (entries: ScannedTimetableEntry[], mode: 'append' | 'replace') => number;

  // Tasks
  createTask: (task: Parameters<typeof DataService.createTask>[0]) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Notes
  createNote: (note: Parameters<typeof DataService.createNote>[0]) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Calendar
  createCalendarEvent: (event: Parameters<typeof DataService.createCalendarEvent>[0]) => CalendarEvent;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Profile & Settings
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSemester: (settings: Partial<SemesterSettings>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  toggleTheme: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [allTimetableSlots, setAllTimetableSlots] = useState<TimetableSlot[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DataService.getProfile());
  const [semester, setSemester] = useState<SemesterSettings>(DataService.getSemesterSettings());
  const [preferences, setPreferences] = useState<UserPreferences>(DataService.getPreferences());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // UI state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'note' | 'event' | 'subject'>('task');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const loadData = useCallback(() => {
    const prof = DataService.getProfile();
    setProfile(prof);
    setSubjects(DataService.getSubjects());
    setTimetable(DataService.getTimetable(prof.labBatch));
    setAllTimetableSlots(DataService.getAllTimetableSlots());
    setAttendanceRecords(DataService.getAttendanceRecords());
    setTasks(DataService.getTasks());
    setNotes(DataService.getNotes());
    setCalendarEvents(DataService.getCalendarEvents());
    setSemester(DataService.getSemesterSettings());
    setPreferences(DataService.getPreferences());
  }, []);

  useEffect(() => {
    loadData();
    // Prompt student on first visit or when batch is unset
    const currentProf = DataService.getProfile();
    if (!currentProf.labBatch) {
      setIsBatchModalOpen(true);
    }
  }, [loadData]);

  // Sync theme with document element
  useEffect(() => {
    const isDark =
      preferences.theme === 'dark' ||
      (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [preferences.theme]);

  // Toasts
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirmDialog = useCallback((options: Omit<ConfirmDialogOptions, 'isOpen'>) => {
    setConfirmDialog({ ...options, isOpen: true });
  }, []);

  const hideConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openQuickAdd = (type: 'task' | 'note' | 'event' | 'subject' = 'task') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => setIsQuickAddOpen(false);
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  // Subject Actions
  const createSubject = (data: Parameters<typeof DataService.createSubject>[0]) => {
    const newSubject = DataService.createSubject(data);
    setSubjects(DataService.getSubjects());
    addToast({ type: 'success', title: 'Subject added', description: `${newSubject.name} (${newSubject.code})` });
    return newSubject;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    DataService.updateSubject(id, updates);
    setSubjects(DataService.getSubjects());
    addToast({ type: 'success', title: 'Subject updated' });
  };

  const deleteSubject = (id: string) => {
    const subj = subjects.find((s) => s.id === id);
    DataService.deleteSubject(id);
    setSubjects(DataService.getSubjects());
    setTimetable(DataService.getTimetable());
    addToast({ type: 'info', title: 'Subject deleted', description: subj?.name });
  };

  const archiveSubject = (id: string, archived = true) => {
    DataService.archiveSubject(id, archived);
    setSubjects(DataService.getSubjects());
    addToast({ type: 'info', title: archived ? 'Subject archived' : 'Subject restored' });
  };

  // Attendance Marking
  const markAttendance = (
    subjectId: string,
    status: AttendanceStatus,
    date?: string,
    timetableSlotId?: string,
    notes?: string
  ) => {
    const today = date || new Date().toISOString().split('T')[0];
    const { subject } = DataService.recordAttendance(subjectId, status, today, timetableSlotId, notes);
    
    // Refresh records and subjects
    setSubjects(DataService.getSubjects());
    setAttendanceRecords(DataService.getAttendanceRecords());

    const stats = calculateAttendanceStats(subject.classesAttended, subject.classesAbsent, subject.targetPercentage);
    addToast({
      type: status === 'present' ? 'success' : status === 'absent' ? 'warning' : 'info',
      title: `Marked as ${status.toUpperCase()}`,
      description: `${subject.name}: Current attendance is ${stats.currentPercentage}% (Target: ${subject.targetPercentage}%)`,
    });
  };

  // Timetable
  const createTimetableSlot = (slot: Parameters<typeof DataService.createTimetableSlot>[0]) => {
    DataService.createTimetableSlot(slot);
    setTimetable(DataService.getTimetable());
    addToast({ type: 'success', title: 'Timetable class scheduled' });
  };

  const updateTimetableSlot = (id: string, updates: Partial<TimetableSlot>) => {
    DataService.updateTimetableSlot(id, updates);
    setTimetable(DataService.getTimetable());
    addToast({ type: 'success', title: 'Class schedule updated' });
  };

  const deleteTimetableSlot = (id: string) => {
    DataService.deleteTimetableSlot(id);
    setTimetable(DataService.getTimetable());
    addToast({ type: 'info', title: 'Class removed from timetable' });
  };

  const importTimetableScanned = (entries: ScannedTimetableEntry[], mode: 'append' | 'replace'): number => {
    const count = DataService.importScannedEntries(entries, mode);
    setTimetable(DataService.getTimetable());
    setSubjects(DataService.getSubjects());
    addToast({
      type: 'success',
      title: 'Timetable imported successfully',
      description: `Added ${count} class sessions to your weekly schedule.`,
    });
    return count;
  };

  // Tasks
  const createTask = (taskData: Parameters<typeof DataService.createTask>[0]) => {
    const newTask = DataService.createTask(taskData);
    setTasks(DataService.getTasks());
    addToast({ type: 'success', title: 'Task created', description: newTask.title });
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    DataService.updateTask(id, updates);
    setTasks(DataService.getTasks());
  };

  const deleteTask = (id: string) => {
    DataService.deleteTask(id);
    setTasks(DataService.getTasks());
    addToast({ type: 'info', title: 'Task removed' });
  };

  const toggleTaskStatus = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    DataService.updateTask(id, { status: nextStatus });
    setTasks(DataService.getTasks());
    addToast({
      type: nextStatus === 'Completed' ? 'success' : 'info',
      title: nextStatus === 'Completed' ? 'Task marked complete!' : 'Task reopened',
      description: task.title,
    });
  };

  // Notes
  const createNote = (noteData: Parameters<typeof DataService.createNote>[0]) => {
    const newNote = DataService.createNote(noteData);
    setNotes(DataService.getNotes());
    addToast({ type: 'success', title: 'Note created', description: newNote.title });
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    DataService.updateNote(id, updates);
    setNotes(DataService.getNotes());
  };

  const deleteNote = (id: string) => {
    DataService.deleteNote(id);
    setNotes(DataService.getNotes());
    addToast({ type: 'info', title: 'Note deleted' });
  };

  const togglePinNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    DataService.updateNote(id, { pinned: !note.pinned });
    setNotes(DataService.getNotes());
  };

  // Calendar
  const createCalendarEvent = (eventData: Parameters<typeof DataService.createCalendarEvent>[0]) => {
    const newEvt = DataService.createCalendarEvent(eventData);
    setCalendarEvents(DataService.getCalendarEvents());
    addToast({ type: 'success', title: 'Event added to calendar', description: newEvt.title });
    return newEvt;
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    DataService.updateCalendarEvent(id, updates);
    setCalendarEvents(DataService.getCalendarEvents());
    addToast({ type: 'success', title: 'Event updated' });
  };

  const deleteCalendarEvent = (id: string) => {
    DataService.deleteCalendarEvent(id);
    setCalendarEvents(DataService.getCalendarEvents());
    addToast({ type: 'info', title: 'Event removed from calendar' });
  };

  // Lab Batch & Profile
  const openBatchModal = () => setIsBatchModalOpen(true);
  const closeBatchModal = () => setIsBatchModalOpen(false);

  const setStudentLabBatch = (batch: LabBatch) => {
    const updated = DataService.updateProfile({ labBatch: batch });
    setProfile(updated);
    setTimetable(DataService.getTimetable(batch));
    setAllTimetableSlots(DataService.getAllTimetableSlots());
    setIsBatchModalOpen(false);
    addToast({
      type: 'success',
      title: `Lab Batch ${batch} Selected`,
      description: `Your weekly schedule has been updated with ${batch} practicals (DSL, IMLL, TechExL).`,
    });
  };

  const updateProfile = (p: Partial<UserProfile>) => {
    const updated = DataService.updateProfile(p);
    setProfile(updated);
    if (p.labBatch !== undefined) {
      setTimetable(DataService.getTimetable(p.labBatch));
    }
    addToast({ type: 'success', title: 'Profile details saved' });
  };

  const updateSemester = (s: Partial<SemesterSettings>) => {
    const updated = DataService.updateSemesterSettings(s);
    setSemester(updated);
    addToast({ type: 'success', title: 'Semester configuration updated' });
  };

  const updatePreferences = (pref: Partial<UserPreferences>) => {
    const updated = DataService.updatePreferences(pref);
    setPreferences(updated);
  };

  const toggleTheme = () => {
    const next = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: next });
  };

  const clearAllData = () => {
    DataService.clearAllData();
    loadData();
    addToast({ type: 'info', title: 'Workspace cleared', description: 'All local records have been cleared.' });
  };

  return (
    <AppContext.Provider
      value={{
        subjects,
        timetable,
        allTimetableSlots,
        isBatchModalOpen,
        openBatchModal,
        closeBatchModal,
        setStudentLabBatch,
        attendanceRecords,
        tasks,
        notes,
        calendarEvents,
        profile,
        semester,
        preferences,
        toasts,
        isQuickAddOpen,
        quickAddType,
        openQuickAdd,
        closeQuickAdd,
        isSearchOpen,
        openSearch,
        closeSearch,
        confirmDialog,
        showConfirmDialog,
        hideConfirmDialog,
        addToast,
        removeToast,
        refreshAll: loadData,
        createSubject,
        updateSubject,
        deleteSubject,
        archiveSubject,
        markAttendance,
        createTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        importTimetableScanned,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        createNote,
        updateNote,
        deleteNote,
        togglePinNote,
        createCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        updateProfile,
        updateSemester,
        updatePreferences,
        toggleTheme,
        resetAllData: clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
