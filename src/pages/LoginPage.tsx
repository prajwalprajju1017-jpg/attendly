import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Hash,
  ArrowRight,
  AlertCircle,
  HardDrive,
  UserCheck,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthService } from '../services/authService';
import { normalizeUsn } from '../utils/validation';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginStudent, addToast } = useApp();

  const [usn, setUsn] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get list of local student profiles already stored in browser
  const storedProfiles = AuthService.getAllLocalProfiles();

  const handleSelectProfile = (selectedUsn: string) => {
    try {
      const student = loginStudent({ usn: selectedUsn });
      addToast({
        type: 'success',
        title: 'Student Profile Loaded',
        description: `Active student: ${student.name} (${student.usn})`,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Unable to load profile.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsn = normalizeUsn(usn);
    if (!cleanUsn) {
      setError('Please enter your University Seat Number (USN).');
      return;
    }

    try {
      const student = loginStudent({ usn: cleanUsn });
      addToast({
        type: 'success',
        title: 'Local Workspace Loaded',
        description: `Active student: ${student.name} (${student.usn})`,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Profile not found. Please create a local profile first.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/welcome" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Select Student Workspace
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Load your local browser attendance and timetable data by USN
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl border border-slate-200/80 dark:border-slate-800">
          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-700 dark:text-rose-300">
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Quick Select Saved Profiles List if Any */}
          {storedProfiles.length > 0 && (
            <div className="mb-6 space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Saved Local Profiles in This Browser:
              </label>
              <div className="space-y-2">
                {storedProfiles.map((p) => (
                  <button
                    key={p.usn}
                    type="button"
                    onClick={() => handleSelectProfile(p.usn)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {p.name}
                        </p>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {p.usn} &bull; {p.degree || 'Student'}
                        </p>
                      </div>
                    </div>
                    <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual USN Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="usn"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Enter USN manually
                </label>
                <span className="text-[11px] text-slate-400">Uppercase</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="usn"
                  type="text"
                  autoCapitalize="characters"
                  required
                  value={usn}
                  onChange={(e) => setUsn(e.target.value.toUpperCase())}
                  placeholder="e.g. 1SI22CS001"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tracking-wide text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              <span>Load Local Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Link to create new profile */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need to track a new student schedule?{' '}
              <Link
                to="/register"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create New Local Profile
              </Link>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-4 text-center">
          <Link
            to="/welcome"
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            &larr; Back to Welcome Screen
          </Link>
        </div>
      </div>
    </div>
  );
};
