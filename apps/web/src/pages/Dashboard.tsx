import { formatDate } from '../utils/dateUtils';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';
import { getVehiclesForBrand, getBookingsForBrand, getActiveStockyards } from '../data/seedData';
import { Panel, Stat, Badge, Bar, PageHeader } from '../components/ui/primitives';
import { 
  Warehouse, Car, Bookmark, Truck, CheckCircle2, AlertTriangle, 
  ArrowRight, Search, Download, X, Sliders, ShieldCheck, Layers, Palette, Filter, User, Phone, IndianRupee, Calendar
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

  // Dedicated Model Customer & Indent Orders Modal state
  const [selectedModalModel, setSelectedModalModel] = useState<string | null>(null);
  const [drilldownSearch, setDrilldownSearch] = useState('');
  const [variantFilter, setVariantFilter] = useState<string>('ALL');
  const [colourFilter, setColourFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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

  // 2. Comprehensive Model-Wise Demand & PBNA/VNA Ledger
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

      // Detailed Customer Bookings with Exact Stock Match
      const matchedVinSet = new Set<string>();
      const detailedBookings = modelBookings.map((b, bIdx) => {
        const isAllocated = !!b.allocated_vin_no && String(b.allocated_vin_no).trim() !== '';
        
        let stockStatus: 'ALLOCATED' | 'PBNA' | 'VNA' = 'VNA';
        let matchedStockVin: string | null = null;
        let matchedLocation: string | null = null;

        if (isAllocated) {
          stockStatus = 'ALLOCATED';
          matchedStockVin = b.allocated_vin_no;
          const foundVeh = fleetList.find(v => v.vin === b.allocated_vin_no);
          matchedLocation = foundVeh?.location || 'Basni Yard';
        } else {
          // Look for 3-way exact free vehicle in stock
          const bVariantClean = cleanStr(b.variant);
          const bColorClean = cleanStr(b.colour);

          const freeMatch = modelVehicles.find(v => {
            if (matchedVinSet.has(v.vin)) return false;
            const isFree = (!v.customer_name || String(v.customer_name).toLowerCase() === 'unallocated') &&
                           v.status !== 'ALLOCATED' &&
                           v.location !== 'In Transit';
            if (!isFree) return false;

            const vVariantClean = cleanStr(v.variant);
            const vColorClean = cleanStr(v.color || v.colour);

            const vMatch = !bVariantClean || !vVariantClean || vVariantClean === bVariantClean || vVariantClean.includes(bVariantClean) || bVariantClean.includes(vVariantClean);
            const cMatch = !bColorClean || !vColorClean || vColorClean === bColorClean || vColorClean.includes(bColorClean) || bColorClean.includes(vColorClean);

            return vMatch && cMatch;
          });

          if (freeMatch) {
            matchedVinSet.add(freeMatch.vin);
            stockStatus = 'PBNA';
            matchedStockVin = freeMatch.vin;
            matchedLocation = freeMatch.location || 'Basni Yard';
          } else {
            stockStatus = 'VNA';
          }
        }

        return {
          id: b.id || `bk-${bIdx}`,
          receipt_no: b.receipt_no || '—',
          receipt_date: b.receipt_date || b.created_at || '',
          customer_name: b.customer_name || 'Customer',
          mobile_number: b.mobile_number || '—',
          model: b.model || modelName,
          variant: b.variant || 'Standard',
          colour: b.colour || '—',
          sales_consultant: b.sales_consultant || 'Sales Desk',
          team_leader: b.team_leader || '—',
          receipt_amt: Number(b.receipt_amt) || 0,
          delivery_date: b.delivery_date || '',
          hypothecation: b.hypothecation || 'Self Funded',
          stockStatus,
          matchedStockVin,
          matchedLocation
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
        detailedBookings
      };
    });
  }, [currentBrand?.code, fleetList, bookingsList]);

  // Selected Model Data for Modal
  const activeModalData = useMemo(() => {
    if (!selectedModalModel) return null;
    return modelMatrix.find(m => m.name === selectedModalModel) || null;
  }, [selectedModalModel, modelMatrix]);

  // Unique variants and colours for dropdown filter
  const uniqueVariantsForModel = useMemo(() => {
    if (!activeModalData) return [];
    return Array.from(new Set(activeModalData.detailedBookings.map(d => d.variant).filter(Boolean))).sort();
  }, [activeModalData]);

  const uniqueColoursForModel = useMemo(() => {
    if (!activeModalData) return [];
    return Array.from(new Set(activeModalData.detailedBookings.map(d => d.colour).filter(Boolean))).sort();
  }, [activeModalData]);

  // Filtered Customer Indent Bookings rows for active modal
  const filteredModalBookings = useMemo(() => {
    if (!activeModalData) return [];
    const q = drilldownSearch.trim().toLowerCase();
    
    return activeModalData.detailedBookings.filter(d => {
      const matchesSearch = 
        !q || 
        d.customer_name.toLowerCase().includes(q) ||
        d.receipt_no.toLowerCase().includes(q) ||
        d.mobile_number.toLowerCase().includes(q) ||
        d.variant.toLowerCase().includes(q) ||
        d.colour.toLowerCase().includes(q) ||
        d.sales_consultant.toLowerCase().includes(q) ||
        (d.matchedStockVin || '').toLowerCase().includes(q);

      const matchesVariant = variantFilter === 'ALL' || d.variant === variantFilter;
      const matchesColour = colourFilter === 'ALL' || d.colour === colourFilter;
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'VNA' && d.stockStatus === 'VNA') ||
        (statusFilter === 'PBNA' && d.stockStatus === 'PBNA') ||
        (statusFilter === 'ALLOCATED' && d.stockStatus === 'ALLOCATED');

      return matchesSearch && matchesVariant && matchesColour && matchesStatus;
    });
  }, [activeModalData, drilldownSearch, variantFilter, colourFilter, statusFilter]);

  // Dynamic KPI stats calculated strictly based on active filter
  const modalFilteredStats = useMemo(() => {
    const totalBookings = filteredModalBookings.length;
    const allocated = filteredModalBookings.filter(d => d.stockStatus === 'ALLOCATED').length;
    const pbna = filteredModalBookings.filter(d => d.stockStatus === 'PBNA').length;
    const vna = filteredModalBookings.filter(d => d.stockStatus === 'VNA').length;
    const totalAdvance = filteredModalBookings.reduce((sum, d) => sum + d.receipt_amt, 0);
    return { totalBookings, allocated, pbna, vna, totalAdvance };
  }, [filteredModalBookings]);

  // Export filtered Customer Indent Sheet CSV
  const handleExportDrilldownCSV = () => {
    if (!activeModalData || filteredModalBookings.length === 0) return;
    const headers = [
      'Receipt Date', 'Receipt No', 'Customer Name', 'Mobile No', 'Model', 'Variant', 'Colour',
      'Sales Consultant', 'Team Leader', 'Received Amount', 'Delivery Date', 'Financier', 'Stock Status', 'Allocated / Matched VIN', 'Yard Location'
    ];
    const rows = [
      headers.join(','),
      ...filteredModalBookings.map(d => [
        `"${formatDate(d.receipt_date)}"`,
        `"${d.receipt_no}"`,
        `"${d.customer_name}"`,
        `"${d.mobile_number}"`,
        `"${d.model}"`,
        `"${d.variant}"`,
        `"${d.colour}"`,
        `"${d.sales_consultant}"`,
        `"${d.team_leader}"`,
        d.receipt_amt,
        `"${d.delivery_date ? formatDate(d.delivery_date) : ''}"`,
        `"${d.hypothecation}"`,
        `"${d.stockStatus === 'VNA' ? 'Not in Stock (Indent Required)' : d.stockStatus === 'PBNA' ? 'PBNA (Vehicle In Stock)' : 'VIN Allocated'}"`,
        `"${d.matchedStockVin || ''}"`,
        `"${d.matchedLocation || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeModalData.name}_Customer_Indent_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

      {/* 2. Top 8 KPI Metric Cards Row */}
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

      {/* 4. Section: Model-Wise Demand & PBNA/VNA Allocation Ledger */}
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
              <span>View All Bookings</span>
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
                <th className="py-2.5 px-3 text-right">Customer Orders</th>
                <th className="py-2.5 px-3 text-right">VIN Allocated</th>
                <th className="py-2.5 px-3 text-right">PBNA (In Stock)</th>
                <th className="py-2.5 px-3 text-right">Not in Stock (VNA)</th>
                <th className="py-2.5 px-3 text-right">Physical Yard Stock</th>
                <th className="py-2.5 px-3 text-right">Free Stock</th>
                <th className="py-2.5 px-3 text-right">In-Transit</th>
                <th className="py-2.5 px-3 w-36">Allocation Rate</th>
                <th className="py-2.5 px-3 text-center">Customer Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {modelMatrix.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => {
                    setSelectedModalModel(item.name);
                    setDrilldownSearch('');
                    setVariantFilter('ALL');
                    setColourFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="hover:bg-accent/5 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-accent group-hover:underline font-bold">{item.name}</span>
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
                      <span className="text-danger font-bold">+{item.vna}</span>
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
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalModel(item.name);
                        setDrilldownSearch('');
                        setVariantFilter('ALL');
                        setColourFilter('ALL');
                        setStatusFilter('ALL');
                      }}
                      className="px-2.5 py-1 rounded bg-surface border border-line hover:border-accent text-accent text-[11px] font-semibold flex items-center gap-1 mx-auto shadow-xs"
                    >
                      <User className="w-3 h-3" />
                      <span>View Orders ({item.totalBookings})</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ========================================================================= */}
      {/* DEDICATED MODEL CUSTOMER & INDENT ORDERS MODAL                            */}
      {/* ========================================================================= */}
      {selectedModalModel && activeModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
          <div className="bg-surface text-ink w-full max-w-6xl rounded-panel overflow-hidden border border-line shadow-pop flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-ink">{activeModalData.name}</h2>
                    <Badge tone="accent">Customer Orders & Indent Ledger</Badge>
                  </div>
                  <p className="text-xs text-ink-3">
                    Full customer profile, variant specifications, sales consultant details & advance receipts
                  </p>
                </div>
              </div>

              {/* Model Switcher & Close Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-surface border border-line rounded px-2.5 py-1 shadow-xs">
                  <span className="text-[11px] text-ink-3 font-semibold">Switch Model:</span>
                  <select
                    value={selectedModalModel}
                    onChange={(e) => {
                      setSelectedModalModel(e.target.value);
                      setDrilldownSearch('');
                      setVariantFilter('ALL');
                      setColourFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    className="text-xs font-bold text-ink bg-transparent focus:outline-none cursor-pointer"
                  >
                    {modelMatrix.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedModalModel(null)}
                  className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Dynamic Summary KPI Cards Banner (Reflects Filters) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-2.5 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Customer Orders</span>
                  <span className="text-base font-bold text-ink tnum">{modalFilteredStats.totalBookings}</span>
                </div>
                <div className="p-2.5 bg-ok/5 border border-ok/20 rounded">
                  <span className="eyebrow block text-ok">VIN Allocated</span>
                  <span className="text-base font-bold text-ok tnum">{modalFilteredStats.allocated}</span>
                </div>
                <div className="p-2.5 bg-warn/5 border border-warn/20 rounded">
                  <span className="eyebrow block text-warn">PBNA (Vehicle In Stock)</span>
                  <span className="text-base font-bold text-warn tnum">{modalFilteredStats.pbna}</span>
                </div>
                <div className="p-2.5 bg-danger/5 border border-danger/20 rounded">
                  <span className="eyebrow block text-danger">Not in Stock (Indent Required)</span>
                  <span className="text-base font-bold text-danger tnum">{modalFilteredStats.vna}</span>
                </div>
                <div className="p-2.5 bg-accent-soft border border-accent/20 rounded">
                  <span className="eyebrow block text-accent">Total Advance Collected</span>
                  <span className="text-base font-bold text-accent tnum">₹{(modalFilteredStats.totalAdvance / 100000).toFixed(2)} L</span>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="p-3 bg-canvas border border-line rounded space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  
                  {/* 1. Status Filter */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                      Order / Stock Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-8 text-xs font-semibold bg-surface border border-line rounded px-2.5 text-ink focus:outline-none focus:border-accent shadow-xs cursor-pointer"
                    >
                      <option value="ALL">All Orders ({activeModalData.detailedBookings.length})</option>
                      <option value="VNA">Not in Stock (Indent Required) ({activeModalData.vna})</option>
                      <option value="PBNA">PBNA (In Stock Ready) ({activeModalData.pbna})</option>
                      <option value="ALLOCATED">VIN Allocated ({activeModalData.allocatedBookings})</option>
                    </select>
                  </div>

                  {/* 2. Variant Dropdown Filter */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                      Select Variant ({uniqueVariantsForModel.length})
                    </label>
                    <select
                      value={variantFilter}
                      onChange={(e) => setVariantFilter(e.target.value)}
                      className="w-full h-8 text-xs font-semibold bg-surface border border-line rounded px-2.5 text-ink focus:outline-none focus:border-accent shadow-xs cursor-pointer"
                    >
                      <option value="ALL">All Variants ({uniqueVariantsForModel.length})</option>
                      {uniqueVariantsForModel.map(vName => (
                        <option key={vName} value={vName}>{vName}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Colour Dropdown Filter */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                      Select Colour ({uniqueColoursForModel.length})
                    </label>
                    <select
                      value={colourFilter}
                      onChange={(e) => setColourFilter(e.target.value)}
                      className="w-full h-8 text-xs font-semibold bg-surface border border-line rounded px-2.5 text-ink focus:outline-none focus:border-accent shadow-xs cursor-pointer"
                    >
                      <option value="ALL">All Colours ({uniqueColoursForModel.length})</option>
                      {uniqueColoursForModel.map(cName => (
                        <option key={cName} value={cName}>{cName}</option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Keyword Search */}
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                      Customer / Phone / Receipt
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search customer, phone..."
                        value={drilldownSearch}
                        onChange={(e) => setDrilldownSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-xs bg-surface border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent font-medium shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Reset Option if filtered */}
                {(variantFilter !== 'ALL' || colourFilter !== 'ALL' || statusFilter !== 'ALL' || drilldownSearch) && (
                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-[11px] text-accent font-semibold">
                      Filtered: Showing {filteredModalBookings.length} of {activeModalData.detailedBookings.length} Customer Orders
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVariantFilter('ALL');
                        setColourFilter('ALL');
                        setStatusFilter('ALL');
                        setDrilldownSearch('');
                      }}
                      className="px-2.5 py-0.5 bg-surface border border-line text-xs font-semibold text-ink-2 rounded hover:bg-canvas shadow-xs cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Full Detailed Customer Indent Orders Table */}
              <div className="border border-line rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3">Receipt No & Date</th>
                      <th className="py-2.5 px-3">Customer Name & Phone</th>
                      <th className="py-2.5 px-3">Vehicle Details (Variant • Colour)</th>
                      <th className="py-2.5 px-3">Sales Consultant & TL</th>
                      <th className="py-2.5 px-3 text-right">Received Amount</th>
                      <th className="py-2.5 px-3">Delivery & Financer</th>
                      <th className="py-2.5 px-3 text-center">Stock / Indent Status</th>
                      <th className="py-2.5 px-3">Stock VIN / Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    {filteredModalBookings.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-ink-3">
                          <Bookmark className="w-6 h-6 mx-auto mb-1 text-ink-3 opacity-60" />
                          <p className="font-semibold text-ink">No Customer Orders Found</p>
                          <p className="text-[11px] text-ink-3 mt-0.5">Try clearing filters or search criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredModalBookings.map((row, rIdx) => (
                        <tr key={row.id || rIdx} className="hover:bg-canvas transition-colors">
                          <td className="py-2.5 px-3 text-center text-ink-3 font-mono text-[11px]">
                            {rIdx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                            <span className="font-semibold text-ink block">{row.receipt_no}</span>
                            <span className="text-[10px] text-ink-3">{formatDate(row.receipt_date)}</span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <strong className="text-ink block">{row.customer_name}</strong>
                            <span className="text-[11px] font-mono text-ink-3">{row.mobile_number}</span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-semibold text-ink block">{row.variant}</span>
                            <div className="flex items-center gap-1 text-[11px] text-ink-3">
                              <Palette className="w-3 h-3 text-accent" />
                              <span>{row.colour}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-ink font-medium block">{row.sales_consultant}</span>
                            <span className="text-[10px] text-ink-3">TL: {row.team_leader}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-ink tnum whitespace-nowrap">
                            ₹{row.receipt_amt.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-ink block font-medium">
                              {row.delivery_date ? formatDate(row.delivery_date) : 'Pending'}
                            </span>
                            <span className="text-[10px] text-ink-3">{row.hypothecation}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {row.stockStatus === 'ALLOCATED' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/30">
                                Allocated (VIN Tagged)
                              </span>
                            ) : row.stockStatus === 'PBNA' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-warn/10 text-warn border border-warn/30">
                                PBNA (In Stock)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-danger/10 text-danger border border-danger/30">
                                Not in Stock (Indent Required)
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                            {row.matchedStockVin ? (
                              <div>
                                <span className="font-bold text-accent block">{row.matchedStockVin}</span>
                                <span className="text-[10px] text-ink-3 font-sans">{row.matchedLocation}</span>
                              </div>
                            ) : (
                              <span className="text-danger font-semibold text-[10px]">Factory Order Needed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-line bg-canvas flex items-center justify-between">
              <span className="text-xs text-ink-3">
                {activeModalData.name} • Total {filteredModalBookings.length} Orders Listed
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportDrilldownCSV}
                  className="h-8 px-3 rounded bg-surface border border-line text-xs font-semibold text-ink flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-ink-3" />
                  <span>Download Indent Sheet (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModalModel(null)}
                  className="h-8 px-4 rounded bg-accent text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
