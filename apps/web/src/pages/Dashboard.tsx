import { formatDate } from '../utils/dateUtils';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFleetCounts } from '../hooks/useFleetCounts';
import { getVehiclesForBrand, getBookingsForBrand, getActiveStockyards, syncWithSupabase, isTataItem, isHyundaiItem } from '../data/seedData';
import { Panel, Stat, Badge, Bar, PageHeader } from '../components/ui/primitives';
import { 
  Warehouse, Car, Bookmark, Truck, CheckCircle2, AlertTriangle, Eye, 
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

  const [fleetList, setFleetList] = useState<any[]>(() => getVehiclesForBrand(currentBrand.code));
  const [bookingsList, setBookingsList] = useState<any[]>(() => getBookingsForBrand(currentBrand.code));
  const [loading, setLoading] = useState(false);

  // Dedicated Model Modal state
  const [selectedModalModel, setSelectedModalModel] = useState<string | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'MATRIX' | 'CUSTOMERS'>('MATRIX');
  const [viewingVinList, setViewingVinList] = useState<{ 
    variant: string; 
    colour: string; 
    vehicles: Array<{
      vin: string;
      model: string;
      variant: string;
      color: string;
      location: string;
      status: string;
      purchase_date: string;
      ageing_days: number;
    }> 
  } | null>(null);
  const [drilldownSearch, setDrilldownSearch] = useState('');
  const [variantFilter, setVariantFilter] = useState<string>('ALL');
  const [colourFilter, setColourFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    // 1. Sync immediately from in-memory cache
    setFleetList(getVehiclesForBrand(currentBrand.code));
    setBookingsList(getBookingsForBrand(currentBrand.code));
    setLoading(false);

    // 2. Trigger background cloud sync once
    syncWithSupabase().catch(() => {});

    // 3. Listen for updates without infinite re-fetch loop
    const handleDataUpdate = () => {
      setFleetList(getVehiclesForBrand(currentBrand.code));
      setBookingsList(getBookingsForBrand(currentBrand.code));
      setLoading(false);
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
    setFleetList(getVehiclesForBrand(currentBrand.code));
    setBookingsList(getBookingsForBrand(currentBrand.code));
    setLoading(false);
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
    const brandScopedModels = allUniqueNames.filter(mName => {
      if (currentBrand.code === 'DHOOT-TATA') return isTataItem({ model: mName });
      if (currentBrand.code === 'DHOOT-HYUNDAI') return isHyundaiItem({ model: mName });
      return true;
    });

    return brandScopedModels.map(modelName => {
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

      // 3. Variant & Colour Matrix Grouping
      const variantColourMap: Record<string, {
        variant: string;
        colour: string;
        bookings: number;
        allocated: number;
        pbna: number;
        vna: number;
        freeStock: number;
        matchedVins: string[];
        freeVehiclesDetails: Array<{
          vin: string;
          model: string;
          variant: string;
          color: string;
          location: string;
          status: string;
          purchase_date: string;
          ageing_days: number;
        }>;
      }> = {};

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
          matchedVins: subFreeVehicles.map(v => `${v.vin} (${v.location || 'Basni Yard'})`),
          freeVehiclesDetails: subFreeVehicles.map(v => {
            const pDate = v.purchase_date || v.created_at || '';
            const ageing = pDate ? Math.max(0, Math.floor((Date.now() - new Date(pDate).getTime()) / (1000 * 60 * 60 * 24))) : 0;
            return {
              vin: v.vin,
              model: v.model,
              variant: v.variant || variant,
              color: v.color || v.colour || colour,
              location: v.location || 'Basni Yard',
              status: v.status || v.vehicle_status || 'RECEIVED',
              purchase_date: pDate,
              ageing_days: ageing
            };
          })
        };
      });

      // 4. Detailed Customer Bookings with Stock Tag
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
        matrixRows: Object.values(variantColourMap),
        detailedBookings
      };
    });
  }, [currentBrand?.code, fleetList, bookingsList]);

  // Selected Model Data for Modal
  const activeModalData = useMemo(() => {
    if (!selectedModalModel) return null;
    return modelMatrix.find(m => m.name === selectedModalModel) || null;
  }, [selectedModalModel, modelMatrix]);

  // Unique variants and colours for dropdown filters
  const uniqueVariantsForModel = useMemo(() => {
    if (!activeModalData) return [];
    return Array.from(new Set(activeModalData.matrixRows.map(d => d.variant).filter(Boolean))).sort();
  }, [activeModalData]);

  const uniqueColoursForModel = useMemo(() => {
    if (!activeModalData) return [];
    return Array.from(new Set(activeModalData.matrixRows.map(d => d.colour).filter(Boolean))).sort();
  }, [activeModalData]);

  // Filtered Matrix Rows (Tab 1)
  const filteredMatrixRows = useMemo(() => {
    if (!activeModalData) return [];
    const q = drilldownSearch.trim().toLowerCase();
    
    return activeModalData.matrixRows.filter(d => {
      const matchesSearch = !q || d.variant.toLowerCase().includes(q) || d.colour.toLowerCase().includes(q);
      const matchesVariant = variantFilter === 'ALL' || d.variant === variantFilter;
      const matchesColour = colourFilter === 'ALL' || d.colour === colourFilter;
      return matchesSearch && matchesVariant && matchesColour;
    });
  }, [activeModalData, drilldownSearch, variantFilter, colourFilter]);

  // Filtered Customer Bookings (Tab 2)
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

  // Dynamic Summary Stats strictly based on active selection
  const modalSummaryStats = useMemo(() => {
    if (modalActiveTab === 'MATRIX') {
      const totalBookings = filteredMatrixRows.reduce((sum, d) => sum + d.bookings, 0);
      const allocated = filteredMatrixRows.reduce((sum, d) => sum + d.allocated, 0);
      const pbna = filteredMatrixRows.reduce((sum, d) => sum + d.pbna, 0);
      const vna = filteredMatrixRows.reduce((sum, d) => sum + d.vna, 0);
      const freeStock = filteredMatrixRows.reduce((sum, d) => sum + d.freeStock, 0);
      return { totalBookings, allocated, pbna, vna, freeStock, totalAdvance: 0 };
    } else {
      const totalBookings = filteredModalBookings.length;
      const allocated = filteredModalBookings.filter(d => d.stockStatus === 'ALLOCATED').length;
      const pbna = filteredModalBookings.filter(d => d.stockStatus === 'PBNA').length;
      const vna = filteredModalBookings.filter(d => d.stockStatus === 'VNA').length;
      const freeStock = activeModalData?.freeYardStock || 0;
      const totalAdvance = filteredModalBookings.reduce((sum, d) => sum + d.receipt_amt, 0);
      return { totalBookings, allocated, pbna, vna, freeStock, totalAdvance };
    }
  }, [modalActiveTab, filteredMatrixRows, filteredModalBookings, activeModalData]);

  // Export CSV
  const handleExportCSV = () => {
    if (!activeModalData) return;
    
    if (modalActiveTab === 'MATRIX') {
      const headers = ['Model', 'Variant', 'Colour', 'Customer Orders', 'VIN Allocated', 'PBNA (In Stock)', 'Not in Stock (VNA)', 'Free Yard Stock', 'Stock Status', 'Available Free VINs'];
      const rows = [
        headers.join(','),
        ...filteredMatrixRows.map(d => [
          `"${activeModalData.name}"`,
          `"${d.variant}"`,
          `"${d.colour}"`,
          d.bookings,
          d.allocated,
          d.pbna,
          d.vna,
          d.freeStock,
          `"${d.vna > 0 ? 'Indent Needed' : d.pbna > 0 ? 'Ready to Allot' : d.freeStock > 0 ? 'Available Free' : 'Settled'}"`,
          `"${(d.matchedVins || []).join('; ')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeModalData.name}_Variant_Colour_Matrix.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
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
      link.setAttribute('download', `${activeModalData.name}_Customer_Orders_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {modelMatrix.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => {
                    setSelectedModalModel(item.name);
                    setModalActiveTab('MATRIX');
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
                        setModalActiveTab('MATRIX');
                        setDrilldownSearch('');
                        setVariantFilter('ALL');
                        setColourFilter('ALL');
                        setStatusFilter('ALL');
                      }}
                      className="px-2.5 py-1 rounded bg-surface border border-line hover:border-accent text-accent text-[11px] font-semibold flex items-center gap-1 mx-auto shadow-xs"
                    >
                      <Layers className="w-3 h-3" />
                      <span>View Matrix</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ========================================================================= */}
      {/* MODEL VARIANT & COLOUR MATRIX + CUSTOMER INDENT ORDERS MODAL              */}
      {/* ========================================================================= */}
      {selectedModalModel && activeModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
          <div className="bg-surface text-ink w-full max-w-6xl rounded-panel overflow-hidden border border-line shadow-pop flex flex-col max-h-[92vh] relative">
{/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-ink">{activeModalData.name}</h2>
                    <Badge tone="accent">{modalActiveTab === 'MATRIX' ? 'Variant & Colour Matrix' : 'Customer Indent Orders'}</Badge>
                  </div>
                  <p className="text-xs text-ink-3">
                    Live specification demand, stock allocation & customer indent details
                  </p>
                </div>
              </div>

              {/* Tab Selector & Model Switcher & Close */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* 2 Navigation Tabs */}
                <div className="flex items-center bg-surface border border-line rounded p-0.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setModalActiveTab('MATRIX')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                      modalActiveTab === 'MATRIX' ? 'bg-accent text-white shadow-xs' : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Variant & Colour Matrix</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalActiveTab('CUSTOMERS')}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                      modalActiveTab === 'CUSTOMERS' ? 'bg-accent text-white shadow-xs' : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer Orders ({activeModalData.detailedBookings.length})</span>
                  </button>
                </div>

                {/* Model Switcher */}
                <div className="flex items-center gap-1.5 bg-surface border border-line rounded px-2.5 py-1 shadow-xs">
                  <span className="text-[11px] text-ink-3 font-semibold">Model:</span>
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
              
              {/* Dynamic Summary KPI Cards Banner (Reflects Active Filters) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-2.5 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Customer Orders</span>
                  <span className="text-base font-bold text-ink tnum">{modalSummaryStats.totalBookings}</span>
                </div>
                <div className="p-2.5 bg-ok/5 border border-ok/20 rounded">
                  <span className="eyebrow block text-ok">VIN Allocated</span>
                  <span className="text-base font-bold text-ok tnum">{modalSummaryStats.allocated}</span>
                </div>
                <div className="p-2.5 bg-warn/5 border border-warn/20 rounded">
                  <span className="eyebrow block text-warn">PBNA (In Stock)</span>
                  <span className="text-base font-bold text-warn tnum">{modalSummaryStats.pbna}</span>
                </div>
                <div className="p-2.5 bg-danger/5 border border-danger/20 rounded">
                  <span className="eyebrow block text-danger">Not in Stock (Indent Needed)</span>
                  <span className="text-base font-bold text-danger tnum">{modalSummaryStats.vna}</span>
                </div>
                <div className="p-2.5 bg-ok/5 border border-ok/20 rounded">
                  <span className="eyebrow block text-ok">Free Yard Stock</span>
                  <span className="text-base font-bold text-ok tnum">{modalSummaryStats.freeStock}</span>
                </div>
              </div>

              {/* Filter Toolbar with Variant & Colour Dropdowns */}
              <div className="p-3 bg-canvas border border-line rounded space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  
                  {/* Variant Filter */}
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

                  {/* Colour Filter */}
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

                  {/* Status Filter for Customers Tab */}
                  {modalActiveTab === 'CUSTOMERS' && (
                    <div>
                      <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                        Order / Indent Status
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
                  )}

                  {/* Search */}
                  <div className={modalActiveTab === 'CUSTOMERS' ? '' : 'sm:col-span-2'}>
                    <label className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wider mb-0.5">
                      Keyword Search
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search variant, colour, customer..."
                        value={drilldownSearch}
                        onChange={(e) => setDrilldownSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-xs bg-surface border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent font-medium shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Reset Filters */}
                {(variantFilter !== 'ALL' || colourFilter !== 'ALL' || statusFilter !== 'ALL' || drilldownSearch) && (
                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-[11px] text-accent font-semibold">
                      Filtered: Showing {modalActiveTab === 'MATRIX' ? filteredMatrixRows.length : filteredModalBookings.length} records
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

              {/* TAB 1: VARIANT & COLOUR MATRIX (With smooth horizontal scroll) */}
              {modalActiveTab === 'MATRIX' && (
                <div className="border border-line rounded overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs min-w-[1050px]">
                      <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center whitespace-nowrap">#</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Variant Specification</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Exterior Colour</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Customer Orders</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">VIN Allocated</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">PBNA (In Stock)</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Not in Stock (VNA)</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Free Yard Stock</th>
                          <th className="py-2.5 px-3 text-center whitespace-nowrap">Stock Status</th>
                          <th className="py-2.5 px-3 whitespace-nowrap min-w-[280px]">Available Free VINs (Yard)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-ink-2">
                        {filteredMatrixRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-8 text-center text-ink-3">
                              No variant & colour configurations found matching your filter.
                            </td>
                          </tr>
                        ) : (
                          filteredMatrixRows.map((row, rIdx) => {
                            const vehicles = (row as any).freeVehiclesDetails || [];

                            return (
                              <tr key={rIdx} className="hover:bg-canvas transition-colors">
                                  <td className="py-2.5 px-3 text-center text-ink-3 font-mono text-[11px] whitespace-nowrap">
                                    {rIdx + 1}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                                    {row.variant}
                                  </td>
                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <Palette className="w-3.5 h-3.5 text-accent shrink-0" />
                                      <span className="font-medium text-ink">{row.colour}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-medium text-ink tnum whitespace-nowrap">
                                    {row.bookings}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-medium text-ok tnum whitespace-nowrap">
                                    {row.allocated}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-warn tnum whitespace-nowrap">
                                    {row.pbna}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold tnum whitespace-nowrap">
                                    {row.vna > 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVariantFilter(row.variant);
                                          setColourFilter(row.colour);
                                          setStatusFilter('VNA');
                                          setModalActiveTab('CUSTOMERS');
                                        }}
                                        className="px-2 py-0.5 rounded bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30 font-bold transition-colors cursor-pointer"
                                        title="Click to view Customer Indent Details"
                                      >
                                        +{row.vna} Indent Needed
                                      </button>
                                    ) : (
                                      <span className="text-ink-3">0</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-ok tnum whitespace-nowrap">
                                    {row.freeStock}
                                  </td>
                                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                    {row.vna > 0 ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-danger/10 text-danger border border-danger/30">
                                        Indent Needed ({row.vna})
                                      </span>
                                    ) : row.pbna > 0 ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-warn/10 text-warn border border-warn/30">
                                        Ready to Allot ({row.pbna})
                                      </span>
                                    ) : row.freeStock > 0 ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/30">
                                        Available Free ({row.freeStock})
                                      </span>
                                    ) : (
                                      <span className="text-ink-3 text-[11px]">All Settled</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    {vehicles.length > 0 ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingVinList({
                                            variant: row.variant,
                                            colour: row.colour,
                                            vehicles
                                          });
                                        }}
                                        className="px-2.5 py-1 rounded bg-surface border border-line hover:border-accent text-accent text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer hover:bg-accent/10"
                                        title="Click to view chassis VIN numbers & yard locations in popup modal"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-accent" />
                                        <span>{vehicles.length} Stock Units</span>
                                      </button>
                                    ) : (
                                      <span className="text-ink-3 font-mono text-xs">—</span>
                                    )}
                                  </td>
                                </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
{/* TAB 2: CUSTOMER INDENT ORDERS (With full customer profile) */}
              {modalActiveTab === 'CUSTOMERS' && (
                <div className="border border-line rounded overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
                      <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center whitespace-nowrap">#</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Receipt No & Date</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Customer Name & Phone</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Vehicle Specification</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Sales Consultant & TL</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Advance Received</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Delivery & Financer</th>
                          <th className="py-2.5 px-3 text-center whitespace-nowrap">Stock / Indent Status</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Stock VIN / Location</th>
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
                              <td className="py-2.5 px-3 text-center text-ink-3 font-mono text-[11px] whitespace-nowrap">
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
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-line bg-canvas flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-ink-3">
                {activeModalData.name} • {modalActiveTab === 'MATRIX' ? `${filteredMatrixRows.length} Configurations` : `${filteredModalBookings.length} Orders`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="h-8 px-3 rounded bg-surface border border-line text-xs font-semibold text-ink flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-ink-3" />
                  <span>Download CSV</span>
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

      {/* ========================================================================= */}
      {/* 5. FREE STOCK VINS POPUP MODAL (EYE ICON CLICK - FULL STOCK DETAILS)     */}
      {/* ========================================================================= */}
      {viewingVinList && (
        <div 
          style={{ zIndex: 99999 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in"
        >
          <div 
            style={{ zIndex: 100000 }}
            className="bg-surface text-ink w-full max-w-3xl rounded-panel overflow-hidden border border-line shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95"
          >
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-ink">Chassis VIN & Stockyard Inventory Details</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/30">
                      {viewingVinList.vehicles.length} Units Free in Stock
                    </span>
                  </div>
                  <p className="text-xs text-ink-3">
                    {viewingVinList.variant} • {viewingVinList.colour}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingVinList(null)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              
              <div className="flex items-center justify-between bg-accent-soft p-3 rounded border border-accent/20">
                <div className="flex items-center gap-2 text-ink font-semibold">
                  <Warehouse className="w-4 h-4 text-accent" />
                  <span>Physical Units Matched with Live Dealership Stock Sheet</span>
                </div>
                <span className="text-xs font-bold text-ok">
                  All {viewingVinList.vehicles.length} Units Ready for Allocation
                </span>
              </div>

              <div className="border border-line rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3">Chassis VIN Number</th>
                      <th className="py-2.5 px-3">Current Stockyard</th>
                      <th className="py-2.5 px-3 text-right">Ageing (Days)</th>
                      <th className="py-2.5 px-3">Billing Date</th>
                      <th className="py-2.5 px-3 text-center">PDI Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-ink-2">
                    {viewingVinList.vehicles.map((veh, vIdx) => (
                      <tr key={veh.vin || vIdx} className="hover:bg-canvas transition-colors">
                        <td className="py-2.5 px-3 text-center text-ink-3 font-mono text-[11px]">
                          {vIdx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-ink whitespace-nowrap">
                          <span className="text-accent">{veh.vin}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Warehouse className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>{veh.location}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-ink tnum whitespace-nowrap">
                          {veh.ageing_days} Days
                        </td>
                        <td className="py-2.5 px-3 text-ink-3 whitespace-nowrap">
                          {veh.purchase_date ? formatDate(veh.purchase_date) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/20">
                            {veh.status || 'RECEIVED'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <Link
                            to="/vehicles"
                            onClick={() => {
                              setViewingVinList(null);
                              setSelectedModalModel(null);
                            }}
                            className="px-2.5 py-1 bg-surface border border-line hover:border-accent text-accent rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs"
                          >
                            <span>Open in Stock</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-line bg-canvas flex items-center justify-between">
              <span className="text-xs text-ink-3">
                Total {viewingVinList.vehicles.length} Physical Units Available in Yards
              </span>
              <button
                type="button"
                onClick={() => setViewingVinList(null)}
                className="h-8 px-4 rounded bg-accent text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
