'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { TEXTS } from '@/constants/texts';
import {
  Newspaper,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  Star,
  Calendar,
  User,
  FolderOpen
} from 'lucide-react';

interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  views: number;
  publicadoEm: string;
  capaUrl?: string | null;
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
  
  // Estados da Listagem e Filtros
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao>({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroDestaque, setFiltroDestaque] = useState('all'); // 'all', 'featured'
  const [page, setPage] = useState(1);
  
  // Alertas
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados dos KPIs Analíticos Reais
  const [totalViewsPortal, setTotalViewsPortal] = useState<number>(0);
  const [totalNoticiasPortal, setTotalNoticiasPortal] = useState<number>(0);
  const [totalDestaquesPortal, setTotalDestaquesPortal] = useState<number>(0);

  // IDs das 6 notícias mais recentes do portal para badge preciso de "Última Notícia"
  const [ultimasNoticiasIds, setUltimasNoticiasIds] = useState<string[]>([]);

  const canDelete = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
 
  const getCapaUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${apiBaseUrl}${cleanUrl}`;
  };
 
  const loadNoticias = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (busca) params.set('busca', busca);
      if (filtroCategoria) params.set('categoria', filtroCategoria);
      if (filtroDestaque === 'featured') params.set('featured', 'true');
      else if (filtroDestaque === 'regular') params.set('featured', 'false');
 
      const res = await authFetch(`/admin/noticias?${params}`);
      const data = await res.json();
      setNoticias(data.noticias || []);
      setPaginacao({ total: data.total, totalPages: data.totalPages, page: data.page });
      if (data.stats) {
        setTotalViewsPortal(data.stats.totalViews ?? 0);
        setTotalNoticiasPortal(data.stats.totalNoticias ?? 0);
        setTotalDestaquesPortal(data.stats.totalDestaques ?? 0);
      }
      if (page === 1 && !busca && !filtroCategoria && filtroDestaque === 'all') {
        const ids = (data.noticias || []).slice(0, 6).map((n: Noticia) => n.id);
        setUltimasNoticiasIds(ids);
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, busca, filtroCategoria, filtroDestaque]);
 
  // Inicialização e atualização de dados
  useEffect(() => {
    let active = true;
    
    const fetchInit = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '15' });
        if (busca) params.set('busca', busca);
        if (filtroCategoria) params.set('categoria', filtroCategoria);
        if (filtroDestaque === 'featured') params.set('featured', 'true');
        else if (filtroDestaque === 'regular') params.set('featured', 'false');
 
        const res = await authFetch(`/admin/noticias?${params}`);
        const data = await res.json();
        if (active) {
          setNoticias(data.noticias || []);
          setPaginacao({ total: data.total, totalPages: data.totalPages, page: data.page });
          if (data.stats) {
            setTotalViewsPortal(data.stats.totalViews ?? 0);
            setTotalNoticiasPortal(data.stats.totalNoticias ?? 0);
            setTotalDestaquesPortal(data.stats.totalDestaques ?? 0);
          }
          if (page === 1 && !busca && !filtroCategoria && filtroDestaque === 'all') {
            const ids = (data.noticias || []).slice(0, 6).map((n: Noticia) => n.id);
            setUltimasNoticiasIds(ids);
          }
          setLoading(false);
        }
      } catch (err) {
        if (active && err instanceof Error) setError(err.message);
        if (active) setLoading(false);
      }
    };
 
    fetchInit();
    return () => { active = false; };
  }, [authFetch, page, busca, filtroCategoria, filtroDestaque]);
 
  // Carrega lista de categorias para o dropdown de filtros
  useEffect(() => {
    let active = true;
    authFetch('/admin/categorias')
      .then(r => r.json())
      .then(data => { if (active) setCategorias(data); })
      .catch(() => {});
    return () => { active = false; };
  }, [authFetch]);
 
  // Handler para exclusão
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError('');
    try {
      const res = await authFetch(`/admin/noticias/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir.');
      }
      setSuccess('Notícia removida com sucesso das bases editoriais!');
      setConfirmDeleteId(null);
      setLoading(true);
      
      await loadNoticias();
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Média de visualizações por matéria editorial
  const mediaViewsPorMateriaFormatted = useMemo(() => {
    if (totalNoticiasPortal === 0) return '0';
    const media = totalViewsPortal / totalNoticiasPortal;
    return media >= 10 
      ? Math.round(media).toLocaleString('pt-BR') 
      : media.toFixed(1).replace('.', ',');
  }, [totalViewsPortal, totalNoticiasPortal]);

  const noticiaParaExcluir = noticias.find(n => n.id === confirmDeleteId);

  return (
    <>
      {/* Cabeçalho Editorial Rico */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Newspaper size={24} style={{ color: 'var(--c-accent)' }} />
            {TEXTS.admin.news}
          </h2>
          <p className="cms-page-subtitle">{TEXTS.admin.manageNewsDescription}</p>
        </div>
        <Link href="/admin/noticias/nova" className="cms-btn cms-btn-primary">
          <Plus size={16} />
          <span>{TEXTS.admin.newNews}</span>
        </Link>
      </div>

      {/* Alertas */}
      {error && (
        <div className="cms-alert cms-alert-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="cms-alert cms-alert-success">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Grid de KPIs Premium no Topo */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: 'var(--c-accent)' }}>
            <Newspaper size={16} />
          </div>
          <span className="cms-stat-value">
            {totalNoticiasPortal > 0 ? totalNoticiasPortal.toLocaleString('pt-BR') : paginacao.total.toLocaleString('pt-BR')}
          </span>
          <span className="cms-stat-label">{TEXTS.admin.totalPublished}</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#f59e0b' }}>
            <Star size={16} />
          </div>
          <span className="cms-stat-value">
            {totalDestaquesPortal.toLocaleString('pt-BR')}
          </span>
          <span className="cms-stat-label">{TEXTS.admin.activeHighlights}</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#10b981' }}>
            <Eye size={16} />
          </div>
          <span className="cms-stat-value">
            {totalViewsPortal > 0 ? totalViewsPortal.toLocaleString('pt-BR') : '—'}
          </span>
          <span className="cms-stat-label">{TEXTS.admin.totalViewsMetric}</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#818cf8' }}>
            <Eye size={16} />
          </div>
          <span className="cms-stat-value">
            {mediaViewsPorMateriaFormatted !== '0' ? mediaViewsPorMateriaFormatted : '0'}
          </span>
          <span className="cms-stat-label">{"Média por Matéria"}</span>
        </div>
      </div>

      {/* Painel de Filtros e Busca */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="cms-search-wrap" style={{ flex: 1, minWidth: '240px' }}>
          <Search className="cms-search-icon" size={15} />
          <input
            type="text"
            className="cms-search-input"
            placeholder={TEXTS.actions.search + " notícias..."}
            value={busca}
            onChange={e => { setBusca(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="cms-select"
          style={{ width: '180px', padding: '9px 12px' }}
          value={filtroCategoria}
          onChange={e => { setFiltroCategoria(e.target.value); setPage(1); }}
        >
          <option value="">{TEXTS.admin.allCategoriesFilter}</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <select
          className="cms-select"
          style={{ width: '220px', padding: '9px 12px' }}
          value={filtroDestaque}
          onChange={e => { setFiltroDestaque(e.target.value); setPage(1); }}
        >
          <option value="all">{TEXTS.admin.allClassificationsFilter}</option>
          <option value="featured">{TEXTS.admin.activeHighlightsFilter}</option>
          <option value="regular">{TEXTS.admin.onlyLatestFilter}</option>
        </select>
      </div>

      {/* Cartão de Tabela Notion-Style */}
      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Newspaper size={16} style={{ color: 'var(--c-accent)' }} />
            {"Lista de Matérias"}
          </span>
          <span className="cms-badge cms-badge-gray" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {paginacao.total} {"publicações"}
          </span>
        </div>

        {loading ? (
          <div className="cms-loading">
            <div className="cms-spinner" />
            <span>{TEXTS.admin.processingEditorialData}</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cms-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>{TEXTS.admin.coverLabel}</th>
                  <th>{"Título"}</th>
                  <th>{TEXTS.admin.categoryLabel}</th>
                  <th>{TEXTS.admin.authorLabel}</th>
                  <th style={{ width: '110px' }}>{TEXTS.admin.dateLabel}</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>{TEXTS.admin.viewsLabel}</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>{TEXTS.admin.statusLabel}</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>{"Ações"}</th>
                </tr>
              </thead>
              <tbody>
                {noticias.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--c-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <FolderOpen size={32} style={{ color: 'rgba(255,255,255,0.06)' }} />
                        <span>{TEXTS.admin.noNewsMatchingFilters}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  noticias.map(n => (
                    <tr key={n.id}>
                      {/* Thumbnail Capa */}
                      <td style={{ verticalAlign: 'middle' }}>
                        {n.capaUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getCapaUrl(n.capaUrl)}
                            alt=""
                            style={{
                              width: '56px',
                              height: '38px',
                              borderRadius: '4px',
                              objectFit: 'cover',
                              border: '1px solid rgba(255,255,255,0.06)',
                              background: '#181a25'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '56px',
                            height: '38px',
                            borderRadius: '4px',
                            background: '#181a25',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--c-muted)'
                          }}>
                            <Newspaper size={14} />
                          </div>
                        )}
                      </td>
                      
                      {/* Título com Badges de Destaque */}
                      <td>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '500',
                          lineHeight: '1.4',
                          color: 'var(--c-text)',
                          maxWidth: '480px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {n.titulo}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {n.featured ? (
                            <span className="cms-badge cms-badge-yellow" style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                              <Star size={10} fill="currentColor" /> {"Destaque"}
                            </span>
                          ) : ultimasNoticiasIds.includes(n.id) ? (
                            <span className="cms-badge cms-badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(59, 130, 246, 0.08)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                              {"Última Notícia"}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Categoria */}
                      <td>
                        <span className="cms-badge cms-badge-gray">{n.categoria?.nome || 'Sem Categoria'}</span>
                      </td>

                      {/* Autor */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--c-secondary)', fontSize: '13px' }}>
                          <User size={13} style={{ opacity: 0.6 }} />
                          <span>{n.colunista?.nome || n.usuario?.nome || '—'}</span>
                        </div>
                      </td>

                      {/* Data de Publicação */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--c-secondary)', fontSize: '13px' }}>
                          <Calendar size={13} style={{ opacity: 0.6 }} />
                          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {new Date(n.publicadoEm).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>

                      {/* Visualizações com Fonte Tabular Mono */}
                      <td style={{
                        textAlign: 'right',
                        fontWeight: '500',
                        color: 'var(--c-text)',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        fontVariantNumeric: 'tabular-nums'
                      }}>
                        {n.views.toLocaleString('pt-BR')}
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="cms-badge cms-badge-green" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                          {TEXTS.admin.publishedStatus}
                        </span>
                      </td>

                      {/* Botões de Ação com Lucide */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Link
                            href={`/admin/noticias/editar/${n.id}`}
                            className="cms-btn cms-btn-secondary cms-btn-sm"
                            title="Editar Matéria"
                            style={{ height: '30px', padding: '0 10px', fontSize: '12px' }}
                          >
                            <Edit size={12} />
                            <span>{TEXTS.admin.editAction}</span>
                          </Link>
                          
                          {canDelete && (
                            <button
                              className="cms-btn cms-btn-danger cms-btn-sm"
                              onClick={() => setConfirmDeleteId(n.id)}
                              title="Excluir Matéria"
                              style={{ height: '30px', width: '30px', padding: 0, justifyContent: 'center' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação Notion-Style */}
        {paginacao.totalPages > 1 && (
          <div className="cms-pagination" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px' }}>
            <span className="cms-pagination-info" style={{ color: 'var(--c-muted)', fontSize: '13px' }}>
              {TEXTS.admin.displaying} <strong style={{ color: 'var(--c-text)', fontWeight: '500' }}>{noticias.length}</strong> de <strong style={{ color: 'var(--c-text)', fontWeight: '500' }}>{paginacao.total}</strong> {"publicações editoriais"}
            </span>
            <div className="cms-pagination-btns" style={{ display: 'flex', gap: '6px' }}>
              <button
                className="cms-page-btn"
                disabled={page === 1}
                onClick={() => { setPage(p => p - 1); }}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                {TEXTS.admin.previous}
              </button>
              
              {Array.from({ length: paginacao.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`cms-page-btn${p === page ? ' active' : ''}`}
                  onClick={() => { setPage(p); }}
                  style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    minWidth: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {p}
                </button>
              ))}
              
              <button
                className="cms-page-btn"
                disabled={page === paginacao.totalPages}
                onClick={() => { setPage(p => p + 1); }}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                {TEXTS.admin.next}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Editorial de Confirmação de Exclusão */}
      {confirmDeleteId && noticiaParaExcluir && (
        <div className="cms-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="cms-modal" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                <AlertTriangle size={18} />
                {"Confirmar Remoção"}
              </span>
              <button className="cms-modal-close" onClick={() => setConfirmDeleteId(null)}>
                <X size={16} />
              </button>
            </div>
            
            <div className="cms-modal-body">
              <p style={{ marginBottom: '14px', lineHeight: '1.6', color: 'var(--c-secondary)', fontSize: '14px' }}>
                {"Você está prestes a excluir definitivamente a publicação editorial abaixo:"}
              </p>
              
              <div style={{
                fontSize: '15px',
                fontWeight: '500',
                color: 'var(--c-text)',
                lineHeight: '1.4',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderLeft: '3px solid var(--c-accent)',
                borderRadius: '0 6px 6px 0',
                marginBottom: '16px'
              }}>
                {noticiaParaExcluir.titulo}
              </div>
              
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{"Visualizações"}</span>
                  <span style={{ fontSize: '14px', color: 'var(--c-text)', fontWeight: '500', fontFamily: 'monospace' }}>
                    {noticiaParaExcluir.views.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{"Categoria"}</span>
                  <span style={{ fontSize: '13px', color: 'var(--c-text)', fontWeight: '500' }}>
                    {noticiaParaExcluir.categoria?.nome}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{"Data"}</span>
                  <span style={{ fontSize: '13px', color: 'var(--c-text)', fontWeight: '500' }}>
                    {new Date(noticiaParaExcluir.publicadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <p style={{ marginTop: '16px', color: 'var(--c-muted)', fontSize: '12.5px', lineHeight: '1.5' }}>
                {"Esta exclusão limpará os registros de interações e visualizações. O evento de exclusão será registrado no painel de auditoria do sistema."}
              </p>
            </div>
            
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                {TEXTS.actions.cancel}
              </button>
              
              <button
                className="cms-btn cms-btn-danger"
                disabled={deletingId === confirmDeleteId}
                onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              >
                {deletingId === confirmDeleteId ? (
                  <>
                    <div className="cms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    <span>{"Processando..."}</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>{"Excluir Definitivamente"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
