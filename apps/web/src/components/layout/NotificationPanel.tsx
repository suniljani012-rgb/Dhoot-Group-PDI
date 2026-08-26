import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, Check, Trash2, X, Truck, CheckSquare, 
  AlertTriangle, Bookmark, FileCheck, ChevronRight, 
  Clock, ShieldAlert, Sparkles 
} from 'lucide-react';

export interface DealershipNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'INWARD' | 'INSPECTION' | 'DEFECT' | 'BOOKING' | 'CERTIFICATE';
  isUnread: boolean;
  link: string;
  actionText: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ACTION'>('ALL');
  const [notifications, setNotifications] = useState<DealershipNotification[]>([
    {
      id: 'notif-1',
      title: 'Carrier Trailer Arrived at Gate',
      message: 'Trailer MH-12-TR-4421 arrived with 8 Tata units (Safari & Harrier). Awaiting paper PDI verification & unloading.',
      time: '10m ago',
      type: 'INWARD',
      isUnread: true,
      link: '/receiving',
      actionText: 'Receive at Gate',
      priority: 'HIGH'
    },
    {
      id: 'notif-2',
      title: 'Vehicle Inspection Submitted for QA',
      message: 'Vikram Malhotra completed 6-step inspection for Tata Safari (MAT612345S9988776). 0 defects found.',
      time: '25m ago',
      type: 'INSPECTION',
      isUnread: true,
      link: '/qa',
      actionText: 'Review & Sign-Off',
      priority: 'NORMAL'
    },
    {
      id: 'notif-3',
      title: 'Defect Flagged in Workshop',
      message: 'Rear bumper scratch reported during Tata Punch inspection (Bay 1). Minor buffing required.',
      time: '1h ago',
      type: 'DEFECT',
      isUnread: true,
      link: '/repairs',
      actionText: 'View Repair Ticket',
      priority: 'HIGH'
    },
    {
      id: 'notif-4',
      title: 'New Customer Booking Created',
      message: 'Booking voucher #BK-8841 generated for Sunil Jani (Hyundai Creta SX Turbo). Ready for chassis allocation.',
      time: '2h ago',
      type: 'BOOKING',
      isUnread: true,
      link: '/bookings',
      actionText: 'Allocate Stock',
      priority: 'NORMAL'
    },
    {
      id: 'notif-5',
      title: 'Digital Certificate Issued',
      message: 'Tamper-evident PDI certificate #CERT-9981 officially issued for Tata Nexon Fearless.',
      time: '4h ago',
      type: 'CERTIFICATE',
      isUnread: false,
      link: '/certificates/cert-101',
      actionText: 'Download Certificate',
      priority: 'LOW'
    }
  ]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'UNREAD') return n.isUnread;
    if (filter === 'ACTION') return n.priority === 'HIGH';
    return true;
  });

  const getIcon = (type: DealershipNotification['type']) => {
    switch (type) {
      case 'INWARD': return <Truck className="w-4 h-4 text-amber-700" />;
      case 'INSPECTION': return <CheckSquare className="w-4 h-4 text-blue-700" />;
      case 'DEFECT': return <AlertTriangle className="w-4 h-4 text-rose-700" />;
      case 'BOOKING': return <Bookmark className="w-4 h-4 text-indigo-700" />;
      case 'CERTIFICATE': return <FileCheck className="w-4 h-4 text-emerald-700" />;
    }
  };

  const getBg = (type: DealershipNotification['type']) => {
    switch (type) {
      case 'INWARD': return 'bg-amber-50 border-amber-200';
      case 'INSPECTION': return 'bg-blue-50 border-blue-200';
      case 'DEFECT': return 'bg-rose-50 border-rose-200';
      case 'BOOKING': return 'bg-indigo-50 border-indigo-200';
      case 'CERTIFICATE': return 'bg-emerald-50 border-emerald-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Right Flyout Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-800">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Operations Feed</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Live dealership alerts & stage updates</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Tabs & Bulk Actions */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
              {(['ALL', 'UNREAD', 'ACTION'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'ACTION' ? 'High Priority' : tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Dense Row-Style Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-semibold">No notifications in this filter</p>
                <span className="text-[11px] text-slate-400">You are all caught up!</span>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 group relative cursor-pointer ${
                    n.isUnread ? 'bg-blue-50/20' : 'bg-white'
                  }`}
                >
                  {/* Left Icon Pill */}
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getBg(n.type)}`}>
                    {getIcon(n.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {n.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {n.message}
                    </p>

                    {/* Action Button */}
                    <div className="pt-1 flex items-center justify-between">
                      <Link
                        to={n.link}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent hover:bg-accent-600 text-white text-[10px] font-semibold transition-colors shadow-xs"
                      >
                        <span>{n.actionText}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>

                      {n.isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Automated Telemetry Stream</span>
            <span className="font-mono text-[10px]">Real-time Active</span>
          </div>

        </div>
      </div>
    </div>
  );
};
