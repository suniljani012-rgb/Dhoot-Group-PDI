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
  title: string;
  description: string;
  mandatory: boolean;
  photosRequired: number;
  videoRequired: boolean;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';
}

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  type: string;
  city: string;
  state: string;
  address: string;
  capacity: string;
  phone: string;
  manager: string;
}

export interface FinancierItem {
  id: string;
  name: string;
  category: 'NATIONALISED_BANK' | 'PRIVATE_BANK' | 'OEM_CAPTIVE_NBFC' | 'NBFC';
  contactPerson: string;
  phone: string;
  email: string;
  activeStatus: string;
}

export interface InsuranceItem {
  id: string;
  name: string;
  claimsHead: string;
  surveyorContact: string;
  cashlessTieUp: boolean;
  discountPercentage: number;
}

export const AdminMasterPanelPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [activeTab, setActiveTab] = useState<'PDI_RULES' | 'USERS' | 'MODELS' | 'BRANCHES' | 'FINANCE' | 'INSURANCE'>('PDI_RULES');
  
  // 1. PDI Inspection Rules State (Persisted in LocalStorage)
  const [pdiRules, setPdiRules] = useState<PdiRuleItem[]>(() => {
    const saved = localStorage.getItem('autoprime_pdi_rules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'RULE-01', stage: 'Exterior', title: 'Body Panel Gaps & Paint Finish', description: 'Inspect all 4 doors, bonnet, boot lid alignment, and scan for paint blemishes or scratches.', mandatory: true, photosRequired: 2, videoRequired: false, severity: 'CRITICAL' },
      { id: 'RULE-02', stage: 'Exterior', title: 'Windshield, Glass & Beadings', description: 'Verify all window glass, quarter glasses, windshield sealant, and weatherstrips.', mandatory: true, photosRequired: 1, videoRequired: false, severity: 'MAJOR' },
      { id: 'RULE-03', stage: 'Exterior', title: 'Wheels, Tyres & Disc Condition', description: 'Check tyre DOT manufacturing date, alloy rims, tyre pressure, and wheel lug nut torque.', mandatory: true, photosRequired: 1, videoRequired: false, severity: 'CRITICAL' },
      { id: 'RULE-04', stage: 'Electricals', title: 'Headlamps, DRLs, Fog & Indicators', description: 'Test low/high beam, sequential indicators, hazard lights, cornering lamps, and LED DRLs.', mandatory: true, photosRequired: 1, videoRequired: true, severity: 'CRITICAL' },
      { id: 'RULE-05', stage: 'Electricals', title: 'Infotainment, Speakers & Rear Camera', description: 'Operate touchscreen display, wireless Android Auto / Apple CarPlay, 360-degree camera, and audio.', mandatory: true, photosRequired: 1, videoRequired: true, severity: 'MAJOR' },
      { id: 'RULE-06', stage: 'Electricals', title: 'Instrument Cluster & Warning Lights', description: 'Verify MIL/Check Engine lights turn off after engine start. Check TPMS and ADAS displays.', mandatory: true, photosRequired: 1, videoRequired: false, severity: 'CRITICAL' },
      { id: 'RULE-07', stage: 'Interior', title: 'Seat Upholstery, Controls & Sunroof', description: 'Inspect leatherette seats, electric adjustments, seatbelts, ventilation, and panoramic sunroof slide/tilt.', mandatory: true, photosRequired: 2, videoRequired: true, severity: 'MAJOR' },
      { id: 'RULE-08', stage: 'Interior', title: 'Dual-Zone AC & Blower Function', description: 'Test climate control cooling, rear AC vents, temperature sensors, and air purifier filter.', mandatory: true, photosRequired: 1, videoRequired: false, severity: 'MAJOR' },
      { id: 'RULE-09', stage: 'Engine Bay', title: 'Engine Oil, Coolant & Brake Fluid Levels', description: 'Inspect fluid dipstick, coolant expansion tank, brake fluid reservoir, and washer fluid levels.', mandatory: true, photosRequired: 2, videoRequired: false, severity: 'CRITICAL' },
      { id: 'RULE-10', stage: 'Engine Bay', title: 'Battery Health & Terminal Tightness', description: 'Check 12V battery terminal cleanliness, voltage reading, and secure clamp fitting.', mandatory: true, photosRequired: 1, videoRequired: false, severity: 'CRITICAL' },
      { id: 'RULE-11', stage: 'Underbody', title: 'Suspension, Exhaust & Undercarriage Inspection', description: 'Lift vehicle on ramp. Check for any transit bottom scraping, rust, oil/fluid drips, and exhaust hanger integrity.', mandatory: true, photosRequired: 2, videoRequired: false, severity: 'CRITICAL' },
      { id: 'RULE-12', stage: 'Road Test', title: 'Transmission Shift, Steering Alignment & Braking', description: 'Short 2km road test. Check ABS brake bite, steering return-to-center, gear shift smoothness, and no abnormal cabin squeaks.', mandatory: true, photosRequired: 1, videoRequired: false, severity: 'CRITICAL' },
    ];
  });

  // 2. Showrooms & Stockyards State
  const [branches, setBranches] = useState<BranchItem[]>(() => {
    const saved = localStorage.getItem('autoprime_branches');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'br-1', code: 'BR-PUN-01', name: 'Autoprime Tata - Pune Main 3S Facility', brand: 'Autoprime Tata', type: '3S (Sales, Service, Spares)', city: 'Pune', state: 'Maharashtra', address: 'Wakad Highway, Pune', capacity: '120 Cars', phone: '+91 20 6789 0123', manager: 'Sanjay Deshmukh' },
      { id: 'br-2', code: 'BR-MUM-01', name: 'Autoprime Tata - Mumbai Central Hub', brand: 'Autoprime Tata', type: '1S Showroom + Bodyshop', city: 'Mumbai', state: 'Maharashtra', address: 'Andheri East, Mumbai', capacity: '80 Cars', phone: '+91 22 4567 8901', manager: 'Kiran Shah' },
      { id: 'br-3', code: 'BR-JPR-01', name: 'Raja Hyundai - Jaipur Central 3S Flagship', brand: 'Raja Hyundai', type: '3S Flagship Dealership', city: 'Jaipur', state: 'Rajasthan', address: 'Tonk Road, Jaipur', capacity: '150 Cars', phone: '+91 141 234 5678', manager: 'Vikram Joshi' },
      { id: 'br-4', code: 'BR-JDH-01', name: 'Raja Hyundai - Jodhpur Facility & Yard', brand: 'Raja Hyundai', type: '2S Service & Stockyard', city: 'Jodhpur', state: 'Rajasthan', address: 'Industrial Area, Jodhpur', capacity: '90 Cars', phone: '+91 291 345 6789', manager: 'Manish Rathore' },
    ];
  });

  // 3. Financiers & Banks State
  const [financiers, setFinanciers] = useState<FinancierItem[]>(() => {
    const saved = localStorage.getItem('autoprime_financiers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'fin-1', name: 'State Bank of India (SBI Auto Loans)', category: 'NATIONALISED_BANK', contactPerson: 'Anil Kumar (Chief Manager)', phone: '+91 141 223 9011', email: 'autoloans.sbi@sbi.co.in', activeStatus: 'Active Tie-Up' },
      { id: 'fin-2', name: 'HDFC Bank Ltd', category: 'PRIVATE_BANK', contactPerson: 'Pooja Verma (DSA Head)', phone: '+91 20 6789 2200', email: 'auto.hdfc@hdfcbank.com', activeStatus: 'Active Tie-Up' },
      { id: 'fin-3', name: 'ICICI Bank Ltd', category: 'PRIVATE_BANK', contactPerson: 'Rajesh Nair (Zonal Lead)', phone: '+91 22 4567 1100', email: 'autodesk@icicibank.com', activeStatus: 'Active Tie-Up' },
      { id: 'fin-4', name: 'Tata Capital Financial Services', category: 'OEM_CAPTIVE_NBFC', contactPerson: 'Vikram Joshi (Zonal Head)', phone: '+91 1800 209 6060', email: 'dealerdesk@tatacapital.com', activeStatus: 'Active Tie-Up' },
      { id: 'fin-5', name: 'Bajaj Finance Ltd', category: 'NBFC', contactPerson: 'Sunil Mehta (Regional Manager)', phone: '+91 20 7157 6064', email: 'auto@bajajfinserv.in', activeStatus: 'Active Tie-Up' },
    ];
  });

  // 4. Insurance Companies State
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceItem[]>(() => {
    const saved = localStorage.getItem('autoprime_insurance');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'ins-1', name: 'Tata AIG General Insurance', claimsHead: 'Kavita Sen (Zonal Claims Lead)', surveyorContact: '+91 1800 266 7780', cashlessTieUp: true, discountPercentage: 65 },
      { id: 'ins-2', name: 'ICICI Lombard General Insurance', claimsHead: 'Manoj Sharma (Surveyor Head)', surveyorContact: '+91 1800 2666', cashlessTieUp: true, discountPercentage: 60 },
      { id: 'ins-3', name: 'Bajaj Allianz General Insurance', claimsHead: 'Alok Gupta (Regional Claims Mgr)', surveyorContact: '+91 1800 209 5858', cashlessTieUp: true, discountPercentage: 62 },
      { id: 'ins-4', name: 'HDFC ERGO General Insurance', claimsHead: 'Sneha Patel (Claims Desk)', surveyorContact: '+91 1800 266 6444', cashlessTieUp: true, discountPercentage: 58 },
      { id: 'ins-5', name: 'National Insurance Company Ltd', claimsHead: 'R. K. Verma (Divisional Officer)', surveyorContact: '+91 1800 345 0330', cashlessTieUp: true, discountPercentage: 50 },
    ];
  });

  // 5. Vehicle Models State
  const [vehicleModels, setVehicleModels] = useState<any[]>(() => {
    const saved = localStorage.getItem('autoprime_models');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'm-1', brand: 'Autoprime Tata', model_name: 'Tata Safari', body_type: 'Flagship 6/7-Seater SUV', base_ex_showroom: 1619000, fuel_types: ['DIESEL'], variants: ['Smart', 'Pure', 'Adventure', 'Accomplished+'] },
      { id: 'm-2', brand: 'Autoprime Tata', model_name: 'Tata Harrier', body_type: 'Premium 5-Seater SUV', base_ex_showroom: 1549000, fuel_types: ['DIESEL'], variants: ['Smart', 'Pure', 'Adventure', 'Fearless+'] },
      { id: 'm-3', brand: 'Autoprime Tata', model_name: 'Tata Nexon', body_type: 'Compact SUV', base_ex_showroom: 799000, fuel_types: ['PETROL', 'DIESEL', 'iCNG', 'EV'], variants: ['Smart', 'Pure', 'Creative', 'Fearless+'] },
      { id: 'm-4', brand: 'Autoprime Tata', model_name: 'Tata Curvv / Curvv.ev', body_type: 'SUV Coupe', base_ex_showroom: 999000, fuel_types: ['PETROL', 'DIESEL', 'EV'], variants: ['Smart', 'Pure+', 'Creative+', 'Accomplished+'] },
      { id: 'm-5', brand: 'Autoprime Tata', model_name: 'Tata Punch', body_type: 'Micro SUV', base_ex_showroom: 612000, fuel_types: ['PETROL', 'iCNG', 'EV'], variants: ['Pure', 'Adventure', 'Accomplished', 'Creative'] },
      { id: 'm-6', brand: 'Raja Hyundai', model_name: 'Hyundai Creta', body_type: 'Midsize SUV', base_ex_showroom: 1099000, fuel_types: ['PETROL', 'DIESEL', 'TURBO'], variants: ['E', 'EX', 'S', 'SX', 'SX(O)'] },
      { id: 'm-7', brand: 'Raja Hyundai', model_name: 'Hyundai Venue / N Line', body_type: 'Compact SUV', base_ex_showroom: 794000, fuel_types: ['PETROL', 'DIESEL', 'TURBO'], variants: ['E', 'S', 'S(O)', 'SX', 'SX(O)'] },
      { id: 'm-8', brand: 'Raja Hyundai', model_name: 'Hyundai Verna', body_type: 'Premium Sedan', base_ex_showroom: 1100000, fuel_types: ['PETROL', 'TURBO GDi'], variants: ['EX', 'S', 'SX', 'SX(O)'] },
      { id: 'm-9', brand: 'Raja Hyundai', model_name: 'Hyundai Ioniq 5', body_type: 'Electric Crossover', base_ex_showroom: 4605000, fuel_types: ['EV (72.6 kWh)'], variants: ['RWD Long Range'] },
    ];
  });

  // Modals Controls
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PdiRuleItem | null>(null);
  const [ruleForm, setRuleForm] = useState<PdiRuleItem>({
    id: `RULE-${Date.now().toString().slice(-4)}`,
    stage: 'Exterior',
    title: '',
    description: '',
    mandatory: true,
    photosRequired: 1,
    videoRequired: false,
    severity: 'CRITICAL'
  });

  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({
    code: `BR-${Date.now().toString().slice(-4)}`,
    name: '',
    brand: 'Autoprime Tata',
    type: '3S (Sales, Service, Spares)',
    city: 'Pune',
    state: 'Maharashtra',
    address: '',
    capacity: '100 Cars',
    phone: '+91 ',
    manager: ''
  });

  const [showFinModal, setShowFinModal] = useState(false);
  const [finForm, setFinForm] = useState({
    name: '',
    category: 'PRIVATE_BANK' as any,
    contactPerson: '',
    phone: '+91 ',
    email: '',
    activeStatus: 'Active Tie-Up'
  });

  const [showInsModal, setShowInsModal] = useState(false);
  const [insForm, setInsForm] = useState({
    name: '',
    claimsHead: '',
    surveyorContact: '+91 1800 ',
    cashlessTieUp: true,
    discountPercentage: 60
  });

  const [showModelModal, setShowModelModal] = useState(false);
  const [modelForm, setModelForm] = useState({
    brand: 'Autoprime Tata',
    model_name: '',
    body_type: 'SUV',
    base_ex_showroom: 999000,
    fuel_types: 'PETROL, DIESEL',
    variants: 'Pure, Adventure, Fearless'
  });

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
    const newBr: BranchItem = {
      id: `br-${Date.now()}`,
      ...branchForm
    };
    const updated = [newBr, ...branches];
    setBranches(updated);
    localStorage.setItem('autoprime_branches', JSON.stringify(updated));
    setShowBranchModal(false);
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
    const newF: FinancierItem = {
      id: `fin-${Date.now()}`,
      ...finForm
    };
    const updated = [newF, ...financiers];
    setFinanciers(updated);
    localStorage.setItem('autoprime_financiers', JSON.stringify(updated));
    setShowFinModal(false);
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
    const newIns: InsuranceItem = {
      id: `ins-${Date.now()}`,
      ...insForm
    };
    const updated = [newIns, ...insuranceProviders];
    setInsuranceProviders(updated);
    localStorage.setItem('autoprime_insurance', JSON.stringify(updated));
    setShowInsModal(false);
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
    const newM = {
      id: `m-${Date.now()}`,
      brand: modelForm.brand,
      model_name: modelForm.model_name,
      body_type: modelForm.body_type,
      base_ex_showroom: Number(modelForm.base_ex_showroom),
      fuel_types: modelForm.fuel_types.split(',').map(s => s.trim()),
      variants: modelForm.variants.split(',').map(s => s.trim())
    };
    const updated = [newM, ...vehicleModels];
    setVehicleModels(updated);
    localStorage.setItem('autoprime_models', JSON.stringify(updated));
    setShowModelModal(false);
  };

  const handleDeleteModel = (id: string) => {
    if (confirm('Remove this model from vehicle catalog?')) {
      const updated = vehicleModels.filter(m => m.id !== id);
      setVehicleModels(updated);
      localStorage.setItem('autoprime_models', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-black text-slate-900 leading-tight">
            Dealership Master Administration
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Centralized management for inspection rules, RBAC users, vehicle catalog, multi-state branches, banks, and insurance partners
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

      {/* Tab Navigation Toolbar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PDI_RULES')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PDI_RULES' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
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
          <span>Vehicle Catalog ({vehicleModels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'BRANCHES' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Showrooms & Yards ({branches.length})</span>
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
                  title: '',
                  description: '',
                  mandatory: true,
                  photosRequired: 1,
                  videoRequired: false,
                  severity: 'CRITICAL'
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
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Vehicle Models & Pricing Matrix</h2>
              <p className="text-[11px] text-slate-400">Official catalog for Tata Motors & Hyundai Motor India</p>
            </div>
            <button
              onClick={() => setShowModelModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle Model</span>
            </button>
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
                {vehicleModels.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.brand === 'Autoprime Tata' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
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
                      <button onClick={() => handleDeleteModel(m.id)} className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Showrooms, 3S Workshops & Central Stockyards</h2>
              <p className="text-[11px] text-slate-400">Manage dealer facilities, stockyard capacity, and regional managers</p>
            </div>
            <button
              onClick={() => setShowBranchModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Showroom / Stockyard</span>
            </button>
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
                {branches.map((b) => (
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
                      <button onClick={() => handleDeleteBranch(b.id)} className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
              onClick={() => setShowFinModal(true)}
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
                      <button onClick={() => handleDeleteFinancier(f.id)} className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
              onClick={() => setShowInsModal(true)}
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
                      <button onClick={() => handleDeleteInsurance(ins.id)} className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT PDI RULE                                              */}
      {/* ========================================================================= */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-bold text-slate-900">{editingRule ? `Edit Rule: ${editingRule.id}` : 'Configure Inspection Point'}</h3>
              <button onClick={() => setShowRuleModal(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
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
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Checkpoint Point Title *</label>
                  <input type="text" required placeholder="e.g. Body Panel Alignment & Paint Finish" value={ruleForm.title} onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
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
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD SHOWROOM / STOCKYARD                                         */}
      {/* ========================================================================= */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-bold text-slate-900">Add Dealership Showroom / Stockyard</h3>
              <button onClick={() => setShowBranchModal(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBranch} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Facility Name *</label>
                  <input type="text" required placeholder="e.g. Autoprime Tata - Wakad Hub" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Dealership Brand *</label>
                  <select value={branchForm.brand} onChange={(e) => setBranchForm({ ...branchForm, brand: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="Autoprime Tata">Autoprime Tata</option>
                    <option value="Raja Hyundai">Raja Hyundai</option>
                    <option value="Dhoot Group Shared">Dhoot Group Shared Facility</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Facility Type</label>
                  <select value={branchForm.type} onChange={(e) => setBranchForm({ ...branchForm, type: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="3S (Sales, Service, Spares)">3S (Sales, Service, Spares)</option>
                    <option value="1S Showroom">1S Showroom</option>
                    <option value="Central Stockyard">Central Stockyard</option>
                    <option value="Bodyshop & Workshop">Bodyshop & Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Yard Vehicle Capacity</label>
                  <input type="text" placeholder="e.g. 120 Cars" value={branchForm.capacity} onChange={(e) => setBranchForm({ ...branchForm, capacity: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                  <input type="text" required value={branchForm.city} onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Facility Manager</label>
                  <input type="text" placeholder="e.g. Rajesh Patil" value={branchForm.manager} onChange={(e) => setBranchForm({ ...branchForm, manager: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowBranchModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">Save Facility</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD BANK / FINANCIER                                             */}
      {/* ========================================================================= */}
      {showFinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-bold text-slate-900">Add Banking / Financier Partner</h3>
              <button onClick={() => setShowFinModal(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFinancier} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Financial Institution Name *</label>
                <input type="text" required placeholder="e.g. Kotak Mahindra Prime Ltd" value={finForm.name} onChange={(e) => setFinForm({ ...finForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                <select value={finForm.category} onChange={(e) => setFinForm({ ...finForm, category: e.target.value as any })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  <option value="PRIVATE_BANK">Private Bank</option>
                  <option value="NATIONALISED_BANK">Nationalised PSU Bank</option>
                  <option value="OEM_CAPTIVE_NBFC">OEM Captive Finance</option>
                  <option value="NBFC">Non-Banking Financial Company (NBFC)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Person</label>
                  <input type="text" placeholder="e.g. Ritesh Deshmukh" value={finForm.contactPerson} onChange={(e) => setFinForm({ ...finForm, contactPerson: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input type="tel" value={finForm.phone} onChange={(e) => setFinForm({ ...finForm, phone: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowFinModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">Save Financier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD INSURANCE COMPANY                                            */}
      {/* ========================================================================= */}
      {showInsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-bold text-slate-900">Add General Insurance Provider</h3>
              <button onClick={() => setShowInsModal(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveInsurance} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Insurance Company Name *</label>
                <input type="text" required placeholder="e.g. Royal Sundaram General Insurance" value={insForm.name} onChange={(e) => setInsForm({ ...insForm, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Claims Desk Head</label>
                  <input type="text" placeholder="e.g. Arvind Mehta" value={insForm.claimsHead} onChange={(e) => setInsForm({ ...insForm, claimsHead: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Surveyor Contact</label>
                  <input type="tel" value={insForm.surveyorContact} onChange={(e) => setInsForm({ ...insForm, surveyorContact: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Dealership OD Discount (%)</label>
                <input type="number" value={insForm.discountPercentage} onChange={(e) => setInsForm({ ...insForm, discountPercentage: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowInsModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">Save Insurance Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD VEHICLE MODEL                                                */}
      {/* ========================================================================= */}
      {showModelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Add Vehicle Model to Catalog</h3>
              <button onClick={() => setShowModelModal(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveModel} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">OEM Brand *</label>
                <select value={modelForm.brand} onChange={(e) => setModelForm({ ...modelForm, brand: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  <option value="Autoprime Tata">Autoprime Tata</option>
                  <option value="Raja Hyundai">Raja Hyundai</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Model Name *</label>
                <input type="text" required placeholder="e.g. Tata Curvv or Hyundai Alcazar" value={modelForm.model_name} onChange={(e) => setModelForm({ ...modelForm, model_name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Body Type</label>
                  <input type="text" placeholder="SUV / Sedan / EV" value={modelForm.body_type} onChange={(e) => setModelForm({ ...modelForm, body_type: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Base Price (₹)</label>
                  <input type="number" value={modelForm.base_ex_showroom} onChange={(e) => setModelForm({ ...modelForm, base_ex_showroom: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModelModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs">Save Model</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
