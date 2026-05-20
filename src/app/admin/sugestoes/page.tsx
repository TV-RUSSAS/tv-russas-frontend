'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
  pendente: '⏳ Pendente',
  lida: '✅ Lida',
  arquivada: '📦 Arquivada',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SugestoesAdmin() {
  const { authFetch } = useAdminAuth();
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
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
      setSuccess('Status atualizado!');
      setSugestoes(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setChangingStatus(null);
    }
  };

  const filtered = filtroStatus ? sugestoes.filter(s => s.status === filtroStatus) : sugestoes;
  const selected = sugestoes.find(s => s.id === selectedId);

  return (
    <>
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">Você Repórter</h2>
          <p className="cms-page-subtitle">
            {sugestoes.filter(s => s.status === 'pendente').length} sugestões pendentes de {sugestoes.length} total
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['', 'pendente', 'lida', 'arquivada'] as const).map(s => (
            <button
              key={s}
              className={`cms-btn ${filtroStatus === s ? 'cms-btn-primary' : 'cms-btn-secondary'} cms-btn-sm`}
              onClick={() => setFiltroStatus(s)}
            >
              {s === '' ? 'Todas' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="cms-alert cms-alert-error">⚠️ {error}</div>}
      {success && <div className="cms-alert cms-alert-success">✅ {success}</div>}

      <div className="cms-table-card">
        <div className="cms-table-header"><span className="cms-table-title">📷 Sugestões Recebidas</span></div>
        {loading ? (
          <div className="cms-loading"><div className="cms-spinner" /> Carregando...</div>
        ) : (
          <table className="cms-table">
            <thead>
              <tr>
                <th>Remetente</th>
                <th>Relato</th>
                <th>Mídia</th>
                <th>Status</th>
                <th>Data</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#8b98b0' }}>Nenhuma sugestão encontrada</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{s.nome}</div>
                    {s.email && <div style={{ fontSize: '12px', color: '#8b98b0' }}>{s.email}</div>}
                    {s.telefone && <div style={{ fontSize: '12px', color: '#8b98b0' }}>{s.telefone}</div>}
                  </td>
                  <td style={{ maxWidth: '250px' }}>
                    <span style={{ fontSize: '13px' }}>
                      {s.relato.length > 60 ? s.relato.slice(0, 60) + '...' : s.relato}
                    </span>
                  </td>
                  <td>
                    {s.midiaUrl ? (
                      <a href={`${API_BASE_URL}${s.midiaUrl}`} target="_blank" rel="noreferrer"
                        className="cms-btn cms-btn-secondary cms-btn-sm">
                        📎 Ver mídia
                      </a>
                    ) : <span style={{ color: '#8b98b0' }}>—</span>}
                  </td>
                  <td><span className={`cms-badge ${STATUS_BADGE[s.status]}`}>{STATUS_LABELS[s.status]}</span></td>
                  <td style={{ color: '#8b98b0', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(s.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => setSelectedId(s.id)}>👁️</button>
                      {s.status !== 'lida' && (
                        <button className="cms-btn cms-btn-secondary cms-btn-sm" disabled={changingStatus === s.id}
                          onClick={() => updateStatus(s.id, 'lida')}>✅ Lida</button>
                      )}
                      {s.status !== 'arquivada' && (
                        <button className="cms-btn cms-btn-secondary cms-btn-sm" disabled={changingStatus === s.id}
                          onClick={() => updateStatus(s.id, 'arquivada')}>📦</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Visualização */}
      {selectedId && selected && (
        <div className="cms-modal-overlay" onClick={() => setSelectedId(null)}>
          <div className="cms-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="cms-modal-header">
              <span className="cms-modal-title">📷 Sugestão de {selected.nome}</span>
              <button className="cms-modal-close" onClick={() => setSelectedId(null)}>×</button>
            </div>
            <div className="cms-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div><span style={{ fontSize: '12px', color: '#8b98b0' }}>Nome</span><p style={{ fontWeight: '600', marginTop: '2px' }}>{selected.nome}</p></div>
                <div><span style={{ fontSize: '12px', color: '#8b98b0' }}>Status</span><p style={{ marginTop: '2px' }}><span className={`cms-badge ${STATUS_BADGE[selected.status]}`}>{STATUS_LABELS[selected.status]}</span></p></div>
                {selected.email && <div><span style={{ fontSize: '12px', color: '#8b98b0' }}>E-mail</span><p style={{ marginTop: '2px' }}>{selected.email}</p></div>}
                {selected.telefone && <div><span style={{ fontSize: '12px', color: '#8b98b0' }}>Telefone</span><p style={{ marginTop: '2px' }}>{selected.telefone}</p></div>}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#8b98b0' }}>Relato</span>
                <p style={{ marginTop: '6px', lineHeight: '1.7', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', fontSize: '14px' }}>
                  {selected.relato}
                </p>
              </div>
              {selected.midiaUrl && (
                <div>
                  <span style={{ fontSize: '12px', color: '#8b98b0', display: 'block', marginBottom: '8px' }}>Mídia Anexada</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {selected.midiaUrl.endsWith('.mp4') ? (
                    <video src={`${API_BASE_URL}${selected.midiaUrl}`} controls style={{ width: '100%', borderRadius: '8px' }} />
                  ) : (
                    <img src={`${API_BASE_URL}${selected.midiaUrl}`} alt="mídia" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                </div>
              )}
            </div>
            <div className="cms-modal-footer">
              <button className="cms-btn cms-btn-secondary" onClick={() => setSelectedId(null)}>Fechar</button>
              {selected.status !== 'lida' && (
                <button className="cms-btn cms-btn-primary" onClick={() => { updateStatus(selected.id, 'lida'); setSelectedId(null); }}>✅ Marcar como lida</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
