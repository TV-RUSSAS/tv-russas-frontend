'use client';

import './em-alta.css';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  FolderOpen,
  Zap,
  RefreshCw,
  Search,
  Eye,
  Edit,
  Clock,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';
import EmptyState from '@/components/admin/analytics/EmptyState';
import { getImagePath } from '@/utils/imagePath';

interface CategoriaOption {
  id: string;
  nome: string;
}

interface EmAltaItem {
  posicao: number;
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  autor: string;
  publicadoEm: string;
  capaUrl: string;
  viewsRecentes: number;   // views do período (de Analytics)
  viewsTotais: number;     // views totais históricas
  crescimentoPercentual: number;
  tendencia: string;
  horarioDePico: string;
}

interface CardsData {
  maiorCrescimento: { titulo: string; crescimento: string; };
  categoriaEmAlta: string;
  picoDeAcessos: string;
  mediaViewsHora: string;
}

interface MetaData {
  periodo: string;
  periodoLabel: string;
  periodoAnalisado: string;
  isFallback: boolean;
  mensagemFallback: string | null;
  geradoEm: string;
}

interface ApiResponse {
  noticias: EmAltaItem[];
  cards: CardsData;
  meta: MetaData;
}

const EM_ALTA_PERIOD_OPTIONS = [
  { value: '24h',    label: 'Últimas 24h (padrão)' },
  { value: 'hoje',   label: 'Hoje' },
  { value: '7d',     label: 'Últimos 7 dias' },
  { value: 'semana', label: 'Semana atual' },
];

