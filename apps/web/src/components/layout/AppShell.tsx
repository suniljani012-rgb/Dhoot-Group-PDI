import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Sticky Header */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop & Tablet Sidebar (Always Visible on Large Screens >= 1024px) */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Slide-Over Drawer with Backdrop Blur (< 1024px) */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="w-72 bg-[#0F172A] h-full shadow-2xl animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile One-Handed Bottom Nav Bar (< 1024px) */}
      <BottomNav />
    </div>
  );
};