import React from 'react';

export function VibrantPulse(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-logo-pulse text-amber-500 ${props.className || ''}`}
      {...props}
    >
      <path 
        d="M50 85 C 20 60, 5 35, 15 20 C 25 5, 45 15, 50 35 C 55 15, 75 5, 85 20 C 95 35, 80 60, 50 85" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="opacity-90 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
      />
      <path 
        d="M50 85 C 40 70, 20 50, 25 30 C 30 15, 45 25, 50 45 C 55 25, 70 15, 75 30 C 80 50, 60 70, 50 85" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="opacity-70 text-orange-400"
        strokeDasharray="6 4"
      />
    </svg>
  );
}
