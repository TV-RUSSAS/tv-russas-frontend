'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: '👑 Super Admin',
  ADMIN: '🛡️ Admin',
  EDITOR: '✏️ Editor',
  COLUNISTA: '✍️ Colunista',
};

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: 'cms-badge-blue',
  ADMIN: 'cms-badge-yellow',
  EDITOR: 'cms-badge-green',
  COLUNISTA: 'cms-badge-gray',
};

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  lastLogin: string | null;
  criadoEm: string;
}

export default function UsuariosAdmin() {
  const { authFetch, user: currentUser } = useAdminAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await authFetch('/admin/usuarios');
      setUsuarios(await res.json());
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
        const res = await authFetch('/admin/usuarios');
        const data = await res.json();
        if (active) {
          setUsuarios(data);
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
    setModalMode('create'); setNome(''); setEmail(''); setPassword(''); setRole('EDITOR'); setAtivo(true); setEditingId(null); setModalOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setModalMode('edit'); setNome(u.nome); setEmail(u.email); setPassword(''); setRole(u.role); setAtivo(u.ativo); setEditingId(u.id); setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const body: Record<string, unknown> = { nome, email, role, ativo };
      if (password) body.password = password;

      const url = modalMode === 'edit' ? `/admin/usuarios/${editingId}` : '/admin/usuarios';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalMode === 'create' ? { ...body, password } : body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar.');
      setSuccess(modalMode === 'create' ? 'Usuário criado!' : 'Usuário atualizado!');
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
    try {
      const res = await authFetch(`/admin/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSuccess('Usuário excluído!');
      setConfirmDeleteId(null);
      setLoading(true);
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const userParaExcluir = usuarios.find(u => u.id === confirmDeleteId);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <>
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Usuários</h2>
          <p className="cms-page-subtitle">{usuarios.filter(u => u.ativo).length} usuários ativos</p>
        </div>
        <button className="cms-btn cms-btn-primary" onClick={openCreate}>+ Novo Usuário</button>
      </div>

      {error && <div className="cms-alert cms-alert-error">⚠️ {error}</div>}
      {success && <div className="cms-alert cms-alert-success">✅ {success}</div>}

      <div className="cms-table-card">
        <div className="cms-table-header"><span className="cms-table-title">👥 Lista de Usuários</span></div>
        {loading ? (
          <div className="cms-loading"><div className="cms-spinner" /> Carregando...</div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Último Login</th>
                <th>Criado em</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#8b98b0' }}>Nenhum usuário</td></tr>
              ) : usuarios.map(u => {
                const initials = u.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0
                        }}>{initials}</div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{u.nome}</div>
                          <div style={{ fontSize: '12px', color: '#8b98b0' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`cms-badge ${ROLE_BADGE[u.role] || 'cms-badge-gray'}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                    <td><span className={`cms-badge ${u.ativo ? 'cms-badge-green' : 'cms-badge-red'}`}>{u.ativo ? '✅ Ativo' : '🔴 Inativo'}</span></td>
                    <td style={{ color: '#8b98b0', fontSize: '13px' }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
                    </td>
                    <td style={{ color: '#8b98b0', fontSize: '13px' }}>
                      {new Date(u.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => openEdit(u)}>✏️ Editar</button>
                        {isSuperAdmin && u.id !== currentUser?.id && (
                          <button className="cms-btn cms-btn-danger cms-btn-sm" onClick={() => setConfirmDeleteId(u.id)}>🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="cms-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="cms-modal" onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title">{modalMode === 'create' ? '+ Novo Usuário' : '✏️ Editar Usuário'}</span>
              <button className="cms-modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="cms-modal-body">
                <div className="cms-form-group">
                  <label className="cms-label">Nome completo <span>*</span></label>
                  <input className="cms-input" required value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do usuário" />
                </div>
                <div className="cms-form-group">
                  <label className="cms-label">E-mail <span>*</span></label>
                  <input className="cms-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@tvrussas.com.br" />
                </div>
                <div className="cms-form-group">
                  <label className="cms-label">
                    {modalMode === 'create' ? 'Senha' : 'Nova Senha'} {modalMode === 'create' && <span>*</span>}
                    {modalMode === 'edit' && <span style={{ color: '#8b98b0', fontSize: '11px', fontWeight: '400' }}>(deixe em branco para manter)</span>}
                  </label>
                  <input className="cms-input" type="password" required={modalMode === 'create'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                </div>
                <div className="cms-form-group">
                  <label className="cms-label">Cargo <span>*</span></label>
                  <select className="cms-select" value={role} onChange={e => setRole(e.target.value)}>
                    {isSuperAdmin && <option value="SUPER_ADMIN">👑 Super Admin</option>}
                    <option value="ADMIN">🛡️ Admin</option>
                    <option value="EDITOR">✏️ Editor</option>
                    <option value="COLUNISTA">✍️ Colunista</option>
                  </select>
                </div>
                {modalMode === 'edit' && (
                  <div className="cms-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                      <input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} style={{ accentColor: '#22c55e', width: '16px', height: '16px' }} />
                      <span className="cms-label" style={{ margin: 0 }}>Conta ativa</span>
                    </label>
                  </div>
                )}
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

      {/* Confirmar exclusão */}
      {confirmDeleteId && (
        <div className="cms-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="cms-modal" onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title">⚠️ Excluir Usuário</span>
              <button className="cms-modal-close" onClick={() => setConfirmDeleteId(null)}>×</button>
            </div>
            <div className="cms-modal-body">
              <p>Deseja excluir o usuário <strong style={{ color: '#ff5722' }}>&quot;{userParaExcluir?.nome}&quot;</strong>?</p>
              <p style={{ marginTop: '8px', color: '#8b98b0', fontSize: '13px' }}>Esta ação é irreversível e o log de auditoria será registrado.</p>
            </div>
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button className="cms-btn cms-btn-danger" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}>🗑️ Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
