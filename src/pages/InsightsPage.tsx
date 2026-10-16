import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { calculateAttendanceStats } from '../services/dataService';

export const InsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, attendanceRecords, semester } = useApp();

  // Summary figures from real subjects data
  const totalAttended = subjects.reduce((sum, s) => sum + s.classesAttended, 0);
  const totalAbsent = subjects.reduce((sum, s) => sum + s.classesAbsent, 0);
  const totalHeld = totalAttended + totalAbsent;
  const overallStats = calculateAttendanceStats(totalAttended, totalAbsent, semester.defaultTargetPercentage);

  // 1. Data: Attendance by Subject with Target Comparison
  const subjectChartData = subjects.map((s) => {
    const stats = calculateAttendanceStats(s.classesAttended, s.classesAbsent, s.targetPercentage);
    return {
      name: s.code,
      fullName: s.name,
      attendance: stats.currentPercentage,
      target: s.targetPercentage,
      attended: s.classesAttended,
      missed: s.classesAbsent,
      status: stats.status,
    };
  });

  // 2. Data: Classes Attended vs Missed (Breakdown)
  const attendedVsMissedData = subjects.map((s) => ({
    name: s.code,
    Attended: s.classesAttended,
    Absent: s.classesAbsent,
    Cancelled: s.classesCancelled,
  }));

  // 3. Real Day-of-Week Attendance from recorded attendance entries
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStatsMap: Record<string, { present: number; absent: number }> = {
    Mon: { present: 0, absent: 0 },
    Tue: { present: 0, absent: 0 },
    Wed: { present: 0, absent: 0 },
    Thu: { present: 0, absent: 0 },
    Fri: { present: 0, absent: 0 },
  };

  attendanceRecords.forEach((r) => {
    if (r.status === 'present' || r.status === 'absent') {
      const d = new Date(r.date + 'T00:00:00');
      const dayName = dayNames[d.getDay()];
      if (dayStatsMap[dayName]) {
        if (r.status === 'present') dayStatsMap[dayName].present += 1;
        else if (r.status === 'absent') dayStatsMap[dayName].absent += 1;
      }
    }
  });

  const dayWiseAttendanceData = Object.entries(dayStatsMap).map(([day, counts]) => {
    const held = counts.present + counts.absent;
    const rate = held > 0 ? Math.round((counts.present / held) * 100) : 0;
    return { day, rate, classes: held };
  });

  // Sorted by performance
  const subjectsWithClasses = subjectChartData.filter((s) => s.attended + s.missed > 0);
  const sortedByPerf = [...subjectsWithClasses].sort((a, b) => b.attendance - a.attendance);
  const bestSubject = sortedByPerf[0] || null;
  const lowestSubject = sortedByPerf[sortedByPerf.length - 1] || null;

  // Empty state if no subjects exist
  if (subjects.length === 0) {
    return (
      <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 max-w-xl mx-auto space-y-4">
        <BarChart3 className="w-14 h-14 mx-auto text-slate-300 dark:text-slate-700" />
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
          No Subject Data to Analyze
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Add your university courses and start recording attendance to generate performance metrics, target benchmarks, and daily trends.
        </p>
        <button
          onClick={() => navigate('/subjects')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Add Your First Subject
        </button>
      </div>
    );
  }

  // Empty state if no classes have been held/marked yet
  if (totalHeld === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Academic Analytics & Insights
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Attendance charts and trends will calculate automatically once you begin recording classes.
          </p>
        </div>

        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 max-w-md mx-auto space-y-3">
          <TrendingUp className="w-12 h-12 mx-auto text-indigo-500 mb-2" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No Attendance Marked Yet
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You have {subjects.length} course{subjects.length > 1 ? 's' : ''} set up. Mark your attendance as Present or Absent on the Dashboard or Timetable to view analytics.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Academic Analytics & Insights
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Calculated from your {totalHeld} recorded classes across {subjects.length} active courses.
        </p>
      </div>

      {/* Top 4 Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Overall Attendance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {overallStats.currentPercentage}%
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                overallStats.status === 'safe'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {overallStats.status === 'safe' ? 'Safe' : 'Alert'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Default Target: {semester.defaultTargetPercentage}%
          </p>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Highest Attendance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {bestSubject ? `${bestSubject.attendance}%` : 'N/A'}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
              {bestSubject?.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            {bestSubject?.fullName || 'No recorded classes'}
          </p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Lowest Attendance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-extrabold ${
                lowestSubject && lowestSubject.attendance < lowestSubject.target
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }`}
            >
              {lowestSubject ? `${lowestSubject.attendance}%` : 'N/A'}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
              {lowestSubject?.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Target required: {lowestSubject?.target || semester.defaultTargetPercentage}%
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Cumulative Classes</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalHeld}
            </span>
            <span className="text-xs text-slate-500">Recorded</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {totalAttended} attended &bull; {totalAbsent} missed
          </p>
        </div>
      </div>

      {/* Actionable Intelligence / Summary Advice Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-violet-50/90 dark:from-indigo-950/30 dark:to-violet-950/20 border border-indigo-100 dark:border-indigo-900/40 text-slate-800 dark:text-slate-200 space-y-2">
        <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Attendance Analysis
        </h4>
        <p className="text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Your overall attendance is <strong>{overallStats.currentPercentage}%</strong> against your {semester.defaultTargetPercentage}% target.
          {subjectChartData.filter((s) => s.attendance < s.target && s.attended + s.missed > 0).length > 0 ? (
            <span>
              {' '}You have{' '}
              <strong className="text-rose-600 dark:text-rose-400">
                {subjectChartData.filter((s) => s.attendance < s.target && s.attended + s.missed > 0).length} course(s)
              </strong>{' '}
              below requirement. Check the Attendance Calculator to plan your recovery sessions.
            </span>
          ) : (
            <span> All courses with recorded classes currently meet or exceed your target.</span>
          )}
        </p>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Subject Attendance vs Target */}
        <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Attendance by Subject vs Target
            </h3>
            <p className="text-xs text-slate-500">
              Percentage comparison for every active course with minimum target threshold.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                          <p className="font-bold">{data.fullName} ({data.name})</p>
                          <p className="text-indigo-300">Current: {data.attendance}%</p>
                          <p className="text-slate-400">Target: {data.target}%</p>
                          <p className="text-slate-400">{data.attended} attended / {data.missed} missed</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={semester.defaultTargetPercentage} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Target', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} />
                <Bar dataKey="attendance" fill="#6366f1" radius={[6, 6, 0, 0]} name="Current %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Classes Attended vs Missed */}
        <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Classes Attended vs Missed Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Volume breakdown of lectures attended, absent, and cancelled per course.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendedVsMissedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Attended" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Absent" fill="#ef4444" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Cancelled" fill="#94a3b8" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Day of Week Attendance Consistency (from real attendance logs) */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Day-of-Week Attendance Consistency
          </h3>
          <p className="text-xs text-slate-500">
            Attendance percentage by weekday calculated from your recorded attendance logs.
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayWiseAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="rate" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Day Average %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
