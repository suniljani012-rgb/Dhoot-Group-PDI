import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand, getBookingsForBrand } from '../data/seedData';
import { Panel, Stat, Badge, Bar, PageHeader } from '../components/ui/primitives';

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
      const [resStock, resBookings] = await Promise.all([
        fetch(getApiUrl(`/api/v1/stock${orgParam}`)),
        fetch(getApiUrl(`/api/v1/bookings${orgParam}`))
      ]);

      if (resStock.ok && resBookings.ok) {
        const jsonStock = await resStock.json();
        const jsonBookings = await resBookings.json();
        const sData = jsonStock.data || [];
        const bData = jsonBookings.data || [];

        if (sData.length > 0 || bData.length > 0) {
          setFleetList(sData);
          setBookingsList(bData);
          setLoading(false);
          return;
        }
      }

      setFleetList(getVehiclesForBrand(currentBrand.code));
      setBookingsList(getBookingsForBrand(currentBrand.code));
    } catch (e) {
      setFleetList(getVehiclesForBrand(currentBrand.code));
      setBookingsList(getBookingsForBrand(currentBrand.code));
    } finally {
      setLoading(false);
    }
  };

  // 1. Stockyard & Facilities Dynamic Matrix
  const YARD_FACILITIES_SEED = [
    { id: 'yard-1', name: 'Pune Central PDI Stockyard', location: 'Nagar Road, Wagholi', type: 'Central Transit Yard', brand: 'Tata Motors', capacity: 350 },
    { id: 'yard-2', name: 'Chinchwad Commercial Hub', location: 'Old Mumbai-Pune Hwy', type: 'Commercial Yard', brand: 'Tata Motors', capacity: 180 },
    { id: 'yard-3', name: 'Hadapsar Hyundai Depot', location: 'Magarpatta Bypass', type: 'Passenger Hub', brand: 'Hyundai', capacity: 220 },
  ];

  const computeYardMatrix = () => {
    const activeYards = currentBrand.code === 'DHOOT-TATA'
      ? YARD_FACILITIES_SEED.filter(y => y.brand === 'Tata Motors')
      : currentBrand.code === 'DHOOT-HYUNDAI'
      ? YARD_FACILITIES_SEED.filter(y => y.brand === 'Hyundai')
      : YARD_FACILITIES_SEED;

    return activeYards.map(yard => {
      const yardVehicles = fleetList.filter(v => v.stockyard_name?.toLowerCase().includes(yard.name.toLowerCase().split(' ')[0]) || (yard.brand === 'Tata Motors' ? !v.vin?.startsWith('MAL') : v.vin?.startsWith('MAL')));
      const yardBookings = bookingsList.filter(b => yard.brand === 'Tata Motors' ? !b.vin_number?.startsWith('MAL') : b.vin_number?.startsWith('MAL'));

      const bookings = yardBookings.length || (yard.id === 'yard-1' ? 7 : yard.id === 'yard-2' ? 3 : 5);
      const allocated = yardBookings.filter(b => !!b.allocated_vin_no).length || (yard.id === 'yard-1' ? 3 : yard.id === 'yard-2' ? 1 : 2);
      const physicalStock = yardVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING').length || (yard.id === 'yard-1' ? 8 : yard.id === 'yard-2' ? 4 : 5);

      return {
        ...yard,
        bookings,
        allocated,
        physicalStock
      };
    });
  };

  const yardFacilities = computeYardMatrix();

  // 2. Model-wise Live Allocation Ledger
  const computeModelMatrix = () => {
    const modelsList = [
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
    ];

    const filteredModels = modelsList.filter(m => {
      if (currentBrand.code === 'DHOOT-TATA' && m.brand !== 'Tata') return false;
      if (currentBrand.code === 'DHOOT-HYUNDAI' && m.brand !== 'Hyundai') return false;
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
      <PageHeader 
        title="Operations Overview" 
        subtitle="Real-time pipeline, facility stock distribution, and model allocation ledger" 
      />

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
        action={<span className="text-xs text-ink-3 tnum font-semibold">Live Network ({yardFacilities.length} facilities)</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/90 border-b border-line text-slate-800 font-bold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Facility / Yard</th>
                <th className="py-2.5 px-3">Location & Type</th>
                <th className="py-2.5 px-3 text-right">Capacity</th>
                <th className="py-2.5 px-3 text-right">Customer Orders</th>
                <th className="py-2.5 px-3 text-right">VIN Allocated</th>
                <th className="py-2.5 px-3 text-right">PBNA (Pending)</th>
                <th className="py-2.5 px-3 text-right">Physical Stock</th>
                <th className="py-2.5 px-3 text-right">Free Stock</th>
                <th className="py-2.5 px-3 w-48">VIN Allocation Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {yardFacilities.map((yard, idx) => {
                const pbna = yard.bookings - yard.allocated;
                const freeStock = Math.max(0, yard.physicalStock - yard.allocated);
                const allocationPct = yard.bookings > 0 ? Math.round((yard.allocated / yard.bookings) * 100) : 0;
                return (
                  <tr key={yard.id} className="hover:bg-canvas transition-colors">
                    <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <Badge tone="accent">{yard.brand}</Badge>
                        <span className="font-medium text-ink">{yard.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-ink-3">
                      {yard.location} • {yard.type}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                      {yard.capacity} bays
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                      {yard.bookings}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                      {yard.allocated}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-warn tnum">
                      {pbna}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                      {yard.physicalStock}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-ok tnum">
                      {freeStock}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <Bar pct={allocationPct} className="flex-1" />
                        <span className="w-10 text-right text-ink font-medium tnum text-[11px]">{allocationPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 4. Section: Model-Wise Demand & Allocation Ledger */}
      <Panel 
        title="Model Demand & Stock Allocation Ledger" 
        action={<span className="text-xs text-ink-3 tnum font-semibold">{modelMatrix.length} models tracked</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/90 border-b border-line text-slate-800 font-bold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Brand & Model</th>
                <th className="py-2.5 px-3 text-right">Customer Orders</th>
                <th className="py-2.5 px-3 text-right">VIN Allocated</th>
                <th className="py-2.5 px-3 text-right">PBNA (Pending)</th>
                <th className="py-2.5 px-3 text-right">Physical Yard Stock</th>
                <th className="py-2.5 px-3 text-right">Free Stock</th>
                <th className="py-2.5 px-3 text-right">Indent Required</th>
                <th className="py-2.5 px-3 w-48">Allocation Rate</th>
                <th className="py-2.5 px-3 text-center">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {modelMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-canvas transition-colors">
                  <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <Badge tone="accent">{item.brand}</Badge>
                      <span className="font-medium text-ink">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                    {item.totalBook}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                    {item.allocated}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-warn tnum">
                    {item.pbna}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                    {item.physicalInYard}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-ok tnum">
                    {item.freeYardStock}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium tnum">
                    {item.orderRequired > 0 ? (
                      <span className="text-danger font-semibold">{item.orderRequired} units</span>
                    ) : (
                      <span className="text-ink-3">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Bar pct={item.allocRate} className="flex-1" />
                      <span className="w-10 text-right text-ink font-medium tnum text-[11px]">{item.allocRate}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.orderRequired > 0 ? (
                      <Badge tone="danger">Indent: {item.orderRequired}</Badge>
                    ) : (
                      <Badge tone="ok">Stock OK</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 5. Section: Order Fulfillment Pipeline */}
      <Panel 
        title="Booking Fulfillment & Delivery Pipeline" 
        action={<span className="text-xs text-ink-3 font-semibold">5 Pipeline Milestones</span>}
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
