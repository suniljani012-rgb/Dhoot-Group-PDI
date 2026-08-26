import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Bookmark, Car, CheckSquare, Wrench, 
  ShieldCheck, FileText, FileCheck, ChevronRight, Building2,
  Truck, Shield, Settings, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFleetCounts } from '../../hooks/useFleetCounts';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { currentBrand, user, isSuperAdmin } = useAuth();
  const counts = useFleetCounts();

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

  // Dynamic modules with real live database counts
  const allNavItems = [
    { 
      label: 'Operations Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard,
      roles: ['ALL'] 
    },
    { 
      label: 'Yard Inward & Receiving', 
      path: '/receiving', 
      icon: Truck, 
      count: counts.receivingPending,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'YARD_MANAGER', 'PDI_ENGINEER'] 
    },
    { 
      label: 'Vehicle Stock Ledger', 
      path: '/vehicles', 
      icon: Car, 
      count: counts.totalStock,
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      roles: ['ALL'] 
    },
    { 
      label: 'Vehicle Inspections', 
      path: '/pdi', 
      icon: CheckSquare, 
      count: counts.pdiPending,
      badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
      roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'YARD_MANAGER', 'PDI_ENGINEER', 'QA_MANAGER'] 
    },
    { 
      label: 'Quality Approvals', 
      path: '/qa', 
      icon: ShieldCheck, 
      count: counts.qaPending,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'QA_MANAGER'] 
    },
    { 
      label: 'Customer Bookings', 
      path: '/bookings', 
      icon: Bookmark, 
      count: counts.totalBookings,
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'SALES_CONSULTANT', 'ACCOUNTS_EXECUTIVE'] 
    },
    { 
      label: 'Workshop & Rectification', 
      path: '/repairs', 
      icon: Wrench, 
      count: counts.inRepair,
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'WORKSHOP_SUPERVISOR', 'PDI_ENGINEER'] 
    },
    { 
      label: 'Challans & Invoicing', 
      path: '/invoicing', 
      icon: FileText,
      roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTS_EXECUTIVE', 'SALES_CONSULTANT'] 
    },
    { 
      label: 'Vehicle Certificates', 
      path: '/certificates/cert-101', 
      icon: FileCheck,
      roles: ['ALL'] 
    },
    { 
      label: 'Dealership Administration', 
      path: '/admin', 
      icon: Building2,
      roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER'] 
    },
  ];

  // Filter items based on user role
  const userRole = user?.role || 'SYSTEM_ADMIN';
  const navItems = allNavItems.filter(item => {
    if (isSuperAdmin || item.roles.includes('ALL')) return true;
    return item.roles.includes(userRole);
  });

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col shrink-0 h-full border-r border-slate-200 shadow-xs select-none">
      
      {/* Navigation Links with Live Database Counters */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                {item.count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : `${item.badgeColor || 'bg-slate-100 text-slate-600'} border`
                  }`}>
                    {item.count}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Station Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-300 font-mono tracking-wider">
              {getUserInitials(user?.userName || user?.employeeId, 'SA')}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">{user?.userName || user?.employeeId || 'System Administrator'}</div>
              <div className="text-[10px] text-slate-500 font-medium truncate">
                {user?.designation || user?.role?.replace('_', ' ') || 'Admin'} ({user?.userCode || 'DG001'})
              </div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Live Database Connection" />
        </div>
      </div>

    </aside>
  );
};