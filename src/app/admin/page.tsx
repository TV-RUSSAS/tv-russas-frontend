'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';

/* ── Tipos ───────────────────────────────────────────────── */
interface DashboardStats {
  totalNoticias: number;
  totalUsuarios: number;
  totalViews: number;
  totalLikes: number;
  totalSugestoesNovas: number;
  topNoticias: Array<{ id: string; titulo: string; views: number; categoria: { nome: string } }>;
  ultimosLogs: Array<{
    id: string;
    acao: string;
    ip: string;
    dataHora: string;
    usuario?: { nome: string; role: string } | null;
  }>;
  grafico: Array<{ data: string; total: number }>;
}

/* ── Utilitários ─────────────────────────────────────────── */
function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

type AcaoType = 'default' | 'success' | 'danger' | 'warn';

function getAcaoInfo(acao: string): { label: string; type: AcaoType } {
  const map: Record<string, { label: string; type: AcaoType }> = {
    LOGIN_SUCESSO:            { label: 'Login realizado',           type: 'success' },
    LOGIN_FALHA:              { label: 'Tentativa de login falhou', type: 'danger'  },
    TENTATIVA_LOGIN_INVALIDA: { label: 'Login inválido',            type: 'danger'  },
    SENHA_INCORRETA:          { label: 'Senha incorreta',           type: 'danger'  },
    LOGOUT:                   { label: 'Sessão encerrada',          type: 'default' },
    NOTICIA_CRIADA:           { label: 'Notícia publicada',         type: 'success' },
    NOTICIA_ATUALIZADA:       { label: 'Notícia editada',           type: 'default' },
    NOTICIA_EXCLUIDA:         { label: 'Notícia excluída',          type: 'danger'  },
    USUARIO_CRIADO:           { label: 'Usuário criado',            type: 'success' },
    USUARIO_ATUALIZADO:       { label: 'Usuário atualizado',        type: 'default' },
    USUARIO_EXCLUIDO:         { label: 'Usuário excluído',          type: 'danger'  },
    CATEGORIA_CRIADA:         { label: 'Categoria criada',          type: 'success' },
    COLUNISTA_CRIADO:         { label: 'Colunista criado',          type: 'success' },
  };
  return map[acao] || {
    label: acao.replace(/_/g, ' ').toLowerCase(),
    type: 'default',
  };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

/* ── Ícones SVG inline ───────────────────────────────────── */
const IconArticle = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 1h7l3 3v9H2.5V1z"/>
    <path d="M9 1v3.5h3"/>
    <line x1="4" y1="7" x2="10" y2="7"/>
    <line x1="4" y1="9.5" x2="7.5" y2="9.5"/>
  </svg>
);

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z"/>
    <circle cx="7" cy="7" r="2"/>
  </svg>
);

const IconHeart = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 12s-6-3.9-6-7.5A3.5 3.5 0 017 3.5 3.5 3.5 0 0113 4.5C13 8.1 7 12 7 12z"/>
  </svg>
);

const IconCamera = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4.5h1.5L4 2.5h6l1.5 2H13a.5.5 0 01.5.5v6.5a.5.5 0 01-.5.5H1a.5.5 0 01-.5-.5V5a.5.5 0 01.5-.5z"/>
    <circle cx="7" cy="8" r="2"/>
  </svg>
);

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="6.5" y1="1.5" x2="6.5" y2="11.5"/>
    <line x1="1.5" y1="6.5" x2="11.5" y2="6.5"/>
  </svg>
);

const IconTag = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1h5l6 6-5 5-6-6V1z"/>
    <circle cx="4" cy="4" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
);

const IconPen = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 1.5a1.5 1.5 0 012.1 2.1L3.5 11.2l-2.8.8.8-2.8L9 1.5z"/>
  </svg>
);

const IconExternal = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8"/>
    <path d="M8 1h4v4"/>
    <line x1="12" y1="1" x2="6.5" y2="6.5"/>
  </svg>
);

