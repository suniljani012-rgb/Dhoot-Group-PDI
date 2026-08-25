import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mock/Demo authentication for Phase 1 testing
    setTimeout(() => {
      if (employeeId && password) {
        login('demo_token_123', {
          id: '11111111-1111-1111-1111-111111111111',
          employeeId,
          email: `${employeeId.toLowerCase()}@autoprimetata.com`,
          role: 'BRANCH_MANAGER',
          organizationId: '11111111-1111-1111-1111-111111111111',
        });
      } else {
        setError('Please enter both Employee ID and password.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img 
          src="/logo.png" 
          alt="Autoprime Tata - Dhoot Group" 
          className="h-16 w-16 mx-auto object-contain mb-3"
        />
        <h1 className="text-xl font-bold text-[#1A1A2E] tracking-tight">AUTOPRIME TATA</h1>
        <p className="text-xs text-[#718096] uppercase font-semibold">Dhoot Group PDI Platform</p>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#1A1A2E]">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#DEE2E8] rounded-xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#FEECEC] border border-[#F5A8A8] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0" />
              <p className="text-sm text-[#C62828] font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]">Employee ID</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#718096]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-1024"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#DEE2E8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E]">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#718096]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#DEE2E8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[#1A3A6B] hover:bg-[#2C5298] focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
