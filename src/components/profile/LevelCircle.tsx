import React from "react";
import { getLevelInfo } from "@/lib/levels";

export default function LevelCircle({
  xp = 0,
  size = 40,
  strokeWidth = 3,
}: {
  xp?: number;
  size?: number;
  strokeWidth?: number;
}) {
  const info = getLevelInfo(xp);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (info.progressPercent / 100) * circumference;

  return (
    <div 
      className="relative flex items-center justify-center shrink-0 group"
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-amber-500 transition-all duration-1000 ease-out drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-black text-white leading-none shadow-black drop-shadow-md" style={{ fontSize: Math.max(10, size * 0.4) }}>
          {info.level}
        </span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 border border-white/10 text-white/90 text-[10px] px-2 py-1 rounded-lg z-50 shadow-xl">
        <span dir="ltr">{info.currentXp.toLocaleString()} / {info.isMaxLevel ? "MAX" : info.nextThreshold.toLocaleString()} XP</span>
      </div>
    </div>
  );
}
