import React from 'react';
import { BrandCode, BRAND_CONFIGS } from '../../context/AuthContext';

export const DualBrandHeader: React.FC<{ brand: BrandCode; className?: string }> = ({ brand, className = '' }) => {
  const config = BRAND_CONFIGS[brand];

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {/* 1. Dhoot Group Master Emblem */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-[#DEE2E8] flex items-center justify-center">
        <img
          src="/logo.png"
          alt="Dhoot Group Logo"
          className="h-16 w-16 object-contain"
        />
      </div>

      {/* Divider */}
      <div className="h-12 w-[2px] bg-[#DEE2E8]" />

      {/* 2. Official Uploaded Brand Logo (Autoprime Tata / Raja Hyundai) */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-[#DEE2E8] flex items-center justify-center overflow-hidden">
        <img
          src={config.logoUrl}
          alt={config.name}
          className="h-16 w-16 object-contain rounded-xl transition-all duration-300"
        />
      </div>
    </div>
  );
};