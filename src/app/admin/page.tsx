'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatAcao(acao: string): string {
  const map: Record<string, string> = {
    LOGIN_SUCESSO: '🟢 Login',
    LOGIN_FALHA: '🔴 Tentativa de login falhou',
    LOGOUT: '🚪 Logout',
    NOTICIA_CRIADA: '📰 Notícia criada',
    NOTICIA_ATUALIZADA: '✏️ Notícia editada',
    NOTICIA_EXCLUIDA: '🗑️ Notícia excluída',
    USUARIO_CRIADO: '👤 Usuário criado',
    USUARIO_ATUALIZADO: '🔄 Usuário atualizado',
    USUARIO_EXCLUIDO: '❌ Usuário excluído',
    CATEGORIA_CRIADA: '🏷️ Categoria criada',
    COLUNISTA_CRIADO: '✍️ Colunista criado',
  };
  return map[acao] || acao;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}m atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

// Gráfico de barras SVG puro - sem dependência externa
function BarChart({ data }: { data: Array<{ data: string; total: number }> }) {
  const max = Math.max(...data.map(d => d.total), 1);
  const WIDTH = 560;
  const HEIGHT = 120;
  const BAR_W = Math.floor((WIDTH - 40) / data.length) - 8;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT + 30}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {data.map((d, i) => {
        const barH = max > 0 ? Math.max((d.total / max) * HEIGHT, 2) : 2;
        const x = 20 + i * ((WIDTH - 40) / data.length);
        const y = HEIGHT - barH;
        const label = d.data.slice(5); // MM-DD
        return (
          <g key={d.data}>
            <rect
              x={x} y={y} width={BAR_W} height={barH}
              rx="4" ry="4"
              fill={d.total > 0 ? '#ff5722' : 'rgba(255,255,255,0.06)'}
              opacity={0.85}
            />
            {d.total > 0 && (
              <text
                x={x + BAR_W / 2} y={y - 4}
                textAnchor="middle" fontSize="10" fill="#ff7043"
              >
                {d.total}
              </text>
            )}
            <text
              x={x + BAR_W / 2} y={HEIGHT + 16}
              textAnchor="middle" fontSize="10" fill="#8b98b0"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

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
    // Polling a cada 60s
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
    return <div className="cms-alert cms-alert-error">⚠️ {error}</div>;
  }

  return (
    <>
      {/* Page header */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">
            Olá, {user?.nome.split(' ')[0]} 👋
          </h2>
          <p className="cms-page-subtitle">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/admin/noticias/nova" className="cms-btn cms-btn-primary">
          <span>+</span> Nova Notícia
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ background: 'rgba(255,87,34,0.12)' }}>📰</div>
          <div>
            <div className="cms-stat-value">{formatNumber(stats?.totalNoticias ?? 0)}</div>
            <div className="cms-stat-label">Notícias publicadas</div>
          </div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>👁️</div>
          <div>
            <div className="cms-stat-value" style={{ color: '#818cf8' }}>{formatNumber(stats?.totalViews ?? 0)}</div>
            <div className="cms-stat-label">Visualizações totais</div>
          </div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ background: 'rgba(34,197,94,0.12)' }}>❤️</div>
          <div>
            <div className="cms-stat-value" style={{ color: '#86efac' }}>{formatNumber(stats?.totalLikes ?? 0)}</div>
            <div className="cms-stat-label">Curtidas recebidas</div>
          </div>
        </div>
        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>📷</div>
          <div>
            <div className="cms-stat-value" style={{ color: '#fcd34d' }}>{stats?.totalSugestoesNovas ?? 0}</div>
            <div className="cms-stat-label">Sugestões pendentes</div>
          </div>
        </div>
      </div>

      {/* Gráfico + Top notícias */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="cms-chart-card">
          <div className="cms-chart-title">📈 Publicações nos últimos 7 dias</div>
          {stats?.grafico && <BarChart data={stats.grafico} />}
        </div>

        <div className="cms-table-card">
          <div className="cms-table-header">
            <span className="cms-table-title">🔥 Top 5 mais lidas</span>
            <Link href="/admin/noticias" className="cms-btn cms-btn-secondary cms-btn-sm">Ver todas</Link>
          </div>
          <table className="cms-table">
            <thead>
              <tr>
                <th>Título</th>
                <th style={{ textAlign: 'right' }}>Views</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topNoticias.map((n, i) => (
                <tr key={n.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '6px',
                        background: i === 0 ? '#ff5722' : 'rgba(255,255,255,0.06)',
                        color: i === 0 ? '#fff' : '#8b98b0',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '700', flexShrink: 0
                      }}>{i + 1}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.3' }}>
                        {n.titulo.length > 45 ? n.titulo.slice(0, 45) + '…' : n.titulo}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: '#ff5722' }}>
                    {formatNumber(n.views)}
                  </td>
                </tr>
              ))}
              {(!stats?.topNoticias || stats.topNoticias.length === 0) && (
                <tr><td colSpan={2} style={{ textAlign: 'center', padding: '30px', color: '#8b98b0' }}>Nenhum dado ainda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Últimos logs de auditoria */}
      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title">🔍 Atividade recente</span>
          <Link href="/admin/auditoria" className="cms-btn cms-btn-secondary cms-btn-sm">Ver auditoria completa</Link>
        </div>
        <table className="cms-table">
          <thead>
            <tr>
              <th>Ação</th>
              <th>Usuário</th>
              <th>IP</th>
              <th>Quando</th>
            </tr>
          </thead>
          <tbody>
            {stats?.ultimosLogs.map(log => (
              <tr key={log.id}>
                <td style={{ fontWeight: '500' }}>{formatAcao(log.acao)}</td>
                <td style={{ color: '#8b98b0' }}>{log.usuario?.nome || '—'}</td>
                <td><code style={{ fontSize: '12px', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>{log.ip}</code></td>
                <td style={{ color: '#8b98b0', fontSize: '13px' }}>{timeAgo(log.dataHora)}</td>
              </tr>
            ))}
            {(!stats?.ultimosLogs || stats.ultimosLogs.length === 0) && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#8b98b0' }}>Nenhuma atividade registrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ações rápidas */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link href="/admin/noticias/nova" className="cms-btn cms-btn-primary">📰 Nova Notícia</Link>
        <Link href="/admin/categorias" className="cms-btn cms-btn-secondary">🏷️ Gerenciar Categorias</Link>
        <Link href="/admin/colunistas" className="cms-btn cms-btn-secondary">✍️ Gerenciar Colunistas</Link>
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
          <Link href="/admin/usuarios" className="cms-btn cms-btn-secondary">👥 Gerenciar Usuários</Link>
        )}
        <Link href="/admin/sugestoes" className="cms-btn cms-btn-secondary">📷 Você Repórter</Link>
      </div>
    </>
  );
}
