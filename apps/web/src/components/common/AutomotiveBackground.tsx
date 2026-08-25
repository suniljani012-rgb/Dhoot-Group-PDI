import React from 'react';

export const AutomotiveBackground: React.FC<{ primaryColor: string }> = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Clean Subtle Engineering Dot Matrix Pattern (Desktop & Tablet only) */}
      <div 
        className="hidden md:block absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 2. Pure Authentic Dhoot Group Logo Watermark (NO color overlays, NO muddy blue blur) */}
      
      {/* Top-Left Crisp Watermark */}
      <div className="hidden md:block absolute top-6 -left-10 lg:top-10 lg:-left-12 w-64 h-64 lg:w-80 lg:h-80 opacity-[0.14] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Bottom-Right Crisp Watermark */}
      <div className="hidden md:block absolute bottom-6 -right-10 lg:bottom-10 lg:-right-12 w-64 h-64 lg:w-80 lg:h-80 opacity-[0.14] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};