import React, { useState } from 'react';
import { useAuth, BrandCode, BRAND_CONFIGS } from '../context/AuthContext';
import { User, Lock, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { DualBrandHeader } from '../components/common/BrandLogo';

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
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FA] to-[#EDF2F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Dual Brand Logos Display */}
        <DualBrandHeader brand={brand} className="mb-3" />

        {/* Clean Welcome Heading */}
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A2E] sm:text-4xl">
          Welcome to <span className="text-[#1A3A6B]">Dhoot Group</span>
        </h1>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-[#DEE2E8]/80 rounded-3xl sm:px-10 space-y-6 backdrop-blur-sm">
          {error && (
            <div className="p-4 rounded-xl bg-[#FEECEC] border border-[#F5A8A8] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0" />
              <p className="text-sm text-[#C62828] font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* 1. BRAND SELECTOR DROPDOWN */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-1.5">
                Select Dealership Brand
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-[#718096]" />
                </div>
                <select
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value as BrandCode)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#F8F9FA] hover:bg-white border border-[#DEE2E8] rounded-xl text-sm font-semibold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#1A3A6B] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="DHOOT-TATA">Autoprime Tata</option>
                  <option value="DHOOT-HYUNDAI">Raja Hyundai</option>
                </select>
              </div>
            </div>

            {/* 2. USERNAME / EMPLOYEE ID */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-1.5">
                Username / Employee ID
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#718096]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={brand === 'DHOOT-TATA' ? 'e.g. TATA-1024 or ENG-101' : 'e.g. HYN-2048 or ENG-201'}
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#F8F9FA] hover:bg-white border border-[#DEE2E8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 3. PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#718096]" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-[#F8F9FA] hover:bg-white border border-[#DEE2E8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: currentConfig.primaryColor }}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white hover:opacity-90 focus:outline-none shadow-md transition-all disabled:opacity-50"
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