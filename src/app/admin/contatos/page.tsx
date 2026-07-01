'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { TEXTS } from '@/constants/texts';
import {
  Megaphone,
  Inbox,
  CheckCircle,
  Archive,
  Eye,
  Paperclip,
  Calendar,
  Mail,
  Phone,
  User,
  X,
  AlertTriangle
} from 'lucide-react';

interface Contato {
  id: string;
  nome: string;
  email: string | null;
  assunto: string;
  mensagem: string;
  
  status: 'pendente' | 'lido' | 'arquivado';
  criadoEm: string;
}

// Os mapeamentos de status antigos foram removidos para evitar o uso de notação de colchetes vulnerável a prototype pollution. Mapeamentos seguros agora são feitos via switch-case nas funções auxiliares abaixo.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export default function ContatosAdmin() {
  const { authFetch } = useAdminAuth();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente': return 'cms-badge-yellow';
      case 'lido': return 'cms-badge-green';
      case 'arquivado': return 'cms-badge-gray';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'lido': return 'Lida';
      case 'arquivado': return 'Arquivada';
      default: return '';
    }
  };
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await authFetch('/admin/contatos');
      const data = await res.json();
      setContatos(Array.isArray(data) ? data : data.contatos || []);
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
        const res = await authFetch('/admin/contatos');
        const data = await res.json();
        if (active) {
          setContatos(Array.isArray(data) ? data : data.contatos || []);
          setLoading(false);
        }
      } catch (err) {
        if (active && err instanceof Error) setError(err.message);
      }
    };
    fetchInit();
    return () => { active = false; };
  }, [authFetch]);

  const updateStatus = async (id: string, status: Contato['status']) => {
    setChangingStatus(id);
    try {
      const res = await authFetch(`/admin/contatos/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar status.');
      setSuccess('Status atualizado com sucesso!');
      setContatos(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setChangingStatus(null);
    }
  };

  // KPIs dinâmicos
  const kpis = useMemo(() => {
    const total = contatos.length;
    const pendentes = contatos.filter(s => s.status === 'pendente').length;
    const lidos = contatos.filter(s => s.status === 'lido').length;
    const comMidia = 0;

    return { total, pendentes, lidos, comMidia };
  }, [contatos]);

  const filtered = useMemo(() => {
    return filtroStatus ? contatos.filter(s => s.status === filtroStatus) : contatos;
  }, [contatos, filtroStatus]);

  const selected = contatos.find(s => s.id === selectedId);

  return (
    <>
      {/* Cabeçalho Editorial */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">"Caixa de Entrada"</h2>
          <p className="cms-page-subtitle">"Gerencie as mensagens recebidas pelo Fale Conosco."</p>
        </div>
        
        {/* Filtros em Pílulas */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`cms-btn ${filtroStatus === '' ? 'cms-btn-primary' : 'cms-btn-secondary'} cms-btn-sm`}
            onClick={() => setFiltroStatus('')}
          >
            {TEXTS.admin.statusAll}
          </button>
          <button
            className={`cms-btn ${filtroStatus === 'pendente' ? 'cms-btn-primary' : 'cms-btn-secondary'} cms-btn-sm`}
            onClick={() => setFiltroStatus('pendente')}
          >
            {TEXTS.admin.statusPending} ({kpis.pendentes})
          </button>
          <button
            className={`cms-btn ${filtroStatus === 'lido' ? 'cms-btn-primary' : 'cms-btn-secondary'} cms-btn-sm`}
            onClick={() => setFiltroStatus('lido')}
          >
            {TEXTS.admin.statusRead} ({kpis.lidos})
          </button>
          <button
            className={`cms-btn ${filtroStatus === 'arquivado' ? 'cms-btn-primary' : 'cms-btn-secondary'} cms-btn-sm`}
            onClick={() => setFiltroStatus('arquivado')}
          >
            {TEXTS.admin.statusArchived}
          </button>
        </div>
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
            <Megaphone size={16} />
          </div>
          <span className="cms-stat-value">{kpis.total}</span>
          <span className="cms-stat-label">{TEXTS.admin.suggestionsReceived}</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#f59e0b' }}>
            <Inbox size={16} />
          </div>
          <span className="cms-stat-value">{kpis.pendentes}</span>
          <span className="cms-stat-label">{TEXTS.admin.awaitingReview}</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#10b981' }}>
            <CheckCircle size={16} />
          </div>
          <span className="cms-stat-value">{kpis.lidos}</span>
          <span className="cms-stat-label">{TEXTS.admin.readReports}</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#818cf8' }}>
            <Paperclip size={16} />
          </div>
          <span className="cms-stat-value">{kpis.comMidia}</span>
          <span className="cms-stat-label">{TEXTS.admin.withMedia}</span>
        </div>
      </div>

      {/* Interface de Grade de Cartões de Alto Padrão */}
      {loading ? (
        <div className="cms-loading">
          <div className="cms-spinner" />
          <span>{TEXTS.admin.loadingSuggestions}</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px', color: 'var(--c-secondary)' }}>
              {TEXTS.admin.noReportsFound}
            </div>
          ) : (
            filtered.map(s => {
              const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nome)}&background=1e2535&color=e2e8f0`;


              return (
                <div 
                  key={s.id} 
                  className="cms-stat-card" 
                  style={{ 
                    flexDirection: 'column', 
                    gap: '14px', 
                    padding: '20px', 
                    background: 'var(--c-card)', 
                    border: '1px solid var(--c-border)',
                    borderRadius: '6px',
                    position: 'relative'
                  }}
                >
                  {/* Cabeçalho do Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--c-text)',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {s.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' }}>{s.nome}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--c-secondary)', marginTop: '1px' }}>
                          <Calendar size={10} />
                          <span>{new Date(s.criadoEm).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`cms-badge ${getStatusBadge(s.status)}`} style={{ fontSize: '10px', fontWeight: '600' }}>
                      {getStatusLabel(s.status)}
                    </span>
                  </div>

                  {/* Relato (Itálico Editorial) */}
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontSize: '13px', 
                      color: 'var(--c-text)', 
                      lineHeight: '1.6', 
                      fontStyle: 'italic', 
                      margin: 0,
                      background: 'rgba(255,255,255,0.015)',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      borderLeft: '2px solid rgba(255,255,255,0.08)'
                    }}>
                      &quot;{s.mensagem.length > 140 ? s.mensagem.slice(0, 140) + '...' : s.mensagem}&quot;
                    </p>
                  </div>

                  {/* Rodapé do Card com Ações */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    borderTop: '1px solid rgba(255,255,255,0.04)', 
                    paddingTop: '12px',
                    marginTop: '4px'
                  }}>
                    <button 
                      className="cms-btn cms-btn-secondary cms-btn-sm" 
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setSelectedId(s.id)}
                    >
                      <Eye size={13} />
                      <span>{TEXTS.admin.analyzing}</span>
                    </button>
                    
                    {s.status !== 'lido' && (
                      <button 
                        className="cms-btn cms-btn-secondary cms-btn-sm" 
                        disabled={changingStatus === s.id}
                        onClick={() => updateStatus(s.id, 'lido')}
                        title="Marcar como revisada"
                        style={{ color: '#10b981' }}
                      >
                        <CheckCircle size={13} />
                      </button>
                    )}
                    
                    {s.status !== 'arquivado' && (
                      <button 
                        className="cms-btn cms-btn-secondary cms-btn-sm" 
                        disabled={changingStatus === s.id}
                        onClick={() => updateStatus(s.id, 'arquivado')}
                        title="Arquivar mensagem"
                      >
                        <Archive size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal de Visualização Detalhada */}
      {selectedId && selected && (
        <div className="cms-modal-overlay" onClick={() => setSelectedId(null)}>
          <div className="cms-modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={16} style={{ color: 'var(--c-accent)' }} />
                Relato de {selected.nome}
              </span>
              <button className="cms-modal-close" onClick={() => setSelectedId(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="cms-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Informações de Contato do Cidadão */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '12px',
                background: 'rgba(0,0,0,0.15)',
                padding: '14px 16px',
                borderRadius: '6px',
                border: '1px solid var(--c-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} style={{ color: 'var(--c-secondary)' }} />
                  <div>
                    <span style={{ fontSize: '10.5px', color: 'var(--c-secondary)', display: 'block' }}>{TEXTS.admin.sender}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{selected.nome}</span>
                  </div>
                </div>
                
                {selected.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} style={{ color: 'var(--c-secondary)' }} />
                    <div>
                      <span style={{ fontSize: '10.5px', color: 'var(--c-secondary)', display: 'block' }}>E-mail</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{selected.email}</span>
                    </div>
                  </div>
                )}
                
                {selected.assunto && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: 'var(--c-secondary)' }} />
                    <div>
                      <span style={{ fontSize: '10.5px', color: 'var(--c-secondary)', display: 'block' }}>"Assunto"</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{selected.assunto}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Corpo da Denúncia */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--c-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>"Mensagem"</span>
                <p style={{ 
                  marginTop: '8px', 
                  lineHeight: '1.8', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--c-border)',
                  padding: '16px', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  color: 'var(--c-text)',
                  whiteSpace: 'pre-wrap'
                }}>
                  &quot;{selected.mensagem}&quot;
                </p>
              </div>


            </div>
            
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setSelectedId(null)}>{TEXTS.actions.close}</button>
              
              {selected.status !== 'lido' && (
                <button 
                  className="cms-btn cms-btn-primary" 
                  onClick={() => { updateStatus(selected.id, 'lido'); setSelectedId(null); }}
                >
                  <CheckCircle size={14} />
                  <span>{TEXTS.admin.markAsRead}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
