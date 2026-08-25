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
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            style={{ backgroundColor: `${currentBrand.primaryColor}15`, color: currentBrand.primaryColor }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold"
          >
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Dhoot Group • Automobile Dealership Headquarters
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase">
                Enterprise Admin Panel
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Multi-Brand Dealership ERP Control Center: Workforce, Showrooms, OEM Catalog, PDI Rules & Commercials
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Master Tabs */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Staff (DG001+)</span>
        </button>

        <button
          onClick={() => setActiveTab('MODELS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'MODELS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Catalog ({vehicleModels.length} Models)</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'BRANCHES'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Showrooms & Stockyards</span>
        </button>

        <button
          onClick={() => setActiveTab('FINANCE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'FINANCE'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Financiers & Insurance</span>
        </button>

        <button
          onClick={() => setActiveTab('PDI_RULES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'PDI_RULES'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>120-Point PDI Standard Rules</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS & RBAC MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <AdminUsersPage />
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VEHICLE MODELS & CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'MODELS' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">OEM Vehicle Models & Pricing Matrix</h2>
              <p className="text-xs text-slate-500">Official catalog for Tata Motors & Hyundai Motor India</p>
            </div>
            <button
              onClick={() => setShowModelModal(true)}
              style={{ backgroundColor: currentBrand.primaryColor }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs font-bold shadow hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle Model</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleModels.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    m.brand === 'Autoprime Tata' ? 'bg-blue-100 text-blue-800' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {m.brand}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{m.body_type}</span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">{m.model_name}</h3>
                  <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
                    Starting from ₹{(Number(m.base_ex_showroom) || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fuel Options</span>
                  <div className="flex flex-wrap gap-1">
                    {m.fuel_types?.map((f: string) => (
                      <span key={f} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Key Variants</span>
                  <div className="text-xs text-slate-600 font-medium">
                    {Array.isArray(m.variants) ? m.variants.slice(0, 3).join(', ') : m.variants}
                    {m.variants?.length > 3 ? ` +${m.variants.length - 3} more` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SHOWROOMS & STOCKYARDS */}
      {/* ========================================================================= */}
      {activeTab === 'BRANCHES' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Showrooms, 3S Workshops & Central Stockyards</h2>
              <p className="text-xs text-slate-500">Dhoot Group Multi-State Dealership Infrastructure</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { code: 'BR-PUN-01', name: 'Autoprime Tata - Pune Main 3S Facility', type: '3S (Sales, Service, Spares)', city: 'Pune, Maharashtra', capacity: '120 Cars Capacity', brand: 'Autoprime Tata', phone: '+91 20 6789 0123' },
              { code: 'BR-MUM-01', name: 'Autoprime Tata - Mumbai Hub', type: '1S Showroom + Bodyshop', city: 'Mumbai, Maharashtra', capacity: '80 Cars Capacity', brand: 'Autoprime Tata', phone: '+91 22 4567 8901' },
              { code: 'BR-JPR-01', name: 'Raja Hyundai - Jaipur Central 3S', type: '3S Flagship Dealership', city: 'Jaipur, Rajasthan', capacity: '150 Cars Capacity', brand: 'Raja Hyundai', phone: '+91 141 234 5678' },
              { code: 'BR-JDH-01', name: 'Raja Hyundai - Jodhpur Facility', type: '2S Service & Stockyard', city: 'Jodhpur, Rajasthan', capacity: '90 Cars Capacity', brand: 'Raja Hyundai', phone: '+91 291 345 6789' },
            ].map((b) => (
              <div key={b.code} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-slate-900 text-xs px-2 py-0.5 bg-slate-100 rounded-lg">
                    {b.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{b.type}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.city}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-700">{b.capacity}</span>
                  <span className="text-slate-600 font-mono">{b.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FINANCIERS & INSURANCE */}
      {/* ========================================================================= */}
      {activeTab === 'FINANCE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Financiers */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Approved Banking & Financier Partners</h3>
                  <p className="text-xs text-slate-500">Retail Auto Loan Integrations</p>
                </div>
                <button
                  onClick={() => setShowFinModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  + Add Bank
                </button>
              </div>

              <div className="space-y-2">
                {financiers.map((f) => (
                  <div key={f.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{f.name}</div>
                      <div className="text-[10px] text-slate-500">{f.category} • Contact: {f.contact_person || 'Desk Manager'}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      ACTIVE TIE-UP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance Companies */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Motor Insurance Tie-Ups</h3>
                  <p className="text-xs text-slate-500">Zero Dep, RTI, Engine Protect (EP) & Consumables (CM)</p>
                </div>
              </div>

              <div className="space-y-2">
                {insuranceProviders.map((ins) => (
                  <div key={ins.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{ins.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Code: {ins.code}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                      CASHLESS CLAIMS
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 120-POINT PDI STANDARDS & RULES */}
      {/* ========================================================================= */}
      {activeTab === 'PDI_RULES' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Authoritative 120-Point PDI Standard Rules</h2>
            <p className="text-xs text-slate-500">OEM Mandatory Checkpoints & Digital Quality Assurance Protocol</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">1. Exterior & Paint Quality</div>
              <p className="text-slate-600 leading-relaxed">
                Scratch inspection, panel gap consistency, glass clarity, bumper alignment, beadings & monograms.
              </p>
              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                24 Checkpoints • Photo Mandatory
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">2. Under-Chassis & Wheels</div>
              <p className="text-slate-600 leading-relaxed">
                Tyre pressure (32-35 PSI), DOT manufacture code, alloy condition, exhaust brackets & suspension nuts.
              </p>
              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                18 Checkpoints • Torque Tested
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm">3. Engine, Fluids & EV Battery</div>
              <p className="text-slate-600 leading-relaxed">
                Engine oil level, coolant density, brake fluid, high-voltage battery SoC & charging port latching.
              </p>
              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                28 Checkpoints • Technical Sign-off
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD VEHICLE MODEL */}
      {showModelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Add OEM Vehicle Model</h3>
              <button onClick={() => setShowModelModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateModel} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Brand *</label>
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
                <label className="block font-bold text-slate-600 uppercase mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Sierra / Hyundai Creta EV"
                  value={newModel.modelName}
                  onChange={(e) => setNewModel({ ...newModel, modelName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Base Ex-Showroom (₹) *</label>
                <input
                  type="number"
                  required
                  value={newModel.basePrice}
                  onChange={(e) => setNewModel({ ...newModel, basePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Variants (Comma Separated)</label>
                <input
                  type="text"
                  value={newModel.variants}
                  onChange={(e) => setNewModel({ ...newModel, variants: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowModelModal(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
                <button type="submit" style={{ backgroundColor: currentBrand.primaryColor }} className="px-5 py-2.5 rounded-xl font-bold text-white shadow">Save Model</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FINANCIER */}
      {showFinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Add Financier Partner</h3>
              <button onClick={() => setShowFinModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateFinancier} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Financier / Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank of Baroda Car Loan"
                  value={newFin.name}
                  onChange={(e) => setNewFin({ ...newFin, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="Manager Name"
                  value={newFin.contactPerson}
                  onChange={(e) => setNewFin({ ...newFin, contactPerson: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowFinModal(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
                <button type="submit" style={{ backgroundColor: currentBrand.primaryColor }} className="px-5 py-2.5 rounded-xl font-bold text-white shadow">Save Financier</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
