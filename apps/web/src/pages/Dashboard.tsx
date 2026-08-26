import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, CheckCircle2, Clock, Truck, Bookmark, 
  UserCheck, Wrench, ShieldCheck, ArrowRight,
  Building, Layers, BarChart3, Activity,
  FileSpreadsheet, PackageCheck, AlertCircle, ShoppingCart, 
  MapPin, Check, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand, getBookingsForBrand } from '../data/seedData';

export const DashboardPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const counts = useFleetCounts();
  
  // Real Database Fleet & Bookings Data State
  const [fleetList, setFleetList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [currentBrand?.code]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      
      // 1. Fetch Fleet Stock
      const stockRes = await fetch(getApiUrl(`/api/v1/stock${orgParam}`));
      if (stockRes.ok) {
        const json = await stockRes.json();
        if (json.data && json.data.length > 0) {
          setFleetList(json.data);
        } else {
          setFleetList(getVehiclesForBrand(currentBrand.code));
        }
      } else {
        setFleetList(getVehiclesForBrand(currentBrand.code));
      }

      // 2. Fetch Bookings
      const bookRes = await fetch(getApiUrl(`/api/v1/bookings${orgParam}`));
      if (bookRes.ok) {
        const json = await bookRes.json();
        if (json.data && json.data.length > 0) {
          setBookingsList(json.data);
        } else {
          setBookingsList(getBookingsForBrand(currentBrand.code));
        }
      } else {
        setBookingsList(getBookingsForBrand(currentBrand.code));
      }
    } catch (e) {
      console.warn('Live API unreachable, using brand dataset:', e);
      setFleetList(getVehiclesForBrand(currentBrand.code));
      setBookingsList(getBookingsForBrand(currentBrand.code));
    } finally {
      setLoading(false);
    }
  };

  // 8 Executive AdminLTE KPI Metric Cards
  const kpis = [
    { 
      label: 'Total Bookings', 
      value: counts.totalBookings, 
      sub: `${counts.totalBookings} Customer Orders`, 
      link: '/bookings', 
      icon: Bookmark, 
      bgLight: 'bg-indigo-50 text-indigo-600',
      hoverBar: 'group-hover:bg-indigo-600 group-hover:text-white',
      moreText: 'View Bookings'
    },
    { 
      label: 'VIN Allocated', 
      value: counts.allocatedVehicles, 
      sub: `${counts.allocatedVehicles} Tagged to Orders`, 
      link: '/bookings', 
      icon: UserCheck, 
      bgLight: 'bg-purple-50 text-purple-600',
      hoverBar: 'group-hover:bg-purple-600 group-hover:text-white',
      moreText: 'View Allocated'
    },
    { 
      label: 'Pending Allocation (PBNA)', 
      value: counts.totalPbnaVehicle, 
      sub: `${counts.totalPbnaVehicle} Awaiting VIN`, 
      link: '/bookings', 
      icon: Clock, 
      bgLight: 'bg-amber-50 text-amber-600',
      hoverBar: 'group-hover:bg-amber-500 group-hover:text-white',
      moreText: 'PBNA Orders'
    },
    { 
      label: 'Physical Yard Stock', 
      value: counts.totalPhysicalStock, 
      sub: `${counts.totalPhysicalStock} On-Site in Bays`, 
      link: '/vehicles', 
      icon: Building, 
      bgLight: 'bg-slate-100 text-slate-700',
      hoverBar: 'group-hover:bg-slate-800 group-hover:text-white',
      moreText: 'Yard Stock'
    },
    { 
      label: 'Free Yard Stock', 
      value: counts.totalFreeVehicle, 
      sub: `${counts.totalFreeVehicle} Unallocated Free`, 
      link: '/vehicles', 
      icon: PackageCheck, 
      bgLight: 'bg-teal-50 text-teal-600',
      hoverBar: 'group-hover:bg-teal-600 group-hover:text-white',
      moreText: 'Free Inventory'
    },
    { 
      label: 'In-Transit Orders', 
      value: counts.receivingPending, 
      sub: `${counts.receivingPending} En-Route Carrier`, 
      link: '/receiving', 
      icon: Truck, 
      bgLight: 'bg-blue-50 text-blue-600',
      hoverBar: 'group-hover:bg-blue-600 group-hover:text-white',
      moreText: 'Gate Receiving'
    },
    { 
      label: 'Plant Indent Needed', 
      value: counts.orderRequired, 
      sub: `${counts.orderRequired} Orders Deficit`, 
      link: '/bookings', 
      icon: ShoppingCart, 
      bgLight: 'bg-rose-50 text-rose-600',
      hoverBar: 'group-hover:bg-rose-600 group-hover:text-white',
      moreText: 'Order Required'
    },
    { 
      label: 'PDI Certified', 
      value: counts.pdiDone, 
      sub: `${counts.pdiDone} QA Approved`, 
      link: '/pdi', 
      icon: CheckCircle2, 
      bgLight: 'bg-emerald-50 text-emerald-600',
      hoverBar: 'group-hover:bg-emerald-600 group-hover:text-white',
      moreText: 'PDI Certified'
    }
  ];

  // Yard / Facility-Wise Bookings & Inventory Aggregation
  const yardFacilities = [
    {
      id: 'yard-pune',
      name: 'Wakad Central Stockyard',
      location: 'Pune, Maharashtra',
      brand: 'Tata Motors',
      type: '3S Main Facility',
      capacity: 120,
      bookings: bookingsList.filter(b => b.organization_id === '11111111-1111-1111-1111-111111111111' || !b.model?.toLowerCase().includes('hyundai')).length,
      allocated: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111111' || !b.model?.toLowerCase().includes('hyundai')) && !!b.allocated_vin_no).length,
      physicalStock: fleetList.filter(v => (!v.model?.toLowerCase().includes('hyundai') && !v.brand?.toLowerCase().includes('hyundai')) && v.status !== 'YARD_RECEIVING_PENDING').length,
      color: 'border-blue-200 bg-blue-50/20'
    },
    {
      id: 'yard-jaipur-tonk',
      name: 'Jaipur Tonk Road Hub',
      location: 'Jaipur, Rajasthan',
      brand: 'Hyundai',
      type: '3S Main Facility',
      capacity: 150,
      bookings: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant !== 'Karan Joshi').length,
      allocated: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant !== 'Karan Joshi' && !!b.allocated_vin_no).length,
      physicalStock: 6,
      color: 'border-cyan-200 bg-cyan-50/20'
    },
    {
      id: 'yard-jaipur-raja',
      name: 'Raja Park City Showroom',
      location: 'Jaipur, Rajasthan',
      brand: 'Hyundai',
      type: '1S Retail Desk',
      capacity: 30,
      bookings: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant === 'Karan Joshi').length,
      allocated: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant === 'Karan Joshi' && !!b.allocated_vin_no).length,
      physicalStock: 4,
      color: 'border-indigo-200 bg-indigo-50/20'
    }
  ];

  // Model-Wise Booking, Allocation, PBNA & Order Deficit Analysis
  const computeModelMatrix = () => {
    const allModels = [
      { name: 'Tata Safari', brand: 'Tata Motors', color: 'bg-blue-600' },
      { name: 'Tata Harrier', brand: 'Tata Motors', color: 'bg-indigo-600' },
      { name: 'Tata Nexon', brand: 'Tata Motors', color: 'bg-blue-500' },
      { name: 'Tata Curvv.ev', brand: 'Tata Motors', color: 'bg-teal-600' },
      { name: 'Tata Punch', brand: 'Tata Motors', color: 'bg-amber-600' },
      { name: 'Tata Tiago', brand: 'Tata Motors', color: 'bg-sky-600' },
      { name: 'Tata Altroz', brand: 'Tata Motors', color: 'bg-orange-600' },
      { name: 'Hyundai Creta', brand: 'Hyundai', color: 'bg-cyan-600' },
      { name: 'Hyundai Venue', brand: 'Hyundai', color: 'bg-teal-500' },
      { name: 'Hyundai Verna', brand: 'Hyundai', color: 'bg-purple-600' },
      { name: 'Hyundai Ioniq 5', brand: 'Hyundai', color: 'bg-emerald-600' },
      { name: 'Hyundai Exter', brand: 'Hyundai', color: 'bg-rose-600' },
      { name: 'Hyundai Tucson', brand: 'Hyundai', color: 'bg-slate-700' }
    ];

    // Filter by active brand context
    const filteredModels = allModels.filter(m => {
      if (currentBrand.code === 'DHOOT-TATA') return m.brand === 'Tata Motors';
      if (currentBrand.code === 'DHOOT-HYUNDAI') return m.brand === 'Hyundai';
      return true;
    });

    return filteredModels.map(m => {
      const modelBookings = bookingsList.filter(b => (b.model || '').toLowerCase().includes(m.name.toLowerCase().replace('tata ', '').replace('hyundai ', '')));
      const totalBook = modelBookings.length;
      const allocated = modelBookings.filter(b => !!b.allocated_vin_no).length;
      const pbna = totalBook - allocated;
      
      const modelVehicles = fleetList.filter(v => (v.model || '').toLowerCase().includes(m.name.toLowerCase().replace('tata ', '').replace('hyundai ', '')));
      const physicalInYard = modelVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING' && v.status !== 'IN_TRANSIT').length;
      const freeYardStock = modelVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING' && v.status !== 'IN_TRANSIT' && !v.customer_name && v.status !== 'ALLOCATED').length;
      
      const orderRequired = Math.max(0, pbna - freeYardStock);
      const allocRate = totalBook > 0 ? Math.round((allocated / totalBook) * 100) : 0;

      return {
        ...m,
        totalBook,
        allocated,
        pbna,
        physicalInYard,
        freeYardStock,
        orderRequired,
        allocRate
      };
    });
  };

  const modelMatrix = computeModelMatrix();

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* 1. Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time dealership booking pipeline, stockyard distribution, and model allocation ledger
          </p>
        </div>
      </div>

      {/* 2. AdminLTE-Inspired Small-Box Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              to={kpi.link}
              className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="p-3.5 flex items-start justify-between">
                <div>
                  <div className="text-xl font-bold font-mono text-slate-900 leading-none">
                    {kpi.value}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 mt-1.5 uppercase tracking-wider">
                    {kpi.label}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-lg ${kpi.bgLight} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className={`px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500 ${kpi.hoverBar} transition-colors`}>
                <span>{kpi.moreText}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Section: Stockyard & Facility-Wise Booking & Stock DataCards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Stockyard & Facility Booking Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Live Yard Network
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {yardFacilities.map((yard) => {
            const pbna = yard.bookings - yard.allocated;
            const freeStock = Math.max(0, yard.physicalStock - yard.allocated);
            const allocationPct = yard.bookings > 0 ? Math.round((yard.allocated / yard.bookings) * 100) : 0;

            return (
              <div 
                key={yard.id}
                className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Yard Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          yard.brand === 'Hyundai' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {yard.brand}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{yard.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{yard.location} • {yard.type}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Cap: {yard.capacity} Cars
                    </span>
                  </div>

                  {/* 4 Metric Sub-Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center mt-3.5">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block truncate">Bookings</span>
                      <span className="text-base font-bold font-mono text-indigo-700 mt-0.5 block">{yard.bookings}</span>
                    </div>
                    <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] font-semibold text-emerald-700 uppercase block truncate">Allocated</span>
                      <span className="text-base font-bold font-mono text-emerald-800 mt-0.5 block">{yard.allocated}</span>
                    </div>
                    <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                      <span className="text-[10px] font-semibold text-amber-700 uppercase block truncate">PBNA</span>
                      <span className="text-base font-bold font-mono text-amber-800 mt-0.5 block">{pbna}</span>
                    </div>
                    <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                      <span className="text-[10px] font-semibold text-blue-700 uppercase block truncate">Free Stock</span>
                      <span className="text-base font-bold font-mono text-blue-800 mt-0.5 block">{freeStock}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Allocation Rate Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">VIN Allocation Progress</span>
                    <span className="font-mono font-bold text-slate-900">{allocationPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(allocationPct, 100)}%` }} 
                      className={`h-2 rounded-full ${yard.brand === 'Hyundai' ? 'bg-cyan-600' : 'bg-blue-600'}`} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Section: Model-Wise Booking, Allocation, PBNA & Order Deficit DataCards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Model-Wise Booking & Allocation Demand Matrix
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {modelMatrix.length} Dealership Models
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {modelMatrix.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Model Header */}
                <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      item.brand === 'Hyundai' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {item.brand === 'Hyundai' ? 'Hyundai' : 'Tata'}
                    </span>
                    <span className="font-bold text-slate-900 text-xs truncate">{item.name}</span>
                  </div>

                  {item.orderRequired > 0 ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Indent: {item.orderRequired}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Stock OK
                    </span>
                  )}
                </div>

                {/* 4 Metric Box */}
                <div className="grid grid-cols-4 gap-1.5 text-center mt-2.5 text-xs">
                  <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase block">Orders</span>
                    <span className="font-bold font-mono text-slate-900 mt-0.5 block">{item.totalBook}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-1.5 rounded-md border border-emerald-100">
                    <span className="text-[9px] text-emerald-700 font-semibold uppercase block">Alloted</span>
                    <span className="font-bold font-mono text-emerald-800 mt-0.5 block">{item.allocated}</span>
                  </div>
                  <div className="bg-amber-50/50 p-1.5 rounded-md border border-amber-100">
                    <span className="text-[9px] text-amber-700 font-semibold uppercase block">PBNA</span>
                    <span className="font-bold font-mono text-amber-800 mt-0.5 block">{item.pbna}</span>
                  </div>
                  <div className="bg-blue-50/50 p-1.5 rounded-md border border-blue-100">
                    <span className="text-[9px] text-blue-700 font-semibold uppercase block">Free</span>
                    <span className="font-bold font-mono text-blue-800 mt-0.5 block">{item.freeYardStock}</span>
                  </div>
                </div>
              </div>

              {/* Progress Allocation Bar */}
              <div className="space-y-1 pt-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium">Allocation Fulfilled</span>
                  <span className="font-mono font-bold text-slate-700">{item.allocRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    style={{ width: `${Math.min(item.allocRate, 100)}%` }} 
                    className={`h-1.5 rounded-full ${item.color}`} 
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 5. Section: Order Fulfillment Pipeline (Process Funnel) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Booking Fulfillment & Delivery Pipeline
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Active Order Progression
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          
          <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
              1
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Advance Booked</span>
              <span className="text-base font-bold font-mono text-slate-900 leading-tight block">{counts.totalBookings} Orders</span>
              <span className="text-[10px] text-slate-400">Vouchers created</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
              2
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">VIN Allocated</span>
              <span className="text-base font-bold font-mono text-purple-900 leading-tight block">{counts.allocatedVehicles} Vehicles</span>
              <span className="text-[10px] text-purple-600">Stock assigned</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
              3
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">PDI Certified</span>
              <span className="text-base font-bold font-mono text-emerald-900 leading-tight block">{counts.pdiDone} Inspected</span>
              <span className="text-[10px] text-emerald-600">QA Approved</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs shrink-0">
              4
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Invoiced / Gatepass</span>
              <span className="text-base font-bold font-mono text-amber-900 leading-tight block">6 Units</span>
              <span className="text-[10px] text-amber-600">Handover Ready</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              5
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Delivered</span>
              <span className="text-base font-bold font-mono text-blue-900 leading-tight block">1 Delivered</span>
              <span className="text-[10px] text-blue-600">Customer Received</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
