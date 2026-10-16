import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ToastContainer } from '../common/ToastContainer';
import { QuickAddModal } from '../common/QuickAddModal';
import { SearchModal } from '../common/SearchModal';
import { LabBatchModal } from '../common/LabBatchModal';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

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
