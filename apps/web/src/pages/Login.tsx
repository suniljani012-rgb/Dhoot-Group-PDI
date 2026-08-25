import React, { useState } from 'react';
import { useAuth, BrandCode, BRAND_CONFIGS } from '../context/AuthContext';
import { User, Lock, AlertCircle, Loader2, Building2, Eye, EyeOff, ChevronDown, ShieldCheck, CheckCircle2, QrCode, Wrench, Sparkles, Activity } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F1F5F9] relative flex flex-col justify-between items-center py-8 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      
      {/* 1. Subtle High-Tech Dot Matrix Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.45] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* 2. Dynamic Ambient Gradient Glowing Orbs */}
      <div 
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full opacity-25 blur-[120px] transition-all duration-700 pointer-events-none animate-pulse"
        style={{ backgroundColor: currentConfig.primaryColor }}
      />
      <div 
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[130px] transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: currentConfig.accentColor || currentConfig.primaryColor }}
      />
      <div 
        className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-[140px] transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: currentConfig.primaryColor }}
      />

      {/* Top Status Header Badge */}
      <div className="z-10 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-semibold text-[#334155]">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
        <span className="w-2 h-2 rounded-full bg-[#10B981] -ml-4" />
        <span>Dhoot Group Operations Network • 24/7 Active</span>
      </div>

      {/* Main Center Grid with Flanking Feature Cards */}
      <div className="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* LEFT FLANK: Feature Showcase Glass Card (Visible on Large Screens) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] space-y-3 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF3FD] text-[#1A3A6B] flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-5 h-5 text-[#1A3A6B]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0F172A]">120-Point Inspection</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Standardized multi-point digital checklists across mechanical, electrical, and aesthetic quality.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-[#1A3A6B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Defect Standard</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] space-y-3 transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3F2] text-[#C62828] flex items-center justify-center shadow-inner">
              <Wrench className="w-5 h-5 text-[#C62828]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0F172A]">Workshop Sync</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Automated defect escalation and real-time repair ticket lifecycle tracking.
              </p>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Main Login Box */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
            {/* Dual Brand Logos Display */}
            <DualBrandHeader brand={brand} className="mb-2" />

            {/* Clean Welcome Heading */}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F172A]">
              Welcome to <span style={{ color: currentConfig.primaryColor }} className="transition-colors duration-300">Dhoot Group</span>
            </h1>
          </div>

          {/* Login Card Container */}
          <div className="mt-6 w-full sm:max-w-md">
            <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-[2.2rem] shadow-[0_25px_60px_rgba(15,23,42,0.1)] border border-white ring-1 ring-slate-900/5 relative overflow-hidden transition-all duration-300 hover:shadow-[0_30px_70px_rgba(15,23,42,0.14)]">
              
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
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] transition-colors focus:outline-none cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

        {/* RIGHT FLANK: Enterprise Trust Glass Card (Visible on Large Screens) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] space-y-3 transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shadow-inner">
              <QrCode className="w-5 h-5 text-[#059669]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0F172A]">Digital QR Certificates</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Tamper-proof encrypted digital certificates issued instantly upon QA Manager sign-off.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] space-y-3 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shadow-inner">
              <Activity className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0F172A]">Fleet Auditing</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Complete ISO 3779 VIN tracking across Jaipur, Jodhpur, Pune, and Mumbai stockyards.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Subtle Footer Note */}
      <div className="z-10 text-[11px] text-[#94A3B8] font-medium text-center">
        © {new Date().getFullYear()} Dhoot Group. All rights reserved. • Autoprime Tata & Raja Hyundai
      </div>

    </div>
  );
};