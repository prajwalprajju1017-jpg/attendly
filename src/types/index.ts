export type SubjectType = 'Lecture' | 'Lab' | 'Practical' | 'Tutorial' | 'Other';

export interface Subject {
  id: string;
  name: string;
  code: string;
  instructorName?: string;
  type: SubjectType;
  color: string; // Hex color for timetable and badges
  targetPercentage: number; // e.g. 75, 80
  totalEligibleClasses: number;
  classesAttended: number;
  classesAbsent: number;
  classesCancelled: number;
  archived?: boolean;
  room?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type LabBatch = 'B1' | 'B2' | 'B3';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimetableSlot {
  id: string;
  subjectId: string;
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  room: string;
  type: SubjectType;
  instructor?: string;
  batch?: LabBatch; // If undefined/null, applies to all students (shared theory/tutorial)
  isSpecialSession?: boolean; // For (S) Tutorial / Seminar sessions
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | 'unmarked';

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  timetableSlotId?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  markedAt: string;
}

export type TaskCategory = 
  | 'Assignment' 
  | 'Project' 
  | 'Lab Record' 
  | 'Exam Preparation' 
  | 'Reading' 
  | 'Personal' 
  | 'Other';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  status: TaskStatus;
  referenceUrl?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CalendarEventType = 
  | 'Class' 
  | 'Assignment' 
  | 'Project' 
  | 'Exam' 
  | 'Holiday' 
  | 'Personal' 
  | 'Study';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  subjectId?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  location?: string;
  allDay?: boolean;
  color?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  university: string;
  degree: string;
  semester: string;
  studentId?: string;
  avatarUrl?: string;
  labBatch?: LabBatch; // B1, B2, or B3
}

export interface SemesterSettings {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  defaultTargetPercentage: number;
  breaksAndHolidays: {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
  }[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notificationReminders: boolean;
  reminderMinutesBeforeClass: number;
  highlightLowAttendance: boolean;
  weekStartsOnMonday: boolean;
  compactTimetable: boolean;
}

export interface AttendanceCalculationResult {
  classesHeld: number; // attended + absent
  classesAttended: number;
  currentPercentage: number;
  targetPercentage: number;
  status: 'safe' | 'warning' | 'danger';
  classesNeededToTarget: number; // Consecutive classes required to reach target
  classesCanSkip: number;        // Maximum classes that can be missed while staying >= target
}

export interface ScannedTimetableEntry {
  id: string;
  day: DayOfWeek;
  subjectName: string;
  matchedSubjectId?: string;
  isNewSubject?: boolean;
  startTime: string;
  endTime: string;
  room: string;
  type: SubjectType;
  confidence: number; // 0 - 100
  flagged?: boolean;
}
