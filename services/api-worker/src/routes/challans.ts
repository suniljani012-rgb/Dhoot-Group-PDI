import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export const challansRouter = new Hono<{ Bindings: Env; Variables: any }>();

// GET /api/v1/challans — List challans/invoices with multi-brand scoping
challansRouter.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const status = c.req.query('status');

  let query = supabase.from('challan_invoices').select('*').order('created_at', { ascending: false });

  if (orgId) {
    query = query.eq('organization_id', orgId);
  }
  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,challan_no.ilike.%${search}%,invoice_no.ilike.%${search}%,vin_no.ilike.%${search}%,mobile_no.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 500);
  }

  return c.json({ success: true, data: data || [], meta: { total: data?.length || 0 } });
});

// POST /api/v1/challans — Create single invoice/challan
challansRouter.post('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const b = await c.req.json();

  const { data, error } = await supabase.from('challan_invoices').insert([{
    organization_id: b.organizationId || b.organization_id,
    branch_id: b.branchId || b.branch_id || null,
    booking_date: b.bookingDate || b.booking_date || null,
    challan_no: b.challanNo || b.challan_no,
    challan_date: b.challanDate || b.challan_date || null,
    vaahan_date: b.vaahanDate || b.vaahan_date || null,
    delivery_date: b.deliveryDate || b.delivery_date || null,
    challan_type: b.challanType || b.challan_type || 'RETAIL',
    vin_no: b.vinNo || b.vin_no,
    customer_name: b.customerName || b.customer_name,
    address: b.address || null,
    city: b.city || null,
    area: b.area || null,
    pan_no: b.panNo || b.pan_no || null,
    mobile_no: b.mobileNo || b.mobile_no || null,
    mail_id: b.mailId || b.mail_id || null,
    model: b.model,
    variant: b.variant,
    colour: b.colour,
    sale_consultant: b.saleConsultant || b.sale_consultant || null,
    team_leader: b.teamLeader || b.team_leader || null,
    financier_name: b.financierName || b.financier_name || null,
    corporate: parseFloat(b.corporate || '0') || 0,
    exchange: parseFloat(b.exchange || '0') || 0,
    ex_showroom: parseFloat(b.exShowRoom || b.ex_showroom || '0') || 0,
    discount: parseFloat(b.discount || '0') || 0,
    net: parseFloat(b.net || '0') || 0,
    insurance_per: parseFloat(b.insurancePer || b.insurance_per || '0') || 0,
    insurance_amount: parseFloat(b.insuranceAmount || b.insurance_amount || '0') || 0,
    ep: parseFloat(b.ep || '0') || 0,
    rti: parseFloat(b.rti || '0') || 0,
    cm: parseFloat(b.cm || '0') || 0,
    rto_city: b.rtoCity || b.rto_city || null,
    rto_amount: parseFloat(b.rtoAmount || b.rto_amount || '0') || 0,
    hml_acc: parseFloat(b.hmlAcc || b.hml_acc || '0') || 0,
    own_acc: parseFloat(b.ownAcc || b.own_acc || '0') || 0,
    acc_discount_amount: parseFloat(b.accDiscountAmount || b.acc_discount_amount || '0') || 0,
    acc_amount: parseFloat(b.accAmount || b.acc_amount || '0') || 0,
    trc: parseFloat(b.trc || '0') || 0,
    warranty: parseFloat(b.warranty || '0') || 0,
    handling_charges: parseFloat(b.handlingCharges || b.handling_charges || '0') || 0,
    other_charges: parseFloat(b.otherCharges || b.other_charges || '0') || 0,
    fast_tag: parseFloat(b.fastTag || b.fast_tag || '500') || 500,
    tcs: parseFloat(b.tcs || '0') || 0,
    net_amount: parseFloat(b.netAmount || b.net_amount || '0') || 0,
    invoice_date: b.invoiceDate || b.invoice_date || null,
    invoice_no: b.invoiceNo || b.invoice_no || null,
    status: b.status || 'INVOICED'
  }]).select().single();

  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 400);
  }

  return c.json({ success: true, data }, 201);
});

