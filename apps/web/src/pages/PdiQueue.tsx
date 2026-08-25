import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, ArrowRight, UserCheck, Car, Clock, 
  Search, Filter, Plus, ShieldCheck, CheckCircle2,
  Download, AlertTriangle, ChevronRight, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PdiQueuePage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'PENDING' | 'DEFECTS'>('ALL');

  const pdiSessions = [
    {
      id: '88888888-8888-8888-8888-888888888881',
      vin: 'MAT612345S9988776',
      brand: 'TATA',
      model: 'Tata Safari Accomplished Plus 6S',
      variant: 'Dark Edition Kryotec AT',
      color: 'Oberon Black',
      yardLocation: 'Pune Yard (Bay 2)',
      inspector: 'Vikram Malhotra (DG002)',
      progress: 58,
      passed: 24,
      failed: 1,
      total: 42,
      status: 'IN_PROGRESS',
      startedAt: 'Today, 11:30 AM',
      elapsedTime: '45 mins',
    },
    {
      id: '88888888-8888-8888-8888-888888888882',
      vin: 'MAT612345H7654321',
      brand: 'TATA',
      model: 'Tata Harrier Fearless Plus Dark',
      variant: '2.0L Diesel 6MT',
      color: 'Oberon Black',
      yardLocation: 'Mumbai Yard (Bay 1)',
      inspector: 'Amit Verma (DG004)',
      progress: 15,
      passed: 6,
      failed: 0,
      total: 42,
      status: 'IN_PROGRESS',
      startedAt: 'Today, 12:15 PM',
      elapsedTime: '18 mins',
    },
    {
      id: '88888888-8888-8888-8888-888888888883',
      vin: 'MALC12345C1122334',
      brand: 'HYUNDAI',
      model: 'Hyundai Creta SX (O) Turbo DCT',
      variant: '1.5L Turbo Petrol 7DCT',
      color: 'Ranger Khaki',
      yardLocation: 'Nashik Yard (Bay 3)',
      inspector: 'Rahul Patil (DG007)',
      progress: 0,
      passed: 0,
      failed: 0,
      total: 42,
      status: 'PENDING_START',
      startedAt: 'Assigned 1h ago',
      elapsedTime: '-',
    },
    {
      id: '88888888-8888-8888-8888-888888888884',
      vin: 'MAT612345P4455667',
      brand: 'TATA',
      model: 'Tata Punch Creative DT',
      variant: '1.2L Revotron AMT',
      color: 'Calypso Red',
      yardLocation: 'Pune Yard (Bay 1)',
      inspector: 'Vikram Malhotra (DG002)',
      progress: 80,
      passed: 34,
      failed: 2,
      total: 42,
      status: 'DEFECTS_FOUND',
      startedAt: 'Today, 09:40 AM',
      elapsedTime: '1h 10m',
    }
  ];

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
    <div className="space-y-6 pb-20 select-none">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              Inspection Workstation
            </span>
            <span className="text-xs font-semibold text-slate-400">PDI Operations Sheet</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Active PDI Inspection Queue</h1>
          <p className="text-xs text-slate-500 font-medium">
            Excel-style operational queue for tracking ongoing and pending vehicle pre-delivery inspections.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/receiving"
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Receive New Car</span>
          </Link>
          <button
            onClick={() => alert('Exporting PDI Inspection Queue to Excel CSV...')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Excel Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        
        {/* Table Controls: Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['ALL', 'IN_PROGRESS', 'PENDING', 'DEFECTS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Sessions' : tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search VIN, Model, Inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Excel Data Grid */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">VIN Number</th>
                <th className="py-3 px-4">Model & Variant</th>
                <th className="py-3 px-4">Colour</th>
                <th className="py-3 px-4">Assigned Inspector</th>
                <th className="py-3 px-4">Staging Bay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 w-44">Checklist Progress</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredSessions.map((s) => {
                const badge = getStatusBadge(s.status, s.failed);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {s.vin}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.model}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{s.variant}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                        {s.color}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.inspector}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {s.yardLocation}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.class}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
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
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {s.elapsedTime}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to={`/pdi/${s.id}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>{s.progress > 0 ? 'Resume' : 'Start PDI'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Showing {filteredSessions.length} active sessions</span>
          <span className="text-slate-500 font-medium">Auto-synced with Yard Telemetry</span>
        </div>

      </div>

    </div>
  );
};
