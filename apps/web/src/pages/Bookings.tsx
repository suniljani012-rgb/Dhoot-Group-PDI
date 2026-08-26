import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bookmark, Search, Plus, Car, ChevronRight, Download, Upload, 
  FileSpreadsheet, X, Loader2, CheckCircle2, UserCheck,
  Calendar, Phone, DollarSign, Tag, Printer, ArrowRight,
  FolderOpen, Clock, AlertCircle, Check, Factory, FileText,
  Building2, MapPin, Mail, Copy, CheckCheck, RefreshCw, Hash
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { formatDate } from '../utils/dateUtils';
import { 
  getBookingsForBrand, saveBookingsInventory, 
  getVehiclesForBrand, saveStockInventory,
  getActiveBranches, syncWithSupabase,
  isTataItem, isHyundaiItem,
  TATA_ORG_ID, HYUNDAI_ORG_ID
} from '../data/seedData';
import { supabase } from '../lib/supabase';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';

export interface BookingRecord {
  id: string;
  receipt_date: string;
  receipt_no: string;
  customer_name: string;
  mobile_number: string;
  sales_consultant: string;
  team_leader: string;
  model: string;
  variant: string;
  colour: string;
  allocated_vin_no?: string;
  delivery_date?: string;
  hypothecation?: string;
  receipt_amt: number;
  status: 'ALLOCATED' | 'PENDING_ALLOCATION';
  organization_id?: string;
  created_at?: string;
}



