import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, Bell, Search } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

const initials = (name?: string, fallback = 'SA') => {
  if (!name?.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

const brands = [
  { code: 'DHOOT-ALL', label: 'All' },
  { code: 'DHOOT-TATA', label: 'Tata' },
  { code: 'DHOOT-HYUNDAI', label: 'Hyundai' },
] as const;

export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { user, currentBrand, setBrand, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-14 bg-surface border-b border-line px-3 sm:px-4 flex items-center gap-4 shrink-0 shadow-xs relative z-20">
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden -ml-1 p-2 rounded text-ink-2 hover:bg-canvas"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
      </button>

      {/* Brand mark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="p-1 bg-accent-soft/80 border border-accent/20 rounded-md">
          <img src="/logo.png" alt="" className="h-5 w-5 object-contain" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold tracking-[-0.015em] text-ink">Dhoot Group</span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider text-accent bg-accent-soft px-1.5 py-0.2 rounded-chip border border-accent/20">PDI Enterprise</span>
        </div>
      </div>

      {/* Franchise scope with vivid active highlight */}
      <div className="hidden sm:flex items-center h-7 p-0.5 bg-canvas border border-line rounded ml-2">
        {brands.map((b) => {
          const active = currentBrand.code === b.code;
          return (
            <button
              key={b.code}
              onClick={() => setBrand(b.code as any)}
              className={`h-6 px-3 rounded-chip text-xs font-semibold transition-all cursor-pointer ${
                active 
                  ? 'bg-accent text-white shadow-xs font-bold' 
                  : 'text-ink-3 hover:text-ink hover:bg-surface'
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      <button
        className="hidden md:flex items-center gap-2 h-7 pl-2.5 pr-8 bg-canvas border border-line rounded text-xs text-ink-3 hover:border-line-strong hover:bg-surface transition-all"
        title="Search VIN, booking or customer"
      >
        <Search className="w-3.5 h-3.5 text-accent" />
        <span>Search VIN or booking...</span>
      </button>

      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="p-1.5 rounded text-ink-2 hover:bg-canvas hover:text-accent relative transition-colors"
          aria-label="Alerts"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-surface animate-pulse" />
        </button>
        <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      <div className="flex items-center gap-2.5 pl-3 border-l border-line">
        <div className="w-7 h-7 rounded bg-gradient-to-tr from-accent to-[#254D8C] text-white text-xs font-bold flex items-center justify-center shadow-xs">
          {initials(user?.userName || user?.employeeId)}
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="text-xs font-semibold text-ink">{user?.userName || 'Administrator'}</div>
          <div className="text-[11px] text-accent font-medium">{user?.designation || 'System Admin'}</div>
        </div>
      </div>

      <button
        onClick={logout}
        className="p-1.5 rounded text-ink-3 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
        title="Sign out"
      >
        <LogOut className="w-[18px] h-[18px]" />
      </button>
    </header>
  );
};