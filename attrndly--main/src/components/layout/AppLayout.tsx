import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ToastContainer } from '../common/ToastContainer';
import { QuickAddModal } from '../common/QuickAddModal';
import { SearchModal } from '../common/SearchModal';
import { LabBatchModal } from '../common/LabBatchModal';
import { ShieldCheck, Info } from 'lucide-react';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Client Storage Notice Bar */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 px-4 py-1.5 text-[11px] md:text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Info className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span className="truncate">
              <strong>Local Storage Mode:</strong> Records are saved in local browser storage. Connect your Supabase database in Settings for cloud sync.
            </span>
          </div>
          <Link
            to="/settings"
            className="shrink-0 font-semibold underline hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors ml-2"
          >
            Supabase Setup →
          </Link>
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8 p-4 md:p-8">
          <Outlet />
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>

      {/* Modals & Portals */}
      <LabBatchModal />
      <QuickAddModal />
      <SearchModal />
      <ConfirmDialog />
      <ToastContainer />
    </div>
  );
};
