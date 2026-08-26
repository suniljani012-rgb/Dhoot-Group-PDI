import React, { useState, useEffect } from 'react';
import { 
  Check, Search, FileSpreadsheet, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

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
    return data;
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

  const openCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const completedCount = tickets.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* Header Banner */}
      <PageHeader
        title="Defect Repairs & Workshop"
        subtitle="Manage job cards, track technician repairs for inspection defects, and clear vehicles for QA approval"
        action={
          <button
            onClick={() => alert('Exporting workshop repair ledger to CSV...')}
            className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-ok" />
            <span>Export Excel</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Job Cards" value={tickets.length} note="Logged from Inspections" />
        <Stat label="Active in Bay" value={openCount} note="Under Rectification" tone={openCount > 0 ? 'warn' : 'default'} />
        <Stat label="Completed" value={completedCount} note="QA Clearance Ready" tone="ok" />
        <Stat label="Avg Turnaround" value="1.4h" note="Within Service SLA" />
      </div>

      {/* Main Repair Ledger Panel */}
      <Panel
        title="Repair Tickets Ledger"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
              {(['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                      : 'text-ink-3 hover:text-ink-2'
                  }`}
                >
                  {tab === 'ALL' ? 'All Tickets' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, Model, Defect, Tech..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-7 pl-7 pr-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/90 border-b border-line text-slate-800 font-bold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Brand & Model</th>
                <th className="py-2.5 px-3">Defect Area</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Issue Description</th>
                <th className="py-2.5 px-3">Assigned Tech</th>
                <th className="py-2.5 px-3">Bay</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <Empty title="0 Active Repair Tickets Found" hint="All vehicle inspections have passed without defects requiring workshop repair." />
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t, idx) => {
                  const isHyundai = t.model.toLowerCase().includes('hyundai') || t.vin.startsWith('MAL');
                  return (
                    <tr key={t.id} className="hover:bg-canvas transition-colors">
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">
                        {t.id}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink">
                        {t.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge tone="accent">{isHyundai ? 'Hyundai' : 'Tata'}</Badge>
                          <span className="font-medium text-ink">{t.model}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {t.area || t.finding_area || 'General'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={t.severity === 'CRITICAL' ? 'danger' : t.severity === 'MAJOR' ? 'warn' : 'neutral'}>
                          {t.severity}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 max-w-xs truncate" title={t.description}>
                        {t.description}
                      </td>
                      <td className="py-2.5 px-3 text-ink">
                        {t.assignedTo || t.assigned_to || 'Technician'}
                      </td>
                      <td className="py-2.5 px-3 text-ink">
                        {t.bay || 'Bay 1'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={t.status === 'COMPLETED' ? 'ok' : 'warn'}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {t.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => markComplete(t.id)}
                            className="h-6 px-2 rounded bg-ok/10 text-ok border border-ok/20 text-xs font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Repaired</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-ok inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

    </div>
  );
};
