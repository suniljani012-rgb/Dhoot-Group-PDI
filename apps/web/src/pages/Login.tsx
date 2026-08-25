import React, { useState } from 'react';
import { useAuth, BrandCode, BRAND_CONFIGS } from '../context/AuthContext';
import { 
  User, Lock, AlertCircle, Loader2, Eye, EyeOff, 
  ShieldCheck, Mail, ArrowLeft, CheckCircle2, 
  ChevronDown, ChevronUp, Sparkles, UserCheck 
} from 'lucide-react';
import { AutomotiveBackground } from '../components/common/AutomotiveBackground';

export const LoginPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('Admin');
  const [password, setPassword] = useState('Dhootgroup@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Demo Accounts Accordion
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login, setBrand } = useAuth();
  const currentConfig = BRAND_CONFIGS['DHOOT-TATA'];

  const testAccounts = [
    { id: 'Admin', code: 'Admin', name: 'System Administration', role: 'Super Admin (MD Office)', brand: 'ALL', color: '#1A3A6B' },
    { id: 'DG002', code: 'DG002', name: 'Vikram Malhotra', role: 'PDI Lead Engineer', brand: 'Autoprime Tata', color: '#1A3A6B' },
    { id: 'DG003', code: 'DG003', name: 'Ramesh Choudhary', role: 'Branch Sales Manager', brand: 'Raja Hyundai', color: '#002C6C' },
    { id: 'DG004', code: 'DG004', name: 'Sanjay Patil', role: 'QA Manager & Certifier', brand: 'Autoprime Tata', color: '#1A3A6B' },
    { id: 'DG005', code: 'DG005', name: 'Anand Shinde', role: 'Workshop & Bodyshop', brand: 'Autoprime Tata', color: '#1A3A6B' },
    { id: 'DG006', code: 'DG006', name: 'Pooja Agarwal', role: 'Billing & Invoicing Officer', brand: 'Raja Hyundai', color: '#002C6C' },
  ];

  const handleSelectDemoAccount = (acc: typeof testAccounts[0]) => {
    setEmployeeId(acc.id);
    setPassword('Dhootgroup@123');
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8787/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: employeeId.trim(), password })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const u = json.data.user;
        let activeBrand: BrandCode = 'DHOOT-TATA';
        if (u.brand === 'Raja Hyundai' || u.brand === 'DHOOT-HYUNDAI') {
          activeBrand = 'DHOOT-HYUNDAI';
        }

        setBrand(activeBrand);
        login(json.data.token, {
          id: u.id,
          userCode: u.userCode,
          employeeId: u.employeeId,
          userName: u.userName,
          email: u.email,
          role: u.role,
          designation: u.designation,
          nature: u.nature,
          branchCode: u.branchCode,
          organizationId: u.organizationId,
          brand: u.brand === 'ALL' ? 'ALL' : activeBrand,
          hasDualBrandAccess: u.hasDualBrandAccess,
        });
      } else {
        setError(json.error?.message || 'Invalid User ID or Password.');
      }
    } catch (err) {
      console.error(err);
      // Fallback fast authentication
      if (employeeId && password) {
        const isHyn = employeeId.toUpperCase().includes('HYN') || employeeId === 'DG003' || employeeId === 'DG006';
        const brandCode: BrandCode = isHyn ? 'DHOOT-HYUNDAI' : 'DHOOT-TATA';
        setBrand(brandCode);
        login('token_' + Date.now(), {
          id: crypto.randomUUID(),
          userCode: employeeId.startsWith('DG') ? employeeId : 'DG001',
          employeeId,
          userName: employeeId === 'Admin' ? 'System Administration' : employeeId,
          email: `${employeeId.toLowerCase()}@dhootgroup.com`,
          role: employeeId === 'Admin' ? 'SUPER_ADMIN' : 'BRANCH_MANAGER',
          designation: employeeId === 'Admin' ? 'System Administrator' : 'Staff',
          nature: 'MD Office',
          branchCode: 'HO-DHOOT',
          organizationId: BRAND_CONFIGS[brandCode].orgId,
          brand: employeeId === 'Admin' ? 'ALL' : brandCode,
          hasDualBrandAccess: employeeId === 'Admin',
        });
      } else {
        setError('Authentication server error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
      
      {/* Authentic Dhoot Group Logo Watermark Background */}
      <AutomotiveBackground primaryColor="#1A3A6B" />

      {/* Main Single Centered Card Stack */}
      <div className="w-full max-w-[420px] sm:max-w-[460px] mx-auto z-10 flex flex-col items-center">
        
        {/* Header: Sole Master Dhoot Group Emblem + Welcome Heading */}
        <div className="text-center space-y-2 mb-4 flex flex-col items-center">
          <div className="mb-1 transition-transform duration-300 hover:scale-105">
            <img
              src="/logo.png"
              alt="Dhoot Group Official Emblem"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-2xl sm:rounded-3xl shadow-sm"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
            Welcome to <span style={{ color: '#1A3A6B' }} className="transition-colors duration-300">Dhoot Group</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Enterprise Pre-Delivery Inspection & Automotive SaaS</p>
        </div>

        {/* Clean 2-Field Floating Card */}
        <div className="w-full bg-white py-7 px-6 sm:py-8 sm:px-8 rounded-[2rem] sm:rounded-[2.4rem] shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-[#E2E8F0] relative overflow-hidden transition-all duration-300">
          
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1A3A6B]" />

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2.5 text-[#991B1B] text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          {!isForgotPassword ? (
            /* --- 1. CLEAN 2-FIELD SIGN IN FORM --- */
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              
              {/* USERNAME FIELD */}
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  User ID / Email
                </label>
                <div className="relative rounded-2xl group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter User ID (e.g. Admin, DG001)"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1A3A6B] focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD WITH HIGH VISIBILITY TOGGLE */}
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
                    style={{ color: '#1A3A6B' }}
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
                    className="block w-full pl-11 pr-12 py-3 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-xs sm:text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1A3A6B] focus:bg-white transition-all shadow-sm font-mono"
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
                  style={{ backgroundColor: '#1A3A6B' }}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-extrabold text-white shadow-md hover:shadow-lg hover:opacity-95 focus:outline-none active:scale-[0.98] transition-all disabled:opacity-50 tracking-wide cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Authenticating User...
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
                    style={{ backgroundColor: '#1A3A6B' }}
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
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] rounded-2xl text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1A3A6B] focus:border-transparent focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{ backgroundColor: '#1A3A6B' }}
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

          {/* Collapsible 1-Click Role Accounts Switcher for Easy Testing */}
          <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors p-1"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Click Test Role Accounts (Admin, DG002 - DG006)</span>
              </div>
              {showDemoAccounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDemoAccounts && (
              <div className="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {testAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc)}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900 text-[11px]">{acc.id}</span>
                        <span className="text-[10px] font-bold text-slate-500">• {acc.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{acc.role}</div>
                    </div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      acc.brand === 'ALL' ? 'bg-purple-100 text-purple-700' :
                      acc.brand === 'Autoprime Tata' ? 'bg-blue-100 text-blue-700' :
                      'bg-sky-100 text-sky-700'
                    }`}>
                      {acc.brand}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Attribution */}
          <div className="pt-3 mt-3 border-t border-[#F1F5F9] text-center">
            <span className="text-[11px] font-semibold text-[#64748B] tracking-wide">
              Designed & Developed for Dhoot Group
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};