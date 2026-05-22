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
} from 'lucide-react';
import { NewsPerformanceData } from '@/components/admin/analytics/NewsPerformanceRow';
import EmptyState from '@/components/admin/analytics/EmptyState';
import { getImagePath } from '@/utils/imagePath';

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

const EM_ALTA_PERIOD_OPTIONS = [
  { value: '1h', label: 'Última 1h' },
  { value: '6h', label: 'Últimas 6h' },
  { value: '24h', label: '24 Horas' },
  { value: '48h', label: '48 Horas' },
];

export default function EmAltaPage() {
  const { authFetch } = useAdminAuth();

  const [periodo, setPeriodo] = useState('24h');
  const [categoriaId, setCategoriaId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [noticias, setNoticias] = useState<NewsPerformanceData[]>([]);
  const [cards, setCards] = useState<CardsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setMounted(true);
    });
    return () => { active = false; };
  }, []);

  // Carregar filtros
  useEffect(() => {
    let active = true;
    const fetchFiltros = async () => {
      try {
        setLoadingFiltros(true);
        const res = await authFetch('/admin/categorias');
        if (res.ok && active) {
          setCategorias(await res.json());
        }
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      } finally {
        if (active) setLoadingFiltros(false);
      }
    };
    fetchFiltros();
    return () => { active = false; };
  }, [authFetch]);

  // Carregar tráfego em alta
  const fetchEmAlta = useCallback(async () => {
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
        if (active) {
          setNoticias(data.noticias || []);
          setCards(data.cards || null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Erro inesperado.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [authFetch, periodo, categoriaId]);

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
            Em Alta
          </h1>
          <p className="ea-subtitle">Velocidade editorial: notícias com aceleração de acessos nas últimas horas.</p>
        </div>
        <button
          onClick={fetchEmAlta}
          disabled={loading}
          className="ea-btn-refresh"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} style={loading ? { color: '#ff6b3d' } : {}} />
          Atualizar
        </button>
      </div>

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
            <p className="ea-kpi-label">Maior Crescimento</p>
            <p className="ea-kpi-value green">{cards.maiorCrescimento?.crescimento || '0%'}</p>
            <p className="ea-kpi-sub" title={cards.maiorCrescimento?.titulo || 'Sem matérias'}>
              {cards.maiorCrescimento?.titulo || 'Sem matérias'}
            </p>
          </div>
          <div className="ea-kpi-card">
            <p className="ea-kpi-label">Frequência de Acessos</p>
            <p className="ea-kpi-value">{cards.mediaViewsHora || '0 views/h'}</p>
            <p className="ea-kpi-sub">últimas {periodo}</p>
          </div>
          <div className="ea-kpi-card">
            <p className="ea-kpi-label">Categoria Líder</p>
            <p className="ea-kpi-value orange">{cards.categoriaEmAlta || 'Geral'}</p>
            <p className="ea-kpi-sub">maior aceleração</p>
          </div>
          <div className="ea-kpi-card">
            <p className="ea-kpi-label">Pico de Tráfego</p>
            <p className="ea-kpi-value">
              {cards.picoDeAcessos ? cards.picoDeAcessos.split(' (')[0] : '0 acessos/h'}
            </p>
            <p className="ea-kpi-sub">
              {cards.picoDeAcessos && cards.picoDeAcessos.includes('(')
                ? `Estimado (${cards.picoDeAcessos.split(' (')[1]}`
                : 'no período'}
            </p>
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
              Notícias em Rápida Ascensão
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
          title="Sem picos de aceleração"
          description="Nenhuma matéria apresentou crescimento fora da média ou picos de velocidade no período selecionado."
        />
      )}

      {/* ── LISTA DE RANKING ── */}
      {!loading && noticias.length > 0 && (
        <div className="ea-panel">
          <div className="ea-panel-head">
            <div className="ea-panel-title">
              <Zap size={16} style={{ color: '#4b5563' }} />
              Notícias em Rápida Ascensão
            </div>
            <span className="ea-panel-count">
              {filteredNoticias.length} de {noticias.length} matérias
            </span>
          </div>

          {/* Busca sem resultado */}
          {filteredNoticias.length === 0 && searchTerm && (
            <div className="ea-empty-search">
              <Search size={32} style={{ color: '#374151' }} />
              <p className="ea-empty-search-title">Nenhum resultado para &ldquo;{searchTerm}&rdquo;</p>
              <p className="ea-empty-search-sub">Tente um termo de busca diferente.</p>
            </div>
          )}

          {/* Rows */}
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

                {/* Aceleração */}
                <div className="ea-stat">
                  <p className="ea-stat-val green">+{item.crescimentoPercentual || 0}%</p>
                  <p className="ea-stat-sub">aceleração</p>
                </div>

                {/* Horário Pico */}
                <div className="ea-stat ea-hide-sm">
                  <p className="ea-stat-val">{item.horarioDePico || '—'}</p>
                  <p className="ea-stat-sub">pico acessos</p>
                </div>

                {/* Views */}
                <div className="ea-stat ea-hide-md">
                  <p className="ea-stat-val orange">+{item.viewsRecentes || 0}</p>
                  <p className="ea-stat-sub">{item.views || 0} totais</p>
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
