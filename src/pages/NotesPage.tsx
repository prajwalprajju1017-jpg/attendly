import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Archive,
  Trash2,
  Tag,
  BookOpen,
  Calendar,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  X,
  Eye,
  Edit3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Note } from '../types';

export const NotesPage: React.FC = () => {
  const { notes, subjects, createNote, updateNote, deleteNote, togglePinNote, showConfirmDialog } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Active note in editor
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorSubjectId, setEditorSubjectId] = useState('');
  const [editorTags, setEditorTags] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [previewMode, setPreviewMode] = useState(false);

  // Autosave timer ref
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Sync editor when active note changes
  useEffect(() => {
    if (activeNote) {
      setEditorTitle(activeNote.title);
      setEditorContent(activeNote.content);
      setEditorSubjectId(activeNote.subjectId || '');
      setEditorTags(activeNote.tags.join(', '));
      setSaveStatus('saved');
    }
  }, [activeNoteId]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Handle Autosave debounced
  const triggerAutosave = (newTitle: string, newContent: string, newSubId: string, newTagsStr: string) => {
    if (!activeNote) return;
    setSaveStatus('saving');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      const parsedTags = newTagsStr
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      updateNote(activeNote.id, {
        title: newTitle.trim() || 'Untitled Note',
        content: newContent,
        subjectId: newSubId || undefined,
        tags: parsedTags,
      });
      setSaveStatus('saved');
    }, 800);
  };

  const handleCreateNewNote = () => {
    const newNote = createNote({
      title: 'Untitled Note',
      content: '',
      subjectId: subjects[0]?.id || undefined,
      tags: [],
      pinned: false,
      archived: false,
    });
    setActiveNoteId(newNote.id);
  };

  const handleDeleteActiveNote = () => {
    if (!activeNote) return;
    showConfirmDialog({
      title: `Delete Note "${activeNote.title}"?`,
      message: 'Are you sure you want to permanently delete this note?',
      confirmLabel: 'Delete Note',
      isDestructive: true,
      onConfirm: () => {
        deleteNote(activeNote.id);
        const remaining = notes.filter((n) => n.id !== activeNote.id);
        if (remaining.length > 0) {
          setActiveNoteId(remaining[0].id);
        }
      },
    });
  };

  // Filtered Notes list
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (!showArchived && n.archived) return false;
        if (showArchived && !n.archived) return false;

        if (selectedSubjectFilter !== 'all' && n.subjectId !== selectedSubjectFilter) return false;
        if (selectedTagFilter !== 'all' && !n.tags.includes(selectedTagFilter)) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = n.title.toLowerCase().includes(q);
          const matchesContent = n.content.toLowerCase().includes(q);
          const matchesTags = n.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesContent && !matchesTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, showArchived, selectedSubjectFilter, selectedTagFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-130px)] flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Academic Notes & Summaries
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize lecture summaries, formulas, and cheat sheets linked to your courses.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Main 2-Pane Notes Container */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Left Pane: Notes List & Filter (4 Cols) */}
        <div className="md:col-span-4 border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-full bg-slate-50/40 dark:bg-slate-950/20">
          {/* Search & Tag Filter Header */}
          <div className="p-3.5 space-y-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes & tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Courses</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}
                  </option>
                ))}
              </select>

              {allTags.length > 0 && (
                <select
                  value={selectedTagFilter}
                  onChange={(e) => setSelectedTagFilter(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>
                      #{t}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  showArchived
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
                title={showArchived ? 'Showing archived notes' : 'Show archived notes'}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 p-4">
                <p className="text-xs">No notes found.</p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const sub = subjects.find((s) => s.id === note.subjectId);
                const isSelected = activeNote?.id === note.id;

                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-3.5 transition-colors cursor-pointer relative ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                        : 'hover:bg-white dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {note.pinned && (
                          <Pin className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0 fill-current" />
                        )}
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {note.title}
                        </h4>
                      </div>
                      {sub && (
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded text-white shrink-0"
                          style={{ backgroundColor: sub.color }}
                        >
                          {sub.code}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {note.content.replace(/[#*`>]/g, '')}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        {note.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-indigo-600 dark:text-indigo-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Note Editor & Markdown Preview (8 Cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-slate-900">
          {activeNote ? (
            <>
              {/* Note Editor Header Bar */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => {
                      setEditorTitle(e.target.value);
                      triggerAutosave(e.target.value, editorContent, editorSubjectId, editorTags);
                    }}
                    placeholder="Note title..."
                    className="font-extrabold text-base text-slate-900 dark:text-white bg-transparent border-0 focus:outline-hidden flex-1"
                  />
                  {/* Autosave status indicator */}
                  <span className="text-[11px] font-medium flex items-center gap-1 shrink-0 text-slate-400">
                    {saveStatus === 'saving' ? (
                      <span className="text-amber-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Saving...
                      </span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}
                  </span>
                </div>

                {/* Editor Action Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      previewMode
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={previewMode ? 'Switch to Edit' : 'Preview Markdown'}
                  >
                    {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
                  </button>

                  <button
                    onClick={() => togglePinNote(activeNote.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      activeNote.pinned
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700'
                    }`}
                    title={activeNote.pinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => updateNote(activeNote.id, { archived: !activeNote.archived })}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      activeNote.archived
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700'
                    }`}
                    title={activeNote.archived ? 'Restore note' : 'Archive note'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleDeleteActiveNote}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Course & Tags Sub-header */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 bg-slate-50/40 dark:bg-slate-800/20 text-xs">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={editorSubjectId}
                    onChange={(e) => {
                      setEditorSubjectId(e.target.value);
                      triggerAutosave(editorTitle, editorContent, e.target.value, editorTags);
                    }}
                    className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  >
                    <option value="">No subject linked</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 flex-1 min-w-[150px]">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tags: DSA, Algorithms, Cheatsheet..."
                    value={editorTags}
                    onChange={(e) => {
                      setEditorTags(e.target.value);
                      triggerAutosave(editorTitle, editorContent, editorSubjectId, e.target.value);
                    }}
                    className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-hidden w-full text-xs"
                  />
                </div>
              </div>

              {/* Note Body Area (Editor vs Preview) */}
              <div className="flex-1 p-5 overflow-y-auto">
                {previewMode ? (
                  <div className="prose dark:prose-invert max-w-none text-sm space-y-3 leading-relaxed">
                    {editorContent.split('\n\n').map((block, idx) => {
                      if (block.startsWith('## ')) {
                        return <h2 key={idx} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">{block.replace('## ', '')}</h2>;
                      }
                      if (block.startsWith('### ')) {
                        return <h3 key={idx} className="text-base font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1">{block.replace('### ', '')}</h3>;
                      }
                      if (block.startsWith('> ')) {
                        return (
                          <blockquote key={idx} className="p-3 border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-slate-700 dark:text-slate-300 rounded-r-lg my-2">
                            {block.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      return <p key={idx} className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{block}</p>;
                    })}
                  </div>
                ) : (
                  <textarea
                    value={editorContent}
                    onChange={(e) => {
                      setEditorContent(e.target.value);
                      triggerAutosave(editorTitle, e.target.value, editorSubjectId, editorTags);
                    }}
                    placeholder="Write your study notes, formulas, lecture pointers here (Markdown supported)..."
                    className="w-full h-full resize-none font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-transparent border-0 focus:outline-hidden"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 text-slate-400">
              <div>
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="font-semibold text-sm">No Note Selected</p>
                <p className="text-xs mt-1">Select a note from the left or create a new one.</p>
                <button
                  onClick={handleCreateNewNote}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Create Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
