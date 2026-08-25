import React, { useState } from 'react';
import { useAuth, BrandCode, BRAND_CONFIGS } from '../context/AuthContext';
import { User, Lock, AlertCircle, Loader2, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [brand, setLocalBrand] = useState<BrandCode>('DHOOT-TATA');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, setBrand } = useAuth();

  const currentConfig = BRAND_CONFIGS[brand];

  const handleBrandChange = (newBrand: BrandCode) => {
    setLocalBrand(newBrand);
    setBrand(newBrand);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (employeeId && password) {
        login('demo_token_' + brand, {
          id: crypto.randomUUID(),
          employeeId: employeeId.trim().toUpperCase(),
          email: `${employeeId.toLowerCase()}@${brand === 'DHOOT-TATA' ? 'autoprimetata.com' : 'rajahyundai.com'}`,
          role: 'BRANCH_MANAGER',
          organizationId: currentConfig.orgId,
          brand: brand,
        });
      } else {
        setError('Please enter your Employee ID and Password.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="relative inline-block">
          <img
            src="/logo.png"
            alt="Dhoot Group Logo"
            className="h-16 w-16 mx-auto object-contain mb-3 drop-shadow-sm"
          />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-[#1A1A2E]">
          {currentConfig.name.toUpperCase()}
        </h1>
        <p className="text-xs text-[#718096] uppercase font-bold tracking-wider">
          Dhoot Group — PDI Platform
        </p>
        <p className="text-[11px] text-[#A0AEC0] mt-0.5">{currentConfig.tagline}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md border border-[#DEE2E8] rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-[#FEECEC] border border-[#F5A8A8] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0" />
              <p className="text-sm text-[#C62828] font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* 1. BRAND SELECTOR DROPDOWN */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-1">
                Select Dealership Brand
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-[#718096]" />
                </div>
                <select
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value as BrandCode)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-[#DEE2E8] rounded-xl text-sm font-semibold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#1A3A6B] cursor-pointer"
                >
                  <option value="DHOOT-TATA">Autoprime Tata (Dhoot Group)</option>
                  <option value="DHOOT-HYUNDAI">Raja Hyundai (Dhoot Group)</option>
                </select>
              </div>
            </div>

            {/* 2. USERNAME / EMPLOYEE ID */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-1">
                Username / Employee ID
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#718096]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={brand === 'DHOOT-TATA' ? 'e.g. TATA-1024 or ENG-101' : 'e.g. HYN-2048 or ENG-201'}
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-[#DEE2E8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
                />
              </div>
            </div>

            {/* 3. PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#718096]" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-[#DEE2E8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: currentConfig.primaryColor }}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white hover:opacity-90 focus:outline-none shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                `Sign In to ${currentConfig.name}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};