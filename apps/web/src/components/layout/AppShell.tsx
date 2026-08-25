import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* 1. Top Fixed Header (64px) */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />

      {/* 2. Main Body Container (Fixed Height Below Header) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Desktop Fixed Sidebar (Always Visible on lg screens, independent scroll) */}
        <div className="hidden lg:block w-64 shrink-0 h-full border-r border-slate-200 bg-white">
          <Sidebar />
        </div>

        {/* Mobile Slide-Over Drawer with Backdrop Blur (< lg) */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="w-72 bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* 3. Main Viewport (Only This Area Scrolls) */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-8 bg-[#F8FAFC]">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};