import React from 'react';
import { BrandCode, BRAND_CONFIGS } from '../../context/AuthContext';

export const DualBrandHeader: React.FC<{ brand: BrandCode; className?: string }> = ({ brand, className = '' }) => {
  const config = BRAND_CONFIGS[brand];

  return (
    <div className={`flex items-center justify-center gap-3 sm:gap-4 ${className}`}>
      {/* 1. Dhoot Group Master Emblem */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-sm border border-[#E2E8F0] flex items-center justify-center hover:shadow transition-shadow">
        <img
          src="/logo.png"
          alt="Dhoot Group"
          className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
        />
      </div>

      {/* Sleek Vertical Divider */}
      <div className="h-9 sm:h-11 w-[1.5px] bg-[#E2E8F0]" />

      {/* 2. Official Dealership Brand Logo (Autoprime Tata / Raja Hyundai) */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-sm border border-[#E2E8F0] flex items-center justify-center overflow-hidden hover:shadow transition-shadow">
        <img
          src={config.logoUrl}
          alt={config.name}
          className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-xl transition-all duration-300"
        />
      </div>
    </div>
  );
};