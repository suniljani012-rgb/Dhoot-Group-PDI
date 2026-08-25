import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Bookmark, Car, CheckSquare, Wrench, 
  ShieldCheck, FileText, FileCheck, ChevronRight, Users, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { currentBrand, user, isSuperAdmin } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Bookings Tracking', path: '/bookings', icon: Bookmark },
    { label: 'Vehicle Stock', path: '/vehicles', icon: Car },
    { label: 'PDI Inspections', path: '/pdi', icon: CheckSquare },
    { label: 'Workshop Repairs', path: '/repairs', icon: Wrench },
    { label: 'QA Approvals', path: '/qa', icon: ShieldCheck },
    { label: 'Challans & Invoicing', path: '/invoicing', icon: FileText },
    { label: 'PDI Certificates', path: '/certificates/cert-101', icon: FileCheck },
    { label: 'Admin User Desk', path: '/admin/users', icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 h-full border-r border-slate-800">
      
      {/* Brand Profile Section */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <img
            src={currentBrand.logoUrl}
            alt={currentBrand.name}
            className="h-10 w-10 object-contain rounded-xl bg-white p-0.5 border border-slate-700"
          />
          <div className="overflow-hidden">
            <div className="text-sm font-black text-white truncate">{currentBrand.name}</div>
            <span
              style={{ color: currentBrand.accentColor || '#38BDF8' }}
              className="text-[10px] font-bold uppercase tracking-wider block"
            >
              {currentBrand.tagline}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 uppercase text-[10px] font-extrabold text-slate-500 tracking-wider">
        Operations Menu
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              style={{
                backgroundColor: isActive ? currentBrand.primaryColor : undefined,
              }}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                isActive 
                  ? 'text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User / Station Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {user?.userCode ? user.userCode.substring(0, 2) : 'DG'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.userName || user?.employeeId || 'STAFF'}</div>
              <div className="text-[10px] text-slate-400 font-medium truncate">
                {user?.designation || user?.role?.replace('_', ' ') || 'Staff'} ({user?.userCode || 'DG001'})
              </div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
        </div>
      </div>
    </aside>
  );
};