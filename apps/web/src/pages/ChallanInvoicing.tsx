import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { supabase } from '../lib/supabase';
import { 
  FileText, Search, Plus, Car, ChevronRight, Download, Upload, 
  FileSpreadsheet, X, Loader2, DollarSign, CheckCircle2, 
  Receipt, Building, ShieldCheck, Printer, Calendar,
  Key, UserCheck, Truck, ArrowRight, FolderOpen, Clock,
  AlertCircle, Check, MapPin, Phone, Hash
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { formatDate } from '../utils/dateUtils';
import { 
  getChallansForBrand, saveChallansInventory,
  getVehiclesForBrand, syncWithSupabase
} from '../data/seedData';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

export interface ChallanRecord {
  id: string;
  booking_date: string;
  challan_no: string;
  challan_date: string;
  delivery_date: string;
  challan_type: string;
  vin_no: string;
  customer_name: string;
  mobile: string;
  city: string;
  model: string;
  variant: string;
  colour: string;
  sale_consultant: string;
  team_leader: string;
  financier_name: string;
  corporate: string;
  exchange: string;
  ex_showroom: number;
  discount: number;
  net: number;
  insurance_per: number;
  insurance_amount: number;
  ep: number;
  rti: number;
  cm: number;
  rto_city: string;
  rto_amount: number;
  hml_acc: number;
  own_acc: number;
  acc_discount_amount: number;
  acc_amount: number;
  trc: number;
  warranty: number;
  handling_charges: number;
  other: number;
  fast_tag: number;
  tcs: number;
  net_amount: number;
  invoice_date: string;
  invoice_no: string;
  status: string;
  created_at?: string;
}

export const ChallanInvoicingPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [records, setRecords] = useState<ChallanRecord[]>(() => getChallansForBrand(currentBrand?.code || 'DHOOT-ALL'));
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ChallanRecord | null>(null);
  const [gatepassRecord, setGatepassRecord] = useState<ChallanRecord | null>(null);
  const [invoicePreviewRecord, setInvoicePreviewRecord] = useState<ChallanRecord | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Bulk Excel Import State
  const [parsedRows, setParsedRows] = useState<ChallanRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ total: number; newCount: number; duplicateCount: number } | null>(null);

  // 40 HEADERS DEFINITION
  const CHALLAN_HEADERS = [
    'Booking Date',
    'Challan No',
    'Challan Date',
    'Delivery Date',
    'Challan Type',
    'Vin No',
    'Customer Name',
    'Mobile',
    'City',
    'Model',
    'Variant',
    'Colour',
    'Sale Consultant',
    'Team Leader',
    'Financier Name',
    'Corporate',
    'Exchange',
    'Ex Show Room',
    'Discount',
    'Net',
    'Insurance Per',
    'Insurance Amount',
    'Ep',
    'Rti',
    'Cm',
    'Rto City',
    'Rto Amount',
    'Hml Acc',
    'Own Acc',
    'Acc Discount Amount',
    'Acc Amount',
    'Trc',
    'Warranty',
    'Handling Charges',
    'Other',
    'Fast Tag',
    'TCS',
    'Net Amount',
    'Invoice Date',
    'Invoice No.'
  ];

  useEffect(() => {
    syncWithSupabase();
  }, []);

  useEffect(() => {
    fetchChallans();

    const handleUpdate = () => {
      fetchChallans();
    };

    window.addEventListener('challans-updated', handleUpdate);
    return () => window.removeEventListener('challans-updated', handleUpdate);
  }, [currentBrand?.code]);

  const fetchChallans = () => {
    setLoading(true);
    try {
      const list = getChallansForBrand(currentBrand?.code || 'DHOOT-ALL');
      setRecords(list);
    } catch (e) {
      console.warn('Error loading challans:', e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const sampleRows = [
      CHALLAN_HEADERS.join(','),
      '20-Aug-2026,CHL-2026-0801,25-Aug-2026,28-Aug-2026,TAX_INVOICE_DELIVERY,MAT612345S8877668,Vikramaditya Singhania,+91 98293 22334,Jodhpur,Tata Safari,Adventure Plus AT,Cosmic Gold,Sunil Sharma,Rajesh Nair,HDFC Bank Ltd,No,Yes,2450000,25000,2425000,3.5,68000,4500,2500,1000,Jodhpur,245000,10000,5000,0,15000,500,12000,2500,0,500,24250,2797750,25-Aug-2026,INV-2026-TAT-0091',
      '22-Aug-2026,CHL-2026-0802,24-Aug-2026,29-Aug-2026,GATE_PASS,MALC12345C1122331,Rajesh Kumar Verma,+91 94140 55667,Jodhpur,Hyundai Creta,SX (O) Turbo DCT,Ranger Khaki,Manish Rathore,Suresh Sharma,State Bank of India,No,No,1980000,15000,1965000,3.2,52000,3500,2000,800,Jodhpur,198000,8000,4000,0,12000,500,10000,2000,0,500,19650,2261650,24-Aug-2026,INV-2026-HYN-0045'
    ].join('\n');

    const blob = new Blob([sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Dhoot_Group_Challan_Invoicing_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processChallanGrid = (grid: any[][]) => {
    if (!grid || grid.length <= 1) {
      setParsedRows([]);
      return;
    }

    let headerRowIdx = 0;
    for (let r = 0; r < Math.min(6, grid.length); r++) {
      const rowStr = grid[r].map(c => String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '')).join(' ');
      if (rowStr.includes('challan') || rowStr.includes('invoice') || rowStr.includes('customer')) {
        headerRowIdx = r;
        break;
      }
    }

    const rawHeaders = grid[headerRowIdx].map(h => String(h || '').trim());
    const findCol = (names: string[]): number => {
      return rawHeaders.findIndex(h => {
        const clean = String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return names.some(n => clean === n.toLowerCase().replace(/[^a-z0-9]/g, ''));
      });
    };

    const idxBookingDate = findCol(['Booking Date', 'BookingDate']);
    const idxChallanNo = findCol(['Challan No', 'ChallanNo', 'Challan Number']);
    const idxChallanDate = findCol(['Challan Date', 'ChallanDate']);
    const idxDeliveryDate = findCol(['Delivery Date', 'DeliveryDate']);
    const idxChallanType = findCol(['Challan Type', 'ChallanType', 'Type']);
    const idxVinNo = findCol(['Vin No', 'VinNo', 'VIN', 'Chassis No']);
    const idxCustomerName = findCol(['Customer Name', 'CustomerName', 'Customer']);
    const idxMobile = findCol(['Mobile', 'Mobile No', 'Phone']);
    const idxCity = findCol(['City', 'Location']);
    const idxModel = findCol(['Model', 'Vehicle Model']);
    const idxVariant = findCol(['Variant', 'Trim']);
    const idxColour = findCol(['Colour', 'Color']);
    const idxSalesConsultant = findCol(['Sale Consultant', 'Sales Consultant', 'SC']);
    const idxTeamLeader = findCol(['Team Leader', 'TL']);
    const idxFinancier = findCol(['Financier Name', 'Financier', 'Bank']);
    const idxCorporate = findCol(['Corporate']);
    const idxExchange = findCol(['Exchange']);
    const idxExShowroom = findCol(['Ex Show Room', 'Ex Showroom', 'ExShowRoom']);
    const idxDiscount = findCol(['Discount']);
    const idxNet = findCol(['Net']);
    const idxInsurancePer = findCol(['Insurance Per', 'Insurance %']);
    const idxInsuranceAmt = findCol(['Insurance Amount', 'Insurance Amt']);
    const idxEp = findCol(['Ep', 'EP']);
    const idxRti = findCol(['Rti', 'RTI']);
    const idxCm = findCol(['Cm', 'CM']);
    const idxRtoCity = findCol(['Rto City', 'RTO City']);
    const idxRtoAmt = findCol(['Rto Amount', 'RTO Amount', 'RTO']);
    const idxHmlAcc = findCol(['Hml Acc', 'HML Acc']);
    const idxOwnAcc = findCol(['Own Acc']);
    const idxAccDisc = findCol(['Acc Discount Amount', 'Acc Discount']);
    const idxAccAmt = findCol(['Acc Amount', 'Accessories Amount']);
    const idxTrc = findCol(['Trc', 'TRC']);
    const idxWarranty = findCol(['Warranty', 'EW']);
    const idxHandling = findCol(['Handling Charges', 'Handling']);
    const idxOther = findCol(['Other', 'Other Charges']);
    const idxFastTag = findCol(['Fast Tag', 'FastTag']);
    const idxTcs = findCol(['TCS', 'Tcs']);
    const idxNetAmount = findCol(['Net Amount', 'Total Net Amount', 'Invoice Total']);
    const idxInvoiceDate = findCol(['Invoice Date', 'InvoiceDate']);
    const idxInvoiceNo = findCol(['Invoice No.', 'Invoice No', 'Invoice Number']);

    const parseNum = (val: any) => Number(String(val || '0').replace(/[^0-9.-]/g, '')) || 0;

    const existingKeys = new Set(records.map(r => (r.challan_no || r.invoice_no || r.vin_no).toUpperCase().trim()));
    const seenInSheet = new Set<string>();

    const rows: ChallanRecord[] = [];
    let duplicateCount = 0;

    for (let i = headerRowIdx + 1; i < grid.length; i++) {
      const cols = grid[i];
      if (!cols || cols.length === 0 || cols.every(c => c === undefined || c === null || String(c).trim() === '')) {
        continue;
      }

      const getVal = (colIdx: number, fallbackIdx?: number): string => {
        if (colIdx >= 0 && cols[colIdx] !== undefined && cols[colIdx] !== null) return String(cols[colIdx]).trim();
        if (fallbackIdx !== undefined && cols[fallbackIdx] !== undefined && cols[fallbackIdx] !== null) return String(cols[fallbackIdx]).trim();
        return '';
      };

      const challanNo = getVal(idxChallanNo, 1) || `CHL-${202600 + i}`;
      const invoiceNo = getVal(idxInvoiceNo, 39) || `INV-${202600 + i}`;
      const vinNo = getVal(idxVinNo, 5) || `MAT${Date.now()}${i}`;

      const dedupeKey = (challanNo || invoiceNo || vinNo).toUpperCase().trim();
      if (existingKeys.has(dedupeKey) || seenInSheet.has(dedupeKey)) {
        duplicateCount++;
        continue;
      }
      seenInSheet.add(dedupeKey);

      rows.push({
        id: `chl-${Date.now()}-${i}`,
        booking_date: getVal(idxBookingDate, 0) ? formatDate(getVal(idxBookingDate, 0)) : formatDate(new Date()),
        challan_no: challanNo,
        challan_date: getVal(idxChallanDate, 2) ? formatDate(getVal(idxChallanDate, 2)) : formatDate(new Date()),
        delivery_date: getVal(idxDeliveryDate, 3) ? formatDate(getVal(idxDeliveryDate, 3)) : formatDate(new Date()),
        challan_type: getVal(idxChallanType, 4) || 'TAX_INVOICE_DELIVERY',
        vin_no: vinNo,
        customer_name: getVal(idxCustomerName, 6) || `Customer ${i}`,
        mobile: getVal(idxMobile, 7) || '+91 98000 00000',
        city: getVal(idxCity, 8) || 'Jodhpur',
        model: getVal(idxModel, 9) || (currentBrand.code === 'DHOOT-HYUNDAI' ? 'Hyundai Creta' : 'Tata Safari'),
        variant: getVal(idxVariant, 10) || 'Standard',
        colour: getVal(idxColour, 11) || 'White',
        sale_consultant: getVal(idxSalesConsultant, 12) || 'Sales Desk',
        team_leader: getVal(idxTeamLeader, 13) || '',
        financier_name: getVal(idxFinancier, 14) || 'Self Funded',
        corporate: getVal(idxCorporate, 15) || 'No',
        exchange: getVal(idxExchange, 16) || 'No',
        ex_showroom: parseNum(getVal(idxExShowroom, 17)),
        discount: parseNum(getVal(idxDiscount, 18)),
        net: parseNum(getVal(idxNet, 19)),
        insurance_per: parseNum(getVal(idxInsurancePer, 20)),
        insurance_amount: parseNum(getVal(idxInsuranceAmt, 21)),
        ep: parseNum(getVal(idxEp, 22)),
        rti: parseNum(getVal(idxRti, 23)),
        cm: parseNum(getVal(idxCm, 24)),
        rto_city: getVal(idxRtoCity, 25) || 'Jodhpur',
        rto_amount: parseNum(getVal(idxRtoAmt, 26)),
        hml_acc: parseNum(getVal(idxHmlAcc, 27)),
        own_acc: parseNum(getVal(idxOwnAcc, 28)),
        acc_discount_amount: parseNum(getVal(idxAccDisc, 29)),
        acc_amount: parseNum(getVal(idxAccAmt, 30)),
        trc: parseNum(getVal(idxTrc, 31)),
        warranty: parseNum(getVal(idxWarranty, 32)),
        handling_charges: parseNum(getVal(idxHandling, 33)),
        other: parseNum(getVal(idxOther, 34)),
        fast_tag: parseNum(getVal(idxFastTag, 35)),
        tcs: parseNum(getVal(idxTcs, 36)),
        net_amount: parseNum(getVal(idxNetAmount, 37)),
        invoice_date: getVal(idxInvoiceDate, 38) ? formatDate(getVal(idxInvoiceDate, 38)) : formatDate(new Date()),
        invoice_no: invoiceNo,
        status: 'INVOICED',
        created_at: new Date().toISOString()
      });
    }

    setParsedRows(rows);
    setImportSummary({
      total: grid.length - (headerRowIdx + 1),
      newCount: rows.length,
      duplicateCount
    });
  };

  const handleChallanFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const grid: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
        processChallanGrid(grid);
      } catch (err: any) {
        console.error('File parse error:', err);
        setImportError('Could not parse Excel/CSV file. Ensure file is valid.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmBulkImport = () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);

    try {
      const updated = [...parsedRows, ...records];
      setRecords(updated);
      saveChallansInventory(updated);

      setIsImportModalOpen(false);

      try {
        fetch(getApiUrl('/api/v1/challans/bulk-import'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: parsedRows })
        }).catch(() => {});

        supabase.from('challan_invoices').upsert(parsedRows, { onConflict: 'challan_no' }).then();
      } catch (e) {}

      setParsedRows([]);
      setImportSummary(null);
    } catch (e: any) {
      setImportError(e.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;

    const rows = [
      CHALLAN_HEADERS.join(','),
      ...records.map(r => [
        `"${r.booking_date}"`,
        `"${r.challan_no}"`,
        `"${r.challan_date}"`,
        `"${r.delivery_date}"`,
        `"${r.challan_type}"`,
        `"${r.vin_no}"`,
        `"${r.customer_name}"`,
        `"${r.mobile}"`,
        `"${r.city}"`,
        `"${r.model}"`,
        `"${r.variant}"`,
        `"${r.colour}"`,
        `"${r.sale_consultant}"`,
        `"${r.team_leader}"`,
        `"${r.financier_name}"`,
        `"${r.corporate}"`,
        `"${r.exchange}"`,
        r.ex_showroom || 0,
        r.discount || 0,
        r.net || 0,
        r.insurance_per || 0,
        r.insurance_amount || 0,
        r.ep || 0,
        r.rti || 0,
        r.cm || 0,
        `"${r.rto_city}"`,
        r.rto_amount || 0,
        r.hml_acc || 0,
        r.own_acc || 0,
        r.acc_discount_amount || 0,
        r.acc_amount || 0,
        r.trc || 0,
        r.warranty || 0,
        r.handling_charges || 0,
        r.other || 0,
        r.fast_tag || 0,
        r.tcs || 0,
        r.net_amount || 0,
        `"${r.invoice_date}"`,
        `"${r.invoice_no}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dhoot_Challan_Invoicing_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Challans
  const cleanSearch = search.trim().toLowerCase();
  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      !cleanSearch ||
      (r.customer_name || '').toLowerCase().includes(cleanSearch) ||
      (r.challan_no || '').toLowerCase().includes(cleanSearch) ||
      (r.invoice_no || '').toLowerCase().includes(cleanSearch) ||
      (r.vin_no || '').toLowerCase().includes(cleanSearch) ||
      (r.mobile || '').toLowerCase().includes(cleanSearch) ||
      (r.model || '').toLowerCase().includes(cleanSearch);

    return matchesSearch;
  });

  const totalInvoicedAmount = records.reduce((sum, r) => sum + (Number(r.net_amount) || 0), 0);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* Top Banner */}
      <PageHeader
        title="Challan & Tax Invoicing Register"
        subtitle="40-Column Financial Ledger • Delivery Gate Passes, RTO, Insurance & Tax Invoice Records"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {records.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-ink-3" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="h-8 px-3.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-accent" />
              <span>Bulk Import Challans</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Invoices" value={records.length} note="Financial Ledger" />
        <Stat label="Total Turnover" value={`₹${(totalInvoicedAmount / 10000000).toFixed(2)} Cr`} note="Gross Invoiced Revenue" tone="ok" />
        <Stat label="Delivery Ready" value={records.length} note="Gate Passes Issued" />
        <Stat label="Active Dealerships" value={currentBrand.code === 'DHOOT-ALL' ? 'Tata & Hyundai' : currentBrand.name} note="Dealership Entity" tone="accent" />
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-canvas border border-line rounded flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-accent absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Customer Name, Challan No (e.g. CHL-2026), Invoice No., VIN, Mobile, or Model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-xs bg-surface border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent font-medium shadow-xs"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="h-8 px-2.5 bg-surface border border-line hover:bg-canvas text-xs font-medium text-ink-3 rounded transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-ink-3">
          <Hash className="w-3.5 h-3.5 text-accent" />
          <span>Showing <strong>{filteredRecords.length}</strong> records</span>
        </div>
      </div>

      {/* 40-Column Comprehensive Ledger Panel */}
      <Panel
        title={
          <div className="flex items-center gap-2">
            <span>Challan & Invoice Ledger</span>
            <Badge tone="accent">{filteredRecords.length} Units</Badge>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Invoice No.</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Invoice Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Challan No</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Challan Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Delivery Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Vin No</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Customer Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Mobile</th>
                <th className="py-2.5 px-3 whitespace-nowrap">City</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Model</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Variant</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Colour</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Consultant</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Financier</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Ex Showroom</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Discount</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Insurance</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">RTO Amt</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Acc Amt</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Fast Tag</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">TCS</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Net Amount</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={24} className="py-12 text-center text-ink-3">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-accent" />
                    Loading challan & invoice ledger...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={24}>
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">0 Invoices in Ledger</p>
                        <p className="text-xs text-ink-3 mt-1">
                          Click Bulk Import Challans to upload daily delivery challan spreadsheet.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  return (
                    <tr 
                      key={r.id || idx} 
                      className="hover:bg-canvas transition-colors cursor-pointer"
                      onClick={() => setSelectedRecord(r)}
                    >
                      <td className="py-2.5 px-3 text-center text-ink-3 tnum whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-ink whitespace-nowrap">
                        {r.invoice_no || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum whitespace-nowrap">
                        {formatDate(r.invoice_date)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink whitespace-nowrap">
                        {r.challan_no}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum whitespace-nowrap">
                        {formatDate(r.challan_date)}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum whitespace-nowrap">
                        {formatDate(r.delivery_date)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-ink whitespace-nowrap">
                        {r.vin_no}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                        {r.customer_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink-2 whitespace-nowrap">
                        {r.mobile}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {r.city}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ink whitespace-nowrap">
                        {r.model}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {r.variant}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 whitespace-nowrap">
                        {r.colour}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {r.sale_consultant || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {r.financier_name || 'Self Funded'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-ink tnum whitespace-nowrap">
                        ₹{(Number(r.ex_showroom) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-danger tnum whitespace-nowrap">
                        -₹{(Number(r.discount) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-ink-2 tnum whitespace-nowrap">
                        ₹{(Number(r.insurance_amount) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-ink-2 tnum whitespace-nowrap">
                        ₹{(Number(r.rto_amount) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-ink-2 tnum whitespace-nowrap">
                        ₹{(Number(r.acc_amount) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-ink-3 tnum whitespace-nowrap">
                        ₹{(Number(r.fast_tag) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-ink-3 tnum whitespace-nowrap">
                        ₹{(Number(r.tcs) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-ink tnum whitespace-nowrap">
                        ₹{(Number(r.net_amount) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInvoicePreviewRecord(r)}
                            className="h-7 px-2.5 rounded bg-surface border border-line hover:border-line-strong text-ink text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-ink-3" />
                            <span>Invoice</span>
                          </button>
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
      {/* MODAL: BULK CHALLAN & INVOICE IMPORTER (40 COLUMNS)                       */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none">
          <div className="bg-surface text-ink w-full max-w-4xl rounded-panel overflow-hidden border border-line shadow-pop flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    Bulk Import Challans & Tax Invoices
                  </h2>
                  <p className="text-xs text-ink-3">Upload Excel 97-2003 (.xls), Excel (.xlsx), or CSV containing 40 Delivery & Financial columns</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-canvas border border-line rounded flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-ink text-xs">Download 40-Column Template</h4>
                    <p className="text-[11px] text-ink-3 mt-0.5">Includes full financial, RTO, insurance headers</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-ink font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <label className="p-3.5 bg-canvas border border-dashed border-line hover:border-accent rounded flex items-center justify-between cursor-pointer transition-colors">
                  <div>
                    <h4 className="font-semibold text-ink text-xs">Select Excel / CSV File</h4>
                    <p className="text-[11px] text-ink-3 mt-0.5">Supports .xlsx, .xls (97-2003), .csv, .tsv</p>
                  </div>
                  <div className="h-8 px-3 rounded bg-accent text-white font-semibold flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.tsv,.txt"
                    className="hidden"
                    onChange={handleChallanFileUpload}
                  />
                </label>
              </div>

              {/* Import Summary */}
              {importSummary && (
                <div className="p-3 bg-ok/10 border border-ok/30 rounded flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-ok" />
                    <span className="font-semibold text-ok">
                      Parsed {importSummary.total} rows • {importSummary.newCount} New Challans ready to import
                    </span>
                  </div>
                  {importSummary.duplicateCount > 0 && (
                    <span className="text-ink-3">
                      ({importSummary.duplicateCount} duplicate records skipped)
                    </span>
                  )}
                </div>
              )}

              {importError && (
                <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-ink text-xs">
                    Preview Parsed Challans ({parsedRows.length} rows)
                  </h4>
                  <div className="border border-line rounded overflow-x-auto max-h-56">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-canvas border-b border-line font-semibold text-ink-2 uppercase">
                        <tr>
                          <th className="py-2 px-3">Challan No</th>
                          <th className="py-2 px-3">Invoice No</th>
                          <th className="py-2 px-3">VIN</th>
                          <th className="py-2 px-3">Customer</th>
                          <th className="py-2 px-3">Model</th>
                          <th className="py-2 px-3 text-right">Net Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-ink-2">
                        {parsedRows.slice(0, 10).map((r, idx) => (
                          <tr key={idx} className="hover:bg-canvas">
                            <td className="py-1.5 px-3 font-mono font-semibold whitespace-nowrap">{r.challan_no}</td>
                            <td className="py-1.5 px-3 font-mono whitespace-nowrap">{r.invoice_no}</td>
                            <td className="py-1.5 px-3 font-mono whitespace-nowrap">{r.vin_no}</td>
                            <td className="py-1.5 px-3 font-medium whitespace-nowrap">{r.customer_name}</td>
                            <td className="py-1.5 px-3 whitespace-nowrap">{r.model}</td>
                            <td className="py-1.5 px-3 text-right font-bold whitespace-nowrap">₹{Number(r.net_amount).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-line flex items-center justify-end gap-2.5 bg-canvas">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="h-8 px-4 rounded bg-surface border border-line text-xs font-semibold text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0 || isImporting}
                onClick={handleConfirmBulkImport}
                className="h-8 px-5 rounded bg-accent hover:bg-accent-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Import {parsedRows.length} Records to Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE TAX INVOICE PREVIEW                                      */}
      {/* ========================================================================= */}
      {invoicePreviewRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-2xl rounded-panel overflow-hidden border border-line shadow-pop flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-ink">Tax Invoice Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setInvoicePreviewRecord(null)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="border border-line rounded p-5 space-y-4 bg-white text-slate-900">
                <div className="flex justify-between items-start border-b pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {invoicePreviewRecord.model?.toLowerCase().includes('hyundai') 
                        ? 'Hyundai Motor India Authorized Dealership (Dhoot Hyundai)' 
                        : 'Tata Motors Authorized Dealership (Dhoot Motors)'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Official Commercial Tax Invoice & Vehicle Gate Delivery Pass</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-800">{invoicePreviewRecord.invoice_no}</span>
                    <p className="text-[11px] text-slate-500">Date: {invoicePreviewRecord.invoice_date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Billed Customer</span>
                    <strong className="block text-slate-900">{invoicePreviewRecord.customer_name}</strong>
                    <span className="text-slate-600 font-mono">{invoicePreviewRecord.mobile} • {invoicePreviewRecord.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Vehicle Details</span>
                    <strong className="block text-slate-900">{invoicePreviewRecord.model}</strong>
                    <span className="text-slate-600">{invoicePreviewRecord.variant} • {invoicePreviewRecord.colour}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Chassis / VIN</span>
                    <span className="font-mono font-bold text-slate-900">{invoicePreviewRecord.vin_no}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Financier</span>
                    <span className="text-slate-900 font-medium">{invoicePreviewRecord.financier_name || 'Self Funded'}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t pt-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Ex-Showroom Price:</span>
                    <span>₹{Number(invoicePreviewRecord.ex_showroom).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-₹{Number(invoicePreviewRecord.discount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Insurance Amount:</span>
                    <span>₹{Number(invoicePreviewRecord.insurance_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>RTO Registration Amount:</span>
                    <span>₹{Number(invoicePreviewRecord.rto_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Accessories Amount:</span>
                    <span>₹{Number(invoicePreviewRecord.acc_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Fast Tag & Others:</span>
                    <span>₹{(Number(invoicePreviewRecord.fast_tag) + Number(invoicePreviewRecord.tcs)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t pt-2 text-slate-900">
                    <span>Total Invoiced Net Amount:</span>
                    <span>₹{Number(invoicePreviewRecord.net_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-line flex items-center justify-end gap-2.5 bg-canvas">
              <button
                type="button"
                onClick={() => setInvoicePreviewRecord(null)}
                className="h-8 px-4 rounded bg-surface border border-line text-xs font-semibold text-ink"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="h-8 px-5 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Invoice PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
