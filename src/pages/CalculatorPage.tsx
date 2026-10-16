import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calculator as CalcIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Sliders,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAttendanceStats } from '../services/dataService';
import { Subject } from '../types';

export const CalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, semester } = useApp();
  const [searchParams] = useSearchParams();
  const initialSubId = searchParams.get('subject') || subjects[0]?.id || '';

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubId);
  const [customTarget, setCustomTarget] = useState<number>(75);

  // Simulation controls
  const [simExtraPresent, setSimExtraPresent] = useState<number>(0);
  const [simExtraAbsent, setSimExtraAbsent] = useState<number>(0);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Sync custom target when selected subject changes
  React.useEffect(() => {
    if (selectedSubject) {
      setCustomTarget(selectedSubject.targetPercentage);
      setSimExtraPresent(0);
      setSimExtraAbsent(0);
    }
  }, [selectedSubjectId, selectedSubject]);

  if (!selectedSubject) {
    return (
      <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 max-w-md mx-auto space-y-4">
        <CalcIcon className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-700" />
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
          No Subjects Added Yet
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Create your university courses to calculate attendance percentages, safe bunk allowances, and recovery sessions.
        </p>
        <button
          onClick={() => navigate('/subjects')}
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Add Your First Subject
        </button>
      </div>
    );
  }

  // Base calculation
  const baseStats = calculateAttendanceStats(
    selectedSubject.classesAttended,
    selectedSubject.classesAbsent,
    customTarget
  );

  // Simulated calculation
  const simAttended = selectedSubject.classesAttended + simExtraPresent;
  const simAbsent = selectedSubject.classesAbsent + simExtraAbsent;
  const simStats = calculateAttendanceStats(simAttended, simAbsent, customTarget);

  const deltaPercentage = Math.round((simStats.currentPercentage - baseStats.currentPercentage) * 10) / 10;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <CalcIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Attendance & Bunk Calculator
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Calculate safe leave quotas, consecutive classes required, and run what-if simulations.
        </p>
      </div>

      {/* Subject Selector Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 gap-2">
        {subjects.map((sub) => {
          const stats = calculateAttendanceStats(sub.classesAttended, sub.classesAbsent, sub.targetPercentage);
          const isSelected = sub.id === selectedSubject.id;

          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? '#ffffff' : sub.color }}
              />
              <span>{sub.code}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : stats.status === 'danger'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                }`}
              >
                {stats.currentPercentage}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target & Official Stats (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedSubject.color }}
                />
                <span className="font-mono text-xs font-bold uppercase text-slate-500">
                  {selectedSubject.code}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {selectedSubject.name}
              </h3>
            </div>

            {/* Target Percentage Config Slider */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Required Target Attendance:
                </span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {customTarget}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={customTarget}
                onChange={(e) => setCustomTarget(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>50%</span>
                <span>75% (Standard)</span>
                <span>80%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Attendance Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-[11px] font-medium text-slate-500">Total Held</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {baseStats.classesHeld}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Present + Absent</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-[11px] font-medium text-slate-500">Classes Attended</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedSubject.classesAttended}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{selectedSubject.classesAbsent} missed</p>
              </div>
            </div>

            {/* Official Formula Breakdown */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>Attendance Formula Applied:</span>
              </div>
              <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                {selectedSubject.classesAttended} / ({selectedSubject.classesAttended} + {selectedSubject.classesAbsent}) &times; 100 ={' '}
                <strong>{baseStats.currentPercentage}%</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Cancelled ({selectedSubject.classesCancelled}) and unmarked classes are excluded from calculation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Key Verdict + What-If Future Simulation (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Verdict Banner Card */}
          <div
            className={`rounded-2xl p-6 border shadow-xs transition-all ${
              baseStats.classesHeld === 0
                ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                : baseStats.status === 'danger'
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  baseStats.classesHeld === 0
                    ? 'bg-slate-600 text-white'
                    : baseStats.status === 'danger'
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {baseStats.classesHeld === 0 ? (
                  <Info className="w-6 h-6" />
                ) : baseStats.status === 'danger' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <h4
                  className={`text-lg font-extrabold ${
                    baseStats.classesHeld === 0
                      ? 'text-slate-900 dark:text-white'
                      : baseStats.status === 'danger'
                      ? 'text-rose-950 dark:text-rose-200'
                      : 'text-emerald-950 dark:text-emerald-200'
                  }`}
                >
                  {baseStats.classesHeld === 0
                    ? 'No Classes Logged Yet'
                    : baseStats.status === 'danger'
                    ? 'Attendance Shortfall Alert!'
                    : 'Attendance Safely on Track!'}
                </h4>

                <p
                  className={`text-sm leading-relaxed ${
                    baseStats.classesHeld === 0
                      ? 'text-slate-600 dark:text-slate-400'
                      : baseStats.status === 'danger'
                      ? 'text-rose-800 dark:text-rose-300'
                      : 'text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {baseStats.classesHeld === 0 ? (
                    <>
                      0 classes have been recorded for <strong>{selectedSubject.name}</strong> so far. Use the simulator below to forecast future scenarios, or mark classes on your Dashboard as they occur.
                    </>
                  ) : baseStats.status === 'danger' ? (
                    <>
                      You are currently at <strong>{baseStats.currentPercentage}%</strong>. You need to attend{' '}
                      <span className="px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900/70 font-extrabold text-rose-900 dark:text-rose-100">
                        {baseStats.classesNeededToTarget} consecutive classes
                      </span>{' '}
                      without missing any to restore your attendance back to {customTarget}%.
                    </>
                  ) : (
                    <>
                      You are currently at <strong>{baseStats.currentPercentage}%</strong>. You can safely afford to miss{' '}
                      <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900/70 font-extrabold text-emerald-900 dark:text-emerald-100">
                        {baseStats.classesCanSkip} additional classes
                      </span>{' '}
                      and your attendance will still stay above your {customTarget}% requirement.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive What-If Scenario Simulator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    Future Attendance Simulator
                  </h4>
                  <p className="text-xs text-slate-500">
                    Test scenarios in sandbox mode without altering your real university records.
                  </p>
                </div>
              </div>

              {(simExtraPresent > 0 || simExtraAbsent > 0) && (
                <button
                  onClick={() => {
                    setSimExtraPresent(0);
                    setSimExtraAbsent(0);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Sandbox
                </button>
              )}
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Extra Classes Attended */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    If I attend next:
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    +{simExtraPresent} classes
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={simExtraPresent}
                  onChange={(e) => setSimExtraPresent(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0</span>
                  <span>10 classes</span>
                  <span>25 classes</span>
                </div>
              </div>

              {/* Extra Classes Missed */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    If I miss next:
                  </span>
                  <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                    +{simExtraAbsent} classes
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={simExtraAbsent}
                  onChange={(e) => setSimExtraAbsent(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0</span>
                  <span>5 classes</span>
                  <span>20 classes</span>
                </div>
              </div>
            </div>

            {/* Simulation Result Card */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Projected Attendance Outcome
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {simStats.currentPercentage}%
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      deltaPercentage > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : deltaPercentage < 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {deltaPercentage > 0 ? `+${deltaPercentage}%` : `${deltaPercentage}%`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Total Projected: {simAttended} attended out of {simStats.classesHeld} held
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-indigo-100 dark:sm:border-indigo-900 sm:pl-6">
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                    simStats.status === 'safe'
                      ? 'bg-emerald-500 text-white'
                      : simStats.status === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {simStats.status === 'safe' ? 'Compliant' : 'Shortfall Risk'}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  {simStats.classesCanSkip > 0
                    ? `Leaves buffer: ${simStats.classesCanSkip} classes`
                    : `Short by: ${simStats.classesNeededToTarget} classes`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
