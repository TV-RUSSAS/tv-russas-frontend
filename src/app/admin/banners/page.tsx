'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  Image as ImageIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Megaphone,
  Link,
  Eye,
  EyeOff
} from 'lucide-react';

interface Banner {
  id: string;
  titulo: string;
  imageUrl: string;
  linkUrl: string | null;
  posicao: string;
  ativo: boolean;
  criadoEm: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function BannersAdmin() {
  const { authFetch } = useAdminAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [posicao, setPosicao] = useState('topo_interna');
  const [ativo, setAtivo] = useState(true);
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await authFetch('/admin/banners');
      setBanners(await res.json());
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
        const res = await authFetch('/admin/banners');
        const data = await res.json();
        if (active) {
          setBanners(data);
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
    setModalMode('create'); setTitulo(''); setLinkUrl(''); setPosicao('topo_interna'); setAtivo(true); setImagem(null); setImagemPreview(null); setEditingId(null); setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setModalMode('edit'); setTitulo(banner.titulo); setLinkUrl(banner.linkUrl || ''); setPosicao(banner.posicao); setAtivo(banner.ativo);
    setImagem(null); setImagemPreview(banner.imageUrl.startsWith('http') ? banner.imageUrl : `${API_BASE_URL}${banner.imageUrl}`);
    setEditingId(banner.id); setModalOpen(true);
  };

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagem(file);
    const reader = new FileReader();
    reader.onload = ev => setImagemPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('titulo', titulo);
      fd.append('linkUrl', linkUrl);
      fd.append('posicao', posicao);
      fd.append('ativo', String(ativo));
      if (imagem) fd.append('imagem', imagem);

      const url = modalMode === 'edit' ? `/admin/banners/${editingId}` : '/admin/banners';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api${url}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar banner.');
      setSuccess(modalMode === 'create' ? 'Banner cadastrado com sucesso!' : 'Banner atualizado com sucesso!');
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
      const res = await authFetch(`/admin/banners/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSuccess('Banner excluído com sucesso!');
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

  // Filtragem
  const filteredBanners = useMemo(() => {
    return banners.filter(b =>
      b.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.posicao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [banners, searchTerm]);

  const bannerParaExcluir = banners.find(b => b.id === confirmDeleteId);

  return (
    <>
      {/* Cabeçalho Editorial */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Banners de Publicidade</h2>
          <p className="cms-page-subtitle">Gerencie os anúncios, patrocinadores e links promocionais exibidos no portal</p>
        </div>
        <button className="cms-btn cms-btn-primary" onClick={openCreate}>
          <Plus size={16} />
          <span>Novo Banner</span>
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

      {/* Barra de Ferramentas / Busca */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="cms-search-wrap" style={{ flex: 1 }}>
          <Search className="cms-search-icon" size={15} />
          <input
            type="text"
            className="cms-search-input"
            placeholder="Pesquisar por título ou posição..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Banners */}
      <div className="cms-table-card">
        <div className="cms-table-header">
          <span className="cms-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Megaphone size={16} style={{ color: 'var(--c-accent)' }} />
            Lista de Banners
          </span>
        </div>

        {loading ? (
          <div className="cms-loading">
            <div className="cms-spinner" />
            <span>Carregando banners...</span>
          </div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Banner</th>
                <th style={{ width: '15%' }}>Posição</th>
                <th style={{ width: '35%' }}>Link de Destino</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--c-secondary)' }}>
                    Nenhum banner cadastrado
                  </td>
                </tr>
              ) : (
                filteredBanners.map(banner => {
                  const finalImageUrl = banner.imageUrl.startsWith('http') ? banner.imageUrl : `${API_BASE_URL}${banner.imageUrl}`;

                  return (
                    <tr key={banner.id}>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={finalImageUrl}
                            alt={banner.titulo}
                            style={{ 
                              width: '80px', 
                              height: '45px', 
                              borderRadius: '4px', 
                              objectFit: 'cover', 
                              border: '1px solid rgba(255,255,255,0.06)',
                              flexShrink: 0 
                            }}
                          />
                          <div style={{ fontWeight: '600', color: 'var(--c-text)' }}>{banner.titulo}</div>
                        </div>
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
                          {banner.posicao}
                        </code>
                      </td>
                      <td style={{ verticalAlign: 'middle', fontSize: '13px', color: 'var(--c-secondary)', lineHeight: '1.4', wordBreak: 'break-all' }}>
                        {banner.linkUrl ? (
                          <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--c-accent)' }}>
                            <Link size={12} />
                            {banner.linkUrl}
                          </a>
                        ) : (
                          <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sem link externo</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        {banner.ativo ? (
                          <span className="cms-badge cms-badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                            <Eye size={11} />
                            Ativo
                          </span>
                        ) : (
                          <span className="cms-badge cms-badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                            <EyeOff size={11} />
                            Pausado
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="cms-btn cms-btn-secondary cms-btn-sm"
                            onClick={() => openEdit(banner)}
                            title="Editar Banner"
                          >
                            <Edit size={13} />
                            <span>Editar</span>
                          </button>
                          <button
                            className="cms-btn cms-btn-danger cms-btn-sm"
                            onClick={() => setConfirmDeleteId(banner.id)}
                            title="Excluir Banner"
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
                <Megaphone size={16} style={{ color: 'var(--c-accent)' }} />
                {modalMode === 'create' ? 'Novo Banner' : 'Editar Banner'}
              </span>
              <button className="cms-modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="cms-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Título do Banner <span>*</span></label>
                  <input
                    className="cms-input"
                    required
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Ex: Anúncio Topo - Farmácia Russas, Campanha Maio..."
                    autoFocus
                  />
                </div>
                
                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Link de Destino (URL do redirecionamento)</label>
                  <input
                    className="cms-input"
                    type="url"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    placeholder="Ex: https://www.parceiro.com.br"
                  />
                </div>

                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Posição de Exibição <span>*</span></label>
                  <select 
                    className="cms-select" 
                    required 
                    value={posicao} 
                    onChange={e => setPosicao(e.target.value)}
                  >
                    <option value="topo_interna">Topo da Matéria (Interna)</option>
                  </select>
                  <span className="cms-form-hint">Define o local exato onde o banner de propaganda será renderizado no portal público.</span>
                </div>

                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={ativo} 
                      onChange={e => setAtivo(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--c-accent)' }}
                    />
                    <span>Banner Ativo (Disponível no Portal)</span>
                  </label>
                </div>

                <div className="cms-form-group" style={{ marginBottom: 0 }}>
                  <label className="cms-label">Imagem do Banner <span>*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                    {imagemPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={imagemPreview} 
                        alt="Preview" 
                        style={{ 
                          width: '120px', 
                          height: '67px', 
                          borderRadius: '4px', 
                          objectFit: 'cover',
                          border: '2px solid var(--c-border)'
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '120px',
                        height: '67px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px dashed var(--c-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--c-muted)'
                      }}>
                        <ImageIcon size={20} />
                      </div>
                    )}
                    
                    <div>
                      <input 
                        ref={fileRef} 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleImagemChange} 
                      />
                      <button 
                        type="button" 
                        className="cms-btn cms-btn-secondary" 
                        onClick={() => fileRef.current?.click()}
                      >
                        <ImageIcon size={14} />
                        <span>{imagemPreview ? 'Trocar Imagem' : 'Selecionar Imagem'}</span>
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
                Excluir Banner
              </span>
              <button className="cms-modal-close" onClick={() => setConfirmDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cms-modal-body">
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Deseja realmente remover o banner publicitário <strong style={{ color: 'var(--c-accent)' }}>{`"${bannerParaExcluir?.titulo}"`}</strong>?
              </p>
              <p style={{ marginTop: '8px', color: 'var(--c-secondary)', fontSize: '12.5px' }}>
                Esta ação excluirá permanentemente a imagem associada no Cloudinary e removerá o anúncio do site público.
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
