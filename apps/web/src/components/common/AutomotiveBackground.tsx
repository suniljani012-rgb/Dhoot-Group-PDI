import React from 'react';

export const AutomotiveBackground: React.FC<{ primaryColor: string }> = ({ primaryColor }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Subtle Precision Engineering Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 2. EXACT 100% Authentic Dhoot Group Logo Watermark - Left Flank */}
      <div className="absolute top-10 -left-16 w-80 h-80 sm:w-96 sm:h-96 opacity-[0.18] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Authentic Watermark"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>

      {/* 3. EXACT 100% Authentic Dhoot Group Logo Watermark - Right Flank */}
      <div className="absolute bottom-6 -right-16 w-80 h-80 sm:w-96 sm:h-96 opacity-[0.18] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Authentic Watermark"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>

      {/* 4. Ambient Brand Lighting Glows */}
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