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
  AttendanceCalculationResult,
  DayOfWeek,
  AttendanceStatus,
  ScannedTimetableEntry,
  LabBatch,
} from '../types';

const STORAGE_KEYS = {
  SUBJECTS: 'attendly_subjects_v3',
  TIMETABLE: 'attendly_timetable_v3',
  ATTENDANCE: 'attendly_attendance_v3',
  TASKS: 'attendly_tasks_v3',
  NOTES: 'attendly_notes_v3',
  CALENDAR: 'attendly_calendar_v3',
  PROFILE: 'attendly_profile_v3',
  SEMESTER: 'attendly_semester_v3',
  PREFERENCES: 'attendly_preferences_v3',
};

// Official Sri Siddhartha Institute of Technology - Dept. of CSE (Data Science) 3rd Sem Subjects
export const OFFICIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-oops',
    name: 'Object Oriented Programming with C++ / Java',
    code: 'OOPS',
    type: 'Lecture',
    color: '#4f46e5',
    room: '102',
    targetPercentage: 75,
    totalEligibleClasses: 0,
    classesAttended: 0,
    classesAbsent: 0,
    classesCancelled: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sub-mat',
    name: 'Mathematics (Transform Calculus & Linear Algebra)',
    code: 'MAT',
    type: 'Lecture',
    color: '#0284c7',
    room: '102',
    targetPercentage: 75,
    totalEligibleClasses: 0,
    classesAttended: 0,
    classesAbsent: 0,
    classesCancelled: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sub-iml',
    name: 'Introduction to Machine Learning',
    code: 'IML',
    type: 'Lecture',
    color: '#7c3aed',
    room: '102',
    targetPercentage: 75,
    totalEligibleClasses: 0,
    classesAttended: 0,
    classesAbsent: 0,
    classesCancelled: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sub-ds',
    name: 'Data Structures and Applications',
    code: 'DS',
    type: 'Lecture',
    color: '#059669',
    room: '102',
    targetPercentage: 75,
    totalEligibleClasses: 0,
    classesAttended: 0,
    classesAbsent: 0,
    classesCancelled: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sub-os',
    name: 'Operating Systems',
    code: 'OS',
    type: 'Lecture',
    color: '#d97706',
    room: '102',
    targetPercentage: 75,
    totalEligibleClasses: 0,
    classesAttended: 0,
    classesAbsent: 0,
    classesCancelled: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sub-fai',
    name: 'Foundations of Artificial Intelligence',
    code: 'FAI',
    type: 'Lecture',
    color: '#db2777',
    room: '102',
    targetPercentage: 75,
    totalEligibleClasses: 0,
    classesAttended: 0,
    classesAbsent: 0,
    classesCancelled: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sub-dsl',
    name: 'Data Structures Laboratory',
    code: 'DSL',
    type: 'Lab',
    color: '#10b981',
    instructorName: 'AHR / NR',
    room: 'DS Lab',
    targetPercentage: 75,
    totalEligibleClasses: 0,
    classesAttended: 0,
    classesAbsent: 0,
    classesCancelled: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sub-imll',
    name: 'Introduction to Machine Learning Laboratory',
    code: 'IMLL',
    type: 'Lab',
    color: '#8b5cf6',
    instructorName: 'KVL / UV / VU',
    room: 'ML Lab',
    targetPercentage: 75,
    totalEligibleClasses: 0,
    classesAttended: 0,
    classesAbsent: 0,
    classesCancelled: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sub-techexl',
    name: 'Technical Experiential Learning',
    code: 'TechExL',
    type: 'Lab',
    color: '#f43f5e',
    instructorName: 'SKS / RS / NR / AHR',
    room: 'Project Lab',
    targetPercentage: 75,
    totalEligibleClasses: 0,
    classesAttended: 0,
    classesAbsent: 0,
    classesCancelled: 0,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];

