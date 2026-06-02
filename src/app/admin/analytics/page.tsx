'use client';

import './analytics.css';
import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  BarChart3, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp, 
  Database,
  ThumbsUp,
  MessageSquare,
  FileText,
  Clock,
  Eye,
  Activity
} from 'lucide-react';

interface OverviewData {
  ga4: {
    measurementId: string;
    connected: boolean;
  };
  local: {
    totalNoticias: number;
    totalViews: number;
    noticiaMaisLida: {
      id: string;
      titulo: string;
      slug: string;
      views: number;
    } | null;
    sugestoesPendentes: number;
    totalLikes: number;
    ultimaAtualizacao: string;
  };
  status: {
    realtimeAnalytics: string;
    adminPolling: string;
    mostRead: string;
    trending: string;
    viewsInternas: string;
  };
}

export default function AnalyticsDashboardPage() {
  const { authFetch } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setMounted(true);
    });
    return () => { active = false; };
  }, []);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch('/admin/analytics/overview');
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error('Erro ao buscar visão geral das estatísticas locais:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (mounted) {
      Promise.resolve().then(() => {
        fetchOverview();
      });
    }
  }, [mounted, fetchOverview]);

  if (!mounted) {
    return (
      <div className="an-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <RefreshCw className="w-8 h-8 animate-spin text-[#ff5722]" />
      </div>
    );
  }

  const gaId = overview?.ga4?.measurementId || process.env.NEXT_PUBLIC_GA_ID || "G-PTJPVDHEWK";

  return (
    <div className="an-page" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── SEÇÃO TOPO: CABEÇALHO ── */}
      <div className="an-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="an-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', fontWeight: 800, color: '#f3f4f6', letterSpacing: '-0.02em', margin: 0 }}>
            <BarChart3 size={30} className="text-[#ff5722]" />
            Analytics
          </h1>
          <p className="an-subtitle" style={{ fontSize: '14.5px', color: '#9ca3af', marginTop: '4px', margin: '4px 0 0 0' }}>
            Monitoramento de audiência via Google Analytics 4 e indicadores locais do CMS.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="cms-btn cms-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '42px',
              padding: '0 20px',
              fontSize: '13.5px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '8px',
              background: '#ff5722',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(255, 87, 34, 0.2)'
            }}
          >
            <ExternalLink size={15} />
            Abrir Google Analytics
          </a>
        </div>
      </div>

      {/* ── PRIMEIRA SEÇÃO: INTEGRAÇÃO GA4 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Card 1 — Google Analytics */}
        <div style={{
          background: '#12141D',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '260px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.08)',
                color: '#10b981',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 size={13} /> Conectado
              </span>
              <span style={{ fontSize: '12px', color: '#4b5563', fontFamily: 'monospace', fontWeight: 600 }}>{gaId}</span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#ffffff', marginBottom: '10px', margin: '0 0 10px 0' }}>Google Analytics 4</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>
              Relatórios completos de audiência, origem de tráfego, dispositivos e tempo real são acompanhados no painel oficial do GA4.
            </p>
          </div>
          <div style={{ marginTop: '20px' }}>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="cms-btn cms-btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#f3f4f6',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              Abrir painel
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Card 2 — Dados monitorados no GA4 */}
        <div style={{
          background: '#12141D',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '24px',
          minHeight: '260px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
            <TrendingUp size={16} style={{ color: '#10b981' }} />
            Dados monitorados no GA4
          </h3>
          <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: 0, margin: 0, listStyle: 'none' }}>
            {[
              'Usuários ativos',
              'Páginas mais acessadas',
              'Origem do tráfego',
              'Localização',
              'Dispositivos',
              'Tempo de engajamento',
              'Eventos',
              'Retenção de público'
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#d1d5db' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }}></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3 — Dados mantidos localmente */}
        <div style={{
          background: '#12141D',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '24px',
          minHeight: '260px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
            <Database size={16} style={{ color: '#ff5722' }} />
            Dados mantidos localmente
          </h3>
          <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: 0, margin: 0, listStyle: 'none' }}>
            {[
              'Views simples por notícia',
              'Mais Lidas do portal',
              'Sugestões do Você Repórter',
              'Auditoria administrativa',
              'Produção editorial',
              'Cadastro de banners',
              'Colunistas e categorias',
              'Estrutura do acervo'
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#d1d5db' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ff5722' }}></span>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── SEGUNDA SEÇÃO: RESUMO LOCAL DO CMS ── */}
      <div style={{ background: '#12141D', border: '1px solid rgba(255,255,255,0.06)', padding: '28px', borderRadius: '18px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0' }}>
          <Activity size={20} style={{ color: '#ff5722' }} />
          Resumo Local do CMS
        </h2>

        {loading && !overview ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: '#9ca3af', gap: '10px' }}>
            <RefreshCw className="w-5 h-5 animate-spin text-[#ff5722]" /> Carregando estatísticas locais...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            
            {/* Notícias publicadas */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={12} /> Notícias publicadas
              </span>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#f3f4f6', margin: '4px 0 2px 0', fontFamily: 'monospace' }}>{overview?.local?.totalNoticias || 0}</p>
              <span style={{ fontSize: '11.5px', color: '#4b5563' }}>matérias no acervo local</span>
            </div>

            {/* Views acumuladas */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={12} /> Views acumuladas
              </span>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#f3f4f6', margin: '4px 0 2px 0', fontFamily: 'monospace' }}>{overview?.local?.totalViews?.toLocaleString('pt-BR') || 0}</p>
              <span style={{ fontSize: '11.5px', color: '#4b5563' }}>views locais acumuladas</span>
            </div>

            {/* Sugestões pendentes */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={12} /> Sugestões pendentes
              </span>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#f3f4f6', margin: '4px 0 2px 0', fontFamily: 'monospace' }}>{overview?.local?.sugestoesPendentes || 0}</p>
              <span style={{ fontSize: '11.5px', color: '#4b5563' }}>sugestões Você Repórter</span>
            </div>

            {/* Curtidas recebidas */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ThumbsUp size={12} /> Curtidas recebidas
              </span>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#f3f4f6', margin: '4px 0 2px 0', fontFamily: 'monospace' }}>{overview?.local?.totalLikes?.toLocaleString('pt-BR') || 0}</p>
              <span style={{ fontSize: '11.5px', color: '#4b5563' }}>likes registrados no CMS</span>
            </div>

            {/* Matéria mais lida */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '20px',
              borderRadius: '12px',
              gridColumn: 'span 2',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '100px'
            }}>
              <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>Matéria mais lida (Acumulado)</span>
              {overview?.local?.noticiaMaisLida ? (
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#ff5722', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={overview.local.noticiaMaisLida.titulo}>
                    {overview.local.noticiaMaisLida.titulo}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Acumula <strong>{overview.local.noticiaMaisLida.views.toLocaleString('pt-BR')}</strong> visualizações locais
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>Nenhuma notícia cadastrada no momento.</p>
              )}
            </div>

            {/* Última atualização */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '20px',
              borderRadius: '12px',
              gridColumn: 'span 2',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '100px'
            }}>
              <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} /> Última atualização local
              </span>
              <p style={{ fontSize: '12.5px', color: '#9ca3af', margin: 0, lineHeight: '1.5' }}>
                Dados sincronizados às: <strong>{overview?.local?.ultimaAtualizacao ? new Date(overview.local.ultimaAtualizacao).toLocaleTimeString('pt-BR') : '—'}</strong>. 
                As views locais simples são incrementadas a cada novo acesso público e servem exclusivamente para renderizar o bloco &ldquo;Mais Lidas&rdquo; no portal público de forma instantânea.
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
