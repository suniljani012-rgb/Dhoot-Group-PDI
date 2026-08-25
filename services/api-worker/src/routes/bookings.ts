import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export const bookingsRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/bookings — List bookings with multi-brand isolation, search, & pagination
bookingsRouter.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const status = c.req.query('status');

  let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

  if (orgId) {
    query = query.eq('organization_id', orgId);
  }
  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,receipt_no.ilike.%${search}%,allocated_vin_no.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 500);
  }

  return c.json({
    success: true,
    data: data || [],
    meta: { total: data?.length || 0, requestId: c.get('correlationId') }
  });
});

// POST /api/v1/bookings — Create single booking
bookingsRouter.post('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const body = await c.req.json();

  const { data, error } = await supabase.from('bookings').insert([{
    organization_id: body.organizationId || body.organization_id,
    branch_id: body.branchId || body.branch_id || null,
    receipt_date: body.receiptDate || body.receipt_date || null,
    receipt_no: body.receiptNo || body.receipt_no,
    customer_name: body.customerName || body.customer_name,
    mobile_number: body.mobileNumber || body.mobile_number,
    sales_consultant: body.salesConsultant || body.sales_consultant || null,
    team_leader: body.teamLeader || body.team_leader || null,
    model: body.model,
    variant: body.variant,
    colour: body.colour,
    booking_date: body.bookingDate || body.booking_date || null,
    booking_model: body.bookingModel || body.booking_model || null,
    booking_variant: body.bookingVariant || body.booking_variant || null,
    booking_colour: body.bookingColour || body.booking_colour || null,
    booking_approval_date: body.bookingApprovalDate || body.booking_approval_date || null,
    promise_delivery_date: body.promiseDeliveryDate || body.promise_delivery_date || null,
    allocation_date: body.allocationDate || body.allocation_date || null,
    allocated_model: body.allocatedModel || body.allocated_model || null,
    allocated_variant: body.allocatedVariant || body.allocated_variant || null,
    allocated_colour: body.allocatedColour || body.allocated_colour || null,
    allocated_vin_no: body.allocatedVinNo || body.allocated_vin_no || null,
    requisition_slip: body.requisitionSlip || body.requisition_slip || null,
    requisition_date: body.requisitionDate || body.requisition_date || null,
    issue_no: body.issueNo || body.issue_no || null,
    issue_date: body.issueDate || body.issue_date || null,
    prechallan_date: body.prechallanDate || body.prechallan_date || null,
    prechallan_no: body.prechallanNo || body.prechallan_no || null,
    challan_approval_date: body.challanApprovalDate || body.challan_approval_date || null,
    insurance_date: body.insuranceDate || body.insurance_date || null,
    after_insurance_date: body.afterInsuranceDate || body.after_insurance_date || null,
    cancel_date: body.cancelDate || body.cancel_date || null,
    reason: body.reason || null,
    receipt_amt: body.receiptAmt || body.receipt_amt || 0,
    docket_no: body.docketNo || body.docket_no || null,
    pan_no: body.panNo || body.pan_no || null,
    status: body.status || 'BOOKED'
  }]).select().single();

  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 400);
  }

  return c.json({ success: true, data }, 201);
});

// POST /api/v1/bookings/bulk-import — Bulk upload Excel / CSV data
bookingsRouter.post('/bulk-import', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const { organizationId, bookings } = await c.req.json();

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return c.json({ success: false, error: { message: 'No bookings data provided' } }, 400);
  }

  const recordsToInsert = bookings.map((b: any) => ({
    organization_id: organizationId,
    receipt_date: b['Receipt Date'] || b.receiptDate || null,
    receipt_no: b['Receipt No'] || b.receiptNo || `RCT-${Date.now()}`,
    customer_name: b['Customer Name'] || b.customerName || 'Unknown Customer',
    mobile_number: b['Mobile Number'] || b.mobileNumber || 'N/A',
    sales_consultant: b['Sales Consultant'] || b.salesConsultant || null,
    team_leader: b['Team Leader'] || b.teamLeader || null,
    model: b['Model'] || b.model || 'N/A',
    variant: b['Variant'] || b.variant || 'N/A',
    colour: b['Colour'] || b.colour || 'N/A',
    booking_date: b['Booking Date'] || b.bookingDate || null,
    booking_model: b['Booking Model'] || b.bookingModel || null,
    booking_variant: b['Booking Variant'] || b.bookingVariant || null,
    booking_colour: b['Booking Colour'] || b.bookingColour || null,
    booking_approval_date: b['Booking Approval Date'] || b.bookingApprovalDate || null,
    promise_delivery_date: b['Promise Delivery Date'] || b.promiseDeliveryDate || null,
    allocation_date: b['Allocation Date'] || b.allocationDate || null,
    allocated_model: b['Allocated Model'] || b.allocatedModel || null,
    allocated_variant: b['Allocated Variant'] || b.allocatedVariant || null,
    allocated_colour: b['Allocated Colour'] || b.allocatedColour || null,
    allocated_vin_no: b['Allocated Vin No'] || b.allocatedVinNo || null,
    requisition_slip: b['Requsition Slip'] || b.requisitionSlip || null,
    requisition_date: b['Requsition Date'] || b.requisitionDate || null,
    issue_no: b['Issue No'] || b.issueNo || null,
    issue_date: b['Issue Date'] || b.issueDate || null,
    prechallan_date: b['Prechallan Date'] || b.prechallanDate || null,
    prechallan_no: b['Prechallan No'] || b.prechallanNo || null,
    challan_approval_date: b['Challan Approval Date'] || b.challanApprovalDate || null,
    insurance_date: b['Insurance Date'] || b.insuranceDate || null,
    after_insurance_date: b['After Insurance Date'] || b.afterInsuranceDate || null,
    cancel_date: b['Cancel Date'] || b.cancelDate || null,
    reason: b['Reason'] || b.reason || null,
    receipt_amt: parseFloat(b['Receipt Amt.'] || b.receiptAmt || '0') || 0,
    docket_no: b['Docket No.'] || b.docketNo || null,
    pan_no: b['Pan No.'] || b.panNo || null,
    status: b['Allocated Vin No'] ? 'ALLOCATED' : 'BOOKED'
  }));

  const { data, error } = await supabase.from('bookings').insert(recordsToInsert).select();

  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 400);
  }

  return c.json({
    success: true,
    data: { importedCount: data.length, records: data }
  });
});