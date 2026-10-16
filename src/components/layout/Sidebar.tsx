import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Calculator,
  CheckSquare,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Hash,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { calculateAttendanceStats } from '../../services/dataService';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { subjects, tasks, semester, profile, student, logoutStudent, showConfirmDialog } = useApp();

  // Navigation Items
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/subjects', label: 'Subjects', icon: BookOpen },
    { to: '/timetable', label: 'Timetable', icon: CalendarDays },
    { to: '/calculator', label: 'Calculator', icon: Calculator },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, badge: tasks.filter((t) => t.status !== 'Completed').length },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  // Calculate overall attendance
  const totalAttended = subjects.reduce((sum, s) => sum + s.classesAttended, 0);
  const totalAbsent = subjects.reduce((sum, s) => sum + s.classesAbsent, 0);
  const overallStats = calculateAttendanceStats(totalAttended, totalAbsent, semester.defaultTargetPercentage);

  return (
    <aside
      className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 relative z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Attendly
                {student?.usn && (
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {student.usn}
                  </span>
                )}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {student?.name || profile.name || 'Student'} &bull; {profile.labBatch ? `Batch ${profile.labBatch}` : (profile.semester ? profile.semester.split(' ')[0] : 'Semester')}
              </p>
            </div>
          )}
        </div>

        {/* Toggle Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Overall Attendance Summary Widget (Bottom) */}
      {!collapsed ? (
        <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Overall Status
            </span>
            <span
              className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                overallStats.status === 'safe'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : overallStats.status === 'warning'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              {overallStats.classesHeld > 0 ? `${overallStats.currentPercentage}%` : '0%'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallStats.classesHeld === 0
                  ? 'bg-slate-300 dark:bg-slate-600'
                  : overallStats.status === 'safe'
                  ? 'bg-emerald-500'
                  : overallStats.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: overallStats.classesHeld > 0 ? `${Math.min(100, overallStats.currentPercentage)}%` : '0%' }}
            />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Target: {semester.defaultTargetPercentage}%</span>
            <span>
              {overallStats.classesHeld > 0 ? `${totalAttended} / ${overallStats.classesHeld} classes` : 'No classes marked'}
            </span>
          </p>
        </div>
      ) : (
        <div className="p-3 text-center border-t border-slate-200 dark:border-slate-800">
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          >
            {overallStats.classesHeld > 0 ? `${overallStats.currentPercentage}%` : '0%'}
          </span>
        </div>
      )}

      {/* Sign Out Action */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={() => {
            showConfirmDialog({
              title: 'Sign Out of Attendly?',
              message: 'Your active student session will be cleared and you will return to the welcome screen.',
              confirmLabel: 'Sign Out',
              isDestructive: true,
              onConfirm: async () => {
                await logoutStudent();
                navigate('/welcome', { replace: true });
              },
            });
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
