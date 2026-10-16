import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  Tag,
  ArrowUpDown,
  BookOpen,
  X,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';

export const TasksPage: React.FC = () => {
  const { tasks, subjects, createTask, updateTask, deleteTask, toggleTaskStatus, showConfirmDialog } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due-asc' | 'due-desc' | 'priority' | 'title'>('due-asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Assignment');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [referenceUrl, setReferenceUrl] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setSubjectId('');
    setCategory('Assignment');
    setDueDate(todayStr);
    setDueTime('23:59');
    setPriority('Medium');
    setStatus('To Do');
    setReferenceUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setSubjectId(task.subjectId || '');
    setCategory(task.category);
    setDueDate(task.dueDate);
    setDueTime(task.dueTime || '23:59');
    setPriority(task.priority);
    setStatus(task.status);
    setReferenceUrl(task.referenceUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId || undefined,
        category,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        status,
        referenceUrl: referenceUrl.trim() || undefined,
      });
    } else {
      createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId || undefined,
        category,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        status,
        referenceUrl: referenceUrl.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  const handleDeletePrompt = (task: Task) => {
    showConfirmDialog({
      title: `Delete Task "${task.title}"?`,
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmLabel: 'Delete Task',
      isDestructive: true,
      onConfirm: () => deleteTask(task.id),
    });
  };

  // Tab counts
  const counts = useMemo(() => {
    const today = todayStr;
    const pending = tasks.filter((t) => t.status !== 'Completed');
    return {
      all: tasks.length,
      today: pending.filter((t) => t.dueDate === today).length,
      upcoming: pending.filter((t) => t.dueDate > today).length,
      overdue: pending.filter((t) => t.dueDate < today).length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
    };
  }, [tasks, todayStr]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Tab filter
        if (activeTab === 'today') {
          if (t.status === 'Completed' || t.dueDate !== todayStr) return false;
        } else if (activeTab === 'upcoming') {
          if (t.status === 'Completed' || t.dueDate <= todayStr) return false;
        } else if (activeTab === 'overdue') {
          if (t.status === 'Completed' || t.dueDate >= todayStr) return false;
        } else if (activeTab === 'completed') {
          if (t.status !== 'Completed') return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = t.title.toLowerCase().includes(q);
          const matchesDesc = (t.description || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc) return false;
        }

        // Subject filter
        if (subjectFilter !== 'all' && t.subjectId !== subjectFilter) return false;

        // Priority filter
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'due-asc') return a.dueDate.localeCompare(b.dueDate);
        if (sortBy === 'due-desc') return b.dueDate.localeCompare(a.dueDate);
        if (sortBy === 'priority') {
          const weights: Record<TaskPriority, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [tasks, activeTab, searchQuery, subjectFilter, priorityFilter, categoryFilter, sortBy, todayStr]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tasks & Assignments
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track coursework deadlines, lab reports, exam prep, and personal study goals.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>All Tasks</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Due Today</span>
          {counts.today > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
              {counts.today}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Upcoming</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800">
            {counts.upcoming}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'overdue'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Overdue</span>
          {counts.overdue > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
              {counts.overdue}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Completed</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            {counts.completed}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, deliverables, rubrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Categories</option>
            <option value="Assignment">Assignment</option>
            <option value="Project">Project</option>
            <option value="Lab Record">Lab Record</option>
            <option value="Exam Preparation">Exam Preparation</option>
            <option value="Reading">Reading</option>
            <option value="Personal">Personal</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="due-asc">Due Date (Earliest First)</option>
            <option value="due-desc">Due Date (Latest First)</option>
            <option value="priority">Priority (Highest First)</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
          <CheckSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No tasks in this view</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || subjectFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search query or filter options.'
              : 'You are all caught up! Click below to create a new task.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const sub = subjects.find((s) => s.id === task.subjectId);
            const isCompleted = task.status === 'Completed';
            const isOverdue = !isCompleted && task.dueDate < todayStr;
            const isDueToday = !isCompleted && task.dueDate === todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60'
                    : isDueToday
                    ? 'border-amber-300 dark:border-amber-900/60'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Status Checkbox Button */}
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600'
                    }`}
                    title={isCompleted ? 'Reopen task' : 'Mark completed'}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {sub && (
                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-white shadow-2xs"
                          style={{ backgroundColor: sub.color }}
                        >
                          {sub.code}
                        </span>
                      )}

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {task.category}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          task.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'High'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : task.priority === 'Medium'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {task.priority} Priority
                      </span>

                      {/* Overdue / Due Today Flag */}
                      {isOverdue && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500 text-white flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                      {isDueToday && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-white flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due Today
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold text-slate-900 dark:text-white ${
                        isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}
                      </span>

                      {task.referenceUrl && (
                        <a
                          href={task.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Reference Link
                        </a>
                      )}

                      {task.completedAt && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Completed on {task.completedAt.split('T')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(task)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Assignment 3 on Graph Traversals"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Related Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">General (No subject)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Lab Record">Lab Record</option>
                    <option value="Exam Preparation">Exam Preparation</option>
                    <option value="Reading">Reading</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Description / Deliverables
                </label>
                <textarea
                  rows={2}
                  placeholder="Task instructions, format requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Reference URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://lms.university.edu/assignment/12"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
