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

// Clean zero dummy data: Start empty so real imports dictate counts
export const SEED_VEHICLES: any[] = [];
export const SEED_BOOKINGS: any[] = [];
export const SEED_CHALLANS: any[] = [];

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
  return [];
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
  try {
    const saved = localStorage.getItem('dhoot_bookings_inventory');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        if (brandCode === 'DHOOT-TATA') return parsed.filter(b => (b.organization_id === TATA_ORG_ID || (b.model && b.model.toLowerCase().includes('tata'))));
        if (brandCode === 'DHOOT-HYUNDAI') return parsed.filter(b => (b.organization_id === HYUNDAI_ORG_ID || (b.model && b.model.toLowerCase().includes('hyundai'))));
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading bookings from storage:', e);
  }
  return [];
};

export const saveBookingsInventory = (bookings: any[]) => {
  localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(bookings));
  window.dispatchEvent(new Event('bookings-updated'));
};

export const clearBookingsInventory = () => {
  localStorage.removeItem('dhoot_bookings_inventory');
  window.dispatchEvent(new Event('bookings-updated'));
};

export const getChallansForBrand = (brandCode: string) => {
  try {
    const saved = localStorage.getItem('dhoot_challans_inventory');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        if (brandCode === 'DHOOT-TATA') return parsed.filter(c => (c.model && c.model.toLowerCase().includes('tata')));
        if (brandCode === 'DHOOT-HYUNDAI') return parsed.filter(c => (c.model && c.model.toLowerCase().includes('hyundai')));
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading challans from storage:', e);
  }
  return [];
};

export const saveChallansInventory = (challans: any[]) => {
  localStorage.setItem('dhoot_challans_inventory', JSON.stringify(challans));
  window.dispatchEvent(new Event('challans-updated'));
};

export const clearChallansInventory = () => {
  localStorage.removeItem('dhoot_challans_inventory');
  window.dispatchEvent(new Event('challans-updated'));
};


export const syncWithSupabase = async () => {
  try {
    // 1. Fetch Bookings from Supabase
    const { data: dbBookings, error: bErr } = await supabase.from('bookings').select('*');
    if (!bErr && dbBookings && Array.isArray(dbBookings) && dbBookings.length > 0) {
      const local = getBookingsForBrand('DHOOT-ALL');
      const mergedMap = new Map();
      local.forEach((b: any) => mergedMap.set(b.id || b.receipt_no, b));
      dbBookings.forEach((b: any) => mergedMap.set(b.id || b.receipt_no, b));
      const merged = Array.from(mergedMap.values());
      localStorage.setItem('dhoot_bookings_inventory', JSON.stringify(merged));
      window.dispatchEvent(new Event('bookings-updated'));
    }

    // 2. Fetch Vehicles from Supabase
    const { data: dbVehicles, error: vErr } = await supabase.from('vehicles').select('*');
    if (!vErr && dbVehicles && Array.isArray(dbVehicles) && dbVehicles.length > 0) {
      const local = getVehiclesForBrand('DHOOT-ALL');
      const mergedMap = new Map();
      local.forEach((v: any) => mergedMap.set(v.id || v.vin, v));
      dbVehicles.forEach((v: any) => mergedMap.set(v.id || v.vin, v));
      const merged = Array.from(mergedMap.values());
      localStorage.setItem('dhoot_stock_inventory', JSON.stringify(merged));
      window.dispatchEvent(new Event('stock-updated'));
    }

    // 3. Fetch Stockyards from Supabase
    const { data: dbYards, error: yErr } = await supabase.from('stockyards').select('*');
    if (!yErr && dbYards && Array.isArray(dbYards) && dbYards.length > 0) {
      localStorage.setItem('autoprime_stockyards', JSON.stringify(dbYards));
      window.dispatchEvent(new Event('stockyards-updated'));
    }

    // 4. Fetch Branches from Supabase
    const { data: dbBranches, error: brErr } = await supabase.from('branches').select('*');
    if (!brErr && dbBranches && Array.isArray(dbBranches) && dbBranches.length > 0) {
      localStorage.setItem('autoprime_branches', JSON.stringify(dbBranches));
      window.dispatchEvent(new Event('branches-updated'));
    }
  } catch (e) {
    console.warn('Sync with Supabase error:', e);
  }
};

// Trigger background sync on module load
if (typeof window !== 'undefined') {
  syncWithSupabase();
}
