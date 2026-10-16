import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Calendar,
  Percent,
  Moon,
  Sun,
  Bell,
  Download,
  Shield,
  RotateCcw,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DataService } from '../services/dataService';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    updateProfile,
    semester,
    updateSemester,
    preferences,
    updatePreferences,
    resetAllData,
    showConfirmDialog,
    addToast,
    student,
  } = useApp();

  // Profile form state
  const [name, setName] = useState(profile.name || student?.name || '');
  const [university, setUniversity] = useState(profile.university || student?.university || '');
  const [degree, setDegree] = useState(profile.degree || student?.degree || '');
  const [semesterName, setSemesterName] = useState(profile.semester || student?.semester || '');
  const [studentId, setStudentId] = useState(student?.usn || profile.studentId || '');

  // Semester dates form state
  const [semTermName, setSemTermName] = useState(semester.name);
  const [startDate, setStartDate] = useState(semester.startDate);
  const [endDate, setEndDate] = useState(semester.endDate);
  const [defaultTarget, setDefaultTarget] = useState(semester.defaultTargetPercentage);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      university: university.trim(),
      degree: degree.trim(),
      semester: semesterName.trim(),
      studentId: studentId.trim().toUpperCase(),
    });
  };

  const handleSaveSemester = (e: React.FormEvent) => {
    e.preventDefault();
    updateSemester({
      name: semTermName.trim(),
      startDate,
      endDate,
      defaultTargetPercentage: Number(defaultTarget),
    });
  };

  const handleExportCSV = () => {
    const { subjectsCSV, attendanceCSV } = DataService.exportToCSV();

    // Download Subjects CSV
    const blobSub = new Blob([subjectsCSV], { type: 'text/csv;charset=utf-8;' });
    const urlSub = URL.createObjectURL(blobSub);
    const linkSub = document.createElement('a');
    linkSub.setAttribute('href', urlSub);
    linkSub.setAttribute('download', `attendly_subjects_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(linkSub);
    linkSub.click();
    document.body.removeChild(linkSub);

    // Download Attendance records CSV
    const blobAtt = new Blob([attendanceCSV], { type: 'text/csv;charset=utf-8;' });
    const urlAtt = URL.createObjectURL(blobAtt);
    const linkAtt = document.createElement('a');
    linkAtt.setAttribute('href', urlAtt);
    linkAtt.setAttribute('download', `attendly_attendance_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(linkAtt);
    linkAtt.click();
    document.body.removeChild(linkAtt);

    addToast({
      type: 'success',
      title: 'Data Exported to CSV',
      description: 'Downloaded subjects summary and attendance logs.',
    });
  };

  const handleClearDataPrompt = () => {
    showConfirmDialog({
      title: 'Clear All Local Data?',
      message: 'This will erase all your local subjects, timetable slots, attendance logs, tasks, and notes from your browser storage. This action cannot be undone.',
      confirmLabel: 'Clear All Data',
      isDestructive: true,
      onConfirm: () => resetAllData(),
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Settings & Configuration
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your student identity, semester calendar, targets, and data export.
        </p>
      </div>

      {/* SECTION 1: PROFILE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Student Profile
            </h3>
            <p className="text-xs text-slate-500">Your personal university details and degree information</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                University Seat Number (USN)
              </label>
              <input
                type="text"
                disabled={Boolean(student?.usn)}
                placeholder="e.g. 1SI22CS001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-mono text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-80 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                University / Institution
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford University"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Degree & Major
              </label>
              <input
                type="text"
                placeholder="e.g. B.S. Computer Science"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Semester / Term
              </label>
              <input
                type="text"
                placeholder="e.g. Fall 2026 / Semester 5"
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SEMESTER & DEFAULT TARGET */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Semester Dates & Attendance Target
            </h3>
            <p className="text-xs text-slate-500">Academic semester boundary dates and default target percentage</p>
          </div>
        </div>

        <form onSubmit={handleSaveSemester} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Semester Name
              </label>
              <input
                type="text"
                value={semTermName}
                onChange={(e) => setSemTermName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Semester Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Semester End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Target Percentage */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Default Attendance Target:
              </span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {defaultTarget}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={defaultTarget}
              onChange={(e) => setDefaultTarget(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              New subjects will default to this target unless custom-specified.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
            >
              Save Semester Config
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: APPEARANCE & PREFERENCES */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Appearance & Timetable Preferences
            </h3>
            <p className="text-xs text-slate-500">Theme mode and schedule interface options</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Theme Mode</p>
              <p className="text-[11px] text-slate-500">Select interface color appearance</p>
            </div>
            <select
              value={preferences.theme}
              onChange={(e) => updatePreferences({ theme: e.target.value as any })}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Highlight Shortfall Risk</p>
              <p className="text-[11px] text-slate-500">Flag courses under target with alert colors</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.highlightLowAttendance}
              onChange={(e) => updatePreferences({ highlightLowAttendance: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: DATA EXPORT & RESET */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Data Portability & Export
            </h3>
            <p className="text-xs text-slate-500">Download your records or reset local workspace</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Export to Spreadsheet CSV
            </p>
            <p className="text-[11px] text-slate-500">
              Download subjects summary and timestamped attendance records as standard CSV files.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
          <div>
            <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
              Clear All Local Data
            </p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              Permanently erase all locally stored courses, timetable sessions, attendance logs, tasks, and notes.
            </p>
          </div>
          <button
            onClick={handleClearDataPrompt}
            className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Data
          </button>
        </div>
      </div>

      {/* SECTION 5: PRIVACY & STUDENT-ONLY GUARANTEE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Privacy & Student-Only Guarantee
            </h3>
            <p className="text-xs text-slate-500">Product rules and architectural privacy boundaries</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>100% Student-Managed:</strong> There is no faculty portal, administrative backdoor, or instructor account. You have full ownership of your records.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>No Automated Surveillance:</strong> Attendly never automatically marks attendance via GPS geotagging, campus Wi-Fi beacons, Bluetooth tracking, or camera scanning. You confirm each attendance status manually.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Local Data Storage:</strong> All subjects, timetable schedules, attendance records, tasks, and study notes are saved directly in your browser&apos;s local storage.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
