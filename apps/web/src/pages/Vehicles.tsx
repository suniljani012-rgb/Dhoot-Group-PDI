import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Filter, Car, ChevronRight, FileSpreadsheet, 
  X, Loader2, Calendar, Building, DollarSign, UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewVehicleModal } from '../components/vehicles/NewVehicleModal';

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
      const url = currentBrand.code === 'DHOOT-ALL'
        ? 'http://localhost:8787/api/v1/stock'
        : `http://localhost:8787/api/v1/stock?organization_id=${currentBrand.orgId}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setVehicles(json.data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Default seeded stock fallback
    if (currentBrand.code === 'DHOOT-HYUNDAI') {
      setVehicles([
        { id: '1', vin: 'MALC12345C1122334', model: 'Hyundai Creta', variant: 'SX(O) Turbo 1.5 DCT', color: 'Ranger Khaki', fuel_type: 'PETROL', fsc_code: 'FSC-HYN-901', dealer_code: 'DLR-RJ01', plant_code: 'PLT-CHE', manufacturing_year: 2026, status: 'RECEIVED', quantity: 1, location: 'Jaipur Main Stockyard', customer_name: 'Sunil Jani', sales_consultant: 'Ramesh Choudhary', accessories_amount: 15000, delivery_date: '2026-08-27', allocation_date: '2026-08-21', allocated_days: 4, received_amount: 51000, purchase_date: '2026-08-15' },
        { id: '2', vin: 'MALC12345V5566778', model: 'Hyundai Venue', variant: 'N Line N8 DCT', color: 'Atlas White / Abyss Black', fuel_type: 'PETROL', fsc_code: 'FSC-HYN-902', dealer_code: 'DLR-RJ02', plant_code: 'PLT-CHE', manufacturing_year: 2026, status: 'PDI_PENDING', quantity: 1, location: 'Jodhpur Stockyard', customer_name: 'Pooja Agarwal', sales_consultant: 'Kavita Shekhawat', accessories_amount: 8500, delivery_date: '2026-08-29', allocation_date: '2026-08-23', allocated_days: 2, received_amount: 25000, purchase_date: '2026-08-18' },
      ]);
    } else if (currentBrand.code === 'DHOOT-TATA') {
      setVehicles([
        { id: '3', vin: 'MAT612345N1234567', model: 'Tata Nexon', variant: 'Fearless Plus S DT', color: 'Daytona Grey', fuel_type: 'PETROL', fsc_code: 'FSC-TAT-801', dealer_code: 'DLR-MH01', plant_code: 'PLT-PUN', manufacturing_year: 2026, status: 'RECEIVED', quantity: 1, location: 'Pune Central Stockyard', customer_name: 'Rajesh Sharma', sales_consultant: 'Vikram Malhotra', accessories_amount: 18000, delivery_date: '2026-08-28', allocation_date: '2026-08-20', allocated_days: 5, received_amount: 50000, purchase_date: '2026-08-14' },
        { id: '4', vin: 'MAT612345H7654321', model: 'Tata Harrier', variant: 'Fearless Plus Dark', color: 'Oberon Black', fuel_type: 'DIESEL', fsc_code: 'FSC-TAT-802', dealer_code: 'DLR-MH02', plant_code: 'PLT-PUN', manufacturing_year: 2026, status: 'PDI_PENDING', quantity: 1, location: 'Mumbai Stockyard', customer_name: 'Amit Deshmukh', sales_consultant: 'Sneha Kulkarni', accessories_amount: 25000, delivery_date: '2026-08-30', allocation_date: '2026-08-22', allocated_days: 3, received_amount: 100000, purchase_date: '2026-08-16' },
      ]);
    } else {
      // Consolidated ALL
      setVehicles([
        { id: '1', vin: 'MALC12345C1122334', model: 'Hyundai Creta', variant: 'SX(O) Turbo 1.5 DCT', color: 'Ranger Khaki', fuel_type: 'PETROL', fsc_code: 'FSC-HYN-901', dealer_code: 'DLR-RJ01', plant_code: 'PLT-CHE', manufacturing_year: 2026, status: 'RECEIVED', quantity: 1, location: 'Jaipur Main Stockyard', customer_name: 'Sunil Jani', sales_consultant: 'Ramesh Choudhary', accessories_amount: 15000, delivery_date: '2026-08-27', allocation_date: '2026-08-21', allocated_days: 4, received_amount: 51000, purchase_date: '2026-08-15' },
        { id: '2', vin: 'MALC12345V5566778', model: 'Hyundai Venue', variant: 'N Line N8 DCT', color: 'Atlas White / Abyss Black', fuel_type: 'PETROL', fsc_code: 'FSC-HYN-902', dealer_code: 'DLR-RJ02', plant_code: 'PLT-CHE', manufacturing_year: 2026, status: 'PDI_PENDING', quantity: 1, location: 'Jodhpur Stockyard', customer_name: 'Pooja Agarwal', sales_consultant: 'Kavita Shekhawat', accessories_amount: 8500, delivery_date: '2026-08-29', allocation_date: '2026-08-23', allocated_days: 2, received_amount: 25000, purchase_date: '2026-08-18' },
        { id: '3', vin: 'MAT612345N1234567', model: 'Tata Nexon', variant: 'Fearless Plus S DT', color: 'Daytona Grey', fuel_type: 'PETROL', fsc_code: 'FSC-TAT-801', dealer_code: 'DLR-MH01', plant_code: 'PLT-PUN', manufacturing_year: 2026, status: 'RECEIVED', quantity: 1, location: 'Pune Central Stockyard', customer_name: 'Rajesh Sharma', sales_consultant: 'Vikram Malhotra', accessories_amount: 18000, delivery_date: '2026-08-28', allocation_date: '2026-08-20', allocated_days: 5, received_amount: 50000, purchase_date: '2026-08-14' },
        { id: '4', vin: 'MAT612345H7654321', model: 'Tata Harrier', variant: 'Fearless Plus Dark', color: 'Oberon Black', fuel_type: 'DIESEL', fsc_code: 'FSC-TAT-802', dealer_code: 'DLR-MH02', plant_code: 'PLT-PUN', manufacturing_year: 2026, status: 'PDI_PENDING', quantity: 1, location: 'Mumbai Stockyard', customer_name: 'Amit Deshmukh', sales_consultant: 'Sneha Kulkarni', accessories_amount: 25000, delivery_date: '2026-08-30', allocation_date: '2026-08-22', allocated_days: 3, received_amount: 100000, purchase_date: '2026-08-16' },
      ]);
    }
    setLoading(false);
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

      const res = await fetch('http://localhost:8787/api/v1/stock/bulk-import', {
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
      case 'RECEIVED': return 'bg-[#FEF7E8] text-[#92600A] border-[#F5D48E]';
      case 'PDI_PENDING': return 'bg-[#EBF3FD] text-[#1565A8] border-[#9DC7F0]';
      case 'PDI_IN_PROGRESS': return 'bg-[#EBF3FD] text-[#1A3A6B] border-[#2C5298] font-bold';
      case 'PDI_APPROVED':
      case 'DELIVERY_READY': return 'bg-[#EBF7F1] text-[#1A7C4A] border-[#A8DFC0]';
      case 'PDI_FAILED': return 'bg-[#FEECEC] text-[#C62828] border-[#F5A8A8]';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
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

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{currentBrand.name} Vehicle Stock Inventory</h2>
            <span style={{ backgroundColor: `${currentBrand.primaryColor}15`, color: currentBrand.primaryColor }} className="text-xs font-bold px-2.5 py-0.5 rounded-full">
              {currentBrand.shortName}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">21-Field Authoritative Stockyard Inventory & Allocation Ledger</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Stock CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: currentBrand.primaryColor }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-xs font-bold rounded-2xl shadow-sm hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Vehicle</span>
          </button>
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
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/90 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">VIN Number</th>
                <th className="py-3 px-4">Model & Variant</th>
                <th className="py-3 px-4">Colour</th>
                <th className="py-3 px-4">Fuel</th>
                <th className="py-3 px-4">FSC Code</th>
                <th className="py-3 px-4">Dealer / Plant</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Allocated Customer</th>
                <th className="py-3 px-4">Sales Consultant</th>
                <th className="py-3 px-4">Purchase Date</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Rec. Amount</th>
                <th className="py-3 px-4">Vehicle Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
                    Loading Stock Inventory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    No vehicles found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr 
                    key={v.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedStock(v)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.vin}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{v.model}</div>
                      <div className="text-[11px] text-slate-500">{v.variant}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                        {v.color}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[11px] text-slate-600">
                      {v.fuel_type || 'PETROL'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {v.fsc_code || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {v.dealer_code || '-'}/{v.plant_code || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {v.location || 'Central Stockyard'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {v.customer_name || <span className="text-slate-400 font-normal italic">Unallocated</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {v.sales_consultant || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {v.purchase_date || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {v.delivery_date || 'TBD'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-center">
                      {v.allocated_days || 0}d
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{(Number(v.received_amount) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to="/pdi"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                      >
                        <span>PDI</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BULK IMPORT STOCK MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Bulk Import Stock Inventory • {currentBrand.name}</h3>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-800">
                <strong>Supported 21 Stock Headers Format:</strong> Paste directly from Excel or Google Sheets (Tab-Separated or CSV):
                <div className="mt-1 font-mono text-[10px] text-emerald-900 bg-white/70 p-2 rounded-lg overflow-x-auto">
                  Purchase Date | Model | Variant | Colour | Fuel | FSC Code | Dealer Code | Plant Code | Year | Status | Vin No | Quantity | Location | Customer Name | Sales Consultant | Accessories Amount | Vehicle Status | Delivery Date | Allocation Date | Allocated Days | Received Amount
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Paste Excel Stock Data (Include Header Row)
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Paste tab-delimited or CSV rows directly from your stockyard Excel workbook..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {csvText.trim() ? `${csvText.trim().split('\n').length - 1} rows detected` : 'No data pasted'}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={importing || !csvText.trim()}
                    onClick={handleBulkStockImport}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow"
                  >
                    {importing ? 'Importing Rows...' : 'Process & Import Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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