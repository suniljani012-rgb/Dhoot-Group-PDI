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
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    
    // Fetch from Supabase cloud database
    const { data: dbData, error } = await supabase
      .from('bookings')
      .select('*')
      .like('receipt_no', 'STK-%')
      .order('created_at', { ascending: false });

    if (!error && dbData && Array.isArray(dbData) && dbData.length > 0) {
      results = dbData.map(d => ({
        id: d.id,
        vin: d.allocated_vin_no || d.receipt_no.replace('STK-', ''),
        model: d.model,
        variant: d.variant,
        color: d.colour,
        fuel_type: 'PETROL/DIESEL',
        location: d.docket_no || 'Stockyard',
        customer_name: d.customer_name === 'Unallocated Stock' ? '' : d.customer_name,
        sales_consultant: d.sales_consultant,
        status: d.status || 'RECEIVED',
        organization_id: d.organization_id,
        created_at: d.created_at
      }));
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
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    
    // Save into Supabase cloud table
    const rowsToInsert = items.map((r: any) => ({
      receipt_no: `STK-${r.vin || Date.now() + Math.random().toString(36).substr(2, 6)}`,
      customer_name: r.customer_name || 'Unallocated Stock',
      mobile_number: '+91 98000 00000',
      model: r.model || 'Standard Model',
      variant: r.variant || 'Standard Variant',
      colour: r.color || r.colour || 'Standard Colour',
      allocated_vin_no: r.vin,
      docket_no: r.location || 'Yard',
      sales_consultant: r.sales_consultant || null,
      status: r.status || 'RECEIVED',
      organization_id: r.organization_id || '11111111-1111-1111-1111-111111111111'
    }));

    await supabase.from('bookings').insert(rowsToInsert);
  } catch (e) {}

  return c.json({ success: true, data: { imported_count: items.length, total_count: localVehiclesStore.length } }, 201);
});
