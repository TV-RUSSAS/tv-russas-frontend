'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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

const ACAO_LABELS: Record<string, { label: string; badge: string }> = {
  LOGIN_SUCESSO:      { label: '🟢 Login bem-sucedido', badge: 'cms-badge-green' },
  LOGIN_FALHA:        { label: '🔴 Tentativa de login falhou', badge: 'cms-badge-red' },
  LOGOUT:             { label: '🚪 Logout', badge: 'cms-badge-gray' },
  NOTICIA_CRIADA:     { label: '📰 Notícia criada', badge: 'cms-badge-blue' },
  NOTICIA_ATUALIZADA: { label: '✏️ Notícia editada', badge: 'cms-badge-yellow' },
  NOTICIA_EXCLUIDA:   { label: '🗑️ Notícia excluída', badge: 'cms-badge-red' },
  USUARIO_CRIADO:     { label: '👤 Usuário criado', badge: 'cms-badge-blue' },
  USUARIO_ATUALIZADO: { label: '🔄 Usuário atualizado', badge: 'cms-badge-yellow' },
  USUARIO_EXCLUIDO:   { label: '❌ Usuário excluído', badge: 'cms-badge-red' },
  CATEGORIA_CRIADA:   { label: '🏷️ Categoria criada', badge: 'cms-badge-blue' },
  CATEGORIA_ATUALIZADA:{ label: '🏷️ Categoria editada', badge: 'cms-badge-yellow' },
  CATEGORIA_EXCLUIDA: { label: '🏷️ Categoria excluída', badge: 'cms-badge-red' },
  COLUNISTA_CRIADO:   { label: '✍️ Colunista criado', badge: 'cms-badge-blue' },
  COLUNISTA_ATUALIZADO:{ label: '✍️ Colunista atualizado', badge: 'cms-badge-yellow' },
  COLUNISTA_EXCLUIDO: { label: '✍️ Colunista excluído', badge: 'cms-badge-red' },
};

export default function AuditoriaAdmin() {
  const { authFetch } = useAdminAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroAcao, setFiltroAcao] = useState('');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filtroAcao) params.set('acao', filtroAcao);
      const res = await authFetch(`/admin/audit-logs?${params}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, filtroAcao]);

  useEffect(() => {
    let active = true;
    const fetchInit = async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (filtroAcao) params.set('acao', filtroAcao);
        const res = await authFetch(`/admin/audit-logs?${params}`);
        const data = await res.json();
        if (active) {
          setLogs(Array.isArray(data) ? data : data.logs || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) setLoading(false);
      }
    };
    fetchInit();
    return () => { active = false; };
  }, [authFetch, page, filtroAcao]);

  return (
    <>
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Logs de Auditoria</h2>
          <p className="cms-page-subtitle">Registro completo de todas as ações realizadas no sistema</p>
        </div>
      </div>

      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title">🔍 Histórico de Eventos</span>
          <select
            className="cms-select"
            style={{ width: '220px', padding: '8px 12px' }}
            value={filtroAcao}
            onChange={e => { setLoading(true); setFiltroAcao(e.target.value); setPage(1); }}
          >
            <option value="">Todos os eventos</option>
            {Object.keys(ACAO_LABELS).map(k => (
              <option key={k} value={k}>{ACAO_LABELS[k].label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="cms-loading"><div className="cms-spinner" /> Carregando logs...</div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th>Ação</th>
                <th>Usuário</th>
                <th>Entidade</th>
                <th>Rota</th>
                <th>IP</th>
                <th>Data/Hora</th>
                <th style={{ textAlign: 'right' }}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#8b98b0' }}>Nenhum log encontrado</td></tr>
              ) : logs.map(log => {
                const acaoInfo = ACAO_LABELS[log.acao] || { label: log.acao, badge: 'cms-badge-gray' };
                return (
                  <tr key={log.id}>
                    <td><span className={`cms-badge ${acaoInfo.badge}`}>{acaoInfo.label}</span></td>
                    <td style={{ fontWeight: '500' }}>
                      {log.usuario?.nome || <span style={{ color: '#8b98b0' }}>Anônimo</span>}
                    </td>
                    <td style={{ color: '#8b98b0', fontSize: '13px' }}>
                      {log.entidade ? `${log.entidade}` : '—'}
                    </td>
                    <td>
                      {log.rota && (
                        <code style={{ fontSize: '11px', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                          {log.rota}
                        </code>
                      )}
                    </td>
                    <td>
                      <code style={{ fontSize: '11px', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                        {log.ip}
                      </code>
                    </td>
                    <td style={{ color: '#8b98b0', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(log.dataHora).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {log.detalhes && Object.keys(log.detalhes).length > 0 && (
                        <button className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => setSelectedLog(log)}>
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="cms-pagination">
            <span className="cms-pagination-info">{total} registros no total</span>
            <div className="cms-pagination-btns">
              <button className="cms-page-btn" disabled={page === 1} onClick={() => { setLoading(true); setPage(p => p - 1); }}>← Anterior</button>
              <button className={`cms-page-btn active`}>{page}</button>
              <button className="cms-page-btn" disabled={page === totalPages} onClick={() => { setLoading(true); setPage(p => p + 1); }}>Próxima →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedLog && (
        <div className="cms-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="cms-modal" onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title">Detalhes do Log</span>
              <button className="cms-modal-close" onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className="cms-modal-body">
              <pre style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '16px',
                fontSize: '13px', overflowX: 'auto', color: '#e2e8f0', lineHeight: '1.6'
              }}>
                {JSON.stringify(selectedLog.detalhes, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
