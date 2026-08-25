import React, { useState } from 'react';
import { useAuth, BrandCode, BRAND_CONFIGS } from '../context/AuthContext';
import { User, Lock, AlertCircle, Loader2, Building2, Eye, EyeOff, ChevronDown, ShieldCheck } from 'lucide-react';
import { DualBrandHeader } from '../components/common/BrandLogo';
import { AutomotiveBackground } from '../components/common/AutomotiveBackground';

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
        setError('Please enter your User ID and Password.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      
      {/* 100% Authentic Dhoot Group Logo Watermark Background */}
      <AutomotiveBackground primaryColor={currentConfig.primaryColor} />

      {/* Main Content Area */}
      <div className="w-full max-w-md mx-auto z-10 flex flex-col items-center">
        
        {/* Header: Dual Brand Logos + Welcome Heading */}
        <div className="text-center space-y-3 mb-6">
          <DualBrandHeader brand={brand} className="mb-2" />

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A]">
            Welcome to <span style={{ color: currentConfig.primaryColor }} className="transition-colors duration-300">Dhoot Group</span>
          </h1>
        </div>

        {/* Floating Glassmorphic Login Card */}
        <div className="w-full bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-[2.2rem] shadow-[0_20px_50px_rgba(15,23,42,0.1)] border border-white ring-1 ring-slate-900/5 relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(15,23,42,0.14)]">
          
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
                >
                  <option value="DHOOT-TATA">Autoprime Tata</option>
                  <option value="DHOOT-HYUNDAI">Raja Hyundai</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* 2. USER ID FIELD */}
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative rounded-2xl group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter User ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* 3. PASSWORD FIELD WITH 'Enter Password' PLACEHOLDER & TOGGLE */}
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
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                  aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#475569] hover:text-[#0F172A]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#64748B] hover:text-[#0F172A]" />
                  )}
                </button>
              </div>
            </div>

            {/* SECURE SIGN IN BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: currentConfig.primaryColor }}
                className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-2xl text-sm font-extrabold text-white shadow-lg hover:shadow-xl hover:opacity-95 focus:outline-none transform active:scale-[0.99] transition-all disabled:opacity-50 tracking-wide cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Secure Sign In
                  </>
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