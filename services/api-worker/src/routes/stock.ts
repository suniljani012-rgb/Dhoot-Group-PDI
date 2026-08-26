import { Env } from '../index';
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

export const stockRouter = new Hono<{ Bindings: Env; Variables: any }>();

const TATA_ORG_ID = '11111111-1111-1111-1111-111111111111';
const HYUNDAI_ORG_ID = '11111111-1111-1111-1111-111111111112';

// 30 Comprehensive Dealership Stock Vehicles across all Tata & Hyundai models
let localVehiclesStore: any[] = [
  // Tata Motors Stock
  { id: "v-1", vin: "MAT612345S9988771", brand: "Tata Motors", model: "Tata Safari", variant: "Accomplished Plus 6S AT", color: "Oberon Black", fuel_type: "DIESEL", status: "ALLOCATED", customer_name: "Ramesh Chandra Sharma", sales_consultant: "Sunil Sharma", location: "Basni Yard • Bay 2", engine_number: "ENG-SAF-9901", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-20T10:00:00Z" },
  { id: "v-2", vin: "MAT612345H7654322", brand: "Tata Motors", model: "Tata Harrier", variant: "Fearless Plus Dark 6MT", color: "Oberon Black", fuel_type: "DIESEL", status: "PDI_APPROVED", sales_consultant: "Rajesh Nair", location: "Basni Yard • Bay 1", engine_number: "ENG-HAR-7652", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-21T11:30:00Z" },
  { id: "v-3", vin: "MAT612345N1234563", brand: "Tata Motors", model: "Tata Nexon", variant: "Fearless Plus S DT", color: "Daytona Grey", fuel_type: "PETROL", status: "IN_REPAIR", sales_consultant: "Amit Verma", location: "Shantinath Yard • Workshop 1", engine_number: "ENG-NEX-1233", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-21T14:15:00Z" },
  { id: "v-4", vin: "MAT612345C5566774", brand: "Tata Motors", model: "Tata Curvv.ev", variant: "Accomplished Plus 55", color: "Empowered Oxide", fuel_type: "EV", status: "PDI_IN_PROGRESS", sales_consultant: "Sunil Sharma", location: "Basni Yard • Inspection Bay", engine_number: "MOT-CRV-5564", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-22T09:00:00Z" },
  { id: "v-5", vin: "MAT612345P4455665", brand: "Tata Motors", model: "Tata Punch", variant: "Creative DT AMT", color: "Calypso Red", fuel_type: "PETROL", status: "YARD_RECEIVING_PENDING", sales_consultant: "Pooja Patil", location: "Carrier Trailer RJ-19-TR-4421", engine_number: "ENG-PUN-4455", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-25T08:00:00Z" },
  { id: "v-6", vin: "MAT612345A3344556", brand: "Tata Motors", model: "Tata Altroz", variant: "Racer R3 Turbo", color: "Atomic Orange", fuel_type: "PETROL", status: "PDI_PENDING", sales_consultant: "Vikram Joshi", location: "Pali Yard • Bay 3", engine_number: "ENG-ALT-3346", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-23T16:45:00Z" },
  { id: "v-7", vin: "MAT612345T2233447", brand: "Tata Motors", model: "Tata Tiago", variant: "XZ+ Dual Tone", color: "Tornado Blue", fuel_type: "PETROL", status: "ALLOCATED", customer_name: "Priya Kulkarni", sales_consultant: "Rajesh Nair", location: "Basni Yard • Bay 2", engine_number: "ENG-TIA-2237", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-22T12:00:00Z" },
  { id: "v-8", vin: "MAT612345S8877668", brand: "Tata Motors", model: "Tata Safari", variant: "Adventure Plus AT", color: "Cosmic Gold", fuel_type: "DIESEL", status: "DELIVERED", customer_name: "Vikramaditya Singhania", sales_consultant: "Sunil Sharma", location: "Bhagat Ki Kothi Showroom", engine_number: "ENG-SAF-8878", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-18T10:00:00Z" },
  { id: "v-9", vin: "MAT612345H9988119", brand: "Tata Motors", model: "Tata Harrier", variant: "Adventure Plus", color: "Daytona Grey", fuel_type: "DIESEL", status: "PDI_APPROVED", sales_consultant: "Pooja Patil", location: "Basni Yard • Bay 1", engine_number: "ENG-HAR-9989", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-23T11:00:00Z" },
  { id: "v-10", vin: "MAT612345N8877220", brand: "Tata Motors", model: "Tata Nexon", variant: "Pure Plus S", color: "Calypso Red", fuel_type: "DIESEL", status: "YARD_RECEIVING_PENDING", sales_consultant: "Amit Verma", location: "Carrier Trailer RJ-19-TR-8812", engine_number: "ENG-NEX-8870", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-25T07:30:00Z" },
  { id: "v-11", vin: "MAT612345N7766551", brand: "Tata Motors", model: "Tata Nexon", variant: "Creative Plus DT", color: "Daytona Grey", fuel_type: "PETROL", status: "RECEIVED", location: "Basni Yard • Bay 4", engine_number: "ENG-NEX-7761", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-24T10:00:00Z" },
  { id: "v-12", vin: "MAT612345P3322112", brand: "Tata Motors", model: "Tata Punch", variant: "Accomplished Dazzle", color: "Tropical Mist", fuel_type: "PETROL", status: "PDI_APPROVED", location: "Sumerpur Yard", engine_number: "ENG-PUN-3322", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-23T09:00:00Z" },
  { id: "v-13", vin: "MAT612345T1100993", brand: "Tata Motors", model: "Tata Tigor", variant: "XZ+ Leatherette Pack", color: "Opal White", fuel_type: "CNG", status: "RECEIVED", location: "Barmer Yard", engine_number: "ENG-TIG-1100", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-24T11:00:00Z" },
  { id: "v-14", vin: "MAT612345C4433224", brand: "Tata Motors", model: "Tata Curvv", variant: "Accomplished Plus A 1.2 TGDi", color: "Flame Red", fuel_type: "PETROL", status: "PDI_PENDING", location: "New Yard • Bay 1", engine_number: "ENG-CRV-4433", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-25T13:00:00Z" },
  { id: "v-15", vin: "MAT612345A9988775", brand: "Tata Motors", model: "Tata Altroz", variant: "XZ+ OS DCA", color: "Downtown Red", fuel_type: "PETROL", status: "PDI_APPROVED", location: "Balotra Yard", engine_number: "ENG-ALT-9988", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-22T15:00:00Z" },

  // Hyundai Stock
  { id: "v-16", vin: "MALC12345C1122331", brand: "Hyundai", model: "Hyundai Creta", variant: "SX (O) Turbo DCT", color: "Ranger Khaki", fuel_type: "TURBO", status: "ALLOCATED", customer_name: "Rajesh Kumar Verma", sales_consultant: "Manish Rathore", location: "Shantinath Yard • Bay 1", engine_number: "ENG-CRT-1121", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-20T15:00:00Z" },
  { id: "v-17", vin: "MALC12345V2233442", brand: "Hyundai", model: "Hyundai Venue", variant: "N Line N8 DCT", color: "Thunder Blue", fuel_type: "TURBO", status: "PDI_APPROVED", sales_consultant: "Suresh Sharma", location: "Shantinath Yard • Bay 2", engine_number: "ENG-VEN-2232", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-21T16:00:00Z" },
  { id: "v-18", vin: "MALC12345V3344553", brand: "Hyundai", model: "Hyundai Verna", variant: "SX (O) Turbo 7DCT", color: "Abyss Black", fuel_type: "TURBO", status: "IN_REPAIR", sales_consultant: "Karan Joshi", location: "Shantinath Yard • Workshop 2", engine_number: "ENG-VRN-3343", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-22T13:30:00Z" },
  { id: "v-19", vin: "MALC12345I4455664", brand: "Hyundai", model: "Hyundai Ioniq 5", variant: "RWD Long Range 72.6kWh", color: "Gravity Gold Matte", fuel_type: "EV", status: "PDI_IN_PROGRESS", sales_consultant: "Manish Rathore", location: "Pratap Nagar Showroom", engine_number: "MOT-ION-4454", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T10:15:00Z" },
  { id: "v-20", vin: "MALC12345E5566775", brand: "Hyundai", model: "Hyundai Exter", variant: "SX (O) Connect AMT", color: "Cosmic Blue", fuel_type: "PETROL", status: "PDI_PENDING", sales_consultant: "Suresh Sharma", location: "Balotra Yard", engine_number: "ENG-EXT-5565", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-24T09:45:00Z" },
  { id: "v-21", vin: "MALC12345I6677886", brand: "Hyundai", model: "Hyundai i20", variant: "Asta (O) IVT", color: "Starry Night", fuel_type: "PETROL", status: "ALLOCATED", customer_name: "Anita Desai", sales_consultant: "Karan Joshi", location: "Bilara Yard", engine_number: "ENG-I20-6676", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-22T11:15:00Z" },
  { id: "v-22", vin: "MALC12345T7788997", brand: "Hyundai", model: "Hyundai Tucson", variant: "Signature 2.0L Diesel AWD", color: "Titan Grey", fuel_type: "DIESEL", status: "PDI_APPROVED", sales_consultant: "Manish Rathore", location: "Shantinath Yard • Bay 1", engine_number: "ENG-TUC-7787", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-21T08:45:00Z" },
  { id: "v-23", vin: "MALC12345C8899008", brand: "Hyundai", model: "Hyundai Creta", variant: "Knight Edition S(O)", color: "Abyss Black", fuel_type: "DIESEL", status: "YARD_RECEIVING_PENDING", sales_consultant: "Suresh Sharma", location: "Carrier Trailer RJ-19-TR-1109", engine_number: "ENG-CRT-8898", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T06:00:00Z" },
  { id: "v-24", vin: "MALC12345V9900119", brand: "Hyundai", model: "Hyundai Venue", variant: "SX 1.5 CRDi Diesel", color: "Atlas White", fuel_type: "DIESEL", status: "PDI_PENDING", sales_consultant: "Karan Joshi", location: "Pipar Yard", engine_number: "ENG-VEN-9909", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-24T14:30:00Z" },
  { id: "v-25", vin: "MALC12345V0011220", brand: "Hyundai", model: "Hyundai Verna", variant: "SX 1.5 MPI IVT", color: "Fiery Red", fuel_type: "PETROL", status: "ALLOCATED", customer_name: "Sunil Gupta", sales_consultant: "Manish Rathore", location: "Shantinath Yard • Bay 3", engine_number: "ENG-VRN-0010", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-22T17:00:00Z" },
  { id: "v-26", vin: "MALC12345A1122331", brand: "Hyundai", model: "Hyundai Alcazar", variant: "Signature 6S Diesel AT", color: "Robust Emerald Matte", fuel_type: "DIESEL", status: "PDI_APPROVED", location: "Shantinath Yard • Bay 4", engine_number: "ENG-ALC-1122", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T14:00:00Z" },
  { id: "v-27", vin: "MALC12345A2233442", brand: "Hyundai", model: "Hyundai Aura", variant: "SX Plus 1.2 AMT", color: "Typhoon Silver", fuel_type: "PETROL", status: "RECEIVED", location: "Jaisalmer Yard", engine_number: "ENG-AUR-2233", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-24T15:00:00Z" },
  { id: "v-28", vin: "MALC12345G3344553", brand: "Hyundai", model: "Hyundai Grand i10 Nios", variant: "Asta 1.2 Kappa AMT", color: "Aqua Teal", fuel_type: "PETROL", status: "PDI_APPROVED", location: "Balotra Yard", engine_number: "ENG-NIO-3344", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T11:00:00Z" },
  { id: "v-29", vin: "MALC12345C4455664", brand: "Hyundai", model: "Hyundai Creta", variant: "SX Tech 1.5 Petrol IVT", color: "Atlas White", fuel_type: "PETROL", status: "RECEIVED", location: "Shantinath Yard • Bay 2", engine_number: "ENG-CRT-4455", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T10:00:00Z" },
  { id: "v-30", vin: "MALC12345E6677885", brand: "Hyundai", model: "Hyundai Exter", variant: "SX Knight Edition", color: "Shadow Grey", fuel_type: "PETROL", status: "RECEIVED", location: "Bilara Yard", engine_number: "ENG-EXT-6677", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T11:30:00Z" }
];

// GET /api/v1/stock — Get extended stock inventory with all fields
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
      const mergedMap = new Map();
      localVehiclesStore.forEach(v => mergedMap.set(v.vin, v));
      dbData.forEach((v: any) => mergedMap.set(v.vin, v));
      results = Array.from(mergedMap.values());
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

// PATCH /api/v1/stock/:vin — Update vehicle status / allocation
stockRouter.patch('/:vin', async (c) => {
  const vin = c.req.param('vin');
  const body = await c.req.json();

  let updatedRecord = null;
  localVehiclesStore = localVehiclesStore.map(v => {
    if (v.vin === vin || v.id === vin) {
      updatedRecord = { ...v, ...body, updated_at: new Date().toISOString() };
      return updatedRecord;
    }
    return v;
  });

  if (!updatedRecord) {
    return c.json({ success: false, error: { message: 'Vehicle VIN not found' } }, 404);
  }

  return c.json({ success: true, data: updatedRecord });
});

// POST /api/v1/stock/bulk-import — Bulk upload stock inventory
stockRouter.post('/bulk-import', async (c) => {
  const body = await c.req.json();
  const vehicles = body.vehicles || [];

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return c.json({ success: false, error: { message: 'Invalid or empty vehicles list' } }, 400);
  }

  localVehiclesStore = [...vehicles, ...localVehiclesStore];

  return c.json({
    success: true,
    data: {
      imported_count: vehicles.length,
      total_count: localVehiclesStore.length,
    }
  }, 201);
});
