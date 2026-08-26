import { Hono } from 'hono';
import { Env } from '../index';

export const bookingsRouter = new Hono<{ Bindings: Env; Variables: any }>();

const TATA_ORG_ID = '11111111-1111-1111-1111-111111111111';
const HYUNDAI_ORG_ID = '11111111-1111-1111-1111-111111111112';

// 20 Realistic Dealership Customer Bookings (Tata + Hyundai Mix)
let localBookingsStore: any[] = [
  { id: "bk-1", receipt_no: "BK-009101", customer_name: "Ramesh Chandra Sharma", mobile_number: "+91 98290 11223", model: "Tata Safari", variant: "Accomplished Plus 6S AT", colour: "Oberon Black", allocated_vin_no: "MAT612345S9988771", allocation_date: "2026-08-24", receipt_amt: 50000, status: "ALLOCATED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-08-30", organization_id: TATA_ORG_ID, created_at: "2026-08-20T10:00:00Z" },
  { id: "bk-2", receipt_no: "BK-009102", customer_name: "Priya Kulkarni", mobile_number: "+91 98220 33445", model: "Tata Tiago", variant: "XZ+ Dual Tone", colour: "Tornado Blue", allocated_vin_no: "MAT612345T2233447", allocation_date: "2026-08-25", receipt_amt: 25000, status: "ALLOCATED", sales_consultant: "Rajesh Nair", promise_delivery_date: "2026-08-28", organization_id: TATA_ORG_ID, created_at: "2026-08-21T11:00:00Z" },
  { id: "bk-3", receipt_no: "BK-009103", customer_name: "Rajesh Kumar Verma", mobile_number: "+91 94140 55667", model: "Hyundai Creta", variant: "SX (O) Turbo DCT", colour: "Ranger Khaki", allocated_vin_no: "MALC12345C1122331", allocation_date: "2026-08-24", receipt_amt: 50000, status: "ALLOCATED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-08-29", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-20T15:00:00Z" },
  { id: "bk-4", receipt_no: "BK-009104", customer_name: "Anita Desai", mobile_number: "+91 98291 77889", model: "Hyundai i20", variant: "Asta (O) IVT", colour: "Starry Night", allocated_vin_no: "MALC12345I6677886", allocation_date: "2026-08-25", receipt_amt: 25000, status: "ALLOCATED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-08-31", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-22T09:30:00Z" },
  { id: "bk-5", receipt_no: "BK-009105", customer_name: "Sunil Gupta", mobile_number: "+91 98292 99001", model: "Hyundai Verna", variant: "SX 1.5 MPI IVT", colour: "Fiery Red", allocated_vin_no: "MALC12345V0011220", allocation_date: "2026-08-25", receipt_amt: 30000, status: "ALLOCATED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-02", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T14:00:00Z" },
  { id: "bk-6", receipt_no: "BK-009106", customer_name: "Vikramaditya Singhania", mobile_number: "+91 98293 22334", model: "Tata Safari", variant: "Adventure Plus AT", colour: "Cosmic Gold", allocated_vin_no: "MAT612345S8877668", allocation_date: "2026-08-20", receipt_amt: 100000, status: "DELIVERED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-08-25", organization_id: TATA_ORG_ID, created_at: "2026-08-18T10:00:00Z" },
  { id: "bk-7", receipt_no: "BK-009107", customer_name: "Dr. Arvind Agarwal", mobile_number: "+91 98294 44556", model: "Tata Harrier", variant: "Fearless Plus Dark", colour: "Oberon Black", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Rajesh Nair", promise_delivery_date: "2026-09-05", organization_id: TATA_ORG_ID, created_at: "2026-08-24T10:00:00Z" },
  { id: "bk-8", receipt_no: "BK-009108", customer_name: "Meenakshi Sundaram", mobile_number: "+91 98295 66778", model: "Tata Nexon", variant: "Creative Plus DT", colour: "Daytona Grey", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Amit Verma", promise_delivery_date: "2026-09-07", organization_id: TATA_ORG_ID, created_at: "2026-08-24T12:30:00Z" },
  { id: "bk-9", receipt_no: "BK-009109", customer_name: "Siddharth Malhotra", mobile_number: "+91 98296 88990", model: "Tata Curvv.ev", variant: "Accomplished Plus 55", colour: "Empowered Oxide", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-09-10", organization_id: TATA_ORG_ID, created_at: "2026-08-24T16:00:00Z" },
  { id: "bk-10", receipt_no: "BK-009110", customer_name: "Deepak Choudhary", mobile_number: "+91 98297 11223", model: "Tata Punch", variant: "Creative DT", colour: "Calypso Red", allocated_vin_no: null, receipt_amt: 21000, status: "BOOKED", sales_consultant: "Pooja Patil", promise_delivery_date: "2026-09-03", organization_id: TATA_ORG_ID, created_at: "2026-08-25T09:15:00Z" },
  { id: "bk-11", receipt_no: "BK-009111", customer_name: "Kavita Rathi", mobile_number: "+91 98298 33445", model: "Tata Altroz", variant: "Racer R3", colour: "Atomic Orange", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Vikram Joshi", promise_delivery_date: "2026-09-12", organization_id: TATA_ORG_ID, created_at: "2026-08-25T11:00:00Z" },
  { id: "bk-12", receipt_no: "BK-009112", customer_name: "Rohan Mehra", mobile_number: "+91 98299 55667", model: "Hyundai Tucson", variant: "Signature Diesel AWD", colour: "Titan Grey", allocated_vin_no: null, receipt_amt: 100000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-15", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T16:30:00Z" },
  { id: "bk-13", receipt_no: "BK-009113", customer_name: "Gaurav Khandelwal", mobile_number: "+91 98210 77889", model: "Hyundai Venue", variant: "N Line N8 DCT", colour: "Thunder Blue", allocated_vin_no: null, receipt_amt: 30000, status: "BOOKED", sales_consultant: "Suresh Sharma", promise_delivery_date: "2026-09-08", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-24T11:45:00Z" },
  { id: "bk-14", receipt_no: "BK-009114", customer_name: "Pooja Saxena", mobile_number: "+91 98211 99001", model: "Hyundai Exter", variant: "SX (O) Connect", colour: "Cosmic Blue", allocated_vin_no: null, receipt_amt: 20000, status: "BOOKED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-09-04", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T08:30:00Z" },
  { id: "bk-15", receipt_no: "BK-009115", customer_name: "Alok Mathur", mobile_number: "+91 98212 22334", model: "Hyundai Verna", variant: "SX Turbo DCT", colour: "Abyss Black", allocated_vin_no: null, receipt_amt: 40000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-11", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T10:15:00Z" },
  { id: "bk-16", receipt_no: "BK-009116", customer_name: "Neeraj Bansal", mobile_number: "+91 98213 44556", model: "Hyundai Creta", variant: "Knight Edition S(O)", colour: "Abyss Black", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Suresh Sharma", promise_delivery_date: "2026-09-14", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-24T15:00:00Z" },
  { id: "bk-17", receipt_no: "BK-009117", customer_name: "Shubham Jain", mobile_number: "+91 98214 66778", model: "Tata Nexon", variant: "Pure Plus S", colour: "Calypso Red", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Amit Verma", promise_delivery_date: "2026-09-06", organization_id: TATA_ORG_ID, created_at: "2026-08-25T12:00:00Z" },
  { id: "bk-18", receipt_no: "BK-009118", customer_name: "Varun Kapoor", mobile_number: "+91 98215 88990", model: "Hyundai Ioniq 5", variant: "RWD Long Range", colour: "Gravity Gold Matte", allocated_vin_no: null, receipt_amt: 100000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-20", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T18:00:00Z" },
  { id: "bk-19", receipt_no: "BK-009119", customer_name: "Tanmay Bhatia", mobile_number: "+91 98216 11223", model: "Tata Safari", variant: "Adventure Plus AT", colour: "Cosmic Gold", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-09-18", organization_id: TATA_ORG_ID, created_at: "2026-08-25T13:30:00Z" },
  { id: "bk-20", receipt_no: "BK-009120", customer_name: "Harshvardhan Raje", mobile_number: "+91 98217 33445", model: "Hyundai Venue", variant: "SX 1.5 Diesel", colour: "Atlas White", allocated_vin_no: null, receipt_amt: 30000, status: "BOOKED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-09-09", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T14:45:00Z" }
];

// GET /api/v1/bookings — List bookings with search, status, and org filter
bookingsRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const status = c.req.query('status');

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (orgId && orgId !== 'ALL') {
      query = query.eq('organization_id', orgId);
    }
    const { data: dbData, error } = await query;
    if (!error && dbData && dbData.length > 0) {
      let filtered = dbData;
      if (status && status !== 'ALL') {
        if (status === 'ALLOCATED') filtered = filtered.filter((b: any) => b.status === 'ALLOCATED' || !!b.allocated_vin_no);
        else if (status === 'PENDING_ALLOCATION' || status === 'BOOKED') filtered = filtered.filter((b: any) => !b.allocated_vin_no);
        else filtered = filtered.filter((b: any) => b.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((b: any) => 
          (b.customer_name || '').toLowerCase().includes(q) ||
          (b.receipt_no || '').toLowerCase().includes(q) ||
          (b.allocated_vin_no || '').toLowerCase().includes(q) ||
          (b.mobile_number || '').includes(q) ||
          (b.model || '').toLowerCase().includes(q)
        );
      }
      return c.json({ success: true, data: filtered, meta: { total: filtered.length, source: 'supabase' } });
    }
  } catch (e) {}

  let results = [...localBookingsStore];

  if (orgId && orgId !== 'ALL') {
    results = results.filter(b => b.organization_id === orgId);
  }

  if (status && status !== 'ALL') {
    if (status === 'ALLOCATED') results = results.filter(b => b.status === 'ALLOCATED' || !!b.allocated_vin_no);
    else if (status === 'PENDING_ALLOCATION' || status === 'BOOKED') results = results.filter(b => !b.allocated_vin_no);
    else results = results.filter(b => b.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(b => 
      (b.customer_name || '').toLowerCase().includes(q) ||
      (b.receipt_no || '').toLowerCase().includes(q) ||
      (b.allocated_vin_no || '').toLowerCase().includes(q) ||
      (b.mobile_number || '').includes(q) ||
      (b.model || '').toLowerCase().includes(q)
    );
  }

  return c.json({
    success: true,
    data: results,
    meta: { total: results.length, source: 'local' }
  });
});

// POST /api/v1/bookings — Create single booking
bookingsRouter.post('/', async (c) => {
  const body = await c.req.json();

  const newBooking = {
    id: `bk-${Date.now()}`,
    organization_id: body.organizationId || body.organization_id || TATA_ORG_ID,
    receipt_no: body.receiptNo || body.receipt_no || `BK-00${Math.floor(1000 + Math.random() * 9000)}`,
    customer_name: body.customerName || body.customer_name,
    mobile_number: body.mobileNumber || body.mobile_number,
    sales_consultant: body.salesConsultant || body.sales_consultant || 'Sales Consultant',
    model: body.model,
    variant: body.variant || 'Standard',
    colour: body.colour || 'White',
    receipt_amt: parseFloat(body.receiptAmt || body.receipt_amt || '25000') || 25000,
    promise_delivery_date: body.promiseDeliveryDate || body.promise_delivery_date || '2026-09-15',
    status: body.status || 'BOOKED',
    allocated_vin_no: body.allocatedVinNo || body.allocated_vin_no || null,
    created_at: new Date().toISOString()
  };

  localBookingsStore = [newBooking, ...localBookingsStore];

  return c.json({ success: true, data: newBooking }, 201);
});

// PATCH /api/v1/bookings/:id — Update booking / Allocate VIN
bookingsRouter.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  let updatedRecord = null;
  localBookingsStore = localBookingsStore.map(b => {
    if (b.id === id || b.receipt_no === id) {
      updatedRecord = { ...b, ...body, updated_at: new Date().toISOString() };
      return updatedRecord;
    }
    return b;
  });

  if (!updatedRecord) {
    return c.json({ success: false, error: { message: 'Booking ID not found' } }, 404);
  }

  return c.json({ success: true, data: updatedRecord });
});

// POST /api/v1/bookings/bulk-import — Bulk upload Excel / CSV data
bookingsRouter.post('/bulk-import', async (c) => {
  const { organizationId, bookings } = await c.req.json();

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return c.json({ success: false, error: { message: 'No bookings data provided' } }, 400);
  }

  const newRecords = bookings.map((b: any, idx: number) => ({
    id: `bk-imported-${Date.now()}-${idx}`,
    organization_id: organizationId || TATA_ORG_ID,
    receipt_no: b['Receipt No'] || b.receipt_no || `BK-00${Math.floor(1000 + Math.random() * 9000)}`,
    customer_name: b['Customer Name'] || b.customer_name || 'Customer Name',
    mobile_number: b['Mobile Number'] || b.mobile_number || '+91 98000 00000',
    sales_consultant: b['Sales Consultant'] || b.sales_consultant || 'Sales Consultant',
    model: b['Model'] || b.model || 'Tata Nexon',
    variant: b['Variant'] || b.variant || 'Standard',
    colour: b['Colour'] || b.colour || 'White',
    receipt_amt: parseFloat(b['Receipt Amt'] || b.receipt_amt || '25000') || 25000,
    status: b['Status'] || b.status || 'BOOKED',
    allocated_vin_no: b['Allocated Vin No'] || b.allocated_vin_no || null,
    created_at: new Date().toISOString()
  }));

  localBookingsStore = [...newRecords, ...localBookingsStore];

  return c.json({ success: true, data: { importedCount: newRecords.length, records: newRecords } });
});