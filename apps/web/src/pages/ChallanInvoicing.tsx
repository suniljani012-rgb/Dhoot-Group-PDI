import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Search, Plus, Car, ChevronRight, 
  FileSpreadsheet, X, Loader2, DollarSign, CheckCircle2, 
  Receipt, Building, ShieldCheck, Printer, Calendar,
  Key, UserCheck, Truck, ArrowRight, FolderOpen, Clock,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../utils/apiConfig';

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
  mobile_no?: string;
  model: string;
  variant: string;
  colour: string;
  sale_consultant?: string;
  financier_name?: string;
  ex_showroom?: number;
  discount?: number;
  insurance_amount?: number;
  rto_amount?: number;
  acc_amount?: number;
  fast_tag?: number;
  net_amount?: number;
  invoice_date?: string;
  invoice_no?: string;
  status: string;
  odometer_at_delivery?: number;
  created_at?: string;
}

export const ChallanInvoicingPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [records, setRecords] = useState<ChallanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ChallanRecord | null>(null);
  const [gatepassRecord, setGatepassRecord] = useState<ChallanRecord | null>(null);
  const [invoicePreviewRecord, setInvoicePreviewRecord] = useState<ChallanRecord | null>(null);

  // New Challan / Invoice State
  const [newInvoice, setNewInvoice] = useState({
    challan_no: `CHL-${Date.now().toString().slice(-6)}`,
    invoice_no: `INV-${Date.now().toString().slice(-6)}`,
    vin_no: '',
    customer_name: '',
    mobile_no: '',
    city: 'Pune',
    model: currentBrand.models[0] || 'Tata Nexon',
    variant: 'Fearless Plus',
    colour: 'Daytona Grey',
    sale_consultant: 'Sunil Sharma',
    financier_name: 'HDFC Bank Ltd',
    ex_showroom: 1250000,
    discount: 25000,
    insurance_amount: 42000,
    rto_amount: 145000,
    acc_amount: 18000,
    fast_tag: 500,
    challan_date: new Date().toISOString().split('T')[0],
    invoice_date: new Date().toISOString().split('T')[0],
    delivery_date: new Date().toISOString().split('T')[0],
  });

