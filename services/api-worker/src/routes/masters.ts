import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { Env } from '../index';

export const mastersRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/masters/all — Comprehensive Automotive Masters
mastersRouter.get('/all', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  const [modelsRes, finRes, insRes, branchesRes, desigRes, natureRes] = await Promise.all([
    supabase.from('master_vehicle_models').select('*').order('brand'),
    supabase.from('master_financiers').select('*').order('name'),
    supabase.from('master_insurance_providers').select('*').order('name'),
    supabase.from('branches').select('*').order('name'),
    supabase.from('master_designations').select('*').order('title'),
    supabase.from('master_nature_types').select('*').order('name')
  ]);

  return c.json({
    success: true,
    data: {
      vehicleModels: modelsRes.data || [],
      financiers: finRes.data || [],
      insuranceProviders: insRes.data || [],
      branches: branchesRes.data || [],
      designations: desigRes.data || [],
      natures: natureRes.data || []
    }
  });
});

// POST /api/v1/masters/vehicle-models — Add OEM Model
mastersRouter.post('/vehicle-models', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const body = await c.req.json();

  const { data, error } = await supabase.from('master_vehicle_models').insert([{
    brand: body.brand,
    model_name: body.model_name || body.modelName,
    body_type: body.body_type || body.bodyType || 'SUV',
    fuel_types: body.fuel_types || body.fuelTypes || ['PETROL'],
    variants: body.variants || [],
    colors: body.colors || [],
    base_ex_showroom: parseFloat(body.base_ex_showroom || body.basePrice || '1000000') || 1000000
  }]).select().single();

  if (error) return c.json({ success: false, error: { message: error.message } }, 400);
  return c.json({ success: true, data }, 201);
});

// POST /api/v1/masters/financiers — Add Financier Bank
mastersRouter.post('/financiers', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const body = await c.req.json();

  const { data, error } = await supabase.from('master_financiers').insert([{
    name: body.name,
    category: body.category || 'PRIVATE_BANK',
    contact_person: body.contactPerson || body.contact_person,
    contact_phone: body.contactPhone || body.contact_phone
  }]).select().single();

  if (error) return c.json({ success: false, error: { message: error.message } }, 400);
  return c.json({ success: true, data }, 201);
});

// POST /api/v1/masters/insurance — Add Insurance Provider
mastersRouter.post('/insurance', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  const body = await c.req.json();

  const { data, error } = await supabase.from('master_insurance_providers').insert([{
    name: body.name,
    code: body.code
  }]).select().single();

  if (error) return c.json({ success: false, error: { message: error.message } }, 400);
  return c.json({ success: true, data }, 201);
});

