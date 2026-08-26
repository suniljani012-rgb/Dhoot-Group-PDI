import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-canvas flex flex-col overflow-hidden">
      <Header isMobileMenuOpen={menuOpen} onToggleMobileMenu={() => setMenuOpen(!menuOpen)} />

      <div className="flex-1 flex overflow-hidden">
        <div className="hidden lg:block w-56 shrink-0 h-full border-r border-line bg-surface">
          <Sidebar />
        </div>

        {menuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-ink/30 flex"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="w-60 bg-surface h-full shadow-pop flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onCloseMobile={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 py-5 pb-24 lg:pb-8">
          {children || <Outlet />}
        </main>
      </div>

      <BottomNav />
    </div>
  );
};
