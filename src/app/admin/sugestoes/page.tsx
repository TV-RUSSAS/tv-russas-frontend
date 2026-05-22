'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
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

interface Sugestao {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  relato: string;
  midiaUrl: string | null;
  status: 'pendente' | 'lida' | 'arquivada';
  criadoEm: string;
}

const STATUS_BADGE: Record<string, string> = {
  pendente: 'cms-badge-yellow',
  lida: 'cms-badge-green',
  arquivada: 'cms-badge-gray',
};

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  lida: 'Lida',
  arquivada: 'Arquivada',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SugestoesAdmin() {
  const { authFetch } = useAdminAuth();
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await authFetch('/admin/sugestoes');
      const data = await res.json();
      setSugestoes(Array.isArray(data) ? data : data.sugestoes || []);
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
        const res = await authFetch('/admin/sugestoes');
        const data = await res.json();
        if (active) {
          setSugestoes(Array.isArray(data) ? data : data.sugestoes || []);
          setLoading(false);
        }
      } catch (err) {
        if (active && err instanceof Error) setError(err.message);
      }
    };
    fetchInit();
    return () => { active = false; };
  }, [authFetch]);

  const updateStatus = async (id: string, status: Sugestao['status']) => {
    setChangingStatus(id);
    try {
      const res = await authFetch(`/admin/sugestoes/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar status.');
      setSuccess('Status atualizado com sucesso!');
      setSugestoes(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setChangingStatus(null);
    }
  };

  // KPIs dinâmicos
  const kpis = useMemo(() => {
    const total = sugestoes.length;
    const pendentes = sugestoes.filter(s => s.status === 'pendente').length;
    const lidas = sugestoes.filter(s => s.status === 'lida').length;
    const comMidia = sugestoes.filter(s => s.midiaUrl).length;

    return { total, pendentes, lidas, comMidia };
  }, [sugestoes]);

  const filtered = useMemo(() => {
    return filtroStatus ? sugestoes.filter(s => s.status === filtroStatus) : sugestoes;
  }, [sugestoes, filtroStatus]);

  const selected = sugestoes.find(s => s.id === selectedId);

  return (
    <>
      {/* Cabeçalho Editorial */}
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Você Repórter</h2>
          <p className="cms-page-subtitle">Denúncias, relatos e fotos enviados em tempo real pelos leitores do portal</p>
        </div>
        
        {/* Filtros em Pílulas */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`cms-btn ${filtroStatus === '' ? 'cms-btn-primary' : 'cms-btn-secondary'} cms-btn-sm`}
            onClick={() => setFiltroStatus('')}
          >
            Todas
          </button>
          <button
            className={`cms-btn ${filtroStatus === 'pendente' ? 'cms-btn-primary' : 'cms-btn-secondary'} cms-btn-sm`}
            onClick={() => setFiltroStatus('pendente')}
          >
            Pendentes ({kpis.pendentes})
          </button>
          <button
            className={`cms-btn ${filtroStatus === 'lida' ? 'cms-btn-primary' : 'cms-btn-secondary'} cms-btn-sm`}
            onClick={() => setFiltroStatus('lida')}
          >
            Lidas ({kpis.lidas})
          </button>
          <button
            className={`cms-btn ${filtroStatus === 'arquivada' ? 'cms-btn-primary' : 'cms-btn-secondary'} cms-btn-sm`}
            onClick={() => setFiltroStatus('arquivada')}
          >
            Arquivadas
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
          <span className="cms-stat-label">Sugestões Recebidas</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#f59e0b' }}>
            <Inbox size={16} />
          </div>
          <span className="cms-stat-value">{kpis.pendentes}</span>
          <span className="cms-stat-label">Aguardando Revisão</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#10b981' }}>
            <CheckCircle size={16} />
          </div>
          <span className="cms-stat-value">{kpis.lidas}</span>
          <span className="cms-stat-label">Relatos Lidos</span>
        </div>

        <div className="cms-stat-card">
          <div className="cms-stat-icon" style={{ color: '#818cf8' }}>
            <Paperclip size={16} />
          </div>
          <span className="cms-stat-value">{kpis.comMidia}</span>
          <span className="cms-stat-label">Com Anexo de Mídia</span>
        </div>
      </div>

      {/* Interface de Grade de Cartões de Alto Padrão */}
      {loading ? (
        <div className="cms-loading">
          <div className="cms-spinner" />
          <span>Carregando sugestões...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px', color: 'var(--c-secondary)' }}>
              Nenhum relato encontrado nesta categoria
            </div>
          ) : (
            filtered.map(s => {
              const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nome)}&background=1e2535&color=e2e8f0`;
              const finalMidiaUrl = s.midiaUrl ? (s.midiaUrl.startsWith('http') ? s.midiaUrl : `${API_BASE_URL}${s.midiaUrl}`) : null;

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
                    <span className={`cms-badge ${STATUS_BADGE[s.status]}`} style={{ fontSize: '10px', fontWeight: '600' }}>
                      {STATUS_LABELS[s.status]}
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
                      "{s.relato.length > 140 ? s.relato.slice(0, 140) + '...' : s.relato}"
                    </p>
                  </div>

                  {/* Anexo Preview Rápido */}
                  {finalMidiaUrl && (
                    <div style={{ 
                      borderRadius: '4px', 
                      overflow: 'hidden', 
                      height: '110px', 
                      width: '100%', 
                      background: '#09090d',
                      border: '1px solid rgba(255,255,255,0.04)',
                      position: 'relative'
                    }}>
                      {s.midiaUrl?.endsWith('.mp4') ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-secondary)', fontSize: '12px' }}>
                          <Paperclip size={14} style={{ marginRight: '6px' }} />
                          Anexo de Vídeo (.mp4)
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={finalMidiaUrl} 
                          alt="Denúncia" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      )}
                    </div>
                  )}

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
                      <span>Analisar</span>
                    </button>
                    
                    {s.status !== 'lida' && (
                      <button 
                        className="cms-btn cms-btn-secondary cms-btn-sm" 
                        disabled={changingStatus === s.id}
                        onClick={() => updateStatus(s.id, 'lida')}
                        title="Marcar como revisada"
                        style={{ color: '#10b981' }}
                      >
                        <CheckCircle size={13} />
                      </button>
                    )}
                    
                    {s.status !== 'arquivada' && (
                      <button 
                        className="cms-btn cms-btn-secondary cms-btn-sm" 
                        disabled={changingStatus === s.id}
                        onClick={() => updateStatus(s.id, 'arquivada')}
                        title="Arquivar relato"
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
                    <span style={{ fontSize: '10.5px', color: 'var(--c-secondary)', display: 'block' }}>Remetente</span>
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
                
                {selected.telefone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: 'var(--c-secondary)' }} />
                    <div>
                      <span style={{ fontSize: '10.5px', color: 'var(--c-secondary)', display: 'block' }}>Telefone</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{selected.telefone}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Corpo da Denúncia */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--c-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Relato do Cidadão</span>
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
                  "{selected.relato}"
                </p>
              </div>

              {/* Mídia Anexada em Resolução Completa */}
              {selected.midiaUrl && (
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--c-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Evidência / Mídia Anexada</span>
                  <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--c-border)' }}>
                    {selected.midiaUrl.endsWith('.mp4') ? (
                      <video src={`${API_BASE_URL}${selected.midiaUrl}`} controls style={{ width: '100%', display: 'block' }} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${API_BASE_URL}${selected.midiaUrl}`} alt="Evidência" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setSelectedId(null)}>Fechar</button>
              
              {selected.status !== 'lida' && (
                <button 
                  className="cms-btn cms-btn-primary" 
                  onClick={() => { updateStatus(selected.id, 'lida'); setSelectedId(null); }}
                >
                  <CheckCircle size={14} />
                  <span>Marcar como Lida</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
