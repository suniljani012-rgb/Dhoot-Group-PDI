import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, Car, ShieldCheck, CreditCard, 
  Settings, Plus, Search, ChevronRight, CheckCircle2, 
  Briefcase, MapPin, DollarSign, Layers, Shield, Sparkles, 
  FileSpreadsheet, Activity, Wrench, X, Loader2, Camera,
  Video, Edit3, Trash2, Check, AlertTriangle, Sliders,
  Landmark, ShieldAlert, Phone, Mail, UserCheck, Warehouse,
  ToggleLeft, ToggleRight, CheckCircle, XCircle
} from 'lucide-react';
import { AdminUsersPage } from './AdminUsers';
import { Panel, Stat, Badge, Empty, PageHeader } from '../components/ui/primitives';
import { 
  YardItem, BranchItem, 
  getStockyards, saveStockyards, 
  getBranches, saveBranches 
} from '../data/seedData';

export interface PdiRuleItem {
  id: string;
  stage: 'Exterior' | 'Electricals' | 'Interior' | 'Engine Bay' | 'Underbody' | 'Road Test';
  category?: string;
  code?: string;
  title: string;
  description: string;
  mandatory: boolean;
  photosRequired: number;
  videoRequired: boolean;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';
  toolRequired?: string;
}

export interface FinancierItem {
  id: string;
  name: string;
  category: 'PRIVATE_BANK' | 'NATIONALISED_BANK' | 'OEM_CAPTIVE_NBFC' | 'NBFC';
  code?: string;
  contactPerson: string;
  designation?: string;
  phone: string;
  email: string;
  maxLtv?: number;
  processingFee?: number;
  activeStatus: string;
}

export interface InsuranceItem {
  id: string;
  name: string;
  code?: string;
  claimsHead: string;
  surveyorName?: string;
  surveyorContact: string;
  cashlessTieUp: boolean;
  discountPercentage: number;
  policyTypes?: string;
}