// POST /api/v1/masters/seed-demo-fleet — Seed 20 Mixed Vehicles & 20 Bookings
mastersRouter.post('/seed-demo-fleet', async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);

  const TATA_ORG_ID = '11111111-1111-1111-1111-111111111111';
  const HYUNDAI_ORG_ID = '11111111-1111-1111-1111-111111111112';

  const demoVehicles = [
    { vin: "MAT612345S9988771", brand: "Autoprime Tata", model: "Tata Safari", variant: "Accomplished Plus 6S AT", color: "Oberon Black", fuel_type: "DIESEL", status: "ALLOCATED", customer_name: "Ramesh Chandra Sharma", sales_consultant: "Sunil Sharma", location: "Pune Yard • Bay 2", engine_no: "ENG-SAF-9901", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MAT612345H7654322", brand: "Autoprime Tata", model: "Tata Harrier", variant: "Fearless Plus Dark 6MT", color: "Oberon Black", fuel_type: "DIESEL", status: "PDI_APPROVED", sales_consultant: "Rajesh Nair", location: "Pune Yard • Bay 1", engine_no: "ENG-HAR-7652", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MAT612345N1234563", brand: "Autoprime Tata", model: "Tata Nexon", variant: "Fearless Plus S DT", color: "Daytona Grey", fuel_type: "PETROL", status: "IN_REPAIR", sales_consultant: "Amit Verma", location: "Workshop Bay 1", engine_no: "ENG-NEX-1233", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MAT612345C5566774", brand: "Autoprime Tata", model: "Tata Curvv.ev", variant: "Accomplished Plus 55", color: "Empowered Oxide", fuel_type: "EV", status: "PDI_IN_PROGRESS", sales_consultant: "Sunil Sharma", location: "Inspection Staging Bay 1", engine_no: "MOT-CRV-5564", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MAT612345P4455665", brand: "Autoprime Tata", model: "Tata Punch", variant: "Creative DT AMT", color: "Calypso Red", fuel_type: "PETROL", status: "YARD_RECEIVING_PENDING", sales_consultant: "Pooja Patil", location: "Carrier Trailer MH-12-TR-4421", engine_no: "ENG-PUN-4455", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MAT612345A3344556", brand: "Autoprime Tata", model: "Tata Altroz", variant: "Racer R3 Turbo", color: "Atomic Orange", fuel_type: "PETROL", status: "PDI_PENDING", sales_consultant: "Vikram Joshi", location: "Pune Yard • Bay 3", engine_no: "ENG-ALT-3346", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MAT612345T2233447", brand: "Autoprime Tata", model: "Tata Tiago", variant: "XZ+ Dual Tone", color: "Tornado Blue", fuel_type: "PETROL", status: "ALLOCATED", customer_name: "Priya Kulkarni", sales_consultant: "Rajesh Nair", location: "Pune Yard • Bay 2", engine_no: "ENG-TIA-2237", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MAT612345S8877668", brand: "Autoprime Tata", model: "Tata Safari", variant: "Adventure Plus AT", color: "Cosmic Gold", fuel_type: "DIESEL", status: "DELIVERED", customer_name: "Vikramaditya Singhania", sales_consultant: "Sunil Sharma", location: "Customer Handover Area", engine_no: "ENG-SAF-8878", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MAT612345H9988119", brand: "Autoprime Tata", model: "Tata Harrier", variant: "Adventure Plus", color: "Daytona Grey", fuel_type: "DIESEL", status: "PDI_APPROVED", sales_consultant: "Pooja Patil", location: "Pune Yard • Bay 1", engine_no: "ENG-HAR-9989", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MAT612345N8877220", brand: "Autoprime Tata", model: "Tata Nexon", variant: "Pure Plus S", color: "Calypso Red", fuel_type: "DIESEL", status: "YARD_RECEIVING_PENDING", sales_consultant: "Amit Verma", location: "Carrier Trailer GJ-01-TR-8812", engine_no: "ENG-NEX-8870", mfg_year: 2026, org_id: TATA_ORG_ID },
    { vin: "MALC12345C1122331", brand: "Raja Hyundai", model: "Hyundai Creta", variant: "SX (O) Turbo DCT", color: "Ranger Khaki", fuel_type: "TURBO", status: "ALLOCATED", customer_name: "Rajesh Kumar Verma", sales_consultant: "Manish Rathore", location: "Jaipur Yard • Bay 1", engine_no: "ENG-CRT-1121", mfg_year: 2026, org_id: HYUNDAI_ORG_ID },
    { vin: "MALC12345V2233442", brand: "Raja Hyundai", model: "Hyundai Venue", variant: "N Line N8 DCT", color: "Thunder Blue", fuel_type: "TURBO", status: "PDI_APPROVED", sales_consultant: "Suresh Sharma", location: "Jaipur Yard • Bay 2", engine_no: "ENG-VEN-2232", mfg_year: 2026, org_id: HYUNDAI_ORG_ID },
    { vin: "MALC12345V3344553", brand: "Raja Hyundai", model: "Hyundai Verna", variant: "SX (O) Turbo 7DCT", color: "Abyss Black", fuel_type: "TURBO", status: "IN_REPAIR", sales_consultant: "Karan Joshi", location: "Workshop Bay 2", engine_no: "ENG-VRN-3343", mfg_year: 2026, org_id: HYUNDAI_ORG_ID },
    { vin: "MALC12345I4455664", brand: "Raja Hyundai", model: "Hyundai Ioniq 5", variant: "RWD Long Range 72.6kWh", color: "Gravity Gold Matte", fuel_type: "EV", status: "PDI_IN_PROGRESS", sales_consultant: "Manish Rathore", location: "Inspection Staging Bay 2", engine_no: "MOT-ION-4454", mfg_year: 2026, org_id: HYUNDAI_ORG_ID },
    { vin: "MALC12345E5566775", brand: "Raja Hyundai", model: "Hyundai Exter", variant: "SX (O) Connect AMT", color: "Cosmic Blue", fuel_type: "PETROL", status: "PDI_PENDING", sales_consultant: "Suresh Sharma", location: "Jaipur Yard • Bay 3", engine_no: "ENG-EXT-5565", mfg_year: 2026, org_id: HYUNDAI_ORG_ID },
    { vin: "MALC12345I6677886", brand: "Raja Hyundai", model: "Hyundai i20", variant: "Asta (O) IVT", color: "Starry Night", fuel_type: "PETROL", status: "ALLOCATED", customer_name: "Anita Desai", sales_consultant: "Karan Joshi", location: "Jaipur Yard • Bay 2", engine_no: "ENG-I20-6676", mfg_year: 2026, org_id: HYUNDAI_ORG_ID },
    { vin: "MALC12345T7788997", brand: "Raja Hyundai", model: "Hyundai Tucson", variant: "Signature 2.0L Diesel AWD", color: "Titan Grey", fuel_type: "DIESEL", status: "PDI_APPROVED", sales_consultant: "Manish Rathore", location: "Jaipur Yard • Bay 1", engine_no: "ENG-TUC-7787", mfg_year: 2026, org_id: HYUNDAI_ORG_ID },
    { vin: "MALC12345C8899008", brand: "Raja Hyundai", model: "Hyundai Creta", variant: "Knight Edition S(O)", color: "Abyss Black", fuel_type: "DIESEL", status: "YARD_RECEIVING_PENDING", sales_consultant: "Suresh Sharma", location: "Carrier Trailer TN-04-TR-1109", engine_no: "ENG-CRT-8898", mfg_year: 2026, org_id: HYUNDAI_ORG_ID },
    { vin: "MALC12345V9900119", brand: "Raja Hyundai", model: "Hyundai Venue", variant: "SX 1.5 CRDi Diesel", color: "Atlas White", fuel_type: "DIESEL", status: "PDI_PENDING", sales_consultant: "Karan Joshi", location: "Jaipur Yard • Bay 4", engine_no: "ENG-VEN-9909", mfg_year: 2026, org_id: HYUNDAI_ORG_ID },
    { vin: "MALC12345V0011220", brand: "Raja Hyundai", model: "Hyundai Verna", variant: "SX 1.5 MPI IVT", color: "Fiery Red", fuel_type: "PETROL", status: "ALLOCATED", customer_name: "Sunil Gupta", sales_consultant: "Manish Rathore", location: "Jaipur Yard • Bay 1", engine_no: "ENG-VRN-0010", mfg_year: 2026, org_id: HYUNDAI_ORG_ID }
  ];

  const demoBookings = [
    { receipt_no: "BK-009101", customer_name: "Ramesh Chandra Sharma", mobile_number: "+91 98290 11223", model: "Tata Safari", variant: "Accomplished Plus 6S AT", colour: "Oberon Black", allocated_vin_no: "MAT612345S9988771", allocation_date: "2026-08-24", receipt_amt: 50000, status: "ALLOCATED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-08-30", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009102", customer_name: "Priya Kulkarni", mobile_number: "+91 98220 33445", model: "Tata Tiago", variant: "XZ+ Dual Tone", colour: "Tornado Blue", allocated_vin_no: "MAT612345T2233447", allocation_date: "2026-08-25", receipt_amt: 25000, status: "ALLOCATED", sales_consultant: "Rajesh Nair", promise_delivery_date: "2026-08-28", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009103", customer_name: "Rajesh Kumar Verma", mobile_number: "+91 94140 55667", model: "Hyundai Creta", variant: "SX (O) Turbo DCT", colour: "Ranger Khaki", allocated_vin_no: "MALC12345C1122331", allocation_date: "2026-08-24", receipt_amt: 50000, status: "ALLOCATED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-08-29", organization_id: HYUNDAI_ORG_ID },
    { receipt_no: "BK-009104", customer_name: "Anita Desai", mobile_number: "+91 98291 77889", model: "Hyundai i20", variant: "Asta (O) IVT", colour: "Starry Night", allocated_vin_no: "MALC12345I6677886", allocation_date: "2026-08-25", receipt_amt: 25000, status: "ALLOCATED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-08-31", organization_id: HYUNDAI_ORG_ID },
    { receipt_no: "BK-009105", customer_name: "Sunil Gupta", mobile_number: "+91 98292 99001", model: "Hyundai Verna", variant: "SX 1.5 MPI IVT", colour: "Fiery Red", allocated_vin_no: "MALC12345V0011220", allocation_date: "2026-08-25", receipt_amt: 30000, status: "ALLOCATED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-02", organization_id: HYUNDAI_ORG_ID },
    { receipt_no: "BK-009106", customer_name: "Vikramaditya Singhania", mobile_number: "+91 98293 22334", model: "Tata Safari", variant: "Adventure Plus AT", colour: "Cosmic Gold", allocated_vin_no: "MAT612345S8877668", allocation_date: "2026-08-20", receipt_amt: 100000, status: "DELIVERED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-08-25", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009107", customer_name: "Dr. Arvind Agarwal", mobile_number: "+91 98294 44556", model: "Tata Harrier", variant: "Fearless Plus Dark", colour: "Oberon Black", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Rajesh Nair", promise_delivery_date: "2026-09-05", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009108", customer_name: "Meenakshi Sundaram", mobile_number: "+91 98295 66778", model: "Tata Nexon", variant: "Creative Plus DT", colour: "Daytona Grey", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Amit Verma", promise_delivery_date: "2026-09-07", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009109", customer_name: "Siddharth Malhotra", mobile_number: "+91 98296 88990", model: "Tata Curvv.ev", variant: "Accomplished Plus 55", colour: "Empowered Oxide", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-09-10", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009110", customer_name: "Deepak Choudhary", mobile_number: "+91 98297 11223", model: "Tata Punch", variant: "Creative DT", colour: "Calypso Red", allocated_vin_no: null, receipt_amt: 21000, status: "BOOKED", sales_consultant: "Pooja Patil", promise_delivery_date: "2026-09-03", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009111", customer_name: "Kavita Rathi", mobile_number: "+91 98298 33445", model: "Tata Altroz", variant: "Racer R3", colour: "Atomic Orange", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Vikram Joshi", promise_delivery_date: "2026-09-12", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009112", customer_name: "Rohan Mehra", mobile_number: "+91 98299 55667", model: "Hyundai Tucson", variant: "Signature Diesel AWD", colour: "Titan Grey", allocated_vin_no: null, receipt_amt: 100000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-15", organization_id: HYUNDAI_ORG_ID },
    { receipt_no: "BK-009113", customer_name: "Gaurav Khandelwal", mobile_number: "+91 98210 77889", model: "Hyundai Venue", variant: "N Line N8 DCT", colour: "Thunder Blue", allocated_vin_no: null, receipt_amt: 30000, status: "BOOKED", sales_consultant: "Suresh Sharma", promise_delivery_date: "2026-09-08", organization_id: HYUNDAI_ORG_ID },
    { receipt_no: "BK-009114", customer_name: "Pooja Saxena", mobile_number: "+91 98211 99001", model: "Hyundai Exter", variant: "SX (O) Connect", colour: "Cosmic Blue", allocated_vin_no: null, receipt_amt: 20000, status: "BOOKED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-09-04", organization_id: HYUNDAI_ORG_ID },
    { receipt_no: "BK-009115", customer_name: "Alok Mathur", mobile_number: "+91 98212 22334", model: "Hyundai Verna", variant: "SX Turbo DCT", colour: "Abyss Black", allocated_vin_no: null, receipt_amt: 40000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-11", organization_id: HYUNDAI_ORG_ID },
    { receipt_no: "BK-009116", customer_name: "Neeraj Bansal", mobile_number: "+91 98213 44556", model: "Hyundai Creta", variant: "Knight Edition S(O)", colour: "Abyss Black", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Suresh Sharma", promise_delivery_date: "2026-09-14", organization_id: HYUNDAI_ORG_ID },
    { receipt_no: "BK-009117", customer_name: "Shubham Jain", mobile_number: "+91 98214 66778", model: "Tata Nexon", variant: "Pure Plus S", colour: "Calypso Red", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Amit Verma", promise_delivery_date: "2026-09-06", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009118", customer_name: "Varun Kapoor", mobile_number: "+91 98215 88990", model: "Hyundai Ioniq 5", variant: "RWD Long Range", colour: "Gravity Gold Matte", allocated_vin_no: null, receipt_amt: 100000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-20", organization_id: HYUNDAI_ORG_ID },
    { receipt_no: "BK-009119", customer_name: "Tanmay Bhatia", mobile_number: "+91 98216 11223", model: "Tata Safari", variant: "Adventure Plus AT", colour: "Cosmic Gold", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-09-18", organization_id: TATA_ORG_ID },
    { receipt_no: "BK-009120", customer_name: "Harshvardhan Raje", mobile_number: "+91 98217 33445", model: "Hyundai Venue", variant: "SX 1.5 Diesel", colour: "Atlas White", allocated_vin_no: null, receipt_amt: 30000, status: "BOOKED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-09-09", organization_id: HYUNDAI_ORG_ID }
  ];

  // Upsert into vehicles
  for (const v of demoVehicles) {
    await supabase.from('vehicles').upsert({
      vin: v.vin,
      brand: v.brand,
      model: v.model,
      variant: v.variant,
      color: v.color,
      fuel_type: v.fuel_type,
      status: v.status,
      customer_name: v.customer_name || null,
      sales_consultant: v.sales_consultant || null,
      location: v.location,
      engine_number: v.engine_no,
      manufacturing_year: v.mfg_year,
      organization_id: v.org_id
    }, { onConflict: 'vin' });
  }

  // Upsert into bookings
  for (const b of demoBookings) {
    await supabase.from('bookings').upsert({
      receipt_no: b.receipt_no,
      customer_name: b.customer_name,
      mobile_number: b.mobile_number,
      model: b.model,
      variant: b.variant,
      colour: b.colour,
      allocated_vin_no: b.allocated_vin_no,
      allocation_date: b.allocation_date || null,
      receipt_amt: b.receipt_amt,
      status: b.status,
      sales_consultant: b.sales_consultant,
      promise_delivery_date: b.promise_delivery_date,
      organization_id: b.organization_id
    }, { onConflict: 'receipt_no' });
  }

  return c.json({
    success: true,
    message: 'Seeded 20 mixed vehicles and 20 bookings into database successfully!',
    vehiclesCount: demoVehicles.length,
    bookingsCount: demoBookings.length
  });
});

