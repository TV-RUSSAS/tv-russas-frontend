'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  FolderTree,
  TrendingUp,
  Sparkles,
  Link2,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

interface Categoria {
  id: string;
  nome: string;
  slug: string;
  _count: { noticias: number };
}

export default function CategoriasAdmin() {
  const { authFetch } = useAdminAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await authFetch('/admin/categorias');
      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    let active = true;
    const fetchInit = async () => {
      try {
        const res = await authFetch('/admin/categorias');
        const data = await res.json();
        if (active) {
          setCategorias(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (active && err instanceof Error) setError(err.message);
      }
    };
    fetchInit();
    return () => { active = false; };
  }, [authFetch]);

  const openCreate = () => {
    setModalMode('create'); setNome(''); setEditingId(null); setModalOpen(true);
  };

  const openEdit = (cat: Categoria) => {
    setModalMode('edit'); setNome(cat.nome); setEditingId(cat.id); setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = modalMode === 'edit' ? `/admin/categorias/${editingId}` : '/admin/categorias';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar.');
      setSuccess(modalMode === 'create' ? 'Categoria criada com sucesso!' : 'Categoria atualizada com sucesso!');
      setModalOpen(false);
      setLoading(true);
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await authFetch(`/admin/categorias/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSuccess('Categoria excluída com sucesso!');
      setConfirmDeleteId(null);
      setLoading(true);
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // KPIs calculados dinamicamente
  const kpis = useMemo(() => {
    if (categorias.length === 0) {
      return { total: 0, maisUsada: '-', ultimaCriada: '-', totalNoticias: 0 };
    }
    const total = categorias.length;
    const maisUsadaCat = [...categorias].sort((a, b) => b._count.noticias - a._count.noticias)[0];
    const maisUsada = maisUsadaCat && maisUsadaCat._count.noticias > 0 ? maisUsadaCat.nome : '-';
    // Pega a última na ordem em que o backend entrega (geralmente mais recente primeiro ou por id)
    const ultimaCriada = categorias[0]?.nome || '-';
    const totalNoticias = categorias.reduce((sum, c) => sum + c._count.noticias, 0);

    return { total, maisUsada, ultimaCriada, totalNoticias };
  }, [categorias]);

  // Filtragem
  const filteredCategorias = useMemo(() => {
    return categorias.filter(c =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categorias, searchTerm]);

  const catParaExcluir = categorias.find(c => c.id === confirmDeleteId);

  return (
    <>
      {/* Cabeçalho Editorial Rico */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Categorias</h2>
          <p className="cms-page-subtitle">Gerencie as categorias e editorias do portal de notícias da TV Russas</p>
        </div>
        <button className="cms-btn cms-btn-primary" onClick={openCreate}>
          <Plus size={16} />
          <span>Nova Categoria</span>
        </button>
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

      {/* Cards de KPIs no Topo */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: 'var(--c-accent)' }}>
            <FolderTree size={16} />
          </div>
          <span className="cms-stat-value">{kpis.total}</span>
          <span className="cms-stat-label">Total de Categorias</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#10b981' }}>
            <TrendingUp size={16} />
          </div>
          <span className="cms-stat-value" style={{ fontSize: '20px', padding: '4px 0' }}>{kpis.maisUsada}</span>
          <span className="cms-stat-label">Mais Utilizada</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#f59e0b' }}>
            <Sparkles size={16} />
          </div>
          <span className="cms-stat-value" style={{ fontSize: '20px', padding: '4px 0' }}>{kpis.ultimaCriada}</span>
          <span className="cms-stat-label">Última Criada</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#818cf8' }}>
            <Link2 size={16} />
          </div>
          <span className="cms-stat-value">{kpis.totalNoticias}</span>
          <span className="cms-stat-label">Notícias Vinculadas</span>
        </div>
      </div>

      {/* Barra de Ferramentas / Busca */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="cms-search-wrap" style={{ flex: 1 }}>
          <Search className="cms-search-icon" size={15} />
          <input
            type="text"
            className="cms-search-input"
            placeholder="Pesquisar por nome ou slug..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <FolderTree size={16} style={{ color: 'var(--c-accent)' }} />
            Lista de Categorias
          </span>
        </div>
        
        {loading ? (
          <div className="cms-loading">
            <div className="cms-spinner" /> 
            <span>Carregando categorias...</span>
          </div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Nome</th>
                <th style={{ width: '30%' }}>Slug</th>
                <th style={{ width: '15%', textAlign: 'center' }}>Notícias</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategorias.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: 'var(--c-secondary)' }}>
                    Nenhuma categoria encontrada
                  </td>
                </tr>
              ) : (
                filteredCategorias.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: '600', color: 'var(--c-text)', verticalAlign: 'middle' }}>
                      {cat.nome}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <code style={{ 
                        fontSize: '11px', 
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(255, 255, 255, 0.04)', 
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        color: 'var(--c-secondary)'
                      }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <span className="cms-badge cms-badge-blue" style={{ fontWeight: '600' }}>
                        {cat._count.noticias} matérias
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          className="cms-btn cms-btn-secondary cms-btn-sm" 
                          onClick={() => openEdit(cat)}
                          title="Editar Categoria"
                        >
                          <Edit size={13} />
                          <span>Editar</span>
                        </button>
                        <button 
                          className="cms-btn cms-btn-danger cms-btn-sm" 
                          onClick={() => setConfirmDeleteId(cat.id)}
                          title="Excluir Categoria"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div className="cms-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="cms-modal" onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderTree size={16} style={{ color: 'var(--c-accent)' }} />
                {modalMode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
              </span>
              <button className="cms-modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="cms-modal-body">
                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Nome da Categoria <span>*</span></label>
                  <input
                    className="cms-input"
                    required
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex: Política, Esporte, Região..."
                    autoFocus
                  />
                  <span className="cms-form-hint">O slug identificador na URL será gerado automaticamente.</span>
                </div>
              </div>
              <div className="cms-modal-footer">
                <button type="button" className="cms-btn cms-btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="cms-btn cms-btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="cms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> 
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {confirmDeleteId && (
        <div className="cms-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="cms-modal" onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                Excluir Categoria
              </span>
              <button className="cms-modal-close" onClick={() => setConfirmDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cms-modal-body">
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Deseja realmente excluir a categoria <strong style={{ color: 'var(--c-accent)' }}>&quot;{catParaExcluir?.nome}&quot;</strong>?
              </p>
              {catParaExcluir && catParaExcluir._count.noticias > 0 && (
                <div className="cms-alert cms-alert-error" style={{ marginTop: '14px' }}>
                  <AlertTriangle size={16} />
                  <span>Esta categoria possui {catParaExcluir._count.noticias} notícia(s) associada(s) e não pode ser removida para manter a integridade dos dados.</span>
                </div>
              )}
            </div>
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button
                className="cms-btn cms-btn-danger"
                disabled={deleting || (catParaExcluir?._count.noticias ?? 0) > 0}
                onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              >
                {deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
