import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand, getBookingsForBrand } from '../data/seedData';
import { Panel, Stat, Badge, Bar } from '../components/ui/primitives';
import { MapPin } from 'lucide-react';

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

  // Yard / Facility-Wise Bookings & Inventory Aggregation
  const yardFacilities = [
    {
      id: 'yard-pune',
      name: 'Wakad Central Stockyard',
      location: 'Pune, Maharashtra',
      brand: 'Tata' as const,
      type: '3S Main Facility',
      capacity: 120,
      bookings: bookingsList.filter(b => b.organization_id === '11111111-1111-1111-1111-111111111111' || !b.model?.toLowerCase().includes('hyundai')).length,
      allocated: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111111' || !b.model?.toLowerCase().includes('hyundai')) && !!b.allocated_vin_no).length,
      physicalStock: fleetList.filter(v => (!v.model?.toLowerCase().includes('hyundai') && !v.brand?.toLowerCase().includes('hyundai')) && v.status !== 'YARD_RECEIVING_PENDING').length,
    },
    {
      id: 'yard-jaipur-tonk',
      name: 'Jaipur Tonk Road Hub',
      location: 'Jaipur, Rajasthan',
      brand: 'Hyundai' as const,
      type: '3S Main Facility',
      capacity: 150,
      bookings: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant !== 'Karan Joshi').length,
      allocated: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant !== 'Karan Joshi' && !!b.allocated_vin_no).length,
      physicalStock: 6,
    },
    {
      id: 'yard-jaipur-raja',
      name: 'Raja Park City Showroom',
      location: 'Jaipur, Rajasthan',
      brand: 'Hyundai' as const,
      type: '1S Retail Desk',
      capacity: 30,
      bookings: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant === 'Karan Joshi').length,
      allocated: bookingsList.filter(b => (b.organization_id === '11111111-1111-1111-1111-111111111112' || b.model?.toLowerCase().includes('hyundai')) && b.sales_consultant === 'Karan Joshi' && !!b.allocated_vin_no).length,
      physicalStock: 4,
    }
  ];

  // Model-Wise Booking, Allocation, PBNA & Order Deficit Analysis
  const computeModelMatrix = () => {
    const allModels = [
      { name: 'Tata Safari', brand: 'Tata' as const },
      { name: 'Tata Harrier', brand: 'Tata' as const },
      { name: 'Tata Nexon', brand: 'Tata' as const },
      { name: 'Tata Curvv.ev', brand: 'Tata' as const },
      { name: 'Tata Punch', brand: 'Tata' as const },
      { name: 'Tata Tiago', brand: 'Tata' as const },
      { name: 'Tata Altroz', brand: 'Tata' as const },
      { name: 'Hyundai Creta', brand: 'Hyundai' as const },
      { name: 'Hyundai Venue', brand: 'Hyundai' as const },
      { name: 'Hyundai Verna', brand: 'Hyundai' as const },
      { name: 'Hyundai Ioniq 5', brand: 'Hyundai' as const },
      { name: 'Hyundai Exter', brand: 'Hyundai' as const },
      { name: 'Hyundai Tucson', brand: 'Hyundai' as const }
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
          <h1 className="text-lg font-semibold tracking-[-0.011em] text-ink">
            Operations Overview
          </h1>
          <p className="text-xs text-ink-3 mt-0.5">
            Real-time pipeline, facility stock distribution, and model allocation ledger
          </p>
        </div>
      </div>

      {/* 2. Top Stats Grid using shared Stat primitive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <Stat 
          label="Total bookings" 
          value={counts.totalBookings} 
          note="Active customer orders" 
          to="/bookings" 
        />
        <Stat 
          label="VIN allocated" 
          value={counts.allocatedVehicles} 
          note="Assigned to chassis" 
          to="/bookings" 
        />
        <Stat 
          label="PBNA bookings" 
          value={counts.totalPbnaVehicle} 
          note="Awaiting allocation" 
          tone="warn" 
          to="/bookings" 
        />
        <Stat 
          label="Physical stock" 
          value={counts.totalPhysicalStock} 
          note="On-site in bays" 
          to="/vehicles" 
        />
        <Stat 
          label="Free stock" 
          value={counts.totalFreeVehicle} 
          note="Available unallocated" 
          to="/vehicles" 
        />
        <Stat 
          label="In-transit" 
          value={counts.receivingPending} 
          note="En-route carrier trailer" 
          to="/receiving" 
        />
        <Stat 
          label="Order needed" 
          value={counts.orderRequired} 
          note="Plant indent deficit" 
          tone={counts.orderRequired > 0 ? 'danger' : 'default'} 
          to="/bookings" 
        />
        <Stat 
          label="PDI certified" 
          value={counts.pdiDone} 
          note="QA inspection passed" 
          to="/pdi" 
        />
      </div>

      {/* 3. Section: Stockyard & Facility-Wise Booking Matrix */}
      <Panel 
        title="Stockyard & Facility Network" 
        action={<span className="text-xs text-ink-3">Live Network ({yardFacilities.length} facilities)</span>}
        bodyClassName="p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {yardFacilities.map((yard) => {
            const pbna = yard.bookings - yard.allocated;
            const freeStock = Math.max(0, yard.physicalStock - yard.allocated);
            const allocationPct = yard.bookings > 0 ? Math.round((yard.allocated / yard.bookings) * 100) : 0;

            return (
              <div 
                key={yard.id}
                className="bg-canvas border border-line rounded p-3.5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-line pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge tone="accent">{yard.brand}</Badge>
                        <h3 className="font-medium text-ink text-sm">{yard.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-ink-3 mt-1">
                        <MapPin className="w-3 h-3 text-ink-3" />
                        <span>{yard.location} • {yard.type}</span>
                      </div>
                    </div>
                    <span className="text-xs text-ink-3 tnum">Cap: {yard.capacity}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center mt-3">
                    <div className="bg-surface p-2 rounded border border-line">
                      <span className="eyebrow block truncate">Bookings</span>
                      <span className="text-sm font-semibold text-ink tnum mt-0.5 block">{yard.bookings}</span>
                    </div>
                    <div className="bg-surface p-2 rounded border border-line">
                      <span className="eyebrow block truncate">Allocated</span>
                      <span className="text-sm font-semibold text-ink tnum mt-0.5 block">{yard.allocated}</span>
                    </div>
                    <div className="bg-surface p-2 rounded border border-line">
                      <span className="eyebrow block truncate">PBNA</span>
                      <span className="text-sm font-semibold text-ink tnum mt-0.5 block">{pbna}</span>
                    </div>
                    <div className="bg-surface p-2 rounded border border-line">
                      <span className="eyebrow block truncate">Free</span>
                      <span className="text-sm font-semibold text-ink tnum mt-0.5 block">{freeStock}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-line">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-3 font-medium">VIN Allocation Progress</span>
                    <span className="font-medium text-ink tnum">{allocationPct}%</span>
                  </div>
                  <Bar pct={allocationPct} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* 4. Section: Model-Wise Demand & Allocation Ledger */}
      <Panel 
        title="Model Demand & Stock Allocation Ledger" 
        action={<span className="text-xs text-ink-3 tnum">{modelMatrix.length} models tracked</span>}
        bodyClassName="p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {modelMatrix.map((item, idx) => (
            <div 
              key={idx}
              className="bg-canvas border border-line rounded p-3 flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-1 border-b border-line pb-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <Badge tone="accent">{item.brand}</Badge>
                    <span className="font-medium text-ink text-xs truncate">{item.name}</span>
                  </div>

                  {item.orderRequired > 0 ? (
                    <Badge tone="danger">Indent: {item.orderRequired}</Badge>
                  ) : (
                    <Badge tone="ok">Stock OK</Badge>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-1 text-center mt-2">
                  <div className="bg-surface p-1.5 rounded border border-line">
                    <span className="eyebrow block">Orders</span>
                    <span className="font-semibold text-ink text-xs tnum mt-0.5 block">{item.totalBook}</span>
                  </div>
                  <div className="bg-surface p-1.5 rounded border border-line">
                    <span className="eyebrow block">Alloted</span>
                    <span className="font-semibold text-ink text-xs tnum mt-0.5 block">{item.allocated}</span>
                  </div>
                  <div className="bg-surface p-1.5 rounded border border-line">
                    <span className="eyebrow block">PBNA</span>
                    <span className="font-semibold text-ink text-xs tnum mt-0.5 block">{item.pbna}</span>
                  </div>
                  <div className="bg-surface p-1.5 rounded border border-line">
                    <span className="eyebrow block">Free</span>
                    <span className="font-semibold text-ink text-xs tnum mt-0.5 block">{item.freeYardStock}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-1.5 border-t border-line">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-3">Allocation Rate</span>
                  <span className="font-medium text-ink tnum">{item.allocRate}%</span>
                </div>
                <Bar pct={item.allocRate} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 5. Section: Order Fulfillment Pipeline */}
      <Panel 
        title="Booking Fulfillment & Delivery Pipeline" 
        action={<span className="text-xs text-ink-3">5 Pipeline Milestones</span>}
        bodyClassName="p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-surface border border-line text-ink text-xs font-semibold flex items-center justify-center shrink-0 tnum">
              1
            </div>
            <div>
              <span className="eyebrow block">Advance Booked</span>
              <span className="text-sm font-semibold text-ink tnum block">{counts.totalBookings} Orders</span>
            </div>
          </div>

          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-surface border border-line text-ink text-xs font-semibold flex items-center justify-center shrink-0 tnum">
              2
            </div>
            <div>
              <span className="eyebrow block">VIN Allocated</span>
              <span className="text-sm font-semibold text-ink tnum block">{counts.allocatedVehicles} Vehicles</span>
            </div>
          </div>

          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-surface border border-line text-ink text-xs font-semibold flex items-center justify-center shrink-0 tnum">
              3
            </div>
            <div>
              <span className="eyebrow block">PDI Certified</span>
              <span className="text-sm font-semibold text-ink tnum block">{counts.pdiDone} Inspected</span>
            </div>
          </div>

          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-surface border border-line text-ink text-xs font-semibold flex items-center justify-center shrink-0 tnum">
              4
            </div>
            <div>
              <span className="eyebrow block">Invoiced</span>
              <span className="text-sm font-semibold text-ink tnum block">6 Units</span>
            </div>
          </div>

          <div className="bg-canvas border border-line p-3 rounded flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-surface border border-line text-ink text-xs font-semibold flex items-center justify-center shrink-0 tnum">
              5
            </div>
            <div>
              <span className="eyebrow block">Delivered</span>
              <span className="text-sm font-semibold text-ink tnum block">1 Delivered</span>
            </div>
          </div>

        </div>
      </Panel>

    </div>
  );
};
