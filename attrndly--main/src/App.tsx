import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TimetablePage } from './pages/TimetablePage';
import { CalculatorPage } from './pages/CalculatorPage';
import { TasksPage } from './pages/TasksPage';
import { NotesPage } from './pages/NotesPage';
import { CalendarPage } from './pages/CalendarPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
