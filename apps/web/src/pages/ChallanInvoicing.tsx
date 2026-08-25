import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Search, Plus, Car, ChevronRight, 
  FileSpreadsheet, X, Loader2, DollarSign, CheckCircle2, 
  Receipt, Building, ShieldCheck, Printer, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ChallanRecord {
  id: string;
  booking_date?: string;
  challan_no: string;
  challan_date?: string;
  vaahan_date?: string;
  delivery_date?: string;
  challan_type: string;
  vin_no: string;
  customer_name: string;
  address?: string;
  city?: string;
  area?: string;
  pan_no?: string;
  mobile_no?: string;
  mail_id?: string;
  model: string;
  variant: string;
  colour: string;
  sale_consultant?: string;
  team_leader?: string;
  financier_name?: string;
  corporate?: number;
  exchange?: number;
  ex_showroom?: number;
  discount?: number;
  net?: number;
  insurance_per?: number;
  insurance_amount?: number;
  ep?: number;
  rti?: number;
  cm?: number;
  rto_city?: string;
  rto_amount?: number;
  hml_acc?: number;
  own_acc?: number;
  acc_discount_amount?: number;
  acc_amount?: number;
  trc?: number;
  warranty?: number;
  handling_charges?: number;
  other_charges?: number;
  fast_tag?: number;
  tcs?: number;
  net_amount?: number;
  invoice_date?: string;
  invoice_no?: string;
  status: string;
  created_at: string;
}

