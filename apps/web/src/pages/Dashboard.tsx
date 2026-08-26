import { formatDate } from '../utils/dateUtils';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';
import { getVehiclesForBrand, getBookingsForBrand, getActiveStockyards } from '../data/seedData';
import { Panel, Stat, Badge, Bar, PageHeader } from '../components/ui/primitives';
import { Warehouse, Car, Bookmark, Truck, CheckCircle2, AlertTriangle, ArrowRight, Sliders, ShieldCheck } from 'lucide-react';

const normalizeStr = (str?: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const DashboardPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const counts = useFleetCounts();

  const [fleetList, setFleetList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    const handleDataUpdate = () => {
      fetchDashboardData();
    };

    window.addEventListener('stock-updated', handleDataUpdate);
    window.addEventListener('bookings-updated', handleDataUpdate);
    window.addEventListener('challans-updated', handleDataUpdate);
    window.addEventListener('stockyards-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('stock-updated', handleDataUpdate);
      window.removeEventListener('bookings-updated', handleDataUpdate);
      window.removeEventListener('challans-updated', handleDataUpdate);
      window.removeEventListener('stockyards-updated', handleDataUpdate);
    };
  }, [currentBrand?.code]);

  const fetchDashboardData = () => {
    setLoading(true);
    try {
      const stock = getVehiclesForBrand(currentBrand.code);
      const bookings = getBookingsForBrand(currentBrand.code);
      setFleetList(stock);
      setBookingsList(bookings);
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
      setFleetList([]);
      setBookingsList([]);
    } finally {
      setLoading(false);
    }
  };

  // 1. Dynamic Stockyard Network Matrix from Active Yards & Real Stock
  const yardFacilities = useMemo(() => {
    const activeYards = getActiveStockyards(currentBrand?.code);

    return activeYards.map(yard => {
      const yardNameNorm = normalizeStr(yard.name);
      
      const yardVehicles = fleetList.filter(v => {
        const vLocNorm = normalizeStr(v.location);
        return vLocNorm === yardNameNorm || vLocNorm.includes(yardNameNorm) || yardNameNorm.includes(vLocNorm);
      });

      const physicalStock = yardVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING' && v.location !== 'In Transit').length;
      const allocated = yardVehicles.filter(v => !!v.customer_name || v.status === 'ALLOCATED').length;
      const freeStock = Math.max(0, physicalStock - allocated);
      const gateInward = yardVehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING' || v.location === 'In Transit').length;
      
      const allocationPct = physicalStock > 0 ? Math.round((allocated / physicalStock) * 100) : 0;

      return {
        id: yard.id,
        name: yard.name,
        brand: yard.brand,
        city: yard.city,
        capacity: yard.capacity,
        manager: yard.manager,
        phone: yard.phone,
        physicalStock,
        allocated,
        freeStock,
        gateInward,
        allocationPct
      };
    });
  }, [currentBrand?.code, fleetList]);

  // 2. Comprehensive Model-Wise Demand & Allocation Ledger (100% Real Live Data)
  const modelMatrix = useMemo(() => {
    // Collect all unique model names from live stock and bookings
    const knownModels = currentBrand.models.map(m => ({ name: m, brand: currentBrand.name }));
    const stockModelNames = fleetList.map(v => v.model).filter(Boolean);
    const bookingModelNames = bookingsList.map(b => b.model).filter(Boolean);
    const allUniqueNames = Array.from(new Set([...currentBrand.models, ...stockModelNames, ...bookingModelNames]));

    return allUniqueNames.map(modelName => {
      const normModel = normalizeStr(modelName);

      // Bookings for this model
      const modelBookings = bookingsList.filter(b => normalizeStr(b.model) === normModel || normModel.includes(normalizeStr(b.model)));
      const totalBookings = modelBookings.length;
      const allocatedBookings = modelBookings.filter(b => !!b.allocated_vin_no).length;
      const pbna = Math.max(0, totalBookings - allocatedBookings);

      // Stock for this model
      const modelVehicles = fleetList.filter(v => normalizeStr(v.model) === normModel || normModel.includes(normalizeStr(v.model)));
      const physicalInYard = modelVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING' && v.location !== 'In Transit').length;
      const freeYardStock = modelVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING' && v.location !== 'In Transit' && !v.customer_name && v.status !== 'ALLOCATED').length;
      const inTransit = modelVehicles.filter(v => v.location === 'In Transit' || v.status === 'YARD_RECEIVING_PENDING').length;
      
      const indentRequired = Math.max(0, pbna - freeYardStock);
      const allocRate = totalBookings > 0 ? Math.round((allocatedBookings / totalBookings) * 100) : (physicalInYard > 0 ? 100 : 0);

      return {
        name: modelName,
        brand: currentBrand.shortName || 'OEM',
        totalBookings,
        allocatedBookings,
        pbna,
        physicalInYard,
        freeYardStock,
        inTransit,
        indentRequired,
        allocRate
      };
    });
  }, [currentBrand?.code, fleetList, bookingsList]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* 1. Page Header */}
      <PageHeader
        title="Operations Overview"
        subtitle="100% Live Dealership Vehicle Ledger • Realtime Booking Pipeline, Stockyard Network & PBNA/VNA Status"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-surface border border-line rounded text-ink shadow-xs">
              {currentBrand.code === 'DHOOT-ALL' ? 'All Dealerships' : currentBrand.name}
            </span>
          </div>
        }
      />

      {/* 2. Top 8 KPI Metric Cards Row (Clean, readable, actionable) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <Stat 
          label="Total Bookings" 
          value={counts.totalBookings} 
          note="Customer Orders" 
          to="/bookings" 
        />
        <Stat 
          label="VIN Allocated" 
          value={counts.allocatedVehicles} 
          note="Tagged to Chassis" 
          to="/bookings" 
          tone="ok"
        />
        <Stat 
          label="PBNA Bookings" 
          value={counts.totalPbnaVehicle} 
          note="Pending Allocation" 
          tone={counts.totalPbnaVehicle > 0 ? 'warn' : 'default'} 
          to="/bookings" 
        />
        <Stat 
          label="Physical Stock" 
          value={counts.totalPhysicalStock} 
          note="In Dealership Yards" 
          to="/vehicles" 
        />
        <Stat 
          label="Free Stock (VNA)" 
          value={counts.totalFreeVehicle} 
          note="Available for Booking" 
          tone="ok" 
          to="/vehicles" 
        />
        <Stat 
          label="In-Transit / Gate" 
          value={counts.receivingPending} 
          note="En-Route Carrier" 
          to="/receiving" 
        />
        <Stat 
          label="Indent Deficit" 
          value={counts.orderRequired} 
          note="Reorder Needed" 
          tone={counts.orderRequired > 0 ? 'danger' : 'default'} 
          to="/bookings" 
        />
        <Stat 
          label="PDI Certified" 
          value={counts.pdiDone} 
          note="Ready for Delivery" 
          tone="accent"
          to="/pdi" 
        />
      </div>

      {/* 3. Section: Stockyard & Facility Network (100% Real Live Active Yards) */}
      <Panel 
        title={
          <div className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-accent" />
            <span>Stockyard Facility Network</span>
            <Badge tone="accent">{yardFacilities.length} Active Yards</Badge>
          </div>
        }
        action={
          <Link to="/vehicles" className="text-xs text-accent hover:underline font-semibold flex items-center gap-1">
            <span>Open Stock Sheet</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Stockyard Facility</th>
                <th className="py-2.5 px-3">Location / City</th>
                <th className="py-2.5 px-3">Yard In-Charge</th>
                <th className="py-2.5 px-3 text-right">Physical Stock</th>
                <th className="py-2.5 px-3 text-right">VIN Allocated</th>
                <th className="py-2.5 px-3 text-right">Free Stock (VNA)</th>
                <th className="py-2.5 px-3 text-right">Gate Inward</th>
                <th className="py-2.5 px-3 w-48">Allocation Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {yardFacilities.map((yard, idx) => (
                <tr key={yard.id || idx} className="hover:bg-canvas transition-colors">
                  <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{yard.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                    {yard.city}
                  </td>
                  <td className="py-2.5 px-3 text-ink whitespace-nowrap">
                    {yard.manager}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-ink tnum">
                    {yard.physicalStock}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                    {yard.allocated}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-ok tnum">
                    {yard.freeStock}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-warn tnum">
                    {yard.gateInward}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Bar pct={yard.allocationPct} className="flex-1" />
                      <span className="w-10 text-right text-ink font-bold tnum text-[11px]">{yard.allocationPct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 4. Section: Model-Wise Demand & Allocation Ledger */}
      <Panel 
        title={
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-accent" />
            <span>Model Demand & PBNA / VNA Allocation Ledger</span>
            <Badge tone="accent">{modelMatrix.length} Models</Badge>
          </div>
        }
        action={
          <div className="flex items-center gap-3">
            <Link to="/bookings" className="text-xs text-accent hover:underline font-semibold flex items-center gap-1">
              <span>View Bookings (PBNA)</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Vehicle Model</th>
                <th className="py-2.5 px-3 text-right">Customer Bookings</th>
                <th className="py-2.5 px-3 text-right">VIN Allocated</th>
                <th className="py-2.5 px-3 text-right">PBNA (Pending)</th>
                <th className="py-2.5 px-3 text-right">Physical Yard Stock</th>
                <th className="py-2.5 px-3 text-right">Free Stock (VNA)</th>
                <th className="py-2.5 px-3 text-right">In-Transit</th>
                <th className="py-2.5 px-3 text-right">Indent Deficit</th>
                <th className="py-2.5 px-3 w-40">Allocation Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {modelMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-canvas transition-colors">
                  <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                    {item.totalBookings}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-ok tnum">
                    {item.allocatedBookings}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-warn tnum">
                    {item.pbna}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                    {item.physicalInYard}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-ok tnum">
                    {item.freeYardStock}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-ink-3 tnum">
                    {item.inTransit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold tnum">
                    {item.indentRequired > 0 ? (
                      <span className="text-danger">+{item.indentRequired}</span>
                    ) : (
                      <span className="text-ok">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Bar pct={item.allocRate} className="flex-1" />
                      <span className="w-10 text-right text-ink font-bold tnum text-[11px]">{item.allocRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
