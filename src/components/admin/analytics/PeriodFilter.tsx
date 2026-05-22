'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface PeriodFilterProps {
  selected: string;
  onChange: (value: string) => void;
  options?: FilterOption[];
  className?: string;
}

const defaultOptions: FilterOption[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7d', label: '7 Dias' },
  { value: '30d', label: '30 Dias' },
  { value: 'mes', label: 'Este Mês' },
  { value: 'geral', label: 'Geral' },
];

export default function PeriodFilter({
  selected,
  onChange,
  options = defaultOptions,
  className = '',
}: PeriodFilterProps) {
  return (
    <div className={`flex items-center gap-2 bg-[#12141D] border border-zinc-800 p-1 rounded-lg ${className}`}>
      <div className="pl-2 pr-1 text-zinc-500 hidden sm:block">
        <Calendar className="w-4 h-4" />
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {options.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 ${
                isActive
                  ? 'bg-[#ff5722] text-white shadow-lg shadow-[#ff5722]/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
