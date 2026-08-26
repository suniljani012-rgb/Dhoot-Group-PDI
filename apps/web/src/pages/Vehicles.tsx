import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Filter, Car, ChevronRight, FileSpreadsheet, 
  X, Loader2, Calendar, Building, DollarSign, UserCheck,
  CheckCircle2, CheckSquare, Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewVehicleModal } from '../components/vehicles/NewVehicleModal';
import { ExcelStockImporter } from '../components/vehicles/ExcelStockImporter';
import { getApiUrl } from '../utils/apiConfig';
import { getVehiclesForBrand } from '../data/seedData';

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

  // Bulk Import state
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);

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

  const handleBulkStockImport = async () => {
    if (!csvText.trim()) return;
    setImporting(true);
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) return;

      const headers = lines[0].split('\t').map(h => h.trim());
      const parsedRecords = lines.slice(1).map(line => {
        const cols = line.split('\t').map(c => c.trim());
        const record: any = {};
        headers.forEach((h, idx) => {
          record[h] = cols[idx] || '';
        });
        return record;
      });

      const targetOrg = currentBrand.code === 'DHOOT-HYUNDAI'
        ? '11111111-1111-1111-1111-111111111112'
        : '11111111-1111-1111-1111-111111111111';

      const res = await fetch(getApiUrl('/api/v1/stock/bulk-import'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: targetOrg,
          stockItems: parsedRecords
        })
      });

      if (res.ok) {
        setIsImportModalOpen(false);
        setCsvText('');
        fetchStock();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'YARD_RECEIVING_PENDING': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'RECEIVED':
      case 'PDI_PENDING': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'PDI_IN_PROGRESS': return 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
      case 'PDI_APPROVED':
      case 'DELIVERY_READY': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PDI_FAILED': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'ALLOCATED': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-slate-900 text-white border-slate-900';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filtered = vehicles.filter((v) => {
    const matchesSearch = 
      v.vin.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.customer_name && v.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.fsc_code && v.fsc_code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Dynamic Stock KPI Metrics
  const totalStockCount = vehicles.length;
  const unallocatedStockCount = vehicles.filter(v => v.status !== 'ALLOCATED' && v.status !== 'DELIVERED').length;
  const allocatedStockCount = vehicles.filter(v => v.status === 'ALLOCATED').length;
  const pdiCertifiedStockCount = vehicles.filter(v => v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY').length;
  const inwardPendingCount = vehicles.filter(v => v.status === 'YARD_RECEIVING_PENDING' || v.status === 'IN_TRANSIT').length;

  return (
    <div className="space-y-4 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-black text-slate-900 leading-tight">
            Vehicle Stock Inventory & Allocation Ledger
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            21-Field authoritative stockyard inventory, customer mapping, and vehicle location tracker
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel Stock</span>
          </button>
        </div>
      </div>

      {/* Stock KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Card 1: Total Stock */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Vehicles</span>
            <span className="text-xl font-black text-slate-900 leading-none mt-0.5 block">{totalStockCount}</span>
            <span className="text-[10px] font-semibold text-slate-500 mt-1 block">Units in System</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
            <Car className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Free Unallocated Stock */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Free Stock</span>
            <span className="text-xl font-black text-emerald-600 leading-none mt-0.5 block">{unallocatedStockCount}</span>
            <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">Unassigned & Free</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Allocated to Bookings */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Allocated</span>
            <span className="text-xl font-black text-indigo-600 leading-none mt-0.5 block">{allocatedStockCount}</span>
            <span className="text-[10px] font-semibold text-indigo-700 mt-1 block">Locked to Bookings</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Quality Certified */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PDI Certified</span>
            <span className="text-xl font-black text-blue-600 leading-none mt-0.5 block">{pdiCertifiedStockCount}</span>
            <span className="text-[10px] font-semibold text-blue-700 mt-1 block">Delivery Ready</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>

        {/* Card 5: Inward Pending */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gate Inward Pending</span>
            <span className="text-xl font-black text-amber-600 leading-none mt-0.5 block">{inwardPendingCount}</span>
            <span className="text-[10px] font-semibold text-amber-700 mt-1 block">Trailer In-Transit</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
            <Truck className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by VIN, Model, Customer, FSC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-2xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2"
          >
            <option value="ALL">All Statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="PDI_PENDING">PDI Pending</option>
            <option value="PDI_IN_PROGRESS">PDI In Progress</option>
            <option value="PDI_APPROVED">PDI Approved</option>
            <option value="DELIVERY_READY">Delivery Ready</option>
          </select>
        </div>
      </div>

      {/* Stock Table with Full 21 Columns */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">VIN / Chassis Number</th>
                <th className="py-2.5 px-3">Brand & Model</th>
                <th className="py-2.5 px-3">Variant & Color</th>
                <th className="py-2.5 px-3">Fuel</th>
                <th className="py-2.5 px-3">Yard Bay</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Customer Link</th>
                <th className="py-2.5 px-3">Inward Date</th>
                <th className="py-2.5 px-3 text-center">Ageing</th>
                <th className="py-2.5 px-3 text-right">Rec. Amount</th>
                <th className="py-2.5 px-3 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
                    Loading Stock Inventory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No vehicles found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((v, idx) => {
                  const isHyundai = ((v as any).brand || '').toLowerCase().includes('hyundai') || (v.vin || '').startsWith('MAL') || (v.model || '').toLowerCase().includes('hyundai');
                  return (
                    <tr 
                      key={v.id} 
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedStock(v)}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {v.vin}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            isHyundai 
                              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' 
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {isHyundai ? 'Hyundai' : 'Tata'}
                          </span>
                          <span className="font-bold text-slate-900">{v.model}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{v.variant || 'Standard'}</div>
                        <div className="text-[11px] text-slate-500">{v.color}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {v.fuel_type || 'PETROL'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        {v.location || 'Central Stockyard'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {v.customer_name ? (
                          <div>
                            <div className="font-bold text-slate-900">{v.customer_name}</div>
                            <div className="text-[10px] text-slate-400">{v.sales_consultant || 'Sales Desk'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unallocated</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {v.purchase_date || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-center font-mono">
                        {v.allocated_days || 0}d
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 text-right">
                        ₹{(Number(v.received_amount) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {v.status === 'YARD_RECEIVING_PENDING' ? (
                          <Link
                            to="/receiving"
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-xs"
                          >
                            <span>Receive</span>
                          </Link>
                        ) : v.status === 'PDI_APPROVED' || v.status === 'DELIVERY_READY' ? (
                          <Link
                            to="/certificates/cert-101"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-xs"
                          >
                            <span>Certified</span>
                          </Link>
                        ) : (
                          <Link
                            to="/pdi"
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-xs"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
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
      </div>

      {/* UNIVERSAL 21-COLUMN EXCEL STOCK IMPORTER */}
      <ExcelStockImporter
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchStock}
      />

      {/* STOCK DETAILS MODAL */}
      {selectedStock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Stock Details: {selectedStock.vin}</h3>
                <p className="text-xs text-slate-500">{selectedStock.model} • {selectedStock.variant}</p>
              </div>
              <button 
                onClick={() => setSelectedStock(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">VIN Number</span>
                  <span className="font-mono font-bold text-slate-900">{selectedStock.vin}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">FSC Code</span>
                  <span className="font-mono text-slate-900">{selectedStock.fsc_code || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Dealer / Plant Code</span>
                  <span>{selectedStock.dealer_code || '-'}/{selectedStock.plant_code || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Location</span>
                  <span>{selectedStock.location || 'Central Stockyard'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Customer Name</span>
                  <span className="font-bold text-slate-900">{selectedStock.customer_name || 'Unallocated'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Sales Consultant</span>
                  <span>{selectedStock.sales_consultant || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Purchase Date</span>
                  <span>{selectedStock.purchase_date || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Delivery Date</span>
                  <span>{selectedStock.delivery_date || 'TBD'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Allocated Days</span>
                  <span className="font-bold">{selectedStock.allocated_days || 0} Days</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Accessories Amt</span>
                  <span className="font-bold text-slate-900">₹{(Number(selectedStock.accessories_amount) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Received Amount</span>
                  <span className="font-bold text-emerald-700">₹{(Number(selectedStock.received_amount) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Vehicle Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedStock.status)}`}>
                    {selectedStock.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedStock(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW VEHICLE MODAL */}
      <NewVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(newVeh) => setVehicles([newVeh, ...vehicles])}
      />

    </div>
  );
};