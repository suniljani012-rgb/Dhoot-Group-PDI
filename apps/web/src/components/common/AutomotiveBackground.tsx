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

      {/* 2. Authentic Dhoot Group Logo Watermarks — Brought Closer to the Center Card */}
      
      {/* Left Flank Logo (Brought in closer to the center card) */}
      <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-8 xl:left-24 2xl:left-48 w-60 h-60 xl:w-72 xl:h-72 opacity-[0.18] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Right Flank Logo (Brought in closer to the center card) */}
      <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-8 xl:right-24 2xl:right-48 w-60 h-60 xl:w-72 xl:h-72 opacity-[0.18] transition-all duration-700 pointer-events-none">
        <img
          src="/logo.png"
          alt="Dhoot Group Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};