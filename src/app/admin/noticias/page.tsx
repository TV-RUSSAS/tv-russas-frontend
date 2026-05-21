'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  views: number;
  publicadoEm: string;
  categoria: { nome: string };
  colunista?: { nome: string } | null;
  usuario?: { nome: string } | null;
  featured: boolean;
  breaking: boolean;
}

interface Categoria { id: string; nome: string; }
interface Paginacao { total: number; totalPages: number; page: number; }

export default function NoticiasAdmin() {
  const { authFetch, user } = useAdminAuth();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao>({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canDelete = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const loadNoticias = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (busca) params.set('busca', busca);
      if (filtroCategoria) params.set('categoria', filtroCategoria);

      const res = await authFetch(`/admin/noticias?${params}`);
      const data = await res.json();
      setNoticias(data.noticias || []);
      setPaginacao({ total: data.total, totalPages: data.totalPages, page: data.page });
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, busca, filtroCategoria]);

  useEffect(() => {
    let active = true;
    const fetchInit = async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: '15' });
        if (busca) params.set('busca', busca);
        if (filtroCategoria) params.set('categoria', filtroCategoria);

        const res = await authFetch(`/admin/noticias?${params}`);
        const data = await res.json();
        if (active) {
          setNoticias(data.noticias || []);
          setPaginacao({ total: data.total, totalPages: data.totalPages, page: data.page });
          setLoading(false);
        }
      } catch (err) {
        if (active && err instanceof Error) setError(err.message);
      }
    };
    fetchInit();
    return () => { active = false; };
  }, [authFetch, page, busca, filtroCategoria]);

  useEffect(() => {
    let active = true;
    authFetch('/admin/categorias')
      .then(r => r.json())
      .then(data => { if (active) setCategorias(data); })
      .catch(() => {});
    return () => { active = false; };
  }, [authFetch]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await authFetch(`/admin/noticias/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir.');
      }
      setSuccess('Notícia excluída com sucesso!');
      setConfirmDeleteId(null);
      setLoading(true);
      loadNoticias();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const noticiaParaExcluir = noticias.find(n => n.id === confirmDeleteId);

  return (
    <>
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Notícias</h2>
          <p className="cms-page-subtitle">{paginacao.total} notícias no total</p>
        </div>
        <Link href="/admin/noticias/nova" className="cms-btn cms-btn-primary">
          <i className="fas fa-plus" style={{ fontSize: '11px', marginRight: '6px' }} /> Nova Notícia
        </Link>
      </div>

      {error && (
        <div className="cms-alert cms-alert-error">
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '12px', marginRight: '6px' }} /> {error}
        </div>
      )}
      {success && (
        <div className="cms-alert cms-alert-success">
          <i className="fas fa-check-circle" style={{ fontSize: '12px', marginRight: '6px' }} /> {success}
        </div>
      )}

      <div className="cms-table-card">
        {/* Filtros */}
        <div className="cms-table-header" style={{ gap: '12px' }}>
          <span className="cms-table-title">Lista de Notícias</span>
          <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <div className="cms-search-wrap" style={{ width: '220px' }}>
              <i className="fas fa-search cms-search-icon" />
              <input
                className="cms-search-input"
                placeholder="Buscar por título..."
                value={busca}
                onChange={e => { setBusca(e.target.value); setPage(1); setLoading(true); }}
              />
            </div>
            <select
              className="cms-select"
              style={{ width: '160px', padding: '9px 12px' }}
              value={filtroCategoria}
              onChange={e => { setFiltroCategoria(e.target.value); setPage(1); setLoading(true); }}
            >
              <option value="">Todas categorias</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="cms-loading"><div className="cms-spinner" /> Carregando notícias...</div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Autor</th>
                <th>Data</th>
                <th style={{ textAlign: 'right' }}>Views</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {noticias.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#8b98b0' }}>Nenhuma notícia encontrada</td></tr>
              ) : noticias.map(n => (
                <tr key={n.id}>
                  <td>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '15.5px',
                      fontWeight: '500',
                      lineHeight: '1.4',
                      color: 'var(--c-text)',
                      marginBottom: '4px'
                    }}>
                      {n.titulo}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {n.featured && <span className="cms-badge cms-badge-yellow">Destaque</span>}
                      {n.breaking && <span className="cms-badge cms-badge-red">Urgente</span>}
                    </div>
                  </td>
                  <td>
                    <span className="cms-badge cms-badge-gray">{n.categoria.nome}</span>
                  </td>
                  <td style={{ color: 'var(--c-secondary)', fontSize: '13px' }}>
                    {n.colunista?.nome || n.usuario?.nome || '—'}
                  </td>
                  <td style={{ color: 'var(--c-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {new Date(n.publicadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    fontWeight: '500',
                    color: 'var(--c-secondary)',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {n.views.toLocaleString('pt-BR')}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="cms-badge cms-badge-green">Publicada</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <Link
                        href={`/admin/noticias/editar/${n.id}`}
                        className="cms-btn cms-btn-secondary cms-btn-sm"
                      >
                        <i className="far fa-edit" style={{ fontSize: '11px', marginRight: '4px' }} /> Editar
                      </Link>
                      {canDelete && (
                        <button
                          className="cms-btn cms-btn-danger cms-btn-sm"
                          onClick={() => setConfirmDeleteId(n.id)}
                          title="Excluir"
                        >
                          <i className="far fa-trash-alt" style={{ fontSize: '12px' }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginação */}
        {paginacao.totalPages > 1 && (
          <div className="cms-pagination">
            <span className="cms-pagination-info">
              Exibindo {noticias.length} de {paginacao.total} notícias
            </span>
            <div className="cms-pagination-btns">
              <button className="cms-page-btn" disabled={page === 1} onClick={() => { setPage(p => p - 1); setLoading(true); }}>← Anterior</button>
              {Array.from({ length: paginacao.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`cms-page-btn${p === page ? ' active' : ''}`} onClick={() => { setPage(p); setLoading(true); }}>{p}</button>
              ))}
              <button className="cms-page-btn" disabled={page === paginacao.totalPages} onClick={() => { setPage(p => p + 1); setLoading(true); }}>Próxima →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {confirmDeleteId && (
        <div className="cms-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="cms-modal" onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title">Confirmar Exclusão</span>
              <button className="cms-modal-close" onClick={() => setConfirmDeleteId(null)}>×</button>
            </div>
            <div className="cms-modal-body">
              <p style={{ marginBottom: '12px', lineHeight: '1.6', color: 'var(--c-secondary)' }}>
                Você está prestes a excluir permanentemente a notícia:
              </p>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '16px',
                fontWeight: '500',
                color: 'var(--c-text)',
                lineHeight: '1.4',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderLeft: '2px solid var(--c-accent)',
                borderRadius: '0 4px 4px 0'
              }}>
                &quot;{noticiaParaExcluir?.titulo}&quot;
              </p>
              <p style={{ marginTop: '14px', color: 'var(--c-muted)', fontSize: '12px' }}>
                Esta ação não pode ser desfeita. O log de auditoria correspondente será registrado.
              </p>
            </div>
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                Cancelar
              </button>
              <button
                className="cms-btn cms-btn-danger"
                disabled={deletingId === confirmDeleteId}
                onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              >
                {deletingId === confirmDeleteId ? (
                  <><div className="cms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Excluindo...</>
                ) : (
                  <><i className="far fa-trash-alt" style={{ fontSize: '12px', marginRight: '6px' }} /> Excluir Definitivamente</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
