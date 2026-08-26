import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, Car, ShieldCheck, CreditCard, 
  Settings, Plus, Search, ChevronRight, CheckCircle2, 
  Briefcase, MapPin, DollarSign, Layers, Shield, Sparkles, 
  FileSpreadsheet, Activity, Wrench, X, Loader2, Camera,
  Video, Edit3, Trash2, Check, AlertTriangle, Sliders,
  Landmark, ShieldAlert, Phone, Mail, UserCheck
} from 'lucide-react';
import { AdminUsersPage } from './AdminUsers';

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

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  type: string;
  city: string;
  state: string;
  pincode?: string;
  address?: string;
  capacity: string;
  phone: string;
  email?: string;
  manager: string;
  status?: string;
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
  const [activeTab, setActiveTab] = useState<'PDI_RULES' | 'USERS' | 'MODELS' | 'BRANCHES' | 'FINANCE' | 'INSURANCE'>('PDI_RULES');

  // =========================================================================
  // 1. PDI Rules State
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
  // 2. Showrooms & Stockyards State
  // =========================================================================
  const [branches, setBranches] = useState<BranchItem[]>(() => {
    const saved = localStorage.getItem('autoprime_branches');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'br-1', code: 'BR-PUN-01', name: 'Dhoot Group - Wakad Central Hub', brand: 'Tata Motors', type: '3S (Sales, Service, Spares)', city: 'Pune', state: 'Maharashtra', pincode: '411057', address: 'Plot 45, Wakad Bypass Highway', capacity: '120 Cars', phone: '+91 20 6711 9000', email: 'wakad.tata@dhootgroup.com', manager: 'Rajesh Patil', status: 'ACTIVE' },
      { id: 'br-2', code: 'BR-JAI-01', name: 'Dhoot Group - Jaipur Tonk Road Hub', brand: 'Tata Motors', type: '3S (Sales, Service, Spares)', city: 'Jaipur', state: 'Rajasthan', pincode: '302015', address: 'Tonk Road Commercial Arcade', capacity: '150 Cars', phone: '+91 141 278 1100', email: 'jaipur.tata@dhootgroup.com', manager: 'Sunil Sharma', status: 'ACTIVE' },
      { id: 'br-3', code: 'BR-JAI-02', name: 'Dhoot Group - Raja Park Showroom', brand: 'Hyundai', type: '1S Showroom', city: 'Jaipur', state: 'Rajasthan', pincode: '302004', address: 'Main Raja Park Avenue', capacity: '30 Cars', phone: '+91 141 262 4455', email: 'rajapark.hyundai@dhootgroup.com', manager: 'Manish Rathore', status: 'ACTIVE' },
      { id: 'br-4', code: 'BR-YRD-01', name: 'Dhoot Group - Chakan Central Stockyard', brand: 'Dhoot Group Shared', type: 'Central Stockyard', city: 'Pune', state: 'Maharashtra', pincode: '410501', address: 'MIDC Phase II Logistics Hub', capacity: '350 Cars', phone: '+91 2135 667788', email: 'chakan.yard@dhootgroup.com', manager: 'Vikram Sonawane', status: 'ACTIVE' },
    ];
  });

  // =========================================================================
  // 3. Banks & Financiers State
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
  // 4. Insurance Companies State
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

  // =========================================================================
  // 5. Vehicle Models State
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
  // MODAL FORMS STATE & CONTROLS
  // =========================================================================
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PdiRuleItem | null>(null);
  const [ruleForm, setRuleForm] = useState<PdiRuleItem>({
    id: `RULE-${Date.now().toString().slice(-4)}`,
    stage: 'Exterior',
    category: 'Body Panels',
    code: 'RULE-01',
    title: '',
    description: '',
    mandatory: true,
    photosRequired: 1,
    videoRequired: false,
    severity: 'CRITICAL',
    toolRequired: 'Visual'
  });

  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [branchForm, setBranchForm] = useState<BranchItem>({
    id: '',
    code: `BR-${Date.now().toString().slice(-4)}`,
    name: '',
    brand: 'Tata Motors',
    type: '3S (Sales, Service, Spares)',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    address: '',
    capacity: '100 Cars',
    phone: '+91 ',
    email: '',
    manager: '',
    status: 'ACTIVE'
  });

  const [showFinModal, setShowFinModal] = useState(false);
  const [editingFinancier, setEditingFinancier] = useState<FinancierItem | null>(null);
  const [finForm, setFinForm] = useState<FinancierItem>({
    id: '',
    name: '',
    category: 'PRIVATE_BANK',
    code: `FIN-${Date.now().toString().slice(-4)}`,
    contactPerson: '',
    designation: 'DSA Manager',
    phone: '+91 ',
    email: '',
    maxLtv: 90,
    processingFee: 0.5,
    activeStatus: 'Active Tie-Up'
  });

  const [showInsModal, setShowInsModal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceItem | null>(null);
  const [insForm, setInsForm] = useState<InsuranceItem>({
    id: '',
    name: '',
    code: `INS-${Date.now().toString().slice(-4)}`,
    claimsHead: '',
    surveyorName: '',
    surveyorContact: '+91 1800 ',
    cashlessTieUp: true,
    discountPercentage: 60,
    policyTypes: 'Zero Dep, Engine Protect, RTI'
  });

  const [showModelModal, setShowModelModal] = useState(false);
  const [editingModel, setEditingModel] = useState<any | null>(null);
  const [modelForm, setModelForm] = useState({
    brand: 'Tata Motors',
    model_name: '',
    body_type: 'SUV',
    base_ex_showroom: 999000,
    fuel_types: 'PETROL, DIESEL',
    transmission: 'Manual & Automatic',
    seating_capacity: '5 Seater',
    variants: 'Pure, Adventure, Fearless',
    colors: 'Oberon Black, Daytona Grey, White',
    gst_rate: 28
  });

  const [modelBrandFilter, setModelBrandFilter] = useState<'ALL' | 'Tata Motors' | 'Hyundai'>('ALL');
  const [branchBrandFilter, setBranchBrandFilter] = useState<'ALL' | 'Tata Motors' | 'Hyundai'>('ALL');

  useEffect(() => {
    if (currentBrand.code === 'DHOOT-TATA') {
      setModelBrandFilter('Tata Motors');
      setBranchBrandFilter('Tata Motors');
    } else if (currentBrand.code === 'DHOOT-HYUNDAI') {
      setModelBrandFilter('Hyundai');
      setBranchBrandFilter('Hyundai');
    } else {
      setModelBrandFilter('ALL');
      setBranchBrandFilter('ALL');
    }
  }, [currentBrand.code]);

  // ==========================================
  // HANDLERS: PDI RULES
  // ==========================================
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: PdiRuleItem[];
    if (editingRule) {
      updated = pdiRules.map(r => r.id === editingRule.id ? { ...ruleForm, id: editingRule.id } : r);
    } else {
      updated = [...pdiRules, { ...ruleForm, id: `RULE-${pdiRules.length + 1 < 10 ? '0' : ''}${pdiRules.length + 1}` }];
    }
    setPdiRules(updated);
    localStorage.setItem('autoprime_pdi_rules', JSON.stringify(updated));
    setShowRuleModal(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Delete this inspection checkpoint from the active checklist?')) {
      const updated = pdiRules.filter(r => r.id !== id);
      setPdiRules(updated);
      localStorage.setItem('autoprime_pdi_rules', JSON.stringify(updated));
    }
  };

  // ==========================================
  // HANDLERS: BRANCHES
  // ==========================================
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: BranchItem[];
    if (editingBranch) {
      updated = branches.map(b => b.id === editingBranch.id ? { ...branchForm, id: editingBranch.id } : b);
    } else {
      const newBr: BranchItem = {
        id: `br-${Date.now()}`,
        ...branchForm
      };
      updated = [newBr, ...branches];
    }
    setBranches(updated);
    localStorage.setItem('autoprime_branches', JSON.stringify(updated));
    setShowBranchModal(false);
    setEditingBranch(null);
  };

  const handleDeleteBranch = (id: string) => {
    if (confirm('Are you sure you want to remove this showroom/stockyard?')) {
      const updated = branches.filter(b => b.id !== id);
      setBranches(updated);
      localStorage.setItem('autoprime_branches', JSON.stringify(updated));
    }
  };

  // ==========================================
  // HANDLERS: FINANCIERS
  // ==========================================
  const handleSaveFinancier = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: FinancierItem[];
    if (editingFinancier) {
      updated = financiers.map(f => f.id === editingFinancier.id ? { ...finForm, id: editingFinancier.id } : f);
    } else {
      const newF: FinancierItem = {
        id: `fin-${Date.now()}`,
        ...finForm
      };
      updated = [newF, ...financiers];
    }
    setFinanciers(updated);
    localStorage.setItem('autoprime_financiers', JSON.stringify(updated));
    setShowFinModal(false);
    setEditingFinancier(null);
  };

  const handleDeleteFinancier = (id: string) => {
    if (confirm('Remove this banking financier partner?')) {
      const updated = financiers.filter(f => f.id !== id);
      setFinanciers(updated);
      localStorage.setItem('autoprime_financiers', JSON.stringify(updated));
    }
  };

  // ==========================================
  // HANDLERS: INSURANCE
  // ==========================================
  const handleSaveInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: InsuranceItem[];
    if (editingInsurance) {
      updated = insuranceProviders.map(i => i.id === editingInsurance.id ? { ...insForm, id: editingInsurance.id } : i);
    } else {
      const newIns: InsuranceItem = {
        id: `ins-${Date.now()}`,
        ...insForm
      };
      updated = [newIns, ...insuranceProviders];
    }
    setInsuranceProviders(updated);
    localStorage.setItem('autoprime_insurance', JSON.stringify(updated));
    setShowInsModal(false);
    setEditingInsurance(null);
  };

  const handleDeleteInsurance = (id: string) => {
    if (confirm('Remove this general insurance partner?')) {
      const updated = insuranceProviders.filter(i => i.id !== id);
      setInsuranceProviders(updated);
      localStorage.setItem('autoprime_insurance', JSON.stringify(updated));
    }
  };

  // ==========================================
  // HANDLERS: VEHICLE MODELS
  // ==========================================
  const handleSaveModel = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = {
      brand: modelForm.brand,
      model_name: modelForm.model_name,
      body_type: modelForm.body_type,
      base_ex_showroom: Number(modelForm.base_ex_showroom),
      fuel_types: typeof modelForm.fuel_types === 'string' ? modelForm.fuel_types.split(',').map(s => s.trim()) : modelForm.fuel_types,
      transmission: modelForm.transmission,
      seating_capacity: modelForm.seating_capacity,
      variants: typeof modelForm.variants === 'string' ? modelForm.variants.split(',').map(s => s.trim()) : modelForm.variants,
      colors: typeof modelForm.colors === 'string' ? modelForm.colors.split(',').map(s => s.trim()) : modelForm.colors,
      gst_rate: Number(modelForm.gst_rate) || 28
    };

    let updated: any[];
    if (editingModel) {
      updated = vehicleModels.map(m => m.id === editingModel.id ? { ...formatted, id: editingModel.id } : m);
    } else {
      updated = [{ ...formatted, id: `m-${Date.now()}` }, ...vehicleModels];
    }
    setVehicleModels(updated);
    localStorage.setItem('autoprime_models', JSON.stringify(updated));
    setShowModelModal(false);
    setEditingModel(null);
  };

  const handleDeleteModel = (id: string) => {
    if (confirm('Remove this model from vehicle catalog?')) {
      const updated = vehicleModels.filter(m => m.id !== id);
      setVehicleModels(updated);
      localStorage.setItem('autoprime_models', JSON.stringify(updated));
    }
  };

  const filteredModels = vehicleModels.filter(m => {
    if (modelBrandFilter === 'Tata Motors') return m.brand?.includes('Tata');
    if (modelBrandFilter === 'Hyundai') return m.brand?.includes('Hyundai');
    return true;
  });

  const filteredBranches = branches.filter(b => {
    if (branchBrandFilter === 'Tata Motors') return b.brand?.includes('Tata') || b.brand?.includes('Shared');
    if (branchBrandFilter === 'Hyundai') return b.brand?.includes('Hyundai') || b.brand?.includes('Shared');
    return true;
  });

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">
            Master Data
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure vehicle models, inspection checklists, branches, and financier partners
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting complete dealership configuration masters to CSV...')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Masters</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs text-xs font-bold">
        <button
          onClick={() => setActiveTab('PDI_RULES')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PDI_RULES' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Inspection Rules ({pdiRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'USERS' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users & RBAC Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('MODELS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'MODELS' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Vehicle Catalog ({filteredModels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'BRANCHES' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Showrooms & Yards ({filteredBranches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FINANCE')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'FINANCE' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Banks & Financiers ({financiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INSURANCE')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'INSURANCE' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          <span>Insurance Providers ({insuranceProviders.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DYNAMIC INSPECTION RULES ENGINE                                    */}
      {/* ========================================================================= */}
      {activeTab === 'PDI_RULES' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Inspection Checkpoints & Evidence Rules</h2>
              <p className="text-[11px] text-slate-400">
                Configure checkpoint parameters, required photo counts (0-4), and mandatory video recording rules.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingRule(null);
                setRuleForm({
                  id: `RULE-${pdiRules.length + 1}`,
                  stage: 'Exterior',
                  category: 'General Inspection',
                  code: `RULE-0${pdiRules.length + 1}`,
                  title: '',
                  description: '',
                  mandatory: true,
                  photosRequired: 1,
                  videoRequired: false,
                  severity: 'CRITICAL',
                  toolRequired: 'Visual'
                });
                setShowRuleModal(true);
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Inspection Point</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Rule ID</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Inspection Checkpoint</th>
                  <th className="py-2.5 px-3">Detailed Instruction</th>
                  <th className="py-2.5 px-3">Photos</th>
                  <th className="py-2.5 px-3">Video</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {pdiRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{rule.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{rule.stage}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{rule.title}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-sm truncate" title={rule.description}>{rule.description}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.photosRequired > 0 ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Camera className="w-3 h-3" />
                        {rule.photosRequired} Photos
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.videoRequired ? 'bg-purple-50 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Video className="w-3 h-3" />
                        {rule.videoRequired ? 'Mandatory Video' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingRule(rule);
                            setRuleForm(rule);
                            setShowRuleModal(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Rule Checkpoint"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Rule Checkpoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USERS & RBAC ROLES                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <AdminUsersPage />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VEHICLE CATALOG & PRICE MATRIX                                     */}
      {/* ========================================================================= */}
      {activeTab === 'MODELS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Vehicle Models & Pricing Matrix</h2>
              <p className="text-[11px] text-slate-400">Official catalog for Tata Motors & Hyundai Motor India</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                {(['ALL', 'Tata Motors', 'Hyundai'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setModelBrandFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                      modelBrandFilter === tab
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'ALL' ? 'All Brands' : tab}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setEditingModel(null);
                  setModelForm({
                    brand: modelBrandFilter === 'Hyundai' ? 'Hyundai' : 'Tata Motors',
                    model_name: '',
                    body_type: 'SUV',
                    base_ex_showroom: 999000,
                    fuel_types: 'PETROL, DIESEL',
                    transmission: 'Manual & Automatic',
                    seating_capacity: '5 Seater',
                    variants: 'Pure, Adventure, Fearless',
                    colors: 'Oberon Black, Daytona Grey, White',
                    gst_rate: 28
                  });
                  setShowModelModal(true);
                }}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle Model</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3">Model Name</th>
                  <th className="py-2.5 px-3">Body Type</th>
                  <th className="py-2.5 px-3">Base Ex-Showroom</th>
                  <th className="py-2.5 px-3">Fuel Options</th>
                  <th className="py-2.5 px-3">Key Variants</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {vehicleModels
                  .filter(m => {
                    if (modelBrandFilter === 'Tata Motors') return m.brand?.includes('Tata');
                    if (modelBrandFilter === 'Hyundai') return m.brand?.includes('Hyundai');
                    return true;
                  })
                  .map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.brand?.includes('Tata') ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}>
                        {m.brand}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.model_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.body_type}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">₹{(Number(m.base_ex_showroom) || 0).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-slate-600">{Array.isArray(m.fuel_types) ? m.fuel_types.join(', ') : m.fuel_types}</td>
                    <td className="py-2.5 px-3 text-slate-600">{Array.isArray(m.variants) ? m.variants.slice(0, 4).join(', ') : m.variants}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingModel(m);
                            setModelForm({
                              brand: m.brand,
                              model_name: m.model_name,
                              body_type: m.body_type,
                              base_ex_showroom: m.base_ex_showroom,
                              fuel_types: Array.isArray(m.fuel_types) ? m.fuel_types.join(', ') : m.fuel_types,
                              transmission: m.transmission || 'Manual & Automatic',
                              seating_capacity: m.seating_capacity || '5 Seater',
                              variants: Array.isArray(m.variants) ? m.variants.join(', ') : m.variants,
                              colors: Array.isArray(m.colors) ? m.colors.join(', ') : (m.colors || 'White, Black, Grey'),
                              gst_rate: m.gst_rate || 28
                            });
                            setShowModelModal(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Vehicle Model"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModel(m.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Model"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SHOWROOMS & STOCKYARDS                                             */}
      {/* ========================================================================= */}
      {activeTab === 'BRANCHES' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Showrooms, 3S Workshops & Central Stockyards</h2>
              <p className="text-[11px] text-slate-400">Manage dealer facilities, stockyard capacity, and regional managers</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                {(['ALL', 'Tata Motors', 'Hyundai'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setBranchBrandFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                      branchBrandFilter === tab
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'ALL' ? 'All Facilities' : tab}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setEditingBranch(null);
                  setBranchForm({
                    id: '',
                    code: `BR-${Date.now().toString().slice(-4)}`,
                    name: '',
                    brand: branchBrandFilter === 'Hyundai' ? 'Hyundai' : 'Tata Motors',
                    type: '3S (Sales, Service, Spares)',
                    city: 'Pune',
                    state: 'Maharashtra',
                    pincode: '411057',
                    address: '',
                    capacity: '100 Cars',
                    phone: '+91 ',
                    email: '',
                    manager: '',
                    status: 'ACTIVE'
                  });
                  setShowBranchModal(true);
                }}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Showroom / Stockyard</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Branch Code</th>
                  <th className="py-2.5 px-3">Facility Name</th>
                  <th className="py-2.5 px-3">Dealership Brand</th>
                  <th className="py-2.5 px-3">Facility Type</th>
                  <th className="py-2.5 px-3">City & State</th>
                  <th className="py-2.5 px-3">Yard Capacity</th>
                  <th className="py-2.5 px-3">Manager & Contact</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {branches
                  .filter(b => {
                    if (branchBrandFilter === 'Tata Motors') return b.brand?.includes('Tata') || b.brand?.includes('Shared');
                    if (branchBrandFilter === 'Hyundai') return b.brand?.includes('Hyundai') || b.brand?.includes('Shared');
                    return true;
                  })
                  .map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{b.name}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{b.brand}</td>
                    <td className="py-2.5 px-3 text-slate-600">{b.type}</td>
                    <td className="py-2.5 px-3 text-slate-600">{b.city}, {b.state}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{b.capacity}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">{b.manager}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.phone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingBranch(b);
                            setBranchForm(b);
                            setShowBranchModal(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Facility Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(b.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Facility"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BANKS & FINANCIERS                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'FINANCE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Approved Banking & Auto Loan Financiers</h2>
              <p className="text-[11px] text-slate-400">Manage DSA tie-ups, loan desk officers, and payout channels</p>
            </div>
            <button
              onClick={() => {
                setEditingFinancier(null);
                setFinForm({
                  id: '',
                  name: '',
                  category: 'PRIVATE_BANK',
                  code: `FIN-${Date.now().toString().slice(-4)}`,
                  contactPerson: '',
                  designation: 'DSA Manager',
                  phone: '+91 ',
                  email: '',
                  maxLtv: 90,
                  processingFee: 0.5,
                  activeStatus: 'Active Tie-Up'
                });
                setShowFinModal(true);
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bank / Financier</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Institution Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Contact Person</th>
                  <th className="py-2.5 px-3">Helpdesk Phone</th>
                  <th className="py-2.5 px-3">Email Desk</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {financiers.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{f.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                        {f.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">{f.contactPerson}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{f.phone}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">{f.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        {f.activeStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingFinancier(f);
                            setFinForm(f);
                            setShowFinModal(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Financier Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFinancier(f.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Financier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: INSURANCE PROVIDERS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'INSURANCE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Authorized General Insurance Partners</h2>
              <p className="text-[11px] text-slate-400">Cashless claim tie-ups, surveyor contacts, and dealer OD discount grids</p>
            </div>
            <button
              onClick={() => {
                setEditingInsurance(null);
                setInsForm({
                  id: '',
                  name: '',
                  code: `INS-${Date.now().toString().slice(-4)}`,
                  claimsHead: '',
                  surveyorName: '',
                  surveyorContact: '+91 1800 ',
                  cashlessTieUp: true,
                  discountPercentage: 60,
                  policyTypes: 'Zero Dep, Engine Protect, RTI'
                });
                setShowInsModal(true);
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Insurance Company</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Insurance Company</th>
                  <th className="py-2.5 px-3">Claims Head / Desk Lead</th>
                  <th className="py-2.5 px-3">Surveyor Contact</th>
                  <th className="py-2.5 px-3">OD Discount Grid</th>
                  <th className="py-2.5 px-3">Cashless Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {insuranceProviders.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{ins.name}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">{ins.claimsHead}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{ins.surveyorContact}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{ins.discountPercentage}% OD Tariff</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        ✓ Cashless Approved
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingInsurance(ins);
                            setInsForm(ins);
                            setShowInsModal(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Insurance Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInsurance(ins.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Insurance"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT PDI RULE (FULL SCHEMA COLUMNS)                         */}
      {/* ========================================================================= */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-bold text-sm">{editingRule ? `Edit Checkpoint: ${editingRule.id}` : 'Configure New Inspection Point'}</h3>
              <button onClick={() => setShowRuleModal(false)} className="p-1 rounded-xl hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRule} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Inspection Stage *</label>
                  <select value={ruleForm.stage} onChange={(e) => setRuleForm({ ...ruleForm, stage: e.target.value as any })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="Exterior">Stage 1: Exterior</option>
                    <option value="Electricals">Stage 2: Electricals</option>
                    <option value="Interior">Stage 3: Interior</option>
                    <option value="Engine Bay">Stage 4: Engine Bay</option>
                    <option value="Underbody">Stage 5: Underbody</option>
                    <option value="Road Test">Stage 6: Road Test</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Defect Severity If Failed *</label>
                  <select value={ruleForm.severity} onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value as any })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="CRITICAL">CRITICAL (Blocks Delivery)</option>
                    <option value="MAJOR">MAJOR (Requires Workshop Fix)</option>
                    <option value="MINOR">MINOR (Touch-up / Buffing)</option>
                    <option value="OBSERVATION">OBSERVATION (Informational)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category Code / Group</label>
                  <input type="text" placeholder="e.g. Body Panels / Lighting" value={ruleForm.category || ''} onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Required Diagnostic Tool</label>
                  <input type="text" placeholder="e.g. VCI Scanner / Feeler Gauge" value={ruleForm.toolRequired || ''} onChange={(e) => setRuleForm({ ...ruleForm, toolRequired: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Checkpoint Point Title *</label>
                  <input type="text" required placeholder="e.g. Body Panel Alignment & Paint Finish" value={ruleForm.title} onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Detailed Inspection Instruction</label>
                  <textarea rows={2} value={ruleForm.description} onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Required Photos Count</label>
                  <select value={ruleForm.photosRequired} onChange={(e) => setRuleForm({ ...ruleForm, photosRequired: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value={0}>0 (Optional)</option>
                    <option value={1}>1 Mandatory Photo</option>
                    <option value={2}>2 Mandatory Photos</option>
                    <option value={3}>3 Mandatory Photos</option>
                    <option value={4}>4 Mandatory Photos</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Video Recording Rule</label>
                  <select value={ruleForm.videoRequired ? 'REQUIRED' : 'OPTIONAL'} onChange={(e) => setRuleForm({ ...ruleForm, videoRequired: e.target.value === 'REQUIRED' })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="OPTIONAL">Optional Video</option>
                    <option value="REQUIRED">Mandatory Video Recording</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowRuleModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">
                  {editingRule ? 'Update Rule' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT SHOWROOM / STOCKYARD (FULL SCHEMA COLUMNS)             */}
      {/* ========================================================================= */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-bold text-sm">{editingBranch ? `Edit Facility: ${editingBranch.code}` : 'Add Dealership Showroom / Stockyard'}</h3>
              <button onClick={() => setShowBranchModal(false)} className="p-1 rounded-xl hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBranch} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Branch / Facility Code *</label>
                  <input type="text" required placeholder="e.g. BR-PUN-01" value={branchForm.code} onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Facility Name *</label>
                  <input type="text" required placeholder="e.g. Dhoot Group - Wakad Hub" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Dealership Brand *</label>
                  <select value={branchForm.brand} onChange={(e) => setBranchForm({ ...branchForm, brand: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Dhoot Group Shared">Dhoot Group Shared Facility</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Facility Type</label>
                  <select value={branchForm.type} onChange={(e) => setBranchForm({ ...branchForm, type: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                    <option value="3S (Sales, Service, Spares)">3S (Sales, Service, Spares)</option>
                    <option value="1S Showroom">1S Showroom</option>
                    <option value="Central Stockyard">Central Stockyard</option>
                    <option value="Bodyshop & Workshop">Bodyshop & Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                  <input type="text" required value={branchForm.city} onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">State</label>
                  <input type="text" required value={branchForm.state} onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Pincode</label>
                  <input type="text" placeholder="e.g. 411057" value={branchForm.pincode || ''} onChange={(e) => setBranchForm({ ...branchForm, pincode: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Yard Vehicle Capacity</label>
                  <input type="text" placeholder="e.g. 150 Cars" value={branchForm.capacity} onChange={(e) => setBranchForm({ ...branchForm, capacity: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Postal Address</label>
                  <input type="text" placeholder="Plot No, Street, Industrial Area" value={branchForm.address || ''} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Facility / Yard Manager</label>
                  <input type="text" placeholder="e.g. Rajesh Patil" value={branchForm.manager} onChange={(e) => setBranchForm({ ...branchForm, manager: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Official Mobile Contact</label>
                  <input type="tel" value={branchForm.phone} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowBranchModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">
                  {editingBranch ? 'Update Facility' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT BANK / FINANCIER (FULL SCHEMA COLUMNS)                 */}
      {/* ========================================================================= */}
      {showFinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-bold text-sm">{editingFinancier ? `Edit Financier: ${editingFinancier.name}` : 'Add Banking / Financier Partner'}</h3>
              <button onClick={() => setShowFinModal(false)} className="p-1 rounded-xl hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFinancier} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Financial Institution Name *</label>
                <input type="text" required placeholder="e.g. Kotak Mahindra Prime Ltd" value={finForm.name} onChange={(e) => setFinForm({ ...finForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select value={finForm.category} onChange={(e) => setFinForm({ ...finForm, category: e.target.value as any })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="PRIVATE_BANK">Private Bank</option>
                    <option value="NATIONALISED_BANK">Nationalised PSU Bank</option>
                    <option value="OEM_CAPTIVE_NBFC">OEM Captive Finance</option>
                    <option value="NBFC">Non-Banking Financial Company (NBFC)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">DSA / Partner Code</label>
                  <input type="text" placeholder="e.g. FIN-KOT-01" value={finForm.code || ''} onChange={(e) => setFinForm({ ...finForm, code: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Person</label>
                  <input type="text" placeholder="e.g. Ritesh Deshmukh" value={finForm.contactPerson} onChange={(e) => setFinForm({ ...finForm, contactPerson: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Official Phone</label>
                  <input type="tel" value={finForm.phone} onChange={(e) => setFinForm({ ...finForm, phone: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Official Email Desk</label>
                  <input type="email" placeholder="auto@bank.com" value={finForm.email} onChange={(e) => setFinForm({ ...finForm, email: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Max LTV (%)</label>
                  <input type="number" value={finForm.maxLtv || 90} onChange={(e) => setFinForm({ ...finForm, maxLtv: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowFinModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">
                  {editingFinancier ? 'Update Financier' : 'Save Financier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT INSURANCE COMPANY (FULL SCHEMA COLUMNS)                */}
      {/* ========================================================================= */}
      {showInsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-bold text-sm">{editingInsurance ? `Edit Insurance: ${editingInsurance.name}` : 'Add General Insurance Provider'}</h3>
              <button onClick={() => setShowInsModal(false)} className="p-1 rounded-xl hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveInsurance} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Insurance Company *</label>
                  <input type="text" required placeholder="e.g. Royal Sundaram" value={insForm.name} onChange={(e) => setInsForm({ ...insForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">IRDAI / Partner Code</label>
                  <input type="text" placeholder="e.g. INS-ROY-01" value={insForm.code || ''} onChange={(e) => setInsForm({ ...insForm, code: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Claims Desk Head</label>
                  <input type="text" placeholder="e.g. Arvind Mehta" value={insForm.claimsHead} onChange={(e) => setInsForm({ ...insForm, claimsHead: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Surveyor Contact</label>
                  <input type="tel" value={insForm.surveyorContact} onChange={(e) => setInsForm({ ...insForm, surveyorContact: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Dealership OD Discount (%)</label>
                  <input type="number" value={insForm.discountPercentage} onChange={(e) => setInsForm({ ...insForm, discountPercentage: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Cashless Claim Status</label>
                  <select value={insForm.cashlessTieUp ? 'YES' : 'NO'} onChange={(e) => setInsForm({ ...insForm, cashlessTieUp: e.target.value === 'YES' })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="YES">✓ Approved Cashless Partner</option>
                    <option value="NO">Reimbursement Basis</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Supported Policy Add-on Covers</label>
                <input type="text" placeholder="e.g. Zero Dep, RTI, Engine Protect, Key Replacement" value={insForm.policyTypes || ''} onChange={(e) => setInsForm({ ...insForm, policyTypes: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowInsModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">
                  {editingInsurance ? 'Update Insurance' : 'Save Insurance Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD / EDIT VEHICLE MODEL (FULL SCHEMA COLUMNS)                    */}
      {/* ========================================================================= */}
      {showModelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-bold text-sm">{editingModel ? `Edit Model: ${editingModel.model_name}` : 'Add Vehicle Model to Catalog'}</h3>
              <button onClick={() => setShowModelModal(false)} className="p-1 rounded-xl hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveModel} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">OEM Brand *</label>
                  <select value={modelForm.brand} onChange={(e) => setModelForm({ ...modelForm, brand: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Hyundai">Hyundai</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Model Name *</label>
                  <input type="text" required placeholder="e.g. Tata Curvv or Hyundai Alcazar" value={modelForm.model_name} onChange={(e) => setModelForm({ ...modelForm, model_name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Body Type</label>
                  <input type="text" placeholder="SUV / Sedan / EV" value={modelForm.body_type} onChange={(e) => setModelForm({ ...modelForm, body_type: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Base Price (₹)</label>
                  <input type="number" value={modelForm.base_ex_showroom} onChange={(e) => setModelForm({ ...modelForm, base_ex_showroom: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Transmission Options</label>
                  <input type="text" placeholder="Manual, Automatic, DCT" value={modelForm.transmission || ''} onChange={(e) => setModelForm({ ...modelForm, transmission: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Seating Capacity</label>
                  <input type="text" placeholder="5 Seater / 7 Seater" value={modelForm.seating_capacity || ''} onChange={(e) => setModelForm({ ...modelForm, seating_capacity: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Fuel Types (Comma separated)</label>
                <input type="text" placeholder="PETROL, DIESEL, iCNG, EV" value={String(modelForm.fuel_types || '')} onChange={(e) => setModelForm({ ...modelForm, fuel_types: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Available Variants (Comma separated)</label>
                <input type="text" placeholder="Pure, Adventure, Fearless, Accomplished" value={String(modelForm.variants || '')} onChange={(e) => setModelForm({ ...modelForm, variants: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModelModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">
                  {editingModel ? 'Update Model' : 'Save Model'}
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

