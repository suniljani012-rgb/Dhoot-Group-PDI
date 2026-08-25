import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#DEE2E8] px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <img 
          src="/logo.png" 
          alt="Autoprime Tata - Dhoot Group" 
          className="h-10 w-10 object-contain rounded-md"
        />
        <div>
          <h1 className="text-base font-bold text-[#1A1A2E] leading-none">AUTOPRIME TATA</h1>
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
            Dhoot Group PDI Platform
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-semibold text-[#1A1A2E]">{user?.employeeId || 'User'}</div>
          <div className="text-xs text-[#718096] uppercase font-medium">{user?.role || 'Staff'}</div>
        </div>
        <button
          onClick={logout}
          className="p-2 text-[#718096] hover:text-[#C62828] hover:bg-[#FEECEC] rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
