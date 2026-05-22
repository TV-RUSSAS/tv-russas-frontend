'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  BarChart3, 
  Eye, 
  ThumbsUp, 
  Clock, 
  FileText, 
  Tag, 
  Activity,
  UserCheck,
  TrendingUp,
  Loader2
} from 'lucide-react';
import PeriodFilter from '@/components/admin/analytics/PeriodFilter';
import MetricCard from '@/components/admin/analytics/MetricCard';
import AnalyticsChart from '@/components/admin/analytics/AnalyticsChart';
import EmptyState from '@/components/admin/analytics/EmptyState';

interface OverviewData {
  totalNoticias: number;
  totalViews: number;
  viewsHoje: number;
  views7d: number;
  views30d: number;
  curtidas: number;
  feedbacks: number;
  sugestoesTotal: number;
  sugestoesPendentes: number;
  crescimentoSemanal: number;
  mediaLeituraMinutos: number;
}

interface HistoricoViewsItem {
  data: string;
  views: number;
  publicacoes: number;
}

interface HistoricoData {
  historico: HistoricoViewsItem[];
  comparativo: {
    atual: number;
    anterior: number;
    variacao: string;
  };
}

interface CategoriaData {
  id: string;
  nome: string;
  slug: string;
  noticiasCount: number;
  views: number;
  percentual: number;
}

interface AutorData {
  id: string;
  nome: string;
  tipo: string;
  avatar: string | null;
  noticiasCount: number;
  views: number;
  curtidas: number;
  mediaViews: number;
}

