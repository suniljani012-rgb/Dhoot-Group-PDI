import React, { useState } from 'react';
import { useAuth, BrandCode, BRAND_CONFIGS } from '../context/AuthContext';
import { User, Lock, AlertCircle, Loader2, Building2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { DualBrandHeader } from '../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const [brand, setLocalBrand] = useState<BrandCode>('DHOOT-TATA');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Decorative Background Glows */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl transition-colors duration-700 pointer-events-none"
        style={{ backgroundColor: currentConfig.primaryColor }}
      />
      <div 
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl transition-colors duration-700 pointer-events-none"
        style={{ backgroundColor: currentConfig.primaryColor }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4 z-10">
        {/* Dual Brand Logos Display */}
        <DualBrandHeader brand={brand} className="mb-2" />

        {/* Clean Welcome Heading */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A]">
          Welcome to <span style={{ color: currentConfig.primaryColor }} className="transition-colors duration-300">Dhoot Group</span>
        </h1>
      </div>

      {/* Login Card Container */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 rounded-[2rem] shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-white ring-1 ring-slate-900/5 relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(15,23,42,0.12)]">
          
          {/* Top Brand Accent Line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500"
            style={{ backgroundColor: currentConfig.primaryColor }}
          />

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-3 text-[#991B1B] text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* 1. BRAND SELECTOR DROPDOWN */}
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-2">
                Dealership Brand
              </label>
              <div className="relative rounded-2xl group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <select
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value as BrandCode)}
                  className="block w-full pl-11 pr-10 py-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm cursor-pointer appearance-none"
                  style={{
                    outlineColor: currentConfig.primaryColor,
                  }}
                >
                  <option value="DHOOT-TATA">Autoprime Tata</option>
                  <option value="DHOOT-HYUNDAI">Raja Hyundai</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* 2. USERNAME / EMPLOYEE ID */}
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-2">
                Username / Employee ID
              </label>
              <div className="relative rounded-2xl group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={brand === 'DHOOT-TATA' ? 'e.g. TATA-1024 or ENG-101' : 'e.g. HYN-2048 or ENG-201'}
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* 3. PASSWORD FIELD WITH TOGGLE */}
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-2xl group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] transition-colors focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON WITH HOVER LIFT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: currentConfig.primaryColor }}
                className="w-full flex justify-center items-center py-4 px-6 rounded-2xl text-sm font-extrabold text-white shadow-lg hover:shadow-xl hover:opacity-95 focus:outline-none transform active:scale-[0.99] transition-all disabled:opacity-50 tracking-wide cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  `Sign In to ${currentConfig.name}`
                )}
              </button>
            </div>
          </form>

          {/* Bottom Attribution */}
          <div className="pt-4 border-t border-[#F1F5F9] text-center">
            <span className="text-[11px] font-semibold text-[#64748B] tracking-wide">
              Designed & Developed for Dhoot Group
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};