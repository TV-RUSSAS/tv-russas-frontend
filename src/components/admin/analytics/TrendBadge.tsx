'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendBadgeProps {
  tendencia: 'subindo' | 'caiu' | 'estavel';
  variacao?: number | string;
  className?: string;
}

export default function TrendBadge({ tendencia, variacao, className = '' }: TrendBadgeProps) {
  if (tendencia === 'subindo') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
        <TrendingUp className="w-3.5 h-3.5" />
        {variacao !== undefined && <span>{variacao}</span>}
      </span>
    );
  }

  if (tendencia === 'caiu') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 ${className}`}>
        <TrendingDown className="w-3.5 h-3.5" />
        {variacao !== undefined && <span>{variacao}</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700/50 ${className}`}>
      <Minus className="w-3.5 h-3.5" />
      <span>Estável</span>
    </span>
  );
}
