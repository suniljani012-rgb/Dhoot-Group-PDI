import { formatDate } from '../utils/dateUtils';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, FileSpreadsheet, X, Loader2, ChevronRight,
  Download, Upload, Trash2, Plus, RefreshCw, Car, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewVehicleModal } from '../components/vehicles/NewVehicleModal';
import { ExcelStockImporter } from '../components/vehicles/ExcelStockImporter';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand, clearStockInventory, getActiveStockyards } from '../data/seedData';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

export interface StockVehicle {
  id: string;
  vin: string;
  model: string;
  variant: string;
  color: string;
  brand?: string;
  fuel_type?: string;
  fsc_code?: string;
  dealer_code?: string;
  plant_code?: string;
  manufacturing_year?: number | string;
  status: string;
  quantity?: number;
  location?: string;
  customer_name?: string;
  sales_consultant?: string;
  accessories_amount?: number;
  vehicle_status?: string;
  delivery_date?: string;
  allocation_date?: string;
  allocated_days?: number;
  received_amount?: number;
  purchase_date?: string;
  organization_id?: string;
  created_at?: string;
}

// Helper: Calculate Ageing Days from Date of Billing (Purchase Date)
const calculateAgeingDays = (purchaseDate?: string, fallbackDays?: number): number => {
  if (!purchaseDate) return fallbackDays || 0;
  const d = new Date(purchaseDate);
  if (isNaN(d.getTime())) return fallbackDays || 0;
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - d.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Helper: Resolve Location City/Area automatically from Yard Name
const getYardLocation = (yardName?: string, locationFallback?: string): string => {
  if (!yardName && !locationFallback) return '—';
  const val = (yardName || locationFallback || '').toLowerCase().trim();
  if (val.includes('transit')) return 'In Transit';
  if (val.includes('plant') || val.includes('oem')) return 'OEM Plant';
  if (val.includes('basni')) return 'Jodhpur (Basni)';
  if (val.includes('pratap')) return 'Jodhpur (Pratap Nagar)';
  if (val.includes('bhagat')) return 'Jodhpur (Bhagat Ki Kothi)';
  if (val.includes('shantinath')) return 'Jodhpur (Shantinath)';
  if (val.includes('new yard')) return 'Jodhpur';
  if (val.includes('sumerpur')) return 'Sumerpur';
  if (val.includes('pali')) return 'Pali';
  if (val.includes('jalore')) return 'Jalore';
  if (val.includes('balotra')) return 'Balotra';
  if (val.includes('barmer')) return 'Barmer';
  if (val.includes('bhinmal')) return 'Bhinmal';
  if (val.includes('jaisalmer')) return 'Jaisalmer';
  if (val.includes('bilara')) return 'Bilara';
  if (val.includes('pipar')) return 'Pipar';
  return locationFallback || yardName || 'Central Stockyard';
};

// Helper to get active yards specifically for a vehicle's brand
const getYardsForVehicle = (v: StockVehicle): string[] => {
  const isHyundai = (v.organization_id && v.organization_id.includes('1112')) || 
                    (v.model && v.model.toLowerCase().includes('hyundai')) ||
                    (v.vin && v.vin.toUpperCase().startsWith('MAL'));
  const brandCode = isHyundai ? 'DHOOT-HYUNDAI' : 'DHOOT-TATA';
  return getActiveStockyards(brandCode).map(y => y.name);
};

export const VehiclesPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modelFilter, setModelFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [selectedStock, setSelectedStock] = useState<StockVehicle | null>(null);

  const [vehicles, setVehicles] = useState<StockVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
    
    // Listen for stock-updated events from Importer or other tabs
    const handleStockUpdate = () => {
      fetchStock();
    };

    window.addEventListener('stock-updated', handleStockUpdate);
    return () => window.removeEventListener('stock-updated', handleStockUpdate);
  }, [currentBrand.code]);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const localStock = getVehiclesForBrand(currentBrand.code);
      setVehicles(localStock as StockVehicle[]);
    } catch (e) {
      console.warn('Local stock fetch note:', e);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Instant update of Vehicle Yard from Table Dropdown
  const handleUpdateVehicleYard = (vin: string, newYard: string) => {
    const updated = vehicles.map(v => {
      if (v.vin === vin) {
        return { ...v, location: newYard };
      }
      return v;
    });
    setVehicles(updated);
    localStorage.setItem('dhoot_stock_inventory', JSON.stringify(updated));
    window.dispatchEvent(new Event('stock-updated'));
  };



  // Export 21-Column Stock CSV
  const handleExportStockCSV = () => {
    const headers = [
      'Purchase Date',
      'Model',
      'Variant',
      'Colour',
      'Fuel',
      'FSC Code',
      'Dealer Code',
      'Plant Code',
      'Year',
      'Status',
      'Vin No',
      'Quantity',
      'Location',
      'Customer Name',
      'Sales Consultant',
      'Accessories Amount',
      'Vehicle Status',
      'Delivery Date',
      'Allocation Date',
      'Allocated Days',
      'Received Amount'
    ];

    const rows = vehicles.map(v => [
      v.purchase_date || '',
      v.model || '',
      v.variant || '',
      v.color || '',
      v.fuel_type || '',
      v.fsc_code || '',
      v.dealer_code || '',
      v.plant_code || '',
      v.manufacturing_year || '',
      v.status || '',
      v.vin || '',
      v.quantity || 1,
      v.location || '',
      v.customer_name || '',
      v.sales_consultant || '',
      v.accessories_amount || 0,
      v.vehicle_status || v.status || '',
      v.delivery_date || '',
      v.allocation_date || '',
      v.allocated_days || 0,
      v.received_amount || 0
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dhoot_Stock_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeTone = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('ALLOCAT')) return 'accent';
    if (s.includes('APPROV') || s.includes('CERTIF') || s.includes('DELIVER')) return 'ok';
    if (s.includes('PROG') || s.includes('PENDING') || s.includes('INWARD') || s.includes('RECEIV')) return 'warn';
    if (s.includes('REPAIR') || s.includes('FAIL') || s.includes('HOLD')) return 'danger';
    return 'neutral';
  };

  const isTataVehicle = (v: StockVehicle) => {
    const m = (v.model || '').toLowerCase();
    const b = (v.brand || '').toLowerCase();
    return b.includes('tata') || ['nexon', 'punch', 'harrier', 'safari', 'curvv', 'altroz', 'tiago', 'tigor'].some(x => m.includes(x));
  };

  const isHyundaiVehicle = (v: StockVehicle) => {
    const m = (v.model || '').toLowerCase();
    const b = (v.brand || '').toLowerCase();
    return b.includes('hyundai') || ['creta', 'venue', 'exter', 'i20', 'verna', 'tucson', 'alcazar', 'aura', 'nios'].some(x => m.includes(x));
  };

  // Filter vehicles by Brand first
  const brandScopedVehicles = useMemo(() => {
    if (brandFilter === 'DHOOT-TATA') return vehicles.filter(isTataVehicle);
    if (brandFilter === 'DHOOT-HYUNDAI') return vehicles.filter(isHyundaiVehicle);
    return vehicles;
  }, [vehicles, brandFilter]);

  // Distinct Models & Yard Locations for Filter Dropdowns
  const uniqueModels = Array.from(new Set(brandScopedVehicles.map(v => v.model).filter(Boolean))).sort();
  const activeYards = getActiveStockyards(brandFilter !== 'ALL' ? brandFilter : currentBrand.code).map(y => y.name);
  const vehicleLocations = brandScopedVehicles.map(v => v.location).filter(Boolean);
  const customYardOptions = ['In Transit', 'In OEM Plant'];
  const uniqueLocations = Array.from(new Set([...customYardOptions, ...activeYards, ...vehicleLocations])).sort();

  const filtered = brandScopedVehicles.filter(v => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      (v.vin || '').toLowerCase().includes(s) ||
      (v.model || '').toLowerCase().includes(s) ||
      (v.customer_name || '').toLowerCase().includes(s) ||
      (v.variant || '').toLowerCase().includes(s) ||
      (v.fsc_code || '').toLowerCase().includes(s) ||
      (v.location || '').toLowerCase().includes(s) ||
      (v.sales_consultant || '').toLowerCase().includes(s);

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter || (v.vehicle_status && v.vehicle_status === statusFilter);
    const matchesModel = modelFilter === 'ALL' || v.model === modelFilter;
    const matchesLocation = locationFilter === 'ALL' || v.location === locationFilter;

    return matchesSearch && matchesStatus && matchesModel && matchesLocation;
  });

  const totalStockCount = vehicles.length;
  const unallocatedStockCount = vehicles.filter(v => !v.customer_name && v.status !== 'ALLOCATED' && v.status !== 'DELIVERED').length;
  const allocatedStockCount = vehicles.filter(v => !!v.customer_name || v.status === 'ALLOCATED').length;
  const pdiCertifiedStockCount = vehicles.filter(v => v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY').length;
  const inwardPendingCount = vehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING' || v.status === 'GATE_INWARD_PENDING' || v.status === 'IN_TRANSIT').length;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* Header Banner */}
      <PageHeader
        title="Stock Inventory Management"
        subtitle="21-Column Dealership Vehicle Ledger • Realtime VIN Tracking & Daily Bulk Import"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {vehicles.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportStockCSV}
                  className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-ink-3" />
                  <span>Export CSV</span>
                </button>

                
              </>
            )}

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="h-8 px-3.5 rounded bg-accent hover:bg-accent-600 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Bulk Import Stock</span>
            </button>
          </div>
        }
      />

      {/* Stock KPI Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat label="Total Vehicles" value={totalStockCount} note="Units in stock database" />
        <Stat label="Available Free" value={unallocatedStockCount} note="Unallocated free inventory" />
        <Stat label="Allocated" value={allocatedStockCount} note="Booked with customer" />
        <Stat label="PDI Certified" value={pdiCertifiedStockCount} note="Inspection certified" />
        <Stat label="Gate Inward" value={inwardPendingCount} note="Pending yard receiving" tone="warn" />
      </div>

      {/* Main Stock Panel */}
      <Panel
        title={
          <div className="flex items-center gap-2">
            <span>Vehicle Stock Ledger</span>
            <Badge tone="accent">{filtered.length} Units</Badge>
          </div>
        }
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setModelFilter('ALL');
                setLocationFilter('ALL');
              }}
              className="h-7 text-xs bg-canvas border border-line rounded px-2.5 text-ink focus:outline-none focus:border-accent font-bold cursor-pointer shadow-xs"
            >
              <option value="ALL">🏢 All Brands</option>
              <option value="DHOOT-TATA">Tata Motors</option>
              <option value="DHOOT-HYUNDAI">Hyundai</option>
            </select>

            {/* Search */}
            <div className="relative w-44 sm:w-60">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, model, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-7 pl-7 pr-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent font-medium"
              />
            </div>

            {/* Model Filter */}
            {uniqueModels.length > 0 && (
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="h-7 text-xs bg-canvas border border-line rounded px-2 text-ink focus:outline-none focus:border-accent font-medium"
              >
                <option value="ALL">All Models</option>
                {uniqueModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}

            {/* Location Filter */}
            {uniqueLocations.length > 0 && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-7 text-xs bg-canvas border border-line rounded px-2 text-ink focus:outline-none focus:border-accent font-medium"
              >
                <option value="ALL">All Yards & Status</option>
                {uniqueLocations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-7 text-xs bg-canvas border border-line rounded px-2 text-ink focus:outline-none focus:border-accent font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="YARD_RECEIVING_PENDING">Gate Inward Pending</option>
              <option value="RECEIVED">Received in Yard</option>
              <option value="PDI_PENDING">PDI Pending</option>
              <option value="PDI_IN_PROGRESS">PDI In Progress</option>
              <option value="PDI_APPROVED">PDI Approved</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="DELIVERY_READY">Delivery Ready</option>
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Purchase / Billing Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Model</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Variant</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Colour</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Fuel</th>
                <th className="py-2.5 px-3 whitespace-nowrap">FSC Code</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Dealer Code</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Plant Code</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Year</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Vin No</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Yard</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Location (City)</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Vehicle Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Ageing (Days)</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-ink-3">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-accent" />
                    Loading inventory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={18}>
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">0 Vehicles in Stock</p>
                        <p className="text-xs text-ink-3 mt-0.5">
                          {searchTerm || statusFilter !== 'ALL' || modelFilter !== 'ALL'
                            ? 'No vehicles match your active search or filter.'
                            : 'Stock inventory is currently empty. Click "Bulk Import Stock" to load daily vehicle data.'}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs mt-2"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Import Stock Spreadsheet</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((v, idx) => {
                  return (
                    <tr 
                      key={v.id || idx} 
                      className="hover:bg-canvas transition-colors cursor-pointer"
                      onClick={() => setSelectedStock(v)}
                    >
                      <td className="py-2.5 px-3 text-center text-ink-3 tnum whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum whitespace-nowrap">
                        {formatDate(v.purchase_date)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ink whitespace-nowrap">
                        {v.model}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {v.variant || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {v.color || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 uppercase whitespace-nowrap">
                        {v.fuel_type || 'PETROL'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                        {v.fsc_code || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                        {v.dealer_code || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                        {v.plant_code || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum whitespace-nowrap">
                        {v.manufacturing_year || 2026}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge tone={getStatusBadgeTone(v.status) as any}>
                          {v.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-ink whitespace-nowrap">
                        {v.vin}
                      </td>
                      <td className="py-2.5 px-3 text-center text-ink-2 tnum whitespace-nowrap">
                        {v.quantity || 1}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const brandYards = getYardsForVehicle(v);
                          return (
                            <select
                              value={v.location || (brandYards[0] || 'Basni Yard')}
                              onChange={(e) => handleUpdateVehicleYard(v.vin, e.target.value)}
                              className={`h-7 text-xs font-semibold rounded px-2.5 border cursor-pointer focus:outline-none focus:border-accent transition-colors shadow-xs ${
                                v.location === 'In Transit'
                                  ? 'bg-warn/10 text-warn border-warn/30 hover:bg-warn/20 font-bold'
                                  : v.location === 'In OEM Plant'
                                  ? 'bg-accent-soft text-accent border-accent/30 hover:bg-accent-soft/80 font-bold'
                                  : 'bg-canvas text-ink border-line hover:border-line-strong'
                              }`}
                            >
                              <optgroup label="Transit & Plant">
                                <option value="In Transit">In Transit</option>
                                <option value="In OEM Plant">In OEM Plant</option>
                              </optgroup>
                              <optgroup label="Active Brand Stockyards">
                                {brandYards.map(y => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </optgroup>
                            </select>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {getYardLocation(v.location)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <Badge tone={getStatusBadgeTone(v.vehicle_status || v.status) as any}>
                          {v.vehicle_status || v.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {(() => {
                          const days = calculateAgeingDays(v.purchase_date, v.allocated_days);
                          const toneClass = 
                            days <= 30 
                              ? 'bg-ok/10 text-ok border-ok/20' 
                              : days <= 60 
                              ? 'bg-accent-soft text-accent border-accent/20' 
                              : days <= 90 
                              ? 'bg-warn/10 text-warn border-warn/30' 
                              : 'bg-danger/10 text-danger border-danger/30';
                          return (
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${toneClass}`}>
                              {days}d
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {v.status === 'YARD_RECEIVING_PENDING' || v.status === 'GATE_INWARD_PENDING' ? (
                          <Link
                            to="/receiving"
                            className="h-7 px-2.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                          >
                            Receive
                          </Link>
                        ) : v.status === 'PDI_APPROVED' ? (
                          <Link
                            to={`/certificate/${v.id}`}
                            className="h-7 px-2.5 rounded bg-ok/10 text-ok border border-ok/20 hover:bg-ok hover:text-white text-xs font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            Certified
                          </Link>
                        ) : (
                          <Link
                            to="/pdi"
                            className="h-7 px-3 rounded bg-accent text-white hover:bg-accent-600 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Universal Excel Importer */}
      <ExcelStockImporter
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchStock}
      />

      {/* Stock Details Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-surface w-full max-w-3xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-line flex items-center justify-between bg-canvas">
              <div>
                <h3 className="font-semibold text-ink text-sm">Vehicle Details: {selectedStock.vin}</h3>
                <p className="text-xs text-ink-3">{selectedStock.model} • {selectedStock.variant} • {selectedStock.color}</p>
              </div>
              <button 
                onClick={() => setSelectedStock(null)}
                className="w-8 h-8 rounded text-ink-3 hover:text-ink hover:bg-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">VIN No</span>
                  <span className="font-mono font-semibold text-ink">{selectedStock.vin}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Model & Variant</span>
                  <span className="font-medium text-ink">{selectedStock.model} {selectedStock.variant}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Colour & Fuel</span>
                  <span className="text-ink">{selectedStock.color} • {selectedStock.fuel_type}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">FSC Code</span>
                  <span className="font-mono text-ink">{selectedStock.fsc_code || '—'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Dealer & Plant</span>
                  <span className="font-mono text-ink">{selectedStock.dealer_code || '—'} / {selectedStock.plant_code || '—'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Manufacturing Year</span>
                  <span className="text-ink tnum">{selectedStock.manufacturing_year || '2026'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Stock Location</span>
                  <span className="text-ink">{selectedStock.location || 'Central Stockyard'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Customer Name</span>
                  <span className="font-semibold text-ink">{selectedStock.customer_name || 'Unallocated'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Sales Consultant</span>
                  <span className="text-ink">{selectedStock.sales_consultant || '—'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Purchase Date</span>
                  <span className="text-ink tnum">{formatDate(selectedStock.purchase_date)}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Delivery Date</span>
                  <span className="text-ink tnum">{formatDate(selectedStock.delivery_date)}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Allocation Date & Days</span>
                  <span className="text-ink tnum">{formatDate(selectedStock.allocation_date)} ({selectedStock.allocated_days || 0}d)</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Accessories Amt</span>
                  <span className="font-semibold text-ink tnum">₹{(Number(selectedStock.accessories_amount) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Received Amount</span>
                  <span className="font-semibold text-ink tnum">₹{(Number(selectedStock.received_amount) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Vehicle Status</span>
                  <Badge tone={getStatusBadgeTone(selectedStock.vehicle_status || selectedStock.status) as any}>
                    {selectedStock.vehicle_status || selectedStock.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-line bg-canvas flex items-center justify-end">
              <button
                onClick={() => setSelectedStock(null)}
                className="h-8 px-4 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Vehicle Modal */}
      <NewVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(newVeh) => {
          const updated = [newVeh, ...vehicles];
          setVehicles(updated);
          localStorage.setItem('dhoot_stock_inventory', JSON.stringify(updated));
        }}
      />

    </div>
  );
};
