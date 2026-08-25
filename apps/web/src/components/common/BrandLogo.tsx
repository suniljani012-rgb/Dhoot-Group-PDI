import React from 'react';
import { BrandCode, BRAND_CONFIGS } from '../../context/AuthContext';

export const DualBrandHeader: React.FC<{ brand: BrandCode; className?: string }> = ({ brand, className = '' }) => {
  const config = BRAND_CONFIGS[brand];

  return (
    <div className={`flex items-center justify-center gap-4 sm:gap-6 ${className}`}>
      {/* 1. Dhoot Group Master Emblem - Pure Clean Artwork */}
      <div className="relative group transition-transform duration-300 hover:scale-105">
        <img
          src="/logo.png"
          alt="Dhoot Group Official Emblem"
          className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-sm"
        />
      </div>

      {/* Sleek Minimalist Hairline Separator */}
      <div className="h-10 sm:h-12 w-[1.5px] bg-[#CBD5E1]" />

      {/* 2. Official Dealership Brand Logo - Pure Clean Artwork */}
      <div className="relative group transition-transform duration-300 hover:scale-105">
        <img
          src={config.logoUrl}
          alt={config.name}
          className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-2xl drop-shadow-sm transition-all duration-300"
        />
      </div>
    </div>
  );
};