// Strict 3-Way PBNA/VNA Matcher: ALL 3 (Model, Variant, Colour) must match exactly
const norm = (str?: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const isExact3WayMatch = (booking: BookingRecord, stock: any): boolean => {
  const bModel = norm(booking.model);
  const bVariant = norm(booking.variant);
  const bColor = norm(booking.colour);

  const sModel = norm(stock.model);
  const sVariant = norm(stock.variant);
  const sColor = norm(stock.color || stock.colour);

  return bModel === sModel && bVariant === sVariant && bColor === sColor;
};

export const BookingsPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_ALLOCATION' | 'ALLOCATED'>('ALL');
  
  // Real Database Stock For Live VIN Allocation Dropdown
  const [stockVehicles, setStockVehicles] = useState<any[]>([]);

  // Modals Controls
  const [showNewModal, setShowNewModal] = useState(false);
  const [allocatingBooking, setAllocatingBooking] = useState<BookingRecord | null>(null);
  const [selectedStockVin, setSelectedStockVin] = useState('');
  const [voucherBooking, setVoucherBooking] = useState<BookingRecord | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Bulk Excel Import State
  const [parsedRows, setParsedRows] = useState<BookingRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ total: number; newCount: number; duplicateCount: number } | null>(null);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    receipt_date: new Date().toISOString().split('T')[0],
    receipt_no: `BK-${Date.now().toString().slice(-6)}`,
    customer_name: '',
    mobile_number: '',
    sales_consultant: 'Sunil Sharma',
    team_leader: 'Rajesh Nair',
    model: currentBrand.models[0] || 'Tata Nexon',
    variant: 'Fearless Plus',
    colour: 'Daytona Grey',
    allocated_vin_no: '',
    delivery_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    hypothecation: 'Self Funded',
    receipt_amt: 25000,
  });

  useEffect(() => {
    setBrandFilter(currentBrand.code === 'DHOOT-ALL' ? 'ALL' : currentBrand.code);
    fetchBookingsAndStock();

    const handleUpdate = () => {
      fetchBookingsAndStock();
    };

    window.addEventListener('bookings-updated', handleUpdate);
    window.addEventListener('stock-updated', handleUpdate);

    return () => {
      window.removeEventListener('bookings-updated', handleUpdate);
      window.removeEventListener('stock-updated', handleUpdate);
    };
  }, [currentBrand?.code]);

  const fetchBookingsAndStock = async () => {
    setLoading(true);
    try {
      await syncWithSupabase();
      const bList = getBookingsForBrand(currentBrand?.code || 'DHOOT-ALL');
      setBookings(bList);
      const sList = getVehiclesForBrand(currentBrand?.code || 'DHOOT-ALL');
      setStockVehicles(sList);
    } catch (e) {
      console.warn('Error fetching bookings:', e);
      setBookings([]);
      setStockVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: BookingRecord = {
      id: `bk-${Date.now()}`,
      receipt_date: formatDate(newBooking.receipt_date),
      receipt_no: newBooking.receipt_no,
      customer_name: newBooking.customer_name,
      mobile_number: newBooking.mobile_number,
      sales_consultant: newBooking.sales_consultant,
      team_leader: newBooking.team_leader,
      model: newBooking.model,
      variant: newBooking.variant,
      colour: newBooking.colour,
      allocated_vin_no: newBooking.allocated_vin_no || undefined,
      delivery_date: newBooking.delivery_date ? formatDate(newBooking.delivery_date) : undefined,
      hypothecation: newBooking.hypothecation || 'Self Funded',
      receipt_amt: Number(newBooking.receipt_amt) || 25000,
      status: newBooking.allocated_vin_no ? 'ALLOCATED' : 'PENDING_ALLOCATION',
      organization_id: currentBrand.orgId,
      created_at: new Date().toISOString()
    };

    const updated = [newRecord, ...bookings];
    setBookings(updated);
    saveBookingsInventory(updated);

    setShowNewModal(false);

    try {
      const isHyn = isHyundaiItem(newRecord);
      const targetOrg = isHyn ? HYUNDAI_ORG_ID : TATA_ORG_ID;
      supabase.from('bookings').upsert({
        receipt_no: newRecord.receipt_no,
        customer_name: newRecord.customer_name,
        mobile_number: newRecord.mobile_number,
        sales_consultant: newRecord.sales_consultant,
        team_leader: newRecord.team_leader,
        model: newRecord.model,
        variant: newRecord.variant,
        colour: newRecord.colour,
        allocated_vin_no: newRecord.allocated_vin_no || null,
        promise_delivery_date: newRecord.delivery_date || null,
        receipt_amt: newRecord.receipt_amt || 0,
        status: newRecord.allocated_vin_no ? 'ALLOCATED' : 'BOOKED',
        organization_id: targetOrg
      }).then();
    } catch (e) {
      console.warn('Supabase booking insert note:', e);
    }
    setNewBooking({
      receipt_date: new Date().toISOString().split('T')[0],
      receipt_no: `BK-${Date.now().toString().slice(-6)}`,
      customer_name: '',
      mobile_number: '',
      sales_consultant: 'Sunil Sharma',
      team_leader: 'Rajesh Nair',
      model: currentBrand.models[0] || 'Tata Nexon',
      variant: 'Fearless Plus',
      colour: 'Daytona Grey',
      allocated_vin_no: '',
      delivery_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      hypothecation: 'Self Funded',
      receipt_amt: 25000,
    });
  };

  // Perform VIN Allocation
  const handleConfirmVinAllocation = () => {
    if (!allocatingBooking || !selectedStockVin) return;

    // 1. Update Booking Record
    const updatedBookings = bookings.map(b => {
      if (b.id === allocatingBooking.id || b.receipt_no === allocatingBooking.receipt_no) {
        return {
          ...b,
          allocated_vin_no: selectedStockVin,
          status: 'ALLOCATED' as const
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    saveBookingsInventory(updatedBookings);

    // 2. Update Vehicle Record in Stock
    const updatedVehicles = stockVehicles.map(v => {
      if (v.vin === selectedStockVin) {
        return {
          ...v,
          customer_name: allocatingBooking.customer_name,
          sales_consultant: allocatingBooking.sales_consultant,
          status: 'ALLOCATED',
          vehicle_status: 'ALLOCATED',
          allocation_date: new Date().toISOString().split('T')[0],
          allocated_days: 1
        };
      }
      return v;
    });
    setStockVehicles(updatedVehicles);
    saveStockInventory(updatedVehicles);

    setAllocatingBooking(null);
    setSelectedStockVin('');
  };

  // =========================================================================
  // BULK EXCEL PARSER (13 EXACT COLUMNS)
  // =========================================================================
  const BOOKING_HEADERS = [
    'Receipt Date',
    'Receipt No',
    'Customer Name',
    'Mobile No',
    'Sales Consultant',
    'Team Leader',
    'Model',
    'Variant',
    'Colour',
    'Allocated Vin No',
    'Delivery Date',
    'Hypothecation',
    'Received Amount'
  ];

  const handleDownloadTemplate = () => {
    const sampleRows = [
      BOOKING_HEADERS.join(','),
      '25-Aug-2026,BK-009981,Ramesh Chandra Sharma,+91 98290 12345,Sunil Sharma,Rajesh Nair,Tata Safari,Accomplished Plus 6S,Oberon Black,,05-Sep-2026,HDFC Bank Ltd,50000',
      '25-Aug-2026,BK-009982,Priya Kulkarni,+91 98291 54321,Manish Rathore,Suresh Sharma,Hyundai Creta,SX (O) Turbo DCT,Ranger Khaki,,08-Sep-2026,State Bank of India,50000'
    ].join('\n');

    const blob = new Blob([sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Dhoot_Group_Customer_Bookings_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processBookingGrid = (grid: any[][]) => {
    if (!grid || grid.length <= 1) {
      setParsedRows([]);
      return;
    }

    // Auto-detect header row
    let headerRowIdx = 0;
    for (let r = 0; r < Math.min(6, grid.length); r++) {
      const rowStr = grid[r].map(c => String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '')).join(' ');
      if (rowStr.includes('receipt') || rowStr.includes('customer') || rowStr.includes('model')) {
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

    const idxReceiptDate = findCol(['Receipt Date', 'ReceiptDate', 'Date', 'Booking Date']);
    const idxReceiptNo = findCol(['Receipt No', 'ReceiptNo', 'Receipt Number', 'Voucher No', 'Booking No']);
    const idxCustomerName = findCol(['Customer Name', 'CustomerName', 'Customer', 'Buyer Name', 'Party Name']);
    const idxMobile = findCol(['Mobile No', 'Mobile Number', 'Mobile', 'Phone', 'Contact']);
    const idxSalesConsultant = findCol(['Sales Consultant', 'SalesConsultant', 'SC', 'DSE', 'Advisor', 'Sales Executive']);
    const idxTeamLeader = findCol(['Team Leader', 'TeamLeader', 'TL', 'Manager']);
    const idxModel = findCol(['Model', 'Vehicle Model', 'Car Model']);
    const idxVariant = findCol(['Variant', 'Trim', 'Model Variant', 'Description']);
    const idxColour = findCol(['Colour', 'Color', 'Paint', 'Exterior Color']);
    const idxAllocatedVin = findCol(['Allocated Vin No', 'Allocated Vin', 'Vin No', 'Chassis No', 'VIN']);
    const idxDeliveryDate = findCol(['Delivery Date', 'Promise Delivery Date', 'Promise Date', 'Promised Date']);
    const idxHypothecation = findCol(['Hypothecation', 'Financier', 'Bank', 'Finance Name', 'Loan Bank']);
    const idxReceivedAmount = findCol(['Received Amount', 'Receipt Amt', 'Receipt Amount', 'Booking Amount', 'Advance Amount', 'Amount']);

    const existingReceipts = new Set(bookings.map(b => (b.receipt_no || '').toUpperCase().trim()));
    const seenInSheet = new Set<string>();

    const rows: BookingRecord[] = [];
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

      const receiptNo = getVal(idxReceiptNo, 1) || `BK-${10000 + i}`;
      const cleanReceiptNo = receiptNo.toUpperCase().trim();

      if (existingReceipts.has(cleanReceiptNo) || seenInSheet.has(cleanReceiptNo)) {
        duplicateCount++;
        continue;
      }
      seenInSheet.add(cleanReceiptNo);

      const custName = getVal(idxCustomerName, 2) || `Customer ${i}`;
      const modelVal = getVal(idxModel, 6) || (currentBrand.code === 'DHOOT-HYUNDAI' ? 'Hyundai Creta' : 'Tata Safari');
      const rawReceiptDate = getVal(idxReceiptDate, 0);
      const rawDeliveryDate = getVal(idxDeliveryDate, 10);
      const allocatedVin = getVal(idxAllocatedVin, 9);
      const rawReceivedAmt = getVal(idxReceivedAmount, 12);

      rows.push({
        id: `bk-${Date.now()}-${i}`,
        receipt_date: rawReceiptDate ? formatDate(rawReceiptDate) : formatDate(new Date()),
        receipt_no: receiptNo,
        customer_name: custName,
        mobile_number: getVal(idxMobile, 3) || '+91 98000 00000',
        sales_consultant: getVal(idxSalesConsultant, 4) || 'Sales Desk',
        team_leader: getVal(idxTeamLeader, 5) || '',
        model: modelVal,
        variant: getVal(idxVariant, 7) || 'Standard',
        colour: getVal(idxColour, 8) || 'White',
        allocated_vin_no: allocatedVin || undefined,
        delivery_date: rawDeliveryDate ? formatDate(rawDeliveryDate) : undefined,
        hypothecation: getVal(idxHypothecation, 11) || 'Self Funded',
        receipt_amt: Number(String(rawReceivedAmt || '25000').replace(/[^0-9]/g, '')) || 25000,
        status: allocatedVin ? 'ALLOCATED' : 'PENDING_ALLOCATION',
        organization_id: currentBrand.orgId,
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

  const handleBookingFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        processBookingGrid(grid);
      } catch (err: any) {
        console.error('File parse error:', err);
        setImportError('Could not parse Excel/CSV file. Ensure file format is valid.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmBulkImport = () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);

    try {
      const updated = [...parsedRows, ...bookings];
      setBookings(updated);
      saveBookingsInventory(updated);

      setIsImportModalOpen(false);

      try {
        const rowsToSync = parsedRows.map(r => {
          const isHyn = isHyundaiItem(r);
          return {
            receipt_no: r.receipt_no,
            customer_name: r.customer_name,
            mobile_number: r.mobile_number,
            sales_consultant: r.sales_consultant,
            team_leader: r.team_leader,
            model: r.model,
            variant: r.variant,
            colour: r.colour,
            allocated_vin_no: r.allocated_vin_no || null,
            promise_delivery_date: r.delivery_date || null,
            receipt_amt: r.receipt_amt || 0,
            status: r.allocated_vin_no ? 'ALLOCATED' : 'BOOKED',
            organization_id: isHyn ? HYUNDAI_ORG_ID : TATA_ORG_ID
          };
        });

        supabase.from('bookings').upsert(rowsToSync, { onConflict: 'receipt_no' }).then();
      } catch (e) {
        console.warn('Supabase bulk bookings sync note:', e);
      }
      setParsedRows([]);
      setImportSummary(null);
    } catch (e: any) {
      setImportError(e.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  // Export CSV
  const handleExportBookingsCSV = () => {
    if (bookings.length === 0) return;

    const rows = [
      BOOKING_HEADERS.join(','),
      ...bookings.map(b => [
        `"${b.receipt_date}"`,
        `"${b.receipt_no}"`,
        `"${b.customer_name}"`,
        `"${b.mobile_number}"`,
        `"${b.sales_consultant}"`,
        `"${b.team_leader}"`,
        `"${b.model}"`,
        `"${b.variant}"`,
        `"${b.colour}"`,
        `"${b.allocated_vin_no || ''}"`,
        `"${b.delivery_date || ''}"`,
        `"${b.hypothecation || ''}"`,
        b.receipt_amt || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dhoot_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Brand Scoped Bookings
  const brandScopedBookings = React.useMemo(() => {
    if (brandFilter === 'DHOOT-TATA') return bookings.filter(isTataItem);
    if (brandFilter === 'DHOOT-HYUNDAI') return bookings.filter(isHyundaiItem);
    return bookings;
  }, [bookings, brandFilter]);

  // Filter Bookings
  const cleanSearch = search.trim().toLowerCase();
  const filteredBookings = brandScopedBookings.filter(b => {
    const matchesSearch = 
      !cleanSearch ||
      (b.customer_name || '').toLowerCase().includes(cleanSearch) ||
      (b.receipt_no || '').toLowerCase().includes(cleanSearch) ||
      (b.mobile_number || '').toLowerCase().includes(cleanSearch) ||
      (b.model || '').toLowerCase().includes(cleanSearch) ||
      (b.sales_consultant || '').toLowerCase().includes(cleanSearch) ||
      (b.allocated_vin_no || '').toLowerCase().includes(cleanSearch);

    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'ALLOCATED' && !!b.allocated_vin_no) ||
      (statusFilter === 'PENDING_ALLOCATION' && !b.allocated_vin_no);

    return matchesSearch && matchesStatus;
  });

  const allocatedCount = brandScopedBookings.filter(b => !!b.allocated_vin_no).length;
  const pendingAllocationCount = brandScopedBookings.filter(b => !b.allocated_vin_no).length;
  const totalAmountReceived = brandScopedBookings.reduce((sum, b) => sum + (Number(b.receipt_amt) || 0), 0);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* Top Banner */}
      <PageHeader
        title="Customer Bookings Management"
        subtitle="13-Column Customer Booking Ledger • VIN Allocation & Realtime Advance Receipts"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {bookings.length > 0 && (
              <button
                type="button"
                onClick={handleExportBookingsCSV}
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
              <span>Bulk Import Bookings</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="h-8 px-3.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="View Comprehensive PBNA & VNA Stock Matching & Indent Report"
            >
              <FileText className="w-3.5 h-3.5 text-accent" />
              <span>PBNA / VNA Report</span>
            </button>

            <button
              onClick={() => setShowNewModal(true)}
              className="h-8 px-3.5 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Booking</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Bookings" value={brandScopedBookings.length} note="Customer Ledger" />
        <Stat label="VIN Allocated" value={allocatedCount} note="Ready for Invoicing" tone="ok" />
        <Stat label="PBNA (In Stock)" value={brandScopedBookings.filter(b => !b.allocated_vin_no && stockVehicles.some(v => !v.customer_name && v.status !== 'ALLOCATED' && isExact3WayMatch(b, v))).length} note="Ready for Allotment" tone="warn" />
        <Stat label="Not in Stock (VNA)" value={brandScopedBookings.filter(b => !b.allocated_vin_no && !stockVehicles.some(v => !v.customer_name && v.status !== 'ALLOCATED' && isExact3WayMatch(b, v))).length} note="Factory Indent Needed" tone="danger" />
        <Stat label="Total Advance Collected" value={`₹${(totalAmountReceived / 100000).toFixed(2)} L`} note="Receipts Total" tone="accent" />
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-canvas border border-line rounded flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-accent absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Customer Name, Receipt No (e.g. BK-009), Mobile, Model, or Allocated VIN..."
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

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8 text-xs bg-surface border border-line rounded px-2.5 text-ink focus:outline-none focus:border-accent font-medium shadow-xs"
          >
            <option value="ALL">All Bookings ({bookings.length})</option>
            <option value="ALLOCATED">VIN Allocated ({allocatedCount})</option>
            <option value="PENDING_ALLOCATION">Unallocated ({pendingAllocationCount})</option>
          </select>
        </div>
      </div>

      {/* Bookings Ledger Table (13 Columns) */}
      <Panel
        title={
          <div className="flex items-center gap-2">
            <span>Customer Bookings Register</span>
            <Badge tone="accent">{filteredBookings.length} Bookings</Badge>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Receipt Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Receipt No</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Customer Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Mobile No</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Sales Consultant</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Team Leader</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Model</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Variant</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Colour</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Allocated Vin No</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Delivery Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Hypothecation</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Received Amount</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-ink-3">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-accent" />
                    Loading customer bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={15}>
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
                        <Bookmark className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">0 Bookings in System</p>
                        <p className="text-xs text-ink-3 mt-1">
                          {search ? 'No bookings matched your search query.' : 'Click Bulk Import Bookings to upload daily bookings spreadsheet.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b, idx) => {
                  return (
                    <tr key={b.id || idx} className="hover:bg-canvas transition-colors">
                      <td className="py-2.5 px-3 text-center text-ink-3 tnum whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum whitespace-nowrap">
                        {formatDate(b.receipt_date || b.created_at)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-ink whitespace-nowrap">
                        {b.receipt_no}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                        {b.customer_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-ink-2 whitespace-nowrap">
                        {b.mobile_number}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {b.sales_consultant || 'Sales Desk'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 whitespace-nowrap">
                        {b.team_leader || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ink whitespace-nowrap">
                        {b.model}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {b.variant || 'Standard'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 whitespace-nowrap">
                        {b.colour || '—'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                        {b.allocated_vin_no ? (
                          <span className="font-semibold text-ok bg-ok/10 px-1.5 py-0.5 rounded border border-ok/20">
                            {b.allocated_vin_no}
                          </span>
                        ) : (() => {
                          const hasStock = stockVehicles.some(v => !v.customer_name && v.status !== 'ALLOCATED' && isExact3WayMatch(b, v));
                          return hasStock ? (
                            <span className="font-semibold text-warn bg-warn/10 px-2 py-0.5 rounded border border-warn/30 text-[11px]">
                              PBNA (In Stock)
                            </span>
                          ) : (
                            <span className="font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded border border-danger/30 text-[11px]">
                              Not in Stock (VNA)
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-ink-3 tnum whitespace-nowrap">
                        {b.delivery_date ? formatDate(b.delivery_date) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                        {b.hypothecation || 'Self Funded'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-ink tnum whitespace-nowrap">
                        ₹{(Number(b.receipt_amt) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {!b.allocated_vin_no ? (
                            <button
                              type="button"
                              onClick={() => {
                                setAllocatingBooking(b);
                                setSelectedStockVin('');
                              }}
                              className="h-7 px-2.5 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Car className="w-3 h-3" />
                              <span>Allocate VIN</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setVoucherBooking(b)}
                              className="h-7 px-2.5 rounded bg-surface border border-line hover:border-line-strong text-ink text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Printer className="w-3 h-3 text-ink-3" />
                              <span>Voucher</span>
                            </button>
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
      {/* MODAL: BULK BOOKINGS IMPORTER                                             */}
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
                    Bulk Import Customer Bookings
                  </h2>
                  <p className="text-xs text-ink-3">Upload Excel 97-2003 (.xls), Excel (.xlsx), or CSV containing 13 Booking columns</p>
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
              {/* Template download & upload buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-canvas border border-line rounded flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-ink text-xs">Download 13-Column Template</h4>
                    <p className="text-[11px] text-ink-3 mt-0.5">Includes exact 13 headers & sample data</p>
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
                    onChange={handleBookingFileUpload}
                  />
                </label>
              </div>

              {/* Import Summary */}
              {importSummary && (
                <div className="p-3 bg-ok/10 border border-ok/30 rounded flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-ok" />
                    <span className="font-semibold text-ok">
                      Parsed {importSummary.total} rows • {importSummary.newCount} New Bookings ready to import
                    </span>
                  </div>
                  {importSummary.duplicateCount > 0 && (
                    <span className="text-ink-3">
                      ({importSummary.duplicateCount} duplicate receipt numbers skipped)
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
                    Preview Parsed Bookings ({parsedRows.length} rows)
                  </h4>
                  <div className="border border-line rounded overflow-x-auto max-h-56">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-canvas border-b border-line font-semibold text-ink-2 uppercase">
                        <tr>
                          <th className="py-2 px-3">Receipt Date</th>
                          <th className="py-2 px-3">Receipt No</th>
                          <th className="py-2 px-3">Customer</th>
                          <th className="py-2 px-3">Mobile</th>
                          <th className="py-2 px-3">Model</th>
                          <th className="py-2 px-3">Variant</th>
                          <th className="py-2 px-3">Colour</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-ink-2">
                        {parsedRows.slice(0, 10).map((r, idx) => (
                          <tr key={idx} className="hover:bg-canvas">
                            <td className="py-1.5 px-3 whitespace-nowrap">{r.receipt_date}</td>
                            <td className="py-1.5 px-3 font-mono font-semibold whitespace-nowrap">{r.receipt_no}</td>
                            <td className="py-1.5 px-3 font-medium whitespace-nowrap">{r.customer_name}</td>
                            <td className="py-1.5 px-3 whitespace-nowrap">{r.mobile_number}</td>
                            <td className="py-1.5 px-3 whitespace-nowrap">{r.model}</td>
                            <td className="py-1.5 px-3 whitespace-nowrap">{r.variant}</td>
                            <td className="py-1.5 px-3 whitespace-nowrap">{r.colour}</td>
                            <td className="py-1.5 px-3 text-right font-semibold whitespace-nowrap">₹{Number(r.receipt_amt).toLocaleString('en-IN')}</td>
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
                <span>Import {parsedRows.length} Bookings to Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEW BOOKING MANUAL REGISTRATION                                    */}
      {/* ========================================================================= */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">Register Customer Booking</h2>
                  <p className="text-xs text-ink-3">Add booking order and issue official booking advance receipt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Receipt Date *</label>
                  <input
                    type="date"
                    required
                    value={newBooking.receipt_date}
                    onChange={(e) => setNewBooking({ ...newBooking, receipt_date: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Receipt No *</label>
                  <input
                    type="text"
                    required
                    value={newBooking.receipt_no}
                    onChange={(e) => setNewBooking({ ...newBooking, receipt_no: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-mono font-semibold text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Sharma"
                    value={newBooking.customer_name}
                    onChange={(e) => setNewBooking({ ...newBooking, customer_name: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98290 00000"
                    value={newBooking.mobile_number}
                    onChange={(e) => setNewBooking({ ...newBooking, mobile_number: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Vehicle Model *</label>
                  <select
                    value={newBooking.model}
                    onChange={(e) => setNewBooking({ ...newBooking, model: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    {currentBrand.models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Variant</label>
                  <input
                    type="text"
                    placeholder="e.g. Accomplished Plus 6S"
                    value={newBooking.variant}
                    onChange={(e) => setNewBooking({ ...newBooking, variant: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Colour</label>
                  <input
                    type="text"
                    placeholder="e.g. Oberon Black"
                    value={newBooking.colour}
                    onChange={(e) => setNewBooking({ ...newBooking, colour: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Advance Amount Received (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newBooking.receipt_amt}
                    onChange={(e) => setNewBooking({ ...newBooking, receipt_amt: Number(e.target.value) })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-bold text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Hypothecation / Financier</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank Ltd / Self"
                    value={newBooking.hypothecation}
                    onChange={(e) => setNewBooking({ ...newBooking, hypothecation: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="h-8 px-3.5 rounded bg-surface border border-line text-xs font-semibold text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIVE VIN ALLOCATION                                                */}
      {/* ========================================================================= */}
      {allocatingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">Allocate Stock VIN</h2>
                  <p className="text-xs text-ink-3">Customer: <strong>{allocatingBooking.customer_name}</strong> • {allocatingBooking.model}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllocatingBooking(null)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-canvas border border-line rounded space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-ink">Required Model:</span>
                  <span className="font-bold text-accent">{allocatingBooking.model} ({allocatingBooking.variant})</span>
                </div>
                <div className="flex justify-between text-ink-3">
                  <span>Colour Preference:</span>
                  <span>{allocatingBooking.colour}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Select Stock VIN (Matched by Model, Variant & Colour) *
                </label>
                {(() => {
                  const unallocated = stockVehicles.filter(v => !v.customer_name && v.status !== 'ALLOCATED');
                  const exactMatches = unallocated.filter(v => isExact3WayMatch(allocatingBooking, v));
                  const otherStock = unallocated.filter(v => !isExact3WayMatch(allocatingBooking, v));

                  return (
                    <select
                      value={selectedStockVin}
                      onChange={(e) => setSelectedStockVin(e.target.value)}
                      className="w-full p-2.5 bg-canvas border border-line rounded text-xs font-mono font-semibold text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="">-- Choose Stock Vehicle --</option>
                      {exactMatches.length > 0 && (
                        <optgroup label="✨ EXACT 3-WAY MATCHES (Model + Variant + Colour)">
                          {exactMatches.map(v => (
                            <option key={v.vin} value={v.vin}>
                              {v.vin} • {v.model} ({v.variant}) • {v.color} • {v.location || 'Basni Yard'}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {otherStock.length > 0 && (
                        <optgroup label="Other Available Vehicles">
                          {otherStock.map(v => (
                            <option key={v.vin} value={v.vin}>
                              {v.vin} • {v.model} ({v.variant}) • {v.color} • {v.location || 'Basni Yard'}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  );
                })()}
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setAllocatingBooking(null)}
                  className="h-8 px-3.5 rounded bg-surface border border-line text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedStockVin}
                  onClick={handleConfirmVinAllocation}
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Allocation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE BOOKING VOUCHER                                          */}
      {/* ========================================================================= */}
      {voucherBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-xl rounded-panel overflow-hidden border border-line shadow-pop flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-ink">Official Booking Voucher Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setVoucherBooking(null)}
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
                      {voucherBooking.model?.toLowerCase().includes('hyundai') 
                        ? 'Hyundai Motor India Authorized Dealership (Dhoot Hyundai)' 
                        : 'Tata Motors Authorized Dealership (Dhoot Motors)'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Official Customer Vehicle Booking Docket</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-800">{voucherBooking.receipt_no}</span>
                    <p className="text-[11px] text-slate-500">Date: {voucherBooking.receipt_date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Customer Details</span>
                    <strong className="block text-slate-900">{voucherBooking.customer_name}</strong>
                    <span className="text-slate-600 font-mono">{voucherBooking.mobile_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Vehicle Ordered</span>
                    <strong className="block text-slate-900">{voucherBooking.model}</strong>
                    <span className="text-slate-600">{voucherBooking.variant} • {voucherBooking.colour}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Allocated VIN</span>
                    <span className="font-mono font-bold text-slate-900">{voucherBooking.allocated_vin_no || 'Pending Allocation'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Hypothecation</span>
                    <span className="text-slate-900 font-medium">{voucherBooking.hypothecation || 'Self Funded'}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Advance Amount Received:</span>
                  <span className="text-base font-bold text-slate-900">₹{Number(voucherBooking.receipt_amt).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-line flex items-center justify-end gap-2.5 bg-canvas">
              <button
                type="button"
                onClick={() => setVoucherBooking(null)}
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
                <span>Print Voucher PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
