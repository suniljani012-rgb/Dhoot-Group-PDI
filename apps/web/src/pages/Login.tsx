import React, { useState } from 'react';
import { useAuth, BrandCode, BRAND_CONFIGS } from '../context/AuthContext';
import { User, Lock, AlertCircle, Loader2, Building2, Eye, EyeOff, ChevronDown, ShieldCheck, Mail, ArrowLeft, CheckCircle2, Award, Sparkles, CheckSquare, Zap, Gauge } from 'lucide-react';
import { DualBrandHeader } from '../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const [brand, setLocalBrand] = useState<BrandCode>('DHOOT-TATA');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login, setBrand } = useAuth();
  const currentConfig = BRAND_CONFIGS[brand];

  const handleBrandChange = (newBrand: BrandCode) => {
    setLocalBrand(newBrand);
    setBrand(newBrand);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setError(null);

    setTimeout(() => {
      if (forgotEmail) {
        setForgotSuccess(true);
        setForgotLoading(false);
      } else {
        setError('Please enter your registered User ID or Email.');
        setForgotLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F4F8] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 select-none">
      
      {/* Container: Single Column on Mobile, Luxury 2-Column Split-Screen on Desktop */}
      <div className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-[#E2E8F0] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Premium Automotive Brand Showcase (Visible on Desktop >= 1024px) */}
        {/* ========================================================================= */}
        <div 
          style={{
            background: brand === 'DHOOT-TATA' 
              ? 'linear-gradient(145deg, #0A192F 0%, #1A3A6B 55%, #152B52 100%)' 
              : 'linear-gradient(145deg, #001A44 0%, #002C6C 55%, #0047AB 100%)'
          }}
          className="hidden lg:flex lg:col-span-7 flex-col justify-between p-10 text-white relative overflow-hidden transition-all duration-700"
        >
          {/* Subtle Background Watermark on Left Hero Banner */}
          <div className="absolute -bottom-16 -right-16 w-96 h-96 opacity-10 pointer-events-none">
            <img
              src="/logo.png"
              alt="Dhoot Group"
              className="w-full h-full object-contain filter invert"
            />
          </div>

          {/* Top Hero Brand Header */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="bg-white p-2 rounded-2xl shadow-md border border-white/20">
              <img
                src="/logo.png"
                alt="Dhoot Group Logo"
                className="h-11 w-11 object-contain"
              />
            </div>
            <div>
              <div className="text-lg font-black tracking-wide text-white leading-tight">
                DHOOT GROUP
              </div>
              <span className="text-xs text-white/80 font-medium tracking-wider uppercase">
                Automotive Excellence Since 1962
              </span>
            </div>
          </div>

          {/* Middle Hero Visual: Dealership Quality & Vehicle Showcase */}
          <div className="my-8 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-white tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{brand === 'DHOOT-TATA' ? 'Authorized Tata Motors Dealership' : 'Authorized Hyundai Motor Dealership'}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl xl:text-4xl font-black leading-tight text-white tracking-tight">
                {brand === 'DHOOT-TATA' ? 'Precision PDI & Quality Standards for Tata Fleet' : 'Intelligent Inspection & Zero-Defect Delivery for Hyundai'}
              </h2>
              <p className="text-sm text-slate-200/90 leading-relaxed max-w-lg">
                {brand === 'DHOOT-TATA' 
                  ? 'Digital pre-delivery inspections across Tata Nexon, Harrier, Safari, Curvv.ev, and commercial fleet across Pune & Mumbai stockyards.'
                  : 'Automated 120-point digital quality audits for Hyundai Creta, Venue, Verna, Ioniq 5 EV, and Exter across Jaipur & Jodhpur stockyards.'}
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>120-Pt Inspection</span>
                </div>
                <p className="text-[11px] text-slate-300">Mechanical, electrical, cosmetic & road test validation</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Digital QR Certificate</span>
                </div>
                <p className="text-[11px] text-slate-300">Tamper-proof encrypted certificate issued upon sign-off</p>
              </div>
            </div>
          </div>

          {/* Bottom Hero Trust Metrics */}
          <div className="pt-6 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 z-10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">ISO 3779 VIN Verification</span>
            </div>
            <span className="text-[11px] text-white/60">Jaipur • Jodhpur • Pune • Mumbai</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Focused Clean Login Card (Mobile & Desktop) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center bg-white relative">
          
          {/* Header: Dual Brand Logos + Welcome Title */}
          <div className="text-center space-y-2 mb-6">
            <DualBrandHeader brand={brand} className="mb-2" />

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
              Welcome to <span style={{ color: currentConfig.primaryColor }} className="transition-colors duration-300">Dhoot Group</span>
            </h1>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2.5 text-[#991B1B] text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          {!isForgotPassword ? (
            /* --- 1. SIGN IN FORM --- */
            <form className="space-y-4 sm:space-y-4.5" onSubmit={handleLoginSubmit}>
              {/* DEALERSHIP BRAND DROPDOWN */}
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  Dealership Brand
                </label>
                <div className="relative rounded-2xl group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <select
                    value={brand}
                    onChange={(e) => handleBrandChange(e.target.value as BrandCode)}
                    className="block w-full pl-10 pr-9 py-3 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm cursor-pointer appearance-none"
                  >
                    <option value="DHOOT-TATA">Autoprime Tata</option>
                    <option value="DHOOT-HYUNDAI">Raja Hyundai</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* USERNAME FIELD */}
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative rounded-2xl group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter User ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setIsForgotPassword(true);
                    }}
                    style={{ color: currentConfig.primaryColor }}
                    className="text-[11px] font-bold hover:underline focus:outline-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative rounded-2xl group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-11 py-3 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors focus:outline-none cursor-pointer"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5 text-[#475569] hover:text-[#0F172A]" />
                    ) : (
                      <Eye className="h-4.5 w-4.5 text-[#64748B] hover:text-[#0F172A]" />
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
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold text-white shadow-md hover:shadow-lg hover:opacity-95 focus:outline-none active:scale-[0.98] transition-all disabled:opacity-50 tracking-wide cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
          ) : (
            /* --- 2. FORGOT PASSWORD FLOW --- */
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotSuccess(false);
                    setError(null);
                  }}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">Reset Password</h2>
                  <p className="text-[11px] text-[#64748B]">Recover access for {currentConfig.name}</p>
                </div>
              </div>

              {forgotSuccess ? (
                <div className="space-y-3 text-center py-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">Reset Instructions Sent!</h3>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                      A password recovery link has been dispatched to your official email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotSuccess(false);
                    }}
                    style={{ backgroundColor: currentConfig.primaryColor }}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow hover:opacity-90 transition-all cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form className="space-y-3.5" onSubmit={handleForgotSubmit}>
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                      Registered User ID / Email
                    </label>
                    <div className="relative rounded-2xl group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter User ID or Email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{ backgroundColor: currentConfig.primaryColor }}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Link...
                      </>
                    ) : (
                      'Request Password Reset'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Bottom Attribution */}
          <div className="pt-4 mt-2 border-t border-[#F1F5F9] text-center">
            <span className="text-[11px] font-semibold text-[#64748B] tracking-wide">
              Designed & Developed for Dhoot Group
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};