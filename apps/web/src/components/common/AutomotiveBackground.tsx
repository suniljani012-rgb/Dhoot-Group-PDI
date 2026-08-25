import React from 'react';
import { Gauge, Zap, Disc, Cpu, Sliders, ShieldCheck, Key, Wrench, BatteryCharging, Radio, Compass, Fuel, CircleDot } from 'lucide-react';

export const AutomotiveBackground: React.FC<{ primaryColor: string }> = ({ primaryColor }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Large Dhoot Group Winged Wheel Stylized Watermark in Center Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] opacity-[0.035] transition-all duration-700 pointer-events-none">
        <svg viewBox="0 0 400 400" className="w-full h-full animate-spin-slow">
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

      {/* 2. Precision Isometric Engineering Grid */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 3. Floating Automotive Diagnostics & Precision Engineering Icon Nodes */}
      
      {/* Top Left: Tachometer & EV Battery */}
      <div className="absolute top-12 left-10 lg:left-24 flex items-center gap-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transform -rotate-3 hover:rotate-0 transition-transform">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
          <Gauge className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">OBD-II Diagnostic</div>
          <div className="text-[10px] text-slate-500 font-semibold">ECU & Powertrain Test</div>
        </div>
      </div>

      <div className="absolute top-44 left-6 lg:left-14 flex items-center gap-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transform rotate-2 hover:rotate-0 transition-transform">
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
          <BatteryCharging className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">EV High-Voltage</div>
          <div className="text-[10px] text-slate-500 font-semibold">State of Health (SoH)</div>
        </div>
      </div>

      {/* Bottom Left: Brake Disc & Suspension */}
      <div className="absolute bottom-24 left-10 lg:left-24 flex items-center gap-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transform rotate-3 hover:rotate-0 transition-transform">
        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
          <Disc className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Brake & Tyres</div>
          <div className="text-[10px] text-slate-500 font-semibold">Tread Depth & Torque</div>
        </div>
      </div>

      <div className="absolute bottom-52 left-6 lg:left-12 flex items-center gap-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transform -rotate-2 hover:rotate-0 transition-transform">
        <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
          <Sliders className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Wheel Alignment</div>
          <div className="text-[10px] text-slate-500 font-semibold">Suspension Geometry</div>
        </div>
      </div>

      {/* Top Right: Safety Sensor & Smart Key */}
      <div className="absolute top-12 right-10 lg:right-24 flex items-center gap-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transform rotate-3 hover:rotate-0 transition-transform">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
          <Cpu className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">ADAS & Radar</div>
          <div className="text-[10px] text-slate-500 font-semibold">Sensor Calibration</div>
        </div>
      </div>

      <div className="absolute top-44 right-6 lg:right-14 flex items-center gap-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transform -rotate-2 hover:rotate-0 transition-transform">
        <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
          <Key className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Smart Key & Immobilizer</div>
          <div className="text-[10px] text-slate-500 font-semibold">Fob Pairing Verified</div>
        </div>
      </div>

      {/* Bottom Right: Quality Inspection & Workshop */}
      <div className="absolute bottom-24 right-10 lg:right-24 flex items-center gap-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transform -rotate-3 hover:rotate-0 transition-transform">
        <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">PDI Quality Pass</div>
          <div className="text-[10px] text-slate-500 font-semibold">Zero-Defect Audit</div>
        </div>
      </div>

      <div className="absolute bottom-52 right-6 lg:right-12 flex items-center gap-3 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transform rotate-2 hover:rotate-0 transition-transform">
        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
          <Wrench className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Pre-Delivery Service</div>
          <div className="text-[10px] text-slate-500 font-semibold">Fluid Levels & Checklist</div>
        </div>
      </div>

      {/* Ambient Radial Color Glows */}
      <div 
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full opacity-20 blur-[130px] transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full opacity-20 blur-[130px] transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
    </div>
  );
};