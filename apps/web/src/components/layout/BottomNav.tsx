import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bookmark, Car, CheckSquare, Wrench, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { currentBrand } = useAuth();

  const mobileNavItems = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', path: '/bookings', icon: Bookmark },
    { label: 'Stock', path: '/vehicles', icon: Car },
    { label: 'PDI Queue', path: '/pdi', icon: CheckSquare },
    { label: 'Repairs', path: '/repairs', icon: Wrench },
    { label: 'QA Desk', path: '/qa', icon: ShieldCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-[#E2E8F0] px-1 flex items-center justify-around z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-bottom">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              color: isActive ? currentBrand.primaryColor : undefined,
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
              isActive ? 'font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-xl ${isActive ? 'bg-slate-100' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};