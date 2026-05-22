'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  Database,
  ShieldAlert,
  LogOut,
  FilePlus,
  Edit3,
  Trash2,
  UserPlus,
  UserCheck,
  UserMinus,
  FolderPlus,
  FolderSync,
  FolderMinus,
  PenTool,
  Search,
  KeyRound,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Terminal,
  RefreshCw
} from 'lucide-react';

interface Log {
  id: string;
  acao: string;
  entidade: string | null;
  entidadeId: string | null;
  ip: string;
  rota: string | null;
  dataHora: string;
  detalhes: Record<string, unknown> | null;
  usuario?: { nome: string; role: string } | null;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  COLUNISTA: 'Colunista',
};

const ACAO_INFO: Record<string, { label: string; badge: string; icon: React.ComponentType<{ className?: string; size?: number }> }> = {
  LOGIN_SUCESSO:      { label: 'Login bem-sucedido', badge: 'cms-badge-green', icon: KeyRound },
  LOGIN_FALHA:        { label: 'Tentativa de login falhou', badge: 'cms-badge-red', icon: ShieldAlert },
  LOGOUT:             { label: 'Logout do painel', badge: 'cms-badge-gray', icon: LogOut },
  NOTICIA_CRIADA:     { label: 'Notícia criada', badge: 'cms-badge-blue', icon: FilePlus },
  NOTICIA_ATUALIZADA: { label: 'Notícia editada', badge: 'cms-badge-yellow', icon: Edit3 },
  NOTICIA_EXCLUIDA:   { label: 'Notícia excluída', badge: 'cms-badge-red', icon: Trash2 },
  USUARIO_CRIADO:     { label: 'Usuário criado', badge: 'cms-badge-blue', icon: UserPlus },
  USUARIO_ATUALIZADO: { label: 'Usuário atualizado', badge: 'cms-badge-yellow', icon: UserCheck },
  USUARIO_EXCLUIDO:   { label: 'Usuário excluído', badge: 'cms-badge-red', icon: UserMinus },
  CATEGORIA_CRIADA:   { label: 'Categoria criada', badge: 'cms-badge-blue', icon: FolderPlus },
  CATEGORIA_ATUALIZADA:{ label: 'Categoria editada', badge: 'cms-badge-yellow', icon: FolderSync },
  CATEGORIA_EXCLUIDA: { label: 'Categoria excluída', badge: 'cms-badge-red', icon: FolderMinus },
  COLUNISTA_CRIADO:   { label: 'Colunista cadastrado', badge: 'cms-badge-blue', icon: PenTool },
  COLUNISTA_ATUALIZADO:{ label: 'Colunista atualizado', badge: 'cms-badge-yellow', icon: PenTool },
  COLUNISTA_EXCLUIDO: { label: 'Colunista excluído', badge: 'cms-badge-red', icon: Trash2 },
};

