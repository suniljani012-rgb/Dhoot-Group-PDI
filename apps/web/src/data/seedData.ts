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

// 3. User Authoritative Dealership Stock Inventory (Matching Supabase Records)
export const SEED_STOCK_VEHICLES: any[] = [
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

// 4. User Authoritative Customer Bookings (From Supabase Database)
export const SEED_BOOKINGS: any[] = [
  {
    id: "bk-tat-1",
    receipt_no: "RCT-TAT-9901",
    customer_name: "Rajesh Sharma",
    mobile_number: "+91 98290 11223",
    model: "Tata Nexon",
    variant: "Fearless Plus S DT",
    colour: "Daytona Grey",
    allocated_vin_no: "MAT612345N1234567",
    allocation_date: "2026-08-24",
    receipt_amt: 50000,
    status: "ALLOCATED",
    sales_consultant: "Vikram Malhotra",
    promise_delivery_date: "2026-08-30",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-20T10:00:00Z"
  },
  {
    id: "bk-tat-2",
    receipt_no: "RCT-TAT-9902",
    customer_name: "Priya Patel",
    mobile_number: "+91 98220 33445",
    model: "Tata Harrier",
    variant: "Fearless Plus Dark",
    colour: "Oberon Black",
    allocated_vin_no: "MAT612345H7654321",
    allocation_date: "2026-08-25",
    receipt_amt: 50000,
    status: "ALLOCATED",
    sales_consultant: "Vikram Malhotra",
    promise_delivery_date: "2026-08-28",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-21T11:00:00Z"
  },
  {
    id: "bk-hyn-1",
    receipt_no: "RCT-HYN-8801",
    customer_name: "Amit Singh",
    mobile_number: "+91 94140 55667",
    model: "Hyundai Creta",
    variant: "SX(O) Turbo 1.5 DCT",
    colour: "Ranger Khaki",
    allocated_vin_no: "MALC12345C1122334",
    allocation_date: "2026-08-24",
    receipt_amt: 50000,
    status: "ALLOCATED",
    sales_consultant: "Ramesh Choudhary",
    promise_delivery_date: "2026-08-29",
    organization_id: HYUNDAI_ORG_ID,
    created_at: "2026-08-22T14:00:00Z"
  },
  {
    id: "bk-hyn-2",
    receipt_no: "RCT-HYN-8802",
    customer_name: "Neha Verma",
    mobile_number: "+91 98291 77889",
    model: "Hyundai Venue",
    variant: "N Line N8 DCT",
    colour: "Atlas White / Abyss Black",
    allocated_vin_no: "MALC12345V5566778",
    allocation_date: "2026-08-25",
    receipt_amt: 30000,
    status: "ALLOCATED",
    sales_consultant: "Ramesh Choudhary",
    promise_delivery_date: "2026-08-31",
    organization_id: HYUNDAI_ORG_ID,
    created_at: "2026-08-23T16:00:00Z"
  }
];

// 5. Challans & Invoices (Matching User Customer Deliveries)
export const SEED_CHALLANS: any[] = [
  {
    id: "chl-1",
    booking_date: "20-Aug-2026",
    challan_no: "CHL-TAT-001",
    challan_date: "25-Aug-2026",
    delivery_date: "30-Aug-2026",
    challan_type: "TAX_INVOICE_DELIVERY",
    vin_no: "MAT612345N1234567",
    customer_name: "Rajesh Sharma",
    mobile: "+91 98290 11223",
    city: "Jodhpur",
    model: "Tata Nexon",
    variant: "Fearless Plus S DT",
    colour: "Daytona Grey",
    sale_consultant: "Vikram Malhotra",
    team_leader: "Rajesh Nair",
    financier_name: "HDFC Bank Ltd",
    corporate: "No",
    exchange: "No",
    ex_showroom: 1450000,
    discount: 15000,
    net: 1435000,
    insurance_per: 3.2,
    insurance_amount: 45000,
    ep: 3500,
    rti: 2000,
    cm: 800,
    rto_city: "Jodhpur",
    rto_amount: 145000,
    hml_acc: 8000,
    own_acc: 3000,
    acc_discount_amount: 0,
    acc_amount: 11000,
    trc: 500,
    warranty: 10000,
    handling_charges: 2000,
    other: 0,
    fast_tag: 500,
    tcs: 14350,
    net_amount: 1664150,
    invoice_date: "25-Aug-2026",
    invoice_no: "INV-2026-TAT-001",
    status: "INVOICED",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-25T10:00:00Z"
  },
  {
    id: "chl-2",
    booking_date: "21-Aug-2026",
    challan_no: "CHL-TAT-002",
    challan_date: "25-Aug-2026",
    delivery_date: "28-Aug-2026",
    challan_type: "TAX_INVOICE_DELIVERY",
    vin_no: "MAT612345H7654321",
    customer_name: "Priya Patel",
    mobile: "+91 98220 33445",
    city: "Jodhpur",
    model: "Tata Harrier",
    variant: "Fearless Plus Dark",
    colour: "Oberon Black",
    sale_consultant: "Vikram Malhotra",
    team_leader: "Rajesh Nair",
    financier_name: "ICICI Bank Ltd",
    corporate: "Yes",
    exchange: "No",
    ex_showroom: 2350000,
    discount: 20000,
    net: 2330000,
    insurance_per: 3.5,
    insurance_amount: 65000,
    ep: 4500,
    rti: 2500,
    cm: 1000,
    rto_city: "Jodhpur",
    rto_amount: 235000,
    hml_acc: 10000,
    own_acc: 5000,
    acc_discount_amount: 0,
    acc_amount: 15000,
    trc: 500,
    warranty: 12000,
    handling_charges: 2500,
    other: 0,
    fast_tag: 500,
    tcs: 23300,
    net_amount: 2688800,
    invoice_date: "25-Aug-2026",
    invoice_no: "INV-2026-TAT-002",
    status: "DELIVERY_READY",
    organization_id: TATA_ORG_ID,
    created_at: "2026-08-25T11:00:00Z"
  },
  {
    id: "chl-3",
    booking_date: "22-Aug-2026",
    challan_no: "CHL-HYN-001",
    challan_date: "24-Aug-2026",
    delivery_date: "29-Aug-2026",
    challan_type: "GATE_PASS",
    vin_no: "MALC12345C1122334",
    customer_name: "Amit Singh",
    mobile: "+91 94140 55667",
    city: "Jodhpur",
    model: "Hyundai Creta",
    variant: "SX(O) Turbo 1.5 DCT",
    colour: "Ranger Khaki",
    sale_consultant: "Ramesh Choudhary",
    team_leader: "Manish Rathore",
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
    invoice_no: "INV-2026-HYN-001",
    status: "INVOICED",
    organization_id: HYUNDAI_ORG_ID,
    created_at: "2026-08-24T15:00:00Z"
  },
  {
    id: "chl-4",
    booking_date: "23-Aug-2026",
    challan_no: "CHL-HYN-002",
    challan_date: "25-Aug-2026",
    delivery_date: "31-Aug-2026",
    challan_type: "TAX_INVOICE_DELIVERY",
    vin_no: "MALC12345V5566778",
    customer_name: "Neha Verma",
    mobile: "+91 98291 77889",
    city: "Jodhpur",
    model: "Hyundai Venue",
    variant: "N Line N8 DCT",
    colour: "Atlas White / Abyss Black",
    sale_consultant: "Ramesh Choudhary",
    team_leader: "Manish Rathore",
    financier_name: "Kotak Mahindra Bank",
    corporate: "No",
    exchange: "Yes",
    ex_showroom: 1320000,
    discount: 10000,
    net: 1310000,
    insurance_per: 3.1,
    insurance_amount: 36000,
    ep: 2500,
    rti: 1800,
    cm: 600,
    rto_city: "Jodhpur",
    rto_amount: 132000,
    hml_acc: 6000,
    own_acc: 3000,
    acc_discount_amount: 0,
    acc_amount: 9000,
    trc: 500,
    warranty: 9000,
    handling_charges: 1800,
    other: 0,
    fast_tag: 500,
    tcs: 13100,
    net_amount: 1514300,
    invoice_date: "25-Aug-2026",
    invoice_no: "INV-2026-HYN-002",
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

    // 1. Fetch Live Bookings from Database
    try {
      const { data: dbBookings } = await supabase.from('bookings').select('*');
      if (dbBookings && Array.isArray(dbBookings) && dbBookings.length > 0) {
        localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(dbBookings));
        window.dispatchEvent(new Event('bookings-updated'));
      }
    } catch (e) {}

    // 2. Fetch Live Vehicles from Database
    try {
      const { data: dbVehicles } = await supabase.from('vehicles').select('*');
      if (dbVehicles && Array.isArray(dbVehicles) && dbVehicles.length > 0) {
        localStorage.setItem('dhoot_stock_inventory', JSON.stringify(dbVehicles));
        window.dispatchEvent(new Event('stock-updated'));
      }
    } catch (e) {}

    // 3. Fetch Stockyards & Branches
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
