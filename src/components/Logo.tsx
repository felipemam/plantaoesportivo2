import React from 'react';
import { useTheme } from '../context/ThemeContext';

export interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  size = 'md',
  showSlogan = true,
  className = '',
  onClick
}) => {
  const { theme } = useTheme();
  const effectiveVariant = variant === 'auto' ? theme : variant;
  const isDark = effectiveVariant === 'dark';

  const emblemSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14'
  };

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const titleSizes = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-[28px]',
    lg: 'text-3xl sm:text-4xl'
  };

  const sloganSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px] sm:text-xs',
    lg: 'text-xs sm:text-sm'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      role={onClick ? 'button' : 'img'}
      aria-label="Logo Plantão Esportivo"
    >
      {/* Sport Emblem */}
      <div
        className={`relative ${emblemSizes[size]} rounded-full flex items-center justify-center border-2 transition-all duration-200 shrink-0 ${
          isDark
            ? 'bg-[#0f172a] border-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.35)]'
            : 'bg-[#1e3a8a] border-[#dc2626] shadow-sm'
        } ${onClick ? 'group-hover:scale-105' : ''}`}
      >
        <svg className={starSizes[size]} viewBox="0 0 40 40" aria-hidden="true">
          <path
            d="M20 6 L23 17 L34 17 L25 23.5 L28.5 34 L20 27.5 L11.5 34 L15 23.5 L6 17 L17 17 Z"
            fill="#facc15"
          />
        </svg>
        <span
          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
            isDark
              ? 'bg-[#ef4444] border-gray-900 shadow-xs'
              : 'bg-[#dc2626] border-white shadow-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></span>
        </span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div
          className={`font-condensed font-black ${titleSizes[size]} tracking-tight leading-none uppercase transition-colors duration-200`}
        >
          <span className={isDark ? 'text-white' : 'text-[#1e3a8a]'}>Plantão </span>
          <span className={isDark ? 'text-[#ef4444]' : 'text-[#dc2626]'}>Esportivo</span>
        </div>
        {showSlogan && (
          <div
            className={`${sloganSizes[size]} font-medium tracking-normal mt-0.5 line-clamp-1 max-w-[290px] transition-colors duration-200 ${
              isDark ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            O esporte que você ama, na velocidade que você precisa
          </div>
        )}
      </div>
    </div>
  );
};
