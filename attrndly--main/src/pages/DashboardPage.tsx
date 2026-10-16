import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Ban,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAttendanceStats } from '../services/dataService';
import { AttendanceStatus, DayOfWeek } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    subjects,
    timetable,
    tasks,
    notes,
    calendarEvents,
    attendanceRecords,
    markAttendance,
    showConfirmDialog,
    semester,
    profile,
  } = useApp();

  // Current day of the week
  const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDateObj = new Date();
  const currentDayName: DayOfWeek = dayNames[todayDateObj.getDay()];
  const todayStr = todayDateObj.toISOString().split('T')[0];

  // Today's timetable slots
  const todaysSlots = timetable.filter((slot) => slot.day === currentDayName);
  const displaySlots = todaysSlots;

  // Calculate Overall stats
  const totalAttended = subjects.reduce((sum, s) => sum + s.classesAttended, 0);
  const totalAbsent = subjects.reduce((sum, s) => sum + s.classesAbsent, 0);
  const totalCancelled = subjects.reduce((sum, s) => sum + s.classesCancelled, 0);
  const totalHeld = totalAttended + totalAbsent;
  const overallStats = calculateAttendanceStats(totalAttended, totalAbsent, semester.defaultTargetPercentage);

  // Subjects below target
  const belowTargetSubjects = subjects.filter((s) => {
    const stats = calculateAttendanceStats(s.classesAttended, s.classesAbsent, s.targetPercentage);
    return stats.currentPercentage < s.targetPercentage;
  });

  // Tasks due soon (next 48h) or overdue
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
  const overdueTasks = pendingTasks.filter((t) => t.dueDate < todayStr);
  const tasksDueSoon = pendingTasks.filter((t) => t.dueDate >= todayStr).slice(0, 4);

  // Upcoming exams
  const upcomingExams = calendarEvents
    .filter((e) => e.eventType === 'Exam' && e.startDate >= todayStr)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);

  // Recent notes
  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  // Helper to get attendance record for a slot today
  const getSlotAttendance = (slotId: string, subjectId: string): AttendanceStatus => {
    const record = attendanceRecords.find(
      (r) => r.subjectId === subjectId && r.timetableSlotId === slotId && r.date === todayStr
    );
    return record ? record.status : 'unmarked';
  };

  // Handler for manual attendance confirmation
  const handleMarkPrompt = (
    subjectId: string,
    slotId: string,
    status: AttendanceStatus,
    subjectName: string
  ) => {
    const statusLabels: Record<AttendanceStatus, string> = {
      present: 'Present',
      absent: 'Absent',
      cancelled: 'Cancelled',
      unmarked: 'Unmarked',
    };

    showConfirmDialog({
      title: `Confirm Attendance: ${statusLabels[status]}`,
      message: `Are you sure you want to mark yourself as ${statusLabels[status]} for ${subjectName} today? Your attendance statistics will recalculate immediately.`,
      confirmLabel: `Mark as ${statusLabels[status]}`,
      isDestructive: status === 'absent',
      onConfirm: () => {
        markAttendance(subjectId, status, todayStr, slotId);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-10 w-48 h-48 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{semester.name || 'Academic Semester'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {profile.name ? `Welcome back, ${profile.name.split(' ')[0]}!` : 'Welcome to Attendly!'}
          </h2>
          <p className="text-sm md:text-base text-indigo-100/90 max-w-xl">
            {totalHeld === 0 ? (
              <span>No attendance records logged yet. Add your courses and confirm your daily class attendance to track your academic standing.</span>
            ) : overallStats.currentPercentage >= semester.defaultTargetPercentage ? (
              <span>
                You are currently attending <strong className="text-white font-bold">{overallStats.currentPercentage}%</strong> of classes, safely <strong className="text-emerald-300">{(overallStats.currentPercentage - semester.defaultTargetPercentage).toFixed(1)}%</strong> above your {semester.defaultTargetPercentage}% target.
              </span>
            ) : (
              <span>
                You are currently attending <strong className="text-white font-bold">{overallStats.currentPercentage}%</strong> of classes, <strong className="text-rose-300">{(semester.defaultTargetPercentage - overallStats.currentPercentage).toFixed(1)}%</strong> below your target.
              </span>
            )}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Circular Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/20"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  totalHeld === 0
                    ? 'text-white/30'
                    : overallStats.status === 'safe'
                    ? 'text-emerald-400'
                    : overallStats.status === 'warning'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }
                strokeDasharray={`${totalHeld === 0 ? 0 : overallStats.currentPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-extrabold text-sm">{totalHeld > 0 ? `${overallStats.currentPercentage}%` : '0%'}</span>
          </div>
          <div>
            <p className="text-xs text-indigo-200">Attendance Target</p>
            <p className="text-base font-bold text-white">{semester.defaultTargetPercentage}% Required</p>
            <p className="text-[11px] text-indigo-300">
              {totalHeld === 0
                ? 'No records logged'
                : overallStats.classesCanSkip > 0
                ? `${overallStats.classesCanSkip} skips safe`
                : `${overallStats.classesNeededToTarget} classes needed`}
            </p>
          </div>
        </div>
      </div>

      {/* 5 Key Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Overall Attendance */}
        <div
          onClick={() => navigate('/calculator')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Attendance</span>
            <div className={`p-2 rounded-xl ${
              overallStats.status === 'safe'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {overallStats.currentPercentage}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Target: {semester.defaultTargetPercentage}%
          </p>
        </div>

        {/* Total Subjects */}
        <div
          onClick={() => navigate('/subjects')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Subjects</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {subjects.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {belowTargetSubjects.length > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">{belowTargetSubjects.length} below target</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">All targets met</span>
            )}
          </p>
        </div>

        {/* Classes Attended */}
        <div
          onClick={() => navigate('/insights')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attended / Held</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalAttended} <span className="text-sm font-normal text-slate-400">/ {totalHeld}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalAbsent} missed &bull; {totalCancelled} cancelled
          </p>
        </div>

        {/* Classes Today */}
        <div
          onClick={() => navigate('/timetable')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Classes Today</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {displaySlots.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {currentDayName}&apos;s schedule
          </p>
        </div>

        {/* Assignments Due */}
        <div
          onClick={() => navigate('/tasks')}
          className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tasks Due</span>
            <div className={`p-2 rounded-xl ${
              overdueTasks.length > 0
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {pendingTasks.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {overdueTasks.length > 0 ? (
              <span className="text-rose-600 font-semibold">{overdueTasks.length} overdue!</span>
            ) : (
              <span>Next up: {tasksDueSoon[0]?.dueDate || 'None'}</span>
            )}
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Timetable with Direct Confirmation Marking + Subject Attendance Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Timetable Section (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Today&apos;s Classes
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentDayName}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Confirm your attendance manually. No automated location or facial detection used.
              </p>
            </div>
            <button
              onClick={() => navigate('/timetable')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Full Timetable <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {displaySlots.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-sm">No classes scheduled for today.</p>
                <p className="text-xs mt-1">Add class sessions to your weekly schedule to track daily attendance.</p>
                <button
                  onClick={() => navigate('/timetable')}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
                >
                  Manage Timetable
                </button>
              </div>
            ) : (
              displaySlots.map((slot) => {
                const sub = subjects.find((s) => s.id === slot.subjectId);
                const currentStatus = sub ? getSlotAttendance(slot.id, sub.id) : 'unmarked';
                const subStats = sub
                  ? calculateAttendanceStats(sub.classesAttended, sub.classesAbsent, sub.targetPercentage)
                  : null;

                return (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-2.5 self-stretch rounded-full shrink-0"
                        style={{ backgroundColor: sub?.color || '#6366f1' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            {sub?.code || 'CLASS'}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {slot.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {sub?.name || 'Unknown Class'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span>&bull;</span>
                          <span>Room {slot.room}</span>
                          {subStats && (
                            <>
                              <span>&bull;</span>
                              <span
                                className={`font-semibold ${
                                  subStats.status === 'safe'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : subStats.status === 'warning'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {subStats.currentPercentage}% ({subStats.classesAttended}/{subStats.classesHeld})
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Manual Attendance Actions with Safe Confirmation */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() =>
                          sub && handleMarkPrompt(sub.id, slot.id, 'present', sub.name)
                        }
                        title="Mark Present"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Present
                      </button>

                      <button
                        onClick={() =>
                          sub && handleMarkPrompt(sub.id, slot.id, 'absent', sub.name)
                        }
                        title="Mark Absent"
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-500 hover:text-rose-600'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Absent
                      </button>

                      <button
                        onClick={() =>
                          sub && handleMarkPrompt(sub.id, slot.id, 'cancelled', sub.name)
                        }
                        title="Class Cancelled"
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          currentStatus === 'cancelled'
                            ? 'bg-slate-700 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancelled
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Subject-Wise Attendance Progress Overview (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Subject Attendance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target comparison across all active courses
              </p>
            </div>
            <button
              onClick={() => navigate('/calculator')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Calculator <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 max-h-[360px] pr-1">
            {subjects.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-sm">No subjects added yet</p>
                <p className="text-xs mt-1">Add your university courses to track attendance and targets.</p>
                <button
                  onClick={() => navigate('/subjects')}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
                >
                  Add Your First Subject
                </button>
              </div>
            ) : (
              subjects.map((sub) => {
                const stats = calculateAttendanceStats(sub.classesAttended, sub.classesAbsent, sub.targetPercentage);
                const isDanger = stats.status === 'danger';
                const isWarning = stats.status === 'warning';

              return (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/calculator?subject=${sub.id}`)}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {sub.code}
                      </span>
                      <span className="text-xs text-slate-500 truncate hidden sm:inline">
                        {sub.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isDanger
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : isWarning
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}
                      >
                        {stats.currentPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Target Marker */}
                  <div className="relative w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, stats.currentPercentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      {sub.classesAttended} attended of {stats.classesHeld} held
                    </span>
                    <span>
                      {isDanger ? (
                        <span className="text-rose-600 font-semibold">
                          Need {stats.classesNeededToTarget} consecutive
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">
                          Can miss {stats.classesCanSkip}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>

      {/* Secondary Dashboard Widgets Grid: Tasks, Exams, Notes, Low Attendance Warning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Tasks & Assignments Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Tasks & Deadlines
            </h4>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              All ({pendingTasks.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending assignments!</p>
            ) : (
              pendingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate('/tasks')}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{task.category}</span>
                    <span className={task.dueDate < todayStr ? 'text-rose-600 font-bold' : ''}>
                      Due {task.dueDate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Exams & Events Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Upcoming Exams
            </h4>
            <button
              onClick={() => navigate('/calendar')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              Calendar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {upcomingExams.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming exams scheduled</p>
            ) : (
              upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => navigate('/calendar')}
                  className="p-2.5 rounded-xl border border-rose-100 dark:border-rose-950/40 bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/70 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-rose-950 dark:text-rose-200 line-clamp-1">
                    {exam.title}
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">
                    {exam.startDate} &bull; {exam.startTime || 'Time TBA'} ({exam.location || 'TBA'})
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Academic Notes Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              Recent Notes
            </h4>
            <button
              onClick={() => navigate('/notes')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              All Notes <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {recentNotes.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No notes created yet</p>
            ) : (
              recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => navigate('/notes')}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {note.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {note.content.replace(/[#*`]/g, '')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
