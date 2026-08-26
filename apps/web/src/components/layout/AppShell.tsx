import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-canvas text-ink flex flex-col overflow-hidden">
      {/* 1. Top Fixed Header */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />

      {/* 2. Main Body Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:block w-56 shrink-0 h-full border-r border-line bg-surface">
          <Sidebar />
        </div>

        {/* Mobile Slide-Over Drawer */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="w-64 bg-surface h-full shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* 3. Main Viewport */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-8 bg-canvas">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};