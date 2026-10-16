import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, CheckSquare, FileText, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, subjects, tasks, notes, calendarEvents } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Global keydown Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open search
      }
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingSubjects = trimmed
    ? subjects.filter(
        (s) =>
          s.name.toLowerCase().includes(trimmed) ||
          s.code.toLowerCase().includes(trimmed) ||
          (s.instructorName && s.instructorName.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingTasks = trimmed
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(trimmed) ||
          (t.description && t.description.toLowerCase().includes(trimmed)) ||
          t.category.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingNotes = trimmed
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(trimmed) ||
          n.content.toLowerCase().includes(trimmed) ||
          n.tags.some((tag) => tag.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingEvents = trimmed
    ? calendarEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(trimmed) ||
          (e.description && e.description.toLowerCase().includes(trimmed)) ||
          (e.location && e.location.toLowerCase().includes(trimmed))
      )
    : [];

  const hasResults =
    matchingSubjects.length > 0 ||
    matchingTasks.length > 0 ||
    matchingNotes.length > 0 ||
    matchingEvents.length > 0;

  const handleSelect = (path: string) => {
    closeSearch();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]"
        role="dialog"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search subjects, tasks, notes, events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-base focus:outline-hidden"
          />
          <button
            onClick={closeSearch}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!trimmed && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Type keywords to quickly jump to subjects, assignments, notes, or exams.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleSelect('/subjects')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  Subjects
                </button>
                <button
                  onClick={() => handleSelect('/timetable')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  Timetable
                </button>
                <button
                  onClick={() => handleSelect('/calculator')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  Attendance Calculator
                </button>
                <button
                  onClick={() => handleSelect('/tasks')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  Tasks
                </button>
                <button
                  onClick={() => handleSelect('/notes')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  Notes
                </button>
              </div>
            </div>
          )}

          {trimmed && !hasResults && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for subject code, topic, or date.</p>
            </div>
          )}

          {/* Subjects Matches */}
          {matchingSubjects.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Subjects</p>
              <div className="space-y-1">
                {matchingSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => handleSelect(`/subjects?highlight=${sub.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {sub.name}
                          </span>
                          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {sub.code}
                          </span>
                        </div>
                        {sub.instructorName && (
                          <p className="text-xs text-slate-500">{sub.instructorName}</p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Matches */}
          {matchingTasks.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tasks & Assignments</p>
              <div className="space-y-1">
                {matchingTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect('/tasks')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          Due {t.dueDate} &bull; {t.category} &bull; {t.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Matches */}
          {matchingNotes.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Notes</p>
              <div className="space-y-1">
                {matchingNotes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleSelect('/notes')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {n.tags.map((t) => `#${t}`).join(' ')} &bull; {n.content.replace(/[#*`]/g, '').slice(0, 60)}...
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Matches */}
          {matchingEvents.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Calendar Events</p>
              <div className="space-y-1">
                {matchingEvents.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => handleSelect('/calendar')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                          {e.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {e.startDate} {e.startTime ? `at ${e.startTime}` : ''} &bull; {e.eventType}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
