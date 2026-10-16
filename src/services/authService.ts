import {
  StudentProfile,
  RegisterPayload,
  LoginPayload,
  OnboardingPayload,
} from '../types/auth';
import { normalizeUsn, normalizeName } from '../utils/validation';

/**
 * Attendly Local Client-Side Student Profile Service
 * 
 * NOTE: Attendly runs completely as a client-side frontend application.
 * All student profiles and academic schedules are saved exclusively within
 * the local browser storage (localStorage). No passwords, hashes, session tokens,
 * or server credentials are used or stored.
 */

const ACTIVE_STUDENT_KEY = 'attendly_active_student_profile';
const LOCAL_STUDENTS_REGISTRY_KEY = 'attendly_local_students_registry';

class LocalStudentManager {
  private activeStudent: StudentProfile | null = null;

  constructor() {
    this.activeStudent = this.getStoredActiveStudent();
  }

  public getStoredActiveStudent(): StudentProfile | null {
    try {
      const data = localStorage.getItem(ACTIVE_STUDENT_KEY);
      if (!data) return null;
      return JSON.parse(data) as StudentProfile;
    } catch {
      return null;
    }
  }

  public getAllLocalProfiles(): StudentProfile[] {
    try {
      const data = localStorage.getItem(LOCAL_STUDENTS_REGISTRY_KEY);
      if (!data) return [];
      return JSON.parse(data) as StudentProfile[];
    } catch {
      return [];
    }
  }

  private saveActiveStudent(student: StudentProfile | null): void {
    this.activeStudent = student;
    try {
      if (student) {
        localStorage.setItem(ACTIVE_STUDENT_KEY, JSON.stringify(student));
      } else {
        localStorage.removeItem(ACTIVE_STUDENT_KEY);
      }
    } catch (e) {
      console.warn('Failed to save active student profile to localStorage:', e);
    }
  }

  private saveProfilesRegistry(list: StudentProfile[]): void {
    try {
      localStorage.setItem(LOCAL_STUDENTS_REGISTRY_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save profiles registry to localStorage:', e);
    }
  }

  public isAuthenticated(): boolean {
    return Boolean(this.getStoredActiveStudent());
  }

  public getStudent(): StudentProfile | null {
    return this.activeStudent || this.getStoredActiveStudent();
  }

  /**
   * Register or initialize a local student workspace profile
   */
  public register(payload: RegisterPayload): StudentProfile {
    const cleanUsn = normalizeUsn(payload.usn);
    const cleanName = normalizeName(payload.name);

    if (!cleanUsn) {
      throw new Error('University Seat Number (USN) is required.');
    }
    if (!cleanName) {
      throw new Error('Student Full Name is required.');
    }

    const profiles = this.getAllLocalProfiles();
    const existingIndex = profiles.findIndex((p) => p.usn === cleanUsn);

    let studentProfile: StudentProfile;

    if (existingIndex !== -1) {
      // Update existing profile
      studentProfile = {
        ...profiles[existingIndex],
        name: cleanName,
        university: payload.university || profiles[existingIndex].university || '',
        degree: payload.degree || profiles[existingIndex].degree || '',
        semester: payload.semester || profiles[existingIndex].semester || '3rd Semester',
      };
      profiles[existingIndex] = studentProfile;
    } else {
      // Create new profile
      studentProfile = {
        id: `std_${cleanUsn.toLowerCase()}`,
        usn: cleanUsn,
        name: cleanName,
        university: payload.university || 'Sri Siddhartha Institute of Technology',
        degree: payload.degree || 'CSE (Data Science)',
        semester: payload.semester || '3rd Semester',
        semesterStartDate: '2026-08-01',
        semesterEndDate: '2026-12-31',
        defaultTargetPercentage: 75,
        isOnboarded: false,
        createdAt: new Date().toISOString(),
      };
      profiles.push(studentProfile);
    }

    this.saveProfilesRegistry(profiles);
    this.saveActiveStudent(studentProfile);

    return studentProfile;
  }

  /**
   * Switch or load an existing student workspace by USN
   */
  public login(payload: LoginPayload): StudentProfile {
    const cleanUsn = normalizeUsn(payload.usn);
    if (!cleanUsn) {
      throw new Error('Please enter your University Seat Number (USN).');
    }

    const profiles = this.getAllLocalProfiles();
    const found = profiles.find((p) => p.usn === cleanUsn);

    if (found) {
      this.saveActiveStudent(found);
      return found;
    }

    // If profile not found in registry but user typed name, create it
    if (payload.name) {
      return this.register({
        usn: cleanUsn,
        name: payload.name,
      });
    }

    throw new Error('No local profile found for this USN. Please create a local student profile first.');
  }

  /**
   * Retrieve currently active student profile
   */
  public getCurrentStudent(): StudentProfile | null {
    return this.getStoredActiveStudent();
  }

  /**
   * Update first-time setup or academic onboarding preferences
   */
  public updateOnboarding(payload: OnboardingPayload): StudentProfile {
    const current = this.getStoredActiveStudent();
    if (!current) {
      throw new Error('No active student profile found.');
    }

    const updated: StudentProfile = {
      ...current,
      ...(payload.university !== undefined ? { university: payload.university } : {}),
      ...(payload.degree !== undefined ? { degree: payload.degree } : {}),
      ...(payload.semester !== undefined ? { semester: payload.semester } : {}),
      ...(payload.semesterStartDate !== undefined ? { semesterStartDate: payload.semesterStartDate } : {}),
      ...(payload.semesterEndDate !== undefined ? { semesterEndDate: payload.semesterEndDate } : {}),
      ...(payload.defaultTargetPercentage !== undefined ? { defaultTargetPercentage: payload.defaultTargetPercentage } : {}),
      ...(payload.labBatch !== undefined ? { labBatch: payload.labBatch } : {}),
      isOnboarded: true,
    };

    const profiles = this.getAllLocalProfiles();
    const index = profiles.findIndex((p) => p.id === current.id || p.usn === current.usn);
    if (index !== -1) {
      profiles[index] = updated;
    } else {
      profiles.push(updated);
    }

    this.saveProfilesRegistry(profiles);
    this.saveActiveStudent(updated);

    return updated;
  }

  /**
   * Clear active student selection and return to welcome/prototype screen
   */
  public logout(): void {
    this.saveActiveStudent(null);
  }

  /**
   * Delete a student profile and all associated data
   */
  public deleteProfile(usn: string): void {
    const profiles = this.getAllLocalProfiles().filter((p) => p.usn !== usn);
    this.saveProfilesRegistry(profiles);
    if (this.activeStudent?.usn === usn) {
      this.saveActiveStudent(null);
    }
  }
}

export const AuthService = new LocalStudentManager();
