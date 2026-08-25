import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, Bell } from 'lucide-react';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, currentBrand, logout } = useAuth();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* Left: Mobile Menu Button + Brand Logo & Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button (Hidden on Desktop) */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logos */}
        <div className="flex items-center gap-2.5">
          <img 
            src="/logo.png" 
            alt="Dhoot Group Logo" 
            className="h-9 w-9 object-contain rounded-lg"
          />

          <img 
            src={currentBrand.logoUrl} 
            alt={currentBrand.name} 
            className="h-9 w-9 object-contain rounded-lg border border-slate-200 p-0.5"
          />

          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">
                {currentBrand.name.toUpperCase()}
              </h1>
              <span
                style={{ backgroundColor: currentBrand.accentBg, color: currentBrand.primaryColor }}
                className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md"
              >
                {currentBrand.shortName}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Dhoot Group PDI Platform
            </span>
          </div>
        </div>
      </div>

      {/* Right: Notifications, User Info & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <button 
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Badge */}
        <div className="hidden md:block text-right">
          <div className="text-xs font-bold text-slate-800">{user?.employeeId || 'STAFF'}</div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">{user?.role?.replace('_', ' ') || 'Officer'}</div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};