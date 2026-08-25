import React from 'react';

export const AutomotiveBackground: React.FC<{ primaryColor: string }> = ({ primaryColor }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Subtle Precision Engineering Grid Pattern (Desktop / Tablet only) */}
      <div 
        className="hidden sm:block absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 2. Dhoot Group Watermarks (Hidden on Mobile, Visible only on larger Desktop screens) */}
      <div className="hidden lg:block absolute top-10 -left-16 w-80 h-80 opacity-[0.15] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Watermark"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>

      <div className="hidden lg:block absolute bottom-6 -right-16 w-80 h-80 opacity-[0.15] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Watermark"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>

      {/* 3. Soft Ambient Color Glow */}
      <div 
        className="hidden sm:block absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-15 blur-[130px] transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
    </div>
  );
};