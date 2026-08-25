import React, { useState } from 'react';
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, Check, 
  Search, Filter, Plus, FileSpreadsheet, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RepairsPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  const [tickets, setTickets] = useState([
    {
      id: 'REP-01',
      vin: 'MAT612345N1234567',
      model: 'Tata Nexon Fearless Plus',
      area: 'Front Bumper Assembly',
      severity: 'MAJOR',
      description: 'Panel gap mismatch near left headlamp assembly',
      priority: 'HIGH',
      status: 'OPEN',
      assignedTo: 'Vikram Singh (TECH-02)',
      createdAt: 'Today, 12:45 PM',
      bay: 'Workshop Bay 2',
    },
    {
      id: 'REP-02',
      vin: 'MAT612345P4455667',
      model: 'Tata Punch Creative iCNG',
      area: 'Interior AC Console',
      severity: 'CRITICAL',
      description: 'AC blower speed knob loose / erratic resistance',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      assignedTo: 'Suresh Patil (TECH-01)',
      createdAt: 'Today, 10:20 AM',
      bay: 'Workshop Bay 1',
    },
    {
      id: 'REP-03',
      vin: 'MALC12345V5566778',
      model: 'Hyundai Venue N Line N8',
      area: 'Rear Tailgate Paint',
      severity: 'MINOR',
      description: 'Minor transit clear-coat scuff on bottom left lip',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: 'Anand Kumar (TECH-03)',
      createdAt: 'Today, 09:15 AM',
      bay: 'Detailing Bay',
    },
    {
      id: 'REP-04',
      vin: 'MAT612345H7654321',
      model: 'Tata Harrier Fearless Dark',
      area: 'Infotainment Bluetooth',
      severity: 'MINOR',
      description: 'Firmware sync glitch resolved with OTA re-flash',
      priority: 'LOW',
      status: 'COMPLETED',
      assignedTo: 'Vikram Singh (TECH-02)',
      createdAt: 'Yesterday, 04:30 PM',
      bay: 'Electrical Bay',
    }
  ]);

  const markComplete = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'COMPLETED' } : t))
    );
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.vin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'OPEN') return matchesSearch && t.status === 'OPEN';
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && t.status === 'IN_PROGRESS';
    if (statusFilter === 'COMPLETED') return matchesSearch && t.status === 'COMPLETED';
    return matchesSearch;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case 'MAJOR': return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 leading-tight">
            Workshop Defect & Rectification Queue
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Defect repair tickets triggered automatically from failed inspection points
          </p>
        </div>

        <button
          onClick={() => alert('Exporting workshop repair ledger to CSV...')}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Dense Excel-Style Repairs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  statusFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search VIN, Model, Defect, Tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Excel Data Grid */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">VIN Number</th>
                <th className="py-2.5 px-3">Vehicle Model</th>
                <th className="py-2.5 px-3">Defect Area</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Issue Description</th>
                <th className="py-2.5 px-3">Assigned Tech</th>
                <th className="py-2.5 px-3">Workshop Bay</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {t.id}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                    {t.vin}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {t.model}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {t.area}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border ${getSeverityBadge(t.severity)}`}>
                      {t.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={t.description}>
                    {t.description}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-semibold">
                    {t.assignedTo}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {t.bay}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {t.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => markComplete(t.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Repaired</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> QA Ready
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredTickets.length} workshop rectification tickets</span>
          <span className="font-mono text-slate-500">Live Workshop Telemetry</span>
        </div>

      </div>

    </div>
  );
};
