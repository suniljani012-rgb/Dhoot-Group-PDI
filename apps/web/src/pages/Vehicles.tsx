import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, FileSpreadsheet, X, Loader2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewVehicleModal } from '../components/vehicles/NewVehicleModal';
import { ExcelStockImporter } from '../components/vehicles/ExcelStockImporter';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

export interface StockVehicle {
  id: string;
  vin: string;
  model: string;
  variant: string;
  color: string;
  fuel_type?: string;
  fsc_code?: string;
  dealer_code?: string;
  plant_code?: string;
  manufacturing_year?: number;
  status: string;
  quantity?: number;
  location?: string;
  customer_name?: string;
  sales_consultant?: string;
  accessories_amount?: number;
  delivery_date?: string;
  allocation_date?: string;
  allocated_days?: number;
  received_amount?: number;
  purchase_date?: string;
  created_at?: string;
}

export const VehiclesPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockVehicle | null>(null);

  const [vehicles, setVehicles] = useState<StockVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, [currentBrand.code]);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      const res = await fetch(getApiUrl(`/api/v1/stock${orgParam}`));
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setVehicles(json.data);
          setLoading(false);
          return;
        }
      }
      setVehicles(getVehiclesForBrand(currentBrand.code) as any);
    } catch (e) {
      console.warn('Live API unreachable, using brand dataset:', e);
      setVehicles(getVehiclesForBrand(currentBrand.code) as any);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeTone = (status: string) => {
    switch (status) {
      case 'ALLOCATED':
        return 'accent';
      case 'PDI_APPROVED':
      case 'DELIVERY_READY':
        return 'ok';
      case 'PDI_IN_PROGRESS':
      case 'PDI_PENDING':
        return 'warn';
      case 'IN_REPAIR':
      case 'FAILED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const filtered = vehicles.filter(v => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      (v.vin || '').toLowerCase().includes(s) ||
      (v.model || '').toLowerCase().includes(s) ||
      (v.customer_name || '').toLowerCase().includes(s) ||
      (v.variant || '').toLowerCase().includes(s) ||
      (v.fsc_code || '').toLowerCase().includes(s);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && v.status === statusFilter;
  });

  const totalStockCount = vehicles.length;
  const unallocatedStockCount = vehicles.filter(v => v.status !== 'ALLOCATED' && v.status !== 'DELIVERED').length;
  const allocatedStockCount = vehicles.filter(v => v.status === 'ALLOCATED').length;
  const pdiCertifiedStockCount = vehicles.filter(v => v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY').length;
  const inwardPendingCount = vehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING' || v.status === 'IN_TRANSIT').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* Header Banner */}
      <PageHeader
        title="Stock Inventory"
        subtitle="Stockyard inventory, customer allocations, and vehicle status ledger"
        action={
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-ok" />
            <span>Import Excel Stock</span>
          </button>
        }
      />

      {/* Stock KPI Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat label="Total Vehicles" value={totalStockCount} note="Units in system" />
        <Stat label="Available Free" value={unallocatedStockCount} note="Unassigned free stock" />
        <Stat label="Allocated" value={allocatedStockCount} note="Tagged to orders" />
        <Stat label="PDI Certified" value={pdiCertifiedStockCount} note="Inspection approved" />
        <Stat label="Gate Inward" value={inwardPendingCount} note="En-route carrier" tone="warn" />
      </div>

      {/* Main Stock Panel */}
      <Panel
        title="Vehicle Inventory"
        action={
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VIN, model, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-7 pl-7 pr-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-ink-3" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-7 text-xs bg-canvas border border-line rounded px-2 text-ink focus:outline-none focus:border-line-strong font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="RECEIVED">Received</option>
                <option value="PDI_PENDING">PDI Pending</option>
                <option value="PDI_IN_PROGRESS">PDI In Progress</option>
                <option value="PDI_APPROVED">PDI Approved</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="DELIVERY_READY">Delivery Ready</option>
              </select>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Brand & Model</th>
                <th className="py-2.5 px-3">Variant & Color</th>
                <th className="py-2.5 px-3">Fuel</th>
                <th className="py-2.5 px-3">Yard Bay</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Customer Link</th>
                <th className="py-2.5 px-3">Ageing</th>
                <th className="py-2.5 px-3 text-right">Rec. Amount</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-ink-3">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-accent" />
                    Loading inventory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <Empty title="0 Vehicles Found" hint="No vehicles match your active search or filter." />
                  </td>
                </tr>
              ) : (
                filtered.map((v, idx) => {
                  const isHyundai = ((v as any).brand || '').toLowerCase().includes('hyundai') || (v.vin || '').startsWith('MAL') || (v.model || '').toLowerCase().includes('hyundai');
                  return (
                    <tr 
                      key={v.id} 
                      className="hover:bg-canvas transition-colors cursor-pointer"
                      onClick={() => setSelectedStock(v)}
                    >
                      <td className="py-2.5 px-3 text-center text-ink-3 tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">
                        {v.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge tone="accent">{isHyundai ? 'Hyundai' : 'Tata'}</Badge>
                          <span className="font-medium text-ink">{v.model}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-ink">{v.variant || 'Standard'}</div>
                        <div className="text-[11px] text-ink-3">{v.color}</div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {v.fuel_type || 'PETROL'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {v.location || 'Central Stockyard'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={getStatusBadgeTone(v.status) as any}>
                          {v.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        {v.customer_name ? (
                          <div>
                            <div className="font-medium text-ink">{v.customer_name}</div>
                            <div className="text-[10px] text-ink-3">{v.sales_consultant || 'Sales Desk'}</div>
                          </div>
                        ) : (
                          <span className="text-ink-3 italic">Unallocated</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 text-center tnum">
                        {v.allocated_days || 0}d
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ink tnum text-right">
                        ₹{(Number(v.received_amount) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {v.status === 'YARD_RECEIVING_PENDING' ? (
                          <Link
                            to="/receiving"
                            className="h-6 px-2 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors inline-flex items-center gap-1"
                          >
                            Receive
                          </Link>
                        ) : v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY' ? (
                          <Link
                            to="/certificates/cert-101"
                            className="h-6 px-2 rounded bg-ok/10 text-ok border border-ok/20 text-xs font-medium transition-colors inline-flex items-center gap-1"
                          >
                            Certified
                          </Link>
                        ) : (
                          <Link
                            to="/pdi"
                            className="h-6 px-2 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3 text-ink-3" />
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
        <div className="fixed inset-0 bg-ink/30 z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-2xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-line flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink text-sm">Stock Details: {selectedStock.vin}</h3>
                <p className="text-xs text-ink-3">{selectedStock.model} • {selectedStock.variant}</p>
              </div>
              <button 
                onClick={() => setSelectedStock(null)}
                className="p-1 rounded text-ink-3 hover:text-ink hover:bg-canvas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">VIN Number</span>
                  <span className="font-mono font-medium text-ink">{selectedStock.vin}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">FSC Code</span>
                  <span className="font-mono text-ink">{selectedStock.fsc_code || '-'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Location</span>
                  <span className="text-ink">{selectedStock.location || 'Central Stockyard'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Customer Name</span>
                  <span className="font-medium text-ink">{selectedStock.customer_name || 'Unallocated'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Sales Consultant</span>
                  <span className="text-ink">{selectedStock.sales_consultant || '-'}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Allocated Days</span>
                  <span className="text-ink tnum">{selectedStock.allocated_days || 0} Days</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Accessories Amt</span>
                  <span className="font-medium text-ink tnum">₹{(Number(selectedStock.accessories_amount) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Received Amount</span>
                  <span className="font-medium text-ink tnum">₹{(Number(selectedStock.received_amount) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-canvas border border-line p-2.5 rounded">
                  <span className="eyebrow block">Status</span>
                  <Badge tone={getStatusBadgeTone(selectedStock.status) as any}>
                    {selectedStock.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-line bg-canvas flex items-center justify-end">
              <button
                onClick={() => setSelectedStock(null)}
                className="h-8 px-4 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink cursor-pointer"
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
        onAdd={(newVeh) => setVehicles([newVeh, ...vehicles])}
      />

    </div>
  );
};