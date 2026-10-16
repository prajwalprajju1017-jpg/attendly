/**
 * Student USN and credential validation rules for Attendly
 */

export interface ValidationRuleConfig {
  usnPattern: RegExp;
  usnDescription: string;
  minPasswordLength: number;
  requirePasswordLetter: boolean;
  requirePasswordNumber: boolean;
  minNameLength: number;
  maxNameLength: number;
}

export const AUTH_CONFIG: ValidationRuleConfig = {
  // Configurable USN pattern: 4-20 alphanumeric characters (supports VTU format e.g. 1SI22CS001, IIT/NIT formats, standard student roll numbers)
  usnPattern: /^[A-Z0-9]{4,20}$/,
  usnDescription: '4–20 alphanumeric characters (e.g., 1SI22CS001 or USN1024)',
  minPasswordLength: 6,
  requirePasswordLetter: true,
  requirePasswordNumber: true,
  minNameLength: 2,
  maxNameLength: 100,
};

/**
 * Normalizes a USN by trimming whitespace and converting to uppercase.
 */
export function normalizeUsn(usn: string): string {
  if (!usn) return '';
  return usn.trim().toUpperCase();
}

/**
 * Normalizes a student full name by trimming surrounding whitespace and collapsing double spaces.
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateStudentName(name: string): ValidationResult {
  const trimmed = normalizeName(name);
  if (!trimmed) {
    return { valid: false, error: 'Student full name is required' };
  }
  if (trimmed.length < AUTH_CONFIG.minNameLength) {
    return { valid: false, error: `Name must be at least ${AUTH_CONFIG.minNameLength} characters long` };
  }
  if (trimmed.length > AUTH_CONFIG.maxNameLength) {
    return { valid: false, error: `Name cannot exceed ${AUTH_CONFIG.maxNameLength} characters` };
  }
  return { valid: true };
}

export function validateUsn(usn: string): ValidationResult {
  const normalized = normalizeUsn(usn);
  if (!normalized) {
    return { valid: false, error: 'University Seat Number (USN) is required' };
  }
  if (!AUTH_CONFIG.usnPattern.test(normalized)) {
    return {
      valid: false,
      error: `Invalid USN format. Must be ${AUTH_CONFIG.usnDescription}`,
    };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < AUTH_CONFIG.minPasswordLength) {
    return {
      valid: false,
      error: `Password must be at least ${AUTH_CONFIG.minPasswordLength} characters long`,
    };
  }
  if (AUTH_CONFIG.requirePasswordLetter && !/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one letter',
    };
  }
  if (AUTH_CONFIG.requirePasswordNumber && !/[0-9]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one number',
    };
  }
  return { valid: true };
}

export function validateConfirmPassword(password: string, confirmPassword?: string): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  return { valid: true };
}
