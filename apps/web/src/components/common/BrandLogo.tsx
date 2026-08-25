import React from 'react';
import { BrandCode } from '../../context/AuthContext';

export const TataLogoSvg: React.FC<{ className?: string }> = ({ className = 'h-10' }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Tata Motors Iconic Arched T Emblem */}
    <ellipse cx="100" cy="60" rx="90" ry="52" stroke="#1A3A6B" strokeWidth="10" fill="none" />
    <path
      d="M 52 42 C 72 38, 92 50, 100 85 C 108 50, 128 38, 148 42 C 128 54, 110 95, 100 95 C 90 95, 72 54, 52 42 Z"
      fill="#1A3A6B"
    />
    <text x="100" y="115" textAnchor="middle" fill="#1A3A6B" fontSize="18" fontWeight="900" letterSpacing="4">
      TATA
    </text>
  </svg>
);

export const HyundaiLogoSvg: React.FC<{ className?: string }> = ({ className = 'h-10' }) => (
  <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Hyundai Slanted H in Oval Emblem */}
    <ellipse cx="100" cy="55" rx="88" ry="48" stroke="#002C6C" strokeWidth="10" fill="none" transform="rotate(-6 100 55)" />
    <path
      d="M 68 82 C 65 60, 68 40, 72 28 C 76 28, 83 28, 86 28 C 82 45, 80 65, 84 82 Z"
      fill="#002C6C"
    />
    <path
      d="M 116 82 C 120 65, 118 45, 114 28 C 117 28, 124 28, 128 28 C 132 40, 135 60, 132 82 Z"
      fill="#002C6C"
    />
    <path
      d="M 78 52 C 90 48, 110 46, 122 56 C 114 62, 94 62, 78 52 Z"
      fill="#002C6C"
    />
    <text x="100" y="115" textAnchor="middle" fill="#002C6C" fontSize="16" fontWeight="900" letterSpacing="3">
      HYUNDAI
    </text>
  </svg>
);

export const DualBrandHeader: React.FC<{ brand: BrandCode; className?: string }> = ({ brand, className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {/* 1. Dhoot Group Wheel Logo */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-[#DEE2E8]">
        <img
          src="/logo.png"
          alt="Dhoot Group Logo"
          className="h-12 w-12 object-contain"
        />
      </div>

      {/* Divider */}
      <div className="h-10 w-[2px] bg-[#DEE2E8]" />

      {/* 2. OEM Brand Logo (Tata or Hyundai) */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-[#DEE2E8] flex items-center justify-center min-w-[70px]">
        {brand === 'DHOOT-TATA' ? (
          <TataLogoSvg className="h-11 w-auto" />
        ) : (
          <HyundaiLogoSvg className="h-11 w-auto" />
        )}
      </div>
    </div>
  );
};