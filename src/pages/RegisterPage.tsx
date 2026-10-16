import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  User,
  Hash,
  Building,
  BookOpen,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  validateStudentName,
  validateUsn,
  normalizeUsn,
  normalizeName,
} from '../utils/validation';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerStudent, addToast } = useApp();

  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [university, setUniversity] = useState('Sri Siddhartha Institute of Technology');
  const [degree, setDegree] = useState('CSE (Data Science)');

  const [errors, setErrors] = useState<{
    name?: string;
    usn?: string;
    general?: string;
  }>({});

  const [touched, setTouched] = useState<{
    name?: boolean;
    usn?: boolean;
  }>({});

  const [isSuccess, setIsSuccess] = useState(false);

  const handleBlur = (field: 'name' | 'usn') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: 'name' | 'usn') => {
    const newErrors = { ...errors };

    if (field === 'name') {
      const res = validateStudentName(name);
      if (!res.valid) newErrors.name = res.error;
      else delete newErrors.name;
    }

    if (field === 'usn') {
      const res = validateUsn(usn);
      if (!res.valid) newErrors.usn = res.error;
      else delete newErrors.usn;
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuccess) return;

    const nameRes = validateStudentName(name);
    const usnRes = validateUsn(usn);

    const validationErrors: typeof errors = {};
    if (!nameRes.valid) validationErrors.name = nameRes.error;
    if (!usnRes.valid) validationErrors.usn = usnRes.error;

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ name: true, usn: true });
      return;
    }

    setErrors({});
    const cleanName = normalizeName(name);
    const cleanUsn = normalizeUsn(usn);

    registerStudent({
      name: cleanName,
      usn: cleanUsn,
      university: university.trim(),
      degree: degree.trim(),
    });

    setIsSuccess(true);
    addToast({
      type: 'success',
      title: 'Local Student Profile Created',
      description: `Welcome to Attendly, ${cleanName}! Saved to your browser.`,
    });

    setTimeout(() => {
      navigate('/onboarding', { replace: true });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/welcome" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Set Up Local Student Profile
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Enter your Name and USN to personalize your local attendance log
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl border border-slate-200/80 dark:border-slate-800">
          {/* Local Storage Disclaimer Banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300 space-y-0.5">
              <p className="font-bold">Local Demo Environment</p>
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300/90">
                Attendly is a standalone client-side application. No passwords or server accounts are required. Your data is stored solely in this browser.
              </p>
            </div>
          </div>

          {/* Success Notification */}
          {isSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Profile created! Opening workspace...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* 1. Student Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (touched.name) validateField('name');
                  }}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Aarav Sharma"
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-hidden focus:ring-2 ${
                    errors.name && touched.name
                      ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.name && touched.name && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* 2. University Seat Number (USN) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="usn"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  USN (Seat Number) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Normalized uppercase</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="usn"
                  type="text"
                  autoCapitalize="characters"
                  required
                  value={usn}
                  onChange={(e) => {
                    setUsn(e.target.value.toUpperCase());
                    if (touched.usn) validateField('usn');
                  }}
                  onBlur={() => handleBlur('usn')}
                  placeholder="e.g. 1SI22CS001"
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-sm font-mono tracking-wide text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-hidden focus:ring-2 ${
                    errors.usn && touched.usn
                      ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.usn && touched.usn ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.usn}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-400">
                  Identifies your local timetable and attendance dataset.
                </p>
              )}
            </div>

            {/* 3. College / Institution (Optional) */}
            <div>
              <label
                htmlFor="university"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                College / Institution (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="university"
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Sri Siddhartha Institute of Technology"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 4. Degree / Department (Optional) */}
            <div>
              <label
                htmlFor="degree"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Degree / Department (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <input
                  id="degree"
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. CSE (Data Science)"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSuccess}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              <span>Save & Start Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch to Login / Select profile */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have local data saved in this browser?{' '}
              <Link
                to="/login"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Select or Switch Profile
              </Link>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <Link
            to="/welcome"
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            &larr; Back to Welcome Screen
          </Link>
        </div>
      </div>
    </div>
  );
};
