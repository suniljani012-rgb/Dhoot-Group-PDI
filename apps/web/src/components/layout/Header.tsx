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
    <header className="h-14 bg-surface border-b border-line px-3 sm:px-4 flex items-center gap-4 shrink-0">
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden -ml-1 p-2 rounded text-ink-2 hover:bg-canvas"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
      </button>

      {/* Brand mark. The logo does the work: no tagline, no version badge. */}
      <div className="flex items-center gap-2.5 shrink-0">
        <img src="/logo.png" alt="" className="h-6 w-6 object-contain rounded-chip" />
        <span className="text-base font-semibold tracking-[-0.011em]">Dhoot Group</span>
      </div>

      {/* Franchise scope: a segmented control, not three differently-coloured buttons. */}
      <div className="hidden sm:flex items-center h-7 p-0.5 bg-canvas border border-line rounded ml-1">
        {brands.map((b) => {
          const active = currentBrand.code === b.code;
          return (
            <button
              key={b.code}
              onClick={() => setBrand(b.code as any)}
              className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors ${
                active ? 'bg-surface text-ink border border-line shadow-xs font-semibold' : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      <button
        className="hidden md:flex items-center gap-2 h-7 pl-2 pr-8 border border-line rounded text-xs text-ink-3 hover:border-line-strong transition-colors cursor-pointer"
        title="Search VIN, booking or customer"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search VIN or booking</span>
      </button>

      <div className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="p-1.5 rounded text-ink-2 hover:bg-canvas relative cursor-pointer"
          aria-label="Alerts"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full ring-2 ring-surface" />
        </button>
        <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      <div className="flex items-center gap-2 pl-3 border-l border-line">
        <div className="w-7 h-7 rounded bg-accent text-white text-xs font-medium flex items-center justify-center">
          {initials(user?.userName || user?.employeeId)}
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="text-xs font-medium">{user?.userName || 'Administrator'}</div>
          <div className="text-xs text-ink-3">{user?.designation || 'System admin'}</div>
        </div>
      </div>

      <button
        onClick={logout}
        className="p-1.5 rounded text-ink-3 hover:text-danger hover:bg-canvas transition-colors cursor-pointer"
        title="Sign out"
      >
        <LogOut className="w-[18px] h-[18px]" />
      </button>
    </header>
  );
};
