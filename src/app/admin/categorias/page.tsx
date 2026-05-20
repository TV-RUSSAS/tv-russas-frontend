'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
      setCategorias(data);
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
          setCategorias(data);
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
      setSuccess(modalMode === 'create' ? 'Categoria criada!' : 'Categoria atualizada!');
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
      setSuccess('Categoria excluída!');
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

  const catParaExcluir = categorias.find(c => c.id === confirmDeleteId);

  return (
    <>
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Categorias</h2>
          <p className="cms-page-subtitle">{categorias.length} categorias cadastradas</p>
        </div>
        <button className="cms-btn cms-btn-primary" onClick={openCreate}>+ Nova Categoria</button>
      </div>

      {error && <div className="cms-alert cms-alert-error">⚠️ {error}</div>}
      {success && <div className="cms-alert cms-alert-success">✅ {success}</div>}

      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title">🏷️ Lista de Categorias</span>
        </div>
        {loading ? (
          <div className="cms-loading"><div className="cms-spinner" /> Carregando...</div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th style={{ textAlign: 'center' }}>Notícias</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#8b98b0' }}>Nenhuma categoria cadastrada</td></tr>
              ) : categorias.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: '600' }}>{cat.nome}</td>
                  <td><code style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{cat.slug}</code></td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="cms-badge cms-badge-blue">{cat._count.noticias} notícias</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => openEdit(cat)}>✏️ Editar</button>
                      <button className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => setConfirmDeleteId(cat.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div className="cms-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="cms-modal" onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title">{modalMode === 'create' ? '+ Nova Categoria' : '✏️ Editar Categoria'}</span>
              <button className="cms-modal-close" onClick={() => setModalOpen(false)}>×</button>
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
                    placeholder="Ex: Política, Esporte..."
                    autoFocus
                  />
                </div>
              </div>
              <div className="cms-modal-footer">
                <button type="button" className="cms-btn cms-btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="cms-btn cms-btn-primary" disabled={saving}>
                  {saving ? <><div className="cms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Salvando...</> : '💾 Salvar'}
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
              <span className="cms-modal-title">⚠️ Excluir Categoria</span>
              <button className="cms-modal-close" onClick={() => setConfirmDeleteId(null)}>×</button>
            </div>
            <div className="cms-modal-body">
              <p>Deseja excluir a categoria <strong style={{ color: '#ff5722' }}>&quot;{catParaExcluir?.nome}&quot;</strong>?</p>
              {catParaExcluir && catParaExcluir._count.noticias > 0 && (
                <div className="cms-alert cms-alert-error" style={{ marginTop: '12px' }}>
                  ⚠️ Esta categoria possui {catParaExcluir._count.noticias} notícia(s) e não pode ser excluída.
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
                {deleting ? 'Excluindo...' : '🗑️ Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
