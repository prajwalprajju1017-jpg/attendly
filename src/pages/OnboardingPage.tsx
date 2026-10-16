import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building,
  BookOpen,
  Calendar,
  Target,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  SkipForward,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LabBatch } from '../types/auth';

const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

const TARGET_PRESETS = [75, 80, 85, 90];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { student, completeOnboarding, addToast } = useApp();

  const [university, setUniversity] = useState(student?.university || '');
  const [degree, setDegree] = useState(student?.degree || '');
  const [semester, setSemester] = useState(student?.semester || '3rd Semester');
  const [semesterStartDate, setSemesterStartDate] = useState(
    student?.semesterStartDate || '2026-08-01'
  );
  const [semesterEndDate, setSemesterEndDate] = useState(
    student?.semesterEndDate || '2026-12-31'
  );
  const [targetPercentage, setTargetPercentage] = useState(
    student?.defaultTargetPercentage || 75
  );
  const [labBatch, setLabBatch] = useState<LabBatch | ''>(student?.labBatch || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await completeOnboarding({
        university: university.trim(),
        degree: degree.trim(),
        semester,
        semesterStartDate,
        semesterEndDate,
        defaultTargetPercentage: targetPercentage,
        labBatch: labBatch ? (labBatch as LabBatch) : undefined,
      });

      addToast({
        type: 'success',
        title: 'Semester Setup Complete!',
        description: 'Your academic schedule and attendance targets are configured.',
      });

      navigate('/', { replace: true });
    } catch (err: any) {
      setIsSubmitting(false);
      addToast({
        type: 'error',
        title: 'Setup Error',
        description: err.message || 'Failed to save academic preferences.',
      });
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        defaultTargetPercentage: 75,
      });

      addToast({
        type: 'info',
        title: 'Setup Skipped',
        description: 'You can update your university and semester details anytime in Settings.',
      });

      navigate('/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-2xl mx-auto">
        {/* Top Header Badge */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome, {student?.name || 'Student'}! ({student?.usn || 'USN'})</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Let's Set Up Your Semester
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Personalize your academic schedule, timetable, and attendance rules. You can change these anytime in Settings.
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. University Name (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  University or College (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. Sri Siddhartha Institute of Technology (SSIT)"
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* 2. Course / Department (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Course or Department (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.E. Computer Science & Engineering (Data Science)"
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* 3. Semester Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                Select Semester <span className="text-rose-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Semester Start & End Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Semester Start Date
                </label>
                <input
                  type="date"
                  value={semesterStartDate}
                  onChange={(e) => setSemesterStartDate(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Semester End Date
                </label>
                <input
                  type="date"
                  value={semesterEndDate}
                  onChange={(e) => setSemesterEndDate(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 5. Attendance Target (Default 75%) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  Target Attendance Percentage
                </label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {targetPercentage}% Target
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {TARGET_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTargetPercentage(pct)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      targetPercentage === pct
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    {pct}% {pct === 75 && '(Standard)'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Most universities require a mandatory minimum of 75% attendance to be eligible for final examinations.
              </p>
            </div>

            {/* 6. Lab Batch Selection (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Practical Lab Batch (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '', label: 'None' },
                  { id: 'B1', label: 'Batch B1' },
                  { id: 'B2', label: 'Batch B2' },
                  { id: 'B3', label: 'Batch B3' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setLabBatch(b.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      labBatch === b.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Batch filtering automatically customizes your laboratory sessions in the weekly timetable.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-3 px-6 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save Preferences & Go to Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="w-full sm:w-auto py-3 px-5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <SkipForward className="w-4 h-4 text-slate-400" />
                <span>Skip for Now</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
