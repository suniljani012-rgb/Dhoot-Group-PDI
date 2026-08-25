import React from 'react';
import { Gauge, Disc, Cpu, Sliders, ShieldCheck, Key, Wrench, BatteryCharging, Car, Fuel, Zap } from 'lucide-react';

export const AutomotiveBackground: React.FC<{ primaryColor: string }> = ({ primaryColor }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Large Dhoot Group Winged Wheel Stylized Watermark in Center Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.035] transition-all duration-700 pointer-events-none">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Outer Wheel Rim */}
          <circle cx="200" cy="200" r="160" stroke="#000" strokeWidth="18" fill="none" />
          <circle cx="200" cy="200" r="140" stroke="#000" strokeWidth="4" fill="none" strokeDasharray="8 8" />
          <circle cx="200" cy="200" r="45" stroke="#000" strokeWidth="12" fill="none" />
          <circle cx="200" cy="200" r="18" fill="#C8102E" />
          {/* 5-Spoke Star Design */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <line
              key={i}
              x1="200"
              y1="200"
              x2={200 + 135 * Math.cos((angle * Math.PI) / 180)}
              y2={200 + 135 * Math.sin((angle * Math.PI) / 180)}
              stroke="#000"
              strokeWidth="10"
              strokeLinecap="round"
            />
          ))}
          {/* Aerodynamic Speed Wings */}
          <path
            d="M 120 100 C 140 40, 240 20, 340 60 C 260 70, 200 90, 150 140 Z"
            fill="#E65100"
          />
          <path
            d="M 130 115 C 160 65, 250 45, 330 85 C 260 95, 210 115, 165 155 Z"
            fill="#C8102E"
          />
          <path
            d="M 145 135 C 180 90, 260 75, 320 110 C 250 120, 210 140, 180 170 Z"
            fill="#1A3A6B"
          />
        </svg>
      </div>

      {/* 2. Precision Dot Matrix Texture */}
      <div 
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 3. Pure Floating Automotive Icons (No Text Boxes) */}
      
      {/* Top Left Icons */}
      <div className="absolute top-12 left-12 lg:left-24 p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-[#1A3A6B] transform -rotate-6 hover:rotate-0 transition-transform">
        <Car className="w-6 h-6" />
      </div>

      <div className="absolute top-44 left-8 lg:left-14 p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-blue-600 transform rotate-3 hover:rotate-0 transition-transform">
        <Gauge className="w-6 h-6" />
      </div>

      {/* Bottom Left Icons */}
      <div className="absolute bottom-48 left-8 lg:left-14 p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-purple-600 transform -rotate-3 hover:rotate-0 transition-transform">
        <Sliders className="w-6 h-6" />
      </div>

      <div className="absolute bottom-16 left-14 lg:left-24 p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-amber-600 transform rotate-6 hover:rotate-0 transition-transform">
        <Disc className="w-6 h-6" />
      </div>

      {/* Top Right Icons */}
      <div className="absolute top-12 right-12 lg:right-24 p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-indigo-600 transform rotate-6 hover:rotate-0 transition-transform">
        <Cpu className="w-6 h-6" />
      </div>

      <div className="absolute top-44 right-8 lg:right-14 p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-emerald-600 transform -rotate-3 hover:rotate-0 transition-transform">
        <BatteryCharging className="w-6 h-6" />
      </div>

      {/* Bottom Right Icons */}
      <div className="absolute bottom-48 right-8 lg:right-14 p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-cyan-600 transform rotate-3 hover:rotate-0 transition-transform">
        <Key className="w-6 h-6" />
      </div>

      <div className="absolute bottom-16 right-14 lg:right-24 p-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.05)] text-rose-600 transform -rotate-6 hover:rotate-0 transition-transform">
        <ShieldCheck className="w-6 h-6" />
      </div>

      {/* Ambient Color Glows */}
      <div 
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[130px] transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[130px] transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
    </div>
  );
};