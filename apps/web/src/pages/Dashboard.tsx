import { formatDate } from '../utils/dateUtils';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';
import { getVehiclesForBrand, getBookingsForBrand, getActiveStockyards } from '../data/seedData';
import { Panel, Stat, Badge, Bar, PageHeader } from '../components/ui/primitives';
import { 
  Warehouse, Car, Bookmark, Truck, CheckCircle2, AlertTriangle, 
  ArrowRight, ChevronDown, ChevronRight, Sliders, ShieldCheck, Layers, Palette
} from 'lucide-react';

const cleanStr = (s?: string) => {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/\b(tata|hyundai)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const DashboardPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const counts = useFleetCounts();

  const [fleetList, setFleetList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

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

  // 1. Dynamic Stockyard Network Matrix
  const yardFacilities = useMemo(() => {
    const activeYards = getActiveStockyards(currentBrand?.code);

    return activeYards.map(yard => {
      const yardNameNorm = cleanStr(yard.name);
      
      const yardVehicles = fleetList.filter(v => {
        const vLocNorm = cleanStr(v.location);
        return vLocNorm === yardNameNorm || vLocNorm.includes(yardNameNorm) || yardNameNorm.includes(vLocNorm);
      });

      const physicalStock = yardVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING' && v.location !== 'In Transit').length;
      const allocated = yardVehicles.filter(v => (!!v.customer_name && String(v.customer_name).toLowerCase() !== 'unallocated') || v.status === 'ALLOCATED').length;
      const freeStock = Math.max(0, physicalStock - allocated);
      const gateInward = yardVehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING' || v.location === 'In Transit').length;
      
      const allocationPct = physicalStock > 0 ? Math.round((allocated / physicalStock) * 100) : 0;

      return {
        id: yard.id,
        name: yard.name,
        brand: yard.brand,
        city: yard.city,
        capacity: yard.capacity,
        physicalStock,
        allocated,
        freeStock,
        gateInward,
        allocationPct
      };
    });
  }, [currentBrand?.code, fleetList]);

  // 2. Comprehensive Model-Wise Demand & PBNA/VNA Ledger with Variant & Colour Breakdown
  const modelMatrix = useMemo(() => {
    const stockModelNames = fleetList.map(v => v.model).filter(Boolean);
    const bookingModelNames = bookingsList.map(b => b.model).filter(Boolean);
    const allUniqueNames = Array.from(new Set([...currentBrand.models, ...stockModelNames, ...bookingModelNames]));

    return allUniqueNames.map(modelName => {
      const normModel = cleanStr(modelName);

      // All Bookings for this model
      const modelBookings = bookingsList.filter(b => cleanStr(b.model) === normModel || cleanStr(b.model).includes(normModel) || normModel.includes(cleanStr(b.model)));
      const totalBookings = modelBookings.length;
      const allocatedBookings = modelBookings.filter(b => !!b.allocated_vin_no && String(b.allocated_vin_no).trim() !== '').length;
      const unallocatedBookings = modelBookings.filter(b => !b.allocated_vin_no || String(b.allocated_vin_no).trim() === '');

      // All Stock for this model
      const modelVehicles = fleetList.filter(v => cleanStr(v.model) === normModel || cleanStr(v.model).includes(normModel) || normModel.includes(cleanStr(v.model)));
      const physicalInYard = modelVehicles.filter(v => v.status !== 'YARD_RECEIVING_PENDING' && v.location !== 'In Transit').length;
      const freeYardStock = modelVehicles.filter(v => 
        v.status !== 'YARD_RECEIVING_PENDING' && 
        v.location !== 'In Transit' && 
        (!v.customer_name || String(v.customer_name).toLowerCase() === 'unallocated') && 
        v.status !== 'ALLOCATED'
      ).length;
      const inTransit = modelVehicles.filter(v => v.location === 'In Transit' || v.status === 'YARD_RECEIVING_PENDING').length;
      
      // Calculate PBNA vs VNA for this model
      const pbna = Math.min(unallocatedBookings.length, freeYardStock);
      const vna = Math.max(0, unallocatedBookings.length - freeYardStock);
      const allocRate = totalBookings > 0 ? Math.round((allocatedBookings / totalBookings) * 100) : (physicalInYard > 0 ? 100 : 0);

      // 3. Variant & Colour-Wise Drilldown Data
      const variantColourMap: Record<string, {
        variant: string;
        colour: string;
        bookings: number;
        allocated: number;
        pbna: number;
        vna: number;
        freeStock: number;
        matchedVins: string[];
      }> = {};

      // Gather distinct Variant + Colour combos from bookings & stock
      const allCombos = new Set<string>();
      modelBookings.forEach(b => {
        const key = `${b.variant || 'Standard'} ••• ${b.colour || 'Standard'}`;
        allCombos.add(key);
      });
      modelVehicles.forEach(v => {
        const key = `${v.variant || 'Standard'} ••• ${v.color || v.colour || 'Standard'}`;
        allCombos.add(key);
      });

      allCombos.forEach(key => {
        const [variant, colour] = key.split(' ••• ');
        const vClean = cleanStr(variant);
        const cClean = cleanStr(colour);

        const subBookings = modelBookings.filter(b => 
          cleanStr(b.variant) === vClean && 
          cleanStr(b.colour) === cClean
        );
        const subAllocated = subBookings.filter(b => !!b.allocated_vin_no).length;
        const subUnallocated = subBookings.filter(b => !b.allocated_vin_no).length;

        const subFreeVehicles = modelVehicles.filter(v => 
          cleanStr(v.variant) === vClean && 
          cleanStr(v.color || v.colour) === cClean &&
          (!v.customer_name || String(v.customer_name).toLowerCase() === 'unallocated') &&
          v.status !== 'ALLOCATED' &&
          v.location !== 'In Transit'
        );

        const subPbna = Math.min(subUnallocated, subFreeVehicles.length);
        const subVna = Math.max(0, subUnallocated - subFreeVehicles.length);

        variantColourMap[key] = {
          variant,
          colour,
          bookings: subBookings.length,
          allocated: subAllocated,
          pbna: subPbna,
          vna: subVna,
          freeStock: subFreeVehicles.length,
          matchedVins: subFreeVehicles.map(v => `${v.vin} (${v.location || 'Basni Yard'})`)
        };
      });

      return {
        name: modelName,
        brand: currentBrand.shortName || 'OEM',
        totalBookings,
        allocatedBookings,
        pbna,
        vna,
        physicalInYard,
        freeYardStock,
        inTransit,
        allocRate,
        drilldown: Object.values(variantColourMap)
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

      {/* 2. Top 8 KPI Metric Cards Row (Exact PBNA & VNA) */}
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
          label="PBNA (In Stock)" 
          value={counts.totalPbnaVehicle} 
          note="Stock Available to Allot" 
          tone={counts.totalPbnaVehicle > 0 ? 'warn' : 'default'} 
          to="/bookings" 
        />
        <Stat 
          label="Not in Stock (VNA)" 
          value={counts.totalVnaVehicle} 
          note="Factory Indent Needed" 
          tone={counts.totalVnaVehicle > 0 ? 'danger' : 'default'} 
          to="/bookings" 
        />
        <Stat 
          label="Physical Yard Stock" 
          value={counts.totalPhysicalStock} 
          note="In Dealership Yards" 
          to="/vehicles" 
        />
        <Stat 
          label="Free Yard Stock" 
          value={counts.totalFreeVehicle} 
          note="Available Unassigned" 
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
          label="PDI Certified" 
          value={counts.pdiDone} 
          note="Ready for Delivery" 
          tone="accent"
          to="/pdi" 
        />
      </div>

      {/* 3. Section: Stockyard & Facility Network */}
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
                <th className="py-2.5 px-3 text-right">Physical Stock</th>
                <th className="py-2.5 px-3 text-right">VIN Allocated</th>
                <th className="py-2.5 px-3 text-right">Free Stock</th>
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

      {/* 4. Section: Model-Wise Demand & PBNA/VNA Allocation Ledger with Interactive Click Drilldown */}
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
            <span className="text-[11px] text-ink-3">💡 Click any model to view Variant & Colour breakdown</span>
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
                <th className="py-2.5 px-3 w-8 text-center"></th>
                <th className="py-2.5 px-3">Vehicle Model</th>
                <th className="py-2.5 px-3 text-right">Customer Bookings</th>
                <th className="py-2.5 px-3 text-right">VIN Allocated</th>
                <th className="py-2.5 px-3 text-right">PBNA (In Stock)</th>
                <th className="py-2.5 px-3 text-right">Not in Stock (VNA)</th>
                <th className="py-2.5 px-3 text-right">Physical Yard Stock</th>
                <th className="py-2.5 px-3 text-right">Free Stock</th>
                <th className="py-2.5 px-3 text-right">In-Transit</th>
                <th className="py-2.5 px-3 w-36">Allocation Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {modelMatrix.map((item, idx) => {
                const isExpanded = expandedModel === item.name;

                return (
                  <React.Fragment key={idx}>
                    <tr 
                      onClick={() => setExpandedModel(isExpanded ? null : item.name)}
                      className={`cursor-pointer transition-colors ${isExpanded ? 'bg-accent/5 font-medium' : 'hover:bg-canvas'}`}
                    >
                      <td className="py-2.5 px-3 text-center text-ink-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-accent mx-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-ink-3 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="text-accent hover:underline">{item.name}</span>
                          <span className="text-[10px] text-ink-3 font-normal">({item.drilldown.length} variants/colours)</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-ink tnum">
                        {item.totalBookings}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-ok tnum">
                        {item.allocatedBookings}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-warn tnum">
                        {item.pbna}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold tnum">
                        {item.vna > 0 ? (
                          <span className="text-danger">+{item.vna}</span>
                        ) : (
                          <span className="text-ink-3">0</span>
                        )}
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
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <Bar pct={item.allocRate} className="flex-1" />
                          <span className="w-10 text-right text-ink font-bold tnum text-[11px]">{item.allocRate}%</span>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED VARIANT & COLOUR DRILLDOWN */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} className="p-0 bg-canvas/50">
                          <div className="p-4 border-y-2 border-accent/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-accent" />
                                <strong className="text-sm text-ink">{item.name} Detailed Variant & Colour Matrix</strong>
                              </div>
                              <span className="text-xs text-ink-3">
                                {item.drilldown.length} Configurations in System
                              </span>
                            </div>

                            <div className="overflow-x-auto bg-surface border border-line rounded">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase text-[10px]">
                                  <tr>
                                    <th className="py-2 px-3">#</th>
                                    <th className="py-2 px-3">Variant Specification</th>
                                    <th className="py-2 px-3">Exterior Colour</th>
                                    <th className="py-2 px-3 text-right">Customer Orders</th>
                                    <th className="py-2 px-3 text-right">VIN Allocated</th>
                                    <th className="py-2 px-3 text-right">PBNA (In Stock)</th>
                                    <th className="py-2 px-3 text-right">Not in Stock (VNA)</th>
                                    <th className="py-2 px-3 text-right">Free Yard Stock</th>
                                    <th className="py-2 px-3">Stock Allocation Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-line text-ink-2">
                                  {item.drilldown.length === 0 ? (
                                    <tr>
                                      <td colSpan={9} className="py-4 text-center text-ink-3">
                                        No bookings or stock registered for this model yet.
                                      </td>
                                    </tr>
                                  ) : (
                                    item.drilldown.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-canvas transition-colors">
                                        <td className="py-2 px-3 text-ink-3 font-mono text-[11px]">{rIdx + 1}</td>
                                        <td className="py-2 px-3 font-medium text-ink">{row.variant}</td>
                                        <td className="py-2 px-3">
                                          <div className="flex items-center gap-1.5">
                                            <Palette className="w-3 h-3 text-ink-3" />
                                            <span>{row.colour}</span>
                                          </div>
                                        </td>
                                        <td className="py-2 px-3 text-right font-medium text-ink tnum">{row.bookings}</td>
                                        <td className="py-2 px-3 text-right font-medium text-ok tnum">{row.allocated}</td>
                                        <td className="py-2 px-3 text-right font-bold text-warn tnum">{row.pbna}</td>
                                        <td className="py-2 px-3 text-right font-bold tnum">
                                          {row.vna > 0 ? (
                                            <span className="text-danger">+{row.vna}</span>
                                          ) : (
                                            <span className="text-ink-3">0</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-right font-bold text-ok tnum">{row.freeStock}</td>
                                        <td className="py-2 px-3 whitespace-nowrap">
                                          {row.vna > 0 ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-danger/10 text-danger border border-danger/30">
                                              Indent Needed ({row.vna} Units)
                                            </span>
                                          ) : row.pbna > 0 ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-warn/10 text-warn border border-warn/30">
                                              Ready for Allotment ({row.pbna} Units)
                                            </span>
                                          ) : row.freeStock > 0 ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/30">
                                              Available Free ({row.freeStock} Units)
                                            </span>
                                          ) : (
                                            <span className="text-ink-3 text-[11px]">All Settled</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