export const ChallanInvoicingPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [records, setRecords] = useState<ChallanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ChallanRecord | null>(null);

  // New Invoice State
  const [newInvoice, setNewInvoice] = useState({
    challan_no: `CHL-${Date.now().toString().slice(-6)}`,
    invoice_no: `INV-${Date.now().toString().slice(-6)}`,
    vin_no: '',
    customer_name: '',
    mobile_no: '',
    city: 'Jaipur',
    model: currentBrand.models[0] || 'Model',
    variant: '',
    colour: '',
    sale_consultant: '',
    financier_name: 'Self Funded',
    ex_showroom: 1200000,
    discount: 20000,
    insurance_amount: 45000,
    rto_amount: 140000,
    acc_amount: 15000,
    handling_charges: 5000,
    fast_tag: 500,
    tcs: 0,
    challan_date: new Date().toISOString().split('T')[0],
    invoice_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    vaahan_date: '',
  });

  // Bulk Import
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchChallans();
  }, [currentBrand.code]);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const url = currentBrand.code === 'DHOOT-ALL'
        ? 'http://localhost:8787/api/v1/challans'
        : `http://localhost:8787/api/v1/challans?organization_id=${currentBrand.orgId}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculatedNetOnRoad = 
    (newInvoice.ex_showroom - newInvoice.discount) + 
    newInvoice.insurance_amount + 
    newInvoice.rto_amount + 
    newInvoice.acc_amount + 
    newInvoice.handling_charges + 
    newInvoice.fast_tag + 
    newInvoice.tcs;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetOrg = currentBrand.code === 'DHOOT-HYUNDAI' 
        ? '11111111-1111-1111-1111-111111111112' 
        : '11111111-1111-1111-1111-111111111111';

      const res = await fetch('http://localhost:8787/api/v1/challans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: targetOrg,
          ...newInvoice,
          net: newInvoice.ex_showroom - newInvoice.discount,
          net_amount: calculatedNetOnRoad,
          status: 'INVOICED'
        })
      });
      if (res.ok) {
        setShowNewModal(false);
        fetchChallans();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkImport = async () => {
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

      const res = await fetch('http://localhost:8787/api/v1/challans/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: targetOrg,
          challanRecords: parsedRecords
        })
      });

      if (res.ok) {
        setShowImportModal(false);
        setCsvText('');
        fetchChallans();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  const filtered = records.filter(r => {
    const matchesSearch = 
      r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.challan_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.invoice_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.vin_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.mobile_no?.includes(search);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            style={{ backgroundColor: `${currentBrand.primaryColor}15`, color: currentBrand.primaryColor }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold"
          >
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {currentBrand.name} • Challans & Invoicing Desk
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              45-Field Authoritative Post-Challan, Vaahan, Billing & Final Delivery Ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Invoices (45 Cols)</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            style={{ backgroundColor: currentBrand.primaryColor }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Challan / Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoiced Units</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{records.length} Vehicles</div>
          <div className="text-[11px] text-slate-500 mt-1">{currentBrand.name}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gross Invoiced</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ₹{records.reduce((sum, r) => sum + (Number(r.net_amount) || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">On-Road Settlement Value</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vaahan Registered</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {records.filter(r => r.vaahan_date).length} Units
          </div>
          <div className="text-[11px] text-slate-500 mt-1">RTO Portal Synced</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Insurance Collected</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            ₹{records.reduce((sum, r) => sum + (Number(r.insurance_amount) || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Comprehensive Motor Policies</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Customer, Invoice No, Challan, VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'INVOICED', 'DELIVERED', 'VAAHAN_PROCESSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 45-Column Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice No / Date</th>
                <th className="py-3 px-4">Challan No / Date</th>
                <th className="py-3 px-4">VIN Number</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">City / Area</th>
                <th className="py-3 px-4">Model & Variant</th>
                <th className="py-3 px-4">Colour</th>
                <th className="py-3 px-4">Sales Consultant</th>
                <th className="py-3 px-4">Financier</th>
                <th className="py-3 px-4">Ex Showroom</th>
                <th className="py-3 px-4">Insurance</th>
                <th className="py-3 px-4">RTO Amount</th>
                <th className="py-3 px-4">Acc Amount</th>
                <th className="py-3 px-4">Net On-Road</th>
                <th className="py-3 px-4">Vaahan Date</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
                    Loading Invoices & Challan Ledger...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-slate-400">
                    No challans or invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr 
                    key={r.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{r.invoice_no || '-'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.invoice_date || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{r.challan_no}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.challan_date || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.vin_no}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {r.customer_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {r.city || '-'}{r.area ? `, ${r.area}` : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.model}</div>
                      <div className="text-[11px] text-slate-500">{r.variant}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                        {r.colour}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {r.sale_consultant || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {r.financier_name || 'Direct'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-900">
                      ₹{(Number(r.ex_showroom) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-700">
                      ₹{(Number(r.insurance_amount) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      ₹{(Number(r.rto_amount) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      ₹{(Number(r.acc_amount) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      ₹{(Number(r.net_amount) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {r.vaahan_date || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-900 font-semibold">
                      {r.delivery_date || 'Pending'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px]"
                      >
                        Breakdown
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: NEW CHALLAN / INVOICE */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5" style={{ color: currentBrand.primaryColor }} />
                <h3 className="font-bold text-slate-900">New Challan & Invoicing Entry • {currentBrand.name}</h3>
              </div>
              <button 
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Section 1: Customer & Identifiers */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  1. Identification & Customer
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Challan No *</label>
                    <input
                      type="text"
                      required
                      value={newInvoice.challan_no}
                      onChange={(e) => setNewInvoice({ ...newInvoice, challan_no: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Invoice No *</label>
                    <input
                      type="text"
                      required
                      value={newInvoice.invoice_no}
                      onChange={(e) => setNewInvoice({ ...newInvoice, invoice_no: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">VIN Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="17-Digit VIN"
                      value={newInvoice.vin_no}
                      onChange={(e) => setNewInvoice({ ...newInvoice, vin_no: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={newInvoice.customer_name}
                      onChange={(e) => setNewInvoice({ ...newInvoice, customer_name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Mobile No *</label>
                    <input
                      type="text"
                      required
                      value={newInvoice.mobile_no}
                      onChange={(e) => setNewInvoice({ ...newInvoice, mobile_no: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">City</label>
                    <input
                      type="text"
                      value={newInvoice.city}
                      onChange={(e) => setNewInvoice({ ...newInvoice, city: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Model & Vehicle Specs */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  2. Vehicle Specs & Sales Team
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Model *</label>
                    <select
                      value={newInvoice.model}
                      onChange={(e) => setNewInvoice({ ...newInvoice, model: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2"
                    >
                      {currentBrand.models.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Variant *</label>
                    <input
                      type="text"
                      required
                      placeholder="Variant Spec"
                      value={newInvoice.variant}
                      onChange={(e) => setNewInvoice({ ...newInvoice, variant: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Colour *</label>
                    <input
                      type="text"
                      required
                      placeholder="Vehicle Colour"
                      value={newInvoice.colour}
                      onChange={(e) => setNewInvoice({ ...newInvoice, colour: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Financier Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank / SBI"
                      value={newInvoice.financier_name}
                      onChange={(e) => setNewInvoice({ ...newInvoice, financier_name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Financials & Pricing Calculation */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  3. Pricing & Financial Breakdown (Auto Net Calculation)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Ex-Showroom (₹) *</label>
                    <input
                      type="number"
                      value={newInvoice.ex_showroom}
                      onChange={(e) => setNewInvoice({ ...newInvoice, ex_showroom: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Discount (₹)</label>
                    <input
                      type="number"
                      value={newInvoice.discount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Insurance Amt (₹)</label>
                    <input
                      type="number"
                      value={newInvoice.insurance_amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, insurance_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none text-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">RTO Road Tax (₹)</label>
                    <input
                      type="number"
                      value={newInvoice.rto_amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, rto_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Accessories (₹)</label>
                    <input
                      type="number"
                      value={newInvoice.acc_amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, acc_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Handling / Log (₹)</label>
                    <input
                      type="number"
                      value={newInvoice.handling_charges}
                      onChange={(e) => setNewInvoice({ ...newInvoice, handling_charges: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">FastTag (₹)</label>
                    <input
                      type="number"
                      value={newInvoice.fast_tag}
                      onChange={(e) => setNewInvoice({ ...newInvoice, fast_tag: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none"
                    />
                  </div>
                  <div className="bg-emerald-100/70 p-2 rounded-xl border border-emerald-200">
                    <label className="block font-bold text-emerald-900 uppercase mb-0.5">Calculated Net On-Road</label>
                    <div className="text-sm font-black text-emerald-800 font-mono">
                      ₹{calculatedNetOnRoad.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: currentBrand.primaryColor }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow hover:opacity-90"
                >
                  Save Challan & Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK IMPORT */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Bulk Import Invoices & Challans (45 Columns) • {currentBrand.name}</h3>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-emerald-800">
                <strong>Supported 45 Headers Format:</strong> Paste directly from Excel or Google Sheets (Tab-Separated or CSV):
                <div className="mt-1 font-mono text-[10px] text-emerald-900 bg-white/70 p-2 rounded-lg overflow-x-auto">
                  Booking Date | Challan No | Challan Date | Vaahan Date | Delivery Date | Challan Type | Vin No | Customer Name | Address | City | Area | Pan No | Mobile No | Mail Id | Model | Variant | Colour | Sale Consultant | Team Leader | Financier Name | Corporate | Exchange | Ex Show Room | Discount | Net | Insurance Per | Insurance Amount | Ep | Rti | Cm | Rto City | Rto Amount | Hml Acc | Own Acc | Acc Discount Amount | Acc Amount | Trc | Warranty | Handling Charges | Other | Fast Tag | TCS | Net Amount | Invoice Date | Invoice No.
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Paste Excel Invoicing Data (Include Header Row)
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Paste tab-delimited or CSV rows directly from your dealership DMS workbook..."
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
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={importing || !csvText.trim()}
                    onClick={handleBulkImport}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow"
                  >
                    {importing ? 'Importing Invoices...' : 'Process & Import Records'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INVOICE & GATE PASS BREAKDOWN VIEWER */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Invoice Statement: {selectedRecord.invoice_no || selectedRecord.challan_no}</h3>
                <p className="text-xs text-slate-500">{selectedRecord.customer_name} • VIN: {selectedRecord.vin_no}</p>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Customer Name</span>
                  <span className="font-bold text-slate-900">{selectedRecord.customer_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Mobile Number</span>
                  <span className="font-mono text-slate-900">{selectedRecord.mobile_no || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Model & Variant</span>
                  <span className="font-bold text-slate-900">{selectedRecord.model} ({selectedRecord.variant})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Colour</span>
                  <span>{selectedRecord.colour}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  Comprehensive Billing & Charges Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Ex-Showroom Price</span>
                    <span className="font-bold text-slate-900">₹{(Number(selectedRecord.ex_showroom) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Discount Given</span>
                    <span className="font-bold text-rose-600">- ₹{(Number(selectedRecord.discount) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Net Vehicle Base</span>
                    <span className="font-bold text-slate-900">₹{(Number(selectedRecord.net) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Insurance Premium (Ep/Rti/Cm)</span>
                    <span className="font-bold text-blue-700">₹{(Number(selectedRecord.insurance_amount) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">RTO Road Tax ({selectedRecord.rto_city || 'State'})</span>
                    <span className="font-bold text-slate-900">₹{(Number(selectedRecord.rto_amount) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Accessories Amount</span>
                    <span className="font-bold text-slate-900">₹{(Number(selectedRecord.acc_amount) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Handling / Other Charges</span>
                    <span>₹{(Number(selectedRecord.handling_charges || 0) + Number(selectedRecord.other_charges || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">FastTag / TCS</span>
                    <span>₹{(Number(selectedRecord.fast_tag || 0) + Number(selectedRecord.tcs || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <span className="text-[10px] text-emerald-800 block font-bold uppercase">Final Net On-Road Total</span>
                    <span className="font-black text-emerald-700 text-sm">₹{(Number(selectedRecord.net_amount) || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  Registration & Gate Pass Dates
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Booking Date</span>
                    <span>{selectedRecord.booking_date || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Challan Date</span>
                    <span>{selectedRecord.challan_date || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Vaahan Portal Date</span>
                    <span className="font-bold text-indigo-700">{selectedRecord.vaahan_date || 'Pending'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Physical Delivery Date</span>
                    <span className="font-bold text-emerald-700">{selectedRecord.delivery_date || 'TBD'}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <Link
                to={`/certificates/cert-101`}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify PDI Certificate</span>
              </Link>

              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
