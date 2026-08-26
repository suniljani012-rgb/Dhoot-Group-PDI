import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, Bell, Globe } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, currentBrand, setBrand, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const getUserInitials = (name?: string, fallback = 'SA') => {
    if (!name || !name.trim()) return fallback;
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return parts[0].toUpperCase();
  };

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

        {/* Dhoot Group Brand Identity */}
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
              Official Dealership Portal
            </span>
          </div>
        </div>
      </div>

      {/* Center: Executive Brand / Franchise Switcher for Admin */}
      <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setBrand('DHOOT-ALL')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            currentBrand.code === 'DHOOT-ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>All Franchises</span>
        </button>

        <button
          onClick={() => setBrand('DHOOT-TATA')}
          className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentBrand.code === 'DHOOT-TATA'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Tata Motors</span>
        </button>

        <button
          onClick={() => setBrand('DHOOT-HYUNDAI')}
          className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentBrand.code === 'DHOOT-HYUNDAI'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Hyundai</span>
        </button>
      </div>

      {/* Right: Notifications, User Profile & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        
        {/* Mobile Brand Selector */}
        <div className="md:hidden">
          <select
            value={currentBrand.code}
            onChange={(e) => setBrand(e.target.value as any)}
            className="text-xs font-bold p-1.5 bg-slate-100 border border-slate-200 rounded-xl"
          >
            <option value="DHOOT-ALL">All Brands</option>
            <option value="DHOOT-TATA">Tata</option>
            <option value="DHOOT-HYUNDAI">Hyundai</option>
          </select>
        </div>

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
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs tracking-wider font-mono">
            {getUserInitials(user?.userName || user?.employeeId, 'SA')}
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