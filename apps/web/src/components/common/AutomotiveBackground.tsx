import React from 'react';

export const AutomotiveBackground: React.FC<{ primaryColor: string }> = ({ primaryColor }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Precision Grid Background Texture */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* 2. Large Prominent Dhoot Group Winged Wheel Motif - Left Side Watermark */}
      <div className="absolute -top-12 -left-20 w-[550px] h-[550px] opacity-[0.14] transition-all duration-700 pointer-events-none">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Outer Wheel Rim */}
          <circle cx="200" cy="200" r="160" stroke="#1A1A2E" strokeWidth="20" fill="none" />
          <circle cx="200" cy="200" r="140" stroke="#1A1A2E" strokeWidth="4" fill="none" strokeDasharray="8 8" />
          <circle cx="200" cy="200" r="45" stroke="#1A1A2E" strokeWidth="12" fill="none" />
          <circle cx="200" cy="200" r="20" fill="#C8102E" />
          {/* 5-Spoke Star Design */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <line
              key={i}
              x1="200"
              y1="200"
              x2={200 + 135 * Math.cos((angle * Math.PI) / 180)}
              y2={200 + 135 * Math.sin((angle * Math.PI) / 180)}
              stroke="#1A1A2E"
              strokeWidth="12"
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

      {/* 3. Large Prominent Dhoot Group Winged Wheel Motif - Right Side Watermark */}
      <div className="absolute -bottom-16 -right-20 w-[600px] h-[600px] opacity-[0.14] transition-all duration-700 pointer-events-none transform rotate-180">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Outer Wheel Rim */}
          <circle cx="200" cy="200" r="160" stroke="#1A1A2E" strokeWidth="20" fill="none" />
          <circle cx="200" cy="200" r="140" stroke="#1A1A2E" strokeWidth="4" fill="none" strokeDasharray="8 8" />
          <circle cx="200" cy="200" r="45" stroke="#1A1A2E" strokeWidth="12" fill="none" />
          <circle cx="200" cy="200" r="20" fill="#C8102E" />
          {/* 5-Spoke Star Design */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <line
              key={i}
              x1="200"
              y1="200"
              x2={200 + 135 * Math.cos((angle * Math.PI) / 180)}
              y2={200 + 135 * Math.sin((angle * Math.PI) / 180)}
              stroke="#1A1A2E"
              strokeWidth="12"
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

      {/* 4. Ambient Radial Color Glows */}
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