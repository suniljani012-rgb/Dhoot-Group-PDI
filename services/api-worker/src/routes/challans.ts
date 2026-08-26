import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export const challansRouter = new Hono<{ Bindings: Env; Variables: any }>();

let localChallansStore: any[] = [];

// GET /api/v1/challans
challansRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const status = c.req.query('status');

  let results: any[] = [...localChallansStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    let query = supabase.from('challan_invoices').select('*').order('created_at', { ascending: false });
    if (orgId && orgId !== 'ALL') {
      query = query.eq('organization_id', orgId);
    }
    const { data: dbData, error } = await query;
    if (!error && dbData && Array.isArray(dbData) && dbData.length > 0) {
      results = dbData;
    }
  } catch (e) {}

  if (orgId && orgId !== 'ALL') {
    results = results.filter(c => c.organization_id === orgId);
  }
  if (status && status !== 'ALL') {
    results = results.filter(c => c.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c => 
      (c.customer_name || '').toLowerCase().includes(q) ||
      (c.challan_no || '').toLowerCase().includes(q) ||
      (c.invoice_no || '').toLowerCase().includes(q) ||
      (c.vin_no || '').toLowerCase().includes(q) ||
      (c.mobile || '').includes(q) ||
      (c.model || '').toLowerCase().includes(q)
    );
  }

  return c.json({ success: true, data: results, meta: { total: results.length } });
});

// POST /api/v1/challans — Create single invoice/challan
challansRouter.post('/', async (c) => {
  const b = await c.req.json();
  const newRecord = {
    id: `chl-${Date.now()}`,
    ...b,
    created_at: new Date().toISOString()
  };
  localChallansStore = [newRecord, ...localChallansStore];
  return c.json({ success: true, data: newRecord }, 201);
});

// POST /api/v1/challans/bulk-import
challansRouter.post('/bulk-import', async (c) => {
  const body = await c.req.json();
  const items = body.records || body.challans || [];
  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: { message: 'Invalid or empty challans list' } }, 400);
  }
  localChallansStore = [...items, ...localChallansStore];
  return c.json({ success: true, data: { imported_count: items.length, total_count: localChallansStore.length } }, 201);
});
