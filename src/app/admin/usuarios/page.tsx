'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  Users,
  Shield,
  ShieldAlert,
  Activity,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  COLUNISTA: 'Colunista',
};

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: 'cms-badge-blue',
  ADMIN: 'cms-badge-yellow',
  EDITOR: 'cms-badge-green',
  COLUNISTA: 'cms-badge-gray',
};

const ROLE_LEVELS: Record<string, number> = {
  COLUNISTA: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal
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
      setSuccess(modalMode === 'create' ? 'Usuário criado com sucesso!' : 'Usuário atualizado com sucesso!');
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
      setSuccess('Usuário excluído com sucesso!');
      setConfirmDeleteId(null);
      setLoading(true);
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  // KPIs dinâmicos
  const kpis = useMemo(() => {
    const total = usuarios.length;
    const admins = usuarios.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length;
    const operacionais = usuarios.filter(u => u.role === 'EDITOR' || u.role === 'COLUNISTA').length;
    const ativos = usuarios.filter(u => u.ativo).length;

    return { total, admins, operacionais, ativos };
  }, [usuarios]);

  // Filtragem e busca
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(u => {
      const matchesSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usuarios, searchTerm, roleFilter]);

  const userParaExcluir = usuarios.find(u => u.id === confirmDeleteId);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <>
      {/* Cabeçalho Editorial Rico */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Usuários</h2>
          <p className="cms-page-subtitle">Gerencie as permissões e contas do time editorial e operacional</p>
        </div>
        <button className="cms-btn cms-btn-primary" onClick={openCreate}>
          <Plus size={16} />
          <span>Novo Usuário</span>
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
            <Users size={16} />
          </div>
          <span className="cms-stat-value">{kpis.total}</span>
          <span className="cms-stat-label">Equipe Total</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#818cf8' }}>
            <ShieldAlert size={16} />
          </div>
          <span className="cms-stat-value">{kpis.admins}</span>
          <span className="cms-stat-label">Administradores</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#f59e0b' }}>
            <Shield size={16} />
          </div>
          <span className="cms-stat-value">{kpis.operacionais}</span>
          <span className="cms-stat-label">Editores / Colunistas</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#10b981' }}>
            <Activity size={16} />
          </div>
          <span className="cms-stat-value">{kpis.ativos}</span>
          <span className="cms-stat-label">Contas Ativas</span>
        </div>
      </div>

      {/* Barra de Ferramentas / Busca & Filtro */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="cms-search-wrap" style={{ flex: 1, minWidth: '240px' }}>
          <Search className="cms-search-icon" size={15} />
          <input
            type="text"
            className="cms-search-input"
            placeholder="Pesquisar por nome ou e-mail..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: 'var(--c-secondary)' }} />
          <select 
            className="cms-select" 
            style={{ width: '180px', padding: '6px 10px', fontSize: '13px' }}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Todos os Cargos</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="ADMIN">Administradores</option>
            <option value="EDITOR">Editores</option>
            <option value="COLUNISTA">Colunistas</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários Notion-Style */}
      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Users size={16} style={{ color: 'var(--c-accent)' }} />
            Lista de Contas
          </span>
        </div>

        {loading ? (
          <div className="cms-loading">
            <div className="cms-spinner" />
            <span>Carregando usuários...</span>
          </div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Usuário</th>
                <th style={{ width: '20%' }}>Cargo</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '15%' }}>Último Login</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--c-secondary)' }}>
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map(u => {
                  const initials = u.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
                  
                  return (
                    <tr key={u.id}>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: u.ativo ? 'linear-gradient(135deg, #ff5722, #e04a2d)' : 'linear-gradient(135deg, #4b5563, #374151)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: '750', color: '#fff', flexShrink: 0
                          }}>{initials}</div>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--c-text)' }}>{u.nome}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--c-secondary)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <span className={`cms-badge ${ROLE_BADGE[u.role] || 'cms-badge-gray'}`} style={{ fontWeight: '600' }}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <span className={`cms-badge ${u.ativo ? 'cms-badge-green' : 'cms-badge-red'}`} style={{ fontWeight: '600' }}>
                          {u.ativo ? 'Ativo' : 'Suspenso'}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle', color: 'var(--c-secondary)', fontSize: '12.5px', fontFamily: 'var(--font-sans)' }}>
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString('pt-BR') : 'Nunca acessou'}
                      </td>
                      <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {currentUser && ROLE_LEVELS[currentUser.role] >= ROLE_LEVELS[u.role] && (
                            <button
                              className="cms-btn cms-btn-secondary cms-btn-sm"
                              onClick={() => openEdit(u)}
                              title="Editar Usuário"
                            >
                              <Edit size={13} />
                              <span>Editar</span>
                            </button>
                          )}
                          {currentUser && ROLE_LEVELS[currentUser.role] >= ROLE_LEVELS[u.role] && u.id !== currentUser?.id && (
                            <button
                              className="cms-btn cms-btn-danger cms-btn-sm"
                              onClick={() => setConfirmDeleteId(u.id)}
                              title="Remover Usuário"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
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
                <Users size={16} style={{ color: 'var(--c-accent)' }} />
                {modalMode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
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
                    placeholder="Nome completo do integrante" 
                    autoFocus
                  />
                </div>
                
                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">E-mail de Trabalho <span>*</span></label>
                  <input 
                    className="cms-input" 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="exemplo@tvrussas.com.br" 
                  />
                </div>
                
                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">
                    {modalMode === 'create' ? 'Senha de Acesso' : 'Redefinir Senha'} {modalMode === 'create' && <span>*</span>}
                    {modalMode === 'edit' && <span style={{ color: 'var(--c-secondary)', fontSize: '11px', fontWeight: '400', marginLeft: '6px' }}>(deixe em branco para não alterar)</span>}
                  </label>
                  <input 
                    className="cms-input" 
                    type="password" 
                    required={modalMode === 'create'} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Mínimo de 6 caracteres" 
                  />
                </div>
                
                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Cargo / Nível de Permissão <span>*</span></label>
                  {modalMode === 'edit' && editingId === currentUser?.id ? (
                    <input 
                      type="text"
                      className="cms-input"
                      value={ROLE_LABELS[role] || role}
                      disabled
                    />
                  ) : (
                    <select 
                      className="cms-select" 
                      value={role} 
                      onChange={e => setRole(e.target.value)}
                    >
                      {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                      <option value="ADMIN">Administrador</option>
                      <option value="EDITOR">Editor</option>
                      <option value="COLUNISTA">Colunista</option>
                    </select>
                  )}
                  {modalMode === 'edit' && editingId === currentUser?.id && (
                    <span style={{ color: 'var(--c-secondary)', fontSize: '11.5px', display: 'block', marginTop: '4px' }}>Você não pode alterar seu próprio cargo.</span>
                  )}
                </div>
                
                {modalMode === 'edit' && (
                  <div className="cms-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                      <input 
                        type="checkbox" 
                        checked={ativo} 
                        onChange={e => setAtivo(e.target.checked)} 
                        style={{ accentColor: '#10b981', width: '16px', height: '16px' }} 
                      />
                      <span className="cms-label" style={{ margin: 0, cursor: 'pointer' }}>Conta ativa com acesso ao CMS</span>
                    </label>
                  </div>
                )}
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

      {/* Confirmar exclusão */}
      {confirmDeleteId && (
        <div className="cms-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="cms-modal" onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                Excluir Usuário
              </span>
              <button className="cms-modal-close" onClick={() => setConfirmDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cms-modal-body">
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Deseja realmente excluir permanentemente a conta de <strong style={{ color: 'var(--c-accent)' }}>&quot;{userParaExcluir?.nome}&quot;</strong>?
              </p>
              <p style={{ marginTop: '8px', color: 'var(--c-secondary)', fontSize: '12.5px' }}>
                Esta ação é definitiva, impossibilitará futuros logins da credencial e será registrada na auditoria de segurança.
              </p>
            </div>
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
              <button className="cms-btn cms-btn-danger" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}>
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
