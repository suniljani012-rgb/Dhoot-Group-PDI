import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, CheckCircle2, Clock, Truck, Bookmark, 
  UserCheck, Wrench, ShieldCheck, ArrowRight,
  Building, Layers, BarChart3, Activity,
  PackageCheck, ShoppingCart, MapPin
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

  // 8 Executive Metric Cards
  const kpis = [
    { 
      label: 'Total Bookings', 
      value: counts.totalBookings, 
      link: '/bookings', 
      icon: Bookmark, 
      moreText: 'View'
    },
    { 
      label: 'VIN Allocated', 
      value: counts.allocatedVehicles, 
      link: '/bookings', 
      icon: UserCheck, 
      moreText: 'View'
    },
    { 
      label: 'PBNA Orders', 
      value: counts.totalPbnaVehicle, 
      link: '/bookings', 
      icon: Clock, 
      moreText: 'View'
    },
    { 
      label: 'Yard Stock', 
      value: counts.totalPhysicalStock, 
      link: '/vehicles', 
      icon: Building, 
      moreText: 'View'
    },
    { 
      label: 'Free Stock', 
      value: counts.totalFreeVehicle, 
      link: '/vehicles', 
      icon: PackageCheck, 
      moreText: 'View'
    },
    { 
      label: 'In-Transit', 
      value: counts.receivingPending, 
      link: '/receiving', 
      icon: Truck, 
      moreText: 'View'
    },
    { 
      label: 'Order Needed', 
      value: counts.orderRequired, 
      link: '/bookings', 
      icon: ShoppingCart, 
      moreText: 'View'
    },
    { 
      label: 'PDI Certified', 
      value: counts.pdiDone, 
      link: '/pdi', 
      icon: CheckCircle2, 
      moreText: 'View'
    }
  ];

  // Yard / Facility-Wise Bookings & Inventory Aggregation
  const yardFacilities = [
    {
      id: 'yard-pune',
      name: 'Wakad Central Stockyard',
      location: 'Pune, Maharashtra',
      brand: 'Tata',
      type: '3S Facility',
      capacity: 120,
      bookings: bookingsList.filter(b => b.organization_id === '11111111-1111-1111-1111-111111111111' || !b.model?.toLowerCase().includes('hyundai')).length,
      allocated: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111111' || !b.model?.toLowerCase().includes('hyundai')) && !!b.allocated_vin_no).length,
      physicalStock: fleetList.filter(v => (!v.model?.toLowerCase().includes('hyundai') && !v.brand?.toLowerCase().includes('hyundai')) && v.status !== 'YARD_RECEIVING_PENDING').length,
    },
    {
      id: 'yard-jaipur-tonk',
      name: 'Jaipur Tonk Road Hub',
      location: 'Jaipur, Rajasthan',
      brand: 'Hyundai',
      type: '3S Facility',
      capacity: 150,
      bookings: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant !== 'Karan Joshi').length,
      allocated: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant !== 'Karan Joshi' && !!b.allocated_vin_no).length,
      physicalStock: 6,
    },
    {
      id: 'yard-jaipur-raja',
      name: 'Raja Park City Showroom',
      location: 'Jaipur, Rajasthan',
      brand: 'Hyundai',
      type: '1S Showroom',
      capacity: 30,
      bookings: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant === 'Karan Joshi').length,
      allocated: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant === 'Karan Joshi' && !!b.allocated_vin_no).length,
      physicalStock: 4,
    }
  ];

  // Model-Wise Booking, Allocation, PBNA & Order Deficit Analysis
  const computeModelMatrix = () => {
    const allModels = [
      { name: 'Tata Safari', brand: 'Tata' },
      { name: 'Tata Harrier', brand: 'Tata' },
      { name: 'Tata Nexon', brand: 'Tata' },
      { name: 'Tata Curvv.ev', brand: 'Tata' },
      { name: 'Tata Punch', brand: 'Tata' },
      { name: 'Tata Tiago', brand: 'Tata' },
      { name: 'Tata Altroz', brand: 'Tata' },
      { name: 'Hyundai Creta', brand: 'Hyundai' },
      { name: 'Hyundai Venue', brand: 'Hyundai' },
      { name: 'Hyundai Verna', brand: 'Hyundai' },
      { name: 'Hyundai Ioniq 5', brand: 'Hyundai' },
      { name: 'Hyundai Exter', brand: 'Hyundai' },
      { name: 'Hyundai Tucson', brand: 'Hyundai' }
    ];

    // Filter by active brand context
    const filteredModels = allModels.filter(m => {
      if (currentBrand.code === 'DHOOT-TATA') return m.brand === 'Tata';
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
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* 1. Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.011em] text-ink">
            Dashboard
          </h1>
          <p className="text-xs text-ink-3 mt-0.5">
            Real-time pipeline, facility stock distribution, and model allocation ledger
          </p>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              to={kpi.link}
              className="bg-surface border border-line rounded p-3 flex flex-col justify-between hover:border-line-strong transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-semibold text-ink tnum leading-none">
                    {kpi.value}
                  </div>
                  <div className="text-[11px] font-medium text-ink-3 mt-1.5 uppercase tracking-wide">
                    {kpi.label}
                  </div>
                </div>
                <Icon className="w-4 h-4 text-ink-3 group-hover:text-ink transition-colors shrink-0" />
              </div>

              <div className="mt-3 pt-1.5 border-t border-line flex items-center justify-between text-[10px] text-ink-3 group-hover:text-ink transition-colors">
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
          <div className="eyebrow">Stockyard & Facility Booking Matrix</div>
          <span className="text-xs text-ink-3">Live Network</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {yardFacilities.map((yard) => {
            const pbna = yard.bookings - yard.allocated;
            const freeStock = Math.max(0, yard.physicalStock - yard.allocated);
            const allocationPct = yard.bookings > 0 ? Math.round((yard.allocated / yard.bookings) * 100) : 0;

            return (
              <div 
                key={yard.id}
                className="bg-surface border border-line rounded p-4 flex flex-col justify-between space-y-4 hover:border-line-strong transition-colors"
              >
                <div>
                  {/* Top Yard Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-line pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-chip font-medium bg-canvas border border-line text-ink-2 uppercase">
                          {yard.brand}
                        </span>
                        <h3 className="font-semibold text-ink text-sm">{yard.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-ink-3 mt-1">
                        <MapPin className="w-3 h-3 text-ink-3" />
                        <span>{yard.location} • {yard.type}</span>
                      </div>
                    </div>

                    <span className="text-xs text-ink-3 tnum">
                      Cap: {yard.capacity}
                    </span>
                  </div>

                  {/* 4 Metric Sub-Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center mt-3.5">
                    <div className="bg-canvas p-2 rounded border border-line">
                      <span className="text-[10px] font-medium text-ink-3 uppercase block truncate">Bookings</span>
                      <span className="text-base font-semibold text-ink tnum mt-0.5 block">{yard.bookings}</span>
                    </div>
                    <div className="bg-canvas p-2 rounded border border-line">
                      <span className="text-[10px] font-medium text-ink-3 uppercase block truncate">Allocated</span>
                      <span className="text-base font-semibold text-ink tnum mt-0.5 block">{yard.allocated}</span>
                    </div>
                    <div className="bg-canvas p-2 rounded border border-line">
                      <span className="text-[10px] font-medium text-ink-3 uppercase block truncate">PBNA</span>
                      <span className="text-base font-semibold text-ink tnum mt-0.5 block">{pbna}</span>
                    </div>
                    <div className="bg-canvas p-2 rounded border border-line">
                      <span className="text-[10px] font-medium text-ink-3 uppercase block truncate">Free Stock</span>
                      <span className="text-base font-semibold text-ink tnum mt-0.5 block">{freeStock}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Allocation Rate Bar */}
                <div className="space-y-1.5 pt-2 border-t border-line">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-3 font-medium">VIN Allocation Progress</span>
                    <span className="font-medium text-ink tnum">{allocationPct}%</span>
                  </div>
                  <div className="w-full bg-canvas border border-line rounded-full h-1.5 overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(allocationPct, 100)}%` }} 
                      className="h-1.5 rounded-full bg-ink" 
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
          <div className="eyebrow">Model-Wise Booking & Allocation Ledger</div>
          <span className="text-xs text-ink-3 tnum">{modelMatrix.length} Models</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {modelMatrix.map((item, idx) => (
            <div 
              key={idx}
              className="bg-surface border border-line rounded p-3.5 flex flex-col justify-between space-y-3 hover:border-line-strong transition-colors"
            >
              <div>
                {/* Model Header */}
                <div className="flex items-center justify-between gap-1 border-b border-line pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-chip font-medium bg-canvas border border-line text-ink-2 uppercase">
                      {item.brand}
                    </span>
                    <span className="font-semibold text-ink text-xs truncate">{item.name}</span>
                  </div>

                  {item.orderRequired > 0 ? (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-chip bg-danger/10 text-danger border border-danger/20">
                      Indent: {item.orderRequired}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-chip bg-ok/10 text-ok border border-ok/20">
                      Stock OK
                    </span>
                  )}
                </div>

                {/* 4 Metric Box */}
                <div className="grid grid-cols-4 gap-1.5 text-center mt-2.5 text-xs">
                  <div className="bg-canvas p-1.5 rounded border border-line">
                    <span className="text-[9px] text-ink-3 font-medium uppercase block">Orders</span>
                    <span className="font-semibold text-ink tnum mt-0.5 block">{item.totalBook}</span>
                  </div>
                  <div className="bg-canvas p-1.5 rounded border border-line">
                    <span className="text-[9px] text-ink-3 font-medium uppercase block">Alloted</span>
                    <span className="font-semibold text-ink tnum mt-0.5 block">{item.allocated}</span>
                  </div>
                  <div className="bg-canvas p-1.5 rounded border border-line">
                    <span className="text-[9px] text-ink-3 font-medium uppercase block">PBNA</span>
                    <span className="font-semibold text-ink tnum mt-0.5 block">{item.pbna}</span>
                  </div>
                  <div className="bg-canvas p-1.5 rounded border border-line">
                    <span className="text-[9px] text-ink-3 font-medium uppercase block">Free</span>
                    <span className="font-semibold text-ink tnum mt-0.5 block">{item.freeYardStock}</span>
                  </div>
                </div>
              </div>

              {/* Progress Allocation Bar */}
              <div className="space-y-1 pt-1.5 border-t border-line">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-ink-3 font-medium">Allocation Fulfilled</span>
                  <span className="font-medium text-ink tnum">{item.allocRate}%</span>
                </div>
                <div className="w-full bg-canvas border border-line rounded-full h-1 overflow-hidden">
                  <div 
                    style={{ width: `${Math.min(item.allocRate, 100)}%` }} 
                    className="h-1 rounded-full bg-ink" 
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 5. Section: Order Fulfillment Pipeline (Process Funnel) */}
      <div className="bg-surface border border-line rounded p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <div className="eyebrow">Booking Fulfillment & Delivery Pipeline</div>
          <span className="text-xs text-ink-3">Order Progression</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          
          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-surface border border-line text-ink font-medium flex items-center justify-center text-xs shrink-0 tnum">
              1
            </div>
            <div>
              <span className="text-[10px] font-medium text-ink-3 uppercase block">Advance Booked</span>
              <span className="text-sm font-semibold text-ink tnum block">{counts.totalBookings} Orders</span>
            </div>
          </div>

          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-surface border border-line text-ink font-medium flex items-center justify-center text-xs shrink-0 tnum">
              2
            </div>
            <div>
              <span className="text-[10px] font-medium text-ink-3 uppercase block">VIN Allocated</span>
              <span className="text-sm font-semibold text-ink tnum block">{counts.allocatedVehicles} Vehicles</span>
            </div>
          </div>

          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-surface border border-line text-ink font-medium flex items-center justify-center text-xs shrink-0 tnum">
              3
            </div>
            <div>
              <span className="text-[10px] font-medium text-ink-3 uppercase block">PDI Certified</span>
              <span className="text-sm font-semibold text-ink tnum block">{counts.pdiDone} Inspected</span>
            </div>
          </div>

          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-surface border border-line text-ink font-medium flex items-center justify-center text-xs shrink-0 tnum">
              4
            </div>
            <div>
              <span className="text-[10px] font-medium text-ink-3 uppercase block">Invoiced / Gatepass</span>
              <span className="text-sm font-semibold text-ink tnum block">6 Units</span>
            </div>
          </div>

          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-surface border border-line text-ink font-medium flex items-center justify-center text-xs shrink-0 tnum">
              5
            </div>
            <div>
              <span className="text-[10px] font-medium text-ink-3 uppercase block">Delivered</span>
              <span className="text-sm font-semibold text-ink tnum block">1 Delivered</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