/* ── Gráfico de barras ───────────────────────────────────── */
function BarChart({ data }: { data: Array<{ data: string; total: number }> }) {
  const max = Math.max(...data.map(d => d.total), 1);
  const WIDTH = 560;
  const HEIGHT = 96;
  const COUNT = data.length;
  const GAP = 8;
  const BAR_W = Math.floor((WIDTH - (COUNT - 1) * GAP) / COUNT);

  // Índice do maior valor
  const maxIdx = data.reduce((mi, d, i) => d.total > data[mi].total ? i : mi, 0);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT + 26}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Linhas de referência */}
      {[0.25, 0.5, 0.75, 1].map(pct => (
        <line
          key={pct}
          x1={0} y1={HEIGHT - pct * HEIGHT}
          x2={WIDTH} y2={HEIGHT - pct * HEIGHT}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1"
        />
      ))}

      {data.map((d, i) => {
        const barH = max > 0 ? Math.max((d.total / max) * HEIGHT, 2) : 2;
        const x = i * (BAR_W + GAP);
        const y = HEIGHT - barH;
        const isMax = i === maxIdx && d.total > 0;
        const label = d.data.slice(5).replace('-', '/');

        return (
          <g key={d.data}>
            <rect
              x={x} y={y} width={BAR_W} height={barH}
              rx="3" ry="3"
              fill={
                isMax
                  ? 'rgba(214,61,31,0.75)'
                  : d.total > 0
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.03)'
              }
            />
            {d.total > 0 && (
              <text
                x={x + BAR_W / 2} y={y - 5}
                textAnchor="middle"
                fontSize="9.5"
                fontFamily="Inter, sans-serif"
                fill={isMax ? 'rgba(214,61,31,0.9)' : 'rgba(255,255,255,0.25)'}
              >
                {d.total}
              </text>
            )}
            <text
              x={x + BAR_W / 2} y={HEIGHT + 18}
              textAnchor="middle"
              fontSize="9.5"
              fontFamily="Inter, sans-serif"
              fill="rgba(255,255,255,0.28)"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Componente principal ────────────────────────────────── */
export default function AdminDashboard() {
  const { authFetch, user } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authFetch('/admin/dashboard/stats');
        if (!res.ok) throw new Error('Falha ao carregar métricas.');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [authFetch]);

  if (loading) {
    return (
      <div className="cms-loading">
        <div className="cms-spinner" />
        Carregando métricas...
      </div>
    );
  }

  if (error) {
    return <div className="cms-alert cms-alert-error">{error}</div>;
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      {/* Cabeçalho da página */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Redação</h2>
          <p className="cms-page-subtitle" style={{ textTransform: 'capitalize' }}>
            {today}
          </p>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--c-accent)', opacity: 0.7 }}><IconArticle /></span>
          </div>
          <div className="cms-stat-value">{formatNumber(stats?.totalNoticias ?? 0)}</div>
          <div className="cms-stat-label">Notícias publicadas</div>
        </div>

        <div className="cms-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--c-secondary)', opacity: 0.7 }}><IconEye /></span>
          </div>
          <div className="cms-stat-value">{formatNumber(stats?.totalViews ?? 0)}</div>
          <div className="cms-stat-label">Visualizações totais</div>
        </div>

        <div className="cms-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--c-positive)', opacity: 0.7 }}><IconHeart /></span>
          </div>
          <div className="cms-stat-value">{formatNumber(stats?.totalLikes ?? 0)}</div>
          <div className="cms-stat-label">Curtidas recebidas</div>
        </div>

        <div className="cms-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--c-warn)', opacity: 0.7 }}><IconCamera /></span>
          </div>
          <div
            className="cms-stat-value"
            style={(stats?.totalSugestoesNovas ?? 0) > 0 ? { color: 'var(--c-warn)' } : {}}
          >
            {stats?.totalSugestoesNovas ?? 0}
          </div>
          <div className="cms-stat-label">Sugestões pendentes</div>
        </div>
      </div>

      {/* Gráfico + Top 5 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '12px', marginBottom: '12px' }}>
        <div className="cms-chart-card">
          <div className="cms-chart-title">Publicações — últimos 7 dias</div>
          {stats?.grafico && stats.grafico.length > 0
            ? <BarChart data={stats.grafico} />
            : <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--c-muted)', fontSize: '13px' }}>
                Nenhum dado disponível
              </div>
          }
        </div>

        <div className="cms-table-card">
          <div className="cms-table-header">
            <span className="cms-table-title">Mais acessadas</span>
            <Link href="/admin/noticias" className="cms-btn cms-btn-secondary cms-btn-sm">Ver todas</Link>
          </div>
          <table className="cms-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th style={{ textAlign: 'right' }}>Views</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topNoticias.map((n, i) => (
                <tr key={n.id}>
                  <td style={{ width: '28px', color: 'var(--c-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {i + 1}
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px', fontWeight: 450, lineHeight: '1.35' }}>
                      {n.titulo.length > 42 ? n.titulo.slice(0, 42) + '…' : n.titulo}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--c-muted)', marginTop: '2px' }}>
                      {n.categoria?.nome}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--c-text)' }}>
                    {formatNumber(n.views)}
                  </td>
                </tr>
              ))}
              {(!stats?.topNoticias || stats.topNoticias.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '28px', color: 'var(--c-muted)' }}>
                    Nenhuma notícia ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feed de atividade recente */}
      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title">Atividade recente</span>
          <Link href="/admin/auditoria" className="cms-btn cms-btn-secondary cms-btn-sm">
            Ver auditoria completa
          </Link>
        </div>
        <div style={{ padding: '6px 16px 8px' }}>
          <div className="ed-activity">
            {stats?.ultimosLogs.map(log => {
              const info = getAcaoInfo(log.acao);
              return (
                <div key={log.id} className="ed-activity-item">
                  <div className={`ed-dot ed-dot-${info.type}`} />
                  <div className="ed-activity-body">
                    <div className="ed-activity-label">{info.label}</div>
                    <div className="ed-activity-meta">
                      <span>{log.usuario?.nome || 'Sistema'}</span>
                      <span style={{ color: 'var(--c-border-h)' }}>·</span>
                      <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--c-muted)' }}>
                        {log.ip}
                      </code>
                      <span style={{ color: 'var(--c-border-h)' }}>·</span>
                      <span>{timeAgo(log.dataHora)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!stats?.ultimosLogs || stats.ultimosLogs.length === 0) && (
              <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--c-muted)', fontSize: '13px' }}>
                Nenhuma atividade registrada
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div className="ed-quick-grid">
        <Link href="/admin/noticias/nova" className="ed-quick-item">
          <div className="ed-quick-icon"><IconPlus /></div>
          Nova Notícia
        </Link>

        <Link href="/admin/categorias" className="ed-quick-item">
          <div className="ed-quick-icon"><IconTag /></div>
          Categorias
        </Link>

        <Link href="/admin/colunistas" className="ed-quick-item">
          <div className="ed-quick-icon"><IconPen /></div>
          Colunistas
        </Link>

        <Link href="/" target="_blank" className="ed-quick-item">
          <div className="ed-quick-icon"><IconExternal /></div>
          Ver Portal
        </Link>
      </div>
    </>
  );
}
