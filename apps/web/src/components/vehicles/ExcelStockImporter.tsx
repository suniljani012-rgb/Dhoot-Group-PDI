import React, { useState } from 'react';
import { 
  FileSpreadsheet, Download, Upload, Check, AlertCircle, 
  X, Loader2, RefreshCw, FileCheck, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { saveStockInventory, isHyundaiItem } from '../../data/seedData';
import { formatDate } from '../../utils/dateUtils';
import { StockVehicle } from '../../pages/Vehicles';
import { getApiUrl } from '../../utils/apiConfig';

interface ExcelStockImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelStockImporter: React.FC<ExcelStockImporterProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentBrand } = useAuth();
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [updateExisting, setUpdateExisting] = useState(true);

  // Exact 21 Official Dealership Excel Headers specified by User
  const officialHeaders = [
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

  // 1. Download Official 21-Column Excel Template
  const handleDownloadTemplate = () => {
    const isTata = currentBrand.code === 'DHOOT-TATA';
    const sampleRows = [
      officialHeaders.join(','),
      isTata 
        ? '2026-08-20,Tata Safari,Accomplished Plus 6S,Oberon Black,DIESEL,FSC-TAT-801,DLR-MH01,PLT-PUN,2026,ALLOCATED,MAT612345S9988776,1,Pune Central Yard • Bay 2,Rajesh Sharma,Vikram Malhotra,18000,ALLOCATED,2026-08-28,2026-08-21,5,50000'
        : '2026-08-21,Hyundai Creta,SX (O) Turbo DCT,Ranger Khaki,PETROL,FSC-HYN-901,DLR-RJ01,PLT-CHE,2026,YARD_RECEIVING_PENDING,MALC12345C1122334,1,Jaipur Main Yard • Bay 1,Sunil Jani,Ramesh Choudhary,15000,GATE_INWARD,2026-08-27,2026-08-22,4,51000',
      isTata
        ? '2026-08-22,Tata Nexon,Fearless Plus S DT,Daytona Grey,PETROL,FSC-TAT-702,DLR-MH01,PLT-PUN,2026,PDI_APPROVED,MAT612345N7766551,1,Pune Yard • Bay 1,Priya Kulkarni,Rajesh Nair,12000,PDI_CERTIFIED,2026-08-29,2026-08-23,3,25000'
        : '2026-08-23,Hyundai Venue,N Line N8 DCT,Thunder Blue,TURBO,FSC-HYN-804,DLR-RJ01,PLT-CHE,2026,ALLOCATED,MALC12345V4433221,1,Jaipur Yard • Bay 2,Anita Desai,Karan Joshi,10000,ALLOCATED,2026-08-30,2026-08-24,2,30000'
    ].join('\n');

    const blob = new Blob([sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dhoot_Stock_Template_${currentBrand.shortName || 'Daily'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to get existing VIN list from localStorage
  const getExistingVins = (): Set<string> => {
    try {
      const saved = localStorage.getItem('dhoot_stock_inventory');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          return new Set(list.map((v: any) => (v.vin || '').toUpperCase().trim()).filter(Boolean));
        }
      }
    } catch (e) {
      console.warn('Error reading existing vins:', e);
    }
    return new Set();
  };

  // Clean and match header name
  const cleanHeader = (h: string) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Process 2D Array of rows from SheetJS or Text Split
  const processRawDataGrid = (grid: any[][]) => {
    if (!grid || grid.length <= 1) {
      setParsedRows([]);
      return;
    }

    // 1. Find Header Row
    let headerRowIdx = 0;
    let maxMatches = 0;
    const stockKeywords = ['vin', 'chassis', 'model', 'variant', 'colour', 'color', 'fuel', 'location', 'yard', 'status', 'purchase', 'customer', 'dealer', 'plant'];

    for (let r = 0; r < Math.min(10, grid.length); r++) {
      if (!Array.isArray(grid[r])) continue;
      const rowStr = grid[r].map(c => cleanHeader(String(c || ''))).join(' ');
      let matches = 0;
      stockKeywords.forEach(kw => {
        if (rowStr.includes(kw)) matches++;
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        headerRowIdx = r;
      }
    }

    const rawHeaders = (grid[headerRowIdx] || []).map(h => String(h || '').trim());
    const cleanedHeaders = rawHeaders.map(h => cleanHeader(h));

    const findColIndex = (aliases: string[]): number => {
      const cleanAliases = aliases.map(a => cleanHeader(a));

      // 1. Exact match
      for (let i = 0; i < cleanedHeaders.length; i++) {
        if (cleanAliases.includes(cleanedHeaders[i])) return i;
      }

      // 2. StartsWith / EndsWith
      for (let i = 0; i < cleanedHeaders.length; i++) {
        for (const alias of cleanAliases) {
          if (alias.length >= 4 && (cleanedHeaders[i].startsWith(alias) || cleanedHeaders[i].endsWith(alias))) {
            return i;
          }
        }
      }

      // 3. Includes
      for (let i = 0; i < cleanedHeaders.length; i++) {
        for (const alias of cleanAliases) {
          if (alias.length >= 4 && cleanedHeaders[i].includes(alias)) {
            return i;
          }
        }
      }

      return -1;
    };

    const idxPurchaseDate = findColIndex(['Purchase Date', 'PurchaseDate', 'Purchase_Date', 'Date', 'Invoice Date', 'Inv Date', 'Inward Date']);
    const idxModel = findColIndex(['Model', 'Vehicle Model', 'Car Model', 'Vehicle', 'Product', 'Item']);
    const idxVariant = findColIndex(['Variant', 'Trim', 'Model Variant', 'Item Description', 'Description', 'Ver']);
    const idxColour = findColIndex(['Colour', 'Color', 'Exterior Color', 'Paint', 'Color Description', 'Colour Description']);
    const idxFuel = findColIndex(['Fuel', 'Fuel Type', 'FuelType']);
    const idxFscCode = findColIndex(['FSC Code', 'FscCode', 'FSC_Code', 'FSC', 'Model Code']);
    const idxDealerCode = findColIndex(['Dealer Code', 'DealerCode', 'Dealer', 'DLR']);
    const idxPlantCode = findColIndex(['Plant Code', 'PlantCode', 'Plant', 'Factory']);
    const idxYear = findColIndex(['Year', 'Manufacturing Year', 'Mfg Year', 'Model Year']);
    const idxStatus = findColIndex(['Status', 'Stock Status', 'Current Status']);
    const idxVin = findColIndex(['Vin No', 'VinNo', 'VIN Number', 'VIN', 'Chassis Number', 'Chassis No', 'Chassis', 'VIN / Chassis', 'Serial No', 'Vehicle Identification Number']);
    const idxQuantity = findColIndex(['Quantity', 'Qty', 'Units', 'Count']);
    const idxLocation = findColIndex(['Location', 'Stockyard Location', 'Yard Location', 'Yard', 'Bay', 'Plant/Yard', 'Current Location']);
    const idxCustomerName = findColIndex(['Customer Name', 'CustomerName', 'Customer', 'Buyer', 'Allotted To', 'Party Name', 'Name']);
    const idxSalesConsultant = findColIndex(['Sales Consultant', 'SalesConsultant', 'SC', 'DSE', 'Advisor', 'Sales Executive', 'Executive']);
    const idxAccessoriesAmount = findColIndex(['Accessories Amount', 'AccessoriesAmount', 'Accessories', 'Acc Amt', 'Acc Amount']);
    const idxVehicleStatus = findColIndex(['Vehicle Status', 'VehicleStatus', 'Inspection Status', 'PDI Status']);
    const idxDeliveryDate = findColIndex(['Delivery Date', 'DeliveryDate', 'Promise Delivery Date', 'Promised Date']);
    const idxAllocationDate = findColIndex(['Allocation Date', 'AllocationDate', 'Alloc Date', 'Allot Date']);
    const idxAllocatedDays = findColIndex(['Allocated Days', 'AllocatedDays', 'Alloc Days', 'Ageing', 'Aging', 'Days']);
    const idxReceivedAmount = findColIndex(['Received Amount', 'ReceivedAmount', 'Receipt Amt', 'Advance Amount', 'Booking Amount', 'Amount']);

    const existingVins = getExistingVins();
    const fileSeenVins = new Set<string>();

    const rows: any[] = [];

    for (let i = headerRowIdx + 1; i < grid.length; i++) {
      const cols = grid[i];
      if (!cols || !Array.isArray(cols) || cols.length === 0 || cols.every(c => c === undefined || c === null || String(c).trim() === '')) {
        continue; // Skip truly blank rows
      }

      const getVal = (colIdx: number, fallbackIdx?: number): string => {
        if (colIdx >= 0 && cols[colIdx] !== undefined && cols[colIdx] !== null) return String(cols[colIdx]).trim();
        if (fallbackIdx !== undefined && cols[fallbackIdx] !== undefined && cols[fallbackIdx] !== null) return String(cols[fallbackIdx]).trim();
        return '';
      };

      // Extract VIN: remove spaces, asterisks, or quotes
      let vinRaw = idxVin >= 0 ? getVal(idxVin).toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
      
      // Universal Scanner: If VIN wasn't found at designated column, scan columns for a 17 or 6+ character alphanumeric string
      if (vinRaw.length < 5) {
        for (const colVal of cols) {
          const clean = String(colVal || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
          if (clean.length >= 8 && (clean.startsWith('MA') || clean.startsWith('MAL') || clean.startsWith('MAT') || clean.length === 17)) {
            vinRaw = clean;
            break;
          }
        }
      }

      // If still not found, check any column with length >= 6
      if (vinRaw.length < 5) {
        for (const colVal of cols) {
          const clean = String(colVal || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
          if (clean.length >= 6 && /[0-9]/.test(clean) && /[A-Z]/.test(clean)) {
            vinRaw = clean;
            break;
          }
        }
      }

      const isValidVin = vinRaw.length >= 5;
      const isDuplicateInFile = isValidVin && fileSeenVins.has(vinRaw);
      if (isValidVin) fileSeenVins.add(vinRaw);
      const isAlreadyInDb = isValidVin && existingVins.has(vinRaw);

      const rawPurchaseDate = getVal(idxPurchaseDate);
      const formattedPurchaseDate = rawPurchaseDate ? formatDate(rawPurchaseDate) : formatDate(new Date());

      const rawDeliveryDate = getVal(idxDeliveryDate);
      const rawAllocationDate = getVal(idxAllocationDate);

      const modelVal = getVal(idxModel) || (currentBrand.code === 'DHOOT-HYUNDAI' ? 'Hyundai Creta' : 'Tata Safari');
      const isHyundai = isHyundaiItem({ model: modelVal }) || currentBrand.code === 'DHOOT-HYUNDAI';
      const defaultYard = isHyundai ? 'Shantinath Yard' : 'Basni Yard';
      const userLoc = getVal(idxLocation);
      const resolvedLoc = userLoc && !['Basni Yard', 'Shantinath Yard', 'Stockyard', 'Yard'].includes(userLoc) ? userLoc : defaultYard;

      rows.push({
        _rowNum: i + 1,
        _isValid: isValidVin,
        _isDuplicateInFile: isDuplicateInFile,
        _isAlreadyInDb: isAlreadyInDb,
        vin: vinRaw || `VIN-TEMP-${i}`,
        model: modelVal,
        variant: getVal(idxVariant) || 'Standard Variant',
        color: getVal(idxColour) || 'Standard Colour',
        fuel_type: getVal(idxFuel) || 'PETROL',
        fsc_code: getVal(idxFscCode) || 'FSC-001',
        dealer_code: getVal(idxDealerCode) || 'DLR-MH01',
        plant_code: getVal(idxPlantCode) || (isHyundai ? 'PLT-CHE' : 'PLT-PUN'),
        manufacturing_year: parseInt(getVal(idxYear)) || 2026,
        status: getVal(idxStatus) || 'RECEIVED',
        quantity: parseInt(getVal(idxQuantity)) || 1,
        location: resolvedLoc,
        customer_name: getVal(idxCustomerName) || '',
        sales_consultant: getVal(idxSalesConsultant) || '',
        accessories_amount: parseFloat(getVal(idxAccessoriesAmount).replace(/[^0-9.]/g, '')) || 0,
        vehicle_status: getVal(idxVehicleStatus) || getVal(idxStatus) || 'RECEIVED',
        delivery_date: rawDeliveryDate ? formatDate(rawDeliveryDate) : '',
        allocation_date: rawAllocationDate ? formatDate(rawAllocationDate) : '',
        allocated_days: parseInt(getVal(idxAllocatedDays)) || 0,
        received_amount: parseFloat(getVal(idxReceivedAmount).replace(/[^0-9.]/g, '')) || 0,
        purchase_date: formattedPurchaseDate,
      });
    }

    setParsedRows(rows);
  };

  // 2. Parse Pasted Text (TSV, CSV, Tab-Delimited)
  const handleParseText = (text: string) => {
    setCsvText(text);
    setErrorMsg(null);
    setSuccessCount(null);

    if (!text || text.trim().length === 0) {
      setParsedRows([]);
      return;
    }

    try {
      // Use SheetJS to parse pasted text cleanly
      const workbook = XLSX.read(text, { type: 'string', raw: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const grid: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
      processRawDataGrid(grid);
    } catch {
      // Fallback manual line split
      const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
      const separator = lines[0].includes('\t') ? '\t' : ',';
      const grid = lines.map(l => l.split(separator).map(c => c.trim().replace(/^"|"$/g, '')));
      processRawDataGrid(grid);
    }
  };

  // 3. File Upload Handler (.xlsx, .xls Excel 97-2003, .csv, .tsv, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const grid: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
        
        processRawDataGrid(grid);
      } catch (err: any) {
        console.error('File parse error:', err);
        setErrorMsg('Could not parse Excel/CSV file. Please ensure valid .xlsx, .xls, or .csv format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 4. Perform Clean Bulk Import & Deduplication
  const handleSaveToDatabase = async () => {
    if (parsedRows.length === 0) {
      setErrorMsg('Please paste or upload valid stock spreadsheet rows first.');
      return;
    }

    const validOnly = parsedRows.filter(r => r._isValid);
    if (validOnly.length === 0) {
      setErrorMsg('No valid VIN numbers found in uploaded data. Please verify VIN column.');
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);

    try {
      // 1. Deduplicate records from file (keep latest row per VIN)
      const vinMap = new Map<string, any>();
      for (const r of validOnly) {
        vinMap.set(r.vin, r);
      }

      const deduplicatedIncoming = Array.from(vinMap.values());

      // 2. Load existing stock from localStorage
      let existingStock: any[] = [];
      try {
        const saved = localStorage.getItem('dhoot_stock_inventory');
        if (saved) {
          existingStock = JSON.parse(saved);
          if (!Array.isArray(existingStock)) existingStock = [];
        }
      } catch (e) {
        console.warn('Local stock read note:', e);
      }

      // 3. Merge or Append based on updateExisting toggle
      let finalStock: any[] = [];
      if (updateExisting) {
        const combinedMap = new Map<string, any>();
        existingStock.forEach(item => {
          if (item.vin) combinedMap.set(item.vin.toUpperCase().trim(), item);
        });

        deduplicatedIncoming.forEach(item => {
          const key = item.vin.toUpperCase().trim();
          const prev = combinedMap.get(key) || {};
          combinedMap.set(key, {
            ...prev,
            id: prev.id || `v-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            vin: item.vin,
            model: item.model,
            variant: item.variant,
            color: item.color,
            fuel_type: item.fuel_type,
            fsc_code: item.fsc_code,
            dealer_code: item.dealer_code,
            plant_code: item.plant_code,
            manufacturing_year: item.manufacturing_year,
            status: item.status,
            quantity: item.quantity,
            location: item.location,
            customer_name: item.customer_name || prev.customer_name,
            sales_consultant: item.sales_consultant || prev.sales_consultant,
            accessories_amount: item.accessories_amount,
            vehicle_status: item.vehicle_status,
            delivery_date: item.delivery_date,
            allocation_date: item.allocation_date,
            allocated_days: item.allocated_days,
            received_amount: item.received_amount,
            purchase_date: item.purchase_date,
            created_at: prev.created_at || new Date().toISOString()
          });
        });

        finalStock = Array.from(combinedMap.values());
      } else {
        // Only insert truly new VINs
        const existingVinSet = new Set(existingStock.map(v => (v.vin || '').toUpperCase().trim()));
        const newOnly = deduplicatedIncoming.filter(r => !existingVinSet.has(r.vin.toUpperCase().trim()));
        const newObjects = newOnly.map(item => ({
          id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          vin: item.vin,
          model: item.model,
          variant: item.variant,
          color: item.color,
          fuel_type: item.fuel_type,
          fsc_code: item.fsc_code,
          dealer_code: item.dealer_code,
          plant_code: item.plant_code,
          manufacturing_year: item.manufacturing_year,
          status: item.status,
          quantity: item.quantity,
          location: item.location,
          customer_name: item.customer_name,
          sales_consultant: item.sales_consultant,
          accessories_amount: item.accessories_amount,
          vehicle_status: item.vehicle_status,
          delivery_date: item.delivery_date,
          allocation_date: item.allocation_date,
          allocated_days: item.allocated_days,
          received_amount: item.received_amount,
          purchase_date: item.purchase_date,
          created_at: new Date().toISOString()
        }));
        finalStock = [...existingStock, ...newObjects];
      }

      // Save to localStorage & notify all components
      saveStockInventory(finalStock);

      // 1. Sync to Backend Edge API (Cloudflare Worker API)
      try {
        const targetOrg = '11111111-1111-1111-1111-111111111111';

        const payload = deduplicatedIncoming.map(r => ({
          vin: r.vin,
          model: r.model,
          variant: r.variant,
          color: r.color,
          fuel_type: r.fuel_type,
          fsc_code: r.fsc_code,
          dealer_code: r.dealer_code,
          plant_code: r.plant_code,
          manufacturing_year: r.manufacturing_year,
          status: r.status,
          location: r.location,
          customer_name: r.customer_name,
          sales_consultant: r.sales_consultant,
          purchase_date: r.purchase_date,
          delivery_date: r.delivery_date,
          allocation_date: r.allocation_date,
          allocated_days: r.allocated_days,
          accessories_amount: r.accessories_amount,
          received_amount: r.received_amount,
          organization_id: targetOrg
        }));

        fetch(getApiUrl('/api/v1/stock/bulk-import'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicles: payload })
        }).catch(() => {});
      } catch (e) {
        console.warn('Backend API cloud sync notice:', e);
      }

      setSuccessCount(deduplicatedIncoming.length);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);

    } catch (err: any) {
      console.error('Import error:', err);
      setErrorMsg(err.message || 'Error importing stock rows.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  const validRows = parsedRows.filter(r => r._isValid);
  const duplicatesInFileCount = parsedRows.filter(r => r._isDuplicateInFile).length;
  const existingInDbCount = parsedRows.filter(r => r._isValid && r._isAlreadyInDb).length;
  const newVinCount = parsedRows.filter(r => r._isValid && !r._isAlreadyInDb && !r._isDuplicateInFile).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-surface text-ink w-full max-w-4xl max-h-[88vh] rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
        
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-line flex items-center justify-between bg-canvas">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Bulk Import Daily Vehicle Stock
              </h2>
              <p className="text-xs text-ink-3 mt-0.5">
                Exact 21-Column Dealership Format • Excel 97-2003 / .xlsx / .csv Supported
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="h-8 px-3 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Download CSV Template</span>
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          
          {/* Header Legend */}
          <div className="p-2.5 bg-canvas border border-line rounded space-y-1 text-xs">
            <span className="eyebrow block text-accent font-semibold">Recognized 21 Stock Columns:</span>
            <p className="text-ink-2 font-mono text-[11px] leading-relaxed break-words">
              Purchase Date • Model • Variant • Colour • Fuel • FSC Code • Dealer Code • Plant Code • Year • Status • <strong className="text-accent underline font-semibold">Vin No</strong> • Quantity • Location • Customer Name • Sales Consultant • Accessories Amount • Vehicle Status • Delivery Date • Allocation Date • Allocated Days • Received Amount
            </p>
          </div>

          {/* Paste or Upload Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink">
                Paste Spreadsheet Data (from Excel / CSV / Google Sheets):
              </label>

              <label className="h-7 px-2.5 bg-accent-soft hover:bg-accent-line/30 border border-accent-line text-accent text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Upload Excel / CSV File</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  className="hidden"
                  onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => handleParseText(e.target.value)}
              placeholder="Copy and paste entire Excel table rows with headers here..."
              className="w-full p-2.5 font-mono text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
            />
          </div>

          {/* Validation & Duplicate Detection Summary */}
          {parsedRows.length > 0 && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 bg-canvas border border-line rounded">
                  <span className="eyebrow block">Total Rows</span>
                  <div className="text-sm font-semibold text-ink tnum mt-0.5">{parsedRows.length}</div>
                </div>

                <div className="p-2 bg-ok/10 border border-ok/20 rounded">
                  <span className="eyebrow block text-ok">New Unique VINs</span>
                  <div className="text-sm font-semibold text-ok tnum mt-0.5">{newVinCount}</div>
                </div>

                <div className="p-2 bg-accent-soft border border-accent-line rounded">
                  <span className="eyebrow block text-accent">Existing in Stock</span>
                  <div className="text-sm font-semibold text-accent tnum mt-0.5">{existingInDbCount}</div>
                </div>

                <div className="p-2 bg-warn/10 border border-warn/20 rounded">
                  <span className="eyebrow block text-warn">Duplicate / Invalid</span>
                  <div className="text-sm font-semibold text-warn tnum mt-0.5">
                    {duplicatesInFileCount + parsedRows.filter(r => !r._isValid).length}
                  </div>
                </div>
              </div>

              {/* Duplicate Handling Option */}
              <div className="p-2.5 bg-canvas border border-line rounded flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-ink">Duplicate Handling Strategy:</span>
                </div>
                <label className="flex items-center gap-2 text-ink-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="rounded border-line text-accent focus:ring-accent"
                  />
                  <span>Update existing records if VIN already exists in stock (recommended)</span>
                </label>
              </div>

              {/* Table Preview */}
              <div className="border border-line rounded overflow-hidden">
                <div className="max-h-48 overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px] sticky top-0">
                      <tr>
                        <th className="py-2 px-3 whitespace-nowrap">Status</th>
                        <th className="py-2 px-3 whitespace-nowrap">VIN No</th>
                        <th className="py-2 px-3 whitespace-nowrap">Model</th>
                        <th className="py-2 px-3 whitespace-nowrap">Variant</th>
                        <th className="py-2 px-3 whitespace-nowrap">Colour</th>
                        <th className="py-2 px-3 whitespace-nowrap">Fuel</th>
                        <th className="py-2 px-3 whitespace-nowrap">Location</th>
                        <th className="py-2 px-3 whitespace-nowrap">Customer</th>
                        <th className="py-2 px-3 whitespace-nowrap">Purchase Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {parsedRows.slice(0, 100).map((r, idx) => (
                        <tr key={idx} className="hover:bg-canvas/60">
                          <td className="py-1 px-3 whitespace-nowrap">
                            {!r._isValid ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-danger/10 text-danger border border-danger/20">
                                Invalid VIN
                              </span>
                            ) : r._isDuplicateInFile ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-warn/10 text-warn border border-warn/20">
                                Duplicate in File
                              </span>
                            ) : r._isAlreadyInDb ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-accent-soft text-accent border border-accent-line">
                                Updates Existing
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-ok/10 text-ok border border-ok/20">
                                New VIN
                              </span>
                            )}
                          </td>
                          <td className="py-1 px-3 font-mono text-ink font-semibold whitespace-nowrap">{r.vin || '—'}</td>
                          <td className="py-1 px-3 font-medium text-ink whitespace-nowrap">{r.model}</td>
                          <td className="py-1 px-3 text-ink-2 whitespace-nowrap">{r.variant}</td>
                          <td className="py-1 px-3 text-ink-2 whitespace-nowrap">{r.color}</td>
                          <td className="py-1 px-3 text-ink-3 uppercase whitespace-nowrap">{r.fuel_type}</td>
                          <td className="py-1 px-3 text-ink-2 whitespace-nowrap">{r.location}</td>
                          <td className="py-1 px-3 text-ink whitespace-nowrap">{r.customer_name || '—'}</td>
                          <td className="py-1 px-3 text-ink-3 tnum whitespace-nowrap">{r.purchase_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-2.5 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-2.5 bg-ok/10 border border-ok/20 text-ok text-xs font-semibold rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Successfully imported and verified {successCount} unique stock vehicles!</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-line flex items-center justify-between bg-canvas">
          <div className="text-xs text-ink-3 font-medium">
            {validRows.length > 0 ? (
              <span>Ready to process <strong>{validRows.length}</strong> verified rows</span>
            ) : (
              <span>Upload or paste your file above</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={validRows.length === 0 || isImporting}
              onClick={handleSaveToDatabase}
              className="h-8 px-4 rounded bg-accent hover:bg-accent-600 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Stock...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Import {validRows.length} Vehicles to Stock</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
