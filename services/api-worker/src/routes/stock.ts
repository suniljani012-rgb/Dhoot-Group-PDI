import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export const stockRouter = new Hono<{ Bindings: Env }>();

const TATA_ORG_ID = '11111111-1111-1111-1111-111111111111';
const HYUNDAI_ORG_ID = '11111111-1111-1111-1111-111111111112';

// 20 Realistic Dealership Stock Vehicles (Tata + Hyundai Mix)
let localVehiclesStore: any[] = [
  { id: "v-1", vin: "MAT612345S9988771", brand: "Autoprime Tata", model: "Tata Safari", variant: "Accomplished Plus 6S AT", color: "Oberon Black", fuel_type: "DIESEL", status: "ALLOCATED", customer_name: "Ramesh Chandra Sharma", sales_consultant: "Sunil Sharma", location: "Pune Yard • Bay 2", engine_number: "ENG-SAF-9901", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-20T10:00:00Z" },
  { id: "v-2", vin: "MAT612345H7654322", brand: "Autoprime Tata", model: "Tata Harrier", variant: "Fearless Plus Dark 6MT", color: "Oberon Black", fuel_type: "DIESEL", status: "PDI_APPROVED", sales_consultant: "Rajesh Nair", location: "Pune Yard • Bay 1", engine_number: "ENG-HAR-7652", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-21T11:30:00Z" },
  { id: "v-3", vin: "MAT612345N1234563", brand: "Autoprime Tata", model: "Tata Nexon", variant: "Fearless Plus S DT", color: "Daytona Grey", fuel_type: "PETROL", status: "IN_REPAIR", sales_consultant: "Amit Verma", location: "Workshop Bay 1", engine_number: "ENG-NEX-1233", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-21T14:15:00Z" },
  { id: "v-4", vin: "MAT612345C5566774", brand: "Autoprime Tata", model: "Tata Curvv.ev", variant: "Accomplished Plus 55", color: "Empowered Oxide", fuel_type: "EV", status: "PDI_IN_PROGRESS", sales_consultant: "Sunil Sharma", location: "Inspection Staging Bay 1", engine_number: "MOT-CRV-5564", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-22T09:00:00Z" },
  { id: "v-5", vin: "MAT612345P4455665", brand: "Autoprime Tata", model: "Tata Punch", variant: "Creative DT AMT", color: "Calypso Red", fuel_type: "PETROL", status: "YARD_RECEIVING_PENDING", sales_consultant: "Pooja Patil", location: "Carrier Trailer MH-12-TR-4421", engine_number: "ENG-PUN-4455", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-25T08:00:00Z" },
  { id: "v-6", vin: "MAT612345A3344556", brand: "Autoprime Tata", model: "Tata Altroz", variant: "Racer R3 Turbo", color: "Atomic Orange", fuel_type: "PETROL", status: "PDI_PENDING", sales_consultant: "Vikram Joshi", location: "Pune Yard • Bay 3", engine_number: "ENG-ALT-3346", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-23T16:45:00Z" },
  { id: "v-7", vin: "MAT612345T2233447", brand: "Autoprime Tata", model: "Tata Tiago", variant: "XZ+ Dual Tone", color: "Tornado Blue", fuel_type: "PETROL", status: "ALLOCATED", customer_name: "Priya Kulkarni", sales_consultant: "Rajesh Nair", location: "Pune Yard • Bay 2", engine_number: "ENG-TIA-2237", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-22T12:00:00Z" },
  { id: "v-8", vin: "MAT612345S8877668", brand: "Autoprime Tata", model: "Tata Safari", variant: "Adventure Plus AT", color: "Cosmic Gold", fuel_type: "DIESEL", status: "DELIVERED", customer_name: "Vikramaditya Singhania", sales_consultant: "Sunil Sharma", location: "Customer Handover Area", engine_number: "ENG-SAF-8878", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-18T10:00:00Z" },
  { id: "v-9", vin: "MAT612345H9988119", brand: "Autoprime Tata", model: "Tata Harrier", variant: "Adventure Plus", color: "Daytona Grey", fuel_type: "DIESEL", status: "PDI_APPROVED", sales_consultant: "Pooja Patil", location: "Pune Yard • Bay 1", engine_number: "ENG-HAR-9989", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-23T11:00:00Z" },
  { id: "v-10", vin: "MAT612345N8877220", brand: "Autoprime Tata", model: "Tata Nexon", variant: "Pure Plus S", color: "Calypso Red", fuel_type: "DIESEL", status: "YARD_RECEIVING_PENDING", sales_consultant: "Amit Verma", location: "Carrier Trailer GJ-01-TR-8812", engine_number: "ENG-NEX-8870", manufacturing_year: 2026, organization_id: TATA_ORG_ID, created_at: "2026-08-25T07:30:00Z" },
  { id: "v-11", vin: "MALC12345C1122331", brand: "Raja Hyundai", model: "Hyundai Creta", variant: "SX (O) Turbo DCT", color: "Ranger Khaki", fuel_type: "TURBO", status: "ALLOCATED", customer_name: "Rajesh Kumar Verma", sales_consultant: "Manish Rathore", location: "Jaipur Yard • Bay 1", engine_number: "ENG-CRT-1121", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-20T15:00:00Z" },
  { id: "v-12", vin: "MALC12345V2233442", brand: "Raja Hyundai", model: "Hyundai Venue", variant: "N Line N8 DCT", color: "Thunder Blue", fuel_type: "TURBO", status: "PDI_APPROVED", sales_consultant: "Suresh Sharma", location: "Jaipur Yard • Bay 2", engine_number: "ENG-VEN-2232", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-21T16:00:00Z" },
  { id: "v-13", vin: "MALC12345V3344553", brand: "Raja Hyundai", model: "Hyundai Verna", variant: "SX (O) Turbo 7DCT", color: "Abyss Black", fuel_type: "TURBO", status: "IN_REPAIR", sales_consultant: "Karan Joshi", location: "Workshop Bay 2", engine_number: "ENG-VRN-3343", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-22T13:30:00Z" },
  { id: "v-14", vin: "MALC12345I4455664", brand: "Raja Hyundai", model: "Hyundai Ioniq 5", variant: "RWD Long Range 72.6kWh", color: "Gravity Gold Matte", fuel_type: "EV", status: "PDI_IN_PROGRESS", sales_consultant: "Manish Rathore", location: "Inspection Staging Bay 2", engine_number: "MOT-ION-4454", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T10:15:00Z" },
  { id: "v-15", vin: "MALC12345E5566775", brand: "Raja Hyundai", model: "Hyundai Exter", variant: "SX (O) Connect AMT", color: "Cosmic Blue", fuel_type: "PETROL", status: "PDI_PENDING", sales_consultant: "Suresh Sharma", location: "Jaipur Yard • Bay 3", engine_number: "ENG-EXT-5565", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-24T09:45:00Z" },
  { id: "v-16", vin: "MALC12345I6677886", brand: "Raja Hyundai", model: "Hyundai i20", variant: "Asta (O) IVT", color: "Starry Night", fuel_type: "PETROL", status: "ALLOCATED", customer_name: "Anita Desai", sales_consultant: "Karan Joshi", location: "Jaipur Yard • Bay 2", engine_number: "ENG-I20-6676", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-22T11:15:00Z" },
  { id: "v-17", vin: "MALC12345T7788997", brand: "Raja Hyundai", model: "Hyundai Tucson", variant: "Signature 2.0L Diesel AWD", color: "Titan Grey", fuel_type: "DIESEL", status: "PDI_APPROVED", sales_consultant: "Manish Rathore", location: "Jaipur Yard • Bay 1", engine_number: "ENG-TUC-7787", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-21T08:45:00Z" },
  { id: "v-18", vin: "MALC12345C8899008", brand: "Raja Hyundai", model: "Hyundai Creta", variant: "Knight Edition S(O)", color: "Abyss Black", fuel_type: "DIESEL", status: "YARD_RECEIVING_PENDING", sales_consultant: "Suresh Sharma", location: "Carrier Trailer TN-04-TR-1109", engine_number: "ENG-CRT-8898", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T06:00:00Z" },
  { id: "v-19", vin: "MALC12345V9900119", brand: "Raja Hyundai", model: "Hyundai Venue", variant: "SX 1.5 CRDi Diesel", color: "Atlas White", fuel_type: "DIESEL", status: "PDI_PENDING", sales_consultant: "Karan Joshi", location: "Jaipur Yard • Bay 4", engine_number: "ENG-VEN-9909", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-24T14:30:00Z" },
  { id: "v-20", vin: "MALC12345V0011220", brand: "Raja Hyundai", model: "Hyundai Verna", variant: "SX 1.5 MPI IVT", color: "Fiery Red", fuel_type: "PETROL", status: "ALLOCATED", customer_name: "Sunil Gupta", sales_consultant: "Manish Rathore", location: "Jaipur Yard • Bay 1", engine_number: "ENG-VRN-0010", manufacturing_year: 2026, organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-22T17:00:00Z" }
];

// GET /api/v1/stock — Get extended stock inventory with all fields
stockRouter.get('/', async (c) => {
  const orgId = c.req.query('organization_id');
  const search = c.req.query('search');

  let results = [...localVehiclesStore];

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
  const { organizationId, stockItems } = await c.req.json();

  if (!Array.isArray(stockItems) || stockItems.length === 0) {
    return c.json({ success: false, error: { message: 'No stock data provided' } }, 400);
  }

  const newRecords = stockItems.map((s: any, idx: number) => ({
    id: `v-imported-${Date.now()}-${idx}`,
    organization_id: organizationId || TATA_ORG_ID,
    vin: s['Vin No'] || s.vin || `VIN${Date.now()}${idx}`,
    model: s['Model'] || s.model || 'Unknown Model',
    variant: s['Variant'] || s.variant || 'Standard',
    color: s['Colour'] || s.color || 'Standard Color',
    fuel_type: s['Fuel'] || s.fuelType || 'PETROL',
    location: s['Location'] || s.location || 'Pune Yard • Bay 1',
    customer_name: s['Customer Name'] || s.customerName || null,
    sales_consultant: s['Sales Consultant'] || s.salesConsultant || null,
    status: s['Vehicle Status'] || s['Status'] || s.status || 'RECEIVED',
    created_at: new Date().toISOString()
  }));

  localVehiclesStore = [...newRecords, ...localVehiclesStore];

  return c.json({ success: true, data: { importedCount: newRecords.length, records: newRecords } });
});