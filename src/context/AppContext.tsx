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
import {
  StudentUser,
  RegisterPayload,
  LoginPayload,
  OnboardingPayload,
} from '../types/auth';
import {
  DataService,
  calculateAttendanceStats,
  setActiveStudentId,
} from '../services/dataService';
import { AuthService } from '../services/authService';

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
  // Student Profile Management (Local Frontend Storage)
  student: StudentUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  loginStudent: (payload: LoginPayload) => StudentUser;
  registerStudent: (payload: RegisterPayload) => StudentUser;
  logoutStudent: () => void;
  completeOnboarding: (payload: OnboardingPayload) => StudentUser;

  // Academic State (Scoped to Authenticated Student)
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
  setStudentLabBatch: (batch: LabBatch) => void;

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
  // Authentication State
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // App Data State (scoped to authenticated student)
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

  // Load local student profile on startup
  useEffect(() => {
    setIsAuthLoading(true);
    try {
      const currentStudent = AuthService.getCurrentStudent();
      if (currentStudent) {
        setActiveStudentId(currentStudent.id);
        setStudent(currentStudent);

        // Sync local profile fields
        const currentProf = DataService.getProfile();
        const updatedProf: Partial<UserProfile> = {
          name: currentStudent.name,
          studentId: currentStudent.usn,
        };
        if (currentStudent.university) updatedProf.university = currentStudent.university;
        if (currentStudent.degree) updatedProf.degree = currentStudent.degree;
        if (currentStudent.semester) updatedProf.semester = currentStudent.semester;
        if (currentStudent.labBatch) updatedProf.labBatch = currentStudent.labBatch;

        DataService.updateProfile(updatedProf);

        if (currentStudent.defaultTargetPercentage) {
          DataService.updateSemesterSettings({
            defaultTargetPercentage: currentStudent.defaultTargetPercentage,
          });
        }

        loadData();
      } else {
        setActiveStudentId(null);
        setStudent(null);
      }
    } catch (err) {
      console.error('Failed to initialize local student profile:', err);
      setActiveStudentId(null);
      setStudent(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, [loadData]);

  // Sync theme with document element
  useEffect(() => {
    const isDark =
      preferences.theme === 'dark' ||
      (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  // Toast Notification System
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Confirm Dialog System
  const showConfirmDialog = useCallback((options: Omit<ConfirmDialogOptions, 'isOpen'>) => {
    setConfirmDialog({ ...options, isOpen: true });
  }, []);

  const hideConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Quick Add Modal System
  const openQuickAdd = useCallback((type: 'task' | 'note' | 'event' | 'subject' = 'task') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  }, []);

  const closeQuickAdd = useCallback(() => {
    setIsQuickAddOpen(false);
  }, []);

  // Search Modal
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  // Lab Batch Modal
  const openBatchModal = useCallback(() => setIsBatchModalOpen(true), []);
  const closeBatchModal = useCallback(() => setIsBatchModalOpen(false), []);

  const setStudentLabBatch = useCallback(
    (batch: LabBatch) => {
      const updated = DataService.updateProfile({ labBatch: batch });
      setProfile(updated);
      setTimetable(DataService.getTimetable(batch));

      // Also persist to local student profile if active
      if (student) {
        AuthService.updateOnboarding({ labBatch: batch });
        setStudent((prev) => (prev ? { ...prev, labBatch: batch } : null));
      }

      addToast({
        type: 'success',
        title: `Lab Batch ${batch} Selected`,
        description: `Timetable updated with practicals and labs assigned to Batch ${batch}.`,
      });
      closeBatchModal();
    },
    [addToast, closeBatchModal, student]
  );

  // Authentication Handlers
  // Local Student Profile Handlers
  const registerStudent = useCallback(
    (payload: RegisterPayload): StudentUser => {
      const newStudent = AuthService.register(payload);
      setActiveStudentId(newStudent.id);
      setStudent(newStudent);

      // Initialize profile with student Name & USN
      DataService.updateProfile({
        name: newStudent.name,
        studentId: newStudent.usn,
        university: newStudent.university || '',
        degree: newStudent.degree || '',
        semester: newStudent.semester || '3rd Semester',
      });

      loadData();
      return newStudent;
    },
    [loadData]
  );

  const loginStudent = useCallback(
    (payload: LoginPayload): StudentUser => {
      const loadedStudent = AuthService.login(payload);
      setActiveStudentId(loadedStudent.id);
      setStudent(loadedStudent);

      // Sync profile
      const profUpdates: Partial<UserProfile> = {
        name: loadedStudent.name,
        studentId: loadedStudent.usn,
      };
      if (loadedStudent.university) profUpdates.university = loadedStudent.university;
      if (loadedStudent.degree) profUpdates.degree = loadedStudent.degree;
      if (loadedStudent.semester) profUpdates.semester = loadedStudent.semester;
      if (loadedStudent.labBatch) profUpdates.labBatch = loadedStudent.labBatch;

      DataService.updateProfile(profUpdates);
      loadData();
      return loadedStudent;
    },
    [loadData]
  );

  const logoutStudent = useCallback(() => {
    AuthService.logout();
    setActiveStudentId(null);
    setStudent(null);
    loadData();
    addToast({
      type: 'info',
      title: 'Profile Switched / Logged Out',
      description: 'Your local student workspace has been closed.',
    });
  }, [addToast, loadData]);

  const completeOnboarding = useCallback(
    (payload: OnboardingPayload): StudentUser => {
      const updated = AuthService.updateOnboarding(payload);
      setStudent(updated);

      const profUpdates: Partial<UserProfile> = {};
      if (updated.university) profUpdates.university = updated.university;
      if (updated.degree) profUpdates.degree = updated.degree;
      if (updated.semester) profUpdates.semester = updated.semester;
      if (updated.labBatch) profUpdates.labBatch = updated.labBatch;
      DataService.updateProfile(profUpdates);

      if (payload.defaultTargetPercentage || payload.semesterStartDate || payload.semesterEndDate) {
        DataService.updateSemesterSettings({
          ...(payload.defaultTargetPercentage ? { defaultTargetPercentage: payload.defaultTargetPercentage } : {}),
          ...(payload.semesterStartDate ? { startDate: payload.semesterStartDate } : {}),
          ...(payload.semesterEndDate ? { endDate: payload.semesterEndDate } : {}),
        });
      }

      loadData();
      return updated;
    },
    [loadData]
  );

  // Subject Actions
  const createSubject = useCallback(
    (data: Parameters<typeof DataService.createSubject>[0]) => {
      const newSubject = DataService.createSubject(data);
      setSubjects(DataService.getSubjects());
      addToast({
        type: 'success',
        title: 'Subject Added',
        description: `${newSubject.name} (${newSubject.code}) has been created.`,
      });
      return newSubject;
    },
    [addToast]
  );

  const updateSubject = useCallback(
    (id: string, updates: Partial<Subject>) => {
      const updated = DataService.updateSubject(id, updates);
      if (updated) {
        setSubjects(DataService.getSubjects());
        addToast({
          type: 'success',
          title: 'Subject Updated',
          description: `Changes to ${updated.code} were saved.`,
        });
      }
    },
    [addToast]
  );

  const deleteSubject = useCallback(
    (id: string) => {
      DataService.deleteSubject(id);
      setSubjects(DataService.getSubjects());
      setTimetable(DataService.getTimetable(profile.labBatch));
      setAllTimetableSlots(DataService.getAllTimetableSlots());
      addToast({
        type: 'info',
        title: 'Subject Deleted',
        description: 'The subject and its timetable slots have been removed.',
      });
    },
    [addToast, profile.labBatch]
  );

  const archiveSubject = useCallback(
    (id: string, archived = true) => {
      const updated = DataService.archiveSubject(id, archived);
      if (updated) {
        setSubjects(DataService.getSubjects());
        addToast({
          type: 'info',
          title: archived ? 'Subject Archived' : 'Subject Unarchived',
          description: `${updated.code} has been ${archived ? 'archived' : 'restored'}.`,
        });
      }
    },
    [addToast]
  );

  // Attendance Actions
  const markAttendance = useCallback(
    (
      subjectId: string,
      status: AttendanceStatus,
      date?: string,
      timetableSlotId?: string,
      notes?: string
    ) => {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const { record, subject } = DataService.recordAttendance(
        subjectId,
        status,
        targetDate,
        timetableSlotId,
        notes
      );
      setAttendanceRecords(DataService.getAttendanceRecords());
      setSubjects(DataService.getSubjects());

      const statusLabels = {
        present: 'Marked Present',
        absent: 'Marked Absent',
        cancelled: 'Class Cancelled',
        unmarked: 'Attendance Cleared',
      };

      const stats = calculateAttendanceStats(
        subject.classesAttended,
        subject.classesAbsent,
        subject.targetPercentage
      );

      addToast({
        type: status === 'present' ? 'success' : status === 'absent' ? 'warning' : 'info',
        title: `${statusLabels[status]} — ${subject.code}`,
        description: `Current attendance: ${stats.currentPercentage}% (Target: ${subject.targetPercentage}%)`,
      });
    },
    [addToast]
  );

  // Timetable Actions
  const createTimetableSlot = useCallback(
    (slot: Parameters<typeof DataService.createTimetableSlot>[0]) => {
      DataService.createTimetableSlot(slot);
      setTimetable(DataService.getTimetable(profile.labBatch));
      setAllTimetableSlots(DataService.getAllTimetableSlots());
      addToast({
        type: 'success',
        title: 'Timetable Slot Added',
        description: `Scheduled on ${slot.day} at ${slot.startTime}.`,
      });
    },
    [addToast, profile.labBatch]
  );

  const updateTimetableSlot = useCallback(
    (id: string, updates: Partial<TimetableSlot>) => {
      DataService.updateTimetableSlot(id, updates);
      setTimetable(DataService.getTimetable(profile.labBatch));
      setAllTimetableSlots(DataService.getAllTimetableSlots());
      addToast({
        type: 'success',
        title: 'Timetable Slot Updated',
      });
    },
    [addToast, profile.labBatch]
  );

  const deleteTimetableSlot = useCallback(
    (id: string) => {
      DataService.deleteTimetableSlot(id);
      setTimetable(DataService.getTimetable(profile.labBatch));
      setAllTimetableSlots(DataService.getAllTimetableSlots());
      addToast({
        type: 'info',
        title: 'Class Removed from Timetable',
      });
    },
    [addToast, profile.labBatch]
  );

  const importTimetableScanned = useCallback(
    (entries: ScannedTimetableEntry[], mode: 'append' | 'replace') => {
      const count = DataService.importScannedEntries(entries, mode);
      setTimetable(DataService.getTimetable(profile.labBatch));
      setAllTimetableSlots(DataService.getAllTimetableSlots());
      setSubjects(DataService.getSubjects());
      addToast({
        type: 'success',
        title: 'Timetable Imported Successfully',
        description: `${count} timetable periods added from schedule scan.`,
      });
      return count;
    },
    [addToast, profile.labBatch]
  );

  // Task Actions
  const createTask = useCallback(
    (taskData: Parameters<typeof DataService.createTask>[0]) => {
      const task = DataService.createTask(taskData);
      setTasks(DataService.getTasks());
      addToast({
        type: 'success',
        title: 'Task Created',
        description: `${task.title} (Due: ${task.dueDate})`,
      });
      return task;
    },
    [addToast]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      DataService.updateTask(id, updates);
      setTasks(DataService.getTasks());
      addToast({
        type: 'success',
        title: 'Task Updated',
      });
    },
    [addToast]
  );

  const deleteTask = useCallback(
    (id: string) => {
      DataService.deleteTask(id);
      setTasks(DataService.getTasks());
      addToast({
        type: 'info',
        title: 'Task Removed',
      });
    },
    [addToast]
  );

  const toggleTaskStatus = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
      DataService.updateTask(id, {
        status: newStatus,
        completedAt: newStatus === 'Completed' ? new Date().toISOString() : undefined,
      });
      setTasks(DataService.getTasks());
      addToast({
        type: newStatus === 'Completed' ? 'success' : 'info',
        title: newStatus === 'Completed' ? 'Task Completed! 🎉' : 'Task Reopened',
        description: task.title,
      });
    },
    [tasks, addToast]
  );

  // Note Actions
  const createNote = useCallback(
    (noteData: Parameters<typeof DataService.createNote>[0]) => {
      const note = DataService.createNote(noteData);
      setNotes(DataService.getNotes());
      addToast({
        type: 'success',
        title: 'Note Created',
        description: note.title,
      });
      return note;
    },
    [addToast]
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<Note>) => {
      DataService.updateNote(id, updates);
      setNotes(DataService.getNotes());
      addToast({
        type: 'success',
        title: 'Note Saved',
      });
    },
    [addToast]
  );

  const deleteNote = useCallback(
    (id: string) => {
      DataService.deleteNote(id);
      setNotes(DataService.getNotes());
      addToast({
        type: 'info',
        title: 'Note Deleted',
      });
    },
    [addToast]
  );

  const togglePinNote = useCallback(
    (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      DataService.updateNote(id, { pinned: !note.pinned });
      setNotes(DataService.getNotes());
    },
    [notes]
  );

  // Calendar Event Actions
  const createCalendarEvent = useCallback(
    (eventData: Parameters<typeof DataService.createCalendarEvent>[0]) => {
      const event = DataService.createCalendarEvent(eventData);
      setCalendarEvents(DataService.getCalendarEvents());
      addToast({
        type: 'success',
        title: 'Event Scheduled',
        description: event.title,
      });
      return event;
    },
    [addToast]
  );

  const updateCalendarEvent = useCallback(
    (id: string, updates: Partial<CalendarEvent>) => {
      DataService.updateCalendarEvent(id, updates);
      setCalendarEvents(DataService.getCalendarEvents());
      addToast({
        type: 'success',
        title: 'Event Updated',
      });
    },
    [addToast]
  );

  const deleteCalendarEvent = useCallback(
    (id: string) => {
      DataService.deleteCalendarEvent(id);
      setCalendarEvents(DataService.getCalendarEvents());
      addToast({
        type: 'info',
        title: 'Event Removed',
      });
    },
    [addToast]
  );

  // Profile & Settings Actions
  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      const updated = DataService.updateProfile(updates);
      setProfile(updated);
      if (updates.labBatch !== undefined) {
        setTimetable(DataService.getTimetable(updates.labBatch));
      }
      addToast({
        type: 'success',
        title: 'Profile Updated',
        description: 'Student details have been saved.',
      });
    },
    [addToast]
  );

  const updateSemester = useCallback(
    (settings: Partial<SemesterSettings>) => {
      const updated = DataService.updateSemesterSettings(settings);
      setSemester(updated);
      addToast({
        type: 'success',
        title: 'Semester Settings Updated',
        description: `Target set to ${updated.defaultTargetPercentage}%.`,
      });
    },
    [addToast]
  );

  const updatePreferences = useCallback(
    (prefs: Partial<UserPreferences>) => {
      const updated = DataService.updatePreferences(prefs);
      setPreferences(updated);
      addToast({
        type: 'success',
        title: 'Preferences Saved',
      });
    },
    [addToast]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: nextTheme });
  }, [preferences.theme, updatePreferences]);

  const clearAllData = useCallback(() => {
    DataService.clearAllData();
    loadData();
    addToast({
      type: 'info',
      title: 'Local Academic Data Reset',
      description: 'Your subjects, timetable, and attendance have been reset to template defaults.',
    });
  }, [loadData, addToast]);

  return (
    <AppContext.Provider
      value={{
        student,
        isAuthenticated: Boolean(student),
        isAuthLoading,
        loginStudent,
        registerStudent,
        logoutStudent,
        completeOnboarding,
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
