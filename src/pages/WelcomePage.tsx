import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck2,
  Clock3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  HardDrive,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { registerStudent } = useApp();

  const handleInstantDemo = () => {
    // Quickly set up default demo profile
    registerStudent({
      name: 'Prajwal P',
      usn: '1SI22CS001',
      university: 'Sri Siddhartha Institute of Technology',
      degree: 'CSE (Data Science)',
      semester: '3rd Semester',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Attendly
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                Local Edition
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            Switch Profile
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-1.5"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-8 md:py-12 text-center space-y-8 my-auto">
        {/* Local Storage Prototype Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
          <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
          <span>Frontend-Only &bull; Saved locally in your browser storage</span>
        </div>

        {/* Headline & Subtitle */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
            Your semester,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500">
              under control.
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            Track attendance, manage assignments, organize notes, and stay ahead of every deadline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <GraduationCap className="w-5 h-5" />
            Create Student Profile
          </Link>

          <button
            type="button"
            onClick={handleInstantDemo}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Explore Sample Demo
          </button>

          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all flex items-center justify-center gap-1.5"
          >
            Select Existing Profile
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-6">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              75% Attendance Safeguard
            </h3>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Calculate safely missable lectures, consecutive classes required to recover, and live course targets.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Clock3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Smart Timetable & Lab Batches
            </h3>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Filter by your dedicated Lab Batch (B1, B2, B3) so you only see your actual practical sessions and theory.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Tasks & Academic Notes
            </h3>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Manage assignment deadlines, track exam schedules, and keep study notes organized in one place.
            </p>
          </div>
        </div>

        {/* Local Storage Privacy Notice */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-emerald-500" />
            100% Client-side local storage
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-500" />
            Zero external server or database tracking
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            Export anytime to CSV or reset locally
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400">
        <p>Attendly &bull; University Student Attendance Tracker &bull; Standalone Frontend Application</p>
      </footer>
    </div>
  );
};
