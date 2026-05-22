'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  Zap, 
  Clock, 
  BarChart3, 
  FolderOpen,
  Activity,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import PeriodFilter from '@/components/admin/analytics/PeriodFilter';
import NewsPerformanceRow, { NewsPerformanceData } from '@/components/admin/analytics/NewsPerformanceRow';
import MetricCard from '@/components/admin/analytics/MetricCard';
import EmptyState from '@/components/admin/analytics/EmptyState';

interface CategoriaOption {
  id: string;
  nome: string;
}

interface CardsData {
  maiorCrescimento: {
    titulo: string;
    crescimento: string;
  };
  categoriaEmAlta: string;
  picoDeAcessos: string;
  mediaViewsHora: string;
}

const emAltaPeriodOptions = [
  { value: '1h', label: 'Última 1h' },
  { value: '6h', label: 'Últimas 6h' },
  { value: '24h', label: '24 Horas' },
  { value: '48h', label: '48 Horas' },
];

export default function EmAltaPage() {
  const { authFetch } = useAdminAuth();

  // Estados dos filtros
  const [periodo, setPeriodo] = useState('24h');
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);

  // Estados de dados
  const [noticias, setNoticias] = useState<NewsPerformanceData[]>([]);
  const [cards, setCards] = useState<CardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [error, setError] = useState('');

  // Carregar lista de categorias
  useEffect(() => {
    let active = true;
    authFetch('/admin/categorias')
      .then(r => r.json())
      .then(data => {
        if (active) {
          setCategorias(data);
          setLoadingFiltros(false);
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar categorias:', err);
        if (active) setLoadingFiltros(false);
      });

    return () => { active = false; };
  }, [authFetch]);

  // Carregar tráfego em alta
  const fetchEmAlta = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams({ periodo });
      if (categoriaId) queryParams.set('categoriaId', categoriaId);

      const res = await authFetch(`/admin/analytics/em-alta?${queryParams}`);
      if (!res.ok) {
        throw new Error('Falha ao obter dados de tráfego em alta');
      }

      const data = await res.json();
      setNoticias(data.noticias || []);
      setCards(data.cards || null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado ao carregar matérias em alta.');
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch, periodo, categoriaId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchEmAlta();
    });
  }, [fetchEmAlta]);

  return (
    <div className="space-y-8 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-8 h-8 text-[#ff5722]" />
            Em Alta
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Velocidade editorial: notícias com aceleração de acessos nas últimas horas.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-[#12141D]/60 border border-zinc-800/60 p-4 rounded-xl">
        <div className="shrink-0">
          <PeriodFilter 
            selected={periodo} 
            onChange={setPeriodo} 
            options={emAltaPeriodOptions} 
          />
        </div>

        <div className="relative grow max-w-xs">
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full bg-[#12141D] border border-zinc-800 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-[#ff5722]/50 transition-colors"
            disabled={loadingFiltros}
          >
            <option value="">Todas as Categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
            <FolderOpen className="w-3.5 h-3.5" />
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-zinc-400 self-center md:self-auto px-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#ff5722]" />
            <span className="text-xs font-medium">Analisando tráfego...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Grid de Métricas de Velocidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Maior Crescimento"
          value={cards?.maiorCrescimento?.crescimento || '0%'}
          subtext={cards?.maiorCrescimento?.titulo || 'Sem matérias'}
          icon={ArrowUpRight}
          tendencia="subindo"
          loading={loading}
        />
        <MetricCard
          title="Frequência de Acessos"
          value={cards?.mediaViewsHora || '0 views/h'}
          subtext={`Tráfego nas últimas ${periodo}`}
          icon={Activity}
          loading={loading}
        />
        <MetricCard
          title="Categoria Líder"
          value={cards?.categoriaEmAlta || 'Geral'}
          subtext="Maior aceleração do período"
          icon={FolderOpen}
          loading={loading}
        />
        <MetricCard
          title="Pico de Tráfego"
          value={cards?.picoDeAcessos ? cards.picoDeAcessos.split(' (')[0] : '0 acessos/h'}
          subtext={cards?.picoDeAcessos && cards.picoDeAcessos.includes('(') ? `Estimado (${cards.picoDeAcessos.split(' (')[1]}` : ''}
          icon={Clock}
          loading={loading}
        />
      </div>

      {/* Conteúdo Principal */}
      {!loading && noticias.length === 0 ? (
        <EmptyState 
          title="Sem picos de aceleração" 
          description="Nenhuma matéria apresentou crescimento fora da média ou picos de velocidade no período selecionado."
        />
      ) : (
        <div className="bg-[#12141D] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-500" />
              Notícias em Rápida Ascensão
            </h2>
            <span className="px-2.5 py-1 rounded-full text-xxs font-extrabold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-wider flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Tempo Real
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-zinc-900/30 border-b border-zinc-800/80">
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider w-16">Rank</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Matéria</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider w-36">Visualizações</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Horário Pico</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider w-28">Aceleração</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider w-28">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-zinc-800/60">
                      <td className="px-6 py-5"><div className="h-6 bg-zinc-850 rounded w-8 mx-auto"></div></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 bg-zinc-850 rounded"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-zinc-850 rounded w-72"></div>
                            <div className="h-3 bg-zinc-850 rounded w-36"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><div className="h-4 bg-zinc-850 rounded w-16 ml-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-zinc-850 rounded w-16 mx-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-zinc-850 rounded w-12 mx-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-6 bg-zinc-850 rounded w-20 mx-auto"></div></td>
                      <td className="px-6 py-5"><div className="h-8 bg-zinc-850 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : (
                  noticias.map((item) => (
                    <NewsPerformanceRow 
                      key={item.id} 
                      news={item} 
                      tipo="em-alta" 
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