// Official Sri Siddhartha Institute of Technology 3rd Sem Timetable
// Room 102 | Dept. of CSE (Data Science)
export const OFFICIAL_TIMETABLE_SLOTS: TimetableSlot[] = [
  // --- MONDAY ---
  {
    id: 'tt-mon-1',
    subjectId: 'sub-oops',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-mon-2',
    subjectId: 'sub-mat',
    day: 'Monday',
    startTime: '10:00',
    endTime: '11:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-mon-dsl-b1',
    subjectId: 'sub-dsl',
    day: 'Monday',
    startTime: '11:15',
    endTime: '13:15',
    room: 'DS Lab',
    type: 'Lab',
    batch: 'B1',
    instructor: 'AHR/NR',
    notes: 'DSL(B1) (AHR/NR)',
  },
  {
    id: 'tt-mon-imll-b2',
    subjectId: 'sub-imll',
    day: 'Monday',
    startTime: '11:15',
    endTime: '13:15',
    room: 'ML Lab',
    type: 'Lab',
    batch: 'B2',
    instructor: 'KVL/UV',
    notes: 'IMLL(B2) (KVL/UV)',
  },
  {
    id: 'tt-mon-techexl-b3',
    subjectId: 'sub-techexl',
    day: 'Monday',
    startTime: '14:15',
    endTime: '17:15',
    room: 'Project Lab',
    type: 'Lab',
    batch: 'B3',
    instructor: 'SKS/RS',
    notes: 'TechExL(B3) (SKS/RS)',
  },

  // --- TUESDAY ---
  {
    id: 'tt-tue-1',
    subjectId: 'sub-mat',
    day: 'Tuesday',
    startTime: '09:00',
    endTime: '10:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-tue-2',
    subjectId: 'sub-iml',
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '11:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-tue-3',
    subjectId: 'sub-ds',
    day: 'Tuesday',
    startTime: '11:15',
    endTime: '12:15',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-tue-4',
    subjectId: 'sub-os',
    day: 'Tuesday',
    startTime: '12:15',
    endTime: '13:15',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-tue-techexl-b2',
    subjectId: 'sub-techexl',
    day: 'Tuesday',
    startTime: '14:15',
    endTime: '17:15',
    room: 'Project Lab',
    type: 'Lab',
    batch: 'B2',
    instructor: 'RS/SKS',
    notes: 'TechExL(B2) (RS/SKS)',
  },

  // --- WEDNESDAY ---
  {
    id: 'tt-wed-1',
    subjectId: 'sub-ds',
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '10:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-wed-2',
    subjectId: 'sub-fai',
    day: 'Wednesday',
    startTime: '10:00',
    endTime: '11:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-wed-dsl-b2',
    subjectId: 'sub-dsl',
    day: 'Wednesday',
    startTime: '11:15',
    endTime: '13:15',
    room: 'DS Lab',
    type: 'Lab',
    batch: 'B2',
    instructor: 'AHR/NR',
    notes: 'DSL(B2) (AHR/NR)',
  },
  {
    id: 'tt-wed-imll-b3',
    subjectId: 'sub-imll',
    day: 'Wednesday',
    startTime: '11:15',
    endTime: '13:15',
    room: 'ML Lab',
    type: 'Lab',
    batch: 'B3',
    instructor: 'KVL/VU',
    notes: 'IMLL(B3) (KVL/VU)',
  },
  {
    id: 'tt-wed-3',
    subjectId: 'sub-mat',
    day: 'Wednesday',
    startTime: '14:15',
    endTime: '15:15',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-wed-4',
    subjectId: 'sub-os',
    day: 'Wednesday',
    startTime: '15:15',
    endTime: '16:15',
    room: '102',
    type: 'Tutorial',
    isSpecialSession: true,
    notes: 'OS(S) Seminar/Tutorial',
  },

  // --- THURSDAY ---
  {
    id: 'tt-thu-1',
    subjectId: 'sub-iml',
    day: 'Thursday',
    startTime: '09:00',
    endTime: '10:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-thu-2',
    subjectId: 'sub-oops',
    day: 'Thursday',
    startTime: '10:00',
    endTime: '11:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-thu-3',
    subjectId: 'sub-ds',
    day: 'Thursday',
    startTime: '11:15',
    endTime: '12:15',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-thu-4',
    subjectId: 'sub-fai',
    day: 'Thursday',
    startTime: '12:15',
    endTime: '13:15',
    room: '102',
    type: 'Tutorial',
    isSpecialSession: true,
    notes: 'FAI(S) Seminar/Tutorial',
  },
  {
    id: 'tt-thu-techexl-b1',
    subjectId: 'sub-techexl',
    day: 'Thursday',
    startTime: '14:15',
    endTime: '17:15',
    room: 'Project Lab',
    type: 'Lab',
    batch: 'B1',
    instructor: 'NR/AHR',
    notes: 'TechExL(B1) (NR/AHR)',
  },

  // --- FRIDAY ---
  {
    id: 'tt-fri-1',
    subjectId: 'sub-fai',
    day: 'Friday',
    startTime: '09:00',
    endTime: '10:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-fri-2',
    subjectId: 'sub-os',
    day: 'Friday',
    startTime: '10:00',
    endTime: '11:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-fri-dsl-b3',
    subjectId: 'sub-dsl',
    day: 'Friday',
    startTime: '11:15',
    endTime: '13:15',
    room: 'DS Lab',
    type: 'Lab',
    batch: 'B3',
    instructor: 'AHR/NR',
    notes: 'DSL(B3) (AHR/NR)',
  },
  {
    id: 'tt-fri-imll-b1',
    subjectId: 'sub-imll',
    day: 'Friday',
    startTime: '11:15',
    endTime: '13:15',
    room: 'ML Lab',
    type: 'Lab',
    batch: 'B1',
    instructor: 'KVL/UV',
    notes: 'IMLL(B1) (KVL/UV)',
  },
  {
    id: 'tt-fri-3',
    subjectId: 'sub-oops',
    day: 'Friday',
    startTime: '14:15',
    endTime: '15:15',
    room: '102',
    type: 'Tutorial',
    isSpecialSession: true,
    notes: 'OOPS(S) Seminar/Tutorial',
  },
  {
    id: 'tt-fri-4',
    subjectId: 'sub-iml',
    day: 'Friday',
    startTime: '15:15',
    endTime: '16:15',
    room: '102',
    type: 'Tutorial',
    isSpecialSession: true,
    notes: 'IML(S) Seminar/Tutorial',
  },

  // --- SATURDAY ---
  {
    id: 'tt-sat-1',
    subjectId: 'sub-oops',
    day: 'Saturday',
    startTime: '09:00',
    endTime: '10:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-sat-2',
    subjectId: 'sub-iml',
    day: 'Saturday',
    startTime: '10:00',
    endTime: '11:00',
    room: '102',
    type: 'Lecture',
  },
  {
    id: 'tt-sat-3',
    subjectId: 'sub-ds',
    day: 'Saturday',
    startTime: '11:15',
    endTime: '12:15',
    room: '102',
    type: 'Tutorial',
    isSpecialSession: true,
    notes: 'DS(S) Seminar/Tutorial',
  },
  {
    id: 'tt-sat-4',
    subjectId: 'sub-os',
    day: 'Saturday',
    startTime: '12:15',
    endTime: '13:15',
    room: '102',
    type: 'Lecture',
  },
];

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  university: 'Sri Siddhartha Institute of Technology',
  degree: 'CSE (Data Science)',
  semester: '3rd Semester (2026–27)',
  studentId: '',
  labBatch: undefined, // Pending lab batch selection
};

