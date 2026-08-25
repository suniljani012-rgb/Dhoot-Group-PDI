import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Bookmark, Car, CheckSquare, Wrench, 
  ShieldCheck, FileText, FileCheck, ChevronRight, Building2,
  Truck, BarChart3, Database, Shield, Settings, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { currentBrand, user } = useAuth();

  const navItems = [
    { label: 'Operations Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Yard Inward & Receiving', path: '/receiving', icon: Truck, count: 14 },
    { label: 'Vehicle Stock Ledger', path: '/vehicles', icon: Car, count: 184 },
    { label: 'PDI Inspection Queue', path: '/pdi', icon: CheckSquare, count: 28 },
    { label: 'QA Review & Approvals', path: '/qa', icon: ShieldCheck, count: 8 },
    { label: 'Customer Bookings', path: '/bookings', icon: Bookmark, count: 96 },
    { label: 'Workshop Rectification', path: '/repairs', icon: Wrench, count: 6 },
    { label: 'Challans & Invoicing', path: '/invoicing', icon: FileText },
    { label: 'PDI Certificates', path: '/certificates/cert-101', icon: FileCheck },
    { label: 'Dealership Admin HQ', path: '/admin', icon: Building2 },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col shrink-0 h-full border-r border-slate-200 shadow-xs select-none">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Dhoot Group Logo"
            className="h-9 w-9 object-contain rounded-xl shrink-0 border border-slate-200 bg-white p-0.5"
          />
          <div className="overflow-hidden">
            <div className="text-xs font-black text-slate-900 truncate tracking-tight">
              {currentBrand.name}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate mt-0.5">
              Dhoot Group Automobile ERP
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 uppercase text-[10px] font-bold text-slate-400 tracking-wider">
        Enterprise Modules
      </div>

      {/* Navigation Links (Clean Light Enterprise Styling) */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
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
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
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
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-300 font-mono">
              {user?.userCode ? user.userCode.substring(0, 2) : 'DG'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">{user?.userName || user?.employeeId || 'Staff Member'}</div>
              <div className="text-[10px] text-slate-500 font-medium truncate">
                {user?.designation || user?.role?.replace('_', ' ') || 'Engineer'} ({user?.userCode || 'DG001'})
              </div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active Connection" />
        </div>
      </div>

    </aside>
  );
};