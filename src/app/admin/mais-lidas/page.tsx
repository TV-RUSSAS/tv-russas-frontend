'use client';

import './mais-lidas.css';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  FolderOpen,
  User,
  Newspaper,
  RefreshCw,
  Search,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from 'lucide-react';
import { NewsPerformanceData } from '@/components/admin/analytics/NewsPerformanceRow';
import EmptyState from '@/components/admin/analytics/EmptyState';
import { getImagePath } from '@/utils/imagePath';

interface CategoriaOption { id: string; nome: string; }
interface AutorOption { id: string; nome: string; tipo: string; }

const PERIOD_OPTIONS = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'mes', label: 'Este mês' },
  { value: 'geral', label: 'Geral' },
];

function TendenciaIcon({ tendencia }: { tendencia: string }) {
  if (tendencia === 'subindo') return <TrendingUp className="w-4 h-4" style={{ color: '#34d399' }} />;
  if (tendencia === 'caiu') return <TrendingDown className="w-4 h-4" style={{ color: '#f87171' }} />;
  return <Minus className="w-4 h-4" style={{ color: '#374151' }} />;
}

export default function MaisLidasPage() {
  const { authFetch } = useAdminAuth();

  const [periodo, setPeriodo] = useState('7d');
  const [categoriaId, setCategoriaId] = useState('');
  const [autorId, setAutorId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [autores, setAutores] = useState<AutorOption[]>([]);
  const [rankingData, setRankingData] = useState<NewsPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchFiltros = async () => {
      try {
        setLoadingFiltros(true);
        const [resCat, resAut] = await Promise.all([
          authFetch('/admin/categorias'),
          authFetch('/admin/analytics/autores?periodo=geral'),
        ]);
        if (resCat.ok && active) setCategorias(await resCat.json());
        if (resAut.ok && active) setAutores(await resAut.json());
      } catch (err) {
        console.error('Erro ao buscar filtros:', err);
      } finally {
        if (active) setLoadingFiltros(false);
      }
    };
    fetchFiltros();
    return () => { active = false; };
  }, [authFetch]);

  // Callback para o botão Atualizar (manual)
  const fetchRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({ periodo });
      if (categoriaId) queryParams.set('categoriaId', categoriaId);
      if (autorId) queryParams.set('usuarioId', autorId);
      const res = await authFetch(`/admin/analytics/mais-lidas?${queryParams}`);
      if (!res.ok) throw new Error('Falha ao obter o ranking');
      setRankingData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, periodo, categoriaId, autorId]);

  // Auto-fetch isolado com flag de cancelamento — não chama setState sincronamente
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!cancelled) setLoading(true);
        if (!cancelled) setError('');
        const queryParams = new URLSearchParams({ periodo });
        if (categoriaId) queryParams.set('categoriaId', categoriaId);
        if (autorId) queryParams.set('usuarioId', autorId);
        const res = await authFetch(`/admin/analytics/mais-lidas?${queryParams}`);
        if (!res.ok) throw new Error('Falha ao obter o ranking');
        const data = await res.json();
        if (!cancelled) setRankingData(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro inesperado.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [authFetch, periodo, categoriaId, autorId]);

  const filteredRanking = rankingData.filter(item =>
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalViews = rankingData.reduce((acc, item) => acc + (item.views || 0), 0);
  const avgViews = rankingData.length > 0 ? Math.round(totalViews / rankingData.length) : 0;

  const categoryViewsMap = new Map<string, number>();
  rankingData.forEach(item => {
    if (item.categoria) {
      categoryViewsMap.set(item.categoria, (categoryViewsMap.get(item.categoria) ?? 0) + (item.views || 0));
    }
  });
  const topCategory = Array.from(categoryViewsMap.entries()).sort((a, b) => b[1] - a[1]).at(0)?.[0] ?? '—';

  return (
    <div className="ml-page">

      {/* ── HEADER ── */}
      <div className="ml-header">
        <div>
          <h1 className="ml-title">Mais Lidas</h1>
          <p className="ml-subtitle">Matérias com maior audiência no período selecionado.</p>
        </div>
        <button
          onClick={fetchRanking}
          disabled={loading}
          className="ml-btn-refresh"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} style={loading ? { color: '#ff6b3d' } : {}} />
          Atualizar
        </button>
      </div>

      {/* ── SELETOR DE PERÍODO ── */}
      <div className="ml-period-row">
        <div className="ml-period-bar">
          <span className="ml-period-icon"><Calendar size={15} /></span>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriodo(opt.value)}
              className={`ml-period-btn${periodo === opt.value ? ' active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      {!loading && rankingData.length > 0 && (
        <div className="ml-kpi-grid">
          <div className="ml-kpi-card">
            <p className="ml-kpi-label">Total de Views</p>
            <p className="ml-kpi-value">{totalViews.toLocaleString('pt-BR')}</p>
            <p className="ml-kpi-sub">soma do período</p>
          </div>
          <div className="ml-kpi-card">
            <p className="ml-kpi-label">Média por Matéria</p>
            <p className="ml-kpi-value">{avgViews.toLocaleString('pt-BR')}</p>
            <p className="ml-kpi-sub">views</p>
          </div>
          <div className="ml-kpi-card">
            <p className="ml-kpi-label">Matérias Ranqueadas</p>
            <p className="ml-kpi-value">{rankingData.length}</p>
            <p className="ml-kpi-sub">no ranking</p>
          </div>
          <div className="ml-kpi-card">
            <p className="ml-kpi-label">Categoria Líder</p>
            <p className="ml-kpi-value orange">{topCategory}</p>
            <p className="ml-kpi-sub">maior audiência</p>
          </div>
        </div>
      )}

      {/* ── FILTROS ── */}
      <div className="ml-filters">
        <div className="ml-search-wrap">
          <span className="ml-search-icon"><Search size={16} /></span>
          <input
            type="text"
            placeholder="Buscar por título da matéria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-search-input"
          />
        </div>

        <div className="ml-select-wrap">
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            disabled={loadingFiltros}
            className="ml-select"
          >
            <option value="">Todas as Categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
          <span className="ml-select-icon"><FolderOpen size={15} /></span>
        </div>

        <div className="ml-select-wrap">
          <select
            value={autorId}
            onChange={(e) => setAutorId(e.target.value)}
            disabled={loadingFiltros}
            className="ml-select"
          >
            <option value="">Todos os Autores</option>
            {autores.map((aut) => (
              <option key={aut.id} value={aut.id}>{aut.nome}</option>
            ))}
          </select>
          <span className="ml-select-icon"><User size={15} /></span>
        </div>
      </div>

      {/* ── ERRO ── */}
      {error && <div className="ml-error">{error}</div>}

      {/* ── LOADING ── */}
      {loading && (
        <div className="ml-panel">
          <div className="ml-panel-head">
            <div className="ml-panel-title">
              <Newspaper size={16} style={{ color: '#4b5563' }} />
              Ranking de Desempenho
            </div>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ml-skeleton-row">
              <div className="ml-skeleton-box" style={{ width: 36, height: 18 }} />
              <div className="ml-skeleton-box" style={{ width: 64, height: 44, borderRadius: 10 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="ml-skeleton-box" style={{ height: 14, width: '65%' }} />
                <div className="ml-skeleton-box" style={{ height: 11, width: '35%' }} />
              </div>
              <div className="ml-skeleton-box" style={{ width: 48, height: 14 }} />
            </div>
          ))}
        </div>
      )}

      {/* ── VAZIO ── */}
      {!loading && rankingData.length === 0 && (
        <EmptyState
          title="Nenhuma notícia ranqueada"
          description="Não encontramos registros de acessos para os filtros selecionados neste período."
        />
      )}

      {/* ── LISTA DE RANKING ── */}
      {!loading && rankingData.length > 0 && (
        <div className="ml-panel">
          <div className="ml-panel-head">
            <div className="ml-panel-title">
              <Newspaper size={16} style={{ color: '#4b5563' }} />
              Ranking de Desempenho
            </div>
            <span className="ml-panel-count">
              {filteredRanking.length} de {rankingData.length} matérias
            </span>
          </div>

          {/* Busca sem resultado */}
          {filteredRanking.length === 0 && searchTerm && (
            <div className="ml-empty-search">
              <Search size={32} style={{ color: '#374151' }} />
              <p className="ml-empty-search-title">Nenhum resultado para &ldquo;{searchTerm}&rdquo;</p>
              <p className="ml-empty-search-sub">Tente um termo de busca diferente.</p>
            </div>
          )}

          {/* Rows */}
          {filteredRanking.map((item) => {
            const rank = item.posicao;
            return (
              <div
                key={item.id}
                className={`ml-row${rank === 1 ? ' ml-row--gold' : ''}`}
              >
                {/* Rank */}
                <div className={`ml-rank${rank <= 3 ? ` ml-rank--${rank}` : ''}`}>
                  #{rank}
                </div>

                {/* Thumbnail */}
                <div className="ml-thumb">
                  {item.capaUrl ? (
                    <Image
                      src={getImagePath(item.capaUrl)}
                      alt={item.titulo}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="ml-thumb-placeholder">
                      <Newspaper size={18} />
                    </div>
                  )}
                </div>

                {/* Título e meta */}
                <div className="ml-info">
                  <p className="ml-row-title" title={item.titulo}>{item.titulo}</p>
                  <div className="ml-meta">
                    <span className="ml-meta-cat">{item.categoria}</span>
                    <span className="ml-meta-sep">·</span>
                    <span className="ml-meta-text">{item.autor}</span>
                    <span className="ml-meta-sep">·</span>
                    <span className="ml-meta-text">{new Date(item.publicadoEm).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Views */}
                <div className="ml-stat ml-hide-sm">
                  <p className="ml-stat-val">{item.views.toLocaleString('pt-BR')}</p>
                  <p className="ml-stat-sub">views</p>
                </div>

                {/* Engajamento */}
                <div className="ml-stat ml-hide-md">
                  <p className="ml-stat-val green">{item.engajamento || 0}%</p>
                  <p className="ml-stat-sub">engaj.</p>
                </div>

                {/* Tendência */}
                <div className="ml-trend ml-hide-lg">
                  <TendenciaIcon tendencia={item.tendencia} />
                </div>

                {/* Ações */}
                <div className="ml-actions">
                  <a
                    href={`/noticia/${item.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-action-btn"
                    title="Ver no portal"
                  >
                    <Eye size={16} />
                  </a>
                  <a
                    href={`/admin/noticias/editar/${item.id}`}
                    className="ml-action-btn edit"
                    title="Editar matéria"
                  >
                    <Edit size={16} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
