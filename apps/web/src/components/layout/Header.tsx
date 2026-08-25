import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, Bell, Building } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">
      
      {/* Left: Mobile Toggle & Pure Dhoot Group Branding */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Pure Dhoot Group Brand Identity */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Dhoot Group Logo" 
            className="h-10 w-10 object-contain rounded-2xl shrink-0"
          />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-slate-900 leading-none">
                Dhoot Group
              </span>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                HQ
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
              Automotive Enterprise
            </span>
          </div>
        </div>
      </div>

      {/* Right: Notifications, User Profile & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        
        {/* Real-Time Operations Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all relative cursor-pointer"
            title="Dealership Operations Center"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse ring-2 ring-white" />
          </button>

          {/* Slide-over Flyout Center */}
          <NotificationPanel
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {user?.userCode || 'DG001'}
          </div>

          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {user?.userName || 'Administrator'}
            </div>
            <div className="text-[10px] font-semibold text-slate-400">
              {user?.designation || 'System Admin'}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>

    </header>
  );
};