'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  FolderOpen, 
  User, 
  Award, 
  Crown,
  Loader2,
  Newspaper
} from 'lucide-react';
import PeriodFilter from '@/components/admin/analytics/PeriodFilter';
import NewsPerformanceRow, { NewsPerformanceData } from '@/components/admin/analytics/NewsPerformanceRow';
import EmptyState from '@/components/admin/analytics/EmptyState';

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

  // Separar pódio das demais posições
  const podiumList = rankingData.slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* Cabeçalho Editorial */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Award className="w-8 h-8 text-[#ff5722]" />
            Mais Lidas
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Inteligência de audiência: ranking de matérias com melhor desempenho de acessos.
          </p>
        </div>
      </div>

      {/* Grade de Filtros Premium */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 bg-[#12141D]/60 border border-zinc-800/60 p-4 rounded-xl">
        <div className="flex-shrink-0">
          <PeriodFilter selected={periodo} onChange={setPeriodo} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
          {/* Dropdown de Categorias */}
          <div className="relative">
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

          {/* Dropdown de Autores */}
          <div className="relative">
            <select
              value={autorId}
              onChange={(e) => setAutorId(e.target.value)}
              className="w-full bg-[#12141D] border border-zinc-800 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-[#ff5722]/50 transition-colors"
              disabled={loadingFiltros}
            >
              <option value="">Todos os Autores</option>
              {autores.map((aut) => (
                <option key={aut.id} value={aut.id}>{aut.nome} ({aut.tipo})</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-zinc-400 self-center xl:self-auto px-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#ff5722]" />
            <span className="text-xs font-medium">Atualizando...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Conteúdo Principal */}
      {!loading && rankingData.length === 0 ? (
        <EmptyState 
          title="Nenhuma notícia ranqueada" 
          description="Não encontramos registros de acessos para os filtros selecionados neste período."
        />
      ) : (
        <div className="space-y-10">
          {/* PÓDIO PREMIUM (Top 3) */}
          {podiumList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Segundo Lugar (#2) */}
              {podiumList[1] && (
                <div className="bg-[#12141D] border border-zinc-800 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700/60 transition-all duration-300 md:h-[260px] flex flex-col justify-between order-2 md:order-1">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-400" />
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-black text-zinc-400">#2</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/30">
                      {podiumList[1].categoria}
                    </span>
                  </div>
                  
                  <div className="my-4">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#ff5722] transition-colors duration-200">
                      {podiumList[1].titulo}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{podiumList[1].autor}</p>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-zinc-500">Visualizações</span>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">{podiumList[1].views.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500">Engajamento</span>
                      <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{podiumList[1].engajamento}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Primeiro Lugar (#1) - Destaque Principal */}
              {podiumList[0] && (
                <div className="bg-[#12141D] border border-amber-500/30 rounded-xl p-6 relative overflow-hidden group hover:border-amber-500/50 shadow-lg shadow-amber-500/2 transition-all duration-300 md:h-[300px] flex flex-col justify-between order-1 md:order-2">
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
                  <div className="flex justify-between items-start">
                    <span className="text-4xl font-black text-amber-400 flex items-center gap-1">
                      #1
                      <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {podiumList[0].categoria}
                    </span>
                  </div>
                  
                  <div className="my-4">
                    <h3 className="text-base font-extrabold text-white line-clamp-2 leading-snug group-hover:text-yellow-400 transition-colors duration-200">
                      {podiumList[0].titulo}
                    </h3>
                    <p className="text-xs text-amber-200/60 mt-1">{podiumList[0].autor}</p>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-zinc-500">Visualizações</span>
                      <p className="text-base font-black text-yellow-400 font-mono mt-0.5">{podiumList[0].views.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500">Engajamento</span>
                      <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">{podiumList[0].engajamento}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Terceiro Lugar (#3) */}
              {podiumList[2] && (
                <div className="bg-[#12141D] border border-zinc-800 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700/60 transition-all duration-300 md:h-[240px] flex flex-col justify-between order-3 md:order-3">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-700/60" />
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-black text-amber-600">#3</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/30">
                      {podiumList[2].categoria}
                    </span>
                  </div>
                  
                  <div className="my-4">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#ff5722] transition-colors duration-200">
                      {podiumList[2].titulo}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{podiumList[2].autor}</p>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-zinc-500">Visualizações</span>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">{podiumList[2].views.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500">Engajamento</span>
                      <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{podiumList[2].engajamento}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TABELA DE RANKING COMPLETA */}
          <div className="bg-[#12141D] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-zinc-500" />
                Listagem Geral de Desempenho
              </h2>
              <span className="text-xs text-zinc-500 font-medium">
                Exibindo {rankingData.length} matérias ranqueadas
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-zinc-900/30 border-b border-zinc-800/80">
                    <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider w-16">Rank</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Matéria</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Visualizações</th>
                    <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider w-24">Likes</th>
                    <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider w-36">Engajamento</th>
                    <th className="px-6 py-3.5 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider w-28">Tendência</th>
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
                        <td className="px-6 py-5"><div className="h-4 bg-zinc-850 rounded w-8 mx-auto"></div></td>
                        <td className="px-6 py-5"><div className="h-4 bg-zinc-850 rounded w-16 mx-auto"></div></td>
                        <td className="px-6 py-5"><div className="h-6 bg-zinc-850 rounded w-20 mx-auto"></div></td>
                        <td className="px-6 py-5"><div className="h-8 bg-zinc-850 rounded w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : (
                    rankingData.map((item) => (
                      <NewsPerformanceRow 
                        key={item.id} 
                        news={item} 
                        tipo="mais-lidas" 
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
