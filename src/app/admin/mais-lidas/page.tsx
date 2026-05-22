'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  FolderOpen, 
  User, 
  Newspaper,
  Download,
  RefreshCw,
  Search,
  Eye,
  Edit
} from 'lucide-react';
import PeriodFilter from '@/components/admin/analytics/PeriodFilter';
import { NewsPerformanceData } from '@/components/admin/analytics/NewsPerformanceRow';
import EmptyState from '@/components/admin/analytics/EmptyState';
import TrendBadge from '@/components/admin/analytics/TrendBadge';
import { getImagePath } from '@/utils/imagePath';

interface CategoriaOption {
  id: string;
  nome: string;
}

interface AutorOption {
  id: string;
  nome: string;
  tipo: string;
}

export default function MaisLidasPage() {
  const { authFetch } = useAdminAuth();

  // Estados dos filtros
  const [periodo, setPeriodo] = useState('7d');
  const [categoriaId, setCategoriaId] = useState('');
  const [autorId, setAutorId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Opções de filtros
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [autores, setAutores] = useState<AutorOption[]>([]);

  // Estados de dados
  const [rankingData, setRankingData] = useState<NewsPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [error, setError] = useState('');

  // Carregar filtros iniciais (categorias e autores)
  useEffect(() => {
    let active = true;
    const fetchFiltros = async () => {
      try {
        setLoadingFiltros(true);
        const [resCat, resAut] = await Promise.all([
          authFetch('/admin/categorias'),
          authFetch('/admin/analytics/autores?periodo=geral')
        ]);

        if (resCat.ok && active) {
          const cats = await resCat.json();
          setCategorias(cats);
        }

        if (resAut.ok && active) {
          const auts = await resAut.json();
          setAutores(auts);
        }
      } catch (err) {
        console.error('Erro ao buscar dados dos filtros:', err);
      } finally {
        if (active) setLoadingFiltros(false);
      }
    };

    fetchFiltros();
    return () => { active = false; };
  }, [authFetch]);

  // Carregar dados de ranking de mais lidas
  const fetchRanking = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({ periodo });
      if (categoriaId) queryParams.set('categoriaId', categoriaId);
      if (autorId) queryParams.set('usuarioId', autorId);

      const res = await authFetch(`/admin/analytics/mais-lidas?${queryParams}`);
      if (!res.ok) {
        throw new Error('Falha ao obter o ranking de mais lidas');
      }

      const data = await res.json();
      setRankingData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado ao carregar o ranking.');
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch, periodo, categoriaId, autorId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRanking();
    });
  }, [fetchRanking]);

  // Filtragem local por título
  const filteredRanking = rankingData.filter(item => 
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separar pódio das 3 primeiras colocadas (absolutas obtidas do backend)
  const podiumList = rankingData.slice(0, 3);

  // KPIs calculados com base em todos os dados obtidos pelo filtro
  const totalViews = rankingData.reduce((acc, item) => acc + (item.views || 0), 0);
  const avgViews = rankingData.length > 0 ? Math.round(totalViews / rankingData.length) : 0;
  const topArticle = rankingData[0]?.titulo || '—';

  const categoryViews: Record<string, number> = {};
  rankingData.forEach(item => {
    if (item.categoria) {
      categoryViews[item.categoria] = (categoryViews[item.categoria] || 0) + (item.views || 0);
    }
  });
  let topCategory = '—';
  let maxViews = -1;
  Object.entries(categoryViews).forEach(([cat, views]) => {
    if (views > maxViews) {
      maxViews = views;
      topCategory = cat;
    }
  });

  // Função para exportação em CSV real
  const handleExportCSV = () => {
    if (rankingData.length === 0) return;
    
    const headers = ['Posicao', 'Titulo', 'Categoria', 'Autor', 'Data Publicacao', 'Visualizacoes', 'Likes', 'Engajamento (%)', 'Tendencia'];
    
    const rows = rankingData.map(item => [
      item.posicao,
      `"${item.titulo.replace(/"/g, '""')}"`,
      `"${item.categoria}"`,
      `"${item.autor}"`,
      new Date(item.publicadoEm).toLocaleDateString('pt-BR'),
      item.views,
      item.likes || 0,
      item.engajamento || 0,
      item.tendencia
    ]);
    
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mais-lidas-${periodo}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            Mais Lidas
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Ranking das matérias com maior audiência no período selecionado.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Seletor de período */}
          <PeriodFilter selected={periodo} onChange={setPeriodo} />
          
          {/* Botão Exportar CSV */}
          <button
            onClick={handleExportCSV}
            disabled={rankingData.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/90 hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            title="Exportar dados para CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {/* Botão Atualizar */}
          <button
            onClick={fetchRanking}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/90 hover:border-zinc-700 disabled:opacity-50 transition-all duration-150"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-[#12141D] border border-zinc-800/80 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center shadow-lg shadow-black/20">
        {/* Busca por título */}
        <div className="relative grow w-full">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar matéria por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-150 text-sm font-medium pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/10 placeholder:text-zinc-500 transition-all duration-200"
          />
        </div>

        {/* Dropdown de Categorias */}
        <div className="relative min-w-[220px] w-full md:w-auto">
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-sm font-semibold pl-4 pr-10 py-3 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/10 transition-all duration-200"
            disabled={loadingFiltros}
          >
            <option value="">Todas as Categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-400">
            <FolderOpen className="w-4 h-4" />
          </div>
        </div>

        {/* Dropdown de Autores */}
        <div className="relative min-w-[220px] w-full md:w-auto">
          <select
            value={autorId}
            onChange={(e) => setAutorId(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-sm font-semibold pl-4 pr-10 py-3 rounded-xl appearance-none cursor-pointer focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/10 transition-all duration-200"
            disabled={loadingFiltros}
          >
            <option value="">Todos os Autores</option>
            {autores.map((aut) => (
              <option key={aut.id} value={aut.id}>{aut.nome} ({aut.tipo})</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-400">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* CARDS DE RESUMO */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#12141D]/40 border border-zinc-850 p-4 rounded-xl h-24 flex flex-col justify-between">
              <div className="h-3 bg-zinc-800 rounded w-20"></div>
              <div className="h-5 bg-zinc-850 rounded w-28"></div>
              <div className="h-2 bg-zinc-800 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : rankingData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#12141D] border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/50 hover:bg-[#151722] transition-all duration-200 shadow-sm">
            <div>
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block mb-2">Total de Views</span>
              <span className="text-2xl font-extrabold text-zinc-100 font-mono tracking-tight">{totalViews.toLocaleString('pt-BR')}</span>
            </div>
            <span className="text-xs text-zinc-500 mt-4 block">Soma de acessos no período</span>
          </div>

          <div className="bg-[#12141D] border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/50 hover:bg-[#151722] transition-all duration-200 shadow-sm">
            <div>
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block mb-2">Média de Views</span>
              <span className="text-2xl font-extrabold text-zinc-100 font-mono tracking-tight">{avgViews.toLocaleString('pt-BR')}</span>
            </div>
            <span className="text-xs text-zinc-500 mt-4 block">Por matéria ranqueada</span>
          </div>

          <div className="bg-[#12141D] border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/50 hover:bg-[#151722] transition-all duration-200 shadow-sm min-h-[110px]">
            <div>
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block mb-2">Matéria Mais Lida</span>
              <span className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-relaxed" title={topArticle}>
                {topArticle}
              </span>
            </div>
            <span className="text-xs text-zinc-500 mt-4 block">Líder absoluta no período</span>
          </div>

          <div className="bg-[#12141D] border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/50 hover:bg-[#151722] transition-all duration-200 shadow-sm">
            <div>
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block mb-2">Categoria Líder</span>
              <span className="text-base font-extrabold text-orange-500 uppercase tracking-widest block mt-2 truncate" title={topCategory}>{topCategory}</span>
            </div>
            <span className="text-xs text-zinc-500 mt-4 block">Maior volume de acessos</span>
          </div>
        </div>
      ) : null}

      {/* CONTEÚDO PRINCIPAL (PÓDIO + TABELA) */}
      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#12141D]/40 border border-zinc-850 rounded-xl overflow-hidden h-72 flex flex-col justify-between">
                <div className="h-32 bg-zinc-800 w-full"></div>
                <div className="p-4 grow flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-zinc-850 rounded w-24"></div>
                    <div className="h-4 bg-zinc-805 rounded w-full"></div>
                  </div>
                  <div className="flex justify-between border-t border-zinc-850 pt-3">
                    <div className="h-4 bg-zinc-800 rounded w-12"></div>
                    <div className="h-4 bg-zinc-800 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#12141D]/40 border border-zinc-850 rounded-xl h-64 animate-pulse"></div>
        </div>
      ) : rankingData.length === 0 ? (
        <EmptyState 
          title="Nenhuma notícia ranqueada" 
          description="Não encontramos registros de acessos para os filtros selecionados neste período."
        />
      ) : (
        <div className="space-y-8">
          {/* TOP 3 MAIS LIDAS (PÓDIO) */}
          {podiumList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {podiumList.map((item, idx) => {
                const rank = idx + 1;
                const isFirst = rank === 1;
                const rankBadgeColor = 
                  rank === 1 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                  rank === 2 ? 'bg-zinc-700/20 text-zinc-300 border-zinc-700/30' : 
                  'bg-amber-900/10 text-amber-700 border-amber-900/20';

                return (
                  <div 
                    key={item.id}
                    className={`bg-[#12141D]/40 border ${
                      isFirst ? 'border-amber-500/30 shadow-md shadow-amber-500/5' : 'border-zinc-800/80'
                    } rounded-xl overflow-hidden flex flex-col h-full hover:border-zinc-700 transition-all duration-200 group`}
                  >
                    {/* Imagem proporcional */}
                    {item.capaUrl ? (
                      <div className="h-44 w-full overflow-hidden relative border-b border-zinc-800/50 bg-zinc-900">
                        <Image
                          src={getImagePath(item.capaUrl)}
                          alt={item.titulo}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${rankBadgeColor} backdrop-blur-md shadow-lg shadow-black/30`}>
                            #{rank} Lugar
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-44 w-full bg-zinc-900/40 border-b border-zinc-800/50 flex items-center justify-center relative">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-lg border ${rankBadgeColor} absolute top-4 left-4 backdrop-blur-md`}>
                          #{rank} Lugar
                        </span>
                        <Newspaper className="w-10 h-10 text-zinc-700" />
                      </div>
                    )}

                    {/* Conteúdo do Card */}
                    <div className="p-5 flex flex-col grow justify-between gap-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <span className="text-orange-500">{item.categoria}</span>
                          <span className="text-zinc-650">•</span>
                          <span className="truncate max-w-[140px]">{item.autor}</span>
                        </div>
                        <h3 
                          className="text-sm font-bold text-zinc-150 line-clamp-2 leading-snug group-hover:text-white transition-colors duration-150"
                          title={item.titulo}
                        >
                          {item.titulo}
                        </h3>
                      </div>

                      <div className="border-t border-zinc-800/60 pt-4 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">Views</span>
                          <span className="text-sm font-bold text-zinc-200 font-mono">{item.views.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">Engajamento</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">{item.engajamento}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TABELA DE RANKING GERAL */}
          <div className="bg-[#12141D]/40 border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
              <h2 className="text-xs font-bold text-zinc-350 uppercase tracking-wider flex items-center gap-2">
                <Newspaper className="w-3.5 h-3.5 text-zinc-500" />
                Listagem Geral de Desempenho
              </h2>
              <span className="text-[10px] text-zinc-500 font-medium">
                Exibindo {filteredRanking.length} de {rankingData.length} matérias ranqueadas
              </span>
            </div>

            {/* Listagem Vazia Local */}
            {filteredRanking.length === 0 && rankingData.length > 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Search className="w-8 h-8 text-zinc-700 mb-3" />
                <h3 className="text-xs font-bold text-zinc-400">Nenhum resultado encontrado</h3>
                <p className="text-[11px] text-zinc-500 mt-1">Não encontramos nenhuma matéria correspondente a &quot;{searchTerm}&quot;.</p>
              </div>
            )}

            {filteredRanking.length > 0 && (
              <>
                {/* Desktop/Notebook Table */}
                <div className="overflow-x-auto hidden md:block scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  <table className="w-full min-w-[1400px] border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/10 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        <th className="px-5 py-4 text-center w-16">Rank</th>
                        <th className="px-5 py-4 text-left w-[450px]">Matéria</th>
                        <th className="px-5 py-4 text-left w-36">Categoria</th>
                        <th className="px-5 py-4 text-left w-40">Autor</th>
                        <th className="px-5 py-4 text-center w-32">Publicação</th>
                        <th className="px-5 py-4 text-right w-28">Views</th>
                        <th className="px-5 py-4 text-right w-24">Likes</th>
                        <th className="px-5 py-4 text-center w-32">Engajamento</th>
                        <th className="px-5 py-4 text-center w-28">Tendência</th>
                        <th className="px-5 py-4 text-right w-24">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                      {filteredRanking.map((item) => {
                        const rank = item.posicao;
                        const rankColor = 
                          rank === 1 ? 'text-amber-500 font-bold' :
                          rank === 2 ? 'text-zinc-350 font-semibold' :
                          rank === 3 ? 'text-amber-700 font-semibold' :
                          'text-zinc-500 font-medium';

                        const engajamentoPercent = Math.min(100, item.engajamento || 0);

                        return (
                          <tr key={item.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/10 transition-colors duration-150 group">
                            {/* Rank */}
                            <td className="px-5 py-4.5 whitespace-nowrap text-center">
                              <span className={`text-sm ${rankColor}`}>
                                #{rank}
                              </span>
                            </td>

                            {/* Matéria */}
                            <td className="px-5 py-4.5 w-[450px]">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.capaUrl ? (
                                  <div className="relative w-12 h-8 rounded bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800/60">
                                    <Image
                                      src={getImagePath(item.capaUrl)}
                                      alt={item.titulo}
                                      fill
                                      unoptimized
                                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-8 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-center shrink-0">
                                    <Newspaper className="w-4 h-4 text-zinc-650" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 
                                    className="text-[13px] font-semibold text-zinc-200 line-clamp-2 leading-snug group-hover:text-white transition-colors duration-150"
                                    title={item.titulo}
                                  >
                                    {item.titulo}
                                  </h4>
                                </div>
                              </div>
                            </td>

                            {/* Categoria */}
                            <td className="px-5 py-4.5 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-md text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                                {item.categoria}
                              </span>
                            </td>

                            {/* Autor */}
                            <td className="px-5 py-4.5 whitespace-nowrap text-sm text-zinc-300 font-medium">
                              {item.autor}
                            </td>

                            {/* Publicação */}
                            <td className="px-5 py-4.5 whitespace-nowrap text-xs text-center text-zinc-400 font-mono">
                              {new Date(item.publicadoEm).toLocaleDateString('pt-BR')}
                            </td>

                            {/* Views */}
                            <td className="px-5 py-4.5 whitespace-nowrap text-right text-sm font-extrabold text-zinc-100 font-mono">
                              {item.views.toLocaleString('pt-BR')}
                            </td>

                            {/* Likes */}
                            <td className="px-5 py-4.5 whitespace-nowrap text-right text-xs font-semibold text-zinc-450 font-mono">
                              {item.likes || 0}
                            </td>

                            {/* Engajamento */}
                            <td className="px-5 py-4.5 whitespace-nowrap text-center">
                              <div className="flex flex-col items-center justify-center w-28 mx-auto">
                                <span className="text-xs font-bold text-zinc-200 font-mono">{item.engajamento || 0}%</span>
                                <div className="w-20 h-1 bg-zinc-800/80 rounded-full mt-2 overflow-hidden border border-zinc-700/10">
                                  <div 
                                    className="h-full bg-linear-to-r from-orange-500 to-[#ff5722] rounded-full" 
                                    style={{ width: `${engajamentoPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Tendência */}
                            <td className="px-5 py-4.5 whitespace-nowrap text-center">
                              <TrendBadge 
                                tendencia={item.tendencia} 
                                variacao={item.variacao > 0 ? `${item.variacao} pos.` : undefined} 
                              />
                            </td>

                            {/* Ações */}
                            <td className="px-5 py-4.5 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`/noticias/${item.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 rounded-lg bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-all hover:bg-zinc-800 hover:border-zinc-700"
                                  title="Visualizar no Portal"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                                <a
                                  href={`/admin/noticias/editar/${item.id}`}
                                  className="w-8 h-8 rounded-lg bg-zinc-900/60 text-zinc-400 hover:text-orange-500 hover:bg-orange-500/5 border border-zinc-800 flex items-center justify-center transition-all hover:border-zinc-700"
                                  title="Editar Matéria"
                                >
                                  <Edit className="w-4 h-4" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards (Substitutos de tabela) */}
                <div className="md:hidden flex flex-col gap-4 p-4">
                  {filteredRanking.map((item) => (
                    <div key={item.id} className="bg-[#12141D]/20 border border-zinc-800/80 p-4 rounded-xl flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-zinc-500">#{item.posicao}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-450 font-bold uppercase">
                          {item.categoria}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.capaUrl && (
                          <div className="relative w-12 h-9 rounded bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800/60">
                            <Image
                              src={getImagePath(item.capaUrl)}
                              alt={item.titulo}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="grow min-w-0">
                          <h4 className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-relaxed">
                            {item.titulo}
                          </h4>
                          <span className="text-[10px] text-zinc-500 block mt-1">Autor: {item.autor}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t border-zinc-800/60 pt-3 text-[10px]">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Views</span>
                          <span className="font-semibold text-zinc-200 font-mono">{item.views.toLocaleString('pt-BR')}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Likes</span>
                          <span className="font-semibold text-zinc-200 font-mono">{item.likes || 0}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Engajamento</span>
                          <span className="font-semibold text-emerald-400 font-mono">{item.engajamento}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3">
                        <TrendBadge 
                          tendencia={item.tendencia} 
                          variacao={item.variacao > 0 ? `${item.variacao} pos.` : undefined} 
                        />
                        <div className="flex items-center gap-2">
                          <a
                            href={`/noticias/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-400 hover:text-white"
                          >
                            Ver
                          </a>
                          <a
                            href={`/admin/noticias/editar/${item.id}`}
                            className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-400 hover:text-orange-500"
                          >
                            Editar
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
