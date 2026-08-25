import React from 'react';

export const AutomotiveBackground: React.FC<{ primaryColor: string }> = ({ primaryColor }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Subtle Precision Engineering Grid Pattern (Visible on Tablet & Desktop, Hidden on Mobile) */}
      <div 
        className="hidden md:block absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 2. Dhoot Group Authentic Logo Watermarks — Visible on Tablet (md) & Desktop (lg), HIDDEN on Mobile */}
      
      {/* Top-Left Authentic Dhoot Logo Watermark */}
      <div className="hidden md:block absolute top-6 -left-12 lg:top-12 lg:-left-16 w-72 h-72 lg:w-96 lg:h-96 opacity-[0.20] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Background Watermark"
          className="w-full h-full object-contain filter drop-shadow-md"
        />
      </div>

      {/* Bottom-Right Authentic Dhoot Logo Watermark */}
      <div className="hidden md:block absolute bottom-6 -right-12 lg:bottom-8 lg:-right-16 w-72 h-72 lg:w-96 lg:h-96 opacity-[0.20] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Background Watermark"
          className="w-full h-full object-contain filter drop-shadow-md"
        />
      </div>

      {/* 3. Soft Ambient Color Glows (Tablet & Desktop only) */}
      <div 
        className="hidden md:block absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full opacity-18 blur-[130px] transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="hidden md:block absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full opacity-18 blur-[130px] transition-all duration-700 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
    </div>
  );
};