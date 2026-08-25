import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, Car, ShieldCheck, CreditCard, 
  Settings, Plus, Search, ChevronRight, CheckCircle2, 
  Briefcase, MapPin, DollarSign, Layers, Shield, Sparkles, 
  FileSpreadsheet, Activity, Wrench, X, Loader2
} from 'lucide-react';
import { AdminUsersPage } from './AdminUsers';

export const AdminMasterPanelPage: React.FC = () => {
  const { currentBrand, isSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'USERS' | 'MODELS' | 'BRANCHES' | 'FINANCE' | 'PDI_RULES'>('USERS');
  
  // Masters Data State
  const [loading, setLoading] = useState(true);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [financiers, setFinanciers] = useState<any[]>([]);
  const [insuranceProviders, setInsuranceProviders] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Modals
  const [showModelModal, setShowModelModal] = useState(false);
  const [showFinModal, setShowFinModal] = useState(false);

  // New Model Form State
  const [newModel, setNewModel] = useState({
    brand: 'Autoprime Tata',
    modelName: '',
    bodyType: 'SUV',
    fuelTypes: 'PETROL, DIESEL',
    variants: 'Pure, Adventure, Fearless',
    colors: 'White, Grey, Black',
    basePrice: 990000
  });

  // New Financier Form State
  const [newFin, setNewFin] = useState({
    name: '',
    category: 'PRIVATE_BANK',
    contactPerson: '',
    contactPhone: '+91 '
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
        setInsuranceProviders(json.data?.insuranceProviders || []);
        setBranches(json.data?.branches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8787/api/v1/masters/vehicle-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: newModel.brand,
          model_name: newModel.modelName,
          body_type: newModel.bodyType,
          fuel_types: newModel.fuelTypes.split(',').map(s => s.trim()),
          variants: newModel.variants.split(',').map(s => s.trim()),
          colors: newModel.colors.split(',').map(s => s.trim()),
          base_ex_showroom: Number(newModel.basePrice) || 1000000
        })
      });
      if (res.ok) {
        setShowModelModal(false);
        fetchMastersData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFinancier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8787/api/v1/masters/financiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFin)
      });
      if (res.ok) {
        setShowFinModal(false);
        fetchMastersData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5 pb-16 select-none max-w-[1600px] mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 leading-tight">
            Dealership HQ Master Administration
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Central management for RBAC user roles, vehicle catalog, multi-state branches, and finance rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting system audit ledger to CSV...')}
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

        <button
          onClick={() => setActiveTab('PDI_RULES')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PDI_RULES' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Inspection Standards</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS & RBAC MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <AdminUsersPage />
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VEHICLE MODELS & CATALOG (DENSE EXCEL TABLE) */}
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
      {/* TAB 3: SHOWROOMS & STOCKYARDS (DENSE EXCEL TABLE) */}
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
      {/* TAB 4: FINANCIERS & INSURANCE (DENSE EXCEL TABLE) */}
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
      {/* TAB 5: INSPECTION STANDARD RULES (DENSE EXCEL TABLE) */}
      {/* ========================================================================= */}
      {activeTab === 'PDI_RULES' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900">Inspection Standard Quality Rules</h2>
            <p className="text-[11px] text-slate-400">Strict OEM compliance standards for exterior, electricals, mechanicals & road test</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Rule ID</th>
                  <th className="py-2.5 px-3">Inspection Stage</th>
                  <th className="py-2.5 px-3">Checkpoint Name</th>
                  <th className="py-2.5 px-3">Mandatory Proof Requirement</th>
                  <th className="py-2.5 px-3">Defect Severity If Failed</th>
                  <th className="py-2.5 px-3 text-center">Enforcement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {[
                  { id: 'RULE-01', stage: 'Stage 1: Exterior', item: 'Transit Scratches, Dents & Paint Finish', proof: 'Mandatory Photo Proof (< 2MB)', severity: 'CRITICAL', rule: 'Mandatory' },
                  { id: 'RULE-02', stage: 'Stage 1: Exterior', item: 'Glass, Windshield & Sealant Alignment', proof: 'Visual Inspection Photo', severity: 'MAJOR', rule: 'Mandatory' },
                  { id: 'RULE-03', stage: 'Stage 2: Electricals', item: 'All Lights, Indicators, DRL & High Beam', proof: 'Operational Video Clip (< 5MB)', severity: 'CRITICAL', rule: 'Mandatory' },
                  { id: 'RULE-04', stage: 'Stage 2: Electricals', item: 'Infotainment, Speakers & Rear Camera', proof: 'Display Video Proof', severity: 'MAJOR', rule: 'Mandatory' },
                  { id: 'RULE-05', stage: 'Stage 3: Interior', item: 'Upholstery, Seat Belts & Dashboard Finish', proof: 'Cabin Photo', severity: 'MINOR', rule: 'Mandatory' },
                  { id: 'RULE-06', stage: 'Stage 4: Engine Bay', item: 'Fluid Levels (Engine Oil, Coolant, Brake Fluid)', proof: 'Engine Bay Photo', severity: 'CRITICAL', rule: 'Mandatory' },
                  { id: 'RULE-07', stage: 'Stage 5: Underbody', item: 'Exhaust, Suspension & No Fluid Leakage', proof: 'Underbody Lift Photo', severity: 'CRITICAL', rule: 'Mandatory' },
                  { id: 'RULE-08', stage: 'Stage 6: Road Test', item: 'Braking Efficiency, Steering Alignment & Suspension', proof: 'Odometer + Road Test Sign-Off', severity: 'CRITICAL', rule: 'Mandatory' },
                ].map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {r.id}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {r.stage}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      {r.item}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">
                      {r.proof}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                        {r.rule}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW MODEL MODAL */}
      {showModelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Register New OEM Model</h3>
              <button onClick={() => setShowModelModal(false)} className="p-1 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateModel} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Brand</label>
                <select
                  value={newModel.brand}
                  onChange={(e) => setNewModel({ ...newModel, brand: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Autoprime Tata">Autoprime Tata</option>
                  <option value="Raja Hyundai">Raja Hyundai</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Curvv or Hyundai Ioniq 5"
                  value={newModel.modelName}
                  onChange={(e) => setNewModel({ ...newModel, modelName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Starting Base Ex-Showroom (₹)</label>
                <input
                  type="number"
                  required
                  value={newModel.basePrice}
                  onChange={(e) => setNewModel({ ...newModel, basePrice: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModelModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow">
                  Save Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
