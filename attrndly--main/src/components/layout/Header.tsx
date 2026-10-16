import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  ShieldCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateAttendanceStats } from '../../services/dataService';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    openQuickAdd,
    openSearch,
    openBatchModal,
    preferences,
    toggleTheme,
    profile,
    subjects,
    tasks,
    timetable,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute notifications
  const subjectsBelowTarget = subjects.filter((s) => {
    const stats = calculateAttendanceStats(s.classesAttended, s.classesAbsent, s.targetPercentage);
    return stats.currentPercentage < s.targetPercentage;
  });

  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'Completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate < today;
  });

  const totalNotifs = subjectsBelowTarget.length + overdueTasks.length;

  // Title by pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/subjects')) return 'Subjects';
    if (path.startsWith('/timetable')) return 'Weekly Timetable';
    if (path.startsWith('/calculator')) return 'Attendance Calculator';
    if (path.startsWith('/tasks')) return 'Tasks & Assignments';
    if (path.startsWith('/notes')) return 'Academic Notes';
    if (path.startsWith('/calendar')) return 'Academic Calendar';
    if (path.startsWith('/insights')) return 'Insights & Analytics';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Attendly';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {getPageTitle()}
        </h1>
        <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Student Mode
        </span>

        {/* Lab Batch Indicator Button */}
        {profile.labBatch ? (
          <button
            onClick={openBatchModal}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            title="Click to change your Lab Batch"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Batch {profile.labBatch}</span>
          </button>
        ) : (
          <button
            onClick={openBatchModal}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 hover:bg-amber-100 transition-colors cursor-pointer animate-pulse"
            title="Click to select your Lab Batch"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Select Batch</span>
          </button>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Global Search Button */}
        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700/70 rounded-xl transition-colors cursor-pointer"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Global Quick Add Button */}
        <button
          onClick={() => openQuickAdd('task')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle theme"
          title={preferences.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {preferences.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Academic Alerts ({totalNotifs})
                </h4>
                <span className="text-xs text-slate-400">Personalized</span>
              </div>

              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                {totalNotifs === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">All clear!</p>
                    <p className="text-xs">No attendance warnings or overdue tasks.</p>
                  </div>
                ) : (
                  <>
                    {subjectsBelowTarget.map((sub) => {
                      const stats = calculateAttendanceStats(sub.classesAttended, sub.classesAbsent, sub.targetPercentage);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setIsNotifOpen(false);
                            navigate('/calculator');
                          }}
                          className="flex items-start gap-3 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                              Low Attendance: {sub.name}
                            </p>
                            <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                              Current: {stats.currentPercentage}% (Target: {sub.targetPercentage}%). Need {stats.classesNeededToTarget} consecutive classes!
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {overdueTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setIsNotifOpen(false);
                          navigate('/tasks');
                        }}
                        className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 hover:bg-amber-100/70 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      >
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                            Overdue Task: {t.title}
                          </p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                            Was due on {t.dueDate} &bull; Priority: {t.priority}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Mini Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="hidden xl:block text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {profile.name || 'Student Profile'}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {profile.degree ? profile.degree.split(' ')[0] : 'Settings'} {profile.semester ? `• ${profile.semester.split(' ')[0]}` : ''}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-slide-up">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{profile.name || 'Student Profile'}</p>
                {profile.email ? (
                  <p className="text-xs text-slate-500">{profile.email}</p>
                ) : (
                  <p className="text-xs text-slate-400">Set your email in Settings</p>
                )}
                {profile.university && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                    {profile.university}
                  </p>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Account & Settings
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings#supabase');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Supabase Integration Guide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
