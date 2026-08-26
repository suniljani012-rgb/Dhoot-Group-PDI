import { Env } from '../index';
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

export const bookingsRouter = new Hono<{ Bindings: Env; Variables: any }>();

let localBookingsStore: any[] = [];

// GET /api/v1/bookings
bookingsRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const status = c.req.query('status');

  let results: any[] = [...localBookingsStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (orgId && orgId !== 'ALL') {
      query = query.eq('organization_id', orgId);
    }
    const { data: dbData, error } = await query;
    if (!error && dbData && Array.isArray(dbData)) {
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
