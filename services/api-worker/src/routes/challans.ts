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
      booking_date: r.booking_date && r.booking_date !== '—' ? r.booking_date : null,
      challan_no: r.challan_no || `CH-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      challan_date: r.challan_date && r.challan_date !== '—' ? r.challan_date : null,
      delivery_date: r.delivery_date && r.delivery_date !== '—' ? r.delivery_date : null,
      challan_type: r.challan_type || 'TAX_INVOICE_DELIVERY',
      vin_no: r.vin_no || r.vin || 'VIN-PENDING',
      customer_name: r.customer_name || 'Valued Customer',
      mobile_no: r.mobile_no || r.mobile || null,
      city: r.city || null,
      model: r.model || 'Standard Model',
      variant: r.variant || 'Standard Variant',
      colour: r.colour || r.color || 'Standard Colour',
      sale_consultant: r.sales_consultant || r.sale_consultant || null,
      team_leader: r.team_leader || null,
      financier_name: r.financier_name || null,
      corporate: Number(r.corporate) || 0,
      exchange: Number(r.exchange) || 0,
      ex_showroom: Number(r.ex_showroom) || 0,
      discount: Number(r.discount) || 0,
      net: Number(r.net) || 0,
      insurance_per: Number(r.insurance_per) || 0,
      insurance_amount: Number(r.insurance_amount) || 0,
      ep: Number(r.ep) || 0,
      rti: Number(r.rti) || 0,
      cm: Number(r.cm) || 0,
      rto_city: r.rto_city || r.city || null,
      rto_amount: Number(r.rto_amount) || 0,
      hml_acc: Number(r.hml_acc) || 0,
      own_acc: Number(r.own_acc) || 0,
      acc_discount_amount: Number(r.acc_discount_amount) || 0,
      acc_amount: Number(r.acc_amount) || 0,
      trc: Number(r.trc) || 0,
      warranty: Number(r.warranty) || 0,
      handling_charges: Number(r.handling_charges) || 0,
      other_charges: Number(r.other || r.other_charges) || 0,
      fast_tag: Number(r.fast_tag) || 500,
      tcs: Number(r.tcs) || 0,
      net_amount: Number(r.net_amount) || 0,
      invoice_date: r.invoice_date && r.invoice_date !== '—' ? r.invoice_date : null,
      invoice_no: r.invoice_no || `INV-${Date.now()}`,
      status: r.status || 'INVOICED',
      organization_id: r.organization_id || '11111111-1111-1111-1111-111111111111'
    }));

    await supabase.from('challan_invoices').upsert(sanitized, { onConflict: 'challan_no' });
  } catch (e) {}

  return c.json({ success: true, data: { imported_count: items.length, total_count: localChallansStore.length } }, 201);
});
