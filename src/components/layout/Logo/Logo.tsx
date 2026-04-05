import React from 'react';

export interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12" }) => (
  <div className={`flex items-center ${className}`}>
    <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-md flex items-center justify-center px-3 py-1.5 group transition-transform hover:scale-105">
      <span className="text-white font-black text-lg tracking-tight">ANDY</span>
      <div className="absolute -inset-1 bg-indigo-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </div>
);
