import React from 'react';
import { BrandCode, BRAND_CONFIGS } from '../../context/AuthContext';

export const DualBrandHeader: React.FC<{ brand: BrandCode; className?: string }> = ({ brand, className = '' }) => {
  const config = BRAND_CONFIGS[brand];

  return (
    <div className={`inline-flex items-center justify-center gap-3 sm:gap-4 p-2 sm:p-2.5 bg-white/90 backdrop-blur-md rounded-[1.75rem] border border-[#E2E8F0] shadow-[0_8px_25px_rgba(15,23,42,0.06)] ${className}`}>
      
      {/* 1. Dhoot Group Master Emblem */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:scale-105 transition-transform duration-300">
        <img
          src="/logo.png"
          alt="Dhoot Group Official Emblem"
          className="h-14 w-14 sm:h-16 sm:w-16 object-contain filter drop-shadow-sm"
        />
      </div>

      {/* Elegant Vertical Divider with Brand Pulse */}
      <div className="h-10 sm:h-12 w-[2px] bg-gradient-to-b from-transparent via-[#CBD5E1] to-transparent" />

      {/* 2. Official Dealership Brand Badge (Autoprime Tata / Raja Hyundai) */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 overflow-hidden hover:scale-105 transition-transform duration-300">
        <img
          src={config.logoUrl}
          alt={config.name}
          className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-xl shadow-xs"
        />
      </div>
    </div>
  );
};