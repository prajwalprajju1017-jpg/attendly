/**
 * Supabase client setup for Attendly
 * 
 * To connect to your Supabase project:
 * 1. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env
 * 2. Run: npm install @supabase/supabase-js
 * 3. The dataService is designed with clean interfaces matching Supabase tables:
 *    - subjects
 *    - timetable_slots
 *    - attendance_records
 *    - tasks
 *    - notes
 *    - calendar_events
 *    - user_settings
 */

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  supabaseUrl?: string;
  hasAnonKey: boolean;
}

export const getSupabaseConfigStatus = (): SupabaseConfigStatus => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    url && 
    url !== 'https://your-project-id.supabase.co' && 
    key && 
    key !== 'your-anon-public-key'
  );

  return {
    isConfigured,
    supabaseUrl: url || undefined,
    hasAnonKey: Boolean(key && key !== 'your-anon-public-key'),
  };
};

/**
 * SQL Schema definition for the user to execute in Supabase SQL editor
 */
export const SUPABASE_SQL_SCHEMA = `-- Attendly University Student Attendance Tracker Schema for Supabase

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  university TEXT,
  degree TEXT,
  semester TEXT,
  lab_batch TEXT CHECK (lab_batch IN ('B1', 'B2', 'B3')), -- Student Lab Batch (B1, B2, B3)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for existing profiles table if already provisioned:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lab_batch TEXT CHECK (lab_batch IN ('B1', 'B2', 'B3'));

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  instructor_name TEXT,
  type TEXT NOT NULL DEFAULT 'Lecture',
  color TEXT NOT NULL DEFAULT '#6366f1',
  target_percentage NUMERIC DEFAULT 75,
  room TEXT,
  archived BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Timetable Slots
CREATE TABLE IF NOT EXISTS timetable_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT,
  type TEXT NOT NULL DEFAULT 'Lecture',
  instructor TEXT,
  batch TEXT CHECK (batch IN ('B1', 'B2', 'B3')), -- Optional batch constraint for batch-specific practicals
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  timetable_slot_id UUID REFERENCES timetable_slots(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL, -- 'present', 'absent', 'cancelled'
  notes TEXT,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject_id, date, timetable_slot_id)
);

-- 5. Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Assignment',
  due_date DATE NOT NULL,
  due_time TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'To Do',
  reference_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
`;
