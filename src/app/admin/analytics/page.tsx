'use client';

import './analytics.css';
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
  Loader2,
  Calendar
} from 'lucide-react';
import MetricCard from '@/components/admin/analytics/MetricCard';
import AnalyticsChart from '@/components/admin/analytics/AnalyticsChart';
import EmptyState from '@/components/admin/analytics/EmptyState';

const PERIOD_OPTIONS = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7d', label: '7 Dias' },
  { value: '30d', label: '30 Dias' },
  { value: 'mes', label: 'Este Mês' },
  { value: 'geral', label: 'Geral' },
];

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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setMounted(true);
    });
    return () => { active = false; };
  }, []);

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
          className="an-author-avatar"
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
      <div className="an-author-avatar-placeholder">
        {iniciais}
      </div>
    );
  };

  const isGlobalLoading = loadingOverview && loadingGrafico && loadingCategorias && loadingAutores;

  if (!mounted) {
    return (
      <div className="an-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#ff5722]" />
      </div>
    );
  }

  return (
    <div className="an-page">
      {/* Cabeçalho */}
      <div className="an-header">
        <div>
          <h1 className="an-title">
            <BarChart3 size={26} />
            Analytics Editorial
          </h1>
          <p className="an-subtitle">
            Métricas integradas e consolidadas de acessos, engajamento e produção jornalística.
          </p>
        </div>
        {isGlobalLoading && (
          <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
            <Loader2 className="w-5 h-5 animate-spin text-[#ff5722]" />
          </div>
        )}
      </div>

      {/* ── SELETOR DE PERÍODO ── */}
      <div className="an-period-row">
        <div className="an-period-bar">
          <span className="an-period-icon"><Calendar size={15} /></span>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriodo(opt.value)}
              className={`an-period-btn${periodo === opt.value ? ' active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de KPIs no Topo (Mapeia o overview consolidado) */}
      <div className="an-kpi-grid">
        <MetricCard
          title="Visualizações do Período"
          value={
            overview 
              ? periodo === 'hoje' ? overview.viewsHoje.toLocaleString('pt-BR') 
              : periodo === '7d' ? overview.views7d.toLocaleString('pt-BR') 
              : periodo === '30d' || periodo === 'mes' ? overview.views30d.toLocaleString('pt-BR')
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
      <div className="an-chart-panel">
        <div className="an-chart-head">
          <div>
            <h2 className="an-chart-title">
              <Activity size={16} />
              Evolução Diária de Visualizações
            </h2>
            <p className="an-chart-subtitle">
              Histórico diário de pageviews nas notícias do portal
            </p>
          </div>

          {/* Filtro rápido de dias do gráfico */}
          <div className="an-chart-days-bar">
            {[7, 14, 30].map((dias) => (
              <button
                key={dias}
                type="button"
                onClick={() => setGraficoDias(dias)}
                className={`an-chart-days-btn${graficoDias === dias ? ' active' : ''}`}
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
          <div className="an-comparative-grid">
            <div className="an-comparative-card">
              <span className="an-comparative-label">Visualizações no Intervalo</span>
              <p className="an-comparative-value">{historico.comparativo.atual.toLocaleString('pt-BR')}</p>
            </div>
            <div className="an-comparative-card">
              <span className="an-comparative-label">Intervalo Anterior</span>
              <p className="an-comparative-value muted">{historico.comparativo.anterior.toLocaleString('pt-BR')}</p>
            </div>
            <div className="an-comparative-card">
              <span className="an-comparative-label">Variação Percentual</span>
              <p className={`an-comparative-value ${historico.comparativo.variacao.startsWith('+') ? 'green' : 'red'}`}>
                {historico.comparativo.variacao}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DUAS COLUNAS LADO A LADO: Categorias e Autores */}
      <div className="an-split-grid">
        {/* Coluna 1: Desempenho de Categorias */}
        <div className="an-split-card">
          <div>
            <div className="an-split-head">
              <h2 className="an-split-title">
                <Tag size={15} style={{ color: '#6b7280' }} />
                Desempenho por Categorias
              </h2>
              <span className="an-split-badge">
                Filtro: {periodo.toUpperCase()}
              </span>
            </div>

            {loadingCategorias ? (
              <div className="an-cat-list">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="an-cat-item" style={{ opacity: 0.5, animation: 'an-pulse 1.5s ease-in-out infinite' }}>
                    <div className="an-cat-info">
                      <div style={{ width: 100, height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                      <div style={{ width: 60, height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                    </div>
                    <div className="an-cat-progress">
                      <div className="an-cat-bar" style={{ width: '0%' }} />
                    </div>
                    <div className="an-cat-meta" style={{ width: 140, height: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 3, marginTop: 4 }} />
                  </div>
                ))}
              </div>
            ) : categorias.length === 0 ? (
              <div style={{ padding: '32px 0' }}>
                <EmptyState title="Sem dados de categorias" />
              </div>
            ) : (
              <div className="an-cat-list">
                {categorias.map((cat) => (
                  <div key={cat.id} className="an-cat-item">
                    <div className="an-cat-info">
                      <span className="an-cat-name">{cat.nome}</span>
                      <span className="an-cat-stat">
                        <strong>{cat.views.toLocaleString('pt-BR')}</strong> views ({cat.percentual}%)
                      </span>
                    </div>
                    <div className="an-cat-progress">
                      <div 
                        className="an-cat-bar"
                        style={{ width: `${cat.percentual}%` }}
                      />
                    </div>
                    <div className="an-cat-meta">
                      {cat.noticiasCount} matérias publicadas
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Ranking de Autores / Jornalistas */}
        <div className="an-split-card">
          <div>
            <div className="an-split-head">
              <h2 className="an-split-title">
                <UserCheck size={15} style={{ color: '#6b7280' }} />
                Desempenho de Autores & Colunistas
              </h2>
              <span className="an-split-badge">
                Produção Ativa
              </span>
            </div>

            {loadingAutores ? (
              <div className="an-author-list">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="an-author-item" style={{ opacity: 0.5, animation: 'an-pulse 1.5s ease-in-out infinite' }}>
                    <div className="an-author-left">
                      <span className="an-author-rank">#{i + 1}</span>
                      <div className="an-author-avatar-placeholder" />
                      <div className="an-author-info">
                        <div style={{ width: 90, height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                        <div style={{ width: 40, height: 9, background: 'rgba(255,255,255,0.03)', borderRadius: 3, marginTop: 4 }} />
                      </div>
                    </div>
                    <div className="an-author-right">
                      <div style={{ width: 70, height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                      <div style={{ width: 110, height: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 3, marginTop: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : autores.length === 0 ? (
              <div style={{ padding: '32px 0' }}>
                <EmptyState title="Sem dados de autores" />
              </div>
            ) : (
              <div className="an-author-list">
                {autores.map((aut, idx) => (
                  <div key={aut.id} className="an-author-item">
                    <div className="an-author-left">
                      <span className="an-author-rank">
                        #{idx + 1}
                      </span>
                      <div className="an-author-avatar-wrap">
                        {renderAvatarAutor(aut)}
                      </div>
                      <div className="an-author-info">
                        <h4 className="an-author-name">{aut.nome}</h4>
                        <span className="an-author-role">{aut.tipo}</span>
                      </div>
                    </div>

                    <div className="an-author-right">
                      <span className="an-author-views">
                        {aut.views.toLocaleString('pt-BR')} views
                      </span>
                      <span className="an-author-meta">
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
