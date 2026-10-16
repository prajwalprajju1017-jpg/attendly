export type LabBatch = 'B1' | 'B2' | 'B3';

export interface StudentProfile {
  id: string;
  usn: string;
  name: string;
  university?: string;
  degree?: string;
  semester?: string;
  semesterStartDate?: string;
  semesterEndDate?: string;
  defaultTargetPercentage?: number;
  labBatch?: LabBatch;
  isOnboarded?: boolean;
  createdAt?: string;
}

export type StudentUser = StudentProfile;

export interface RegisterPayload {
  name: string;
  usn: string;
  university?: string;
  degree?: string;
  semester?: string;
}

export interface LoginPayload {
  usn: string;
  name?: string;
}

export interface OnboardingPayload {
  university?: string;
  degree?: string;
  semester?: string;
  semesterStartDate?: string;
  semesterEndDate?: string;
  defaultTargetPercentage?: number;
  labBatch?: LabBatch;
}