const SEED_CHALLANS: ChallanRecord[] = [
  { id: 'chl-1', challan_no: 'CHL-2026-0801', challan_date: '2026-08-25', delivery_date: '2026-08-28', challan_type: 'TAX_INVOICE_DELIVERY', vin_no: 'MAT612345S8877668', customer_name: 'Vikramaditya Singhania', mobile_no: '+91 98293 22334', model: 'Tata Safari', variant: 'Adventure Plus AT', colour: 'Cosmic Gold', sale_consultant: 'Sunil Sharma', financier_name: 'HDFC Bank', ex_showroom: 2450000, discount: 25000, insurance_amount: 68000, rto_amount: 245000, acc_amount: 15000, fast_tag: 500, net_amount: 2753500, invoice_no: 'INV-2026-TAT-0091', invoice_date: '2026-08-25', status: 'INVOICED' },
  { id: 'chl-2', challan_no: 'CHL-2026-0802', challan_date: '2026-08-24', delivery_date: '2026-08-29', challan_type: 'GATE_PASS', vin_no: 'MALC12345C1122331', customer_name: 'Rajesh Kumar Verma', mobile_no: '+91 94140 55667', model: 'Hyundai Creta', variant: 'SX (O) Turbo DCT', colour: 'Ranger Khaki', sale_consultant: 'Manish Rathore', financier_name: 'State Bank of India', ex_showroom: 1980000, discount: 15000, insurance_amount: 52000, rto_amount: 198000, acc_amount: 12000, fast_tag: 500, net_amount: 2227500, invoice_no: 'INV-2026-HYN-0045', invoice_date: '2026-08-24', status: 'INVOICED' },
  { id: 'chl-3', challan_no: 'CHL-2026-0803', challan_date: '2026-08-25', delivery_date: '2026-08-30', challan_type: 'TAX_INVOICE_DELIVERY', vin_no: 'MAT612345S9988771', customer_name: 'Ramesh Chandra Sharma', mobile_no: '+91 98290 11223', model: 'Tata Safari', variant: 'Accomplished Plus 6S AT', colour: 'Oberon Black', sale_consultant: 'Sunil Sharma', financier_name: 'ICICI Bank', ex_showroom: 2650000, discount: 30000, insurance_amount: 72000, rto_amount: 265000, acc_amount: 18000, fast_tag: 500, net_amount: 2975500, invoice_no: 'INV-2026-TAT-0092', invoice_date: '2026-08-25', status: 'PENDING_DELIVERY' },
  { id: 'chl-4', challan_no: 'CHL-2026-0804', challan_date: '2026-08-25', delivery_date: '2026-08-28', challan_type: 'TAX_INVOICE_DELIVERY', vin_no: 'MAT612345T2233447', customer_name: 'Priya Kulkarni', mobile_no: '+91 98220 33445', model: 'Tata Tiago', variant: 'XZ+ Dual Tone', colour: 'Tornado Blue', sale_consultant: 'Rajesh Nair', financier_name: 'Axis Bank', ex_showroom: 780000, discount: 10000, insurance_amount: 28000, rto_amount: 78000, acc_amount: 8000, fast_tag: 500, net_amount: 884500, invoice_no: 'INV-2026-TAT-0093', invoice_date: '2026-08-25', status: 'PENDING_DELIVERY' },
  { id: 'chl-5', challan_no: 'CHL-2026-0805', challan_date: '2026-08-25', delivery_date: '2026-08-31', challan_type: 'TAX_INVOICE_DELIVERY', vin_no: 'MALC12345I6677886', customer_name: 'Anita Desai', mobile_no: '+91 98291 77889', model: 'Hyundai i20', variant: 'Asta (O) IVT', colour: 'Starry Night', sale_consultant: 'Karan Joshi', financier_name: 'Kotak Mahindra Bank', ex_showroom: 1120000, discount: 15000, insurance_amount: 38000, rto_amount: 112000, acc_amount: 10000, fast_tag: 500, net_amount: 1265500, invoice_no: 'INV-2026-HYN-0046', invoice_date: '2026-08-25', status: 'PENDING_DELIVERY' }
];

  useEffect(() => {
    fetchChallans();
  }, [currentBrand.code]);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const orgParam = currentBrand && currentBrand.code !== 'DHOOT-ALL' ? `?organization_id=${currentBrand.orgId}` : '';
      const res = await fetch(getApiUrl(`/api/v1/challans${orgParam}`));
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setRecords(json.data);
          setLoading(false);
          return;
        }
      }
      // Multi-brand filter fallback
      if (currentBrand.code === 'DHOOT-TATA') {
        setRecords(SEED_CHALLANS.filter(c => c.model.includes('Tata')));
      } else if (currentBrand.code === 'DHOOT-HYUNDAI') {
        setRecords(SEED_CHALLANS.filter(c => c.model.includes('Hyundai')));
      } else {
        setRecords(SEED_CHALLANS); // All 5 (Tata + Hyundai)
      }
    } catch (e) {
      if (currentBrand.code === 'DHOOT-TATA') {
        setRecords(SEED_CHALLANS.filter(c => c.model.includes('Tata')));
      } else if (currentBrand.code === 'DHOOT-HYUNDAI') {
        setRecords(SEED_CHALLANS.filter(c => c.model.includes('Hyundai')));
      } else {
        setRecords(SEED_CHALLANS);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const net = Number(newInvoice.ex_showroom) - Number(newInvoice.discount) + Number(newInvoice.insurance_amount) + Number(newInvoice.rto_amount) + Number(newInvoice.acc_amount) + Number(newInvoice.fast_tag);
    
    const newRec: ChallanRecord = {
      id: `chl-${Date.now()}`,
      challan_no: newInvoice.challan_no,
      invoice_no: newInvoice.invoice_no,
      vin_no: newInvoice.vin_no || `MAT612345${Date.now().toString().slice(-7)}`,
      customer_name: newInvoice.customer_name,
      mobile_no: newInvoice.mobile_no,
      city: newInvoice.city,
      model: newInvoice.model,
      variant: newInvoice.variant,
      colour: newInvoice.colour,
      sale_consultant: newInvoice.sale_consultant,
      financier_name: newInvoice.financier_name,
      ex_showroom: Number(newInvoice.ex_showroom),
      discount: Number(newInvoice.discount),
      insurance_amount: Number(newInvoice.insurance_amount),
      rto_amount: Number(newInvoice.rto_amount),
      acc_amount: Number(newInvoice.acc_amount),
      fast_tag: Number(newInvoice.fast_tag),
      net_amount: net,
      challan_date: newInvoice.challan_date,
      invoice_date: newInvoice.invoice_date,
      delivery_date: newInvoice.delivery_date,
      challan_type: 'TAX_INVOICE',
      status: 'INVOICED',
      created_at: new Date().toISOString()
    };

    setRecords([newRec, ...records]);
    setShowNewModal(false);
  };

  // Bulk Excel Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Download Sample Invoicing CSV Template
  const handleDownloadSampleChallans = () => {
    const headers = [
      'Challan No', 'Invoice No', 'Challan Date', 'Invoice Date', 'Customer Name', 
      'Mobile No', 'Model', 'Variant', 'Colour', 'VIN Number', 'Ex-Showroom', 
      'Insurance Amount', 'RTO Amount', 'Discount', 'Net Amount', 'Financier'
    ];
    const sampleRows = [
      headers.join(','),
      'CHL-009981,INV-009981,2026-08-25,2026-08-25,Ramesh Chandra Sharma,+91 98290 11223,Tata Safari,Accomplished Plus,Oberon Black,MAT612345S9988771,1950000,85000,195000,50000,2180000,HDFC Bank Ltd',
      'CHL-009982,INV-009982,2026-08-25,2026-08-25,Rajesh Kumar Verma,+91 94140 55667,Hyundai Creta,SX (O) Turbo,Ranger Khaki,MALC12345C1122331,1540000,65000,154000,30000,1729000,State Bank of India'
    ].join('\n');

    const blob = new Blob([sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dhoot_Group_Tax_Invoicing_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse Invoices Text
  const handleParseChallanText = (text: string) => {
    setCsvText(text);
    setImportError(null);

    const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    const separator = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));

    const rows = lines.slice(1).map((line, idx) => {
      const cols = line.split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h, hIdx) => {
        obj[h] = cols[hIdx] || '';
      });

      return {
        id: `chl-imp-${Date.now()}-${idx}`,
        challan_no: obj['Challan No'] || cols[0] || `CHL-00${Date.now()}${idx}`,
        invoice_no: obj['Invoice No'] || cols[1] || `INV-00${Date.now()}${idx}`,
        challan_date: obj['Challan Date'] || cols[2] || '2026-08-25',
        invoice_date: obj['Invoice Date'] || cols[3] || '2026-08-25',
        customer_name: obj['Customer Name'] || cols[4] || 'Retail Customer',
        mobile_no: obj['Mobile No'] || cols[5] || '+91 98000 00000',
        model: obj['Model'] || cols[6] || 'Tata Nexon',
        variant: obj['Variant'] || cols[7] || 'Standard',
        colour: obj['Colour'] || cols[8] || 'White',
        vin_no: obj['VIN Number'] || cols[9] || `MAT612345${Date.now()}${idx}`,
        ex_showroom: parseFloat(obj['Ex-Showroom'] || cols[10] || '1000000') || 1000000,
        insurance_amount: parseFloat(obj['Insurance Amount'] || cols[11] || '50000') || 50000,
        rto_amount: parseFloat(obj['RTO Amount'] || cols[12] || '100000') || 100000,
        discount: parseFloat(obj['Discount'] || cols[13] || '25000') || 25000,
        net_amount: parseFloat(obj['Net Amount'] || cols[14] || '1125000') || 1125000,
        financier_name: obj['Financier'] || cols[15] || 'Self Financed',
        challan_type: 'TAX_INVOICE',
        status: 'INVOICED',
        created_at: new Date().toISOString()
      };
    });

    setParsedRows(rows);
  };

  // Confirm Bulk Invoices Import
  const handleConfirmBulkImport = () => {
    if (parsedRows.length === 0) return;
    setRecords([...parsedRows, ...records]);
    setIsImportModalOpen(false);
    setCsvText('');
    setParsedRows([]);
  };

  const handleConfirmDelivery = (recordId: string) => {
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: 'DELIVERED' } : r));
    setGatepassRecord(null);
  };

  const filteredRecords = records.filter(r => {
    const cust = (r.customer_name || '').toLowerCase();
    const ch = (r.challan_no || '').toLowerCase();
    const inv = (r.invoice_no || '').toLowerCase();
    const vin = (r.vin_no || '').toLowerCase();
    const model = (r.model || '').toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = cust.includes(q) || ch.includes(q) || inv.includes(q) || vin.includes(q) || model.includes(q);

    if (statusFilter === 'INVOICED') return matchesSearch && r.status === 'INVOICED';
    if (statusFilter === 'DELIVERED') return matchesSearch && r.status === 'DELIVERED';
    return matchesSearch;
  });

  // Dynamic Billing KPI Metrics
  const totalBillingCount = records.length;
  const invoicedPendingHandover = records.filter(r => r.status === 'INVOICED').length;
  const deliveredGatepassCount = records.filter(r => r.status === 'DELIVERED').length;
  const totalNetInvoiceValue = records.reduce((sum, r) => sum + (Number(r.net_amount) || 1500000), 0);

  return (
    <div className="space-y-4 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-black text-slate-900 leading-tight">
            Pre-Challan, Tax Invoicing & Delivery Handover Desk
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Generate 35-field dealership tax invoices, compute RTO & insurance breakdown, and issue official security gatepass
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel Invoices</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generate Pre-Challan / Invoice</span>
          </button>
        </div>
      </div>

      {/* Billing & Invoicing KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Commercial Invoices</span>
            <span className="text-xl font-black text-slate-900 leading-none mt-0.5 block">{totalBillingCount}</span>
            <span className="text-[10px] font-semibold text-slate-500 mt-1 block">Vouchers Created</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ready for Handover</span>
            <span className="text-xl font-black text-amber-600 leading-none mt-0.5 block">{invoicedPendingHandover}</span>
            <span className="text-[10px] font-semibold text-amber-700 mt-1 block">Gatepass Pending</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivered Customers</span>
            <span className="text-xl font-black text-emerald-600 leading-none mt-0.5 block">{deliveredGatepassCount}</span>
            <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">Gatepass Signed</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoiced Billing</span>
            <span className="text-xl font-black text-indigo-600 leading-none mt-0.5 block font-mono">
              ₹{(totalNetInvoiceValue / 100000).toFixed(1)}L
            </span>
            <span className="text-[10px] font-semibold text-slate-500 mt-1 block">Net Dealership Value</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Dense Excel-Style Invoicing Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            {(['ALL', 'INVOICED', 'DELIVERED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  statusFilter === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Invoices' : tab}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Customer, Challan, Invoice, VIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Excel Data Grid */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Challan / Invoice No</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Vehicle Model</th>
                <th className="py-2.5 px-3">Financier</th>
                <th className="py-2.5 px-3">Ex-Showroom</th>
                <th className="py-2.5 px-3">Net On-Road</th>
                <th className="py-2.5 px-3">Invoice Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Handover Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    <div className="space-y-1">
                      <FolderOpen className="w-6 h-6 mx-auto text-slate-300" />
                      <div className="font-bold text-slate-600">0 Billing & Delivery Records in Database</div>
                      <p className="text-[11px]">Allocate stock to a customer booking or create a direct invoice to issue gatepass.</p>
                      <button
                        onClick={() => setShowNewModal(true)}
                        className="inline-flex items-center gap-1 text-slate-900 font-bold underline mt-2 text-xs cursor-pointer"
                      >
                        <span>Generate First Tax Invoice</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <div>{r.challan_no}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{r.invoice_no}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {r.vin_no}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{r.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{r.city || 'Dealership'}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{r.model}</div>
                      <div className="text-[10px] text-slate-400">{r.variant}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {r.financier_name || 'Self-Funded'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      ₹{(r.ex_showroom || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      ₹{(r.net_amount || (Number(r.ex_showroom) + 150000)).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {r.invoice_date || '2026-08-25'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        r.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {r.status === 'DELIVERED' ? 'Vehicle Delivered' : 'Invoiced / Ready'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setInvoicePreviewRecord(r)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span>Tax Invoice</span>
                        </button>

                        {r.status !== 'DELIVERED' ? (
                          <button
                            onClick={() => setGatepassRecord(r)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Key className="w-3 h-3" />
                            <span>Gatepass</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Handed Over
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {filteredRecords.length} billing records</span>
          <span className="text-slate-500 font-medium">Commercial Billing Authority</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: OFFICIAL DELIVERY GATEPASS & HANDOVER DIALOG                     */}
      {/* ========================================================================= */}
      {gatepassRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="font-bold">Dealership Delivery Handover Gatepass</h3>
                  <p className="text-[10px] text-emerald-200">Security Gate Authorization • Chassis Handover</p>
                </div>
              </div>
              <button onClick={() => setGatepassRecord(null)} className="p-1 rounded-xl hover:bg-emerald-800 text-emerald-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{currentBrand.name} Handover Desk</span>
                    <div className="text-[10px] text-slate-500">Gatepass No: GP-{gatepassRecord.challan_no.replace('CHL-', '')}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">Date: {new Date().toISOString().split('T')[0]}</span>
                    <div className="text-[10px] text-emerald-700 font-bold">✓ PDI Certified & Cleaned</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Customer: <strong>{gatepassRecord.customer_name}</strong></div>
                  <div>Phone: <strong>{gatepassRecord.mobile_no || '+91 98765 43210'}</strong></div>
                  <div>Model: <strong>{gatepassRecord.model}</strong></div>
                  <div>Color: <strong>{gatepassRecord.colour}</strong></div>
                  <div className="col-span-2">VIN Number: <strong className="text-slate-900">{gatepassRecord.vin_no}</strong></div>
                  <div>Handover Odometer: <strong>14 KM</strong></div>
                  <div>Keys Handed: <strong>2 Remote Fobs</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  Customer has inspected the vehicle, received toolkit, owner manual, Fastag and confirms delivery in pristine condition.
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setGatepassRecord(null)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDelivery(gatepassRecord.id)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorize Gate Exit & Mark Delivered</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL DEALERSHIP TAX INVOICE PRINT PREVIEW                    */}
      {/* ========================================================================= */}
      {invoicePreviewRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="font-bold">Dealership Tax Invoice • {invoicePreviewRecord.invoice_no}</h3>
                  <p className="text-[10px] text-slate-400">GSTIN: 27AABCD1234F1Z5 • State: Maharashtra (27)</p>
                </div>
              </div>
              <button onClick={() => setInvoicePreviewRecord(null)} className="p-1 rounded-xl hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3 font-mono">
                
                {/* Header Info */}
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{currentBrand.name}</span>
                    <div className="text-[10px] text-slate-500">Authorized Dealership Network</div>
                  </div>
                  <div className="text-right">
                    <div>Invoice No: <strong>{invoicePreviewRecord.invoice_no}</strong></div>
                    <div>Date: <strong>{invoicePreviewRecord.invoice_date || '2026-08-25'}</strong></div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 pb-2">
                  <div>Billed To: <strong>{invoicePreviewRecord.customer_name}</strong></div>
                  <div>Chassis VIN: <strong>{invoicePreviewRecord.vin_no}</strong></div>
                  <div>Model: <strong>{invoicePreviewRecord.model} ({invoicePreviewRecord.variant})</strong></div>
                  <div>Financier: <strong>{invoicePreviewRecord.financier_name || 'Self-Funded'}</strong></div>
                </div>

                {/* Pricing Table */}
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-1.5 px-2">Description</th>
                      <th className="py-1.5 px-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    <tr>
                      <td className="py-1.5 px-2">Ex-Showroom Price</td>
                      <td className="py-1.5 px-2 text-right font-bold">₹{(invoicePreviewRecord.ex_showroom || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2">Dealership Scheme Discount</td>
                      <td className="py-1.5 px-2 text-right text-rose-700">- ₹{(invoicePreviewRecord.discount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2">Comprehensive Insurance (1+3 Years Zero Dep)</td>
                      <td className="py-1.5 px-2 text-right">₹{(invoicePreviewRecord.insurance_amount || 42000).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2">State RTO Tax & Registration Fees</td>
                      <td className="py-1.5 px-2 text-right">₹{(invoicePreviewRecord.rto_amount || 145000).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2">OEM Genuine Accessories Kit</td>
                      <td className="py-1.5 px-2 text-right">₹{(invoicePreviewRecord.acc_amount || 18000).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2">Fastag & Mandatory Handling</td>
                      <td className="py-1.5 px-2 text-right">₹{(invoicePreviewRecord.fast_tag || 500).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold text-sm">
                      <td className="py-2 px-2 text-slate-900">Total Net On-Road Payable:</td>
                      <td className="py-2 px-2 text-right text-emerald-700">₹{(invoicePreviewRecord.net_amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setInvoicePreviewRecord(null)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Sending Tax Invoice PDF to printer...');
                    setInvoicePreviewRecord(null);
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Tax Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: NEW PRE-CHALLAN / INVOICE FORM                                   */}
      {/* ========================================================================= */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-bold text-slate-900">Generate Pre-Challan / Tax Invoice</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Challan Number *</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.challan_no}
                    onChange={(e) => setNewInvoice({ ...newInvoice, challan_no: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tax Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.invoice_no}
                    onChange={(e) => setNewInvoice({ ...newInvoice, invoice_no: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Mahindra"
                    value={newInvoice.customer_name}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customer_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Chassis / VIN Number</label>
                  <input
                    type="text"
                    placeholder="MAT612345N1234567"
                    value={newInvoice.vin_no}
                    onChange={(e) => setNewInvoice({ ...newInvoice, vin_no: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle Model *</label>
                  <select
                    value={newInvoice.model}
                    onChange={(e) => setNewInvoice({ ...newInvoice, model: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {currentBrand.models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Financier Institution</label>
                  <input
                    type="text"
                    placeholder="HDFC Bank / SBI Auto Loan"
                    value={newInvoice.financier_name}
                    onChange={(e) => setNewInvoice({ ...newInvoice, financier_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Ex-Showroom Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newInvoice.ex_showroom}
                    onChange={(e) => setNewInvoice({ ...newInvoice, ex_showroom: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Insurance Amount (₹)</label>
                  <input
                    type="number"
                    value={newInvoice.insurance_amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, insurance_amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">State RTO Tax (₹)</label>
                  <input
                    type="number"
                    value={newInvoice.rto_amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, rto_amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Scheme Discount (₹)</label>
                  <input
                    type="number"
                    value={newInvoice.discount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, discount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-rose-700"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs">
                  Generate Pre-Challan & Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: BULK EXCEL INVOICE & CHALLAN IMPORTER                             */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold">Bulk Import Dealership Tax Invoices & Pre-Challans</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 rounded-xl hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <div className="font-bold text-slate-800">Download Official Invoicing Template</div>
                  <div className="text-[10px] text-slate-400">Standard 16-field commercial billing structure</div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleChallans}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-slate-800"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Paste Excel / CSV Billing Data:
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste rows from Excel (Challan No, Invoice No, Challan Date, Invoice Date, Customer Name, Mobile No, Model, Variant, Colour, VIN Number, Ex-Showroom...)"
                  value={csvText}
                  onChange={(e) => handleParseChallanText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Parsed {parsedRows.length} Commercial Invoices Ready for Upload:
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0">
                        <tr>
                          <th className="p-2">Challan / Invoice</th>
                          <th className="p-2">Customer</th>
                          <th className="p-2">Model & VIN</th>
                          <th className="p-2">Net Deal Amount</th>
                          <th className="p-2">Financier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-slate-900">{r.challan_no} / {r.invoice_no}</td>
                            <td className="p-2 font-bold">{r.customer_name}</td>
                            <td className="p-2">
                              <span className="font-semibold block">{r.model}</span>
                              <span className="font-mono text-[9px] text-slate-500">{r.vin_no}</span>
                            </td>
                            <td className="p-2 font-mono font-bold text-indigo-700">₹{r.net_amount?.toLocaleString()}</td>
                            <td className="p-2 text-slate-600">{r.financier_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0 || isImporting}
                onClick={handleConfirmBulkImport}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Import {parsedRows.length} Invoices to Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
