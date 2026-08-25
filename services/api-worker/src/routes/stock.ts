import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export const stockRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/stock — Get extended stock inventory with all 21 fields
stockRouter.get('/', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');

  let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false });

  if (orgId) {
    query = query.eq('organization_id', orgId);
  }
  if (search) {
    query = query.or(`vin.ilike.%${search}%,model.ilike.%${search}%,customer_name.ilike.%${search}%,fsc_code.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 500);
  }

  return c.json({ success: true, data: data || [], meta: { total: data?.length || 0 } });
});

// POST /api/v1/stock/bulk-import — Bulk upload 21-column stock inventory
stockRouter.post('/bulk-import', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const { organizationId, branchId, stockItems } = await c.req.json();

  if (!Array.isArray(stockItems) || stockItems.length === 0) {
    return c.json({ success: false, error: { message: 'No stock data provided' } }, 400);
  }

  const recordsToInsert = stockItems.map((s: any) => ({
    organization_id: organizationId,
    branch_id: branchId || '22222222-2222-2222-2222-222222222221',
    vin: s['Vin No'] || s.vin || `VIN${Date.now()}`,
    model: s['Model'] || s.model || 'Unknown Model',
    variant: s['Variant'] || s.variant || 'Standard',
    color: s['Colour'] || s.color || 'Standard Color',
    fuel_type: s['Fuel'] || s.fuelType || 'PETROL',
    fsc_code: s['FSC Code'] || s.fscCode || null,
    dealer_code: s['Dealer Code'] || s.dealerCode || null,
    plant_code: s['Plant Code'] || s.plantCode || null,
    manufacturing_year: parseInt(s['Year'] || s.manufacturingYear || '2026') || 2026,
    quantity: parseInt(s['Quantity'] || s.quantity || '1') || 1,
    location: s['Location'] || s.location || null,
    customer_name: s['Customer Name'] || s.customerName || null,
    sales_consultant: s['Sales Consultant'] || s.salesConsultant || null,
    accessories_amount: parseFloat(s['Accessories Amount'] || s.accessoriesAmount || '0') || 0,
    status: s['Vehicle Status'] || s['Status'] || s.status || 'RECEIVED',
    delivery_date: s['Delivery Date'] || s.deliveryDate || null,
    allocation_date: s['Allocation Date'] || s.allocationDate || null,
    allocated_days: parseInt(s['Allocated Days'] || s.allocatedDays || '0') || 0,
    received_amount: parseFloat(s['Received Amount'] || s.receivedAmount || '0') || 0,
    purchase_date: s['Purchase Date'] || s.purchaseDate || null
  }));

  const { data, error } = await supabase.from('vehicles').upsert(recordsToInsert, { onConflict: 'vin' }).select();

  if (error) {
    return c.json({ success: false, error: { message: error.message } }, 400);
  }

  return c.json({ success: true, data: { importedCount: data.length, records: data } });
});