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
      <div className="an-skeleton-kpi" />
    );
  }

  return (
    <div className="an-kpi-card group">
      {/* Detalhe de luz sutil no hover */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-[#ff5722]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="an-kpi-label">{title}</p>
          <h3 className="an-kpi-value">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex shrink-0 items-center justify-center border border-zinc-700/30 text-zinc-400 group-hover:text-[#ff5722] group-hover:bg-[#ff5722]/5 transition-all duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="an-kpi-footer flex flex-col items-start gap-2 min-w-0">
        {tendencia && (
          <TrendBadge tendencia={tendencia} variacao={variacao} />
        )}
        {subtext && (
          <span className="an-kpi-sub min-w-0">{subtext}</span>
        )}
      </div>
    </div>
  );
}
