import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, CheckSquare, Wrench, ShieldCheck, Users, Building2 } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Vehicles & Queue', path: '/vehicles', icon: Car },
    { label: 'PDI Inspections', path: '/pdi', icon: CheckSquare },
    { label: 'Repairs & Workshop', path: '/repairs', icon: Wrench },
    { label: 'QA Approvals', path: '/qa', icon: ShieldCheck },
    { label: 'User Directory', path: '/users', icon: Users },
    { label: 'Branch Settings', path: '/branches', icon: Building2 },
  ];

  return (
    <aside className="w-64 bg-[#1A1A2E] text-white flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 uppercase text-xs font-bold text-[#718096] tracking-wider">
        Operations Menu
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-[#1A3A6B] text-white' 
                  : 'text-[#DEE2E8] hover:bg-[#2C2C44] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
