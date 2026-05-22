'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import TrendBadge from './TrendBadge';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  tendencia?: 'subindo' | 'caiu' | 'estavel';
  variacao?: number | string;
  loading?: boolean;
}

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  tendencia,
  variacao,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-[#12141D] border border-zinc-800 rounded-xl p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 bg-zinc-800 rounded w-28"></div>
          <div className="w-10 h-10 bg-zinc-800 rounded-lg"></div>
        </div>
        <div className="h-8 bg-zinc-800 rounded w-20 mb-2"></div>
        <div className="h-3 bg-zinc-800 rounded w-36"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#12141D] border border-zinc-800/80 rounded-xl p-6 hover:border-zinc-700/60 transition-all duration-300 relative overflow-hidden group">
      {/* Detalhe de luz sutil no hover */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-[#ff5722]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center border border-zinc-700/30 text-zinc-400 group-hover:text-[#ff5722] group-hover:bg-[#ff5722]/5 transition-all duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/60">
        {tendencia && (
          <TrendBadge tendencia={tendencia} variacao={variacao} />
        )}
        {subtext && (
          <span className="text-xs text-zinc-500 font-medium">{subtext}</span>
        )}
      </div>
    </div>
  );
}
