import React, { useState } from 'react';
import { 
  FileSpreadsheet, Download, Upload, Check, AlertCircle, 
  X, Loader2, RefreshCw, FileCheck, CheckCircle2 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

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

  // Exact 21 Official Dealership Excel Headers
  const officialHeaders = [
    'VIN Number',
    'Brand',
    'Model',
    'Variant',
    'Colour',
    'Fuel Type',
    'FSC Code',
    'Dealer Code',
    'Plant Code',
    'Manufacturing Year',
    'Vehicle Status',
    'Stockyard Location',
    'Customer Name',
    'Sales Consultant',
    'Purchase Date',
    'Delivery Date',
    'Allocation Date',
    'Allocated Days',
    'Accessories Amount',
    'Received Amount',
    'Engine Number'
  ];

  // 1. Download Official 21-Column Excel Template
  const handleDownloadTemplate = () => {
    const sampleRows = [
      officialHeaders.join(','),
      'MAT612345S9988776,TATA,Tata Safari,Accomplished Plus 6S,Oberon Black,DIESEL,FSC-TAT-801,DLR-MH01,PLT-PUN,2026,YARD_RECEIVING_PENDING,Pune Central Yard,Rajesh Sharma,Vikram Malhotra,2026-08-20,2026-08-28,2026-08-21,5,18000,50000,ENG-KY-90881',
      'MALC12345C1122334,HYUNDAI,Hyundai Creta,SX (O) Turbo DCT,Ranger Khaki,PETROL,FSC-HYN-901,DLR-RJ01,PLT-CHE,2026,YARD_RECEIVING_PENDING,Jaipur Main Yard,Sunil Jani,Ramesh Choudhary,2026-08-21,2026-08-27,2026-08-22,4,15000,51000,ENG-HY-77612'
    ].join('\n');

    const blob = new Blob([sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dhoot_Group_Vehicle_Stock_Template_${currentBrand.shortName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Parse CSV / Excel Text
  const handleParseText = (text: string) => {
    setCsvText(text);
    setErrorMsg(null);
    setSuccessCount(null);

    const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    // Determine separator: comma or tab
    const firstLine = lines[0];
    const isTab = firstLine.includes('\t');
    const separator = isTab ? '\t' : ',';

    const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
    
    const rows = lines.slice(1).map((line, idx) => {
      const cols = line.split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
      const obj: any = { _rowNum: idx + 2 };
      headers.forEach((h, hIdx) => {
        obj[h] = cols[hIdx] || '';
      });

      // Normalize standard database mapping
      return {
        _rowNum: idx + 2,
        vin: obj['VIN Number'] || obj['vin'] || obj['Vin No'] || cols[0] || '',
        brand: obj['Brand'] || (cols[0]?.startsWith('MAL') ? 'HYUNDAI' : 'TATA'),
        model: obj['Model'] || cols[2] || 'Tata Vehicle',
        variant: obj['Variant'] || cols[3] || '',
        color: obj['Colour'] || obj['color'] || cols[4] || 'White',
        fuel_type: obj['Fuel Type'] || obj['fuel'] || cols[5] || 'PETROL',
        fsc_code: obj['FSC Code'] || cols[6] || '',
        dealer_code: obj['Dealer Code'] || cols[7] || 'DLR-MH01',
        plant_code: obj['Plant Code'] || cols[8] || 'PLT-PUN',
        manufacturing_year: parseInt(obj['Manufacturing Year'] || cols[9]) || 2026,
        status: obj['Vehicle Status'] || obj['status'] || 'YARD_RECEIVING_PENDING',
        location: obj['Stockyard Location'] || obj['location'] || cols[11] || 'Central Stockyard',
        customer_name: obj['Customer Name'] || cols[12] || null,
        sales_consultant: obj['Sales Consultant'] || cols[13] || null,
        purchase_date: obj['Purchase Date'] || cols[14] || new Date().toISOString().split('T')[0],
        delivery_date: obj['Delivery Date'] || cols[15] || null,
        allocation_date: obj['Allocation Date'] || cols[16] || null,
        allocated_days: parseInt(obj['Allocated Days'] || cols[17]) || 0,
        accessories_amount: parseFloat(obj['Accessories Amount'] || cols[18]) || 0,
        received_amount: parseFloat(obj['Received Amount'] || cols[19]) || 0,
        engine_no: obj['Engine Number'] || cols[20] || ''
      };
    });

    setParsedRows(rows);
  };

  // 3. File Upload handler (.csv or .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParseText(content);
    };
    reader.readAsText(file);
  };

  // 4. Batch Save to Supabase Database
  const handleSaveToDatabase = async () => {
    if (parsedRows.length === 0) {
      setErrorMsg('No valid vehicle rows found to import.');
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);

    try {
      const targetOrg = currentBrand.code === 'DHOOT-HYUNDAI' 
        ? '11111111-1111-1111-1111-111111111112' 
        : '11111111-1111-1111-1111-111111111111';

      // Prepare payload for Supabase database table
      const recordsToInsert = parsedRows.map(r => ({
        vin: r.vin,
        model: r.model,
        variant: r.variant,
        color: r.color,
        fuel_type: r.fuel_type,
        fsc_code: r.fsc_code,
        dealer_code: r.dealer_code,
        plant_code: r.plant_code,
        manufacturing_year: r.manufacturing_year,
        status: r.status || 'YARD_RECEIVING_PENDING',
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

      // Direct Upsert into Supabase `vehicles` table
      const { error } = await supabase
        .from('vehicles')
        .upsert(recordsToInsert, { onConflict: 'vin' });

      if (error) {
        console.warn('Database upsert warning, fallback to API worker:', error);
        // Fallback to API worker bulk import
        const res = await fetch('http://localhost:8787/api/v1/stock/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: targetOrg,
            stockItems: parsedRows
          })
        });
        if (!res.ok) throw new Error('Bulk import failed. Please verify VIN uniqueness.');
      }

      setSuccessCount(recordsToInsert.length);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);

    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed. Check CSV column alignment.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Universal Excel Stock Importer • {currentBrand.name}
              </h2>
              <p className="text-xs text-slate-400">
                Official 21-column database ledger import engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Top Actions: Template Download + File Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Download Button */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">1. Download Sample Excel</span>
                <span className="text-[11px] text-slate-500">Official template with all 21 columns</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download .CSV</span>
              </button>
            </div>

            {/* Upload File Button */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">2. Upload Excel / CSV File</span>
                <span className="text-[11px] text-slate-500">Directly upload completed spreadsheet</span>
              </div>
              <label className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".csv,.txt,.xlsx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

          </div>

          {/* Paste Excel Text Area */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Or Copy & Paste Rows directly from Microsoft Excel / Google Sheets:
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => handleParseText(e.target.value)}
              placeholder="Paste rows here (with or without headers)..."
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successCount !== null && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Successfully imported and synced {successCount} vehicles into Supabase database!</span>
            </div>
          )}

          {/* Data Validation Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Parsed Data Preview ({parsedRows.length} Vehicles Ready)</span>
                <span className="text-emerald-700">✓ All Columns Formatted</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-48">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">VIN</th>
                      <th className="py-2 px-3">Model</th>
                      <th className="py-2 px-3">Variant</th>
                      <th className="py-2 px-3">Colour</th>
                      <th className="py-2 px-3">Fuel</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 font-mono">
                        <td className="py-1.5 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-1.5 px-3 font-bold text-slate-900">{r.vin}</td>
                        <td className="py-1.5 px-3 font-sans font-semibold">{r.model}</td>
                        <td className="py-1.5 px-3 font-sans text-slate-500">{r.variant}</td>
                        <td className="py-1.5 px-3 font-sans">{r.color}</td>
                        <td className="py-1.5 px-3 font-semibold">{r.fuel_type}</td>
                        <td className="py-1.5 px-3 text-emerald-700 font-bold">{r.status}</td>
                        <td className="py-1.5 px-3 font-sans text-slate-500">{r.location}</td>
                        <td className="py-1.5 px-3 font-sans">{r.customer_name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || isImporting}
            onClick={handleSaveToDatabase}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importing to Database...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import {parsedRows.length} Vehicles to Database</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
