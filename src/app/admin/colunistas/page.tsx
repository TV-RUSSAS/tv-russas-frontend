'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Colunista {
  id: string;
  nome: string;
  bio: string | null;
  fotoUrl: string;
  _count: { noticias: number };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ColunistasAdmin() {
  const { authFetch } = useAdminAuth();
  const [colunistas, setColunistas] = useState<Colunista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [bio, setBio] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await authFetch('/admin/colunistas');
      setColunistas(await res.json());
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
        const res = await authFetch('/admin/colunistas');
        const data = await res.json();
        if (active) {
          setColunistas(data);
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
    setModalMode('create'); setNome(''); setBio(''); setFoto(null); setFotoPreview(null); setEditingId(null); setModalOpen(true);
  };

  const openEdit = (col: Colunista) => {
    setModalMode('edit'); setNome(col.nome); setBio(col.bio || '');
    setFoto(null); setFotoPreview(`${API_BASE_URL}${col.fotoUrl}`);
    setEditingId(col.id); setModalOpen(true);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    const reader = new FileReader();
    reader.onload = ev => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('nome', nome);
      if (bio) fd.append('bio', bio);
      if (foto) fd.append('foto', foto);

      const url = modalMode === 'edit' ? `/admin/colunistas/${editingId}` : '/admin/colunistas';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api${url}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar.');
      setSuccess(modalMode === 'create' ? 'Colunista criado!' : 'Colunista atualizado!');
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
      const res = await authFetch(`/admin/colunistas/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSuccess('Colunista excluído!');
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

  const colParaExcluir = colunistas.find(c => c.id === confirmDeleteId);

  return (
    <>
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Colunistas</h2>
          <p className="cms-page-subtitle">{colunistas.length} colunistas cadastrados</p>
        </div>
        <button className="cms-btn cms-btn-primary" onClick={openCreate}>+ Novo Colunista</button>
      </div>

      {error && <div className="cms-alert cms-alert-error">⚠️ {error}</div>}
      {success && <div className="cms-alert cms-alert-success">✅ {success}</div>}

      {loading ? (
        <div className="cms-loading"><div className="cms-spinner" /> Carregando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {colunistas.length === 0 ? (
            <p style={{ color: '#8b98b0', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
              Nenhum colunista cadastrado
            </p>
          ) : colunistas.map(col => (
            <div key={col.id} className="cms-stat-card" style={{ flexDirection: 'column', gap: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={col.fotoUrl.startsWith('http') ? col.fotoUrl : `${API_BASE_URL}${col.fotoUrl}`}
                  alt={col.nome}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                  onError={e => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(col.nome) + '&background=1e2535&color=e2e8f0'; }}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '2px' }}>{col.nome}</div>
                  <span className="cms-badge cms-badge-blue">{col._count.noticias} artigos</span>
                </div>
              </div>
              {col.bio && (
                <p style={{ fontSize: '13px', color: '#8b98b0', lineHeight: '1.5', margin: 0 }}>
                  {col.bio.length > 80 ? col.bio.slice(0, 80) + '...' : col.bio}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button className="cms-btn cms-btn-secondary cms-btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(col)}>✏️ Editar</button>
                <button className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => setConfirmDeleteId(col.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div className="cms-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="cms-modal" onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title">{modalMode === 'create' ? '+ Novo Colunista' : '✏️ Editar Colunista'}</span>
              <button className="cms-modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="cms-modal-body">
                <div className="cms-form-group">
                  <label className="cms-label">Nome <span>*</span></label>
                  <input className="cms-input" required value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do colunista" autoFocus />
                </div>
                <div className="cms-form-group">
                  <label className="cms-label">Bio / Descrição</label>
                  <textarea className="cms-textarea" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Pequena biografia do colunista..." />
                </div>
                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Foto de Perfil</label>
                  {fotoPreview && (
                    <div style={{ marginBottom: '10px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fotoPreview} alt="preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />
                  <button type="button" className="cms-btn cms-btn-secondary" onClick={() => fileRef.current?.click()}>
                    📷 {fotoPreview ? 'Trocar foto' : 'Selecionar foto'}
                  </button>
                </div>
              </div>
              <div className="cms-modal-footer">
                <button type="button" className="cms-btn cms-btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="cms-btn cms-btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : '💾 Salvar'}
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
              <span className="cms-modal-title">⚠️ Excluir Colunista</span>
              <button className="cms-modal-close" onClick={() => setConfirmDeleteId(null)}>×</button>
            </div>
            <div className="cms-modal-body">
              <p>Deseja excluir o colunista <strong style={{ color: '#ff5722' }}>&quot;{colParaExcluir?.nome}&quot;</strong>?</p>
              <p style={{ marginTop: '8px', color: '#8b98b0', fontSize: '13px' }}>Os artigos vinculados não serão excluídos, apenas o vínculo será removido.</p>
            </div>
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button className="cms-btn cms-btn-danger" disabled={deleting} onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}>
                {deleting ? 'Excluindo...' : '🗑️ Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
