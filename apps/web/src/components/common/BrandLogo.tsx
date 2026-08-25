import React from 'react';
import { BrandCode, BRAND_CONFIGS } from '../../context/AuthContext';

export const DualBrandHeader: React.FC<{ brand: BrandCode; className?: string }> = ({ brand, className = '' }) => {
  const config = BRAND_CONFIGS[brand];

  return (
    <div className={`flex items-center justify-center gap-3.5 sm:gap-5 ${className}`}>
      {/* 1. Dhoot Group Master Emblem in Premium Curved Container */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-[0_4px_15px_rgba(15,23,42,0.06)] border border-[#E2E8F0] flex items-center justify-center overflow-hidden hover:scale-105 transition-all duration-300">
        <img
          src="/logo.png"
          alt="Dhoot Group Official Emblem"
          className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
        />
      </div>

      {/* Sleek Vertical Divider */}
      <div className="h-9 sm:h-11 w-[1.5px] bg-[#CBD5E1]" />

      {/* 2. Dealership Brand Logo in Matching Curved Container */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-[0_4px_15px_rgba(15,23,42,0.06)] border border-[#E2E8F0] flex items-center justify-center overflow-hidden hover:scale-105 transition-all duration-300">
        <img
          src={config.logoUrl}
          alt={config.name}
          className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-xl sm:rounded-2xl"
        />
      </div>
    </div>
  );
};