import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bookmark, Car, ClipboardCheck, ShieldCheck } from 'lucide-react';

const items = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Bookings', path: '/bookings', icon: Bookmark },
  { label: 'Stock', path: '/vehicles', icon: Car },
  { label: 'Inspect', path: '/pdi', icon: ClipboardCheck },
  { label: 'Quality', path: '/qa', icon: ShieldCheck },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 h-14 bg-surface border-t border-line flex items-stretch z-30 pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          location.pathname === item.path ||
          (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center gap-1 ${
              active ? 'text-accent' : 'text-ink-3'
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
            <span className="text-xs leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
