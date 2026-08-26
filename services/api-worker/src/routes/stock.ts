import { Env } from '../index';
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

export const stockRouter = new Hono<{ Bindings: Env; Variables: any }>();

let localVehiclesStore: any[] = [];

// GET /api/v1/stock
stockRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');

  let results: any[] = [...localVehiclesStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (orgId && orgId !== 'ALL') {
      query = query.eq('organization_id', orgId);
    }
    const { data: dbData, error } = await query;
    if (!error && dbData && Array.isArray(dbData)) {
      results = dbData;
    }
  } catch (e) {}

  if (orgId && orgId !== 'ALL') {
    results = results.filter(v => v.organization_id === orgId);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(v => 
      (v.vin || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.customer_name || '').toLowerCase().includes(q) ||
      (v.location || '').toLowerCase().includes(q)
    );
  }

  return c.json({ success: true, data: results, meta: { total: results.length } });
});

// POST /api/v1/stock/bulk-import
stockRouter.post('/bulk-import', async (c) => {
  const body = await c.req.json();
  const items = body.vehicles || body.rows || [];
  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: { message: 'Invalid or empty vehicles list' } }, 400);
  }

  localVehiclesStore = [...items, ...localVehiclesStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    await supabase.from('vehicles').upsert(items, { onConflict: 'vin' });
  } catch (e) {}

  return c.json({ success: true, data: { imported_count: items.length, total_count: localVehiclesStore.length } }, 201);
});
