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
  type: string;
  city: string;
  state: string;
  capacity: string;
  manager: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// 1. Tata & Hyundai Stockyards as specified by User
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

// 2. Tata & Hyundai Branches / Showrooms as specified by User
export const SEED_BRANCHES: BranchItem[] = [
  // Tata Branches
  { id: 'br-t-1', code: 'BR-PNAGAR-T', name: 'Pratap Nagar', brand: 'Tata Motors', type: '3S Showroom & Service', city: 'Jodhpur', state: 'Rajasthan', capacity: '50 Cars', manager: 'Rajesh Sharma', phone: '+91 98290 10008', status: 'ACTIVE' },
  { id: 'br-t-2', code: 'BR-BKOTHI', name: 'Bhagat Ki Kothi', brand: 'Tata Motors', type: 'Flagship 3S Hub', city: 'Jodhpur', state: 'Rajasthan', capacity: '60 Cars', manager: 'Sunil Jani', phone: '+91 98290 10009', status: 'ACTIVE' },
  { id: 'br-t-3', code: 'BR-SUMER', name: 'Sumerpur', brand: 'Tata Motors', type: '1S Showroom', city: 'Sumerpur', state: 'Rajasthan', capacity: '80 Cars', manager: 'Vikram Singh', phone: '+91 98290 10002', status: 'ACTIVE' },
  { id: 'br-t-4', code: 'BR-PALI', name: 'Pali', brand: 'Tata Motors', type: '3S Showroom & Service', city: 'Pali', state: 'Rajasthan', capacity: '100 Cars', manager: 'Dinesh Gehlot', phone: '+91 98290 10003', status: 'ACTIVE' },
  { id: 'br-t-5', code: 'BR-JALORE', name: 'Jalore', brand: 'Tata Motors', type: '1S Showroom', city: 'Jalore', state: 'Rajasthan', capacity: '75 Cars', manager: 'Mahendra Patel', phone: '+91 98290 10004', status: 'ACTIVE' },
  { id: 'br-t-6', code: 'BR-BALOTRA-T', name: 'Balotra', brand: 'Tata Motors', type: '3S Showroom & Service', city: 'Balotra', state: 'Rajasthan', capacity: '90 Cars', manager: 'Suresh Kumar', phone: '+91 98290 10005', status: 'ACTIVE' },
  { id: 'br-t-7', code: 'BR-BARMER', name: 'Barmer', brand: 'Tata Motors', type: '3S Showroom & Service', city: 'Barmer', state: 'Rajasthan', capacity: '110 Cars', manager: 'Pawan Rathore', phone: '+91 98290 10006', status: 'ACTIVE' },
  { id: 'br-t-8', code: 'BR-BHINMAL', name: 'Bhinmal', brand: 'Tata Motors', type: '1S Showroom', city: 'Bhinmal', state: 'Rajasthan', capacity: '60 Cars', manager: 'Govind Ram', phone: '+91 98290 10007', status: 'ACTIVE' },

  // Hyundai Branches
  { id: 'br-h-1', code: 'BR-PNAGAR-H', name: 'Pratap Nagar', brand: 'Hyundai', type: '3S Showroom & Service', city: 'Jodhpur', state: 'Rajasthan', capacity: '50 Cars', manager: 'Anil Vyas', phone: '+91 98291 20002', status: 'ACTIVE' },
  { id: 'br-h-2', code: 'BR-BALOTRA-H', name: 'Balotra', brand: 'Hyundai', type: '3S Showroom & Service', city: 'Balotra', state: 'Rajasthan', capacity: '80 Cars', manager: 'Ashok Gehlot', phone: '+91 98291 20003', status: 'ACTIVE' },
  { id: 'br-h-3', code: 'BR-PIPAR', name: 'Pipar', brand: 'Hyundai', type: '1S Showroom', city: 'Pipar City', state: 'Rajasthan', capacity: '60 Cars', manager: 'Ratan Lal', phone: '+91 98291 20005', status: 'ACTIVE' },
  { id: 'br-h-4', code: 'BR-BILARA', name: 'Bilara', brand: 'Hyundai', type: '1S Showroom', city: 'Bilara', state: 'Rajasthan', capacity: '70 Cars', manager: 'Praveen Jain', phone: '+91 98291 20004', status: 'ACTIVE' },
  { id: 'br-h-5', code: 'BR-JAISAL', name: 'Jaisalmer', brand: 'Hyundai', type: '3S Showroom & Service', city: 'Jaisalmer', state: 'Rajasthan', capacity: '90 Cars', manager: 'Bhanwar Singh', phone: '+91 98291 20006', status: 'ACTIVE' }
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

  if (!brandCode || brandCode === 'DHOOT-ALL') return list;
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

  if (!brandCode || brandCode === 'DHOOT-ALL') return list;
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

// Default empty vehicles
export const SEED_VEHICLES: any[] = [];

export const SEED_BOOKINGS = [
  { id: "bk-1", receipt_no: "BK-009101", customer_name: "Ramesh Chandra Sharma", mobile_number: "+91 98290 11223", model: "Tata Safari", variant: "Accomplished Plus 6S AT", colour: "Oberon Black", allocated_vin_no: "MAT612345S9988771", allocation_date: "2026-08-24", receipt_amt: 50000, status: "ALLOCATED", sales_consultant: "Sunil Sharma", promise_delivery_date: "2026-08-30", organization_id: TATA_ORG_ID, created_at: "2026-08-20T10:00:00Z" },
  { id: "bk-2", receipt_no: "BK-009102", customer_name: "Priya Kulkarni", mobile_number: "+91 98220 33445", model: "Tata Tiago", variant: "XZ+ Dual Tone", colour: "Tornado Blue", allocated_vin_no: "MAT612345T2233447", allocation_date: "2026-08-25", receipt_amt: 25000, status: "ALLOCATED", sales_consultant: "Rajesh Nair", promise_delivery_date: "2026-08-28", organization_id: TATA_ORG_ID, created_at: "2026-08-21T11:00:00Z" },
  { id: "bk-3", receipt_no: "BK-009103", customer_name: "Rajesh Kumar Verma", mobile_number: "+91 94140 55667", model: "Hyundai Creta", variant: "SX (O) Turbo DCT", colour: "Ranger Khaki", allocated_vin_no: "MALC12345C1122331", allocation_date: "2026-08-24", receipt_amt: 50000, status: "ALLOCATED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-08-29", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-20T15:00:00Z" },
  { id: "bk-4", receipt_no: "BK-009104", customer_name: "Anita Desai", mobile_number: "+91 98291 77889", model: "Hyundai i20", variant: "Asta (O) IVT", colour: "Starry Night", allocated_vin_no: "MALC12345I6677886", allocation_date: "2026-08-25", receipt_amt: 25000, status: "ALLOCATED", sales_consultant: "Karan Joshi", promise_delivery_date: "2026-08-31", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-22T09:30:00Z" },
  { id: "bk-5", receipt_no: "BK-009105", customer_name: "Sunil Gupta", mobile_number: "+91 98292 99001", model: "Hyundai Verna", variant: "SX 1.5 MPI IVT", colour: "Fiery Red", allocated_vin_no: "MALC12345V0011220", allocation_date: "2026-08-25", receipt_amt: 30000, status: "ALLOCATED", sales_consultant: "Manish Rathore", promise_delivery_date: "2026-09-02", organization_id: HYUNDAI_ORG_ID, created_at: "2026-08-23T14:00:00Z" }
];

export const getVehiclesForBrand = (brandCode: string) => {
  try {
    const saved = localStorage.getItem('dhoot_stock_inventory');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        if (brandCode === 'DHOOT-TATA') return parsed.filter(v => (v.organization_id === TATA_ORG_ID || (v.model && v.model.toLowerCase().includes('tata'))));
        if (brandCode === 'DHOOT-HYUNDAI') return parsed.filter(v => (v.organization_id === HYUNDAI_ORG_ID || (v.model && v.model.toLowerCase().includes('hyundai'))));
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stock from storage:', e);
  }
  
  if (brandCode === 'DHOOT-TATA') return SEED_VEHICLES.filter(v => v.organization_id === TATA_ORG_ID);
  if (brandCode === 'DHOOT-HYUNDAI') return SEED_VEHICLES.filter(v => v.organization_id === HYUNDAI_ORG_ID);
  return SEED_VEHICLES;
};

export const saveStockInventory = (vehicles: any[]) => {
  localStorage.setItem('dhoot_stock_inventory', JSON.stringify(vehicles));
  window.dispatchEvent(new Event('stock-updated'));
};

export const clearStockInventory = () => {
  localStorage.removeItem('dhoot_stock_inventory');
  window.dispatchEvent(new Event('stock-updated'));
};

export const getBookingsForBrand = (brandCode: string) => {
  if (brandCode === 'DHOOT-TATA') return SEED_BOOKINGS.filter(b => b.organization_id === TATA_ORG_ID);
  if (brandCode === 'DHOOT-HYUNDAI') return SEED_BOOKINGS.filter(b => b.organization_id === HYUNDAI_ORG_ID);
  return SEED_BOOKINGS;
};
