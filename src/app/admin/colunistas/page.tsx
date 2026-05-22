'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  PenTool,
  Award,
  UserPlus,
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  Camera,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [bio, setBio] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirm delete
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
    setFoto(null); setFotoPreview(col.fotoUrl.startsWith('http') ? col.fotoUrl : `${API_BASE_URL}${col.fotoUrl}`);
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
      setSuccess(modalMode === 'create' ? 'Colunista cadastrado com sucesso!' : 'Colunista atualizado com sucesso!');
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
      setSuccess('Colunista excluído com sucesso!');
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
    if (colunistas.length === 0) {
      return { total: 0, maisAtivo: '-', ultimoCadastrado: '-', totalArtigos: 0 };
    }
    const total = colunistas.length;
    const maisAtivoCol = [...colunistas].sort((a, b) => b._count.noticias - a._count.noticias)[0];
    const maisAtivo = maisAtivoCol && maisAtivoCol._count.noticias > 0 ? maisAtivoCol.nome : '-';
    const ultimoCadastrado = colunistas[0]?.nome || '-';
    const totalArtigos = colunistas.reduce((sum, c) => sum + c._count.noticias, 0);

    return { total, maisAtivo, ultimoCadastrado, totalArtigos };
  }, [colunistas]);

  // Filtragem
  const filteredColunistas = useMemo(() => {
    return colunistas.filter(c =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.bio && c.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [colunistas, searchTerm]);

  const colParaExcluir = colunistas.find(c => c.id === confirmDeleteId);

  return (
    <>
      {/* Cabeçalho Editorial Rico */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Colunistas</h2>
          <p className="cms-page-subtitle">Gerencie o time de formadores de opinião e crônicas da TV Russas</p>
        </div>
        <button className="cms-btn cms-btn-primary" onClick={openCreate}>
          <Plus size={16} />
          <span>Novo Colunista</span>
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

      {/* Cards de KPIs */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: 'var(--c-accent)' }}>
            <PenTool size={16} />
          </div>
          <span className="cms-stat-value">{kpis.total}</span>
          <span className="cms-stat-label">Total de Escritores</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#10b981' }}>
            <Award size={16} />
          </div>
          <span className="cms-stat-value" style={{ fontSize: '18px', padding: '5px 0' }}>{kpis.maisAtivo}</span>
          <span className="cms-stat-label">Mais Ativo</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#f59e0b' }}>
            <UserPlus size={16} />
          </div>
          <span className="cms-stat-value" style={{ fontSize: '18px', padding: '5px 0' }}>{kpis.ultimoCadastrado}</span>
          <span className="cms-stat-label">Último Cadastrado</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#818cf8' }}>
            <BookOpen size={16} />
          </div>
          <span className="cms-stat-value">{kpis.totalArtigos}</span>
          <span className="cms-stat-label">Artigos Escritos</span>
        </div>
      </div>

      {/* Barra de Ferramentas / Busca */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="cms-search-wrap" style={{ flex: 1 }}>
          <Search className="cms-search-icon" size={15} />
          <input
            type="text"
            className="cms-search-input"
            placeholder="Pesquisar por nome ou biografia..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Colunistas Notion-Style */}
      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <PenTool size={16} style={{ color: 'var(--c-accent)' }} />
            Lista de Colunistas
          </span>
        </div>

        {loading ? (
          <div className="cms-loading">
            <div className="cms-spinner" />
            <span>Carregando colunistas...</span>
          </div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Colunista</th>
                <th style={{ width: '40%' }}>Biografia</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Artigos</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredColunistas.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: 'var(--c-secondary)' }}>
                    Nenhum colunista encontrado
                  </td>
                </tr>
              ) : (
                filteredColunistas.map(col => {
                  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(col.nome)}&background=1e2535&color=e2e8f0`;
                  const finalFotoUrl = col.fotoUrl.startsWith('http') ? col.fotoUrl : `${API_BASE_URL}${col.fotoUrl}`;

                  return (
                    <tr key={col.id}>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={finalFotoUrl}
                            alt={col.nome}
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              objectFit: 'cover', 
                              border: '1px solid rgba(255,255,255,0.06)',
                              flexShrink: 0 
                            }}
                            onError={e => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                          />
                          <div style={{ fontWeight: '600', color: 'var(--c-text)' }}>{col.nome}</div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle', fontSize: '13px', color: 'var(--c-secondary)', lineHeight: '1.4' }}>
                        {col.bio ? (
                          col.bio.length > 100 ? col.bio.slice(0, 100) + '...' : col.bio
                        ) : (
                          <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sem biografia cadastrada</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <span className="cms-badge cms-badge-blue" style={{ fontWeight: '600' }}>
                          {col._count.noticias} textos
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="cms-btn cms-btn-secondary cms-btn-sm"
                            onClick={() => openEdit(col)}
                            title="Editar Colunista"
                          >
                            <Edit size={13} />
                            <span>Editar</span>
                          </button>
                          <button
                            className="cms-btn cms-btn-danger cms-btn-sm"
                            onClick={() => setConfirmDeleteId(col.id)}
                            title="Excluir Colunista"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                <PenTool size={16} style={{ color: 'var(--c-accent)' }} />
                {modalMode === 'create' ? 'Novo Colunista' : 'Editar Colunista'}
              </span>
              <button className="cms-modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="cms-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Nome Completo <span>*</span></label>
                  <input
                    className="cms-input"
                    required
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex: Dr. José de Alencar, Maria da Silva..."
                    autoFocus
                  />
                </div>
                
                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Biografia Editorial</label>
                  <textarea
                    className="cms-textarea"
                    rows={4}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Escreva uma pequena apresentação para aparecer ao rodapé dos artigos de crônica..."
                  />
                </div>

                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Foto de Perfil</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                    {fotoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={fotoPreview} 
                        alt="Preview" 
                        style={{ 
                          width: '64px', 
                          height: '64px', 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          border: '2px solid var(--c-border)'
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px dashed var(--c-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--c-muted)'
                      }}>
                        <Camera size={20} />
                      </div>
                    )}
                    
                    <div>
                      <input 
                        ref={fileRef} 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleFotoChange} 
                      />
                      <button 
                        type="button" 
                        className="cms-btn cms-btn-secondary" 
                        onClick={() => fileRef.current?.click()}
                      >
                        <Camera size={14} />
                        <span>{fotoPreview ? 'Trocar Foto' : 'Selecionar Imagem'}</span>
                      </button>
                    </div>
                  </div>
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
                Excluir Colunista
              </span>
              <button className="cms-modal-close" onClick={() => setConfirmDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cms-modal-body">
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Deseja realmente remover o colunista <strong style={{ color: 'var(--c-accent)' }}>"{colParaExcluir?.nome}"</strong> do time?
              </p>
              <p style={{ marginTop: '8px', color: 'var(--c-secondary)', fontSize: '12.5px' }}>
                Os artigos já publicados pelo colunista não serão removidos do portal, permanecendo arquivados com autoria preservada.
              </p>
            </div>
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button
                className="cms-btn cms-btn-danger"
                disabled={deleting}
                onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              >
                {deleting ? 'Excluindo...' : 'Confirmar Remoção'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