export default function AnalyticsDashboardPage() {
  const { authFetch } = useAdminAuth();

  // Estados dos Filtros Globais
  const [periodo, setPeriodo] = useState('7d');
  
  // Filtro específico do gráfico histórico
  const [graficoDias, setGraficoDias] = useState(7);

  // Estados de Dados da API
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [historico, setHistorico] = useState<HistoricoData | null>(null);
  const [categorias, setCategorias] = useState<CategoriaData[]>([]);
  const [autores, setAutores] = useState<AutorData[]>([]);

  // Estados de carregamento
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingGrafico, setLoadingGrafico] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingAutores, setLoadingAutores] = useState(true);
  // 1. Buscar Overview
  const fetchOverview = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoadingOverview(true);
      const res = await authFetch('/admin/analytics/overview');
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error('Erro ao buscar visão geral das estatísticas:', err);
    } finally {
      setLoadingOverview(false);
    }
  }, [authFetch]);

  // 2. Buscar Histórico Diário (Gráfico)
  const fetchHistorico = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoadingGrafico(true);
      const res = await authFetch(`/admin/analytics/views-por-dia?dias=${graficoDias}`);
      if (res.ok) {
        const data = await res.json();
        setHistorico(data);
      }
    } catch (err) {
      console.error('Erro ao buscar histórico de visualizações:', err);
    } finally {
      setLoadingGrafico(false);
    }
  }, [authFetch, graficoDias]);

  // 3. Buscar Categorias
  const fetchCategorias = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoadingCategorias(true);
      const res = await authFetch(`/admin/analytics/categorias?periodo=${periodo}`);
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error('Erro ao buscar tráfego por categoria:', err);
    } finally {
      setLoadingCategorias(false);
    }
  }, [authFetch, periodo]);

  // 4. Buscar Autores
  const fetchAutores = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoadingAutores(true);
      const res = await authFetch(`/admin/analytics/autores?periodo=${periodo}`);
      if (res.ok) {
        const data = await res.json();
        setAutores(data);
      }
    } catch (err) {
      console.error('Erro ao buscar ranking de autores:', err);
    } finally {
      setLoadingAutores(false);
    }
  }, [authFetch, periodo]);

  // Inicializar e atualizar com base nos filtros correspondentes
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchOverview();
    });
  }, [fetchOverview]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchHistorico();
    });
  }, [fetchHistorico]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCategorias();
      fetchAutores();
    });
  }, [fetchCategorias, fetchAutores]);

  // Formatar data em string amigável (Dia/Mês) para o gráfico SVG
  const formatarDataGrafico = (strData: string) => {
    const d = new Date(strData + 'T12:00:00'); // evita problemas de timezone local
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  };

  const chartData = historico?.historico.map(item => ({
    label: formatarDataGrafico(item.data),
    value: item.views
  })) || [];

  // Mapeia avatar ou iniciais dos autores
  const renderAvatarAutor = (aut: AutorData) => {
    if (aut.avatar) {
      const isExternal = aut.avatar.startsWith('http://') || aut.avatar.startsWith('https://');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const cleanUrl = aut.avatar.startsWith('/') ? aut.avatar : `/${aut.avatar}`;
      const src = isExternal ? aut.avatar : `${apiBaseUrl}${cleanUrl}`;

      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={aut.nome}
          className="w-8 h-8 rounded-full object-cover border border-zinc-800"
        />
      );
    }

    const iniciais = aut.nome
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();

    return (
      <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/50 flex items-center justify-center text-xs font-bold font-mono">
        {iniciais}
      </div>
    );
  };

  const isGlobalLoading = loadingOverview && loadingGrafico && loadingCategorias && loadingAutores;

  return (
    <div className="space-y-8 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-[#ff5722]" />
            Analytics Editorial
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Métricas integradas e consolidadas de acessos, engajamento e produção jornalística.
          </p>
        </div>

        {/* Filtro de Período Global */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <PeriodFilter selected={periodo} onChange={setPeriodo} />
          {isGlobalLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-[#ff5722]" />
          )}
        </div>
      </div>

      {/* Grid de KPIs no Topo (Mapeia o overview consolidado) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Visualizações do Período"
          value={
            overview 
              ? periodo === 'hoje' ? overview.viewsHoje.toLocaleString('pt-BR') 
              : periodo === '7d' ? overview.views7d.toLocaleString('pt-BR') 
              : periodo === '30d' ? overview.views30d.toLocaleString('pt-BR')
              : overview.totalViews.toLocaleString('pt-BR')
              : '0'
          }
          subtext={`Acumulado de tráfego (${periodo === 'mes' ? 'Este Mês' : periodo === 'geral' ? 'Total Histórico' : 'Últimos ' + periodo})`}
          icon={Eye}
          tendencia={overview && overview.crescimentoSemanal >= 0 ? 'subindo' : 'caiu'}
          variacao={overview ? `${Math.abs(overview.crescimentoSemanal)}% vs. anterior` : undefined}
          loading={loadingOverview}
        />
        <MetricCard
          title="Tempo Médio de Leitura"
          value={overview ? `${overview.mediaLeituraMinutos} min` : '2.5 min'}
          subtext="Média ponderada por palavras"
          icon={Clock}
          loading={loadingOverview}
        />
        <MetricCard
          title="Feedbacks & Likes"
          value={overview ? overview.curtidas.toLocaleString('pt-BR') : '0'}
          subtext={overview ? `${overview.feedbacks.toLocaleString('pt-BR')} interações totais` : '0 interações'}
          icon={ThumbsUp}
          loading={loadingOverview}
        />
        <MetricCard
          title="Matérias Publicadas"
          value={overview ? overview.totalNoticias.toLocaleString('pt-BR') : '0'}
          subtext="Acervo editorial ativo"
          icon={FileText}
          loading={loadingOverview}
        />
      </div>

      {/* GRÁFICO HISTÓRICO CENTRAL Evolution */}
      <div className="bg-[#12141D] border border-zinc-800/80 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ff5722]" />
              Evolução Diária de Visualizações
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Histórico diário de pageviews nas notícias do portal
            </p>
          </div>

          {/* Filtro rápido de dias do gráfico */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg self-start sm:self-auto">
            {[7, 14, 30].map((dias) => (
              <button
                key={dias}
                type="button"
                onClick={() => setGraficoDias(dias)}
                className={`px-2.5 py-1 rounded text-xxs font-extrabold tracking-wide uppercase transition-all ${
                  graficoDias === dias
                    ? 'bg-zinc-800 text-white border border-zinc-700/50'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {dias} Dias
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico SVG */}
        <AnalyticsChart 
          data={chartData} 
          type="line"
          color="#ff5722"
          loading={loadingGrafico}
        />

        {/* Comparativo do Gráfico */}
        {historico && !loadingGrafico && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-zinc-850">
            <div className="sm:pr-6">
              <span className="text-xxs text-zinc-500 uppercase font-bold">Visualizações no Intervalo</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{historico.comparativo.atual.toLocaleString('pt-BR')}</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-6">
              <span className="text-xxs text-zinc-500 uppercase font-bold">Intervalo Anterior</span>
              <p className="text-xl font-bold text-zinc-400 font-mono mt-1">{historico.comparativo.anterior.toLocaleString('pt-BR')}</p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <span className="text-xxs text-zinc-500 uppercase font-bold">Variação Percentual</span>
              <p className={`text-xl font-bold mt-1 flex items-center justify-center sm:justify-start gap-1 font-mono ${
                historico.comparativo.variacao.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                <TrendingUp className={`w-4 h-4 ${historico.comparativo.variacao.startsWith('+') ? '' : 'rotate-180'}`} />
                {historico.comparativo.variacao}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DUAS COLUNAS LADO A LADO: Categorias e Autores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1: Desempenho de Categorias */}
        <div className="bg-[#12141D] border border-zinc-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-zinc-500" />
                Desempenho por Categorias
              </h2>
              <span className="text-xxs text-zinc-400 font-semibold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/30">
                Filtro: {periodo.toUpperCase()}
              </span>
            </div>

            {loadingCategorias ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-zinc-850 rounded w-24"></div>
                      <div className="h-4 bg-zinc-850 rounded w-12"></div>
                    </div>
                    <div className="h-2 bg-zinc-850 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : categorias.length === 0 ? (
              <div className="py-8">
                <EmptyState title="Sem dados de categorias" />
              </div>
            ) : (
              <div className="space-y-5">
                {categorias.map((cat) => (
                  <div key={cat.id} className="space-y-1.5 group">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">
                        {cat.nome}
                      </span>
                      <span className="text-zinc-500 font-medium">
                        <strong className="text-white font-mono">{cat.views.toLocaleString('pt-BR')}</strong> views ({cat.percentual}%)
                      </span>
                    </div>
                    {/* Barra de Progresso Horizontal Premium */}
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60 flex">
                      <div 
                        className="h-full bg-linear-to-r from-orange-600 to-[#ff5722] rounded-full group-hover:brightness-110 transition-all duration-300"
                        style={{ width: `${cat.percentual}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-500 flex justify-between">
                      <span>{cat.noticiasCount} matérias publicadas</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Ranking de Autores / Jornalistas */}
        <div className="bg-[#12141D] border border-zinc-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-zinc-500" />
                Desempenho de Autores & Colunistas
              </h2>
              <span className="text-xxs text-zinc-400 font-semibold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/30">
                Produção Ativa
              </span>
            </div>

            {loadingAutores ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-850"></div>
                    <div className="grow space-y-1">
                      <div className="h-3.5 bg-zinc-850 rounded w-28"></div>
                      <div className="h-2.5 bg-zinc-850 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-zinc-850 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : autores.length === 0 ? (
              <div className="py-8">
                <EmptyState title="Sem dados de autores" />
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {autores.map((aut, idx) => (
                  <div key={aut.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-zinc-500 w-4">
                        #{idx + 1}
                      </span>
                      {renderAvatarAutor(aut)}
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors leading-none">
                          {aut.nome}
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-1">
                          {aut.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-zinc-100 block">
                        {aut.views.toLocaleString('pt-BR')} views
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">
                        {aut.noticiasCount} matérias • {aut.mediaViews.toLocaleString('pt-BR')}/mat.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
