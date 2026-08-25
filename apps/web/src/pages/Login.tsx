import React, { useState } from 'react';
import { useAuth, BrandCode, BRAND_CONFIGS } from '../context/AuthContext';
import { User, Lock, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { DualBrandHeader } from '../components/common/BrandLogo';
import { AutomotiveBackground } from '../components/common/AutomotiveBackground';

export const LoginPage: React.FC = () => {
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

  const { login, setBrand, currentBrand } = useAuth();
  const currentConfig = BRAND_CONFIGS[currentBrand.code || 'DHOOT-TATA'];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const cleanId = employeeId.trim().toUpperCase();
      
      if (cleanId && password) {
        // Automatic Brand Detection based on User ID / Credentials
        let detectedBrand: BrandCode = 'DHOOT-TATA';
        
        if (cleanId.includes('HYN') || cleanId.includes('HYUNDAI') || cleanId.includes('RAJA') || cleanId.startsWith('H-')) {
          detectedBrand = 'DHOOT-HYUNDAI';
        } else {
          detectedBrand = 'DHOOT-TATA';
        }

        const brandCfg = BRAND_CONFIGS[detectedBrand];
        setBrand(detectedBrand);

        login('token_' + detectedBrand + '_' + Date.now(), {
          id: crypto.randomUUID(),
          employeeId: cleanId,
          email: `${cleanId.toLowerCase()}@${detectedBrand === 'DHOOT-TATA' ? 'autoprimetata.com' : 'rajahyundai.com'}`,
          role: 'BRANCH_MANAGER',
          organizationId: brandCfg.orgId,
          brand: detectedBrand,
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
    <div className="min-h-screen w-full bg-[#F4F6F9] relative flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Authentic Dhoot Group Logo Watermark Background (Desktop & Tablet only) */}
      <AutomotiveBackground primaryColor={currentConfig.primaryColor} />

      {/* Main Single Centered Card Stack */}
      <div className="w-full max-w-[420px] sm:max-w-[460px] mx-auto z-10 flex flex-col items-center">
        
        {/* Header: Dual Brand Logos + Welcome Heading */}
        <div className="text-center space-y-2.5 mb-5">
          <DualBrandHeader brand={currentBrand.code || 'DHOOT-TATA'} className="mb-2" />

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0F172A]">
            Welcome to <span style={{ color: currentConfig.primaryColor }} className="transition-colors duration-300">Dhoot Group</span>
          </h1>
        </div>

        {/* Clean 2-Field Floating Card */}
        <div className="w-full bg-white py-7 px-6 sm:py-9 sm:px-9 rounded-[2rem] sm:rounded-[2.4rem] shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-[#E2E8F0] relative overflow-hidden transition-all duration-300">
          
          {/* Top Brand Accent Line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500"
            style={{ backgroundColor: currentConfig.primaryColor }}
          />

          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2.5 text-[#991B1B] text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          {!isForgotPassword ? (
            /* --- 1. CLEAN 2-FIELD SIGN IN FORM --- */
            <form className="space-y-4 sm:space-y-5" onSubmit={handleLoginSubmit}>
              
              {/* USERNAME FIELD */}
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
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD WITH HIGH VISIBILITY TOGGLE */}
              <div>
                <div className="flex items-center justify-between mb-2">
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
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors focus:outline-none cursor-pointer"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
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
                  className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl text-sm font-extrabold text-white shadow-md hover:shadow-lg hover:opacity-95 focus:outline-none active:scale-[0.98] transition-all disabled:opacity-50 tracking-wide cursor-pointer"
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
                  <h2 className="text-base font-bold text-[#0F172A]">Reset Password</h2>
                  <p className="text-xs text-[#64748B]">Recover access for your Dhoot Group ID</p>
                </div>
              </div>

              {forgotSuccess ? (
                <div className="space-y-3 text-center py-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Reset Instructions Sent!</h3>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
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
                <form className="space-y-4" onSubmit={handleForgotSubmit}>
                  <div>
                    <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Registered User ID / Email
                    </label>
                    <div className="relative rounded-2xl group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter User ID or Email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{ backgroundColor: currentConfig.primaryColor }}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
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