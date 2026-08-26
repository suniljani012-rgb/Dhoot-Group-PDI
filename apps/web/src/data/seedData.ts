import { supabase } from '../lib/supabase';

export const TATA_ORG_ID = '11111111-1111-1111-1111-111111111111';
export const HYUNDAI_ORG_ID = '11111111-1111-1111-1111-111111111112';

export interface YardItem {
  id: string;
  code: string;
  name: string;
  brand: 'Tata Motors' | 'Hyundai' | 'Shared';
  city: string;
  state: string;
  capacity: string;
  manager: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  brand: 'Tata Motors' | 'Hyundai' | 'Shared';
  type: 'Main Showroom' | 'RSO';
  city: string;
  state: string;
  capacity: string;
  manager: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// 1. Stockyards Master
export const SEED_STOCKYARDS: YardItem[] = [
  // Tata Yards
  { id: 'yrd-t-1', code: 'YRD-BASNI', name: 'Basni Yard', brand: 'Tata Motors', city: 'Jodhpur', state: 'Rajasthan', capacity: '200 Cars', manager: 'Ramesh Choudhary', phone: '+91 98290 10001', status: 'ACTIVE' },
  { id: 'yrd-t-2', code: 'YRD-SUMER', name: 'Sumerpur', brand: 'Tata Motors', city: 'Sumerpur', state: 'Rajasthan', capacity: '80 Cars', manager: 'Vikram Singh', phone: '+91 98290 10002', status: 'ACTIVE' },
  { id: 'yrd-t-3', code: 'YRD-PALI', name: 'Pali', brand: 'Tata Motors', city: 'Pali', state: 'Rajasthan', capacity: '100 Cars', manager: 'Dinesh Gehlot', phone: '+91 98290 10003', status: 'ACTIVE' },
  { id: 'yrd-t-4', code: 'YRD-JALORE', name: 'Jalore', brand: 'Tata Motors', city: 'Jalore', state: 'Rajasthan', capacity: '75 Cars', manager: 'Mahendra Patel', phone: '+91 98290 10004', status: 'ACTIVE' },
  { id: 'yrd-t-5', code: 'YRD-BALOTRA-T', name: 'Balotra', brand: 'Tata Motors', city: 'Balotra', state: 'Rajasthan', capacity: '90 Cars', manager: 'Suresh Kumar', phone: '+91 98290 10005', status: 'ACTIVE' },
  { id: 'yrd-t-6', code: 'YRD-BARMER', name: 'Barmer', brand: 'Tata Motors', city: 'Barmer', state: 'Rajasthan', capacity: '110 Cars', manager: 'Pawan Rathore', phone: '+91 98290 10006', status: 'ACTIVE' },
  { id: 'yrd-t-7', code: 'YRD-BHINMAL', name: 'Bhinmal', brand: 'Tata Motors', city: 'Bhinmal', state: 'Rajasthan', capacity: '60 Cars', manager: 'Govind Ram', phone: '+91 98290 10007', status: 'ACTIVE' },
  { id: 'yrd-t-8', code: 'YRD-PNAGAR-T', name: 'Pratap Nagar Showroom', brand: 'Tata Motors', city: 'Jodhpur', state: 'Rajasthan', capacity: '50 Cars', manager: 'Rajesh Sharma', phone: '+91 98290 10008', status: 'ACTIVE' },
  { id: 'yrd-t-9', code: 'YRD-BKOTHI', name: 'Bhagat Ki Kothi Showroom', brand: 'Tata Motors', city: 'Jodhpur', state: 'Rajasthan', capacity: '60 Cars', manager: 'Sunil Jani', phone: '+91 98290 10009', status: 'ACTIVE' },
  { id: 'yrd-t-10', code: 'YRD-SHANTI-T', name: 'Shantinath Yard', brand: 'Tata Motors', city: 'Jodhpur', state: 'Rajasthan', capacity: '150 Cars', manager: 'Kailash Joshi', phone: '+91 98290 10010', status: 'ACTIVE' },
  { id: 'yrd-t-11', code: 'YRD-NEW', name: 'New Yard', brand: 'Tata Motors', city: 'Jodhpur', state: 'Rajasthan', capacity: '250 Cars', manager: 'Om Prakash', phone: '+91 98290 10011', status: 'ACTIVE' },

  // Hyundai Yards
  { id: 'yrd-h-1', code: 'YRD-SHANTI-H', name: 'Shantinath Yard', brand: 'Hyundai', city: 'Jodhpur', state: 'Rajasthan', capacity: '180 Cars', manager: 'Manish Rathore', phone: '+91 98291 20001', status: 'ACTIVE' },
  { id: 'yrd-h-2', code: 'YRD-PNAGAR-H', name: 'Pratap Nagar Showroom', brand: 'Hyundai', city: 'Jodhpur', state: 'Rajasthan', capacity: '50 Cars', manager: 'Anil Vyas', phone: '+91 98291 20002', status: 'ACTIVE' },
  { id: 'yrd-h-3', code: 'YRD-BALOTRA-H', name: 'Balotra', brand: 'Hyundai', city: 'Balotra', state: 'Rajasthan', capacity: '80 Cars', manager: 'Ashok Gehlot', phone: '+91 98291 20003', status: 'ACTIVE' },
  { id: 'yrd-h-4', code: 'YRD-BILARA', name: 'Bilara', brand: 'Hyundai', city: 'Bilara', state: 'Rajasthan', capacity: '70 Cars', manager: 'Praveen Jain', phone: '+91 98291 20004', status: 'ACTIVE' },
  { id: 'yrd-h-5', code: 'YRD-PIPAR', name: 'Pipar', brand: 'Hyundai', city: 'Pipar City', state: 'Rajasthan', capacity: '60 Cars', manager: 'Ratan Lal', phone: '+91 98291 20005', status: 'ACTIVE' },
  { id: 'yrd-h-6', code: 'YRD-JAISAL', name: 'Jaisalmer', brand: 'Hyundai', city: 'Jaisalmer', state: 'Rajasthan', capacity: '90 Cars', manager: 'Bhanwar Singh', phone: '+91 98291 20006', status: 'ACTIVE' }
];

// 2. Branches Master
export const SEED_BRANCHES: BranchItem[] = [
  // Tata Branches
  { id: 'br-t-1', code: 'BR-PNAGAR-T', name: 'Pratap Nagar', brand: 'Tata Motors', type: 'Main Showroom', city: 'Jodhpur', state: 'Rajasthan', capacity: '50 Cars', manager: 'Rajesh Sharma', phone: '+91 98290 10008', status: 'ACTIVE' },
  { id: 'br-t-2', code: 'BR-BKOTHI', name: 'Bhagat Ki Kothi', brand: 'Tata Motors', type: 'Main Showroom', city: 'Jodhpur', state: 'Rajasthan', capacity: '60 Cars', manager: 'Sunil Jani', phone: '+91 98290 10009', status: 'ACTIVE' },
  { id: 'br-t-3', code: 'BR-SUMER', name: 'Sumerpur', brand: 'Tata Motors', type: 'RSO', city: 'Sumerpur', state: 'Rajasthan', capacity: '80 Cars', manager: 'Vikram Singh', phone: '+91 98290 10002', status: 'ACTIVE' },
  { id: 'br-t-4', code: 'BR-PALI', name: 'Pali', brand: 'Tata Motors', type: 'RSO', city: 'Pali', state: 'Rajasthan', capacity: '100 Cars', manager: 'Dinesh Gehlot', phone: '+91 98290 10003', status: 'ACTIVE' },
  { id: 'br-t-5', code: 'BR-JALORE', name: 'Jalore', brand: 'Tata Motors', type: 'RSO', city: 'Jalore', state: 'Rajasthan', capacity: '75 Cars', manager: 'Mahendra Patel', phone: '+91 98290 10004', status: 'ACTIVE' },
  { id: 'br-t-6', code: 'BR-BALOTRA-T', name: 'Balotra', brand: 'Tata Motors', type: 'RSO', city: 'Balotra', state: 'Rajasthan', capacity: '90 Cars', manager: 'Suresh Kumar', phone: '+91 98290 10005', status: 'ACTIVE' },
  { id: 'br-t-7', code: 'BR-BARMER', name: 'Barmer', brand: 'Tata Motors', type: 'RSO', city: 'Barmer', state: 'Rajasthan', capacity: '110 Cars', manager: 'Pawan Rathore', phone: '+91 98290 10006', status: 'ACTIVE' },
  { id: 'br-t-8', code: 'BR-BHINMAL', name: 'Bhinmal', brand: 'Tata Motors', type: 'RSO', city: 'Bhinmal', state: 'Rajasthan', capacity: '60 Cars', manager: 'Govind Ram', phone: '+91 98290 10007', status: 'ACTIVE' },

  // Hyundai Branches
  { id: 'br-h-1', code: 'BR-PNAGAR-H', name: 'Pratap Nagar', brand: 'Hyundai', type: 'Main Showroom', city: 'Jodhpur', state: 'Rajasthan', capacity: '50 Cars', manager: 'Anil Vyas', phone: '+91 98291 20002', status: 'ACTIVE' },
  { id: 'br-h-2', code: 'BR-BALOTRA-H', name: 'Balotra', brand: 'Hyundai', type: 'RSO', city: 'Balotra', state: 'Rajasthan', capacity: '80 Cars', manager: 'Ashok Gehlot', phone: '+91 98291 20003', status: 'ACTIVE' },
  { id: 'br-h-3', code: 'BR-PIPAR', name: 'Pipar', brand: 'Hyundai', type: 'RSO', city: 'Pipar City', state: 'Rajasthan', capacity: '60 Cars', manager: 'Ratan Lal', phone: '+91 98291 20005', status: 'ACTIVE' },
  { id: 'br-h-4', code: 'BR-BILARA', name: 'Bilara', brand: 'Hyundai', type: 'RSO', city: 'Bilara', state: 'Rajasthan', capacity: '70 Cars', manager: 'Praveen Jain', phone: '+91 98291 20004', status: 'ACTIVE' },
  { id: 'br-h-5', code: 'BR-JAISAL', name: 'Jaisalmer', brand: 'Hyundai', type: 'RSO', city: 'Jaisalmer', state: 'Rajasthan', capacity: '90 Cars', manager: 'Bhanwar Singh', phone: '+91 98291 20006', status: 'ACTIVE' }
];

// 3. 30 Realistic Dealership Stock Inventory
export const SEED_STOCK_VEHICLES: any[] = [
  // Tata Vehicles
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

  // Hyundai Vehicles
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

// 4. 25 Comprehensive Dealership Customer Bookings
export const SEED_BOOKINGS: any[] = [
  // Tata Bookings
  { id: "bk-1", receipt_no: "BK-009101", customer_name: "Ramesh Chandra Sharma", mobile_number: "+91 98290 11223", model: "Tata Safari", variant: "Accomplished Plus 6S AT", colour: "Oberon Black", allocated_vin_no: "MAT612345S9988771", allocation_date: "2026-08-24", receipt_amt: 50000, status: "ALLOCATED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-08-30", organization_id: TATA_ORG_ID, created_at: "2026-08-20T10:00:00Z" },
  { id: "bk-2", receipt_no: "BK-009102", customer_name: "Priya Kulkarni", mobile_number: "+91 98220 33445", model: "Tata Tiago", variant: "XZ+ Dual Tone", colour: "Tornado Blue", allocated_vin_no: "MAT612345T2233447", allocation_date: "2026-08-25", receipt_amt: 25000, status: "ALLOCATED", sales_consultant: "Rajesh Nair", promise_delivery_date: "2026-08-28", organization_id: TATA_ORG_ID, created_at: "2026-08-21T11:00:00Z" },
  { id: "bk-3", receipt_no: "BK-009106", customer_name: "Vikramaditya Singhania", mobile_number: "+91 98293 22334", model: "Tata Safari", variant: "Adventure Plus AT", colour: "Cosmic Gold", allocated_vin_no: "MAT612345S8877668", allocation_date: "2026-08-20", receipt_amt: 100000, status: "DELIVERED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-08-25", organization_id: TATA_ORG_ID, created_at: "2026-08-18T10:00:00Z" },
  { id: "bk-4", receipt_no: "BK-009107", customer_name: "Dr. Arvind Agarwal", mobile_number: "+91 98294 44556", model: "Tata Harrier", variant: "Fearless Plus Dark 6MT", colour: "Oberon Black", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Rajesh Nair", promise_delivery_date: "2026-09-05", organization_id: TATA_ORG_ID, created_at: "2026-08-24T10:00:00Z" },
  { id: "bk-5", receipt_no: "BK-009108", customer_name: "Meenakshi Sundaram", mobile_number: "+91 98295 66778", model: "Tata Nexon", variant: "Creative Plus DT", colour: "Daytona Grey", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Amit Verma", promise_delivery_date: "2026-09-07", organization_id: TATA_ORG_ID, created_at: "2026-08-24T12:30:00Z" },
  { id: "bk-6", receipt_no: "BK-009109", customer_name: "Siddharth Malhotra", mobile_number: "+91 98296 88990", model: "Tata Curvv.ev", variant: "Accomplished Plus 55", colour: "Empowered Oxide", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-09-10", organization_id: TATA_ORG_ID, created_at: "2026-08-24T16:00:00Z" },
  { id: "bk-7", receipt_no: "BK-009110", customer_name: "Deepak Choudhary", mobile_number: "+91 98297 11223", model: "Tata Punch", variant: "Creative DT AMT", colour: "Calypso Red", allocated_vin_no: null, receipt_amt: 21000, status: "BOOKED", sales_consultant: "Pooja Patil", promise_delivery_date: "2026-09-03", organization_id: TATA_ORG_ID, created_at: "2026-08-25T09:15:00Z" },
  { id: "bk-8", receipt_no: "BK-009111", customer_name: "Kavita Rathi", mobile_number: "+91 98298 33445", model: "Tata Altroz", variant: "Racer R3 Turbo", colour: "Atomic Orange", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Vikram Joshi", promise_delivery_date: "2026-09-12", organization_id: TATA_ORG_ID, created_at: "2026-08-25T11:00:00Z" },
  { id: "bk-9", receipt_no: "BK-009117", customer_name: "Shubham Jain", mobile_number: "+91 98214 66778", model: "Tata Nexon", variant: "Pure Plus S", colour: "Calypso Red", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Amit Verma", promise_delivery_date: "2026-09-06", organization_id: TATA_ORG_ID, created_at: "2026-08-25T12:00:00Z" },
  { id: "bk-10", receipt_no: "BK-009119", customer_name: "Tanmay Bhatia", mobile_number: "+91 98216 11223", model: "Tata Safari", variant: "Adventure Plus AT", colour: "Cosmic Gold", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-09-18", organization_id: TATA_ORG_ID, created_at: "2026-08-25T13:30:00Z" },
  { id: "bk-11", receipt_no: "BK-009121", customer_name: "Bhupendra Bishnoi", mobile_number: "+91 98291 99001", model: "Tata Curvv", variant: "Accomplished Plus A 1.2 TGDi", colour: "Flame Red", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-09-22", organization_id: TATA_ORG_ID, created_at: "2026-08-25T15:00:00Z" },
  { id: "bk-12", receipt_no: "BK-009122", customer_name: "Manju Choudhary", mobile_number: "+91 98292 11002", model: "Tata Tigor", variant: "XZ+ Leatherette Pack", colour: "Opal White", allocated_vin_no: null, receipt_amt: 21000, status: "BOOKED", sales_consultant: "Pooja Patil", promise_delivery_date: "2026-09-15", organization_id: TATA_ORG_ID, created_at: "2026-08-25T16:00:00Z" },

  // Hyundai Bookings
  { id: "bk-13", receipt_no: "BK-009103", customer_name: "Rajesh Kumar Verma", mobile_number: "+91 94140 55667", model: "Hyundai Creta", variant: "SX (O) Turbo DCT", colour: "Ranger Khaki", allocated_vin_no: "MALC12345C1122331", allocation_date: "2026-08-24", receipt_amt: 50000, status: "ALLOCATED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-08-29", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-20T15:00:00Z" },
  { id: "bk-14", receipt_no: "BK-009104", customer_name: "Anita Desai", mobile_number: "+91 98291 77889", model: "Hyundai i20", variant: "Asta (O) IVT", colour: "Starry Night", allocated_vin_no: "MALC12345I6677886", allocation_date: "2026-08-25", receipt_amt: 25000, status: "ALLOCATED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-08-31", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-22T09:30:00Z" },
  { id: "bk-15", receipt_no: "BK-009105", customer_name: "Sunil Gupta", mobile_number: "+91 98292 99001", model: "Hyundai Verna", variant: "SX 1.5 MPI IVT", colour: "Fiery Red", allocated_vin_no: "MALC12345V0011220", allocation_date: "2026-08-25", receipt_amt: 30000, status: "ALLOCATED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-02", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T14:00:00Z" },
  { id: "bk-16", receipt_no: "BK-009112", customer_name: "Rohan Mehra", mobile_number: "+91 98299 55667", model: "Hyundai Tucson", variant: "Signature 2.0L Diesel AWD", colour: "Titan Grey", allocated_vin_no: null, receipt_amt: 100000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-15", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T16:30:00Z" },
  { id: "bk-17", receipt_no: "BK-009113", customer_name: "Gaurav Khandelwal", mobile_number: "+91 98210 77889", model: "Hyundai Venue", variant: "N Line N8 DCT", colour: "Thunder Blue", allocated_vin_no: null, receipt_amt: 30000, status: "BOOKED", sales_consultant: "Suresh Sharma", promise_delivery_date: "2026-09-08", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-24T11:45:00Z" },
  { id: "bk-18", receipt_no: "BK-009114", customer_name: "Pooja Saxena", mobile_number: "+91 98211 99001", model: "Hyundai Exter", variant: "SX (O) Connect AMT", colour: "Cosmic Blue", allocated_vin_no: null, receipt_amt: 20000, status: "BOOKED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-09-04", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T08:30:00Z" },
  { id: "bk-19", receipt_no: "BK-009115", customer_name: "Alok Mathur", mobile_number: "+91 98212 22334", model: "Hyundai Verna", variant: "SX (O) Turbo 7DCT", colour: "Abyss Black", allocated_vin_no: null, receipt_amt: 40000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-11", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T10:15:00Z" },
  { id: "bk-20", receipt_no: "BK-009116", customer_name: "Neeraj Bansal", mobile_number: "+91 98213 44556", model: "Hyundai Creta", variant: "Knight Edition S(O)", colour: "Abyss Black", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Suresh Sharma", promise_delivery_date: "2026-09-14", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-24T15:00:00Z" },
  { id: "bk-21", receipt_no: "BK-009118", customer_name: "Varun Kapoor", mobile_number: "+91 98215 88990", model: "Hyundai Ioniq 5", variant: "RWD Long Range 72.6kWh", colour: "Gravity Gold Matte", allocated_vin_no: null, receipt_amt: 100000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-20", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T18:00:00Z" },
  { id: "bk-22", receipt_no: "BK-009120", customer_name: "Harshvardhan Raje", mobile_number: "+91 98217 33445", model: "Hyundai Venue", variant: "SX 1.5 CRDi Diesel", colour: "Atlas White", allocated_vin_no: null, receipt_amt: 30000, status: "BOOKED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-09-09", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T14:45:00Z" },
  { id: "bk-23", receipt_no: "BK-009123", customer_name: "Kamal Kishore Soni", mobile_number: "+91 98293 44112", model: "Hyundai Alcazar", variant: "Signature 6S Diesel AT", colour: "Robust Emerald Matte", allocated_vin_no: null, receipt_amt: 50000, status: "BOOKED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-18", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T16:30:00Z" },
  { id: "bk-24", receipt_no: "BK-009124", customer_name: "Rekha Mewara", mobile_number: "+91 98294 55223", model: "Hyundai Grand i10 Nios", variant: "Asta 1.2 Kappa AMT", colour: "Aqua Teal", allocated_vin_no: null, receipt_amt: 20000, status: "BOOKED", sales_consultant: "Suresh Sharma", promise_delivery_date: "2026-09-12", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T17:00:00Z" },
  { id: "bk-25", receipt_no: "BK-009125", customer_name: "Devendra Purohit", mobile_number: "+91 98295 66334", model: "Hyundai Aura", variant: "SX Plus 1.2 AMT", colour: "Typhoon Silver", allocated_vin_no: null, receipt_amt: 25000, status: "BOOKED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-09-16", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-25T17:30:00Z" }
];

// 5. 15 Comprehensive Dealership Challans & Invoices
export const SEED_CHALLANS: any[] = [
  // Tata Challans
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

  // Hyundai Challans
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

export const getStockyards = (brandCode?: string): YardItem[] => {
  let list = SEED_STOCKYARDS;
  try {
    const saved = localStorage.getItem('autoprime_stockyards');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {}

  if (!brandCode || brandCode === 'DHOOT-ALL' || brandCode === 'ALL') return list;
  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(y => y.brand === 'Tata Motors' || y.brand === 'Shared');
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(y => y.brand === 'Hyundai' || y.brand === 'Shared');
  }
  return list;
};

export const getActiveStockyards = (brandCode?: string): YardItem[] => {
  return getStockyards(brandCode).filter(y => y.status === 'ACTIVE');
};

export const saveStockyards = (yards: YardItem[]) => {
  localStorage.setItem('autoprime_stockyards', JSON.stringify(yards));
  window.dispatchEvent(new Event('stockyards-updated'));
};

export const getBranches = (brandCode?: string): BranchItem[] => {
  let list = SEED_BRANCHES;
  try {
    const saved = localStorage.getItem('autoprime_branches');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {}

  if (!brandCode || brandCode === 'DHOOT-ALL' || brandCode === 'ALL') return list;
  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(b => b.brand === 'Tata Motors' || b.brand === 'Shared');
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(b => b.brand === 'Hyundai' || b.brand === 'Shared');
  }
  return list;
};

export const getActiveBranches = (brandCode?: string): BranchItem[] => {
  return getBranches(brandCode).filter(b => b.status === 'ACTIVE');
};

export const saveBranches = (branches: BranchItem[]) => {
  localStorage.setItem('autoprime_branches', JSON.stringify(branches));
  window.dispatchEvent(new Event('branches-updated'));
};

// ============================================================================
// SMART BRAND CLASSIFICATION ENGINE
// ============================================================================
export const isTataItem = (item: any): boolean => {
  if (!item) return false;
  if (item.organization_id === TATA_ORG_ID) return true;
  if (item.brand && String(item.brand).toLowerCase().includes('tata')) return true;
  
  const vin = String(item.vin || item.allocated_vin_no || item.vin_no || '').toUpperCase().trim();
  if (vin.startsWith('MAT')) return true;

  const m = String(item.model || '').toLowerCase();
  const tataKeywords = ['tata', 'nexon', 'harrier', 'safari', 'curvv', 'punch', 'tiago', 'tigor', 'altroz', 'sierra'];
  return tataKeywords.some(kw => m.includes(kw));
};

export const isHyundaiItem = (item: any): boolean => {
  if (!item) return false;
  if (item.organization_id === HYUNDAI_ORG_ID) return true;
  if (item.brand && String(item.brand).toLowerCase().includes('hyundai')) return true;

  const vin = String(item.vin || item.allocated_vin_no || item.vin_no || '').toUpperCase().trim();
  if (vin.startsWith('MAL')) return true;

  const m = String(item.model || '').toLowerCase();
  const hyundaiKeywords = ['hyundai', 'creta', 'venue', 'verna', 'ioniq', 'exter', 'i20', 'i10', 'tucson', 'alcazar', 'aura', 'grand'];
  return hyundaiKeywords.some(kw => m.includes(kw));
};

// ============================================================================
// STOCK INVENTORY METHODS
// ============================================================================
export const getVehiclesForBrand = (brandCode: string) => {
  let list = SEED_STOCK_VEHICLES;
  try {
    const saved = localStorage.getItem('dhoot_stock_inventory');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stock from storage:', e);
  }

  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(isTataItem);
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(isHyundaiItem);
  }
  return list; // DHOOT-ALL
};

export const saveStockInventory = (vehicles: any[]) => {
  localStorage.setItem('dhoot_stock_inventory', JSON.stringify(vehicles));
  window.dispatchEvent(new Event('stock-updated'));
};

export const clearStockInventory = () => {
  localStorage.removeItem('dhoot_stock_inventory');
  window.dispatchEvent(new Event('stock-updated'));
};

// ============================================================================
// CUSTOMER BOOKINGS METHODS
// ============================================================================
export const getBookingsForBrand = (brandCode: string) => {
  let list = SEED_BOOKINGS;
  try {
    const saved = localStorage.getItem('dhoot_bookings_inventory');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading bookings from storage:', e);
  }

  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(isTataItem);
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(isHyundaiItem);
  }
  return list; // DHOOT-ALL
};

export const saveBookingsInventory = (bookings: any[]) => {
  localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(bookings));
  window.dispatchEvent(new Event('bookings-updated'));
};

export const clearBookingsInventory = () => {
  localStorage.removeItem('dhoot_bookings_inventory');
  window.dispatchEvent(new Event('bookings-updated'));
};

// ============================================================================
// CHALLANS METHODS
// ============================================================================
export const getChallansForBrand = (brandCode: string) => {
  let list = SEED_CHALLANS;
  try {
    const saved = localStorage.getItem('dhoot_challans_inventory');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading challans from storage:', e);
  }

  if (brandCode === 'DHOOT-TATA' || brandCode.toLowerCase().includes('tata')) {
    return list.filter(isTataItem);
  }
  if (brandCode === 'DHOOT-HYUNDAI' || brandCode.toLowerCase().includes('hyundai')) {
    return list.filter(isHyundaiItem);
  }
  return list; // DHOOT-ALL
};

export const saveChallansInventory = (challans: any[]) => {
  localStorage.setItem('dhoot_challans_inventory', JSON.stringify(challans));
  window.dispatchEvent(new Event('challans-updated'));
};

export const clearChallansInventory = () => {
  localStorage.removeItem('dhoot_challans_inventory');
  window.dispatchEvent(new Event('challans-updated'));
};

// ============================================================================
// BIDIRECTIONAL REALTIME CLOUD SYNCHRONIZATION (SUPABASE + WORKER API)
// ============================================================================
export const syncWithSupabase = async () => {
  try {
    const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8787'
      : 'https://dhoot-group-pdi-api.sunilbishnoi.workers.dev';

    // 1. Fetch Live Bookings
    let fetchedBookings: any[] = [];
    try {
      const res = await fetch(`${API_BASE}/api/v1/bookings`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          fetchedBookings = json.data;
        }
      }
    } catch (e) {}

    if (fetchedBookings.length === 0) {
      try {
        const { data: dbBookings } = await supabase.from('bookings').select('*');
        if (dbBookings && Array.isArray(dbBookings) && dbBookings.length > 0) {
          fetchedBookings = dbBookings;
        }
      } catch (e) {}
    }

    if (fetchedBookings.length > 0) {
      const local = getBookingsForBrand('DHOOT-ALL');
      const mergedMap = new Map();
      local.forEach((b: any) => mergedMap.set(b.id || b.receipt_no, b));
      fetchedBookings.forEach((b: any) => mergedMap.set(b.id || b.receipt_no, b));
      const merged = Array.from(mergedMap.values());
      localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(merged));
      window.dispatchEvent(new Event('bookings-updated'));
    }

    // 2. Fetch Live Vehicles
    let fetchedVehicles: any[] = [];
    try {
      const res = await fetch(`${API_BASE}/api/v1/stock`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          fetchedVehicles = json.data;
        }
      }
    } catch (e) {}

    if (fetchedVehicles.length === 0) {
      try {
        const { data: dbVehicles } = await supabase.from('vehicles').select('*');
        if (dbVehicles && Array.isArray(dbVehicles) && dbVehicles.length > 0) {
          fetchedVehicles = dbVehicles;
        }
      } catch (e) {}
    }

    if (fetchedVehicles.length > 0) {
      const local = getVehiclesForBrand('DHOOT-ALL');
      const mergedMap = new Map();
      local.forEach((v: any) => mergedMap.set(v.id || v.vin, v));
      fetchedVehicles.forEach((v: any) => mergedMap.set(v.id || v.vin, v));
      const merged = Array.from(mergedMap.values());
      localStorage.setItem('dhoot_stock_inventory', JSON.stringify(merged));
      window.dispatchEvent(new Event('stock-updated'));
    }

    // 3. Fetch Challans
    try {
      const res = await fetch(`${API_BASE}/api/v1/challans`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const local = getChallansForBrand('DHOOT-ALL');
          const mergedMap = new Map();
          local.forEach((c: any) => mergedMap.set(c.id || c.challan_no, c));
          json.data.forEach((c: any) => mergedMap.set(c.id || c.challan_no, c));
          const merged = Array.from(mergedMap.values());
          localStorage.setItem('dhoot_challans_inventory', JSON.stringify(merged));
          window.dispatchEvent(new Event('challans-updated'));
        }
      }
    } catch (e) {}

    // 4. Fetch Stockyards & Branches
    try {
      const { data: dbYards } = await supabase.from('stockyards').select('*');
      if (dbYards && Array.isArray(dbYards) && dbYards.length > 0) {
        localStorage.setItem('autoprime_stockyards', JSON.stringify(dbYards));
        window.dispatchEvent(new Event('stockyards-updated'));
      }
    } catch (e) {}

    try {
      const { data: dbBranches } = await supabase.from('branches').select('*');
      if (dbBranches && Array.isArray(dbBranches) && dbBranches.length > 0) {
        localStorage.setItem('autoprime_branches', JSON.stringify(dbBranches));
        window.dispatchEvent(new Event('branches-updated'));
      }
    } catch (e) {}

  } catch (e) {
    console.warn('Sync with cloud note:', e);
  }
};

// Trigger immediate background sync on module execution
if (typeof window !== 'undefined') {
  syncWithSupabase();
}
