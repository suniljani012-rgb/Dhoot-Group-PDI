import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Search, Plus, Car, ChevronRight, Download, Upload, 
  FileSpreadsheet, X, Loader2, DollarSign, CheckCircle2, 
  Receipt, Building, ShieldCheck, Printer, Calendar,
  Key, UserCheck, Truck, ArrowRight, FolderOpen, Clock,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../utils/apiConfig';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

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
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      
      {/* Top Header */}
      <PageHeader
        title="Invoicing & Gatepass Delivery"
        subtitle="Generate tax invoices, calculate charges, and issue gate passes for customer delivery"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-ok" />
              <span>Import Excel Invoices</span>
            </button>

            <button
              onClick={() => setShowNewModal(true)}
              className="h-8 px-3 rounded bg-accent hover:bg-accent-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-white/80" />
              <span>New Invoice</span>
            </button>
          </div>
        }
      />

      {/* Billing & Invoicing KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Invoices" value={totalBillingCount} note="Vouchers Created" />
        <Stat label="Ready for Handover" value={invoicedPendingHandover} note="Gatepass Pending" tone="warn" />
        <Stat label="Delivered" value={deliveredGatepassCount} note="Gatepass Signed" tone="ok" />
        <Stat label="Total Billing Value" value={`₹${(totalNetInvoiceValue / 100000).toFixed(1)}L`} note="Net Dealership Turnover" />
      </div>

      {/* Main Table Panel */}
      <Panel
        title="Commercial Invoices & Gatepasses"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-canvas border border-line rounded p-0.5 text-xs">
              {(['ALL', 'INVOICED', 'DELIVERED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`h-6 px-2.5 rounded-chip text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-surface text-ink border border-line shadow-xs font-semibold'
                      : 'text-ink-3 hover:text-ink-2'
                  }`}
                >
                  {tab === 'ALL' ? 'All Invoices' : tab}
                </button>
              ))}
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Customer, Challan, VIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-7 pl-7 pr-2.5 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Challan / Invoice</th>
                <th className="py-2.5 px-3">VIN / Chassis</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Vehicle Model</th>
                <th className="py-2.5 px-3">Financier</th>
                <th className="py-2.5 px-3 text-right">Ex-Showroom</th>
                <th className="py-2.5 px-3 text-right">Net On-Road</th>
                <th className="py-2.5 px-3">Invoice Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Handover Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <Empty title="0 Billing & Delivery Records Found" hint="Allocate stock to a customer booking or create a direct invoice to issue gatepass." />
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const isHyundai = r.model.toLowerCase().includes('hyundai') || r.vin_no.startsWith('MAL');
                  return (
                    <tr key={r.id} className="hover:bg-canvas transition-colors">
                      <td className="py-2.5 px-3 text-center text-ink-3 font-mono tnum">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-ink">
                        <div>{r.challan_no}</div>
                        <div className="text-[10px] text-ink-3 font-normal">{r.invoice_no}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink">
                        {r.vin_no}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-ink">{r.customer_name}</div>
                        <div className="text-[10px] text-ink-3">{r.city || 'Dealership'}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge tone="accent">{isHyundai ? 'Hyundai' : 'Tata'}</Badge>
                          <span className="font-medium text-ink">{r.model}</span>
                        </div>
                        <div className="text-[10px] text-ink-3">{r.variant}</div>
                      </td>
                      <td className="py-2.5 px-3 text-ink-2">
                        {r.financier_name || 'Self-Funded'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ink text-right tnum">
                        ₹{(r.ex_showroom || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ok text-right tnum">
                        ₹{(r.net_amount || (Number(r.ex_showroom) + 150000)).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum text-[11px]">
                        {r.invoice_date || '2026-08-25'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={r.status === 'DELIVERED' ? 'ok' : 'accent'}>
                          {r.status === 'DELIVERED' ? 'Vehicle Delivered' : 'Invoiced / Ready'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setInvoicePreviewRecord(r)}
                            className="h-6 px-2 rounded bg-surface border border-line hover:border-line-strong text-xs font-medium text-ink transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-ok" />
                            <span>Tax Invoice</span>
                          </button>

                          {r.status !== 'DELIVERED' ? (
                            <button
                              onClick={() => setGatepassRecord(r)}
                              className="h-6 px-2 rounded bg-ok/10 text-ok border border-ok/20 text-xs font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Key className="w-3 h-3" />
                              <span>Gatepass</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-medium text-ok inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Delivered
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ========================================================================= */}
      {/* MODAL 1: OFFICIAL DELIVERY GATEPASS & HANDOVER DIALOG                     */}
      {/* ========================================================================= */}
      {gatepassRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs select-none z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas text-ink">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="font-bold">Dealership Delivery Handover Gatepass</h3>
                  <p className="text-[10px] text-emerald-200">Security Gate Authorization • Chassis Handover</p>
                </div>
              </div>
              <button onClick={() => setGatepassRecord(null)} className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border border-line rounded p-4 bg-canvas space-y-3 font-mono">
                <div className="flex justify-between border-b border-line pb-2">
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

                <div className="pt-2 border-t border-line text-[10px] text-slate-500">
                  Customer has inspected the vehicle, received toolkit, owner manual, Fastag and confirms delivery in pristine condition.
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setGatepassRecord(null)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDelivery(gatepassRecord.id)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs flex items-center gap-1.5"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs select-none z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas text-ink">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="font-bold">Dealership Tax Invoice • {invoicePreviewRecord.invoice_no}</h3>
                  <p className="text-[10px] text-slate-400">GSTIN: 27AABCD1234F1Z5 • State: Maharashtra (27)</p>
                </div>
              </div>
              <button onClick={() => setInvoicePreviewRecord(null)} className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="border border-line rounded p-4 bg-canvas/50 space-y-3 font-mono">
                
                {/* Header Info */}
                <div className="flex justify-between border-b border-line pb-2">
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
                <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-line pb-2">
                  <div>Billed To: <strong>{invoicePreviewRecord.customer_name}</strong></div>
                  <div>Chassis VIN: <strong>{invoicePreviewRecord.vin_no}</strong></div>
                  <div>Model: <strong>{invoicePreviewRecord.model} ({invoicePreviewRecord.variant})</strong></div>
                  <div>Financier: <strong>{invoicePreviewRecord.financier_name || 'Self-Funded'}</strong></div>
                </div>

                {/* Pricing Table */}
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#EEF2F8] text-[#1A3A6B] font-semibold border-b border-[#C9D6E8]">
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
                <button type="button" onClick={() => setInvoicePreviewRecord(null)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded">
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Sending Tax Invoice PDF to printer...');
                    setInvoicePreviewRecord(null);
                  }}
                  className="px-5 py-2.5 bg-accent hover:bg-accent-600 text-white font-semibold rounded shadow-xs flex items-center gap-1.5"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs select-none z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas text-ink">
              <h3 className="font-bold text-slate-900">Generate Pre-Challan / Tax Invoice</h3>
              <button onClick={() => setShowNewModal(false)} className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer">
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
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tax Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.invoice_no}
                    onChange={(e) => setNewInvoice({ ...newInvoice, invoice_no: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono font-bold"
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
                    className="w-full p-2.5 bg-canvas border border-line rounded font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Chassis / VIN Number</label>
                  <input
                    type="text"
                    placeholder="MAT612345N1234567"
                    value={newInvoice.vin_no}
                    onChange={(e) => setNewInvoice({ ...newInvoice, vin_no: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle Model *</label>
                  <select
                    value={newInvoice.model}
                    onChange={(e) => setNewInvoice({ ...newInvoice, model: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-bold"
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
                    className="w-full p-2.5 bg-canvas border border-line rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Ex-Showroom Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newInvoice.ex_showroom}
                    onChange={(e) => setNewInvoice({ ...newInvoice, ex_showroom: Number(e.target.value) })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Insurance Amount (₹)</label>
                  <input
                    type="number"
                    value={newInvoice.insurance_amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, insurance_amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">State RTO Tax (₹)</label>
                  <input
                    type="number"
                    value={newInvoice.rto_amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, rto_amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Scheme Discount (₹)</label>
                  <input
                    type="number"
                    value={newInvoice.discount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, discount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono text-rose-700"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-600 text-white font-semibold rounded shadow-xs">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 select-none">
          <div className="bg-surface text-ink w-full max-w-5xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Bulk Import Dealership Tax Invoices & Pre-Challans</h3>
                  <p className="text-xs text-ink-3 mt-0.5">Commercial 16-Field Invoicing Ledger • Fast Spreadsheet Parser</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleChallans}
                  className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>Download Sample CSV</span>
                </button>
                <button 
                  onClick={() => setIsImportModalOpen(false)} 
                  className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
              
              {/* Recognized Columns */}
              <div className="p-3 bg-canvas border border-line rounded space-y-1.5 text-xs">
                <span className="eyebrow block text-accent">Recognized 16 Billing Columns:</span>
                <p className="text-ink-2 font-mono text-[11px] leading-relaxed break-words">
                  Challan No • <strong className="text-accent underline font-semibold">Invoice No</strong> • Challan Date • Invoice Date • Customer Name • Mobile No • Model • Variant • Colour • VIN Number • Ex-Showroom • Insurance • RTO Tax • Scheme Discount • Fastag • Financier
                </p>
              </div>

              {/* Paste or Upload Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink">
                    Paste Spreadsheet Billing Data (from Excel / CSV / Google Sheets):
                  </label>

                  <label className="h-7 px-2.5 bg-accent-soft hover:bg-accent-line/30 border border-accent-line text-accent text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Upload CSV / TSV File</span>
                    <input
                      type="file"
                      accept=".csv,.txt,.tsv,.xlsx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => handleParseChallanText(event.target?.result as string);
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <textarea
                  rows={5}
                  placeholder="Challan No\tInvoice No\tChallan Date\tInvoice Date\tCustomer Name\tMobile No\tModel\tVariant\tColour\tVIN Number\tEx-Showroom\tInsurance\tRTO Tax\tScheme Discount\tFastag\tFinancier"
                  value={csvText}
                  onChange={(e) => handleParseChallanText(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Parsed Verification Summary & Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 bg-canvas border border-line rounded">
                      <span className="eyebrow block">Total Rows</span>
                      <div className="text-base font-semibold text-ink tnum mt-0.5">{parsedRows.length}</div>
                    </div>
                    <div className="p-2.5 bg-ok/10 border border-ok/20 rounded">
                      <span className="eyebrow block text-ok">Valid Commercial Invoices</span>
                      <div className="text-base font-semibold text-ok tnum mt-0.5">{parsedRows.length}</div>
                    </div>
                    <div className="p-2.5 bg-accent-soft border border-accent-line rounded">
                      <span className="eyebrow block text-accent">Dealership Entity</span>
                      <div className="text-base font-semibold text-accent mt-0.5 truncate">{currentBrand.name}</div>
                    </div>
                  </div>

                  <div className="border border-line rounded overflow-hidden">
                    <div className="max-h-52 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px] sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Challan / Invoice</th>
                            <th className="py-2 px-3">Customer</th>
                            <th className="py-2 px-3">Model & VIN</th>
                            <th className="py-2 px-3">Financier</th>
                            <th className="py-2 px-3 text-right">Net Deal Payable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line text-ink-2">
                          {parsedRows.map((r, i) => (
                            <tr key={i} className="hover:bg-canvas/60">
                              <td className="py-1.5 px-3 font-mono font-semibold text-ink whitespace-nowrap">{r.challan_no} / {r.invoice_no}</td>
                              <td className="py-1.5 px-3 font-medium text-ink whitespace-nowrap">{r.customer_name}</td>
                              <td className="py-1.5 px-3 whitespace-nowrap">
                                <span className="font-medium text-ink block">{r.model}</span>
                                <span className="font-mono text-[10px] text-ink-3">{r.vin_no}</span>
                              </td>
                              <td className="py-1.5 px-3 text-ink-2 whitespace-nowrap">{r.financier_name || 'Direct / Cash'}</td>
                              <td className="py-1.5 px-3 font-semibold text-ink tnum text-right whitespace-nowrap">₹{r.net_amount?.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {importError && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded text-danger text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-line bg-canvas flex items-center justify-between">
              <div className="text-xs text-ink-3 font-medium">
                {parsedRows.length > 0 ? (
                  <span>Ready to import <strong>{parsedRows.length}</strong> invoices</span>
                ) : (
                  <span>Paste billing spreadsheet data or upload file above</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="h-8 px-4 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedRows.length === 0 || isImporting}
                  onClick={handleConfirmBulkImport}
                  className="h-8 px-5 rounded bg-accent hover:bg-accent-600 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Import {parsedRows.length} Invoices to Ledger</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
