import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, CheckCircle2, AlertTriangle, Clock, Truck, Bookmark, 
  UserCheck, Wrench, ShieldCheck, ArrowRight, Plus, 
  TrendingUp, Calendar, Filter, Sparkles, Building, Layers,
  BarChart3, PieChart, Activity, Download, Search, ChevronRight,
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';

export const DashboardPage: React.FC = () => {
  const { currentBrand, user } = useAuth();
  const counts = useFleetCounts();
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | 'MTD'>('7D');
  const [tableFilter, setTableFilter] = useState<'ALL' | 'IN_TRANSIT' | 'PDI_PENDING' | 'APPROVED' | 'ALLOCATED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 8 High-Density KPI Metrics in a Single Compact Row Strip
  const kpis = [
    { label: 'Total Fleet', value: counts.totalStock, change: '+12%', isUp: true, link: '/vehicles', color: 'text-blue-700', bg: 'bg-blue-50/50' },
    { label: 'Receiving Pending', value: counts.receivingPending, change: '14 En-route', isUp: true, link: '/receiving', color: 'text-amber-700', bg: 'bg-amber-50/50', alert: true },
    { label: 'Yard Stock', value: counts.inYard, change: '86% Cap', isUp: true, link: '/vehicles', color: 'text-slate-800', bg: 'bg-slate-50' },
    { label: 'Inspection Pending', value: counts.pdiPending, change: '28 Ready', isUp: false, link: '/pdi', color: 'text-orange-700', bg: 'bg-orange-50/50', alert: true },
    { label: 'Quality Certified', value: counts.pdiDone, change: '94.8% Pass', isUp: true, link: '/pdi', color: 'text-emerald-700', bg: 'bg-emerald-50/50' },
    { label: 'Customer Bookings', value: counts.totalBookings, change: '+18 Orders', isUp: true, link: '/bookings', color: 'text-indigo-700', bg: 'bg-indigo-50/50' },
    { label: 'Allocated Units', value: counts.allocatedVehicles, change: '77% Tagged', isUp: true, link: '/bookings', color: 'text-purple-700', bg: 'bg-purple-50/50' },
    { label: 'In Workshop', value: counts.inRepair, change: '6 In Rep', isUp: false, link: '/repairs', color: 'text-rose-700', bg: 'bg-rose-50/50' }
  ];

  // 7-Day Live Velocity Chart Data
  const velocityData = [
    { day: 'Mon', inward: 12, inspected: 10, delivered: 4 },
    { day: 'Tue', inward: 18, inspected: 15, delivered: 6 },
    { day: 'Wed', inward: 14, inspected: 12, delivered: 5 },
    { day: 'Thu', inward: 22, inspected: 20, delivered: 8 },
    { day: 'Fri', inward: 16, inspected: 18, delivered: 9 },
    { day: 'Sat', inward: 24, inspected: 22, delivered: 14 },
    { day: 'Sun', inward: 8, inspected: 15, delivered: 10 },
  ];

  // Model-Wise Inventory Breakdown
  const modelBreakdown = [
    { name: 'Tata Safari', count: 42, target: 50, color: 'bg-blue-600' },
    { name: 'Tata Harrier', count: 36, target: 45, color: 'bg-indigo-600' },
    { name: 'Tata Nexon', count: 54, target: 60, color: 'bg-emerald-600' },
    { name: 'Tata Punch', count: 28, target: 35, color: 'bg-amber-600' },
    { name: 'Hyundai Creta', count: 16, target: 25, color: 'bg-purple-600' },
    { name: 'Hyundai Venue', count: 8, target: 15, color: 'bg-cyan-600' },
  ];

  // Live Operations Excel-Style Table Data
  const fleetOperations = [
    { id: '1', vin: 'MAT612345S9988776', brand: 'TATA', model: 'Tata Safari Accomplished Plus 6S', color: 'Oberon Black', status: 'PDI_IN_PROGRESS', stage: 'Step 2: Electricals (58%)', officer: 'Vikram Malhotra', bay: 'Bay 2', time: '12m ago' },
    { id: '2', vin: 'MAT612345H7654321', brand: 'TATA', model: 'Tata Harrier Fearless Plus Dark', color: 'Oberon Black', status: 'YARD_RECEIVING_PENDING', stage: 'In-Transit (Carrier #TR-4421)', officer: 'Ramesh Gate', bay: 'Gate Inward', time: '35m ago' },
    { id: '3', vin: 'MALC12345C1122334', brand: 'HYUNDAI', model: 'Hyundai Creta SX (O) Turbo DCT', color: 'Ranger Khaki', status: 'ALLOCATED', stage: 'Allocated to Sunil Jani', officer: 'Pooja Sales', bay: 'Bay 3', time: '1h ago' },
    { id: '4', vin: 'MAT612345N1234567', brand: 'TATA', model: 'Tata Nexon Fearless Plus S DT', color: 'Daytona Grey', status: 'PDI_APPROVED', stage: 'QA Passed (Cert #CERT-9981)', officer: 'Amit Inspector', bay: 'Bay 3', time: '2h ago' },
    { id: '5', vin: 'MAT612345P4455667', brand: 'TATA', model: 'Tata Punch Creative DT Petrol', color: 'Calypso Red', status: 'PDI_PENDING', stage: 'In Yard (Ready for Inspection)', officer: 'Unassigned', bay: 'Bay 1', time: '3h ago' },
    { id: '6', vin: 'MALC12345V5566778', brand: 'HYUNDAI', model: 'Hyundai Venue N Line N8 DCT', color: 'Atlas White', status: 'IN_REPAIR', stage: 'Bumper Buffing (Workshop)', officer: 'Sanjay Tech', bay: 'Bay 4', time: '4h ago' }
  ];

  const filteredFleet = fleetOperations.filter(item => {
    const matchesSearch = item.vin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.officer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (tableFilter === 'IN_TRANSIT') return matchesSearch && item.status === 'YARD_RECEIVING_PENDING';
    if (tableFilter === 'PDI_PENDING') return matchesSearch && (item.status === 'PDI_PENDING' || item.status === 'PDI_IN_PROGRESS');
    if (tableFilter === 'APPROVED') return matchesSearch && item.status === 'PDI_APPROVED';
    if (tableFilter === 'ALLOCATED') return matchesSearch && item.status === 'ALLOCATED';
    return matchesSearch;
  });

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'YARD_RECEIVING_PENDING': return { text: 'Receiving Pending', class: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'PDI_IN_PROGRESS': return { text: 'In Inspection', class: 'bg-blue-50 text-blue-800 border-blue-200 font-bold' };
      case 'PDI_PENDING': return { text: 'Inspection Pending', class: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'PDI_APPROVED': return { text: 'Certified Approved', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'ALLOCATED': return { text: 'Customer Allocated', class: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'IN_REPAIR': return { text: 'In Workshop', class: 'bg-rose-50 text-rose-800 border-rose-200' };
      default: return { text: status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 leading-tight">
            {currentBrand.name} Operations Command Center
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Real-time fleet lifecycle tracking from Plant Inward to Quality Certification & Customer Allocation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/receiving"
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-amber-700" />
            <span>Gate Inward</span>
          </Link>

          <Link
            to="/pdi"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inspection Desk</span>
          </Link>

          <Link
            to="/vehicles"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stock Ledger</span>
          </Link>
        </div>
      </div>

      {/* 2. Sleek Single-Row Metric Strip (8 Compact KPI Cells) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {kpis.map((k, i) => (
          <Link
            key={i}
            to={k.link}
            className={`p-3 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between group ${k.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{k.label}</span>
              {k.alert && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
            </div>

            <div className="mt-1">
              <div className={`text-xl font-bold font-mono ${k.color} group-hover:scale-105 transition-transform`}>
                {k.value}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                {k.change}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 3. High-Performance Live Charts Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Daily Movement Velocity Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <h2 className="text-xs font-bold text-slate-900">Daily Fleet Velocity (Units / Day)</h2>
              </div>
              <p className="text-[11px] text-slate-400">Gate Inward vs Inspection Completed vs Delivered</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              {(['7D', '30D', 'MTD'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setChartTimeframe(t)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    chartTimeframe === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Compact Bar Chart */}
          <div className="pt-1">
            <div className="h-44 flex items-end justify-between gap-3 px-2">
              {velocityData.map((item, i) => {
                const maxVal = 26;
                const inHeight = Math.round((item.inward / maxVal) * 100);
                const pdiHeight = Math.round((item.inspected / maxVal) * 100);
                const delHeight = Math.round((item.delivered / maxVal) * 100);

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] py-1 px-2 rounded-lg pointer-events-none shadow-lg z-20 whitespace-nowrap font-mono">
                      Inward: {item.inward} | Inspected: {item.inspected} | Del: {item.delivered}
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div style={{ height: `${inHeight}%` }} className="w-2 bg-amber-400 hover:bg-amber-500 rounded-t transition-all" />
                      <div style={{ height: `${pdiHeight}%` }} className="w-2 bg-blue-600 hover:bg-blue-700 rounded-t transition-all" />
                      <div style={{ height: `${delHeight}%` }} className="w-2 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all" />
                    </div>

                    <span className="text-[10px] font-semibold text-slate-500 font-mono">{item.day}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" />
                <span className="text-slate-600">Gate Inward</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
                <span className="text-slate-600">Inspection Done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                <span className="text-slate-600">Delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Model Distribution & Quality Metric (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">Model Stock Breakdown</h2>
                <p className="text-[11px] text-slate-400">Inventory volume vs Yard Allocation Target</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">{counts.totalStock} Total</span>
            </div>

            <div className="space-y-2.5 mt-3">
              {modelBreakdown.map((m, idx) => {
                const pct = Math.round((m.count / m.target) * 100);
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{m.name}</span>
                      <span className="font-mono text-slate-500">{m.count} / {m.target} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div style={{ width: `${Math.min(pct, 100)}%` }} className={`h-1.5 rounded-full ${m.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase text-emerald-800 tracking-wider">Quality Metric</span>
              <div className="text-sm font-bold text-emerald-950">94.8% First-Pass Inspection Rate</div>
            </div>
            <span className="text-xs font-bold font-mono text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-md">
              ✓ Optimal
            </span>
          </div>
        </div>

      </div>

      {/* 4. Full-Width Dense Excel-Style Telemetry Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900">Live Vehicle Fleet Telemetry</h2>
            <p className="text-[11px] text-slate-400">Authoritative operations ledger with stage tracking</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
              {(['ALL', 'IN_TRANSIT', 'PDI_PENDING', 'APPROVED', 'ALLOCATED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTableFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    tableFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, Model, Officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Excel Data Grid */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">VIN Number</th>
                <th className="py-2.5 px-3">Brand / Model</th>
                <th className="py-2.5 px-3">Colour</th>
                <th className="py-2.5 px-3">Status Tag</th>
                <th className="py-2.5 px-3">Current Stage</th>
                <th className="py-2.5 px-3">Bay</th>
                <th className="py-2.5 px-3">Assigned Personnel</th>
                <th className="py-2.5 px-3">Updated</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
              {filteredFleet.map((row) => {
                const tag = getStatusTag(row.status);
                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {row.vin}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{row.model}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.brand} OEM</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                        {row.color}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${tag.class}`}>
                        {tag.text}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {row.stage}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {row.bay}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {row.officer}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                      {row.time}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.status === 'YARD_RECEIVING_PENDING' ? (
                        <Link
                          to="/receiving"
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition-all inline-block shadow-xs"
                        >
                          Receive
                        </Link>
                      ) : row.status === 'PDI_APPROVED' ? (
                        <Link
                          to="/certificates/cert-101"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all inline-block shadow-xs"
                        >
                          Certificate
                        </Link>
                      ) : (
                        <Link
                          to="/pdi/88888888-8888-8888-8888-888888888881"
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 shadow-xs"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredFleet.length} active fleet units</span>
          <Link to="/vehicles" className="text-slate-900 font-bold hover:underline inline-flex items-center gap-1">
            <span>View Full 21-Column Stock Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
};
