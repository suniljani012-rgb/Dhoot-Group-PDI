import { Env } from '../index';
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

export const stockRouter = new Hono<{ Bindings: Env; Variables: any }>();

const TATA_ORG_ID = '11111111-1111-1111-1111-111111111111';
const HYUNDAI_ORG_ID = '11111111-1111-1111-1111-111111111112';

let localVehiclesStore: any[] = [
  {
    id: "v-tat-1",
    vin: "MAT612345N1234567",
    chassis_number: "CH-NXN-9021",
    engine_number: "ENG-NXN-4412",
    brand: "Tata Motors",
    model: "Tata Nexon",
    variant: "Fearless Plus S DT",
    color: "Daytona Grey",
    fuel_type: "PETROL",
    transmission: "DCA",
    manufacturing_year: 2026,
    status: "ALLOCATED",
    vehicle_status: "ALLOCATED",
    location: "Basni Yard • Bay 1",
    customer_name: "Rajesh Sharma",
    sales_consultant: "Vikram Malhotra",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-20T10:00:00Z"
  },
  {
    id: "v-tat-2",
    vin: "MAT612345H7654321",
    chassis_number: "CH-HAR-1082",
    engine_number: "ENG-KRY-8819",
    brand: "Tata Motors",
    model: "Tata Harrier",
    variant: "Fearless Plus Dark",
    color: "Oberon Black",
    fuel_type: "DIESEL",
    transmission: "AUTOMATIC",
    manufacturing_year: 2026,
    status: "ALLOCATED",
    vehicle_status: "ALLOCATED",
    location: "Basni Yard • Bay 2",
    customer_name: "Priya Patel",
    sales_consultant: "Vikram Malhotra",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-21T11:00:00Z"
  },
  {
    id: "v-hyn-1",
    vin: "MALC12345C1122334",
    chassis_number: "CH-CRT-1121",
    engine_number: "ENG-CRT-1121",
    brand: "Hyundai",
    model: "Hyundai Creta",
    variant: "SX(O) Turbo 1.5 DCT",
    color: "Ranger Khaki",
    fuel_type: "TURBO",
    transmission: "DCT",
    manufacturing_year: 2026,
    status: "ALLOCATED",
    vehicle_status: "ALLOCATED",
    location: "Shantinath Yard • Bay 1",
    customer_name: "Amit Singh",
    sales_consultant: "Ramesh Choudhary",
    organization_id: HYUNDAI_ORG_ID,
    created_at: "2026-08-22T14:00:00Z"
  },
  {
    id: "v-hyn-2",
    vin: "MALC12345V5566778",
    chassis_number: "CH-VEN-2232",
    engine_number: "ENG-VEN-2232",
    brand: "Hyundai",
    model: "Hyundai Venue",
    variant: "N Line N8 DCT",
    color: "Atlas White / Abyss Black",
    fuel_type: "TURBO",
    transmission: "DCT",
    manufacturing_year: 2026,
    status: "ALLOCATED",
    vehicle_status: "ALLOCATED",
    location: "Shantinath Yard • Bay 2",
    customer_name: "Neha Verma",
    sales_consultant: "Ramesh Choudhary",
    organization_id: HYUNDAI_ORG_ID,
    created_at: "2026-08-23T16:00:00Z"
  }
];

// GET /api/v1/stock
stockRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');

  let results = [...localVehiclesStore];

  try {
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_ANON_KEY);
    let query = supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (orgId && orgId !== 'ALL') {
      query = query.eq('organization_id', orgId);
    }
    const { data: dbData, error } = await query;
    if (!error && dbData && Array.isArray(dbData) && dbData.length > 0) {
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
