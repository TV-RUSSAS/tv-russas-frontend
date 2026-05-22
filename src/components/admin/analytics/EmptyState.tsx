'use client';

import React from 'react';
import { BarChart3, Database } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'chart' | 'data';
}

export default function EmptyState({
  title = 'Nenhum dado encontrado',
  description = 'Não há registros estatísticos correspondentes para o período ou filtros selecionados.',
  icon = 'chart',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-[#12141D] border border-zinc-800/80 rounded-xl">
      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-zinc-500 mb-4 group-hover:text-[#ff5722] transition-colors duration-300">
        {icon === 'chart' ? (
          <BarChart3 className="w-8 h-8 text-zinc-600" />
        ) : (
          <Database className="w-8 h-8 text-zinc-600" />
        )}
      </div>
      <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-zinc-500 max-w-sm">{description}</p>
    </div>
  );
}
