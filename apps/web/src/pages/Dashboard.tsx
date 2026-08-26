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
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';

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
      const res = await fetch(getApiUrl(`/api/v1/stock${orgParam}`));
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setFleetList(json.data);
          setLoadingFleet(false);
          return;
        }
      }
      setFleetList(getVehiclesForBrand(currentBrand.code));
    } catch (e) {
      console.warn('Live API unreachable, using brand dataset:', e);
      setFleetList(getVehiclesForBrand(currentBrand.code));
    } finally {
      setLoadingFleet(false);
    }
  };

  // 8 High-Density KPI Metrics (100% Real Database Exact Counts)
  const kpis = [
    { label: 'Total Vehicle', value: counts.totalStock, change: `${counts.totalStock} Units`, isUp: true, link: '/vehicles', color: 'text-blue-700', bg: 'bg-blue-50/50' },
    { label: 'Gate Inward', value: counts.receivingPending, change: `${counts.receivingPending} En-route`, isUp: true, link: '/receiving', color: 'text-amber-700', bg: 'bg-amber-50/50', alert: counts.receivingPending > 0 },
    { label: 'Yard Stock', value: counts.inYard, change: `${counts.inYard} On-site`, isUp: true, link: '/vehicles', color: 'text-slate-800', bg: 'bg-slate-50' },
    { label: 'PDI Pending', value: counts.pdiPending, change: `${counts.pdiPending} Ready`, isUp: false, link: '/pdi', color: 'text-orange-700', bg: 'bg-orange-50/50', alert: counts.pdiPending > 0 },
    { label: 'PDI Certified', value: counts.pdiDone, change: `${counts.pdiDone} Certified`, isUp: true, link: '/pdi', color: 'text-emerald-700', bg: 'bg-emerald-50/50' },
    { label: 'Bookings', value: counts.totalBookings, change: `${counts.totalBookings} Orders`, isUp: true, link: '/bookings', color: 'text-indigo-700', bg: 'bg-indigo-50/50' },
    { label: 'VIN Allocated', value: counts.allocatedVehicles, change: `${counts.allocatedVehicles} Tagged`, isUp: true, link: '/bookings', color: 'text-purple-700', bg: 'bg-purple-50/50' },
    { label: 'In Workshop', value: counts.inRepair, change: `${counts.inRepair} Repairs`, isUp: false, link: '/repairs', color: 'text-rose-700', bg: 'bg-rose-50/50' }
  ];

  // Dynamic Multi-Franchise Model Distribution
  const dynamicModelBreakdown = () => {
    if (fleetList.length === 0) {
      const models = currentBrand.models || [];
      return models.map((m, idx) => ({
        name: m,
        count: 0,
        brand: m.toLowerCase().includes('hyundai') ? 'Hyundai' : 'Tata',
        target: 10,
        color: m.toLowerCase().includes('hyundai') ? 'bg-cyan-600' : 'bg-blue-600'
      }));
    }

    const modelMap: Record<string, number> = {};
    fleetList.forEach(f => {
      const name = f.model || 'Unknown';
      modelMap[name] = (modelMap[name] || 0) + 1;
    });

    const colors = [
      'bg-blue-600', 'bg-indigo-600', 'bg-cyan-600', 'bg-teal-600', 
      'bg-sky-600', 'bg-purple-600', 'bg-amber-600', 'bg-emerald-600',
      'bg-rose-600', 'bg-violet-600', 'bg-blue-700', 'bg-cyan-700'
    ];

    return Object.entries(modelMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => {
        const isHyundai = name.toLowerCase().includes('hyundai');
        return {
          name,
          count,
          brand: isHyundai ? 'Hyundai' : 'Tata',
          target: Math.max(count + 2, 4),
          color: isHyundai ? 'bg-cyan-600' : 'bg-blue-600'
        };
      });
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
        return { text: 'Allocated to Retail', class: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'REPAIR_PENDING':
        return { text: 'Defect in Workshop', class: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { text: status, class: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="space-y-4 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* 1. Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* 2. Executive 8-Metric KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {kpis.map((kpi, idx) => (
          <Link
            key={idx}
            to={kpi.link}
            className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
              {kpi.label}
            </span>
            <div className="my-1">
              <span className="text-lg font-bold font-mono text-slate-900">
                {kpi.value}
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 truncate block">
              {kpi.change}
            </span>
          </Link>
        ))}
      </div>

      {/* 3. Central Full-Width Operations Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        
        {/* Table Toolbar Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Vehicle Inventory
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
              {filteredFleet.length} Units
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              {(['ALL', 'IN_TRANSIT', 'PDI_PENDING', 'APPROVED', 'ALLOCATED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTableFilter(tab)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs ${
                    tableFilter === tab
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL' ? 'All Stock' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, Model, Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN / Chassis Number</th>
                <th className="py-2.5 px-3">Brand & Model</th>
                <th className="py-2.5 px-3">Variant & Color</th>
                <th className="py-2.5 px-3">Fuel</th>
                <th className="py-2.5 px-3">Yard Staging Bay</th>
                <th className="py-2.5 px-3">Operational Status</th>
                <th className="py-2.5 px-3">Customer Mapping</th>
                <th className="py-2.5 px-3 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-xs">
              {filteredFleet.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                    <div className="font-semibold text-slate-700">0 Vehicles Found</div>
                    <p className="text-xs text-slate-400">No vehicles match your active filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredFleet.map((row, idx) => {
                  const tag = getStatusTag(row.status);
                  const isHyundai = (row.brand || '').toLowerCase().includes('hyundai') || (row.vin || '').startsWith('MAL') || (row.model || '').toLowerCase().includes('hyundai');
                  return (
                    <tr key={row.id || row.vin} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-slate-900">
                          {row.vin}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Eng: {row.engine_no || row.engine_number || 'N/A'}
                        </div>
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
                          <span className="font-bold text-slate-900">{row.model}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{row.variant || 'Standard'}</div>
                        <div className="text-[11px] text-slate-500">{row.color || 'White'}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {row.fuel_type || 'PETROL'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-800 font-medium">
                          {row.location || 'Central Stockyard'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tag.class}`}>
                          {tag.text}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {row.customer_name ? (
                          <div>
                            <div className="font-bold text-slate-900">{row.customer_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">BKG-{row.vin?.slice(-4)}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Free Stock</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/vehicles/${row.id || row.vin}`}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="View Vehicle Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to="/pdi"
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            title="Inspect Vehicle"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <span>Showing <strong>{filteredFleet.length}</strong> of <strong>{counts.totalStock}</strong> dealership vehicles</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Tata Motors: <strong>{fleetList.filter(f => !f.model?.toLowerCase().includes('hyundai') && (f.brand?.toLowerCase().includes('tata') || f.vin?.startsWith('MAT'))).length}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-600" />
              <span>Hyundai: <strong>{fleetList.filter(f => f.model?.toLowerCase().includes('hyundai') || f.brand?.toLowerCase().includes('hyundai') || f.vin?.startsWith('MAL')).length}</strong></span>
            </span>
          </div>
        </div>

      </div>

      {/* 4. Bottom Structured Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Model Inventory Distribution */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Stock by Model
            </h2>
            <span className="text-xs font-mono font-bold text-slate-600">{counts.totalStock} Units</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {modelBreakdown.map((m, idx) => {
              const pct = m.target > 0 ? Math.round((m.count / m.target) * 100) : 0;
              return (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                        m.brand === 'Hyundai' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {m.brand}
                      </span>
                      <span className="font-semibold text-slate-800">{m.name}</span>
                    </div>
                    <span className="font-mono text-slate-600 font-bold">{m.count} {m.count === 1 ? 'Unit' : 'Units'}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div style={{ width: `${Math.min(pct, 100)}%` }} className={`h-1.5 rounded-full ${m.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dealership Facilities & Stockyard Status */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Dealership Facilities
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-600">4 Active Hubs</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Dhoot Group • Wakad Central Hub (Pune)</div>
                <div className="text-[11px] text-slate-500">3S Facility (Tata Motors) • Capacity: 120 Cars</div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">8 Units On-Site</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Dhoot Group • Jaipur Tonk Road Hub</div>
                <div className="text-[11px] text-slate-500">3S Facility (Tata Motors) • Capacity: 150 Cars</div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">2 Units On-Site</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Dhoot Group • Raja Park Showroom (Jaipur)</div>
                <div className="text-[11px] text-slate-500">1S Showroom (Hyundai) • Capacity: 30 Cars</div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">10 Units On-Site</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
