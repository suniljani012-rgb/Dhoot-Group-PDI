import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export const challansRouter = new Hono<{ Bindings: Env; Variables: any }>();

const TATA_ORG_ID = '11111111-1111-1111-1111-111111111111';
const HYUNDAI_ORG_ID = '11111111-1111-1111-1111-111111111112';

let localChallansStore: any[] = [
  {
    id: "chl-1",
    booking_date: "20-Aug-2026",
    challan_no: "CHL-2026-0801",
    challan_date: "25-Aug-2026",
    delivery_date: "28-Aug-2026",
    challan_type: "TAX_INVOICE_DELIVERY",
    vin_no: "MAT612345S8877668",
    customer_name: "Vikramaditya Singhania",
    mobile: "+91 98293 22334",
    city: "Jodhpur",
    model: "Tata Safari",
    variant: "Adventure Plus AT",
    colour: "Cosmic Gold",
    sale_consultant: "Sunil Sharma",
    team_leader: "Rajesh Nair",
    financier_name: "HDFC Bank Ltd",
    corporate: "No",
    exchange: "Yes",
    ex_showroom: 2450000,
    discount: 25000,
    net: 2425000,
    insurance_per: 3.5,
    insurance_amount: 68000,
    ep: 4500,
    rti: 2500,
    cm: 1000,
    rto_city: "Jodhpur",
    rto_amount: 245000,
    hml_acc: 10000,
    own_acc: 5000,
    acc_discount_amount: 0,
    acc_amount: 15000,
    trc: 500,
    warranty: 12000,
    handling_charges: 2500,
    other: 0,
    fast_tag: 500,
    tcs: 24250,
    net_amount: 2797750,
    invoice_date: "25-Aug-2026",
    invoice_no: "INV-2026-TAT-0091",
    status: "DELIVERED",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-25T10:00:00Z"
  },
  {
    id: "chl-2",
    booking_date: "21-Aug-2026",
    challan_no: "CHL-2026-0802",
    challan_date: "25-Aug-2026",
    delivery_date: "28-Aug-2026",
    challan_type: "TAX_INVOICE_DELIVERY",
    vin_no: "MAT612345T2233447",
    customer_name: "Priya Kulkarni",
    mobile: "+91 98220 33445",
    city: "Jodhpur",
    model: "Tata Tiago",
    variant: "XZ+ Dual Tone",
    colour: "Tornado Blue",
    sale_consultant: "Rajesh Nair",
    team_leader: "Sanjay Patil",
    financier_name: "ICICI Bank Ltd",
    corporate: "Yes",
    exchange: "No",
    ex_showroom: 780000,
    discount: 10000,
    net: 770000,
    insurance_per: 3.2,
    insurance_amount: 24000,
    ep: 2500,
    rti: 1500,
    cm: 500,
    rto_city: "Jodhpur",
    rto_amount: 78000,
    hml_acc: 5000,
    own_acc: 2000,
    acc_discount_amount: 0,
    acc_amount: 7000,
    trc: 500,
    warranty: 8000,
    handling_charges: 1500,
    other: 0,
    fast_tag: 500,
    tcs: 7700,
    net_amount: 893200,
    invoice_date: "25-Aug-2026",
    invoice_no: "INV-2026-TAT-0092",
    status: "INVOICED",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-25T11:00:00Z"
  },
  {
    id: "chl-3",
    booking_date: "20-Aug-2026",
    challan_no: "CHL-2026-0803",
    challan_date: "24-Aug-2026",
    delivery_date: "29-Aug-2026",
    challan_type: "GATE_PASS",
    vin_no: "MALC12345C1122331",
    customer_name: "Rajesh Kumar Verma",
    mobile: "+91 94140 55667",
    city: "Jodhpur",
    model: "Hyundai Creta",
    variant: "SX (O) Turbo DCT",
    colour: "Ranger Khaki",
    sale_consultant: "Manish Rathore",
    team_leader: "Suresh Sharma",
    financier_name: "State Bank of India",
    corporate: "No",
    exchange: "No",
    ex_showroom: 1980000,
    discount: 15000,
    net: 1965000,
    insurance_per: 3.2,
    insurance_amount: 52000,
    ep: 3500,
    rti: 2000,
    cm: 800,
    rto_city: "Jodhpur",
    rto_amount: 198000,
    hml_acc: 8000,
    own_acc: 4000,
    acc_discount_amount: 0,
    acc_amount: 12000,
    trc: 500,
    warranty: 10000,
    handling_charges: 2000,
    other: 0,
    fast_tag: 500,
    tcs: 19650,
    net_amount: 2261650,
    invoice_date: "24-Aug-2026",
    invoice_no: "INV-2026-HYN-0045",
    status: "INVOICED",
    organization_id: HYUNDAI_ORG_ID,
    created_at: "2026-08-24T15:00:00Z"
  },
  {
    id: "chl-4",
    booking_date: "22-Aug-2026",
    challan_no: "CHL-2026-0804",
    challan_date: "25-Aug-2026",
    delivery_date: "31-Aug-2026",
    challan_type: "TAX_INVOICE_DELIVERY",
    vin_no: "MALC12345I6677886",
    customer_name: "Anita Desai",
    mobile: "+91 98291 77889",
    city: "Jodhpur",
    model: "Hyundai i20",
    variant: "Asta (O) IVT",
    colour: "Starry Night",
    sale_consultant: "Karan Joshi",
    team_leader: "Manish Rathore",
    financier_name: "Kotak Mahindra Bank",
    corporate: "No",
    exchange: "Yes",
    ex_showroom: 1120000,
    discount: 12000,
    net: 1108000,
    insurance_per: 3.1,
    insurance_amount: 32000,
    ep: 2500,
    rti: 1800,
    cm: 600,
    rto_city: "Jodhpur",
    rto_amount: 112000,
    hml_acc: 6000,
    own_acc: 3000,
    acc_discount_amount: 0,
    acc_amount: 9000,
    trc: 500,
    warranty: 9000,
    handling_charges: 1800,
    other: 0,
    fast_tag: 500,
    tcs: 11080,
    net_amount: 1286280,
    invoice_date: "25-Aug-2026",
    invoice_no: "INV-2026-HYN-0046",
    status: "DELIVERY_READY",
    organization_id: HYUNDAI_ORG_ID,
    created_at: "2026-08-25T14:00:00Z"
  }
];

// GET /api/v1/challans
challansRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');
  const status = c.req.query('status');

  let results = [...localChallansStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    let query = supabase.from('challan_invoices').select('*').order('created_at', { ascending: false });
    if (orgId && orgId !== 'ALL') {
      query = query.eq('organization_id', orgId);
    }
    const { data: dbData, error } = await query;
    if (!error && dbData && Array.isArray(dbData) && dbData.length > 0) {
      const mergedMap = new Map();
      localChallansStore.forEach(c => mergedMap.set(c.id || c.challan_no, c));
      dbData.forEach((c: any) => mergedMap.set(c.id || c.challan_no, c));
      results = Array.from(mergedMap.values());
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
