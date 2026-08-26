import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, ArrowRight, UserCheck, Car, Clock, 
  Search, Filter, Plus, ShieldCheck, CheckCircle2,
  Download, AlertTriangle, ChevronRight, FileSpreadsheet,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';

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
        status: v.status,
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
    
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && s.status === 'IN_PROGRESS';
    if (statusFilter === 'PENDING') return matchesSearch && s.status === 'PENDING_START';
    if (statusFilter === 'DEFECTS') return matchesSearch && s.failed > 0;
    return matchesSearch;
  });

  const getStatusBadge = (status: string, failed: number) => {
    if (failed > 0) return { text: `${failed} Defects Flagged`, class: 'bg-rose-50 text-rose-800 border-rose-200' };
    if (status === 'IN_PROGRESS') return { text: 'In Inspection', class: 'bg-blue-50 text-blue-800 border-blue-200 font-bold' };
    if (status === 'PENDING_START') return { text: 'Pending Start', class: 'bg-slate-100 text-slate-600 border-slate-200' };
    return { text: 'Ready', class: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">
            PDI Inspections
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active inspection sessions and technical quality checklists
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/receiving"
            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Receive New Car</span>
          </Link>
          <button
            onClick={() => alert('Exporting PDI Inspection Queue to Excel CSV...')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Excel Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        
        {/* Table Controls: Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            {(['ALL', 'IN_PROGRESS', 'PENDING', 'DEFECTS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  statusFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Sessions' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search VIN, Model, Inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Excel Data Grid */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN Number</th>
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
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    <div className="space-y-1">
                      <FolderOpen className="w-6 h-6 mx-auto text-slate-300" />
                      <div className="font-bold text-slate-600">0 Inspection Sessions in Database</div>
                      <p className="text-[11px]">Receive a carrier trailer at gate or import stock to start inspection.</p>
                      <Link
                        to="/receiving"
                        className="inline-flex items-center gap-1 text-slate-900 font-bold underline mt-2 text-xs"
                      >
                        <span>Go to Gate Receiving Desk</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s, idx) => {
                  const badge = getStatusBadge(s.status, s.failed);
                  const isHyundai = s.model.toLowerCase().includes('hyundai') || s.vin.startsWith('MAL');
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {s.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            isHyundai 
                              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' 
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {isHyundai ? 'Hyundai' : 'Tata'}
                          </span>
                          <span className="font-bold text-slate-900">{s.model}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">{s.variant}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {s.color}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{s.inspector}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {s.yardLocation}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.class}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500 font-semibold">{s.passed}/{s.total}</span>
                            <span className="font-bold text-slate-900">{s.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                s.failed > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${s.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                        {s.elapsedTime}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Link
                          to={`/pdi/${s.id}`}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-semibold transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>{s.progress > 0 ? 'Resume' : 'Start PDI'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredSessions.length} active sessions</span>
          <span className="text-slate-500 font-medium">Quality Inspection Authority</span>
        </div>

      </div>

    </div>
  );
};
