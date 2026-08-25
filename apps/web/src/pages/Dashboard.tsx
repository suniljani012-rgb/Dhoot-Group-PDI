import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, CheckCircle2, AlertTriangle, Clock, Truck, Bookmark, 
  UserCheck, Wrench, ShieldCheck, ArrowRight, Plus, 
  TrendingUp, Calendar, Filter, Sparkles, Building, Layers,
  BarChart3, PieChart, Activity, Download, Search, ChevronRight,
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { currentBrand, user } = useAuth();
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | 'MTD'>('7D');
  const [tableFilter, setTableFilter] = useState<'ALL' | 'IN_TRANSIT' | 'PDI_PENDING' | 'APPROVED' | 'ALLOCATED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 8 Core Enterprise KPIs
  const kpiMetrics = [
    { title: 'Total Stock Fleet', count: '184', change: '+12% vs last mo', isUp: true, subtitle: 'Total units in system', icon: Car, bg: 'bg-blue-50/60', text: 'text-blue-700', border: 'border-blue-200/60', link: '/vehicles' },
    { title: 'Receiving Pending', count: '14', change: '4 trailers en-route', isUp: true, subtitle: 'In-transit from plant', icon: Truck, bg: 'bg-amber-50/60', text: 'text-amber-700', border: 'border-amber-200/60', link: '/receiving', alert: true },
    { title: 'Vehicles in Yard', count: '146', change: '86% yard capacity', isUp: true, subtitle: 'Physical stock on-site', icon: Building, bg: 'bg-slate-100/60', text: 'text-slate-800', border: 'border-slate-200/80', link: '/vehicles' },
    { title: 'PDI Pending', count: '28', change: '12 high priority', isUp: false, subtitle: 'Ready for inspection', icon: Clock, bg: 'bg-orange-50/60', text: 'text-orange-700', border: 'border-orange-200/60', link: '/pdi', alert: true },
    { title: 'PDI Done & Certified', count: '112', change: '94.8% first pass', isUp: true, subtitle: 'Passed QA inspection', icon: CheckCircle2, bg: 'bg-emerald-50/60', text: 'text-emerald-700', border: 'border-emerald-200/60', link: '/pdi' },
    { title: 'Customer Bookings', count: '96', change: '+18 orders this wk', isUp: true, subtitle: 'Total active vouchers', icon: Bookmark, bg: 'bg-indigo-50/60', text: 'text-indigo-700', border: 'border-indigo-200/60', link: '/bookings' },
    { title: 'Allocated Vehicles', count: '74', change: '77% allocation rate', isUp: true, subtitle: 'Chassis tagged to order', icon: UserCheck, bg: 'bg-purple-50/60', text: 'text-purple-700', border: 'border-purple-200/60', link: '/bookings' },
    { title: 'In Workshop / Repair', count: '6', change: 'Avg 1.2 day TAT', isUp: false, subtitle: 'Minor buffing / parts', icon: Wrench, bg: 'bg-rose-50/60', text: 'text-rose-700', border: 'border-rose-200/60', link: '/repairs' }
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
    { name: 'Tata Safari', count: 42, target: 50, color: 'bg-blue-600', text: 'text-blue-700' },
    { name: 'Tata Harrier', count: 36, target: 45, color: 'bg-indigo-600', text: 'text-indigo-700' },
    { name: 'Tata Nexon', count: 54, target: 60, color: 'bg-emerald-600', text: 'text-emerald-700' },
    { name: 'Tata Punch', count: 28, target: 35, color: 'bg-amber-600', text: 'text-amber-700' },
    { name: 'Hyundai Creta', count: 16, target: 25, color: 'bg-purple-600', text: 'text-purple-700' },
    { name: 'Hyundai Venue', count: 8, target: 15, color: 'bg-cyan-600', text: 'text-cyan-700' },
  ];

  // Live Operations Excel-Style Table Data
  const fleetOperations = [
    { id: '1', vin: 'MAT612345S9988776', brand: 'TATA', model: 'Tata Safari Accomplished Plus 6S', color: 'Oberon Black', status: 'PDI_IN_PROGRESS', stage: 'Step 2: Electricals (58%)', officer: 'Vikram Malhotra', bay: 'Bay 2', time: '12m ago', priority: 'HIGH' },
    { id: '2', vin: 'MAT612345H7654321', brand: 'TATA', model: 'Tata Harrier Fearless Plus Dark', color: 'Oberon Black', status: 'YARD_RECEIVING_PENDING', stage: 'In-Transit (Carrier #TR-4421)', officer: 'Ramesh Gate', bay: 'Gate Inward', time: '35m ago', priority: 'URGENT' },
    { id: '3', vin: 'MALC12345C1122334', brand: 'HYUNDAI', model: 'Hyundai Creta SX (O) Turbo DCT', color: 'Ranger Khaki', status: 'ALLOCATED', stage: 'Allocated to Sunil Jani', officer: 'Pooja Sales', bay: 'Bay 3', time: '1h ago', priority: 'NORMAL' },
    { id: '4', vin: 'MAT612345N1234567', brand: 'TATA', model: 'Tata Nexon Fearless Plus S DT', color: 'Daytona Grey', status: 'PDI_APPROVED', stage: 'QA Passed (Cert #CERT-9981)', officer: 'Amit Inspector', bay: 'Bay 3', time: '2h ago', priority: 'NORMAL' },
    { id: '5', vin: 'MAT612345P4455667', brand: 'TATA', model: 'Tata Punch Creative DT Petrol', color: 'Calypso Red', status: 'PDI_PENDING', stage: 'In Yard (Ready for PDI)', officer: 'Unassigned', bay: 'Bay 1', time: '3h ago', priority: 'HIGH' },
    { id: '6', vin: 'MALC12345V5566778', brand: 'HYUNDAI', model: 'Hyundai Venue N Line N8 DCT', color: 'Atlas White', status: 'IN_REPAIR', stage: 'Bumper Buffing (Workshop)', officer: 'Sanjay Tech', bay: 'Bay 4', time: '4h ago', priority: 'MEDIUM' }
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
      case 'PDI_IN_PROGRESS': return { text: 'PDI In Progress', class: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'PDI_PENDING': return { text: 'PDI Pending', class: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'PDI_APPROVED': return { text: 'PDI Approved', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'ALLOCATED': return { text: 'Customer Allocated', class: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'IN_REPAIR': return { text: 'In Workshop', class: 'bg-rose-50 text-rose-800 border-rose-200' };
      default: return { text: status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      
      {/* 1. Header Banner & Quick Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              Live Operations Control
            </span>
            <span className="text-xs font-semibold text-slate-400">Enterprise Dealership Network</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            {currentBrand.name} Executive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time telemetry across Plant In-Transit, Gate Receiving, PDI Quality, and Customer Allocation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/receiving"
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-amber-700" />
            <span>Gate Inward</span>
          </Link>

          <Link
            to="/pdi"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PDI Queue</span>
          </Link>

          <Link
            to="/vehicles"
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* 2. 8-Pillar Light Enterprise KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {kpiMetrics.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              to={kpi.link}
              className={`bg-white border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group ${kpi.border}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 truncate">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.text}`} />
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight group-hover:text-blue-700 transition-colors">
                  {kpi.count}
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-400 truncate">{kpi.subtitle}</span>
                  <span className={`font-semibold shrink-0 ${kpi.alert ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                    {kpi.change}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Live Data Charts Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 7-Day Live Vehicle Movement Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">Fleet Movement Velocity (Daily Trend)</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Comparative daily count of Inward vs PDI Inspected vs Delivered</p>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              {(['7D', '30D', 'MTD'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setChartTimeframe(t)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    chartTimeframe === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Bar Chart with Tooltips */}
          <div className="pt-2">
            <div className="h-56 flex items-end justify-between gap-3 px-2">
              {velocityData.map((item, i) => {
                const maxVal = 26;
                const inHeight = Math.round((item.inward / maxVal) * 100);
                const pdiHeight = Math.round((item.inspected / maxVal) * 100);
                const delHeight = Math.round((item.delivered / maxVal) * 100);

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Hover Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none shadow-lg z-20 whitespace-nowrap font-mono">
                      Inward: {item.inward} | PDI: {item.inspected} | Del: {item.delivered}
                    </div>

                    {/* Bars */}
                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      {/* Inward Bar */}
                      <div 
                        style={{ height: `${inHeight}%` }} 
                        className="w-2.5 bg-amber-400 hover:bg-amber-500 rounded-t transition-all"
                        title={`Inward: ${item.inward}`}
                      />
                      {/* Inspected Bar */}
                      <div 
                        style={{ height: `${pdiHeight}%` }} 
                        className="w-2.5 bg-blue-600 hover:bg-blue-700 rounded-t transition-all"
                        title={`PDI: ${item.inspected}`}
                      />
                      {/* Delivered Bar */}
                      <div 
                        style={{ height: `${delHeight}%` }} 
                        className="w-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all"
                        title={`Delivered: ${item.delivered}`}
                      />
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500">{item.day}</span>
                  </div>
                );
              })}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-400 rounded-sm" />
                <span className="text-slate-600">Gate Inward</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-sm" />
                <span className="text-slate-600">PDI Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                <span className="text-slate-600">Customer Delivered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Model-Wise Stock & Quality Index (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Model-Wise Stock Allocation</h2>
                <p className="text-xs text-slate-400">Inventory volume vs Yard Allocation Target</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">184 Total</span>
            </div>

            {/* Progress Bars for Top Models */}
            <div className="space-y-3.5 mt-4">
              {modelBreakdown.map((m, idx) => {
                const pct = Math.round((m.count / m.target) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{m.name}</span>
                      <span className="font-mono text-slate-500 font-semibold">{m.count} / {m.target} Units ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(pct, 100)}%` }} 
                        className={`h-2 rounded-full transition-all duration-500 ${m.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quality Yield Banner */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Quality Metric</span>
              <div className="text-lg font-bold text-emerald-950">94.8% First-Pass PDI Yield</div>
              <p className="text-[11px] text-emerald-700">Only 5.2% flagged for minor workshop rectifications</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 font-bold font-mono flex items-center justify-center border border-emerald-200 text-sm shadow-xs">
              ✓
            </div>
          </div>
        </div>

      </div>

      {/* 4. DENSE EXCEL-STYLE DATA GRID (Operations Telemetry) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Live Vehicle Fleet Telemetry</h2>
            <p className="text-xs text-slate-400">Excel-style authoritative operations ledger with real-time stage tracking</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['ALL', 'IN_TRANSIT', 'PDI_PENDING', 'APPROVED', 'ALLOCATED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTableFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    tableFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, Model, Officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Excel Data Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">VIN Number</th>
                <th className="py-3 px-4">Brand / Model</th>
                <th className="py-3 px-4">Colour</th>
                <th className="py-3 px-4">Status Tag</th>
                <th className="py-3 px-4">Current Stage Progress</th>
                <th className="py-3 px-4">Staging Bay</th>
                <th className="py-3 px-4">Assigned Personnel</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredFleet.map((row) => {
                const tag = getStatusTag(row.status);
                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {row.vin}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{row.model}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.brand} OEM</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                        {row.color}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tag.class}`}>
                        {tag.text}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {row.stage}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {row.bay}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {row.officer}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {row.time}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.status === 'YARD_RECEIVING_PENDING' ? (
                        <Link
                          to="/receiving"
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition-all inline-block shadow-xs"
                        >
                          Receive
                        </Link>
                      ) : row.status === 'PDI_APPROVED' ? (
                        <Link
                          to="/certificates/cert-101"
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all inline-block shadow-xs"
                        >
                          Certificate
                        </Link>
                      ) : (
                        <Link
                          to="/pdi/88888888-8888-8888-8888-888888888881"
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-xs"
                        >
                          <span>PDI Sheet</span>
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
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Showing {filteredFleet.length} active fleet units</span>
          <Link to="/vehicles" className="text-slate-900 font-bold hover:underline inline-flex items-center gap-1">
            <span>View Full 184-Vehicle Stock Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
};
