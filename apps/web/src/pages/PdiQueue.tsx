import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, ChevronRight, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';
import { Panel, Stat, Badge, Bar, Empty, PageHeader } from '../components/ui/primitives';

export interface PdiInspectionItem {
  id: string;
  vin: string;
  brand: string;
  model: string;
  variant: string;
  color: string;
  yardLocation: string;
  inspector: string;
  progress: number;
  passed: number;
  failed: number;
  total: number;
  status: string;
  startedAt: string;
  elapsedTime: string;
}

export const PdiQueuePage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'PENDING' | 'DEFECTS'>('ALL');
  const [pdiSessions, setPdiSessions] = useState<PdiInspectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPdiQueue();
  }, [currentBrand?.code]);

  const mapPdi = (rows: any[]) => {
    return rows
      .filter((v: any) => v.status === 'PDI_PENDING' || v.status === 'PDI_IN_PROGRESS' || v.status === 'RECEIVED')
      .map((v: any) => ({
        id: v.id || v.vin,
        vin: v.vin,
        brand: v.brand || (v.vin?.startsWith('MAL') ? 'HYUNDAI' : 'TATA'),
        model: v.model || 'OEM Vehicle',
        variant: v.variant || 'Standard',
        color: v.color || 'White',
        yardLocation: v.location || 'Central Yard • Bay 1',
        inspector: v.inspector_name || 'Senior PDI Inspector',
        progress: v.status === 'PDI_IN_PROGRESS' ? 65 : 0,
        passed: v.status === 'PDI_IN_PROGRESS' ? 42 : 0,
        failed: 0,
        total: 64,
        status: v.status === 'RECEIVED' ? 'PENDING_START' : v.status,
        startedAt: '10:30 AM',
        elapsedTime: v.status === 'PDI_IN_PROGRESS' ? '24 mins' : 'Not Started'
      }));
  };

  const fetchPdiQueue = async () => {
    setLoading(true);
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      const res = await fetch(getApiUrl(`/api/v1/stock${orgParam}`));
      if (res.ok) {
        const json = await res.json();
        const rows = json.data || [];
        if (rows.length > 0) {
          setPdiSessions(mapPdi(rows));
          setLoading(false);
          return;
        }
      }
      setPdiSessions(mapPdi(getVehiclesForBrand(currentBrand.code)));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = pdiSessions.filter(s => {
    const matchesSearch = s.vin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && s.status === 'PDI_IN_PROGRESS';
    if (statusFilter === 'PENDING') return matchesSearch && s.status !== 'PDI_IN_PROGRESS';
    if (statusFilter === 'DEFECTS') return matchesSearch && s.failed > 0;
    return matchesSearch;
  });

  const inProgressCount = pdiSessions.filter(s => s.status === 'PDI_IN_PROGRESS').length;
  const pendingCount = pdiSessions.filter(s => s.status !== 'PDI_IN_PROGRESS').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* Header Banner */}
      <PageHeader
        title="PDI Inspection Queue"
        subtitle="Manage 64-point vehicle quality checklists, track inspector progress, and approve certifications"
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/receiving"
              className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-ink-3" />
              <span>Receive New Car</span>
            </Link>
            <button
              onClick={() => alert('Exporting PDI Inspection Queue to Excel CSV...')}
              className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-ok" />
              <span>Export Excel</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total In Queue" value={pdiSessions.length} note="Awaiting Certification" />
        <Stat label="In Inspection" value={inProgressCount} note="Engineers Active" tone="accent" />
        <Stat label="Pending Start" value={pendingCount} note="Bay Staged" tone="warn" />
        <Stat label="Defects Flagged" value={0} note="Zero Critical Blockers" tone="ok" />
      </div>

      {/* Main Inspection Table Panel */}
      <Panel
        title="Inspection Roster"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
              {(['ALL', 'IN_PROGRESS', 'PENDING', 'DEFECTS'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                      : 'text-ink-3 hover:text-ink-2'
                  }`}
                >
                  {tab === 'ALL' ? 'All Sessions' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, model, inspector..."
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
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Model & Variant</th>
                <th className="py-2.5 px-3">Colour</th>
                <th className="py-2.5 px-3">Assigned Inspector</th>
                <th className="py-2.5 px-3">Staging Bay</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 w-36">Checklist Progress</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <Empty title="0 Inspection Sessions Found" hint="Receive a carrier trailer at gate or import stock to start inspection." />
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s, idx) => {
                  const isHyundai = s.model.toLowerCase().includes('hyundai') || s.vin.startsWith('MAL');
                  return (
                    <tr key={s.id} className="hover:bg-canvas transition-colors">
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">
                        {s.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge tone="accent">{isHyundai ? 'Hyundai' : 'Tata'}</Badge>
                          <span className="font-medium text-ink">{s.model}</span>
                        </div>
                        <div className="text-[10px] text-ink-3">{s.variant}</div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {s.color}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {s.inspector}
                      </td>
                      <td className="py-2.5 px-3 text-ink">
                        {s.yardLocation}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={s.status === 'PDI_IN_PROGRESS' ? 'accent' : 'neutral'}>
                          {s.status === 'PDI_IN_PROGRESS' ? 'In Progress' : 'Pending Start'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] tnum">
                            <span className="text-ink-3">{s.passed}/{s.total}</span>
                            <span className="font-medium text-ink">{s.progress}%</span>
                          </div>
                          <Bar pct={s.progress} />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum text-[11px]">
                        {s.elapsedTime}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <Link
                          to={`/pdi/${s.id}`}
                          className="h-7 px-3 rounded bg-accent text-white hover:bg-accent-600 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                        >
                          <span>{s.progress > 0 ? 'Resume' : 'Start PDI'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
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
