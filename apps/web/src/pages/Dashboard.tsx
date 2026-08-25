import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, CheckCircle2, AlertTriangle, Clock, Truck, Bookmark, 
  UserCheck, Wrench, ShieldCheck, ArrowRight, Plus, 
  TrendingUp, Calendar, Filter, Sparkles, Building, Layers,
  BarChart3, PieChart, Activity, Download, Search, ChevronRight,
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye, FileSpreadsheet,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';

export const DashboardPage: React.FC = () => {
  const { currentBrand, user } = useAuth();
  const counts = useFleetCounts();
  const [tableFilter, setTableFilter] = useState<'ALL' | 'IN_TRANSIT' | 'PDI_PENDING' | 'APPROVED' | 'ALLOCATED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real Database Fleet Data State
  const [fleetList, setFleetList] = useState<any[]>([]);
  const [loadingFleet, setLoadingFleet] = useState(true);

  useEffect(() => {
    fetchLiveFleet();
  }, [currentBrand?.code]);

  const fetchLiveFleet = async () => {
    setLoadingFleet(true);
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      const res = await fetch(`http://localhost:8787/api/v1/stock${orgParam}`);
      if (res.ok) {
        const json = await res.json();
        setFleetList(json.data || []);
      } else {
        setFleetList([]);
      }
    } catch (e) {
      console.warn('Error fetching fleet:', e);
      setFleetList([]);
    } finally {
      setLoadingFleet(false);
    }
  };

  // Pure Unified Dhoot Group Executive Identity
  const brandInfo = {
    title: 'Dhoot Group Operations Command Center',
    subtitle: 'Executive dealership overview for vehicle fleet, stockyard logistics, and delivery operations'
  };

  // 8 High-Density KPI Metrics (100% Real Database Exact Counts)
  const kpis = [
    { label: 'Total Fleet', value: counts.totalStock, change: `${counts.totalStock} Units`, isUp: true, link: '/vehicles', color: 'text-blue-700', bg: 'bg-blue-50/50' },
    { label: 'Receiving Pending', value: counts.receivingPending, change: `${counts.receivingPending} En-route`, isUp: true, link: '/receiving', color: 'text-amber-700', bg: 'bg-amber-50/50', alert: counts.receivingPending > 0 },
    { label: 'Yard Stock', value: counts.inYard, change: `${counts.inYard} On-site`, isUp: true, link: '/vehicles', color: 'text-slate-800', bg: 'bg-slate-50' },
    { label: 'Inspection Pending', value: counts.pdiPending, change: `${counts.pdiPending} Ready`, isUp: false, link: '/pdi', color: 'text-orange-700', bg: 'bg-orange-50/50', alert: counts.pdiPending > 0 },
    { label: 'Quality Certified', value: counts.pdiDone, change: `${counts.pdiDone} Certified`, isUp: true, link: '/pdi', color: 'text-emerald-700', bg: 'bg-emerald-50/50' },
    { label: 'Customer Bookings', value: counts.totalBookings, change: `${counts.totalBookings} Orders`, isUp: true, link: '/bookings', color: 'text-indigo-700', bg: 'bg-indigo-50/50' },
    { label: 'Allocated Units', value: counts.allocatedVehicles, change: `${counts.allocatedVehicles} Tagged`, isUp: true, link: '/bookings', color: 'text-purple-700', bg: 'bg-purple-50/50' },
    { label: 'In Workshop', value: counts.inRepair, change: `${counts.inRepair} Repairs`, isUp: false, link: '/repairs', color: 'text-rose-700', bg: 'bg-rose-50/50' }
  ];

  // Dynamic Model Distribution
  const dynamicModelBreakdown = () => {
    if (fleetList.length === 0) {
      return (currentBrand.models || []).slice(0, 6).map(m => ({
        name: m,
        count: 0,
        target: 20,
        color: 'bg-slate-400'
      }));
    }

    const modelMap: Record<string, number> = {};
    fleetList.forEach(f => {
      const name = f.model || 'Unknown';
      modelMap[name] = (modelMap[name] || 0) + 1;
    });

    const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-cyan-600'];
    return Object.entries(modelMap).slice(0, 6).map(([name, count], idx) => ({
      name,
      count,
      target: Math.max(count + 5, 10),
      color: colors[idx % colors.length]
    }));
  };

  const modelBreakdown = dynamicModelBreakdown();

  // Filtered Real Fleet
  const filteredFleet = fleetList.filter(item => {
    const vin = (item.vin || '').toLowerCase();
    const model = (item.model || '').toLowerCase();
    const cust = (item.customer_name || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = vin.includes(search) || model.includes(search) || cust.includes(search);
    const status = (item.status || '').toUpperCase();
    
    if (tableFilter === 'IN_TRANSIT') return matchesSearch && (status === 'YARD_RECEIVING_PENDING' || status === 'IN_TRANSIT');
    if (tableFilter === 'PDI_PENDING') return matchesSearch && (status === 'PDI_PENDING' || status === 'PDI_IN_PROGRESS' || status === 'RECEIVED');
    if (tableFilter === 'APPROVED') return matchesSearch && (status === 'PDI_APPROVED' || status === 'DELIVERY_READY');
    if (tableFilter === 'ALLOCATED') return matchesSearch && status === 'ALLOCATED';
    return matchesSearch;
  });

  const getStatusTag = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'YARD_RECEIVING_PENDING':
      case 'IN_TRANSIT':
        return { text: 'Receiving Pending', class: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'PDI_IN_PROGRESS':
        return { text: 'In Inspection', class: 'bg-blue-50 text-blue-800 border-blue-200 font-bold' };
      case 'PDI_PENDING':
      case 'RECEIVED':
        return { text: 'Inspection Pending', class: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'PDI_APPROVED':
      case 'DELIVERY_READY':
        return { text: 'Certified Approved', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'ALLOCATED':
        return { text: 'Customer Allocated', class: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'IN_REPAIR':
        return { text: 'In Workshop', class: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { text: status || 'RECEIVED', class: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-slate-900 leading-tight">
              {brandInfo.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {brandInfo.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/receiving"
            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-amber-700" />
            <span>Gate Inward</span>
          </Link>

          <Link
            to="/vehicles"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stock Ledger Importer</span>
          </Link>
        </div>
      </div>

      {/* 2. Sleek Single-Row Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {kpis.map((k, i) => (
          <Link
            key={i}
            to={k.link}
            className={`p-3 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between group ${k.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{k.label}</span>
              {k.alert && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-ping" />}
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

      {/* 3. Dealership Operations & Inventory Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Dealership Daily Activity Velocity */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-700" />
                <h2 className="text-xs font-bold text-slate-900">Operations Activity Velocity</h2>
              </div>
              <p className="text-[11px] text-slate-400">Total active dealership fleet: {counts.totalStock} units</p>
            </div>

            <button
              onClick={fetchLiveFleet}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Refresh Fleet Feed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {counts.totalStock === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center space-y-2">
              <FolderOpen className="w-8 h-8 text-slate-300 stroke-[1.5]" />
              <div className="text-xs font-bold text-slate-700">0 Vehicles in Active Stock</div>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Upload your official 21-column stock Excel file or receive an incoming carrier trailer at the yard gate.
              </p>
              <Link
                to="/vehicles"
                className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 mt-1 shadow-xs"
              >
                <span>Open Stock Importer</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Receiving Pending</span>
                  <span className="text-lg font-bold font-mono text-amber-900">{counts.receivingPending}</span>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Inspection Pending</span>
                  <span className="text-lg font-bold font-mono text-blue-900">{counts.pdiPending}</span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Certified & Approved</span>
                  <span className="text-lg font-bold font-mono text-emerald-900">{counts.pdiDone}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Model Breakdown */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">Inventory Model Distribution</h2>
                <p className="text-[11px] text-slate-400">Stockyard vehicle count per OEM model</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">{counts.totalStock} Total</span>
            </div>

            <div className="space-y-2.5 mt-3">
              {modelBreakdown.map((m, idx) => {
                const pct = m.target > 0 ? Math.round((m.count / m.target) * 100) : 0;
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{m.name}</span>
                      <span className="font-mono text-slate-500">{m.count} Units</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div style={{ width: `${Math.min(pct, 100)}%` }} className={`h-1.5 rounded-full ${m.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Enterprise Dealership Network</span>
              <div className="text-xs font-bold text-slate-800">Dhoot Group Automotive Enterprise</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>

      </div>

      {/* 4. Full-Width Dense Operations Telemetry Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900">Vehicle Inventory & Staging Ledger</h2>
            <p className="text-[11px] text-slate-400">Live operational ledger across all stockyards, staging bays, and delivery lines</p>
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
                placeholder="Search VIN, Model, Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">VIN Number</th>
                <th className="py-2.5 px-3">Model & Variant</th>
                <th className="py-2.5 px-3">Colour</th>
                <th className="py-2.5 px-3">Fuel</th>
                <th className="py-2.5 px-3">Status Tag</th>
                <th className="py-2.5 px-3">Location / Bay</th>
                <th className="py-2.5 px-3">Customer / Consultant</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
              {filteredFleet.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <div className="space-y-1">
                      <FolderOpen className="w-6 h-6 mx-auto text-slate-300" />
                      <div className="font-bold text-slate-600">0 Vehicles in Active Fleet</div>
                      <p className="text-[11px]">Import an Excel spreadsheet or receive incoming carrier trailers to view stock rows.</p>
                      <Link
                        to="/vehicles"
                        className="inline-flex items-center gap-1 text-slate-900 font-bold underline mt-2 text-xs"
                      >
                        <span>Open 21-Column Stock Importer</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFleet.map((row) => {
                  const tag = getStatusTag(row.status);
                  return (
                    <tr key={row.id || row.vin} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {row.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{row.model}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{row.variant || 'Standard'}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {row.color || 'Standard'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-600">
                        {row.fuel_type || 'PETROL'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${tag.class}`}>
                          {tag.text}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {row.location || 'Central Stockyard'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {row.customer_name ? (
                          <div>
                            <span className="font-bold text-slate-800">{row.customer_name}</span>
                            <div className="text-[10px] text-slate-400">{row.sales_consultant || 'Sales Desk'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unallocated</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Link
                          to={`/vehicles/${row.id || row.vin}`}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 shadow-xs"
                        >
                          <span>Details</span>
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

        {/* Table Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredFleet.length} active vehicle records</span>
          <Link to="/vehicles" className="text-slate-900 font-bold hover:underline inline-flex items-center gap-1">
            <span>Open 21-Column Stock Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
};
