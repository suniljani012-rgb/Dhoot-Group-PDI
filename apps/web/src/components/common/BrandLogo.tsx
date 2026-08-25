import React from 'react';
import { BrandCode, BRAND_CONFIGS } from '../../context/AuthContext';

export const DualBrandHeader: React.FC<{ brand: BrandCode; className?: string }> = ({ brand, className = '' }) => {
  const config = BRAND_CONFIGS[brand];

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {/* 1. 100% Exact Dhoot Group Master Emblem */}
      <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-[#DEE2E8] flex items-center justify-center hover:shadow-md transition-shadow">
        <img
          src="/logo.png"
          alt="Dhoot Group Official Logo"
          className="h-16 w-16 object-contain"
        />
      </div>

      {/* Elegant Divider */}
      <div className="h-12 w-[2px] bg-[#DEE2E8]" />

      {/* 2. 100% Exact Uploaded Dealership Brand Logo (Autoprime Tata / Raja Hyundai) */}
      <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-[#DEE2E8] flex items-center justify-center overflow-hidden hover:shadow-md transition-shadow">
        <img
          src={config.logoUrl}
          alt={config.name}
          className="h-16 w-16 object-contain rounded-xl transition-all duration-300"
        />
      </div>
    </div>
  );
};