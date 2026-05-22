'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Eye, ThumbsUp } from 'lucide-react';
import TrendBadge from './TrendBadge';

export interface NewsPerformanceData {
  posicao: number;
  id: string;
  titulo: string;
  slug: string;
  capaUrl?: string;
  publicadoEm: string;
  categoria: string;
  autor: string;
  views: number;
  likes: number;
  engajamento: number;
  status: string;
  tendencia: 'subindo' | 'caiu' | 'estavel';
  variacao: number;
  crescimentoPercentual?: number;
  horarioDePico?: string;
  viewsRecentes?: number;
}

interface NewsPerformanceRowProps {
  news: NewsPerformanceData;
  tipo: 'mais-lidas' | 'em-alta';
}

export default function NewsPerformanceRow({ news, tipo }: NewsPerformanceRowProps) {
  // Lida com a URL da capa de forma robusta
  const getCapaUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${apiBaseUrl}${cleanUrl}`;
  };

  const podiumColor =
    news.posicao === 1
      ? 'text-amber-400 font-black'
      : news.posicao === 2
      ? 'text-zinc-300 font-bold'
      : news.posicao === 3
      ? 'text-amber-600 font-bold'
      : 'text-zinc-500';

  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-800/10 transition-colors duration-200 group">
      {/* Posição no Ranking */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`text-xl ${podiumColor}`}>
          #{news.posicao}
        </span>
      </td>

      {/* Identificação da Notícia (Capa + Título + Metadados) */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {news.capaUrl ? (
            <div className="w-14 h-10 rounded bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800/60 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCapaUrl(news.capaUrl)}
                alt={news.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-14 h-10 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 text-zinc-700" />
            </div>
          )}
          <div className="max-w-md sm:max-w-lg lg:max-w-xl">
            <h4 className="text-sm font-semibold text-zinc-100 line-clamp-1 group-hover:text-white transition-colors duration-200">
              {news.titulo}
            </h4>
            <div className="flex items-center gap-2.5 mt-1 text-xs text-zinc-500">
              <span className="px-1.5 py-0.5 rounded bg-zinc-800/40 text-zinc-400 border border-zinc-700/20">
                {news.categoria}
              </span>
              <span>•</span>
              <span>{news.autor}</span>
              <span>•</span>
              <span>{new Date(news.publicadoEm).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Visualizações no Período */}
      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-white font-mono tabular-nums">
        {tipo === 'em-alta' ? (
          <div>
            <div className="text-sm font-bold text-orange-400">+{(news.viewsRecentes || 0).toLocaleString('pt-BR')}</div>
            <div className="text-xxs text-zinc-500 font-normal mt-0.5">{(news.views || 0).toLocaleString('pt-BR')} totais</div>
          </div>
        ) : (
          (news.views || 0).toLocaleString('pt-BR')
        )}
      </td>

      {/* Curtidas ou Velocidade */}
      {tipo === 'mais-lidas' ? (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="inline-flex items-center gap-1 text-xs text-zinc-400 font-medium">
            <ThumbsUp className="w-3.5 h-3.5 text-zinc-500" />
            <span>{news.likes || 0}</span>
          </div>
        </td>
      ) : (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <span className="text-xs text-zinc-400 font-mono font-medium">{news.horarioDePico || '—'}</span>
        </td>
      )}

      {/* Engajamento ou Aceleração */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {tipo === 'mais-lidas' ? (
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-zinc-200 font-mono">{news.engajamento || 0}%</span>
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mt-1.5 overflow-hidden border border-zinc-700/20">
              <div 
                className="h-full bg-linear-to-r from-orange-500 to-[#ff5722] rounded-full" 
                style={{ width: `${Math.min(100, news.engajamento || 0)}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-sm font-bold text-emerald-400 font-mono">
            +{(news.crescimentoPercentual || 0).toLocaleString('pt-BR')}%
          </span>
        )}
      </td>

      {/* Tendência de Ranking */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <TrendBadge 
          tendencia={news.tendencia} 
          variacao={news.variacao > 0 ? `${news.variacao} pos.` : undefined} 
        />
      </td>

      {/* Ações */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Link para o Portal */}
          <Link
            href={`/noticia/${news.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-zinc-800/40 text-zinc-400 hover:text-white border border-zinc-700/30 flex items-center justify-center transition-all hover:bg-zinc-800"
            title="Visualizar Notícia no Portal"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {/* Link para Edição no Admin */}
          <Link
            href={`/admin/noticias/editar/${news.id}`}
            className="w-8 h-8 rounded-lg bg-zinc-800/40 text-zinc-400 hover:text-[#ff5722] hover:bg-[#ff5722]/5 border border-zinc-700/30 flex items-center justify-center transition-all"
            title="Editar Matéria"
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
