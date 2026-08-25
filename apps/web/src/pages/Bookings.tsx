import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bookmark, Search, Plus, Car, ChevronRight, 
  FileSpreadsheet, X, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BookingRecord {
  id: string;
  receipt_date?: string;
  receipt_no: string;
  customer_name: string;
  mobile_number: string;
  sales_consultant?: string;
  team_leader?: string;
  model: string;
  variant: string;
  colour: string;
  booking_date?: string;
  booking_model?: string;
  booking_variant?: string;
  booking_colour?: string;
  booking_approval_date?: string;
  promise_delivery_date?: string;
  allocation_date?: string;
  allocated_model?: string;
  allocated_variant?: string;
  allocated_colour?: string;
  allocated_vin_no?: string;
  requisition_slip?: string;
  requisition_date?: string;
  issue_no?: string;
  issue_date?: string;
  prechallan_date?: string;
  prechallan_no?: string;
  challan_approval_date?: string;
  insurance_date?: string;
  after_insurance_date?: string;
  cancel_date?: string;
  reason?: string;
  receipt_amt?: number;
  docket_no?: string;
  pan_no?: string;
  status: string;
  created_at: string;
}

export const BookingsPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    receipt_no: '',
    customer_name: '',
    mobile_number: '',
    sales_consultant: '',
    team_leader: '',
    model: currentBrand.models[0] || 'Model',
    variant: '',
    colour: '',
    booking_date: new Date().toISOString().split('T')[0],
    promise_delivery_date: '',
    allocated_vin_no: '',
    receipt_amt: 25000,
    docket_no: '',
    pan_no: '',
  });

  // Import State
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [currentBrand.code]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8787/api/v1/bookings?organization_id=${currentBrand.orgId}`);
      if (res.ok) {
        const json = await res.json();
        setBookings(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8787/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentBrand.orgId,
          ...newBooking,
          status: newBooking.allocated_vin_no ? 'ALLOCATED' : 'BOOKED'
        })
      });
      if (res.ok) {
        setShowNewModal(false);
        fetchBookings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCsvImport = async () => {
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

      const res = await fetch('http://localhost:8787/api/v1/bookings/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentBrand.orgId,
          bookings: parsedRecords
        })
      });

      if (res.ok) {
        setShowImportModal(false);
        setCsvText('');
        fetchBookings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  const filtered = bookings.filter(b => {
    const matchesSearch = 
      b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.receipt_no?.toLowerCase().includes(search.toLowerCase()) ||
      b.allocated_vin_no?.toLowerCase().includes(search.toLowerCase()) ||
      b.mobile_number?.includes(search);

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && b.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            style={{ backgroundColor: `${currentBrand.primaryColor}15`, color: currentBrand.primaryColor }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold"
          >
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {currentBrand.name} • Bookings Tracking
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              34-Field Authoritative Customer Bookings & VIN Allocation Desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            style={{ backgroundColor: currentBrand.primaryColor }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{currentBrand.name} Dealership</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">VIN Allocated</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {bookings.filter(b => b.allocated_vin_no).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for PDI & Dispatch</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Allocation</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {bookings.filter(b => !b.allocated_vin_no && b.status !== 'CANCELLED').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Stockyard Stock Matching</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Advance Received</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ₹{bookings.reduce((sum, b) => sum + (Number(b.receipt_amt) || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Booking Advance Ledger</div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Customer, Mobile, Receipt, VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'ALLOCATED', 'BOOKED', 'DELIVERED', 'CANCELLED'].map((st) => (
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

      {/* Bookings Table with Full 34 Columns */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Receipt Date</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">Model & Variant</th>
                <th className="py-3 px-4">Colour</th>
                <th className="py-3 px-4">Allocated VIN</th>
                <th className="py-3 px-4">Promise Delivery</th>
                <th className="py-3 px-4">Sales Consultant</th>
                <th className="py-3 px-4">Team Leader</th>
                <th className="py-3 px-4">Receipt Amt</th>
                <th className="py-3 px-4">Docket No</th>
                <th className="py-3 px-4">PAN No</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
                    Loading Bookings Ledger...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    No bookings found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr 
                    key={b.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedBooking(b)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {b.receipt_no}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {b.receipt_date || b.booking_date || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {b.customer_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {b.mobile_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.model}</div>
                      <div className="text-[11px] text-slate-500">{b.variant}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
                        {b.colour}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {b.allocated_vin_no ? (
                        <div className="flex items-center gap-1.5 font-mono text-indigo-700 font-bold">
                          <Car className="w-3.5 h-3.5" />
                          <span>{b.allocated_vin_no}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unallocated</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {b.promise_delivery_date || 'TBD'}
                    </td>
                    <td className="py-3.5 px-4">
                      {b.sales_consultant || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {b.team_leader || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{(Number(b.receipt_amt) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {b.docket_no || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {b.pan_no || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.status === 'ALLOCATED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        b.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        b.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {b.allocated_vin_no ? (
                        <Link
                          to="/pdi"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                        >
                          <span>PDI</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(b);
                          }}
                          className="text-slate-400 hover:text-slate-700 font-bold"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: NEW BOOKING */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-5 h-5" style={{ color: currentBrand.primaryColor }} />
                <h3 className="font-bold text-slate-900">New Booking Entry • {currentBrand.name}</h3>
              </div>
              <button 
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Receipt No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RCT-TAT-1029"
                    value={newBooking.receipt_no}
                    onChange={(e) => setNewBooking({ ...newBooking, receipt_no: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Customer Name"
                    value={newBooking.customer_name}
                    onChange={(e) => setNewBooking({ ...newBooking, customer_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newBooking.mobile_number}
                    onChange={(e) => setNewBooking({ ...newBooking, mobile_number: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Model *</label>
                  <select
                    value={newBooking.model}
                    onChange={(e) => setNewBooking({ ...newBooking, model: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2"
                  >
                    {currentBrand.models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Variant *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fearless Plus / SX(O)"
                    value={newBooking.variant}
                    onChange={(e) => setNewBooking({ ...newBooking, variant: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Colour *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daytona Grey / Abyss Black"
                    value={newBooking.colour}
                    onChange={(e) => setNewBooking({ ...newBooking, colour: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Allocated VIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="17-Digit VIN"
                    value={newBooking.allocated_vin_no}
                    onChange={(e) => setNewBooking({ ...newBooking, allocated_vin_no: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Receipt Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newBooking.receipt_amt}
                    onChange={(e) => setNewBooking({ ...newBooking, receipt_amt: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sales Consultant</label>
                  <input
                    type="text"
                    placeholder="Consultant Name"
                    value={newBooking.sales_consultant}
                    onChange={(e) => setNewBooking({ ...newBooking, sales_consultant: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Promise Delivery Date</label>
                  <input
                    type="date"
                    value={newBooking.promise_delivery_date}
                    onChange={(e) => setNewBooking({ ...newBooking, promise_delivery_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Docket No</label>
                  <input
                    type="text"
                    placeholder="Docket No"
                    value={newBooking.docket_no}
                    onChange={(e) => setNewBooking({ ...newBooking, docket_no: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">PAN No</label>
                  <input
                    type="text"
                    placeholder="PAN No"
                    value={newBooking.pan_no}
                    onChange={(e) => setNewBooking({ ...newBooking, pan_no: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2"
                  />
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
                  Save Booking
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
                <h3 className="font-bold text-slate-900">Bulk Import Bookings • {currentBrand.name}</h3>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-800">
                <strong>Supported 34 Headers Format:</strong> Paste directly from Excel or Google Sheets (Tab-Separated or CSV):
                <div className="mt-1 font-mono text-[10px] text-emerald-900 bg-white/70 p-2 rounded-lg overflow-x-auto">
                  Receipt Date | Receipt No | Customer Name | Mobile Number | Sales Consultant | Team Leader | Model | Variant | Colour | Booking Date | Booking Model | Booking Variant | Booking Colour | Booking Approval Date | Promise Delivery Date | Allocation Date | Allocated Model | Allocated Variant | Allocated Colour | Allocated Vin No | Requsition Slip | Requsition Date | Issue No | Issue Date | Prechallan Date | Prechallan No | Challan Approval Date | Insurance Date | After Insurance Date | Cancel Date | Reason | Receipt Amt. | Docket No. | Pan No.
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Paste Excel Data (Include Header Row)
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Paste tab-delimited or CSV rows directly from your dealership Excel workbook..."
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
                    onClick={handleCsvImport}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow"
                  >
                    {importing ? 'Importing Rows...' : 'Process & Import Bookings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DETAILS VIEWER */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Booking Record: {selectedBooking.receipt_no}</h3>
                <p className="text-xs text-slate-500">{selectedBooking.customer_name} • {currentBrand.name}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  1. Customer & Booking Basic Info
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Customer</span>
                    <span className="font-bold text-slate-900">{selectedBooking.customer_name}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Mobile</span>
                    <span className="font-mono text-slate-900">{selectedBooking.mobile_number}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Receipt Date</span>
                    <span>{selectedBooking.receipt_date || selectedBooking.booking_date || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Receipt Amount</span>
                    <span className="font-bold text-emerald-700">₹{(Number(selectedBooking.receipt_amt) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Sales Consultant</span>
                    <span>{selectedBooking.sales_consultant || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Team Leader</span>
                    <span>{selectedBooking.team_leader || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Docket No</span>
                    <span className="font-mono">{selectedBooking.docket_no || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">PAN No</span>
                    <span className="font-mono">{selectedBooking.pan_no || '-'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  2. Vehicle Model & Allocation
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Booked Model</span>
                    <span className="font-bold text-slate-900">{selectedBooking.model}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Booked Variant</span>
                    <span>{selectedBooking.variant}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Booked Colour</span>
                    <span>{selectedBooking.colour}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Promise Delivery</span>
                    <span>{selectedBooking.promise_delivery_date || 'TBD'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Allocated VIN</span>
                    <span className="font-mono font-bold text-indigo-700">{selectedBooking.allocated_vin_no || 'Pending Allocation'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Allocation Date</span>
                    <span>{selectedBooking.allocation_date || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Booking Approval Date</span>
                    <span>{selectedBooking.booking_approval_date || '-'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
                  3. Requisition, Challan & Insurance Dates
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Requisition Slip</span>
                    <span>{selectedBooking.requisition_slip || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Requisition Date</span>
                    <span>{selectedBooking.requisition_date || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Issue No / Date</span>
                    <span>{selectedBooking.issue_no || '-'} ({selectedBooking.issue_date || '-'})</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Prechallan No / Date</span>
                    <span>{selectedBooking.prechallan_no || '-'} ({selectedBooking.prechallan_date || '-'})</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Challan Approval Date</span>
                    <span>{selectedBooking.challan_approval_date || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Insurance Date</span>
                    <span>{selectedBooking.insurance_date || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">After Insurance Date</span>
                    <span>{selectedBooking.after_insurance_date || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Cancel Date / Reason</span>
                    <span>{selectedBooking.cancel_date ? `${selectedBooking.cancel_date} (${selectedBooking.reason})` : 'Not Cancelled'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
