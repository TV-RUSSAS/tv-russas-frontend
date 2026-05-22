'use client';

import React, { useState } from 'react';

interface ChartDataItem {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: ChartDataItem[];
  type?: 'line' | 'bar';
  color?: string;
  height?: number;
  loading?: boolean;
}

export default function AnalyticsChart({
  data,
  type = 'line',
  color = '#ff5722',
  height = 320,
  loading = false,
}: AnalyticsChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (loading) {
    return (
      <div 
        className="w-full bg-[#12141D] border border-zinc-800 rounded-xl flex items-center justify-center animate-pulse"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-zinc-600 border-zinc-800 rounded-full animate-spin"></div>
          <span className="text-xs text-zinc-500 font-medium">Carregando dados estatísticos...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div 
        className="w-full bg-[#12141D] border border-zinc-800 rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-sm text-zinc-500">Nenhum dado histórico disponível</span>
      </div>
    );
  }

  // Dimensões internas da área de plotagem
  const svgWidth = 1000;
  const svgHeight = 300;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Lógica de valores
  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  // Calcular pontos no plano do SVG
  const points = data.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / Math.max(data.length - 1, 1);
    const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  // Linhas horizontais de referência (Grid Lines)
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = paddingTop + chartHeight - ratio * chartHeight;
    const value = Math.round(minVal + ratio * (maxVal - minVal));
    return { y, value };
  });

  // Gerar caminho d do SVG Line
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Gerar caminho preenchido para gradiente sutil
  let areaPath = '';
  if (points.length > 0) {
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  return (
    <div className="w-full bg-[#12141D] border border-zinc-800/80 rounded-xl p-5 relative group">
      {/* Tooltip flutuante superior elegante no hover dos nós */}
      {activeIdx !== null && (
        <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-700/60 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-3.5 z-10 transition-all duration-150">
          <div className="flex flex-col">
            <span className="text-xxs text-zinc-500 uppercase tracking-widest font-semibold">{points[activeIdx].label}</span>
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {points[activeIdx].value.toLocaleString('pt-BR')} <span className="text-xs font-normal text-zinc-400">views</span>
            </span>
          </div>
        </div>
      )}

      {/* SVG Container responsivo */}
      <div className="w-full overflow-x-auto select-none scrollbar-none">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full min-w-[700px] h-auto overflow-visible"
        >
          {/* Definições de Gradientes e Filtros */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Lines Horizontais e Labels de Eixo Y */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="transition-opacity duration-300">
              <line 
                x1={paddingLeft} 
                y1={line.y} 
                x2={svgWidth - paddingRight} 
                y2={line.y} 
                stroke="#27272a" 
                strokeWidth="1"
                strokeDasharray="4 6"
                opacity="0.4"
              />
              <text 
                x={paddingLeft - 12} 
                y={line.y + 4} 
                fill="#71717a" 
                fontSize="11" 
                fontWeight="500"
                fontFamily="monospace"
                textAnchor="end"
              >
                {line.value >= 1000 ? `${(line.value / 1000).toFixed(1)}k` : line.value}
              </text>
            </g>
          ))}

          {/* Renderização em Barras */}
          {type === 'bar' && (
            <g>
              {points.map((pt, idx) => {
                // Cálculo da largura da barra
                const totalBars = points.length;
                const barWidth = Math.max(8, (chartWidth / totalBars) * 0.55);
                const rx = 4; // cantos arredondados no topo
                const barHeight = Math.max(4, paddingTop + chartHeight - pt.y);

                return (
                  <g 
                    key={idx}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(null)}
                    className="cursor-pointer"
                  >
                    {/* Barra Preenchida */}
                    <rect
                      x={pt.x - barWidth / 2}
                      y={pt.y}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#barGradient)"
                      rx={rx}
                      className="transition-all duration-300 hover:brightness-125"
                      opacity={activeIdx === null || activeIdx === idx ? 1 : 0.4}
                    />
                    {/* Destaque sutil de topo na barra ativa */}
                    {activeIdx === idx && (
                      <rect
                        x={pt.x - barWidth / 2}
                        y={pt.y}
                        width={barWidth}
                        height={3}
                        fill={color}
                        rx={1.5}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Renderização em Linha (Line + Área Gradiente) */}
          {type === 'line' && (
            <g>
              {/* Área Sombreada Gradiente sob a Linha */}
              <path
                d={areaPath}
                fill="url(#chartGradient)"
                className="transition-all duration-300"
              />

              {/* Linha de Traçado Principal com Brilho */}
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                className="transition-all duration-300"
              />

              {/* Nós Interativos (Círculos) sobre a Linha */}
              {points.map((pt, idx) => {
                const isHovered = activeIdx === idx;
                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(null)}
                    className="cursor-pointer"
                  >
                    {/* Círculo de Detecção Maior (invisível) */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="16"
                      fill="transparent"
                    />
                    {/* Círculo Externo com Halo no Hover */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 8 : 4.5}
                      fill={color}
                      stroke="#0B0B0F"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Halo Translúcido Extra no Hover */}
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="14"
                        fill={color}
                        fillOpacity="0.15"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Eixo X e Labels */}
          <line 
            x1={paddingLeft} 
            y1={paddingTop + chartHeight} 
            x2={svgWidth - paddingRight} 
            y2={paddingTop + chartHeight} 
            stroke="#27272a" 
            strokeWidth="1.5"
          />

          {points.map((pt, idx) => {
            // Mostrar todas as labels para conjuntos menores, ou apenas algumas se for muito longo
            const step = Math.max(1, Math.ceil(data.length / 10));
            const shouldShowLabel = idx % step === 0 || idx === data.length - 1;

            if (!shouldShowLabel) return null;

            return (
              <text
                key={idx}
                x={pt.x}
                y={paddingTop + chartHeight + 20}
                fill={activeIdx === idx ? '#white' : '#71717a'}
                fontSize="10"
                fontWeight={activeIdx === idx ? '700' : '500'}
                textAnchor="middle"
                className="transition-colors duration-150"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
