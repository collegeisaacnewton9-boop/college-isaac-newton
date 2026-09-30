import React from 'react';

interface SchoolLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
  compact?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  className = '', 
  variant = 'color',
  compact = false 
}) => {
  const isLight = variant === 'light';
  
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Crest Icon: Open Book + Mortarboard Academic Cap */}
      <div className={`relative flex items-center justify-center rounded-lg p-2 transition-transform hover:scale-105 ${
        isLight 
          ? 'bg-white/10 text-white border border-white/20' 
          : 'bg-navy-900 text-white shadow-md'
      }`}>
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-7 h-7 sm:w-8 sm:h-8"
          aria-hidden="true"
        >
          {/* Graduation Cap */}
          <path 
            d="M24 6L6 15L24 24L42 15L24 6Z" 
            fill={isLight ? '#F59E0B' : '#EAB308'} 
          />
          <path 
            d="M13 18.5V28C13 32 17.5 35 24 35C30.5 35 35 32 35 28V18.5" 
            stroke={isLight ? '#FFFFFF' : '#93C5FD'} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Tassel */}
          <path 
            d="M39 16.5V27C39 28.5 38 30 36.5 30" 
            stroke={isLight ? '#F59E0B' : '#EAB308'} 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          {/* Open Book Wings at bottom */}
          <path 
            d="M10 39C16 36 21 38 24 41C27 38 32 36 38 39V33C32 30 27 32 24 35C21 32 16 30 10 33V39Z" 
            fill={isLight ? '#FFFFFF' : '#1E3A8A'} 
            stroke={isLight ? '#F59E0B' : '#BFDBFE'} 
            strokeWidth="1.5" 
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] sm:text-xs font-semibold tracking-widest uppercase ${
            isLight ? 'text-amber-300' : 'text-blue-900'
          }`}>
            Collège
          </span>
        </div>
        <span className={`font-serif font-bold text-base sm:text-lg tracking-tight leading-tight ${
          isLight ? 'text-white' : 'text-slate-900'
        }`}>
          Isaac Newton
        </span>
        {!compact && (
          <span className={`text-[10px] italic font-medium leading-none mt-0.5 ${
            isLight ? 'text-slate-300' : 'text-slate-500'
          }`}>
            Savoir aujourd'hui, réussir demain
          </span>
        )}
      </div>
    </div>
  );
};
