import React from 'react';
import { useAuth, BrandCode } from '../../context/AuthContext';
import { LogOut, Menu, X, Bell, Globe } from 'lucide-react';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, currentBrand, setBrand, logout, isSuperAdmin } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">
      
      {/* Left: Mobile Toggle & Clean Dealership Branding */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Clean Unified Brand Identity */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Dhoot Group Logo" 
            className="h-10 w-10 object-contain rounded-2xl shrink-0"
          />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-slate-900 leading-none">
                {currentBrand.name}
              </span>
              <span
                style={{ backgroundColor: `${currentBrand.primaryColor}15`, color: currentBrand.primaryColor }}
                className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md"
              >
                {currentBrand.shortName}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
              Dhoot Group • Automotive Enterprise
            </span>
          </div>
        </div>
      </div>

      {/* Right: 3-Way Brand Switcher (All / Tata / Hyundai), Notifications, User Info & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        
        {/* 3-Way Brand Switcher for Super Admin / Dual Brand Staff */}
        {(isSuperAdmin || user?.hasDualBrandAccess || user?.brand === 'ALL') && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            
            {/* 1. All Brands */}
            <button
              onClick={() => setBrand('DHOOT-ALL')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentBrand.code === 'DHOOT-ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>All Brands</span>
            </button>

            {/* 2. Autoprime Tata */}
            <button
              onClick={() => setBrand('DHOOT-TATA')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                currentBrand.code === 'DHOOT-TATA'
                  ? 'bg-[#1A3A6B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tata
            </button>

            {/* 3. Raja Hyundai */}
            <button
              onClick={() => setBrand('DHOOT-HYUNDAI')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                currentBrand.code === 'DHOOT-HYUNDAI'
                  ? 'bg-[#002C6C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hyundai
            </button>
          </div>
        )}

        {/* Notification Bell */}
        <button 
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors relative cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Info Badge */}
        <div className="hidden md:block text-right">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1 justify-end">
            <span>{user?.userName || user?.employeeId || 'STAFF'}</span>
            {isSuperAdmin && (
              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-extrabold rounded">
                ADMIN
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold">
            {user?.designation || user?.role?.replace('_', ' ') || 'Officer'} • {user?.userCode || 'DG001'}
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors text-xs font-bold cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};