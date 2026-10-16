import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Archive,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Layers,
  ArrowUpDown,
  X,
  FileText,
  Clock,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subject, SubjectType } from '../types';
import { calculateAttendanceStats } from '../services/dataService';

export const SubjectsPage: React.FC = () => {
  const {
    subjects,
    timetable,
    tasks,
    notes,
    attendanceRecords,
    createSubject,
    updateSubject,
    deleteSubject,
    archiveSubject,
    showConfirmDialog,
  } = useApp();

  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('highlight');

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'danger'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<'percentage-asc' | 'percentage-desc' | 'name' | 'code'>('percentage-asc');

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<Subject | null>(null);

  // Form State for Add / Edit
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [type, setType] = useState<SubjectType>('Lecture');
  const [color, setColor] = useState('#6366f1');
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [room, setRoom] = useState('');
  const [subjectNotes, setSubjectNotes] = useState('');

  const openAddModal = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setInstructor('');
    setType('Lecture');
    setColor('#6366f1');
    setTargetPercentage(75);
    setRoom('');
    setSubjectNotes('');
    setIsAddEditOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code);
    setInstructor(sub.instructorName || '');
    setType(sub.type);
    setColor(sub.color);
    setTargetPercentage(sub.targetPercentage);
    setRoom(sub.room || '');
    setSubjectNotes(sub.notes || '');
    setIsAddEditOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        instructorName: instructor.trim() || undefined,
        type,
        color,
        targetPercentage: Number(targetPercentage),
        room: room.trim() || undefined,
        notes: subjectNotes.trim() || undefined,
      });
    } else {
      createSubject({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        instructorName: instructor.trim() || undefined,
        type,
        color,
        targetPercentage: Number(targetPercentage),
        room: room.trim() || undefined,
        notes: subjectNotes.trim() || undefined,
      });
    }
    setIsAddEditOpen(false);
  };

  const handleDeletePrompt = (sub: Subject) => {
    showConfirmDialog({
      title: `Delete Subject "${sub.name}"?`,
      message: `This will permanently remove ${sub.name} (${sub.code}) and all its associated timetable slots. Past attendance statistics will be cleared. This action cannot be undone.`,
      confirmLabel: 'Delete Subject',
      isDestructive: true,
      onConfirm: () => {
        deleteSubject(sub.id);
        if (selectedSubjectDetail?.id === sub.id) {
          setSelectedSubjectDetail(null);
        }
      },
    });
  };

  // Filtered & Sorted Subjects
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((s) => {
        // Archive filter
        if (!showArchived && s.archived) return false;
        if (showArchived && !s.archived) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = s.name.toLowerCase().includes(q);
          const matchesCode = s.code.toLowerCase().includes(q);
          const matchesInstructor = (s.instructorName || '').toLowerCase().includes(q);
          if (!matchesName && !matchesCode && !matchesInstructor) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && s.type !== typeFilter) return false;

        // Status filter
        const stats = calculateAttendanceStats(s.classesAttended, s.classesAbsent, s.targetPercentage);
        if (statusFilter === 'danger' && stats.status !== 'danger') return false;
        if (statusFilter === 'safe' && stats.status === 'danger') return false;

        return true;
      })
      .sort((a, b) => {
        const statsA = calculateAttendanceStats(a.classesAttended, a.classesAbsent, a.targetPercentage);
        const statsB = calculateAttendanceStats(b.classesAttended, b.classesAbsent, b.targetPercentage);

        if (sortBy === 'percentage-asc') return statsA.currentPercentage - statsB.currentPercentage;
        if (sortBy === 'percentage-desc') return statsB.currentPercentage - statsA.currentPercentage;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'code') return a.code.localeCompare(b.code);
        return 0;
      });
  }, [subjects, searchQuery, typeFilter, statusFilter, showArchived, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Subjects & Courses
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your courses, view attendance health, and track syllabus tasks.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by subject name, code, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="Lecture">Lectures</option>
              <option value="Lab">Labs</option>
              <option value="Practical">Practicals</option>
              <option value="Tutorial">Tutorials</option>
            </select>

            {/* Attendance Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="danger">Below Target (Alert)</option>
              <option value="safe">Meeting Target</option>
            </select>

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="percentage-asc">Attendance: Lowest First</option>
              <option value="percentage-desc">Attendance: Highest First</option>
              <option value="name">Subject Name (A-Z)</option>
              <option value="code">Subject Code</option>
            </select>

            {/* Show Archived Toggle */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                showArchived
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {showArchived ? 'Showing Archived' : 'Show Archived'}
            </button>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No subjects found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters.'
              : 'Get started by creating your first university course!'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Add Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => {
            const stats = calculateAttendanceStats(sub.classesAttended, sub.classesAbsent, sub.targetPercentage);
            const isDanger = stats.status === 'danger';
            const isWarning = stats.status === 'warning';
            const isHighlighted = highlightedId === sub.id;

            return (
              <div
                key={sub.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                  isHighlighted
                    ? 'ring-2 ring-indigo-500 border-indigo-400'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div>
                  {/* Top Subject Tag & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="font-mono font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {sub.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {sub.type}
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => archiveSubject(sub.id, !sub.archived)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={sub.archived ? 'Restore Subject' : 'Archive Subject'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Name */}
                  <h3
                    onClick={() => setSelectedSubjectDetail(sub)}
                    className="font-bold text-base text-slate-900 dark:text-white mt-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {sub.name}
                  </h3>

                  {/* Instructor (Informational only, no faculty account) */}
                  {sub.instructorName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {sub.instructorName}
                    </p>
                  )}

                  {sub.room && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Room: {sub.room}
                    </p>
                  )}

                  {/* Attendance Visual Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Attendance
                      </span>
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
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

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, stats.currentPercentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      <span>Target: {sub.targetPercentage}%</span>
                      <span>
                        {sub.classesAttended} Attended / {stats.classesHeld} Held
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with actionable insight + Open Details link */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px]">
                    {isDanger ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Need {stats.classesNeededToTarget} consecutive
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Safe to skip: {stats.classesCanSkip}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedSubjectDetail(sub)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    Details <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Computer Networks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CS 310"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm uppercase font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Instructor Name (Informational)
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Kevin Zhao"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Subject Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as SubjectType)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Practical">Practical</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Target %
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hall A-105"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Color Tag
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-9 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-white dark:bg-slate-800"
                    />
                    <span className="text-xs font-mono text-slate-500">{color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Notes & Syllabus Rules
                </label>
                <textarea
                  rows={2}
                  placeholder="Grading weightage, textbook, attendance rules..."
                  value={subjectNotes}
                  onChange={(e) => setSubjectNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Detail Drawer / Modal */}
      {selectedSubjectDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: selectedSubjectDetail.color }}
                />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    {selectedSubjectDetail.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    {selectedSubjectDetail.code} &bull; {selectedSubjectDetail.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubjectDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Stat breakdown */}
              {(() => {
                const stats = calculateAttendanceStats(
                  selectedSubjectDetail.classesAttended,
                  selectedSubjectDetail.classesAbsent,
                  selectedSubjectDetail.targetPercentage
                );
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Current Attendance</p>
                      <p
                        className={`text-xl font-extrabold mt-0.5 ${
                          stats.status === 'danger'
                            ? 'text-rose-600'
                            : stats.status === 'warning'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {stats.currentPercentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Classes Attended</p>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {selectedSubjectDetail.classesAttended} / {stats.classesHeld}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Classes Missed</p>
                      <p className="text-xl font-extrabold text-rose-600 mt-0.5">
                        {selectedSubjectDetail.classesAbsent}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Target</p>
                      <p className="text-xl font-extrabold text-indigo-600 mt-0.5">
                        {selectedSubjectDetail.targetPercentage}%
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Informational Instructor & Room Details */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                {selectedSubjectDetail.instructorName && (
                  <p>
                    <strong>Instructor:</strong> {selectedSubjectDetail.instructorName}
                  </p>
                )}
                {selectedSubjectDetail.room && (
                  <p>
                    <strong>Classroom / Lab:</strong> {selectedSubjectDetail.room}
                  </p>
                )}
                {selectedSubjectDetail.notes && (
                  <div className="mt-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/60 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-200">
                    <p className="font-semibold mb-1">Subject Notes:</p>
                    <p className="leading-relaxed">{selectedSubjectDetail.notes}</p>
                  </div>
                )}
              </div>

              {/* Scheduled Timetable Slots */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Weekly Schedule Slots
                </h4>
                {timetable.filter((t) => t.subjectId === selectedSubjectDetail.id).length === 0 ? (
                  <p className="text-xs text-slate-400">No scheduled weekly timetable slots.</p>
                ) : (
                  <div className="space-y-2">
                    {timetable
                      .filter((t) => t.subjectId === selectedSubjectDetail.id)
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200">{slot.day}</span>
                          <span className="text-slate-500">{slot.startTime} - {slot.endTime}</span>
                          <span className="text-slate-500 font-mono">Room {slot.room}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Related Tasks */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  Related Tasks & Assignments
                </h4>
                {tasks.filter((t) => t.subjectId === selectedSubjectDetail.id).length === 0 ? (
                  <p className="text-xs text-slate-400">No pending tasks for this course.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => t.subjectId === selectedSubjectDetail.id)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">{task.title}</span>
                            <p className="text-[11px] text-slate-400">Due {task.dueDate} &bull; {task.category}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Related Notes */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Subject Notes
                </h4>
                {notes.filter((n) => n.subjectId === selectedSubjectDetail.id).length === 0 ? (
                  <p className="text-xs text-slate-400">No notes written for this course yet.</p>
                ) : (
                  <div className="space-y-2">
                    {notes
                      .filter((n) => n.subjectId === selectedSubjectDetail.id)
                      .map((note) => (
                        <div
                          key={note.id}
                          className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <p className="font-semibold text-slate-900 dark:text-white">{note.title}</p>
                          <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{note.content.replace(/[#*`]/g, '')}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSubjectDetail(null)}
                className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