export default function EmAltaPage() {
  const { authFetch } = useAdminAuth();

  const [periodo, setPeriodo] = useState('24h'); // padrão: ontem
  const [categoriaId, setCategoriaId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) setMounted(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchFiltros = async () => {
      try {
        setLoadingFiltros(true);
        const res = await authFetch('/admin/categorias');
        if (res.ok && active) setCategorias(await res.json());
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      } finally {
        if (active) setLoadingFiltros(false);
      }
    };
    fetchFiltros();
    return () => { active = false; };
  }, [authFetch]);

  const fetchEmAlta = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({ periodo });
      if (categoriaId) queryParams.set('categoriaId', categoriaId);
      const res = await authFetch(`/admin/analytics/em-alta?${queryParams}`);
      if (!res.ok) throw new Error('Falha ao obter dados de tráfego em alta');
      const data = await res.json();
      setApiData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, periodo, categoriaId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (active) setLoading(true);
        const queryParams = new URLSearchParams({ periodo });
        if (categoriaId) queryParams.set('categoriaId', categoriaId);
        const res = await authFetch(`/admin/analytics/em-alta?${queryParams}`);
        if (!res.ok) throw new Error('Falha ao obter dados');
        const data = await res.json();
        if (active) setApiData(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Erro inesperado.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, periodo, categoriaId]);

  const noticias: EmAltaItem[] = apiData?.noticias || [];
  const cards: CardsData | null = apiData?.cards || null;
  const meta: MetaData | null = apiData?.meta || null;

  const filteredNoticias = noticias.filter(item =>
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="ea-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#ff5722]" />
      </div>
    );
  }

  return (
    <div className="ea-page">

      {/* ── HEADER ── */}
      <div className="ea-header">
        <div>
          <h1 className="ea-title">
            <Zap size={26} />
            Em Alta — Últimas 24 Horas
          </h1>
          <p className="ea-subtitle">
            Matérias com melhor desempenho nas últimas 24 horas corridas. Atualiza continuamente ao longo do dia.
          </p>
          {meta && (
            <p className="ea-period-info">
              <Info size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Baseado em: <strong>{meta.periodoAnalisado}</strong>
            </p>
          )}
        </div>
        <button onClick={fetchEmAlta} disabled={loading} className="ea-btn-refresh">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} style={loading ? { color: '#ff6b3d' } : {}} />
          Atualizar
        </button>
      </div>

      {/* ── BADGE FALLBACK ── */}
      {meta?.isFallback && (
        <div className="ea-fallback-banner">
          <AlertCircle size={15} />
          <span>{meta.mensagemFallback || 'Sem views suficientes no período. Exibindo dados de fallback (últimos 7 dias).'}</span>
        </div>
      )}

      {/* ── SELETOR DE PERÍODO ── */}
      <div className="ea-period-row">
        <div className="ea-period-bar">
          <span className="ea-period-icon"><Clock size={15} /></span>
          {EM_ALTA_PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriodo(opt.value)}
              className={`ea-period-btn${periodo === opt.value ? ' active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      {!loading && cards && (
        <div className="ea-kpi-grid">
          <div className="ea-kpi-card">
            <p className="ea-kpi-label">Matéria Mais Vista</p>
            <p className="ea-kpi-value green">{noticias[0]?.viewsRecentes || 0} views</p>
            <p className="ea-kpi-sub" title={cards.maiorCrescimento?.titulo || 'Sem matérias'}>
              {cards.maiorCrescimento?.titulo
                ? cards.maiorCrescimento.titulo.length > 35
                  ? cards.maiorCrescimento.titulo.slice(0, 35) + '…'
                  : cards.maiorCrescimento.titulo
                : 'Sem matérias'}
            </p>
          </div>
          <div className="ea-kpi-card">
            <p className="ea-kpi-label">Frequência de Acessos</p>
            <p className="ea-kpi-value">{cards.mediaViewsHora || '0 views/h'}</p>
            <p className="ea-kpi-sub">{meta?.periodoLabel || periodo}</p>
          </div>
          <div className="ea-kpi-card">
            <p className="ea-kpi-label">Categoria Líder</p>
            <p className="ea-kpi-value orange">{cards.categoriaEmAlta || 'Geral'}</p>
            <p className="ea-kpi-sub">maior volume</p>
          </div>
          <div className="ea-kpi-card">
            <p className="ea-kpi-label">Pico Estimado</p>
            <p className="ea-kpi-value">
              {cards.picoDeAcessos ? cards.picoDeAcessos.split(' (')[0] : '0 acessos/h'}
            </p>
            <p className="ea-kpi-sub">no período</p>
          </div>
        </div>
      )}

      {/* ── FILTROS ── */}
      <div className="ea-filters">
        <div className="ea-search-wrap">
          <span className="ea-search-icon"><Search size={16} /></span>
          <input
            type="text"
            placeholder="Buscar por título da matéria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ea-search-input"
          />
        </div>

        <div className="ea-select-wrap">
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            disabled={loadingFiltros}
            className="ea-select"
          >
            <option value="">Todas as Categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
          <span className="ea-select-icon"><FolderOpen size={15} /></span>
        </div>
      </div>

      {/* ── ERRO ── */}
      {error && <div className="ea-error">{error}</div>}

      {/* ── LOADING ── */}
      {loading && (
        <div className="ea-panel">
          <div className="ea-panel-head">
            <div className="ea-panel-title">
              <Zap size={16} style={{ color: '#4b5563' }} />
              Notícias em Alta
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="ea-skeleton-row">
              <div className="ea-skeleton-box" style={{ width: 36, height: 18 }} />
              <div className="ea-skeleton-box" style={{ width: 64, height: 44, borderRadius: 10 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="ea-skeleton-box" style={{ height: 14, width: '65%' }} />
                <div className="ea-skeleton-box" style={{ height: 11, width: '35%' }} />
              </div>
              <div className="ea-skeleton-box" style={{ width: 48, height: 14 }} />
            </div>
          ))}
        </div>
      )}

      {/* ── VAZIO ── */}
      {!loading && noticias.length === 0 && (
        <EmptyState
          title="Sem dados para o período"
          description="Nenhuma visualização foi registrada no período selecionado."
        />
      )}

      {/* ── LISTA DE RANKING ── */}
      {!loading && noticias.length > 0 && (
        <div className="ea-panel">
          <div className="ea-panel-head">
            <div className="ea-panel-title">
              <Zap size={16} style={{ color: '#4b5563' }} />
              Notícias em Alta — {meta?.periodoLabel || 'Últimas 24 Horas'}
            </div>
            <span className="ea-panel-count">
              {filteredNoticias.length} de {noticias.length} matérias
            </span>
          </div>

          {filteredNoticias.length === 0 && searchTerm && (
            <div className="ea-empty-search">
              <Search size={32} style={{ color: '#374151' }} />
              <p className="ea-empty-search-title">Nenhum resultado para &ldquo;{searchTerm}&rdquo;</p>
              <p className="ea-empty-search-sub">Tente um termo de busca diferente.</p>
            </div>
          )}

          {filteredNoticias.map((item) => {
            const rank = item.posicao;
            return (
              <div
                key={item.id}
                className={`ea-row${rank === 1 ? ' ea-row--gold' : ''}`}
              >
                {/* Rank */}
                <div className={`ea-rank${rank <= 3 ? ` ea-rank--${rank}` : ''}`}>
                  #{rank}
                </div>

                {/* Thumbnail */}
                <div className="ea-thumb">
                  {item.capaUrl ? (
                    <Image
                      src={getImagePath(item.capaUrl)}
                      alt={item.titulo}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="ea-thumb-placeholder">
                      <Zap size={18} />
                    </div>
                  )}
                </div>

                {/* Título e meta */}
                <div className="ea-info">
                  <p className="ea-row-title" title={item.titulo}>{item.titulo}</p>
                  <div className="ea-meta">
                    <span className="ea-meta-cat">{item.categoria}</span>
                    <span className="ea-meta-sep">·</span>
                    <span className="ea-meta-text">{item.autor}</span>
                    <span className="ea-meta-sep">·</span>
                    <span className="ea-meta-text">{new Date(item.publicadoEm).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Views recentes */}
                <div className="ea-stat">
                  <p className="ea-stat-val green">{item.viewsRecentes.toLocaleString('pt-BR')}</p>
                  <p className="ea-stat-sub">views em 24h</p>
                </div>

                {/* Aceleração */}
                <div className="ea-stat ea-hide-sm">
                  <p className="ea-stat-val orange">+{item.crescimentoPercentual || 0}%</p>
                  <p className="ea-stat-sub">vs média</p>
                </div>

                {/* Views totais */}
                <div className="ea-stat ea-hide-md" style={{ opacity: 0.6 }}>
                  <p className="ea-stat-val" style={{ fontSize: '0.85em' }}>{(item.viewsTotais || 0).toLocaleString('pt-BR')}</p>
                  <p className="ea-stat-sub">totais</p>
                </div>

                {/* Status */}
                <div className="ea-trend ea-hide-lg">
                  <span className="ea-badge">Publicada</span>
                </div>

                {/* Ações */}
                <div className="ea-actions">
                  <a
                    href={`/noticia/${item.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ea-action-btn"
                    title="Ver no portal"
                  >
                    <Eye size={16} />
                  </a>
                  <a
                    href={`/admin/noticias/editar/${item.id}`}
                    className="ea-action-btn edit"
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