export default function AuditoriaAdmin() {
  const { authFetch } = useAdminAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros & Paginação no Cliente
  const [busca, setBusca] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState<'TUDO' | 'NOTICIAS' | 'SEGURANCA' | 'ESTRUTURA'>('TUDO');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authFetch('/admin/audit-logs');
      if (!res.ok) throw new Error('Não foi possível obter os logs de auditoria');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [authFetch]);

  // KPIs dinâmicos baseados em todos os logs carregados (até 100 logs mais recentes)
  const kpis = useMemo(() => {
    const total = logs.length;
    
    const noticias = logs.filter(l => 
      l.acao.startsWith('NOTICIA_')
    ).length;

    const seguranca = logs.filter(l => 
      l.acao.startsWith('LOGIN_') || l.acao === 'LOGOUT' || l.acao.startsWith('USUARIO_')
    ).length;

    const exclusoes = logs.filter(l => 
      l.acao.endsWith('_EXCLUIDA') || l.acao.endsWith('_EXCLUIDO')
    ).length;

    return { total, noticias, seguranca, exclusoes };
  }, [logs]);

  // Filtro completo local
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Filtro por grupo
      if (grupoFiltro === 'NOTICIAS' && !log.acao.startsWith('NOTICIA_')) return false;
      if (grupoFiltro === 'SEGURANCA' && !(log.acao.startsWith('LOGIN_') || log.acao === 'LOGOUT' || log.acao.startsWith('USUARIO_'))) return false;
      if (grupoFiltro === 'ESTRUTURA' && !(log.acao.startsWith('CATEGORIA_') || log.acao.startsWith('COLUNISTA_'))) return false;

      // 2. Filtro de busca textual
      if (!busca.trim()) return true;
      const term = busca.toLowerCase();
      const acaoInfo = ACAO_INFO[log.acao]?.label.toLowerCase() || log.acao.toLowerCase();
      const responsavel = log.usuario?.nome.toLowerCase() || 'anônimo';
      const ip = log.ip.toLowerCase();
      const rota = log.rota?.toLowerCase() || '';
      const entidade = log.entidade?.toLowerCase() || '';

      return acaoInfo.includes(term) ||
             responsavel.includes(term) ||
             ip.includes(term) ||
             rota.includes(term) ||
             entidade.includes(term);
    });
  }, [logs, grupoFiltro, busca]);

  // Paginação local
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, page]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

  // Resetar página ao mudar filtros
  const handleGrupoFiltro = (grupo: 'TUDO' | 'NOTICIAS' | 'SEGURANCA' | 'ESTRUTURA') => {
    setGrupoFiltro(grupo);
    setPage(1);
  };

  const handleBusca = (val: string) => {
    setBusca(val);
    setPage(1);
  };

  return (
    <>
      {/* Cabeçalho Editorial Rico */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Auditoria do Sistema</h2>
          <p className="cms-page-subtitle">Rastreabilidade e segurança integral de todas as modificações editoriais e acessos</p>
        </div>
        <button 
          onClick={loadLogs} 
          className="cms-btn cms-btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Atualizar Logs</span>
        </button>
      </div>

      {error && (
        <div className="cms-alert cms-alert-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de KPIs Premium */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: 'var(--c-accent)' }}>
            <Activity size={16} />
          </div>
          <span className="cms-stat-value">{kpis.total}</span>
          <span className="cms-stat-label">Total de Eventos (Recentes)</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#6366f1' }}>
            <FilePlus size={16} />
          </div>
          <span className="cms-stat-value">{kpis.noticias}</span>
          <span className="cms-stat-label">Modificações de Notícias</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#10b981' }}>
            <ShieldCheck size={16} />
          </div>
          <span className="cms-stat-value">{kpis.seguranca}</span>
          <span className="cms-stat-label">Segurança & Usuários</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#ef4444' }}>
            <Trash2 size={16} />
          </div>
          <span className="cms-stat-value">{kpis.exclusoes}</span>
          <span className="cms-stat-label">Exclusões Realizadas</span>
        </div>
      </div>

      {/* Barra de Ferramentas / Busca & Pílulas de Filtro */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Pílulas de Filtro Rápido */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.02)', padding: '4px', borderRadius: '8px', border: '1px solid var(--c-border)' }}>
          {[
            { id: 'TUDO', label: 'Todos Eventos' },
            { id: 'NOTICIAS', label: 'Notícias' },
            { id: 'SEGURANCA', label: 'Segurança' },
            { id: 'ESTRUTURA', label: 'Estrutura' },
          ].map(grp => (
            <button
              key={grp.id}
              onClick={() => handleGrupoFiltro(grp.id as any)}
              style={{
                background: grupoFiltro === grp.id ? 'rgba(255, 87, 34, 0.1)' : 'transparent',
                color: grupoFiltro === grp.id ? 'var(--c-accent)' : 'var(--c-secondary)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: grupoFiltro === grp.id ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {grp.label}
            </button>
          ))}
        </div>

        {/* Caixa de Busca */}
        <div className="cms-search-wrap" style={{ flex: 1, minWidth: '260px' }}>
          <Search className="cms-search-icon" size={15} />
          <input
            type="text"
            className="cms-search-input"
            placeholder="Filtrar por ação, responsável, IP, rota ou entidade..."
            value={busca}
            onChange={e => handleBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Timeline de Eventos / Tabela Minimalista Notion-Style */}
      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Terminal size={15} style={{ color: 'var(--c-accent)' }} />
            Logs Recentes do Sistema
          </span>
          <span style={{ fontSize: '12px', color: 'var(--c-secondary)' }}>
            Exibindo {filteredLogs.length} eventos
          </span>
        </div>

        {loading ? (
          <div className="cms-loading">
            <div className="cms-spinner" />
            <span>Processando auditoria...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cms-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Ação Realizada</th>
                  <th style={{ width: '18%' }}>Integrante</th>
                  <th style={{ width: '18%' }}>Entidade</th>
                  <th style={{ width: '16%' }}>Rota / Endpoint</th>
                  <th style={{ width: '10%' }}>IP</th>
                  <th style={{ width: '16%' }}>Data & Hora</th>
                  <th style={{ width: '5%', textAlign: 'right' }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--c-secondary)' }}>
                      Nenhum registro de auditoria corresponde aos filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map(log => {
                    const acaoMeta = ACAO_INFO[log.acao] || { label: log.acao, badge: 'cms-badge-gray', icon: Database };
                    const IconComponent = acaoMeta.icon;
                    const date = new Date(log.dataHora);
                    
                    return (
                      <tr key={log.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              color: 'var(--c-accent)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              padding: '5px',
                              background: 'rgba(255,255,255,0.02)',
                              borderRadius: '4px',
                              border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                              <IconComponent size={13} />
                            </span>
                            <span className={`cms-badge ${acaoMeta.badge}`} style={{ fontWeight: '600' }}>
                              {acaoMeta.label}
                            </span>
                          </div>
                        </td>
                        <td>
                          {log.usuario ? (
                            <div>
                              <div style={{ fontWeight: '500', color: 'var(--c-text)' }}>{log.usuario.nome}</div>
                              <div style={{ fontSize: '10px', color: 'var(--c-secondary)' }}>{ROLE_LABELS[log.usuario.role] || log.usuario.role}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--c-muted)', fontStyle: 'italic', fontSize: '13px' }}>Sistema Externo / Anônimo</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--c-secondary)', fontSize: '13px' }}>
                          {log.entidade ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: '500', color: 'var(--c-text)' }}>{log.entidade}</span>
                              {log.entidadeId && <code style={{ fontSize: '10px', color: 'var(--c-muted)', fontFamily: 'var(--font-mono)' }}>ID: {log.entidadeId.slice(0, 8)}...</code>}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--c-muted)' }}>—</span>
                          )}
                        </td>
                        <td>
                          {log.rota ? (
                            <code style={{ fontSize: '11px', background: 'rgba(255,255,255,0.03)', padding: '3px 6px', borderRadius: '4px', color: 'var(--c-secondary)', fontFamily: 'var(--font-mono)' }}>
                              {log.rota}
                            </code>
                          ) : (
                            <span style={{ color: 'var(--c-muted)' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--c-secondary)' }}>
                            {log.ip === '::1' || log.ip === '127.0.0.1' ? 'Localhost' : log.ip}
                          </span>
                        </td>
                        <td style={{ color: 'var(--c-secondary)', fontSize: '12.5px', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} style={{ color: 'var(--c-muted)' }} />
                            <span>{date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {log.detalhes && Object.keys(log.detalhes).length > 0 ? (
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="cms-btn cms-btn-secondary cms-btn-sm"
                              style={{ padding: '4px 8px' }}
                            >
                              Analisar
                            </button>
                          ) : (
                            <span style={{ color: 'var(--c-muted)', fontSize: '12px' }}>Vazio</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="cms-pagination">
            <span className="cms-pagination-info">
              Página {page} de {totalPages} ({filteredLogs.length} eventos filtrados)
            </span>
            <div className="cms-pagination-btns">
              <button 
                className="cms-page-btn" 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ChevronLeft size={14} />
                <span>Anterior</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button 
                  key={p} 
                  className={`cms-page-btn${p === page ? ' active' : ''}`} 
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button 
                className="cms-page-btn" 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Próxima</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Premium de Detalhes do Log */}
      {selectedLog && (
        <div className="cms-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="cms-modal" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} style={{ color: 'var(--c-accent)' }} />
                <span>Parâmetros de Auditoria</span>
              </span>
              <button className="cms-modal-close" onClick={() => setSelectedLog(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cms-modal-body">
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Ação Executada</div>
                <div className="cms-badge cms-badge-orange" style={{ fontSize: '12px' }}>
                  {ACAO_INFO[selectedLog.acao]?.label || selectedLog.acao}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Responsável</div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--c-text)' }}>
                    {selectedLog.usuario?.nome || 'Sistema (Automático)'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Endereço IP</div>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--c-text)' }}>
                    {selectedLog.ip}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Metadados do Payload (JSON)</div>
                <pre style={{
                  background: '#0B0B0F', 
                  borderRadius: '6px', 
                  padding: '14px',
                  fontSize: '12px', 
                  overflowX: 'auto', 
                  color: '#10b981', 
                  lineHeight: '1.5',
                  border: '1px solid var(--c-border)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {JSON.stringify(selectedLog.detalhes, null, 2)}
                </pre>
              </div>
            </div>
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-primary" onClick={() => setSelectedLog(null)}>
                Fechar Análise
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