const DEFAULT_SEMESTER: SemesterSettings = {
  name: '3rd Semester (2026–27)',
  startDate: '2026-08-01',
  endDate: '2026-12-31',
  defaultTargetPercentage: 75,
  breaksAndHolidays: [
    { id: 'break-lunch', title: 'Daily Lunch Break (1:15 PM - 2:15 PM)', date: '2026-08-01' },
    { id: 'break-tea', title: 'Morning Interval (11:00 AM - 11:15 AM)', date: '2026-08-01' },
  ],
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  notificationReminders: true,
  reminderMinutesBeforeClass: 15,
  highlightLowAttendance: true,
  weekStartsOnMonday: true,
  compactTimetable: false,
};

let activeStudentId: string | null = null;

export function setActiveStudentId(studentId: string | null): void {
  activeStudentId = studentId;
}

export function getActiveStudentId(): string | null {
  return activeStudentId;
}

function getScopedKey(key: string): string {
  if (activeStudentId) {
    return `${key}_std_${activeStudentId}`;
  }
  return key;
}

// Storage helper functions
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const scopedKey = getScopedKey(key);
    const item = localStorage.getItem(scopedKey);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error loading from storage key ${key}:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    const scopedKey = getScopedKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to storage key ${key}:`, e);
  }
}

// Attendance Calculation Helpers
export function calculateAttendanceStats(
  present: number,
  absent: number,
  targetPercentage: number
): AttendanceCalculationResult {
  const held = present + absent;
  
  if (held === 0) {
    return {
      classesHeld: 0,
      classesAttended: 0,
      currentPercentage: 0,
      targetPercentage,
      status: 'safe',
      classesNeededToTarget: 0,
      classesCanSkip: 0,
    };
  }

  const currentPercentage = Math.round((present / held) * 1000) / 10;

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (currentPercentage < targetPercentage) {
    status = 'danger';
  } else if (currentPercentage - targetPercentage < 5) {
    status = 'warning';
  }

  // Calculate consecutive classes needed to reach target:
  let classesNeededToTarget = 0;
  if (currentPercentage < targetPercentage) {
    if (targetPercentage >= 100) {
      classesNeededToTarget = absent > 0 ? 9999 : 0;
    } else {
      const numerator = targetPercentage * held - 100 * present;
      const denominator = 100 - targetPercentage;
      classesNeededToTarget = Math.max(0, Math.ceil(numerator / denominator));
    }
  }

  // Calculate classes that can be missed while staying >= target:
  let classesCanSkip = 0;
  if (currentPercentage >= targetPercentage && targetPercentage > 0) {
    const maxTotalClasses = (100 * present) / targetPercentage;
    classesCanSkip = Math.max(0, Math.floor(maxTotalClasses - held));
  }

  return {
    classesHeld: held,
    classesAttended: present,
    currentPercentage,
    targetPercentage,
    status,
    classesNeededToTarget,
    classesCanSkip,
  };
}

export const DataService = {
  // --- SUBJECTS ---
  getSubjects(): Subject[] {
    return loadFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, OFFICIAL_SUBJECTS);
  },

  createSubject(data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'totalEligibleClasses' | 'classesAttended' | 'classesAbsent' | 'classesCancelled'>): Subject {
    const subjects = this.getSubjects();
    const newSubject: Subject = {
      ...data,
      id: `sub-${Date.now()}`,
      totalEligibleClasses: 0,
      classesAttended: 0,
      classesAbsent: 0,
      classesCancelled: 0,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    subjects.push(newSubject);
    saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
    return newSubject;
  },

  updateSubject(id: string, updates: Partial<Subject>): Subject | null {
    const subjects = this.getSubjects();
    const index = subjects.findIndex((s) => s.id === id);
    if (index === -1) return null;
    subjects[index] = {
      ...subjects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
    return subjects[index];
  },

  deleteSubject(id: string): boolean {
    const subjects = this.getSubjects().filter((s) => s.id !== id);
    saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
    const timetable = this.getAllTimetableSlots().filter((t) => t.subjectId !== id);
    saveToStorage(STORAGE_KEYS.TIMETABLE, timetable);
    return true;
  },

  archiveSubject(id: string, archived = true): Subject | null {
    return this.updateSubject(id, { archived });
  },

  // --- ATTENDANCE RECORDS ---
  getAttendanceRecords(subjectId?: string): AttendanceRecord[] {
    const records = loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    if (subjectId) {
      return records.filter((r) => r.subjectId === subjectId);
    }
    return records;
  },

  recordAttendance(
    subjectId: string,
    status: AttendanceStatus,
    date: string,
    timetableSlotId?: string,
    notes?: string
  ): { record: AttendanceRecord; subject: Subject } {
    const records = loadFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    const subjects = this.getSubjects();
    const subjectIndex = subjects.findIndex((s) => s.id === subjectId);

    if (subjectIndex === -1) {
      throw new Error(`Subject with ID ${subjectId} not found`);
    }

    const existingIndex = records.findIndex(
      (r) => r.subjectId === subjectId && r.date === date && (timetableSlotId ? r.timetableSlotId === timetableSlotId : true)
    );

    const oldStatus: AttendanceStatus | null = existingIndex !== -1 ? records[existingIndex].status : null;

    const record: AttendanceRecord = {
      id: existingIndex !== -1 ? records[existingIndex].id : `att-${Date.now()}`,
      subjectId,
      timetableSlotId,
      date,
      status,
      notes,
      markedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }
    saveToStorage(STORAGE_KEYS.ATTENDANCE, records);

    // Update subject counters
    const subj = { ...subjects[subjectIndex] };

    if (oldStatus === 'present') subj.classesAttended = Math.max(0, subj.classesAttended - 1);
    else if (oldStatus === 'absent') subj.classesAbsent = Math.max(0, subj.classesAbsent - 1);
    else if (oldStatus === 'cancelled') subj.classesCancelled = Math.max(0, subj.classesCancelled - 1);

    if (status === 'present') subj.classesAttended += 1;
    else if (status === 'absent') subj.classesAbsent += 1;
    else if (status === 'cancelled') subj.classesCancelled += 1;

    subj.totalEligibleClasses = subj.classesAttended + subj.classesAbsent;
    subj.updatedAt = new Date().toISOString();

    subjects[subjectIndex] = subj;
    saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);

    return { record, subject: subj };
  },

  // --- TIMETABLE ---
  getAllTimetableSlots(): TimetableSlot[] {
    return loadFromStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, OFFICIAL_TIMETABLE_SLOTS);
  },

  getTimetable(batch?: LabBatch): TimetableSlot[] {
    const allSlots = this.getAllTimetableSlots();
    if (!batch) return allSlots;
    // Show shared theory/tutorial slots (batch is undefined) + batch-specific lab slots
    return allSlots.filter((slot) => !slot.batch || slot.batch === batch);
  },

  createTimetableSlot(slotData: Omit<TimetableSlot, 'id'>): TimetableSlot {
    const timetable = this.getAllTimetableSlots();
    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    timetable.push(newSlot);
    saveToStorage(STORAGE_KEYS.TIMETABLE, timetable);
    return newSlot;
  },

  updateTimetableSlot(id: string, updates: Partial<TimetableSlot>): TimetableSlot | null {
    const timetable = this.getAllTimetableSlots();
    const index = timetable.findIndex((t) => t.id === id);
    if (index === -1) return null;
    timetable[index] = { ...timetable[index], ...updates };
    saveToStorage(STORAGE_KEYS.TIMETABLE, timetable);
    return timetable[index];
  },

  deleteTimetableSlot(id: string): boolean {
    const timetable = this.getAllTimetableSlots().filter((t) => t.id !== id);
    saveToStorage(STORAGE_KEYS.TIMETABLE, timetable);
    return true;
  },

  importScannedEntries(entries: ScannedTimetableEntry[], mode: 'append' | 'replace'): number {
    let timetable = mode === 'replace' ? [] : this.getAllTimetableSlots();

    let importedCount = 0;
    entries.forEach((entry) => {
      let subjectId = entry.matchedSubjectId;

      if (!subjectId || entry.isNewSubject) {
        const newSub = this.createSubject({
          name: entry.subjectName,
          code: entry.subjectName.toUpperCase().replace(/\s+/g, '').slice(0, 6) || 'SUB101',
          type: entry.type,
          color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
          targetPercentage: 75,
          room: entry.room,
        });
        subjectId = newSub.id;
      }

      const isDuplicate = timetable.some(
        (t) => t.day === entry.day && t.startTime === entry.startTime && t.subjectId === subjectId
      );

      if (!isDuplicate) {
        timetable.push({
          id: `tt-scan-${Date.now()}-${importedCount}`,
          subjectId,
          day: entry.day,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room || '102',
          type: entry.type || 'Lecture',
        });
        importedCount++;
      }
    });

    saveToStorage(STORAGE_KEYS.TIMETABLE, timetable);
    return importedCount;
  },

  resetToOfficialSchedule(): void {
    saveToStorage(STORAGE_KEYS.SUBJECTS, OFFICIAL_SUBJECTS);
    saveToStorage(STORAGE_KEYS.TIMETABLE, OFFICIAL_TIMETABLE_SLOTS);
  },

  // --- TASKS ---
  getTasks(): Task[] {
    return loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
  },

  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: taskData.status === 'Completed' ? new Date().toISOString() : undefined,
    };
    tasks.unshift(newTask);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const oldStatus = tasks[index].status;
    const newStatus = updates.status || oldStatus;
    const completedAt = 
      newStatus === 'Completed' && oldStatus !== 'Completed' 
        ? new Date().toISOString() 
        : newStatus !== 'Completed' 
        ? undefined 
        : tasks[index].completedAt;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      completedAt,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  },

  deleteTask(id: string): boolean {
    const tasks = this.getTasks().filter((t) => t.id !== id);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return true;
  },

  // --- NOTES ---
  getNotes(): Note[] {
    return loadFromStorage<Note[]>(STORAGE_KEYS.NOTES, []);
  },

  createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const notes = this.getNotes();
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    saveToStorage(STORAGE_KEYS.NOTES, notes);
    return newNote;
  },

  updateNote(id: string, updates: Partial<Note>): Note | null {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;
    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.NOTES, notes);
    return notes[index];
  },

  deleteNote(id: string): boolean {
    const notes = this.getNotes().filter((n) => n.id !== id);
    saveToStorage(STORAGE_KEYS.NOTES, notes);
    return true;
  },

  // --- CALENDAR EVENTS ---
  getCalendarEvents(): CalendarEvent[] {
    return loadFromStorage<CalendarEvent[]>(STORAGE_KEYS.CALENDAR, []);
  },

  createCalendarEvent(eventData: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent {
    const events = this.getCalendarEvents();
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    saveToStorage(STORAGE_KEYS.CALENDAR, events);
    return newEvent;
  },

  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    const events = this.getCalendarEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) return null;
    events[index] = { ...events[index], ...updates };
    saveToStorage(STORAGE_KEYS.CALENDAR, events);
    return events[index];
  },

  deleteCalendarEvent(id: string): boolean {
    const events = this.getCalendarEvents().filter((e) => e.id !== id);
    saveToStorage(STORAGE_KEYS.CALENDAR, events);
    return true;
  },

  // --- PROFILE & SETTINGS ---
  getProfile(): UserProfile {
    return loadFromStorage<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },

  updateProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...profile };
    saveToStorage(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },

  getSemesterSettings(): SemesterSettings {
    return loadFromStorage<SemesterSettings>(STORAGE_KEYS.SEMESTER, DEFAULT_SEMESTER);
  },

  updateSemesterSettings(settings: Partial<SemesterSettings>): SemesterSettings {
    const current = this.getSemesterSettings();
    const updated = { ...current, ...settings };
    saveToStorage(STORAGE_KEYS.SEMESTER, updated);
    return updated;
  },

  getPreferences(): UserPreferences {
    return loadFromStorage<UserPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  },

  updatePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    saveToStorage(STORAGE_KEYS.PREFERENCES, updated);
    return updated;
  },

  // --- DATA EXPORT & RESET ---
  exportToCSV(): { subjectsCSV: string; attendanceCSV: string } {
    const subjects = this.getSubjects();
    const records = this.getAttendanceRecords();

    // Subject CSV
    const subHeader = 'Code,Name,Instructor,Type,Target%,Held,Attended,Absent,Cancelled,Current%\n';
    const subRows = subjects
      .map((s) => {
        const stats = calculateAttendanceStats(s.classesAttended, s.classesAbsent, s.targetPercentage);
        return `"${s.code}","${s.name}","${s.instructorName || ''}","${s.type}",${s.targetPercentage},${stats.classesHeld},${s.classesAttended},${s.classesAbsent},${s.classesCancelled},${stats.currentPercentage}%`;
      })
      .join('\n');

    // Attendance Records CSV
    const attHeader = 'Date,SubjectCode,SubjectName,Status,SlotID,MarkedAt,Notes\n';
    const attRows = records
      .map((r) => {
        const sub = subjects.find((s) => s.id === r.subjectId);
        return `"${r.date}","${sub ? sub.code : 'UNKNOWN'}","${sub ? sub.name : 'Unknown'}","${r.status}","${r.timetableSlotId || ''}","${r.markedAt}","${(r.notes || '').replace(/"/g, '""')}"`;
      })
      .join('\n');

    return {
      subjectsCSV: subHeader + subRows,
      attendanceCSV: attHeader + attRows,
    };
  },

  clearAllData(): void {
    saveToStorage(STORAGE_KEYS.SUBJECTS, OFFICIAL_SUBJECTS);
    saveToStorage(STORAGE_KEYS.TIMETABLE, OFFICIAL_TIMETABLE_SLOTS);
    saveToStorage(STORAGE_KEYS.ATTENDANCE, []);
    saveToStorage(STORAGE_KEYS.TASKS, []);
    saveToStorage(STORAGE_KEYS.NOTES, []);
    saveToStorage(STORAGE_KEYS.CALENDAR, []);
    saveToStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    saveToStorage(STORAGE_KEYS.SEMESTER, DEFAULT_SEMESTER);
    saveToStorage(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  },
};
