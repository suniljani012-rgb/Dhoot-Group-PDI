import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, Car, ShieldCheck, CreditCard, 
  Settings, Plus, Search, ChevronRight, CheckCircle2, 
  Briefcase, MapPin, DollarSign, Layers, Shield, Sparkles, 
  FileSpreadsheet, Activity, Wrench, X, Loader2, Camera,
  Video, Edit3, Trash2, Check, AlertTriangle, Sliders
} from 'lucide-react';
import { AdminUsersPage } from './AdminUsers';

export interface PdiRuleItem {
  id: string;
  stage: 'Exterior' | 'Electricals' | 'Interior' | 'Engine Bay' | 'Underbody' | 'Road Test';
  title: string;
  description: string;
  mandatory: boolean;
  photosRequired: number; // 0, 1, 2, etc.
  videoRequired: boolean;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';
}

const DEFAULT_PDI_RULES: PdiRuleItem[] = [
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

export const AdminMasterPanelPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [activeTab, setActiveTab] = useState<'USERS' | 'MODELS' | 'BRANCHES' | 'FINANCE' | 'PDI_RULES'>('PDI_RULES');
  
  // Masters Data State
  const [loading, setLoading] = useState(true);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [financiers, setFinanciers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // PDI Inspection Rules State (Persisted in LocalStorage & Synchronized)
  const [pdiRules, setPdiRules] = useState<PdiRuleItem[]>(() => {
    const saved = localStorage.getItem('autoprime_pdi_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PDI_RULES;
      }
    }
    return DEFAULT_PDI_RULES;
  });

  const [ruleStageFilter, setRuleStageFilter] = useState<string>('ALL');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PdiRuleItem | null>(null);

  // Form State for Adding / Editing Inspection Rule
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

  // Other Modals
  const [showModelModal, setShowModelModal] = useState(false);
  const [newModel, setNewModel] = useState({
    brand: 'Autoprime Tata',
    modelName: '',
    bodyType: 'SUV',
    fuelTypes: 'PETROL, DIESEL',
    variants: 'Pure, Adventure, Fearless',
    colors: 'White, Grey, Black',
    basePrice: 990000
  });

  useEffect(() => {
    fetchMastersData();
  }, []);

  const fetchMastersData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8787/api/v1/masters/all');
      if (res.ok) {
        const json = await res.json();
        setVehicleModels(json.data?.vehicleModels || []);
        setFinanciers(json.data?.financiers || []);
        setBranches(json.data?.branches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Save PDI Rules & Propagate to Entire Platform
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
    if (confirm('Are you sure you want to remove this inspection rule from the active checklist?')) {
      const updated = pdiRules.filter(r => r.id !== id);
      setPdiRules(updated);
      localStorage.setItem('autoprime_pdi_rules', JSON.stringify(updated));
    }
  };

  const openEditRule = (rule: PdiRuleItem) => {
    setEditingRule(rule);
    setRuleForm(rule);
    setShowRuleModal(true);
  };

  const openNewRule = () => {
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
  };

  const filteredRules = pdiRules.filter(r => {
    if (ruleStageFilter === 'ALL') return true;
    return r.stage === ruleStageFilter;
  });

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 leading-tight">
            Dealership HQ Master Administration
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Configure dynamic inspection checklist rules, media requirements, RBAC users, vehicle catalog, and branches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting system master configurations to CSV...')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
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
          <span>Dynamic Inspection Rules ({pdiRules.length} Points)</span>
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
          <span>Vehicle Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'BRANCHES' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Showrooms & Stockyards</span>
        </button>

        <button
          onClick={() => setActiveTab('FINANCE')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'FINANCE' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Financiers & Insurance</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DYNAMIC INSPECTION RULES ENGINE (ADMIN CONTROL)                     */}
      {/* ========================================================================= */}
      {activeTab === 'PDI_RULES' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          
          {/* Header & Add Point Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900">Dynamic Checklist & Proof Requirements Engine</h2>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Active Live Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Set inspection checkpoints, required photos (0/1/2+), and mandatory video clips. The inspection workstation updates in real-time.
              </p>
            </div>

            <button
              onClick={openNewRule}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Checkpoint Point</span>
            </button>
          </div>

          {/* Stage Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold w-fit overflow-x-auto">
            {['ALL', 'Exterior', 'Electricals', 'Interior', 'Engine Bay', 'Underbody', 'Road Test'].map(stage => (
              <button
                key={stage}
                onClick={() => setRuleStageFilter(stage)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  ruleStageFilter === stage ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {stage === 'ALL' ? 'All Checkpoints' : stage}
              </button>
            ))}
          </div>

          {/* Dense Excel-Style Rules Grid */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Rule ID</th>
                  <th className="py-2.5 px-3">Stage / Category</th>
                  <th className="py-2.5 px-3">Inspection Checkpoint</th>
                  <th className="py-2.5 px-3">Detailed Instruction</th>
                  <th className="py-2.5 px-3">Mandatory Photos</th>
                  <th className="py-2.5 px-3">Video Proof</th>
                  <th className="py-2.5 px-3">Defect Severity</th>
                  <th className="py-2.5 px-3 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {rule.id}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {rule.stage}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {rule.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-sm truncate" title={rule.description}>
                      {rule.description}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.photosRequired > 0 ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Camera className="w-3 h-3" />
                        {rule.photosRequired} {rule.photosRequired === 1 ? 'Photo' : 'Photos'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.videoRequired ? 'bg-purple-50 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Video className="w-3 h-3" />
                        {rule.videoRequired ? '1 Video Required' : 'Optional'}
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
                          onClick={() => openEditRule(rule)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Rule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Rule"
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

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Showing {filteredRules.length} dynamic inspection checkpoints</span>
            <span className="text-emerald-700 font-bold">✓ Automatically synced to all Inspector tablets</span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USERS & RBAC MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <AdminUsersPage />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VEHICLE MODELS & CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'MODELS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">OEM Vehicle Models & Pricing Matrix</h2>
              <p className="text-[11px] text-slate-400">Official catalog for Tata Motors & Hyundai Motor India</p>
            </div>
            <button
              onClick={() => setShowModelModal(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle Model</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">OEM Brand</th>
                  <th className="py-2.5 px-3">Model Name</th>
                  <th className="py-2.5 px-3">Body Type</th>
                  <th className="py-2.5 px-3">Base Ex-Showroom</th>
                  <th className="py-2.5 px-3">Fuel Options</th>
                  <th className="py-2.5 px-3">Key Variants</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
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
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {m.model_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {m.body_type}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      ₹{(Number(m.base_ex_showroom) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {Array.isArray(m.fuel_types) ? m.fuel_types.join(', ') : m.fuel_types}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {Array.isArray(m.variants) ? m.variants.slice(0, 4).join(', ') : m.variants}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        Active OEM
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SHOWROOMS & STOCKYARDS */}
      {/* ========================================================================= */}
      {activeTab === 'BRANCHES' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900">Showrooms, 3S Workshops & Central Stockyards</h2>
            <p className="text-[11px] text-slate-400">Dhoot Group Multi-State Dealership Infrastructure</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Branch Code</th>
                  <th className="py-2.5 px-3">Facility Name</th>
                  <th className="py-2.5 px-3">Dealership Brand</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">City & State</th>
                  <th className="py-2.5 px-3">Yard Capacity</th>
                  <th className="py-2.5 px-3">Contact Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {[
                  { code: 'BR-PUN-01', name: 'Autoprime Tata - Pune Main 3S Facility', type: '3S (Sales, Service, Spares)', city: 'Pune, Maharashtra', capacity: '120 Cars Capacity', brand: 'Autoprime Tata', phone: '+91 20 6789 0123' },
                  { code: 'BR-MUM-01', name: 'Autoprime Tata - Mumbai Hub', type: '1S Showroom + Bodyshop', city: 'Mumbai, Maharashtra', capacity: '80 Cars Capacity', brand: 'Autoprime Tata', phone: '+91 22 4567 8901' },
                  { code: 'BR-JPR-01', name: 'Raja Hyundai - Jaipur Central 3S', type: '3S Flagship Dealership', city: 'Jaipur, Rajasthan', capacity: '150 Cars Capacity', brand: 'Raja Hyundai', phone: '+91 141 234 5678' },
                  { code: 'BR-JDH-01', name: 'Raja Hyundai - Jodhpur Facility', type: '2S Service & Stockyard', city: 'Jodhpur, Rajasthan', capacity: '90 Cars Capacity', brand: 'Raja Hyundai', phone: '+91 291 345 6789' },
                ].map((b) => (
                  <tr key={b.code} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {b.code}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {b.name}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {b.brand}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {b.type}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {b.city}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {b.capacity}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {b.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FINANCIERS & INSURANCE */}
      {/* ========================================================================= */}
      {activeTab === 'FINANCE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900">Approved Banking, NBFC & General Insurance Partners</h2>
            <p className="text-[11px] text-slate-400">Authorized finance channels for customer disbursement and cashless claims</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Institution Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Contact Person</th>
                  <th className="py-2.5 px-3">Helpdesk Phone</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {[
                  { name: 'State Bank of India (SBI Auto Loans)', category: 'NATIONALISED_BANK', contact: 'Anil Kumar (Chief Mgr)', phone: '+91 141 223 9011' },
                  { name: 'HDFC Bank Ltd', category: 'PRIVATE_BANK', contact: 'Pooja Verma (DSA Head)', phone: '+91 20 6789 2200' },
                  { name: 'ICICI Bank Ltd', category: 'PRIVATE_BANK', contact: 'Rajesh Nair (Auto Desk)', phone: '+91 22 4567 1100' },
                  { name: 'Tata Capital Financial Services', category: 'OEM_CAPTIVE_NBFC', contact: 'Vikram Joshi (Zonal Head)', phone: '+91 1800 209 6060' },
                  { name: 'Bajaj Finance Ltd', category: 'NBFC', contact: 'Sunil Mehta (Regional Lead)', phone: '+91 20 7157 6064' },
                  { name: 'Tata AIG General Insurance', category: 'INSURANCE_PROVIDER', contact: 'Kavita Sen (Claims Head)', phone: '+91 1800 266 7780' },
                  { name: 'ICICI Lombard General Insurance', category: 'INSURANCE_PROVIDER', contact: 'Manoj Sharma (Surveyor)', phone: '+91 1800 2666' }
                ].map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {f.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                        {f.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">
                      {f.contact}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {f.phone}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        Active Tie-Up
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PDI INSPECTION CHECKPOINT RULE                          */}
      {/* ========================================================================= */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="font-bold text-slate-900">
                  {editingRule ? `Edit Rule: ${editingRule.id}` : 'Configure New Inspection Point'}
                </h3>
                <p className="text-xs text-slate-400">Set checkpoint guidelines, mandatory photo counts & video criteria</p>
              </div>
              <button onClick={() => setShowRuleModal(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Inspection Stage *</label>
                  <select
                    value={ruleForm.stage}
                    onChange={(e) => setRuleForm({ ...ruleForm, stage: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
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
                  <select
                    value={ruleForm.severity}
                    onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (Blocks Delivery)</option>
                    <option value="MAJOR">MAJOR (Requires Workshop Fix)</option>
                    <option value="MINOR">MINOR (Touch-up / Buffing)</option>
                    <option value="OBSERVATION">OBSERVATION (Informational)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Checkpoint Point Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Body Panel Alignment & Paint Coat Check"
                    value={ruleForm.title}
                    onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Detailed Inspection Instruction</label>
                  <textarea
                    rows={2}
                    placeholder="Provide specific instructions for what the technician must examine..."
                    value={ruleForm.description}
                    onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Required Photos Count</label>
                  <select
                    value={ruleForm.photosRequired}
                    onChange={(e) => setRuleForm({ ...ruleForm, photosRequired: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value={0}>0 (Photos Optional)</option>
                    <option value={1}>1 Mandatory Photo</option>
                    <option value={2}>2 Mandatory Photos</option>
                    <option value={3}>3 Mandatory Photos</option>
                    <option value={4}>4 Mandatory Photos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Video Recording Rule</label>
                  <select
                    value={ruleForm.videoRequired ? 'REQUIRED' : 'OPTIONAL'}
                    onChange={(e) => setRuleForm({ ...ruleForm, videoRequired: e.target.value === 'REQUIRED' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="OPTIONAL">Optional Video</option>
                    <option value="REQUIRED">Mandatory Video Recording (Max 5MB)</option>
                  </select>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowRuleModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs">
                  {editingRule ? 'Update Rule' : 'Save Checkpoint Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
