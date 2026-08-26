import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Car, ClipboardCheck, ShieldCheck,
  Bookmark, Wrench, Receipt, FileCheck, Settings2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

/**
 * Labels are one word wherever one word is unambiguous.
 * "Yard Inward & Receiving" told you how the system was built; "Inward" tells
 * a yard manager what he is about to open.
 */
export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { user, isSuperAdmin } = useAuth();

  const groups: {
    heading: string;
    items: { label: string; path: string; icon: any; roles: string[] }[];
  }[] = [
    {
      heading: 'Operations',
      items: [
        { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['ALL'] },
        { label: 'Inward', path: '/receiving', icon: Truck, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'YARD_MANAGER', 'PDI_ENGINEER'] },
        { label: 'Stock', path: '/vehicles', icon: Car, roles: ['ALL'] },
        { label: 'Inspections', path: '/pdi', icon: ClipboardCheck, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'YARD_MANAGER', 'PDI_ENGINEER', 'QA_MANAGER'] },
        { label: 'Quality', path: '/qa', icon: ShieldCheck, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'QA_MANAGER'] },
        { label: 'Workshop', path: '/repairs', icon: Wrench, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'WORKSHOP_SUPERVISOR', 'PDI_ENGINEER'] },
      ],
    },
    {
      heading: 'Sales',
      items: [
        { label: 'Bookings', path: '/bookings', icon: Bookmark, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'SALES_CONSULTANT', 'ACCOUNTS_EXECUTIVE'] },
        { label: 'Invoicing', path: '/invoicing', icon: Receipt, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTS_EXECUTIVE', 'SALES_CONSULTANT'] },
        { label: 'Certificates', path: '/certificates/cert-101', icon: FileCheck, roles: ['ALL'] },
      ],
    },
    {
      heading: 'Setup',
      items: [
        { label: 'Administration', path: '/admin', icon: Settings2, roles: ['SYSTEM_ADMIN', 'BRANCH_MANAGER'] },
      ],
    },
  ];

  const role = user?.role || 'SYSTEM_ADMIN';
  const allowed = (roles: string[]) => isSuperAdmin || roles.includes('ALL') || roles.includes(role);

  return (
    <aside className="w-56 bg-surface flex flex-col h-full border-r border-line">
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {groups.map((group) => {
          const items = group.items.filter((i) => allowed(i.roles));
          if (!items.length) return null;

          return (
            <div key={group.heading} className="mb-5 last:mb-0">
              <div className="eyebrow px-2.5 mb-1.5">{group.heading}</div>

              {items.map((item) => {
                const Icon = item.icon;
                const active =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 h-8 px-2.5 rounded text-sm transition-colors ${
                      active
                        ? 'bg-accent-soft text-accent font-medium'
                        : 'text-ink-2 hover:bg-canvas hover:text-ink'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-accent' : 'text-ink-3'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="px-4 h-9 flex items-center border-t border-line">
        <span className="w-1.5 h-1.5 rounded-full bg-ok mr-2 shrink-0" />
        <span className="text-xs text-ink-3">Synced</span>
      </div>
    </aside>
  );
};
