import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertCircle, X, Sparkles, Clock, MapPin, UserCheck, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LabBatch } from '../../types';

interface BatchInfo {
  id: LabBatch;
  label: string;
  name: string;
  labs: Array<{
    name: string;
    day: string;
    time: string;
    instructor: string;
  }>;
}

const BATCH_DETAILS: BatchInfo[] = [
  {
    id: 'B1',
    label: 'Batch B1',
    name: 'Section B1 Practicals',
    labs: [
      { name: 'DSL (Data Structures Lab)', day: 'Monday', time: '11:15 AM - 1:15 PM', instructor: 'AHR / NR' },
      { name: 'TechExL (Technical Experiential Learning)', day: 'Thursday', time: '2:15 PM - 5:15 PM', instructor: 'NR / AHR' },
      { name: 'IMLL (Machine Learning Lab)', day: 'Friday', time: '11:15 AM - 1:15 PM', instructor: 'KVL / UV' },
    ],
  },
  {
    id: 'B2',
    label: 'Batch B2',
    name: 'Section B2 Practicals',
    labs: [
      { name: 'IMLL (Machine Learning Lab)', day: 'Monday', time: '11:15 AM - 1:15 PM', instructor: 'KVL / UV' },
      { name: 'TechExL (Technical Experiential Learning)', day: 'Tuesday', time: '2:15 PM - 5:15 PM', instructor: 'RS / SKS' },
      { name: 'DSL (Data Structures Lab)', day: 'Wednesday', time: '11:15 AM - 1:15 PM', instructor: 'AHR / NR' },
    ],
  },
  {
    id: 'B3',
    label: 'Batch B3',
    name: 'Section B3 Practicals',
    labs: [
      { name: 'TechExL (Technical Experiential Learning)', day: 'Monday', time: '2:15 PM - 5:15 PM', instructor: 'SKS / RS' },
      { name: 'IMLL (Machine Learning Lab)', day: 'Wednesday', time: '11:15 AM - 1:15 PM', instructor: 'KVL / VU' },
      { name: 'DSL (Data Structures Lab)', day: 'Friday', time: '11:15 AM - 1:15 PM', instructor: 'AHR / NR' },
    ],
  },
];

export const LabBatchModal: React.FC = () => {
  const {
    isBatchModalOpen,
    closeBatchModal,
    profile,
    setStudentLabBatch,
    updateProfile,
    showConfirmDialog,
  } = useApp();

  const [selectedBatch, setSelectedBatch] = useState<LabBatch | null>(profile.labBatch || null);
  const [studentName, setStudentName] = useState(profile.name || '');

  useEffect(() => {
    if (profile.labBatch) {
      setSelectedBatch(profile.labBatch);
    }
    if (profile.name) {
      setStudentName(profile.name);
    }
  }, [profile.labBatch, profile.name]);

  if (!isBatchModalOpen) return null;

  const handleConfirm = () => {
    if (!selectedBatch) return;

    // If changing from an existing batch, prompt confirmation
    if (profile.labBatch && profile.labBatch !== selectedBatch) {
      showConfirmDialog({
        title: `Change Lab Batch to ${selectedBatch}?`,
        message: `Your weekly schedule will be updated to show ${selectedBatch} lab and practical sessions. Past attendance logs will remain preserved.`,
        confirmLabel: `Switch to Batch ${selectedBatch}`,
        onConfirm: () => {
          if (studentName.trim() && studentName !== profile.name) {
            updateProfile({ name: studentName.trim(), labBatch: selectedBatch });
          } else {
            setStudentLabBatch(selectedBatch);
          }
        },
      });
      return;
    }

    // Initial onboarding selection
    if (studentName.trim() && studentName !== profile.name) {
      updateProfile({ name: studentName.trim(), labBatch: selectedBatch });
      setStudentLabBatch(selectedBatch);
    } else {
      setStudentLabBatch(selectedBatch);
    }
  };

  const isInitialOnboarding = !profile.labBatch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-labelledby="batch-modal-title"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 relative bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 id="batch-modal-title" className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Select Your Lab Batch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sri Siddhartha Institute of Technology &bull; Dept. of CSE (Data Science) &bull; 3rd Sem (2026–27)
                </p>
              </div>
            </div>

            <button
              onClick={closeBatchModal}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close popup"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            Your laboratory practicals (<strong>DSL</strong>, <strong>IMLL</strong>, and <strong>TechExL</strong>) are scheduled by batch. Please select your assigned lab batch below to personalize your weekly timetable and attendance records.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Optional Name confirmation if onboarding */}
          {isInitialOnboarding && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Student Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter your name (e.g. Alex Morgan)"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Batch Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {BATCH_DETAILS.map((batch) => {
              const isSelected = selectedBatch === batch.id;
              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60'
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-extrabold px-3 py-1 rounded-xl font-mono ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {batch.label}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      {batch.name}
                    </p>

                    {/* Lab Schedule Breakdown */}
                    <div className="space-y-2 text-[11px]">
                      {batch.labs.map((lab, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5"
                        >
                          <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {lab.name}
                          </p>
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px]">
                            <span>{lab.day}</span>
                            <span className="font-mono">{lab.time.split(' - ')[0]}</span>
                          </div>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                            Faculty: {lab.instructor}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>3 practical lab slots / week</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shared theory note */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Shared Theory &amp; Tutorial Classes (Room 102)
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              All batches attend shared lecture classes in <strong>Room 102</strong> together (OOPS, MAT, IML, DS, OS, FAI, and their special seminar/tutorial sessions). Only practical lab hours are separated by batch.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {profile.labBatch ? (
              <span>Current Batch: <strong>{profile.labBatch}</strong></span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">Batch required for timetable view</span>
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeBatchModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {profile.labBatch ? 'Cancel' : 'Decide Later'}
            </button>

            <button
              type="button"
              disabled={!selectedBatch}
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm {selectedBatch ? `Batch ${selectedBatch}` : 'Selection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
