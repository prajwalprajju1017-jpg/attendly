import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Plus,
  Calendar,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { openQuickAdd } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around safe-area-bottom">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        Home
      </NavLink>

      <NavLink
        to="/subjects"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        Subjects
      </NavLink>

      {/* Floating Center Quick Add */}
      <button
        onClick={() => openQuickAdd('task')}
        className="w-11 h-11 -mt-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer"
        aria-label="Quick Add"
      >
        <Plus className="w-6 h-6" />
      </button>

      <NavLink
        to="/timetable"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <CalendarDays className="w-5 h-5 mb-0.5" />
        Schedule
      </NavLink>

      <NavLink
        to="/tasks"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <CheckSquare className="w-5 h-5 mb-0.5" />
        Tasks
      </NavLink>

      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Calendar className="w-5 h-5 mb-0.5" />
        Calendar
      </NavLink>
    </nav>
  );
};