// POST /api/v1/challans/bulk-import — Bulk upload 45-column post-challan/invoicing Excel data
challansRouter.post('/bulk-import', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const { organizationId, challanRecords } = await c.req.json();

  if (!Array.isArray(challanRecords) || challanRecords.length === 0) {
    return c.json({ success: false, error: { message: 'No challan records provided' } }, 400);
  }

  const recordsToInsert = challanRecords.map((r: any) => ({
    organization_id: organizationId,
    booking_date: r['Booking Date'] || r.bookingDate || null,
    challan_no: r['Challan No'] || r.challanNo || `CHL-${Date.now()}`,
    challan_date: r['Challan Date'] || r.challanDate || null,
    vaahan_date: r['Vaahan Date'] || r.vaahanDate || null,
    delivery_date: r['Delivery Date'] || r.deliveryDate || null,
    challan_type: r['Challan Type'] || r.challanType || 'RETAIL',
    vin_no: r['Vin No'] || r.vinNo || 'N/A',
    customer_name: r['Customer Name'] || r.customerName || 'Customer',
    address: r['Address'] || r.address || null,
    city: r['City'] || r.city || null,
    area: r['Area'] || r.area || null,
    pan_no: r['Pan No'] || r.panNo || null,
    mobile_no: r['Mobile No'] || r.mobileNo || null,
    mail_id: r['Mail Id'] || r.mailId || null,
    model: r['Model'] || r.model || 'Model',
    variant: r['Variant'] || r.variant || 'Variant',
    colour: r['Colour'] || r.colour || 'Colour',
    sale_consultant: r['Sale Consultant'] || r.saleConsultant || null,
    team_leader: r['Team Leader'] || r.teamLeader || null,
    financier_name: r['Financier Name'] || r.financierName || null,
    corporate: parseFloat(r['Corporate'] || '0') || 0,
    exchange: parseFloat(r['Exchange'] || '0') || 0,
    ex_showroom: parseFloat(r['Ex Show Room'] || '0') || 0,
    discount: parseFloat(r['Discount'] || '0') || 0,
    net: parseFloat(r['Net'] || '0') || 0,
    insurance_per: parseFloat(r['Insurance Per'] || '0') || 0,
    insurance_amount: parseFloat(r['Insurance Amount'] || '0') || 0,
    ep: parseFloat(r['Ep'] || '0') || 0,
    rti: parseFloat(r['Rti'] || '0') || 0,
    cm: parseFloat(r['Cm'] || '0') || 0,
    rto_city: r['Rto City'] || r.rtoCity || null,
    rto_amount: parseFloat(r['Rto Amount'] || '0') || 0,
    hml_acc: parseFloat(r['Hml Acc'] || '0') || 0,
    own_acc: parseFloat(r['Own Acc'] || '0') || 0,
    acc_discount_amount: parseFloat(r['Acc Discount Amount'] || '0') || 0,
    acc_amount: parseFloat(r['Acc Amount'] || '0') || 0,
    trc: parseFloat(r['Trc'] || '0') || 0,
    warranty: parseFloat(r['Warranty'] || '0') || 0,
    handling_charges: parseFloat(r['Handling Charges'] || '0') || 0,
    other_charges: parseFloat(r['Other'] || '0') || 0,
    fast_tag: parseFloat(r['Fast Tag'] || '500') || 500,
    tcs: parseFloat(r['TCS'] || '0') || 0,
    net_amount: parseFloat(r['Net Amount'] || '0') || 0,
    invoice_date: r['Invoice Date'] || r.invoiceDate || null,
    invoice_no: r['Invoice No.'] || r['Invoice No'] || r.invoiceNo || null,
    status: 'INVOICED'
  }));

  const { data, error } = await supabase.from('challan_invoices').insert(recordsToInsert).select();

  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 400);
  }

  return c.json({ success: true, data: { importedCount: data.length, records: data } });
});
