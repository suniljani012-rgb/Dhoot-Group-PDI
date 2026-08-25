import React, { createContext, useContext, useState, useEffect } from 'react';

export type BrandCode = 'DHOOT-TATA' | 'DHOOT-HYUNDAI';

export interface BrandConfig {
  code: BrandCode;
  name: string;
  shortName: string;
  tagline: string;
  primaryColor: string;
  primaryHover: string;
  accentColor: string;
  accentBg: string;
  orgId: string;
  models: string[];
}

export const BRAND_CONFIGS: Record<BrandCode, BrandConfig> = {
  'DHOOT-TATA': {
    code: 'DHOOT-TATA',
    name: 'Autoprime Tata',
    shortName: 'TATA',
    tagline: 'Authorized Tata Motors Dealership',
    primaryColor: '#1A3A6B',
    primaryHover: '#2C5298',
    accentColor: '#C8102E',
    accentBg: '#EBF3FD',
    orgId: '11111111-1111-1111-1111-111111111111',
    models: ['Tata Nexon', 'Tata Harrier', 'Tata Safari', 'Tata Curvv.ev', 'Tata Punch', 'Tata Tiago', 'Tata Altroz'],
  },
  'DHOOT-HYUNDAI': {
    code: 'DHOOT-HYUNDAI',
    name: 'Raja Hyundai',
    shortName: 'HYUNDAI',
    tagline: 'Authorized Hyundai Motor Dealership',
    primaryColor: '#002C6C',
    primaryHover: '#0047AB',
    accentColor: '#00AAD2',
    accentBg: '#E6F0FA',
    orgId: '11111111-1111-1111-1111-111111111112',
    models: ['Hyundai Creta', 'Hyundai Venue', 'Hyundai Verna', 'Hyundai Ioniq 5', 'Hyundai Exter', 'Hyundai i20', 'Hyundai Tucson'],
  },
};

interface AuthUser {
  id: string;
  employeeId: string;
  email: string;
  role: string;
  branchId?: string;
  organizationId: string;
  brand: BrandCode;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  currentBrand: BrandConfig;
  setBrand: (brand: BrandCode) => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBrandCode, setSelectedBrandCode] = useState<BrandCode>('DHOOT-TATA');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('autoprime_token'));

  useEffect(() => {
    const savedUser = localStorage.getItem('autoprime_user');
    if (savedUser && token) {
      const parsed = JSON.parse(savedUser) as AuthUser;
      setUser(parsed);
      if (parsed.brand) {
        setSelectedBrandCode(parsed.brand);
      }
    }
  }, [token]);

  const setBrand = (brand: BrandCode) => {
    setSelectedBrandCode(brand);
  };

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    setSelectedBrandCode(newUser.brand);
    localStorage.setItem('autoprime_token', newToken);
    localStorage.setItem('autoprime_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('autoprime_token');
    localStorage.removeItem('autoprime_user');
  };

  const currentBrand = BRAND_CONFIGS[selectedBrandCode] || BRAND_CONFIGS['DHOOT-TATA'];

  return (
    <AuthContext.Provider value={{ user, token, currentBrand, setBrand, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};