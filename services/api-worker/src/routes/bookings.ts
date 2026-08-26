import { Env } from '../index';
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

export const bookingsRouter = new Hono<{ Bindings: Env; Variables: any }>();

const TATA_ORG_ID = '11111111-1111-1111-1111-111111111111';
const HYUNDAI_ORG_ID = '11111111-1111-1111-1111-111111111112';

let localBookingsStore: any[] = [
  {
    id: "bk-tat-1",
    receipt_no: "RCT-TAT-9901",
    customer_name: "Rajesh Sharma",
    mobile_number: "+91 98290 11223",
    model: "Tata Nexon",
    variant: "Fearless Plus S DT",
    colour: "Daytona Grey",
    allocated_vin_no: "MAT612345N1234567",
    allocation_date: "2026-08-24",
    receipt_amt: 50000,
    status: "ALLOCATED",
    sales_consultant: "Vikram Malhotra",
    promise_delivery_date: "2026-08-30",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-20T10:00:00Z"
  },
  {
    id: "bk-tat-2",
    receipt_no: "RCT-TAT-9902",
    customer_name: "Priya Patel",
    mobile_number: "+91 98220 33445",
    model: "Tata Harrier",
    variant: "Fearless Plus Dark",
    colour: "Oberon Black",
    allocated_vin_no: "MAT612345H7654321",
    allocation_date: "2026-08-25",
    receipt_amt: 50000,
    status: "ALLOCATED",
    sales_consultant: "Vikram Malhotra",
    promise_delivery_date: "2026-08-28",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-21T11:00:00Z"
  },
  {
    id: "bk-hyn-1",
    receipt_no: "RCT-HYN-8801",
    customer_name: "Amit Singh",
    mobile_number: "+91 94140 55667",
    model: "Hyundai Creta",
    variant: "SX(O) Turbo 1.5 DCT",
    colour: "Ranger Khaki",
    allocated_vin_no: "MALC12345C1122334",
    allocation_date: "2026-08-24",
    receipt_amt: 50000,
    status: "ALLOCATED",
    sales_consultant: "Ramesh Choudhary",
    promise_delivery_date: "2026-08-29",
    organization_id: HYUNDAI_ORG_ID,
    created_at: "2026-08-22T14:00:00Z"
  },
  {
    id: "bk-hyn-2",
    receipt_no: "RCT-HYN-8802",
    customer_name: "Neha Verma",
    mobile_number: "+91 98291 77889",
    model: "Hyundai Venue",
    variant: "N Line N8 DCT",
    colour: "Atlas White / Abyss Black",
    allocated_vin_no: "MALC12345V5566778",
    allocation_date: "2026-08-25",
    receipt_amt: 30000,
    status: "ALLOCATED",
    sales_consultant: "Ramesh Choudhary",
    promise_delivery_date: "2026-08-31",
    organization_id: HYUNDAI_ORG_ID,
    created_at: "2026-08-23T16:00:00Z"
  }
];

// GET /api/v1/bookings
bookingsRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const status = c.req.query('status');

  let results = [...localBookingsStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (orgId && orgId !== 'ALL') {
      query = query.eq('organization_id', orgId);
    }
    const { data: dbData, error } = await query;
    if (!error && dbData && Array.isArray(dbData) && dbData.length > 0) {
      results = dbData;
    }
  } catch (e) {}

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

  return c.json({ success: true, data: results, meta: { total: results.length } });
});

// POST /api/v1/bookings/bulk-import
bookingsRouter.post('/bulk-import', async (c) => {
  const body = await c.req.json();
  const items = body.bookings || body.records || [];
  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: { message: 'Invalid or empty bookings list' } }, 400);
  }

  localBookingsStore = [...items, ...localBookingsStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    await supabase.from('bookings').upsert(items, { onConflict: 'receipt_no' });
  } catch (e) {}

  return c.json({ success: true, data: { imported_count: items.length, total_count: localBookingsStore.length } }, 201);
});
