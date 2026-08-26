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

  const cleanHeader = (h: string) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const processChallanGrid = (grid: any[][]) => {
    if (!grid || grid.length <= 1) {
      setParsedRows([]);
      setImportError('Spreadsheet appears to be empty.');
      return;
    }

    // 1. Find Header Row (Scan top 10 rows for highest keyword match)
    let bestHeaderRowIdx = 0;
    let maxMatchCount = 0;

    const keywords = ['booking', 'challan', 'invoice', 'customer', 'vin', 'chassis', 'mobile', 'model', 'variant', 'colour', 'amount', 'date', 'price', 'discount', 'net'];

    for (let r = 0; r < Math.min(10, grid.length); r++) {
      const rowStr = grid[r].map(c => cleanHeader(String(c || ''))).join(' ');
      let matches = 0;
      keywords.forEach(kw => {
        if (rowStr.includes(kw)) matches++;
      });

      if (matches > maxMatchCount) {
        maxMatchCount = matches;
        bestHeaderRowIdx = r;
      }
    }

    const headerRowIdx = bestHeaderRowIdx;
    const rawHeaders = grid[headerRowIdx].map(h => String(h || '').trim());

    const findCol = (aliases: string[]): number => {
      return rawHeaders.findIndex(h => {
        const clean = cleanHeader(h);
        return aliases.some(alias => {
          const cleanAlias = cleanHeader(alias);
          return clean === cleanAlias || (clean.length >= 4 && clean.includes(cleanAlias)) || (cleanAlias.length >= 4 && cleanAlias.includes(clean));
        });
      });
    };

    // Robust 40-Column Header Aliases
    const idxBookingDate = findCol(['Booking Date', 'BookingDate', 'Bkg Date', 'Book Date', 'Booking_Date', 'Date of Booking']);
    const idxChallanNo = findCol(['Challan No', 'ChallanNo', 'Challan Number', 'Challan_No', 'Gate Pass No', 'Gatepass No', 'GP No', 'Delivery Challan', 'DC No', 'Challan']);
    const idxChallanDate = findCol(['Challan Date', 'ChallanDate', 'Challan_Date', 'GP Date', 'Gate Pass Date', 'DC Date']);
    const idxDeliveryDate = findCol(['Delivery Date', 'DeliveryDate', 'Del Date', 'Del_Date', 'Promise Date', 'Promised Delivery Date', 'PDD']);
    const idxChallanType = findCol(['Challan Type', 'ChallanType', 'Type', 'Delivery Type', 'Transaction Type']);
    const idxVinNo = findCol(['Vin No', 'VinNo', 'VIN', 'Chassis No', 'Chassis Number', 'Chassis', 'VIN Number', 'Serial No']);
    const idxCustomerName = findCol(['Customer Name', 'CustomerName', 'Customer', 'Party Name', 'Buyer Name', 'Purchaser', 'Client Name', 'Name']);
    const idxMobile = findCol(['Mobile', 'Mobile No', 'Mobile Number', 'MobileNo', 'Phone', 'Phone No', 'Contact', 'Contact No', 'Cell']);
    const idxCity = findCol(['City', 'Town', 'District', 'Location', 'Place', 'Area', 'Address']);
    const idxModel = findCol(['Model', 'Vehicle Model', 'Car Model', 'Vehicle', 'Product', 'Item']);
    const idxVariant = findCol(['Variant', 'Trim', 'Model Variant', 'Item Description', 'Description', 'Ver']);
    const idxColour = findCol(['Colour', 'Color', 'Exterior Color', 'Paint', 'Color Description', 'Colour Description']);
    const idxSalesConsultant = findCol(['Sale Consultant', 'Sales Consultant', 'Sales Executive', 'DSE', 'SC', 'Advisor', 'Sales Person', 'Executive']);
    const idxTeamLeader = findCol(['Team Leader', 'Team Lead', 'TL', 'Group Leader']);
    const idxFinancier = findCol(['Financier Name', 'Financier', 'Bank', 'Bank Name', 'Finance Company', 'Hypothecation', 'Hypo', 'Financer']);
    const idxCorporate = findCol(['Corporate', 'Corp', 'Corporate Discount', 'Corporate Scheme']);
    const idxExchange = findCol(['Exchange', 'Exch', 'Exchange Bonus', 'Exchange Discount']);
    const idxExShowroom = findCol(['Ex Show Room', 'Ex Showroom', 'ExShowRoom', 'Ex Showroom Price', 'Ex-Showroom', 'Showroom Price', 'Basic Price', 'Base Price']);
    const idxDiscount = findCol(['Discount', 'Disc', 'Total Discount', 'Consumer Discount', 'Scheme Discount']);
    const idxNet = findCol(['Net', 'Net Ex Showroom', 'Net Price', 'Net Basic']);
    const idxInsurancePer = findCol(['Insurance Per', 'Insurance %', 'Ins %', 'Ins Per', 'Insurance Percentage']);
    const idxInsuranceAmt = findCol(['Insurance Amount', 'Insurance Amt', 'Insurance', 'Ins Amount', 'Ins Amt', 'Total Insurance']);
    const idxEp = findCol(['Ep', 'EP', 'Engine Protect', 'Engine Protection']);
    const idxRti = findCol(['Rti', 'RTI', 'Return to Invoice']);
    const idxCm = findCol(['Cm', 'CM', 'Consumables', 'Consumable Cover']);
    const idxRtoCity = findCol(['Rto City', 'RTO City', 'RTO Location', 'Passing City', 'Passing Location']);
    const idxRtoAmt = findCol(['Rto Amount', 'RTO Amount', 'RTO', 'Registration Amount', 'Reg Amt', 'Road Tax', 'Tax Amount']);
    const idxHmlAcc = findCol(['Hml Acc', 'HML Acc', 'HML Accessories', 'HML']);
    const idxOwnAcc = findCol(['Own Acc', 'Own Accessories', 'Direct Acc']);
    const idxAccDisc = findCol(['Acc Discount Amount', 'Acc Discount', 'Accessory Discount', 'Acc Disc']);
    const idxAccAmt = findCol(['Acc Amount', 'Accessories Amount', 'Accessory Amount', 'Acc Amt', 'Accessories', 'VAS Amount']);
    const idxTrc = findCol(['Trc', 'TRC', 'Temp Registration', 'Temp Reg', 'TRC Amount']);
    const idxWarranty = findCol(['Warranty', 'EW', 'Extended Warranty', 'Ext Warranty', 'Warranty Amount']);
    const idxHandling = findCol(['Handling Charges', 'Handling', 'Logistics', 'Logistic Charges', 'Depot Charges']);
    const idxOther = findCol(['Other', 'Other Charges', 'Misc', 'Miscellaneous', 'Incidental']);
    const idxFastTag = findCol(['Fast Tag', 'FastTag', 'Fastag', 'Fastag Amount']);
    const idxTcs = findCol(['TCS', 'Tcs', 'TCS Amount', 'TCS %']);
    const idxNetAmount = findCol(['Net Amount', 'Total Net Amount', 'Invoice Total', 'Invoice Amount', 'Total Amount', 'Grand Total', 'Bill Amount', 'Net Total']);
    const idxInvoiceDate = findCol(['Invoice Date', 'InvoiceDate', 'Inv Date', 'Inv_Date', 'Bill Date', 'Billing Date', 'Tax Invoice Date']);
    const idxInvoiceNo = findCol(['Invoice No.', 'Invoice No', 'Invoice Number', 'InvoiceNo', 'Inv No', 'Inv_No', 'Bill No', 'Bill Number', 'Tax Invoice No']);

    const parseNum = (val: any) => {
      if (val === undefined || val === null) return 0;
      const clean = String(val).replace(/[^0-9.-]/g, '');
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    };

    const parseDateValue = (val: any) => {
      if (!val) return formatDate(new Date());
      return formatDate(val);
    };

    const rows: ChallanRecord[] = [];
    const seenInSheet = new Set<string>();
    let duplicateCount = 0;

    for (let i = headerRowIdx + 1; i < grid.length; i++) {
      const cols = grid[i];
      if (!cols || cols.length === 0 || cols.every(c => c === undefined || c === null || String(c).trim() === '')) {
        continue;
      }

      const getColVal = (idx: number): string => {
        if (idx >= 0 && idx < cols.length && cols[idx] !== undefined && cols[idx] !== null) {
          const v = cols[idx];
          if (v instanceof Date) return formatDate(v);
          return String(v).trim();
        }
        return '';
      };

      const challanNo = getColVal(idxChallanNo) || `CHL-${202600 + i}`;
      const invoiceNo = getColVal(idxInvoiceNo) || `INV-${202600 + i}`;
      const vinNo = getColVal(idxVinNo) || `MAT${Date.now()}${i}`;
      const custName = getColVal(idxCustomerName) || `Customer ${i}`;

      const dedupeKey = (challanNo + '_' + invoiceNo + '_' + vinNo).toUpperCase().trim();
      if (seenInSheet.has(dedupeKey)) {
        duplicateCount++;
        continue;
      }
      seenInSheet.add(dedupeKey);

      const exShowroom = parseNum(getColVal(idxExShowroom));
      const discount = parseNum(getColVal(idxDiscount));
      const net = parseNum(getColVal(idxNet)) || (exShowroom - discount);
      const insuranceAmt = parseNum(getColVal(idxInsuranceAmt));
      const rtoAmt = parseNum(getColVal(idxRtoAmt));
      const accAmt = parseNum(getColVal(idxAccAmt));
      const fastTag = parseNum(getColVal(idxFastTag)) || 500;
      const tcs = parseNum(getColVal(idxTcs));
      const other = parseNum(getColVal(idxOther));
      const warranty = parseNum(getColVal(idxWarranty));
      const handling = parseNum(getColVal(idxHandling));
      const trc = parseNum(getColVal(idxTrc));

      let netAmount = parseNum(getColVal(idxNetAmount));
      if (netAmount === 0) {
        netAmount = net + insuranceAmt + rtoAmt + accAmt + fastTag + tcs + other + warranty + handling + trc;
      }

      rows.push({
        id: `chl-${Date.now()}-${i}`,
        booking_date: parseDateValue(getColVal(idxBookingDate)),
        challan_no: challanNo,
        challan_date: parseDateValue(getColVal(idxChallanDate)),
        delivery_date: parseDateValue(getColVal(idxDeliveryDate)),
        challan_type: getColVal(idxChallanType) || 'TAX_INVOICE_DELIVERY',
        vin_no: vinNo,
        customer_name: custName,
        mobile: getColVal(idxMobile) || '+91 98290 12345',
        city: getColVal(idxCity) || 'Jodhpur',
        model: getColVal(idxModel) || (currentBrand.code === 'DHOOT-HYUNDAI' ? 'Hyundai Creta' : 'Tata Safari'),
        variant: getColVal(idxVariant) || 'Accomplished / SX',
        colour: getColVal(idxColour) || 'White / Black',
        sale_consultant: getColVal(idxSalesConsultant) || 'Sales Desk',
        team_leader: getColVal(idxTeamLeader) || '',
        financier_name: getColVal(idxFinancier) || 'Self Funded',
        corporate: getColVal(idxCorporate) || 'No',
        exchange: getColVal(idxExchange) || 'No',
        ex_showroom: exShowroom,
        discount: discount,
        net: net,
        insurance_per: parseNum(getColVal(idxInsurancePer)),
        insurance_amount: insuranceAmt,
        ep: parseNum(getColVal(idxEp)),
        rti: parseNum(getColVal(idxRti)),
        cm: parseNum(getColVal(idxCm)),
        rto_city: getColVal(idxRtoCity) || getColVal(idxCity) || 'Jodhpur',
        rto_amount: rtoAmt,
        hml_acc: parseNum(getColVal(idxHmlAcc)),
        own_acc: parseNum(getColVal(idxOwnAcc)),
        acc_discount_amount: parseNum(getColVal(idxAccDisc)),
        acc_amount: accAmt,
        trc: trc,
        warranty: warranty,
        handling_charges: handling,
        other: other,
        fast_tag: fastTag,
        tcs: tcs,
        net_amount: netAmount,
        invoice_date: parseDateValue(getColVal(idxInvoiceDate)),
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
      // 1. Read entire existing inventory from localStorage
      let fullExisting: ChallanRecord[] = [];
      try {
        const saved = localStorage.getItem('dhoot_challans_inventory');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) fullExisting = parsed;
        }
      } catch (e) {}

      // 2. Map-based Merge (Field-level update for existing records, append for new)
      const combinedMap = new Map<string, ChallanRecord>();

      fullExisting.forEach(r => {
        const key = (r.challan_no || r.invoice_no || r.vin_no || '').toUpperCase().trim();
        if (key) combinedMap.set(key, r);
      });

      let updatedCount = 0;
      let newCount = 0;

      parsedRows.forEach(incoming => {
        const key = (incoming.challan_no || incoming.invoice_no || incoming.vin_no || '').toUpperCase().trim();
        const prev = key ? combinedMap.get(key) : undefined;

        if (prev) {
          updatedCount++;
          combinedMap.set(key, {
            ...prev,
            booking_date: incoming.booking_date && incoming.booking_date !== '—' ? incoming.booking_date : prev.booking_date,
            challan_no: incoming.challan_no || prev.challan_no,
            challan_date: incoming.challan_date && incoming.challan_date !== '—' ? incoming.challan_date : prev.challan_date,
            delivery_date: incoming.delivery_date && incoming.delivery_date !== '—' ? incoming.delivery_date : prev.delivery_date,
            challan_type: incoming.challan_type || prev.challan_type,
            vin_no: incoming.vin_no || prev.vin_no,
            customer_name: incoming.customer_name && !incoming.customer_name.startsWith('Customer ') ? incoming.customer_name : prev.customer_name,
            mobile: incoming.mobile && incoming.mobile !== '+91 98290 12345' ? incoming.mobile : prev.mobile,
            city: incoming.city || prev.city,
            model: incoming.model || prev.model,
            variant: incoming.variant || prev.variant,
            colour: incoming.colour || prev.colour,
            sale_consultant: incoming.sale_consultant && incoming.sale_consultant !== 'Sales Desk' ? incoming.sale_consultant : prev.sale_consultant,
            team_leader: incoming.team_leader || prev.team_leader,
            financier_name: incoming.financier_name && incoming.financier_name !== 'Self Funded' ? incoming.financier_name : prev.financier_name,
            corporate: incoming.corporate || prev.corporate,
            exchange: incoming.exchange || prev.exchange,
            ex_showroom: incoming.ex_showroom > 0 ? incoming.ex_showroom : prev.ex_showroom,
            discount: incoming.discount > 0 ? incoming.discount : prev.discount,
            net: incoming.net > 0 ? incoming.net : prev.net,
            insurance_per: incoming.insurance_per > 0 ? incoming.insurance_per : prev.insurance_per,
            insurance_amount: incoming.insurance_amount > 0 ? incoming.insurance_amount : prev.insurance_amount,
            ep: incoming.ep > 0 ? incoming.ep : prev.ep,
            rti: incoming.rti > 0 ? incoming.rti : prev.rti,
            cm: incoming.cm > 0 ? incoming.cm : prev.cm,
            rto_city: incoming.rto_city || prev.rto_city,
            rto_amount: incoming.rto_amount > 0 ? incoming.rto_amount : prev.rto_amount,
            hml_acc: incoming.hml_acc > 0 ? incoming.hml_acc : prev.hml_acc,
            own_acc: incoming.own_acc > 0 ? incoming.own_acc : prev.own_acc,
            acc_discount_amount: incoming.acc_discount_amount > 0 ? incoming.acc_discount_amount : prev.acc_discount_amount,
            acc_amount: incoming.acc_amount > 0 ? incoming.acc_amount : prev.acc_amount,
            trc: incoming.trc > 0 ? incoming.trc : prev.trc,
            warranty: incoming.warranty > 0 ? incoming.warranty : prev.warranty,
            handling_charges: incoming.handling_charges > 0 ? incoming.handling_charges : prev.handling_charges,
            other: incoming.other > 0 ? incoming.other : prev.other,
            fast_tag: incoming.fast_tag > 0 ? incoming.fast_tag : prev.fast_tag,
            tcs: incoming.tcs > 0 ? incoming.tcs : prev.tcs,
            net_amount: incoming.net_amount > 0 ? incoming.net_amount : prev.net_amount,
            invoice_date: incoming.invoice_date && incoming.invoice_date !== '—' ? incoming.invoice_date : prev.invoice_date,
            invoice_no: incoming.invoice_no || prev.invoice_no,
            status: incoming.status || prev.status
          });
        } else {
          newCount++;
          const newKey = key || `CHL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          combinedMap.set(newKey, incoming);
        }
      });

      const finalRecords = Array.from(combinedMap.values());
      saveChallansInventory(finalRecords);
      setRecords(getChallansForBrand(currentBrand.code || 'DHOOT-ALL'));

      setIsImportModalOpen(false);

      // 3. Prepare exact Schema-aligned payload for Supabase Cloud Database
      const rowsToSync = finalRecords.map(r => ({
        booking_date: r.booking_date && r.booking_date !== '—' ? r.booking_date : null,
        challan_no: r.challan_no || `CH-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        challan_date: r.challan_date && r.challan_date !== '—' ? r.challan_date : null,
        delivery_date: r.delivery_date && r.delivery_date !== '—' ? r.delivery_date : null,
        challan_type: r.challan_type || 'TAX_INVOICE_DELIVERY',
        vin_no: r.vin_no || 'VIN-PENDING',
        customer_name: r.customer_name || 'Valued Customer',
        mobile_no: r.mobile || null,
        city: r.city || null,
        model: r.model || 'Standard Model',
        variant: r.variant || 'Standard Variant',
        colour: r.colour || 'Standard Colour',
        sale_consultant: r.sale_consultant || null,
        team_leader: r.team_leader || null,
        financier_name: r.financier_name || null,
        corporate: Number(r.corporate) || 0,
        exchange: Number(r.exchange) || 0,
        ex_showroom: Number(r.ex_showroom) || 0,
        discount: Number(r.discount) || 0,
        net: Number(r.net) || 0,
        insurance_per: Number(r.insurance_per) || 0,
        insurance_amount: Number(r.insurance_amount) || 0,
        ep: Number(r.ep) || 0,
        rti: Number(r.rti) || 0,
        cm: Number(r.cm) || 0,
        rto_city: r.rto_city || r.city || null,
        rto_amount: Number(r.rto_amount) || 0,
        hml_acc: Number(r.hml_acc) || 0,
        own_acc: Number(r.own_acc) || 0,
        acc_discount_amount: Number(r.acc_discount_amount) || 0,
        acc_amount: Number(r.acc_amount) || 0,
        trc: Number(r.trc) || 0,
        warranty: Number(r.warranty) || 0,
        handling_charges: Number(r.handling_charges) || 0,
        other_charges: Number(r.other) || 0,
        fast_tag: Number(r.fast_tag) || 500,
        tcs: Number(r.tcs) || 0,
        net_amount: Number(r.net_amount) || 0,
        invoice_date: r.invoice_date && r.invoice_date !== '—' ? r.invoice_date : null,
        invoice_no: r.invoice_no || `INV-${Date.now()}`,
        status: r.status || 'INVOICED',
        organization_id: '11111111-1111-1111-1111-111111111111'
      }));

      // Async persistence to Cloud Database & Worker API
      supabase.from('challan_invoices').upsert(rowsToSync, { onConflict: 'challan_no' }).then(({ error }) => {
        if (error) console.warn('Supabase Challan Upsert Error:', error);
      });

      fetch(getApiUrl('/api/v1/challans/bulk-import'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: rowsToSync })
      }).catch(() => {});

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
                    onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
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