export const AdminMasterPanel: React.FC = () => {
  const { currentBrand } = useAuth();
  const [activeTab, setActiveTab] = useState<'PDI_RULES' | 'USERS' | 'MODELS' | 'YARDS' | 'BRANCHES' | 'FINANCE' | 'INSURANCE'>('YARDS');

  // =========================================================================
  // 1. Stockyards State & Handlers
  // =========================================================================
  const [yards, setYards] = useState<YardItem[]>(() => getStockyards());
  const [yardBrandFilter, setYardBrandFilter] = useState<'ALL' | 'Tata Motors' | 'Hyundai'>('ALL');
  const [yardSearch, setYardSearch] = useState('');
  const [showYardModal, setShowYardModal] = useState(false);
  const [editingYard, setEditingYard] = useState<YardItem | null>(null);
  const [yardForm, setYardForm] = useState<YardItem>({
    id: '',
    code: '',
    name: '',
    brand: 'Tata Motors',
    city: 'Jodhpur',
    state: 'Rajasthan',
    capacity: '100 Cars',
    manager: '',
    phone: '+91 ',
    status: 'ACTIVE'
  });

  const handleToggleYardStatus = (id: string) => {
    const updated = yards.map(y => {
      if (y.id === id) {
        const nextStatus = y.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const);
        return { ...y, status: nextStatus };
      }
      return y;
    });
    setYards(updated);
    saveStockyards(updated);
  };

  const handleOpenAddYard = () => {
    setEditingYard(null);
    setYardForm({
      id: `yrd-${Date.now()}`,
      code: `YRD-${Date.now().toString().slice(-4)}`,
      name: '',
      brand: currentBrand.code === 'DHOOT-HYUNDAI' ? 'Hyundai' : 'Tata Motors',
      city: 'Jodhpur',
      state: 'Rajasthan',
      capacity: '100 Cars',
      manager: '',
      phone: '+91 98290 ',
      status: 'ACTIVE'
    });
    setShowYardModal(true);
  };

  const handleOpenEditYard = (y: YardItem) => {
    setEditingYard(y);
    setYardForm({ ...y });
    setShowYardModal(true);
  };

  const handleSaveYard = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: YardItem[];
    if (editingYard) {
      updated = yards.map(y => y.id === editingYard.id ? { ...yardForm, id: editingYard.id } : y);
    } else {
      updated = [{ ...yardForm, id: `yrd-${Date.now()}` }, ...yards];
    }
    setYards(updated);
    saveStockyards(updated);
    setShowYardModal(false);
    setEditingYard(null);
  };

  const handleDeleteYard = (id: string) => {
    if (confirm('Are you sure you want to remove this stockyard?')) {
      const updated = yards.filter(y => y.id !== id);
      setYards(updated);
      saveStockyards(updated);
    }
  };

  // =========================================================================
  // 2. Branches State & Handlers
  // =========================================================================
  const [branches, setBranches] = useState<BranchItem[]>(() => getBranches());
  const [branchBrandFilter, setBranchBrandFilter] = useState<'ALL' | 'Tata Motors' | 'Hyundai'>('ALL');
  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [branchForm, setBranchForm] = useState<BranchItem>({
    id: '',
    code: '',
    name: '',
    brand: 'Tata Motors',
    type: 'Main Showroom',
    city: 'Jodhpur',
    state: 'Rajasthan',
    capacity: '80 Cars',
    manager: '',
    phone: '+91 ',
    status: 'ACTIVE'
  });

  const handleToggleBranchStatus = (id: string) => {
    const updated = branches.map(b => {
      if (b.id === id) {
        const nextStatus = b.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const);
        return { ...b, status: nextStatus };
      }
      return b;
    });
    setBranches(updated);
    saveBranches(updated);
  };

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      id: `br-${Date.now()}`,
      code: `BR-${Date.now().toString().slice(-4)}`,
      name: '',
      brand: currentBrand.code === 'DHOOT-HYUNDAI' ? 'Hyundai' : 'Tata Motors',
      type: 'Main Showroom',
      city: 'Jodhpur',
      state: 'Rajasthan',
      capacity: '60 Cars',
      manager: '',
      phone: '+91 98290 ',
      status: 'ACTIVE'
    });
    setShowBranchModal(true);
  };

  const handleOpenEditBranch = (b: BranchItem) => {
    setEditingBranch(b);
    setBranchForm({ ...b });
    setShowBranchModal(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: BranchItem[];
    if (editingBranch) {
      updated = branches.map(b => b.id === editingBranch.id ? { ...branchForm, id: editingBranch.id } : b);
    } else {
      updated = [{ ...branchForm, id: `br-${Date.now()}` }, ...branches];
    }
    setBranches(updated);
    saveBranches(updated);
    setShowBranchModal(false);
    setEditingBranch(null);
  };

  const handleDeleteBranch = (id: string) => {
    if (confirm('Are you sure you want to remove this branch/showroom?')) {
      const updated = branches.filter(b => b.id !== id);
      setBranches(updated);
      saveBranches(updated);
    }
  };

  // =========================================================================
  // 3. PDI Rules State
  // =========================================================================
  const [pdiRules, setPdiRules] = useState<PdiRuleItem[]>(() => {
    const saved = localStorage.getItem('autoprime_pdi_rules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'RULE-01', stage: 'Exterior', category: 'Body Panels', code: 'EXT-01', title: 'Body Panel Alignment & Gap Uniformity', description: 'Inspect hood, fenders, doors, and tailgate shutlines for uniform flushness (3.5mm ± 0.5mm)', mandatory: true, photosRequired: 2, videoRequired: false, severity: 'CRITICAL', toolRequired: 'Feeler Gap Gauge' },
      { id: 'RULE-02', stage: 'Exterior', category: 'Paint Finish', code: 'EXT-02', title: 'Paint Gloss & Clear Coat Transit Inspection', description: '360° visual scan under diffused inspection lights for orange peel, dust nibs, transit scratches, or buffer swirl marks', mandatory: true, photosRequired: 4, videoRequired: true, severity: 'CRITICAL', toolRequired: 'Defect Marker Lamp' },
      { id: 'RULE-03', stage: 'Exterior', category: 'Glass & Seals', code: 'EXT-03', title: 'Windshield, Windows & Beading Weatherstrips', description: 'Inspect laminated windshield, side glasses for scratches/pits, and check perimeter rubber weatherstrip fitment', mandatory: true, photosRequired: 1, videoRequired: false, severity: 'MAJOR', toolRequired: 'Visual / Tactile' },
      { id: 'RULE-04', stage: 'Electricals', category: 'Lighting', code: 'ELE-01', title: 'Full LED Headlamps, DRLs & Connected Lightbars', description: 'Verify Bi-LED projectors high/low beam leveler, sequential turn indicators, and rear connected taillight animation', mandatory: true, photosRequired: 2, videoRequired: false, severity: 'CRITICAL', toolRequired: 'Beam Tester' },
      { id: 'RULE-05', stage: 'Electricals', category: 'Infotainment', code: 'ELE-02', title: 'Digital Instrument Cluster & Infotainment Display', description: 'Check 10.25-inch instrument cluster dials, Harman touchscreen, wireless Android Auto / Apple CarPlay pairing', mandatory: true, photosRequired: 1, videoRequired: false, severity: 'MAJOR', toolRequired: 'System Diagnostic USB' },
      { id: 'RULE-06', stage: 'Interior', category: 'Cockpit', code: 'INT-01', title: 'Leatherette Upholstery, Stitching & Sunroof Operation', description: 'Check ventilated front seats, leatherette seat covers, panoramic sunroof open/close/tilt one-touch anti-pinch action', mandatory: true, photosRequired: 2, videoRequired: false, severity: 'MAJOR', toolRequired: 'Operation Test' },
      { id: 'RULE-07', stage: 'Engine Bay', category: 'Fluids', code: 'ENG-01', title: 'Engine Oil, Coolant, Brake Fluid & Battery SOC', description: 'Verify oil dipstick level, coolant reservoir MAX mark, DOT4 brake fluid, and 12V auxiliary battery terminal voltage (>12.6V)', mandatory: true, photosRequired: 2, videoRequired: false, severity: 'CRITICAL', toolRequired: 'Multimeter & Refractometer' },
      { id: 'RULE-08', stage: 'Underbody', category: 'Chassis', code: 'UND-01', title: 'Floor Pan Anti-Rust Coating & Suspension Mounting', description: 'Inspect exhaust heat shields, catalytic converter shields, brake line routing, and check for hydraulic transit leaks', mandatory: true, photosRequired: 2, videoRequired: false, severity: 'CRITICAL', toolRequired: '2-Post Hydraulic Lift' },
      { id: 'RULE-09', stage: 'Road Test', category: 'Dynamics', code: 'ROA-01', title: 'Steering Centering, ABS Braking & ADAS Calibration', description: 'Conduct 2.5 km dynamic road test: steering wheel center tracking, emergency braking straightness, and Lane Keep Assist beep test', mandatory: true, photosRequired: 1, videoRequired: true, severity: 'CRITICAL', toolRequired: 'VCI Scanner' },
    ];
  });

  // =========================================================================
  // 4. Vehicle Models State
  // =========================================================================
  const [vehicleModels, setVehicleModels] = useState<any[]>(() => {
    const saved = localStorage.getItem('autoprime_models');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'm-1', brand: 'Tata Motors', model_name: 'Tata Safari', body_type: 'Flagship 6/7-Seater SUV', base_ex_showroom: 1619000, fuel_types: ['DIESEL'], transmission: '6MT / 6AT', seating_capacity: '6/7 Seater', variants: ['Smart', 'Pure', 'Adventure', 'Accomplished+'], colors: ['Oberon Black', 'Cosmic Gold', 'Stardust Ash'], gst_rate: 28 },
      { id: 'm-2', brand: 'Tata Motors', model_name: 'Tata Harrier', body_type: 'Premium 5-Seater SUV', base_ex_showroom: 1549000, fuel_types: ['DIESEL'], transmission: '6MT / 6AT', seating_capacity: '5 Seater', variants: ['Smart', 'Pure', 'Adventure', 'Fearless+'], colors: ['Oberon Black', 'Sunlit Yellow', 'Pebble Grey'], gst_rate: 28 },
      { id: 'm-3', brand: 'Tata Motors', model_name: 'Tata Nexon', body_type: 'Compact SUV', base_ex_showroom: 799000, fuel_types: ['PETROL', 'DIESEL', 'iCNG', 'EV'], transmission: '5MT / 6MT / 6AMT / 7DCA', seating_capacity: '5 Seater', variants: ['Smart', 'Pure', 'Creative', 'Fearless+'], colors: ['Daytona Grey', 'Fearless Purple', 'Pristine White'], gst_rate: 28 },
      { id: 'm-4', brand: 'Tata Motors', model_name: 'Tata Curvv / Curvv.ev', body_type: 'SUV Coupe', base_ex_showroom: 999000, fuel_types: ['PETROL', 'DIESEL', 'EV'], transmission: '6MT / 7DCA / Electric Drive', seating_capacity: '5 Seater', variants: ['Smart', 'Pure+', 'Creative+', 'Accomplished+'], colors: ['Empowered Oxide', 'Flame Red', 'Opera Blue'], gst_rate: 28 },
      { id: 'm-5', brand: 'Tata Motors', model_name: 'Tata Punch', body_type: 'Micro SUV', base_ex_showroom: 612000, fuel_types: ['PETROL', 'iCNG', 'EV'], transmission: '5MT / 5AMT', seating_capacity: '5 Seater', variants: ['Pure', 'Adventure', 'Accomplished', 'Creative'], colors: ['Calypso Red', 'Atomic Orange', 'Daytona Grey'], gst_rate: 28 },
      { id: 'm-6', brand: 'Hyundai', model_name: 'Hyundai Creta', body_type: 'Midsize SUV', base_ex_showroom: 1099000, fuel_types: ['PETROL', 'DIESEL', 'TURBO'], transmission: '6MT / IVT / 6AT / 7DCT', seating_capacity: '5 Seater', variants: ['E', 'EX', 'S', 'SX', 'SX(O)'], colors: ['Ranger Khaki', 'Abyss Black', 'Atlas White'], gst_rate: 28 },
      { id: 'm-7', brand: 'Hyundai', model_name: 'Hyundai Venue / N Line', body_type: 'Compact SUV', base_ex_showroom: 794000, fuel_types: ['PETROL', 'DIESEL', 'TURBO'], transmission: '5MT / 6MT / 7DCT', seating_capacity: '5 Seater', variants: ['E', 'S', 'S(O)', 'SX', 'SX(O)'], colors: ['Thunder Blue', 'Atlas White', 'Typhoon Silver'], gst_rate: 28 },
      { id: 'm-8', brand: 'Hyundai', model_name: 'Hyundai Verna', body_type: 'Premium Sedan', base_ex_showroom: 1100000, fuel_types: ['PETROL', 'TURBO GDi'], transmission: '6MT / IVT / 7DCT', seating_capacity: '5 Seater', variants: ['EX', 'S', 'SX', 'SX(O)'], colors: ['Abyss Black', 'Titan Grey', 'Fiery Red'], gst_rate: 28 },
      { id: 'm-9', brand: 'Hyundai', model_name: 'Hyundai Ioniq 5', body_type: 'Electric Crossover', base_ex_showroom: 4605000, fuel_types: ['EV (72.6 kWh)'], transmission: 'Single Speed Reduction', seating_capacity: '5 Seater', variants: ['RWD Long Range'], colors: ['Gravity Gold Matte', 'Optic White', 'Midnight Black'], gst_rate: 5 },
    ];
  });

  // =========================================================================
  // 5. Financiers State
  // =========================================================================
  const [financiers, setFinanciers] = useState<FinancierItem[]>(() => {
    const saved = localStorage.getItem('autoprime_financiers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'fin-1', name: 'State Bank of India (SBI Auto Loans)', category: 'NATIONALISED_BANK', code: 'FIN-SBI-01', contactPerson: 'Anil Kumar (Chief Manager)', designation: 'Chief Manager Auto Desk', phone: '+91 141 223 9011', email: 'autoloans.sbi@sbi.co.in', maxLtv: 90, processingFee: 0.25, activeStatus: 'Active Tie-Up' },
      { id: 'fin-2', name: 'HDFC Bank Ltd', category: 'PRIVATE_BANK', code: 'FIN-HDFC-02', contactPerson: 'Pooja Verma (DSA Head)', designation: 'Zonal DSA Head', phone: '+91 20 6789 2200', email: 'auto.hdfc@hdfcbank.com', maxLtv: 95, processingFee: 0.50, activeStatus: 'Active Tie-Up' },
      { id: 'fin-3', name: 'ICICI Bank Ltd', category: 'PRIVATE_BANK', code: 'FIN-ICICI-03', contactPerson: 'Rajesh Nair (Zonal Lead)', designation: 'Regional Retail Lead', phone: '+91 22 4567 1100', email: 'autodesk@icicibank.com', maxLtv: 90, processingFee: 0.50, activeStatus: 'Active Tie-Up' },
      { id: 'fin-4', name: 'Tata Capital Financial Services', category: 'OEM_CAPTIVE_NBFC', code: 'FIN-TCF-04', contactPerson: 'Vikram Joshi (Zonal Head)', designation: 'Zonal Captive Head', phone: '+91 1800 209 6060', email: 'dealerdesk@tatacapital.com', maxLtv: 100, processingFee: 0.00, activeStatus: 'Active Tie-Up' },
      { id: 'fin-5', name: 'Bajaj Finance Ltd', category: 'NBFC', code: 'FIN-BFL-05', contactPerson: 'Sunil Mehta (Regional Manager)', designation: 'Regional Manager Auto Loans', phone: '+91 20 7157 6064', email: 'auto@bajajfinserv.in', maxLtv: 85, processingFee: 0.75, activeStatus: 'Active Tie-Up' },
    ];
  });

  // =========================================================================
  // 6. Insurance Providers State
  // =========================================================================
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceItem[]>(() => {
    const saved = localStorage.getItem('autoprime_insurance');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'ins-1', name: 'Tata AIG General Insurance', code: 'INS-AIG-01', claimsHead: 'Kavita Sen (Zonal Claims Lead)', surveyorName: 'Vinod Sharma', surveyorContact: '+91 1800 266 7780', cashlessTieUp: true, discountPercentage: 65, policyTypes: 'Zero Dep, Engine Protect, RTI, Key Replacement' },
      { id: 'ins-2', name: 'ICICI Lombard General Insurance', code: 'INS-LOM-02', claimsHead: 'Manoj Sharma (Surveyor Head)', surveyorName: 'Rajesh Gupta', surveyorContact: '+91 1800 2666', cashlessTieUp: true, discountPercentage: 60, policyTypes: 'Zero Dep, RTI, Consumables Cover' },
      { id: 'ins-3', name: 'Bajaj Allianz General Insurance', code: 'INS-BAJ-03', claimsHead: 'Alok Gupta (Regional Claims Mgr)', surveyorName: 'Amit Verma', surveyorContact: '+91 1800 209 5858', cashlessTieUp: true, discountPercentage: 62, policyTypes: 'Zero Dep, Engine Protect, Tyre Protect' },
      { id: 'ins-4', name: 'HDFC ERGO General Insurance', code: 'INS-ERG-04', claimsHead: 'Sneha Patel (Claims Desk)', surveyorName: 'Dinesh Joshi', surveyorContact: '+91 1800 266 6444', cashlessTieUp: true, discountPercentage: 58, policyTypes: 'Zero Dep, 24x7 Roadside Assistance' },
      { id: 'ins-5', name: 'National Insurance Company Ltd', code: 'INS-NIC-05', claimsHead: 'R. K. Verma (Divisional Officer)', surveyorName: 'Prakash Rao', surveyorContact: '+91 1800 345 0330', cashlessTieUp: true, discountPercentage: 50, policyTypes: 'Comprehensive Standard Package' },
    ];
  });

  // Filtered lists
  const filteredYards = yards.filter(y => {
    const matchesBrand = yardBrandFilter === 'ALL' || y.brand === yardBrandFilter || y.brand === 'Shared';
    const matchesSearch = !yardSearch || y.name.toLowerCase().includes(yardSearch.toLowerCase()) || y.city.toLowerCase().includes(yardSearch.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const filteredBranches = branches.filter(b => {
    const matchesBrand = branchBrandFilter === 'ALL' || b.brand === branchBrandFilter || b.brand === 'Shared';
    const matchesSearch = !branchSearch || b.name.toLowerCase().includes(branchSearch.toLowerCase()) || b.city.toLowerCase().includes(branchSearch.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const activeYardsCount = yards.filter(y => y.status === 'ACTIVE').length;
  const activeBranchesCount = branches.filter(b => b.status === 'ACTIVE').length;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none pb-20">
      
      {/* Top Header */}
      <PageHeader
        title="Master Data & Facility Management"
        subtitle="Manage OEM Stockyards, Showroom Branches, Inspection Checkpoints, Vehicle Models & Financiers"
      />

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto bg-surface border border-line rounded p-1 text-xs">
        <button
          onClick={() => setActiveTab('YARDS')}
          className={`flex items-center gap-1.5 h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'YARDS' ? 'bg-accent text-white font-semibold shadow-xs' : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          <Warehouse className="w-3.5 h-3.5" />
          <span>Stockyards ({activeYardsCount} Active)</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex items-center gap-1.5 h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'BRANCHES' ? 'bg-accent text-white font-semibold shadow-xs' : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Branches & Showrooms ({activeBranchesCount} Active)</span>
        </button>

        <button
          onClick={() => setActiveTab('PDI_RULES')}
          className={`flex items-center gap-1.5 h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'PDI_RULES' ? 'bg-accent text-white font-semibold shadow-xs' : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Checkpoints ({pdiRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-1.5 h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'USERS' ? 'bg-accent text-white font-semibold shadow-xs' : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users & Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('MODELS')}
          className={`flex items-center gap-1.5 h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'MODELS' ? 'bg-accent text-white font-semibold shadow-xs' : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Models ({vehicleModels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FINANCE')}
          className={`flex items-center gap-1.5 h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'FINANCE' ? 'bg-accent text-white font-semibold shadow-xs' : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Financiers ({financiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INSURANCE')}
          className={`flex items-center gap-1.5 h-7 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'INSURANCE' ? 'bg-accent text-white font-semibold shadow-xs' : 'text-ink-3 hover:text-ink-2'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Insurance ({insuranceProviders.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STOCKYARDS MASTER (TATA & HYUNDAI YARDS)                           */}
      {/* ========================================================================= */}
      {activeTab === 'YARDS' && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Total Stockyards" value={yards.length} note="Configured Yards" />
            <Stat label="Active Stockyards" value={activeYardsCount} note="Visible in Dropdowns" tone="ok" />
            <Stat label="Tata Stockyards" value={yards.filter(y => y.brand === 'Tata Motors').length} note="Tata Dealerships" />
            <Stat label="Hyundai Stockyards" value={yards.filter(y => y.brand === 'Hyundai').length} note="Hyundai Dealerships" tone="accent" />
          </div>

          <Panel
            title={
              <div className="flex items-center gap-2">
                <span>Stockyard Facilities Ledger</span>
                <Badge tone="accent">{filteredYards.length} Facilities</Badge>
              </div>
            }
            action={
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Yard Name or City..."
                    value={yardSearch}
                    onChange={(e) => setYardSearch(e.target.value)}
                    className="h-8 pl-8 pr-3 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
                  />
                </div>

                <select
                  value={yardBrandFilter}
                  onChange={(e) => setYardBrandFilter(e.target.value as any)}
                  className="h-8 text-xs bg-canvas border border-line rounded px-2 text-ink focus:outline-none focus:border-accent font-medium"
                >
                  <option value="ALL">All Brands</option>
                  <option value="Tata Motors">Tata Motors Yards</option>
                  <option value="Hyundai">Hyundai Yards</option>
                </select>

                <button
                  type="button"
                  onClick={handleOpenAddYard}
                  className="h-8 px-3 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stockyard</span>
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Stockyard Name</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Brand Dealership</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Location / City</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Yard In-Charge</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Contact Phone</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink-2 text-xs">
                  {filteredYards.map((y, idx) => {
                    const isActive = y.status === 'ACTIVE';
                    return (
                      <tr key={y.id} className="hover:bg-canvas transition-colors">
                        <td className="py-2.5 px-3 text-center text-ink-3 tnum whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Warehouse className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>{y.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge tone={y.brand === 'Hyundai' ? 'accent' : 'neutral'}>
                            {y.brand}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                          {y.city}, {y.state}
                        </td>
                        <td className="py-2.5 px-3 text-ink whitespace-nowrap">
                          {y.manager || 'Yard Supervisor'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                          {y.phone}
                        </td>
                        
                        {/* 1-Click Status Toggle */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleYardStatus(y.id)}
                            className={`h-6 px-2.5 rounded-chip text-[11px] font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                              isActive
                                ? 'bg-ok/10 text-ok border border-ok/30 hover:bg-ok/20'
                                : 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-ok" />
                                <span>ACTIVE</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-danger" />
                                <span>INACTIVE</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditYard(y)}
                              className="p-1 rounded hover:bg-surface text-ink-3 hover:text-ink transition-colors cursor-pointer"
                              title="Edit Stockyard"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteYard(y.id)}
                              className="p-1 rounded hover:bg-danger/10 text-ink-3 hover:text-danger transition-colors cursor-pointer"
                              title="Delete Stockyard"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BRANCHES & SHOWROOMS MASTER (TATA & HYUNDAI BRANCHES)              */}
      {/* ========================================================================= */}
      {activeTab === 'BRANCHES' && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Total Branches" value={branches.length} note="Showrooms & 3S Hubs" />
            <Stat label="Active Branches" value={activeBranchesCount} note="Active Showrooms" tone="ok" />
            <Stat label="Tata Branches" value={branches.filter(b => b.brand === 'Tata Motors').length} note="Tata Dealerships" />
            <Stat label="Hyundai Branches" value={branches.filter(b => b.brand === 'Hyundai').length} note="Hyundai Dealerships" tone="accent" />
          </div>

          <Panel
            title={
              <div className="flex items-center gap-2">
                <span>Branch & Showroom Directory</span>
                <Badge tone="accent">{filteredBranches.length} Showrooms</Badge>
              </div>
            }
            action={
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Branch Name or City..."
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    className="h-8 pl-8 pr-3 text-xs bg-canvas border border-line rounded text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent"
                  />
                </div>

                <select
                  value={branchBrandFilter}
                  onChange={(e) => setBranchBrandFilter(e.target.value as any)}
                  className="h-8 text-xs bg-canvas border border-line rounded px-2 text-ink focus:outline-none focus:border-accent font-medium"
                >
                  <option value="ALL">All Brands</option>
                  <option value="Tata Motors">Tata Motors Branches</option>
                  <option value="Hyundai">Hyundai Branches</option>
                </select>

                <button
                  type="button"
                  onClick={handleOpenAddBranch}
                  className="h-8 px-3 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Branch</span>
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Branch / Showroom Name</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Brand</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">City</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Branch Manager</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Contact Phone</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink-2 text-xs">
                  {filteredBranches.map((b, idx) => {
                    const isActive = b.status === 'ACTIVE';
                    return (
                      <tr key={b.id} className="hover:bg-canvas transition-colors">
                        <td className="py-2.5 px-3 text-center text-ink-3 tnum whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-ink whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>{b.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge tone={b.brand === 'Hyundai' ? 'accent' : 'neutral'}>
                            {b.brand}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge tone={b.type === 'Main Showroom' ? 'accent' : 'neutral'}>
                            {b.type}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-ink-2 whitespace-nowrap">
                          {b.city}, {b.state}
                        </td>
                        <td className="py-2.5 px-3 text-ink whitespace-nowrap">
                          {b.manager}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-ink-3 whitespace-nowrap">
                          {b.phone}
                        </td>
                        
                        {/* 1-Click Status Toggle */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleBranchStatus(b.id)}
                            className={`h-6 px-2.5 rounded-chip text-[11px] font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                              isActive
                                ? 'bg-ok/10 text-ok border border-ok/30 hover:bg-ok/20'
                                : 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-ok" />
                                <span>ACTIVE</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-danger" />
                                <span>INACTIVE</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditBranch(b)}
                              className="p-1 rounded hover:bg-surface text-ink-3 hover:text-ink transition-colors cursor-pointer"
                              title="Edit Branch"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBranch(b.id)}
                              className="p-1 rounded hover:bg-danger/10 text-ink-3 hover:text-danger transition-colors cursor-pointer"
                              title="Delete Branch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OTHER TABS: USERS, PDI RULES, MODELS, FINANCE, INSURANCE                  */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && <AdminUsersPage />}

      {activeTab === 'PDI_RULES' && (
        <Panel title="PDI Checkpoints Master">
          <div className="p-4 text-xs text-ink-2 space-y-2">
            <p>Inspection checkpoints for exterior, electricals, interior, engine bay, underbody, and road tests.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {pdiRules.map(r => (
                <div key={r.id} className="p-3 bg-canvas border border-line rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{r.title}</span>
                    <Badge tone={r.severity === 'CRITICAL' ? 'danger' : 'warn'}>{r.severity}</Badge>
                  </div>
                  <p className="text-[11px] text-ink-3">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {activeTab === 'MODELS' && (
        <Panel title="Vehicle Models Catalog">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {vehicleModels.map(m => (
              <div key={m.id} className="p-3.5 bg-canvas border border-line rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink text-sm">{m.model_name}</span>
                  <Badge tone={m.brand?.includes('Hyundai') ? 'accent' : 'neutral'}>{m.brand}</Badge>
                </div>
                <div className="text-xs text-ink-2 space-y-0.5">
                  <p>Type: {m.body_type}</p>
                  <p>Base Ex-Showroom: ₹{Number(m.base_ex_showroom).toLocaleString('en-IN')}</p>
                  <p>Transmission: {m.transmission}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {activeTab === 'FINANCE' && (
        <Panel title="Banking & Financier Partners">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
            {financiers.map(f => (
              <div key={f.id} className="p-3.5 bg-canvas border border-line rounded space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{f.name}</span>
                  <Badge tone="ok">{f.activeStatus}</Badge>
                </div>
                <p className="text-xs text-ink-2">Contact: {f.contactPerson} ({f.phone})</p>
                <p className="text-xs text-ink-3">Max LTV: {f.maxLtv}% • Fee: {f.processingFee}%</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {activeTab === 'INSURANCE' && (
        <Panel title="General Insurance Tie-ups">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
            {insuranceProviders.map(i => (
              <div key={i.id} className="p-3.5 bg-canvas border border-line rounded space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{i.name}</span>
                  <Badge tone="accent">Discount: {i.discountPercentage}%</Badge>
                </div>
                <p className="text-xs text-ink-2">Claims Lead: {i.claimsHead} ({i.surveyorContact})</p>
                <p className="text-xs text-ink-3">Covers: {i.policyTypes}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT STOCKYARD                                               */}
      {/* ========================================================================= */}
      {showYardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {editingYard ? 'Edit Stockyard Facility' : 'Add New Stockyard Facility'}
                  </h2>
                  <p className="text-xs text-ink-3">Configure yard name, brand assignment, and operational status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowYardModal(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveYard} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Stockyard Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basni Yard, Shantinath Yard, Sumerpur..."
                    value={yardForm.name}
                    onChange={(e) => setYardForm({ ...yardForm, name: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Brand Assignment *
                  </label>
                  <select
                    value={yardForm.brand}
                    onChange={(e) => setYardForm({ ...yardForm, brand: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Hyundai">Hyundai</option>
                                      </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jodhpur, Pali, Balotra..."
                    value={yardForm.city}
                    onChange={(e) => setYardForm({ ...yardForm, city: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Vehicle Storage Capacity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 150 Cars"
                    value={yardForm.capacity}
                    onChange={(e) => setYardForm({ ...yardForm, capacity: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Operational Status *
                  </label>
                  <select
                    value={yardForm.status}
                    onChange={(e) => setYardForm({ ...yardForm, status: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Yard In-Charge Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Choudhary"
                    value={yardForm.manager}
                    onChange={(e) => setYardForm({ ...yardForm, manager: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98290 00000"
                    value={yardForm.phone}
                    onChange={(e) => setYardForm({ ...yardForm, phone: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowYardModal(false)}
                  className="h-8 px-3.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingYard ? 'Save Changes' : 'Create Stockyard'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT BRANCH                                                  */}
      {/* ========================================================================= */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-surface text-ink w-full max-w-lg rounded-panel overflow-hidden border border-line shadow-pop flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {editingBranch ? 'Edit Showroom Branch' : 'Add New Showroom Branch'}
                  </h2>
                  <p className="text-xs text-ink-3">Configure branch name, brand dealership, and operational status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBranchModal(false)}
                className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Branch / Showroom Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pratap Nagar, Bhagat Ki Kothi, Sumerpur..."
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Brand Assignment *
                  </label>
                  <select
                    value={branchForm.brand}
                    onChange={(e) => setBranchForm({ ...branchForm, brand: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Hyundai">Hyundai</option>
                                      </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Branch Type
                  </label>
                  <select
                    value={branchForm.type}
                    onChange={(e) => setBranchForm({ ...branchForm, type: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="Main Showroom">Main Showroom</option>
                    <option value="RSO">RSO (Regional / Rural Sales Outlet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jodhpur, Pali, Balotra..."
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Operational Status *
                  </label>
                  <select
                    value={branchForm.status}
                    onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value as any })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Branch Manager Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={branchForm.manager}
                    onChange={(e) => setBranchForm({ ...branchForm, manager: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98290 00000"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded text-xs font-medium text-ink focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="h-8 px-3.5 rounded bg-surface border border-line hover:border-line-strong text-xs font-semibold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-accent hover:bg-accent-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingBranch ? 'Save Changes' : 'Create Branch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export const AdminMasterPanelPage = AdminMasterPanel;
