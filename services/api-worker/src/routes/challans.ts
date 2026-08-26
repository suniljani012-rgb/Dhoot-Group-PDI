import { Env } from '../index';
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

export const challansRouter = new Hono<{ Bindings: Env; Variables: any }>();

let localChallansStore: any[] = [];

// GET /api/v1/challans
challansRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');

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
    results = results.filter(ch => ch.organization_id === orgId);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(ch => 
      (ch.challan_no || '').toLowerCase().includes(q) ||
      (ch.invoice_no || '').toLowerCase().includes(q) ||
      (ch.customer_name || '').toLowerCase().includes(q) ||
      (ch.vin_no || '').toLowerCase().includes(q) ||
      (ch.model || '').toLowerCase().includes(q)
    );
  }

  return c.json({ success: true, data: results, meta: { total: results.length } });
});

// POST /api/v1/challans/bulk-import
challansRouter.post('/bulk-import', async (c) => {
  const body = await c.req.json();
  const items = body.records || body.challans || [];
  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ success: false, error: { message: 'Invalid or empty records list' } }, 400);
  }

  localChallansStore = [...items, ...localChallansStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    const sanitized = items.map((r: any) => ({
      challan_no: r.challan_no || `CH-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      invoice_no: r.invoice_no || `INV-${Date.now()}`,
      customer_name: r.customer_name || 'Valued Customer',
      vin_no: r.vin_no || r.vin || 'VIN-PENDING',
      model: r.model || 'Standard Model',
      variant: r.variant || 'Standard Variant',
      colour: r.colour || r.color || 'Standard Colour',
      sale_consultant: r.sales_consultant || r.sale_consultant || null,
      team_leader: r.team_leader || null,
      financier_name: r.financier_name || null,
      status: r.status || 'INVOICED',
      organization_id: r.organization_id || '11111111-1111-1111-1111-111111111111'
    }));

    await supabase.from('challan_invoices').insert(sanitized);
  } catch (e) {}

  return c.json({ success: true, data: { imported_count: items.length, total_count: localChallansStore.length } }, 201);
});
