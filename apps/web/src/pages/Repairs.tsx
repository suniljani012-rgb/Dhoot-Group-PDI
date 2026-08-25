import React, { useState, useEffect } from 'react';
import { 
  Wrench, AlertTriangle, CheckCircle2, Clock, Check, 
  Search, Filter, Plus, FileSpreadsheet, ChevronRight,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';

const SEED_REPAIRS = [
  { id: 'rep-1', vin: 'MAT612345N1234563', model: 'Tata Nexon', issueType: 'ELECTRICAL', severity: 'MAJOR', description: 'Infotainment display blank on cold start & rear wiper motor loose connection', assignedTo: 'Suresh Patil (Senior Electrician)', status: 'IN_PROGRESS', createdAt: '2026-08-25T09:30:00Z', brand: 'TATA' },
  { id: 'rep-2', vin: 'MALC12345V3344553', model: 'Hyundai Verna', issueType: 'BODY_PAINT', severity: 'MINOR', description: 'Minor scratch on left rear quarter panel during transit unloading', assignedTo: 'Kishore Mali (Paint Specialist)', status: 'IN_PROGRESS', createdAt: '2026-08-25T10:15:00Z', brand: 'HYUNDAI' }
];

export const RepairsPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairs();
  }, [currentBrand?.code]);

  const getFilteredRepairs = (data: any[]) => {
    if (currentBrand.code === 'DHOOT-TATA') return data.filter((r: any) => r.brand === 'TATA' || (r.model && r.model.includes('Tata')));
    if (currentBrand.code === 'DHOOT-HYUNDAI') return data.filter((r: any) => r.brand === 'HYUNDAI' || (r.model && r.model.includes('Hyundai')));
    return data; // ALL returns both Tata and Hyundai
  };

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/v1/repairs'));
      if (res.ok) {
        const json = await res.json();
        const rows = json.data || [];
        if (rows.length > 0) {
          setTickets(getFilteredRepairs(rows));
          setLoading(false);
          return;
        }
      }
      setTickets(getFilteredRepairs(SEED_REPAIRS));
    } catch (e) {
      setTickets(getFilteredRepairs(SEED_REPAIRS));
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id: string) => {
    try {
      await fetch(getApiUrl(`/api/v1/repairs/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      fetchRepairs();
    } catch (e) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'COMPLETED' } : t))
      );
    }
  };

  const filteredTickets = tickets.filter(t => {
    const vin = (t.vin || '').toLowerCase();
    const model = (t.model || '').toLowerCase();
    const tech = (t.assignedTo || t.assigned_to || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = vin.includes(search) || model.includes(search) || tech.includes(search) || desc.includes(search);
    
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
          <h1 className="text-base font-black text-slate-900 leading-tight">
            Workshop Defect & Rectification Queue
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Defect repair tickets triggered automatically from inspection findings
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
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    <div className="space-y-1">
                      <FolderOpen className="w-6 h-6 mx-auto text-slate-300" />
                      <div className="font-bold text-slate-600">0 Active Repair Tickets in Database</div>
                      <p className="text-[11px]">All vehicle inspections have passed without defects requiring workshop repair.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
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
                      {t.area || t.finding_area || 'General'}
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
                      {t.assignedTo || t.assigned_to || 'Technician'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {t.bay || 'Bay 1'}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredTickets.length} repair records</span>
          <span className="text-slate-500 font-medium">Workshop Bodyshop Division</span>
        </div>

      </div>

    </div>
  );
};
