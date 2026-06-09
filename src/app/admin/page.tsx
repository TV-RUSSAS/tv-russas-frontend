'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { TEXTS } from '@/constants/texts';

/* ── Tipos ───────────────────────────────────────────────── */
interface Atividade {
  id: string;
  tipo: 'AUDIT' | 'SUGESTAO';
  acao: string;
  entidade: string;
  entidadeId: string | null;
  usuario?: { nome: string; role: string } | null;
  ip: string;
  dataHora: string;
  detalhes?: {
    titulo?: string;
    nome?: string;
    email?: string;
    relato?: string;
    [key: string]: unknown;
  } | null;
  capaUrl?: string | null;
  categoriaNome?: string | null;
}

interface DashboardStats {
  totalNoticias: number;
  totalUsuarios: number;
  totalCategorias: number;
  totalViews: number;
  totalLikes: number;
  totalSugestoesNovas: number;
  topNoticias: Array<{ id: string; titulo: string; views: number; categoryId?: string; categoria?: { nome: string } }>;
  ultimosLogs: Atividade[];
  atividades?: Atividade[];
  grafico: Array<{ data: string; total: number; categoriaLider?: string | null }>;
  analyticsEditorial?: {
    totalPeriodo: number;
    mediaDiaria: number;
    diaRecorde: string;
    quantidadeRecorde: number;
    variacaoPeriodo: string;
  };
}

interface NoticiaMaisLida {
  id: string;
  titulo: string;
  slug: string;
  views: number;
  categoria: string | { nome: string };
  posicao: number;
  variacao: number;
  status: 'subiu' | 'caiu' | 'manteve';
}

interface NoticiaEmAlta {
  id: string;
  titulo: string;
  slug: string;
  viewsRecentes: number;
  viewsTotais: number;
  crescimentoPercentual: number;
  tendencia: 'subindo' | 'caiu' | 'estavel';
  categoria: string | { nome: string };
}

/* ── Utilitários ─────────────────────────────────────────── */
function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

/* ── Algoritmo de Agrupamento ────────────────────────────── */
function agruparAtividades(atividades: Atividade[]): Array<Atividade & { agrupadas?: Atividade[]; isAgrupado?: boolean }> {
  if (!atividades || atividades.length === 0) return [];
  
  const result: Array<Atividade & { agrupadas?: Atividade[]; isAgrupado?: boolean }> = [];
  
  for (let i = 0; i < atividades.length; i++) {
    const atual = atividades.at(i);
    if (!atual) continue;
    
    // Tentamos ver se podemos agrupar com o último item no result
    const ultimoResult = result.at(-1);
    
    // Regras de agrupamento:
    // 1. Mesmo tipo ('AUDIT') e não é 'SUGESTAO'
    // 2. Mesma ação (ex: 'NOTICIA_ATUALIZADA')
    // 3. Mesmo usuário
    if (
      ultimoResult &&
      atual.tipo === 'AUDIT' &&
      ultimoResult.tipo === 'AUDIT' &&
      atual.acao === ultimoResult.acao &&
      (atual.usuario?.nome || 'Sistema') === (ultimoResult.usuario?.nome || 'Sistema')
    ) {
      if (!ultimoResult.agrupadas) {
        ultimoResult.agrupadas = [
          { ...ultimoResult } // copia o próprio original
        ];
        ultimoResult.isAgrupado = true;
      }
      ultimoResult.agrupadas.push(atual);
    } else {
      result.push({ ...atual });
    }
  }
  
  return result;
}

/* ── Ícones SVG inline dedicados ─────────────────────────── */
const IconArticle = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 1h7l3 3v9H2.5V1z"/>
    <path d="M9 1v3.5h3"/>
    <line x1="4" y1="7" x2="10" y2="7"/>
    <line x1="4" y1="9.5" x2="7.5" y2="9.5"/>
  </svg>
);

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z"/>
    <circle cx="7" cy="7" r="2"/>
  </svg>
);

const IconHeart = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 12s-6-3.9-6-7.5A3.5 3.5 0 017 3.5 3.5 3.5 0 0113 4.5C13 8.1 7 12 7 12z"/>
  </svg>
);

const IconCamera = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4.5h1.5L4 2.5h6l1.5 2H13a.5.5 0 01.5.5v6.5a.5.5 0 01-.5.5H1a.5.5 0 01-.5-.5V5a.5.5 0 01.5-.5z"/>
    <circle cx="7" cy="8" r="2"/>
  </svg>
);

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="6.5" y1="1.5" x2="6.5" y2="11.5"/>
    <line x1="1.5" y1="6.5" x2="11.5" y2="6.5"/>
  </svg>
);

const IconTag = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1h5l6 6-5 5-6-6V1z"/>
    <circle cx="4" cy="4" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
);

const IconPen = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 1.5a1.5 1.5 0 012.1 2.1L3.5 11.2l-2.8.8.8-2.8L9 1.5z"/>
  </svg>
);

const IconExternal = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8"/>
    <path d="M8 1h4v4"/>
    <line x1="12" y1="1" x2="6.5" y2="6.5"/>
  </svg>
);

/* ── Novos Ícones SVG Editoriais ─────────────────────────── */
const IconNewsPaper = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8V6Z" />
  </svg>
);

const IconPencil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const IconStarFull = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconStarEmpty = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMessage = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconSettings = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ── Mapeamento Editorial de Ações ─────────────────────────── */
function getAcaoEditorialInfo(acao: string): {
  label: string;
  corBadge: string;
  corIcon: string;
  icon: React.ReactNode;
  categoriaGrupo: 'noticias' | 'usuarios' | 'sistema' | 'sugestoes';
} {
  const map: Record<string, { label: string; corBadge: string; corIcon: string; icon: React.ReactNode; categoriaGrupo: 'noticias' | 'usuarios' | 'sistema' | 'sugestoes' }> = {
    NOTICIA_CRIADA: {
      label: 'Notícia publicada',
      corBadge: 'rgba(16, 185, 129, 0.08)',
      corIcon: '#10b981',
      icon: <IconNewsPaper />,
      categoriaGrupo: 'noticias'
    },
    NOTICIA_ATUALIZADA: {
      label: 'Notícia editada',
      corBadge: 'rgba(59, 130, 246, 0.08)',
      corIcon: '#3b82f6',
      icon: <IconPencil />,
      categoriaGrupo: 'noticias'
    },
    NOTICIA_EXCLUIDA: {
      label: 'Notícia excluída',
      corBadge: 'rgba(239, 68, 68, 0.08)',
      corIcon: '#ef4444',
      icon: <IconTrash />,
      categoriaGrupo: 'noticias'
    },
    NOTICIA_DESTAQUE_ADICIONADA: {
      label: 'Notícia enviada para destaque',
      corBadge: 'rgba(245, 158, 11, 0.08)',
      corIcon: '#f59e0b',
      icon: <IconStarFull />,
      categoriaGrupo: 'noticias'
    },
    NOTICIA_DESTAQUE_REMOVIDA: {
      label: 'Notícia removida do destaque',
      corBadge: 'rgba(107, 114, 128, 0.08)',
      corIcon: '#9ca3af',
      icon: <IconStarEmpty />,
      categoriaGrupo: 'noticias'
    },
    USUARIO_CRIADO: {
      label: 'Novo usuário criado',
      corBadge: 'rgba(139, 92, 246, 0.08)',
      corIcon: '#8b5cf6',
      icon: <IconUser />,
      categoriaGrupo: 'usuarios'
    },
    USUARIO_ATUALIZADO: {
      label: 'Usuário atualizado',
      corBadge: 'rgba(99, 102, 241, 0.08)',
      corIcon: '#6366f1',
      icon: <IconUser />,
      categoriaGrupo: 'usuarios'
    },
    USUARIO_EXCLUIDO: {
      label: 'Usuário excluído',
      corBadge: 'rgba(239, 68, 68, 0.08)',
      corIcon: '#ef4444',
      icon: <IconUser />,
      categoriaGrupo: 'usuarios'
    },
    SUGESTAO_RECEBIDA: {
      label: 'Sugestão recebida',
      corBadge: 'rgba(236, 72, 153, 0.08)',
      corIcon: '#ec4899',
      icon: <IconMessage />,
      categoriaGrupo: 'sugestoes'
    },
    SUGESTAO_STATUS_ATUALIZADO: {
      label: 'Status de sugestão alterado',
      corBadge: 'rgba(20, 184, 166, 0.08)',
      corIcon: '#14b8a6',
      icon: <IconSettings />,
      categoriaGrupo: 'sugestoes'
    },
    CATEGORIA_CRIADA: {
      label: 'Categoria criada',
      corBadge: 'rgba(107, 114, 128, 0.12)',
      corIcon: '#9ca3af',
      icon: <IconSettings />,
      categoriaGrupo: 'sistema'
    },
    COLUNISTA_CRIADO: {
      label: 'Colunista criado',
      corBadge: 'rgba(107, 114, 128, 0.12)',
      corIcon: '#9ca3af',
      icon: <IconSettings />,
      categoriaGrupo: 'sistema'
    },
  };

  const entries = Object.entries(map);
  const found = entries.find(([key]) => key === acao);
  const info = found ? found[1] : null;
  return info || {
    label: acao.replace(/_/g, ' ').toLowerCase(),
    corBadge: 'rgba(255, 255, 255, 0.05)',
    corIcon: '#fff',
    icon: <IconSettings />,
    categoriaGrupo: 'sistema'
  };
}

/* ── Analytics Editorial ─────────────────────────────────── */
interface EditorialAnalyticsProps {
  stats: DashboardStats | null;
  range: 7 | 14 | 30;
  setRange: (r: 7 | 14 | 30) => void;
}

function EditorialAnalytics({ stats, range, setRange }: EditorialAnalyticsProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    visible: boolean;
    data: string;
    total: number;
    mediaMovel: number;
    variacaoDia: string;
    categoriaLider: string | null;
  } | null>(null);

  const data = stats?.grafico ?? [];
  const analytics = stats?.analyticsEditorial;
  const count = data.length;
  
  const hasData = analytics && analytics.totalPeriodo > 0;

  const max = Math.max(...data.map(d => d.total), 1);
  const gap = count === 30 ? 4 : count === 14 ? 8 : 12;
  const barWidth = (600 - (count - 1) * gap) / count;

  // 1. Média Móvel (3 períodos)
  const mediaMovelData = data.map((d, i) => {
    let sum = 0;
    let countMM = 0;
    for (let j = Math.max(0, i - 2); j <= i; j++) {
      sum += (data.at(j)?.total ?? 0);
      countMM++;
    }
    return parseFloat((sum / countMM).toFixed(1));
  });

  // 2. Média Geral do período
  const mediaGeral = data.length > 0 ? data.reduce((sum, d) => sum + d.total, 0) / data.length : 0;
  const yMedia = 120 - (max > 0 ? (mediaGeral / max) * 110 : 0);

  // 3. Regressão Linear Simples para indicador científico de Tendência
  let tendencia = 'Estável';
  let tendenciaIcon = '→';
  let tendenciaCor = 'var(--c-muted)';
  
  if (count > 1) {
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < count; i++) {
      const x = i;
      const y = data.at(i)?.total ?? 0;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    const divisor = count * sumXX - sumX * sumX;
    const slope = divisor === 0 ? 0 : (count * sumXY - sumX * sumY) / divisor;
    
    if (slope > 0.05) {
      tendencia = 'Crescimento';
      tendenciaIcon = '↗';
      tendenciaCor = '#10b981'; // verde
    } else if (slope < -0.05) {
      tendencia = 'Queda';
      tendenciaIcon = '↘';
      tendenciaCor = '#ef4444'; // vermelho
    }
  }

  // 4. Detetar baixo volume de dados (se há apenas um dia com matérias no range)
  const diasComPublicacoes = data.filter(d => d.total > 0).length;
  const poucosDados = diasComPublicacoes === 1;

  // 5. Linha de tendência (Cálculo de pontos do SVG Path)
  const pathD = mediaMovelData.map((val, i) => {
    const mmH = max > 0 ? (val / max) * 110 : 0;
    const x = i * (barWidth + gap) + barWidth / 2;
    const y = 120 - mmH;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>, item: { data: string; total: number; categoriaLider?: string | null }, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.ownerDocument.getElementById('editorial-analytics-container');
    const containerRect = container?.getBoundingClientRect();
    
    if (containerRect) {
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top - 60; // posicionado mais acima para o tooltip de 5 linhas
      
      // Calcular variação diária em relação ao dia anterior
      let variacaoDia = '0%';
      if (index > 0) {
        const anterior = data.at(index - 1)?.total ?? 0;
        const atual = item.total;
        if (anterior === 0) {
          variacaoDia = atual > 0 ? `+${atual * 100}%` : '0%';
        } else {
          const diff = atual - anterior;
          const pct = Math.round((diff / anterior) * 100);
          variacaoDia = pct >= 0 ? `+${pct}%` : `${pct}%`;
        }
      }

      setTooltip({
        x,
        y,
        visible: true,
        data: item.data,
        total: item.total,
        mediaMovel: mediaMovelData.at(index) ?? 0,
        variacaoDia,
        categoriaLider: item.categoriaLider ?? null
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const showLabel = (index: number) => {
    if (count === 7) return true;
    if (count === 14) return index % 2 === 0;
    if (count === 30) return index % 5 === 0 || index === count - 1;
    return true;
  };

  function formatDateTooltip(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    const day = parts[2];
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    const year = parts[0];
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day}/${month.slice(0, 3)}/${year}`;
  }

  function formatDateShort(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  }

  return (
    <div className="cms-chart-card" id="editorial-analytics-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '350px' }}>


      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="cms-chart-title" style={{ margin: 0 }}>{TEXTS.admin.editorialRhythm}</span>
          <span style={{ fontSize: '11px', color: 'var(--c-muted)', marginTop: '2px' }}>{TEXTS.admin.newsFlowTrack}</span>
        </div>
        
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
          {([7, 14, 30] as const).map(d => (
            <button
              key={d}
              onClick={() => setRange(d)}
              style={{
                background: range === d ? '#e04a2d' : 'transparent',
                border: 'none',
                color: range === d ? '#fff' : 'rgba(255,255,255,0.5)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: range === d ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              {d} {"dias"}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      {!hasData ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center', flexGrow: 1 }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: 'rgba(255,255,255,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h4 style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--c-text)', marginBottom: '4px' }}>{TEXTS.admin.noPublicationsPeriod}</h4>
          <p style={{ fontSize: '11.5px', color: 'var(--c-muted)', maxWidth: '280px', lineHeight: '1.4', marginBottom: '16px' }}>
            {TEXTS.admin.noPubsShortText}{range} {"dias."}
          </p>
          <Link href="/admin/noticias/nova" className="cms-btn cms-btn-primary cms-btn-sm" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
            {TEXTS.admin.writeNews}
          </Link>
        </div>
      ) : (
        <>
          {/* Gráfico SVG */}
          <div style={{ position: 'relative', width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '8px' }}>
            <svg viewBox="0 0 600 160" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="grad-recorde" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7a5c" />
                  <stop offset="100%" stopColor="#e04a2d" />
                </linearGradient>
              </defs>

              {/* Linhas de Grade Horizontais */}
              {[0.25, 0.5, 0.75, 1].map(pct => (
                <line
                  key={pct}
                  x1={0}
                  y1={120 - pct * 110}
                  x2={600}
                  y2={120 - pct * 110}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                />
              ))}

              {/* Linha Horizontal de Média Geral */}
              <line
                x1={0}
                y1={yMedia}
                x2={600}
                y2={yMedia}
                stroke="rgba(255, 255, 255, 0.22)"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={595}
                y={yMedia - 6}
                textAnchor="end"
                fontSize="8.5"
                fontFamily="Inter, sans-serif"
                fill="rgba(255, 255, 255, 0.35)"
                fontWeight="400"
                style={{ pointerEvents: 'none' }}
              >
                Média do período: {mediaGeral.toFixed(1)}
              </text>

              {/* Barras e Eixos */}
              {data.map((d, i) => {
                const isRecord = analytics && d.data === analytics.diaRecorde && d.total > 0;
                const barH = max > 0 ? Math.max((d.total / max) * 110, 2) : 2;
                const x = i * (barWidth + gap);
                const y = 120 - barH;
                const label = d.data.slice(8) + '/' + d.data.slice(5, 7);

                return (
                  <g key={d.data}>
                    {/* Área de interação invisível ampla */}
                    <rect
                      x={x - gap / 2}
                      y={0}
                      width={barWidth + gap}
                      height={130}
                      fill="transparent"
                      style={{ cursor: d.total > 0 ? 'pointer' : 'default' }}
                      onMouseMove={(e) => handleMouseMove(e, d, i)}
                      onMouseLeave={handleMouseLeave}
                    />

                    {/* Barra Real */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      rx="2.5"
                      ry="2.5"
                      fill={isRecord ? 'url(#grad-recorde)' : d.total > 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)'}
                      className="grow-bar-anim"
                      style={{
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Eixo X labels */}
                    {showLabel(i) && (
                      <text
                        x={x + barWidth / 2}
                        y={142}
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="Inter, sans-serif"
                        fill="rgba(255, 255, 255, 0.3)"
                        style={{ pointerEvents: 'none' }}
                      >
                        {label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Linha de Tendência de Média Móvel */}
              {mediaMovelData.length > 0 && !poucosDados && (
                <>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#4A90E2"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="fade-in-line-anim"
                    style={{ pointerEvents: 'none' }}
                  />

                  {/* Pontos da Média Móvel nos Vértices */}
                  {mediaMovelData.map((val, i) => {
                    const mmH = max > 0 ? (val / max) * 110 : 0;
                    const x = i * (barWidth + gap) + barWidth / 2;
                    const y = 120 - mmH;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#4A90E2"
                        strokeWidth="2"
                        className="fade-in-point-anim animate-delay"
                        style={{
                          pointerEvents: 'none',
                          animationDelay: `${i * 0.04}s`,
                          transformOrigin: `${x}px ${y}px`
                        }}
                      />
                    );
                  })}
                </>
              )}
            </svg>
          </div>

          {/* Banner discreto para poucos dados */}
          {poucosDados && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.06)',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '11.5px',
              color: 'var(--c-muted)',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e04a2d' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {"Aguardando mais dados para gerar tendências"}
            </div>
          )}

          {/* KPIs de Rodapé */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '9px', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{TEXTS.admin.totalPublished}</span>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--c-text)' }}>
                {analytics?.totalPeriodo ?? 0}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '9px', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{"Média Diária"}</span>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--c-text)' }}>
                {analytics?.mediaDiaria ?? 0}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '9px', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{TEXTS.admin.recordDay}</span>
              <span style={{ fontSize: '12.5px', fontWeight: 550, color: 'var(--c-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                {analytics?.quantidadeRecorde && analytics.quantidadeRecorde > 0
                  ? `${analytics.quantidadeRecorde} (${formatDateShort(analytics.diaRecorde)})`
                  : '-'
                }
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '9px', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{TEXTS.admin.trend}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: tendenciaCor, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ fontSize: '15px', lineHeight: 1 }}>{tendenciaIcon}</span>
                {tendencia}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Tooltip Absoluto flutuante de 5 linhas */}
      {tooltip && tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '11px',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            zIndex: 100,
            whiteSpace: 'nowrap',
            transition: 'left 0.05s ease, top 0.05s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '3.5px', marginBottom: '2px' }}>
            {formatDateTooltip(tooltip.data)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{TEXTS.admin.publications}</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>{tooltip.total}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{"Média móvel:"}</span>
            <span style={{ fontWeight: 600, color: '#4A90E2' }}>{tooltip.mediaMovel}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{TEXTS.admin.dailyVariation}</span>
            <span style={{ fontWeight: 600, color: tooltip.variacaoDia.startsWith('+') && tooltip.variacaoDia !== '0%' ? '#10b981' : tooltip.variacaoDia.startsWith('-') ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>
              {tooltip.variacaoDia}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{TEXTS.admin.leadingCategory}</span>
            <span style={{ fontWeight: 600, color: 'var(--c-accent)' }}>{tooltip.categoriaLider ?? 'Nenhuma'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Componente principal ────────────────────────────────── */
export default function AdminDashboard() {
  const { authFetch, user } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<7 | 14 | 30>(7);
  const [filtroAtividade, setFiltroAtividade] = useState<'tudo' | 'noticias' | 'usuarios' | 'sistema' | 'sugestoes'>('tudo');
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set());

  // Inteligência Editorial (Mais Lidas e Em Alta)
  const [abaAnalytics, setAbaAnalytics] = useState<'mais-lidas' | 'em-alta'>('mais-lidas');
  const [maisLidas, setMaisLidas] = useState<NoticiaMaisLida[]>([]);
  const [emAlta, setEmAlta] = useState<NoticiaEmAlta[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);


  const toggleGrupo = (id: string) => {
    setGruposExpandidos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  function obterMensagemGrupo(acao: string, total: number, autor: string): string {
    if (acao === 'NOTICIA_ATUALIZADA') return `${total} edições de notícias realizadas por ${autor}`;
    if (acao === 'NOTICIA_CRIADA') return `${total} novas notícias publicadas por ${autor}`;
    if (acao === 'NOTICIA_DESTAQUE_ADICIONADA') return `${total} matérias promovidas a destaque por ${autor}`;
    if (acao === 'NOTICIA_DESTAQUE_REMOVIDA') return `${total} matérias removidas de destaque por ${autor}`;
    if (acao === 'USUARIO_ATUALIZADO') return `${total} atualizações de usuários realizadas por ${autor}`;
    return `${total} ações de "${getAcaoEditorialInfo(acao).label.toLowerCase()}" executadas por ${autor}`;
  }

  const loadStats = useCallback(async (isMounted: boolean = true) => {
    try {
      setLoadingAnalytics(true);
      const res = await authFetch(`/admin/dashboard/overview?range=${range}`);
      if (!res.ok) throw new Error('Falha ao carregar dados do painel.');
      const data = await res.json();
      
      if (isMounted) {
        setStats(data.stats);
        setMaisLidas(data.maisLidas || []);
        setEmAlta(data.emAlta || []);
        setError('');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Sessão') || err.message.includes('autorizado')) {
          return;
        }
        if (isMounted) setError(err.message);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setLoadingAnalytics(false);
      }
    }
  }, [authFetch, range]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    
    // Adia a chamada para a fila de microtasks para evitar chamadas de setState síncronas em cascata no useEffect
    Promise.resolve().then(() => {
      if (isMounted) {
        loadStats(isMounted);
      }
    });

    // Polling automático removido pós-GA4 para economia de banco e rede.
    // Atualização sob demanda disponível via botão "Atualizar dados" ou no load da página.
    return () => {
      isMounted = false;
    };
  }, [user, loadStats]); // Dependemos do authFetch, user e range agora

  if (loading) {
    return (
      <div className="cms-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--c-muted)', gap: '16px' }}>
        <div className="cms-spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#ff5722', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        Carregando métricas do painel...

      </div>
    );
  }

  if (error) {
    return <div className="cms-alert cms-alert-error" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '8px' }}>{error}</div>;
  }

  const atividadesOriginais = stats?.atividades || stats?.ultimosLogs || [];

  const atividadesFiltradas = atividadesOriginais.filter(at => {
    if (filtroAtividade === 'tudo') return true;
    const info = getAcaoEditorialInfo(at.acao);
    return info.categoriaGrupo === filtroAtividade;
  });

  const atividadesAgrupadas = agruparAtividades(atividadesFiltradas).slice(0, 8);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <div className="cms-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div>
          <h2 className="cms-page-title">{TEXTS.admin.editorialRedaction}</h2>
          <p className="cms-page-subtitle" style={{ textTransform: 'capitalize' }}>
            {today}
          </p>
        </div>
        <button
          onClick={() => loadStats(true)}
          disabled={loadingAnalytics}
          className="cms-btn cms-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', height: '36px', padding: '0 14px', fontSize: '13px' }}
        >
          <svg
            className={loadingAnalytics ? 'animate-spin' : ''}
            style={{ width: '14px', height: '14px', color: loadingAnalytics ? '#ff5722' : 'inherit' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>Atualizar dados</span>
        </button>
      </div>

      {process.env.NEXT_PUBLIC_ECONOMY_MODE === "true" && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#f59e0b',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            Analytics pausado temporariamente para economia de recursos.
          </span>
        </div>
      )}

      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--c-accent)', opacity: 0.7 }}><IconArticle /></span>
          </div>
          <div className="cms-stat-value">{formatNumber(stats?.totalNoticias ?? 0)}</div>
          <div className="cms-stat-label">{TEXTS.admin.publishedNews}</div>
        </div>

        <div className="cms-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--c-secondary)', opacity: 0.7 }}><IconTag /></span>
          </div>
          <div className="cms-stat-value">{stats?.totalCategorias ?? 0}</div>
          <div className="cms-stat-label">Categorias</div>
        </div>

        <div className="cms-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--c-positive)', opacity: 0.7 }}><IconUser /></span>
          </div>
          <div className="cms-stat-value">{stats?.totalUsuarios ?? 0}</div>
          <div className="cms-stat-label">Usuários Cadastrados</div>
        </div>

        <div className="cms-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--c-warn)', opacity: 0.7 }}><IconCamera /></span>
          </div>
          <div
            className="cms-stat-value"
            style={(stats?.totalSugestoesNovas ?? 0) > 0 ? { color: 'var(--c-warn)' } : {}}
          >
            {stats?.totalSugestoesNovas ?? 0}
          </div>
          <div className="cms-stat-label">{TEXTS.admin.pendingSuggestions}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '12px', marginBottom: '12px' }}>
        <EditorialAnalytics stats={stats} range={range} setRange={setRange} />

        <div className="cms-table-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px' }}>
          {/* Abas ativas minimalistas */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px 0 16px', gap: '16px' }}>
            <button
              onClick={() => setAbaAnalytics('mais-lidas')}
              style={{
                background: 'transparent',
                border: 'none',
                color: abaAnalytics === 'mais-lidas' ? '#fff' : 'rgba(255,255,255,0.4)',
                paddingBottom: '12px',
                fontSize: '13px',
                fontWeight: abaAnalytics === 'mais-lidas' ? 600 : 500,
                cursor: 'pointer',
                borderBottom: abaAnalytics === 'mais-lidas' ? '2px solid #e04a2d' : '2px solid transparent',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              {TEXTS.admin.mostRead}
            </button>
            <button
              onClick={() => setAbaAnalytics('em-alta')}
              style={{
                background: 'transparent',
                border: 'none',
                color: abaAnalytics === 'em-alta' ? '#fff' : 'rgba(255,255,255,0.4)',
                paddingBottom: '12px',
                fontSize: '13px',
                fontWeight: abaAnalytics === 'em-alta' ? 600 : 500,
                cursor: 'pointer',
                borderBottom: abaAnalytics === 'em-alta' ? '2px solid #e04a2d' : '2px solid transparent',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              {TEXTS.admin.trending}
            </button>
          </div>

          {/* Painel Explicativo / Legenda Metodológica */}
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            padding: '8px 16px',
            fontSize: '10.5px',
            color: 'var(--c-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e04a2d', flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              {abaAnalytics === 'mais-lidas'
                ? 'Mais Lidas considera as visualizações acumuladas nos últimos 30 dias (mensal).'
                : 'Em Alta considera a aceleração e o pico de acessos recentes nas últimas 24 horas.'
              }
            </span>
          </div>

          {/* Lista de Ranking */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 8px', flexGrow: 1, gap: '4px' }}>
            {loadingAnalytics ? (
              <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--c-muted)', fontSize: '11.5px', padding: '40px 0' }}>
                {TEXTS.admin.loadingEditorialIntel}
              </div>
            ) : abaAnalytics === 'mais-lidas' ? (
              /* ABA MAIS LIDAS */
              maisLidas.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--c-muted)', fontSize: '12px' }}>
                  {TEXTS.admin.noAccumulatedAccess}
                </div>
              ) : (
                maisLidas.slice(0, 5).map((n) => (
                  <div key={n.id} className="ranking-item">
                    <span className="ranking-num">{String(n.posicao).padStart(2, '0')}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, paddingRight: '12px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: '1.35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.titulo}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--c-muted)', marginTop: '2px' }}>
                        {typeof n.categoria === 'object' && n.categoria ? n.categoria.nome : n.categoria}
                      </span>
                    </div>

                    {/* Ações contextuais em hover */}
                    <div className="ranking-actions">
                      <Link
                        href={`/admin/noticias/editar/${n.id}`}
                        title="Editar matéria"
                        style={{ color: 'rgba(255,255,255,0.4)', display: 'inline-flex', padding: '4px' }}
                      >
                        <IconPen />
                      </Link>
                      <Link
                        href={`/noticia/${n.slug}`}
                        target="_blank"
                        title="Visualizar no portal"
                        style={{ color: 'rgba(255,255,255,0.4)', display: 'inline-flex', padding: '4px' }}
                      >
                        <IconExternal />
                      </Link>
                    </div>

                    {/* Métricas e Variação */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '12px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--c-text)' }}>
                        {formatNumber(n.views)}
                      </span>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 600,
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2.5px',
                        color: n.status === 'subiu' ? '#10b981' : n.status === 'caiu' ? '#ef4444' : 'rgba(255,255,255,0.25)'
                      }}>
                        {n.status === 'subiu' && `▲ ${n.variacao}`}
                        {n.status === 'caiu' && `▼ ${n.variacao}`}
                        {n.status === 'manteve' && `●`}
                      </span>
                    </div>
                  </div>
                ))
              )
            ) : (
              /* ABA EM ALTA */
              emAlta.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--c-muted)', fontSize: '12px' }}>
                  {TEXTS.admin.noRecentTrafficPeak}
                </div>
              ) : (
                emAlta.slice(0, 5).map((n, i) => (
                  <div key={n.id} className="ranking-item">
                    <span className="ranking-num">{String(i + 1).padStart(2, '0')}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: '1.35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {n.titulo}
                        </span>
                        {n.viewsRecentes > 2 && (
                          <span className="badge-em-alta">{TEXTS.admin.trending}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--c-muted)', marginTop: '2px' }}>
                        {typeof n.categoria === 'object' && n.categoria ? n.categoria.nome : n.categoria}
                      </span>
                    </div>

                    {/* Ações contextuais em hover */}
                    <div className="ranking-actions">
                      <Link
                        href={`/admin/noticias/editar/${n.id}`}
                        title="Editar matéria"
                        style={{ color: 'rgba(255,255,255,0.4)', display: 'inline-flex', padding: '4px' }}
                      >
                        <IconPen />
                      </Link>
                      <Link
                        href={`/noticia/${n.slug}`}
                        target="_blank"
                        title="Visualizar no portal"
                        style={{ color: 'rgba(255,255,255,0.4)', display: 'inline-flex', padding: '4px' }}
                      >
                        <IconExternal />
                      </Link>
                    </div>

                    {/* Métricas e Aceleração */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '12px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--c-text)' }} title="Views nas últimas 24h">
                        {n.viewsRecentes} <span style={{ fontSize: '9px', fontWeight: 400, color: 'var(--c-muted)' }}>{TEXTS.admin.views}</span>
                      </span>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 600,
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2.5px',
                        color: n.tendencia === 'subindo' ? '#10b981' : n.tendencia === 'caiu' ? '#ef4444' : 'rgba(255,255,255,0.25)'
                      }}>
                        {n.tendencia === 'subindo' && `↗`}
                        {n.tendencia === 'caiu' && `↘`}
                        {n.tendencia === 'estavel' && `→`}
                        {n.crescimentoPercentual > 0 ? `+${n.crescimentoPercentual}%` : `0%`}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {user?.role === 'SUPER_ADMIN' && (
        <div className="cms-table-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Cabeçalho */}
        <div className="cms-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="cms-table-title" style={{ margin: 0 }}>{TEXTS.admin.editorialTimeline}</span>
            <span style={{ fontSize: '11px', color: 'var(--c-muted)', marginTop: '2px' }}>{TEXTS.admin.platformActionTrack}</span>
          </div>
          <Link href="/admin/auditoria" className="cms-btn cms-btn-secondary cms-btn-sm">
            {TEXTS.admin.viewFullAudit}
          </Link>
        </div>

        {/* Filtros em abas estilo pílula */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '0 16px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          {(['tudo', 'noticias', 'usuarios', 'sistema', 'sugestoes'] as const).map(tipo => {
            const labels = {
              tudo: 'Tudo',
              noticias: 'Notícias',
              usuarios: 'Usuários',
              sistema: 'Sistema',
              sugestoes: 'Você Repórter'
            };
            const isAtivo = filtroAtividade === tipo;
            return (
              <button
                key={tipo}
                onClick={() => {
                  setFiltroAtividade(tipo);
                  setGruposExpandidos(new Set());
                }}
                style={{
                  background: isAtivo ? '#e04a2d' : 'rgba(255, 255, 255, 0.03)',
                  border: 'none',
                  color: isAtivo ? '#fff' : 'rgba(255, 255, 255, 0.55)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: isAtivo ? 550 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                }}
                onMouseOver={(e) => {
                  if (!isAtivo) e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  if (!isAtivo) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)';
                }}
              >
                {((t: string) => {
                  switch(t) {
                    case 'noticias': return labels.noticias;
                    case 'usuarios': return labels.usuarios;
                    case 'sistema': return labels.sistema;
                    case 'sugestoes': return labels.sugestoes;
                    default: return labels.tudo;
                  }
                })(tipo)}
              </button>
            );
          })}
        </div>

        {/* Timeline real */}
        <div style={{ padding: '0 16px 16px 16px', flexGrow: 1 }}>
          {atividadesAgrupadas.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--c-muted)', fontSize: '12.5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Nenhuma atividade registrada nesta categoria
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Linha vertical conetora */}
              <div style={{
                position: 'absolute',
                left: '17px',
                top: '20px',
                bottom: '20px',
                width: '1px',
                background: 'rgba(255, 255, 255, 0.08)',
                zIndex: 0
              }} />

              {atividadesAgrupadas.map(at => {
                const info = getAcaoEditorialInfo(at.acao);
                const tempo = timeAgo(at.dataHora);
                const autor = at.usuario?.nome || 'Sistema';
                const role = at.usuario?.role === 'SUPER_ADMIN' ? 'Super Admin' : at.usuario?.role === 'ADMIN' ? 'Admin' : 'Colunista';
                const ip = at.ip;
                
                // Tratar se for agrupado
                if (at.isAgrupado) {
                  const totalGrupo = at.agrupadas?.length || 0;
                  const isExpandido = gruposExpandidos.has(at.id);
                  const msgGrupo = obterMensagemGrupo(at.acao, totalGrupo, autor);

                  return (
                    <div key={at.id} style={{ display: 'flex', flexDirection: 'column', zIndex: 1, position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        {/* Badge circular para o ícone */}
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: info.corBadge,
                            border: '1px solid rgba(255,255,255,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: info.corIcon,
                            flexShrink: 0,
                            marginRight: '12px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          {info.icon}
                        </div>

                        {/* Corpo do item agrupado */}
                        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, paddingTop: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 550, color: 'rgba(255, 255, 255, 0.9)' }}>
                              {msgGrupo}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--c-muted)', whiteSpace: 'nowrap' }}>{tempo}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <span style={{ fontSize: '10.5px', color: 'var(--c-muted)' }}>{autor}</span>
                            <span style={{ color: 'rgba(255,255,255,0.08)' }}>·</span>
                            <span style={{
                              textTransform: 'lowercase',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              fontSize: '9px',
                              color: 'rgba(255,255,255,0.45)'
                            }}>
                              {role}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.08)' }}>·</span>
                            <button
                              onClick={() => toggleGrupo(at.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#e04a2d',
                                fontSize: '10.5px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: 0,
                                outline: 'none',
                                fontWeight: 500,
                              }}
                            >
                              <span>{isExpandido ? 'Ocultar edições' : `Ver todas as ${totalGrupo} edições`}</span>
                              <span style={{ display: 'inline-flex', transition: 'transform 0.2s ease', transform: isExpandido ? 'rotate(180deg)' : 'none' }}>
                                <IconChevronDown />
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Lista expandida recuada */}
                      {isExpandido && at.agrupadas && (
                        <div style={{
                          marginLeft: '46px',
                          paddingLeft: '14px',
                          borderLeft: '1px dashed rgba(255, 255, 255, 0.08)',
                          marginTop: '8px',
                          marginBottom: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>

                          {at.agrupadas.map(subItem => {
                            const subTempo = timeAgo(subItem.dataHora);
                            return (
                              <div key={subItem.id} style={{ display: 'flex', flexDirection: 'column', padding: '2px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: info.corIcon }} />
                                  <span style={{ fontSize: '11.5px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                                    {subItem.detalhes?.titulo || subItem.detalhes?.nome || info.label}
                                  </span>
                                  <span style={{ fontSize: '9.5px', color: 'var(--c-muted)', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>
                                    {subTempo}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Renderizar atividade normal (Não agrupada)
                const isSugestao = at.tipo === 'SUGESTAO';
                const tituloAtividade = isSugestao ? 'Sugestão enviada por leitor' : info.label;

                return (
                  <div key={at.id} style={{ display: 'flex', alignItems: 'flex-start', zIndex: 1, position: 'relative' }}>
                    {/* Badge circular para o ícone */}
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: info.corBadge,
                        border: '1px solid rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: info.corIcon,
                        flexShrink: 0,
                        marginRight: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {info.icon}
                    </div>

                    {/* Corpo do item normal */}
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, paddingTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 550, color: 'rgba(255, 255, 255, 0.9)' }}>
                          {tituloAtividade}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--c-muted)', whiteSpace: 'nowrap' }}>{tempo}</span>
                      </div>

                      {/* Mini-materia ou sugestão */}
                      {!isSugestao && at.detalhes?.titulo && (
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          marginTop: '6px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          maxWidth: '100%'
                        }}>
                          {at.capaUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={at.capaUrl}
                              alt="capa"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '3px',
                                objectFit: 'cover',
                                border: '1px solid rgba(255,255,255,0.06)',
                                flexShrink: 0
                              }}
                            />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 500, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {at.detalhes?.titulo}
                            </span>
                            {at.categoriaNome && (
                              <span style={{ fontSize: '9.5px', color: 'var(--c-muted)', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#e04a2d' }} />
                                {at.categoriaNome}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sugestão Você Repórter */}
                      {isSugestao && (
                        <div style={{
                          marginTop: '6px',
                          background: 'rgba(236, 72, 153, 0.03)',
                          border: '1px solid rgba(236, 72, 153, 0.08)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'flex-start',
                          maxWidth: '100%'
                        }}>
                          {at.capaUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={at.capaUrl}
                              alt={TEXTS.navigation.reporter}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '4px',
                                objectFit: 'cover',
                                border: '1px solid rgba(255,255,255,0.06)',
                                flexShrink: 0,
                                marginTop: '1px'
                              }}
                            />
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              <span>{TEXTS.admin.reader}{at.detalhes?.nome || 'Anônimo'}</span>
                              <span>·</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{at.detalhes?.email || 'Sem e-mail'}</span>
                            </span>
                            <p style={{
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.7)',
                              margin: '3px 0 0',
                              fontStyle: 'italic',
                              lineHeight: '1.35',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {`"${at.detalhes?.relato}"`}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Metadados de auditoria */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--c-muted)', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span>{autor}</span>
                        {!isSugestao && (
                          <>
                            <span style={{ color: 'rgba(255,255,255,0.08)' }}>·</span>
                            <span style={{
                              textTransform: 'lowercase',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              fontSize: '9px',
                              color: 'rgba(255,255,255,0.45)'
                            }}>
                              {role}
                            </span>
                          </>
                        )}
                        <span style={{ color: 'rgba(255,255,255,0.08)' }}>·</span>
                        <code style={{ fontFamily: 'var(--font-mono, monospace)', color: 'rgba(255,255,255,0.2)' }}>{ip}</code>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      )}

      <div className="ed-quick-grid">
        <Link href="/admin/noticias/nova" className="ed-quick-item">
          <div className="ed-quick-icon"><IconPlus /></div>
          Nova Notícia
        </Link>

        <Link href="/admin/categorias" className="ed-quick-item">
          <div className="ed-quick-icon"><IconTag /></div>
          Categorias
        </Link>

        <Link href="/admin/colunistas" className="ed-quick-item">
          <div className="ed-quick-icon"><IconPen /></div>
          Colunistas
        </Link>

        <Link href="/" target="_blank" className="ed-quick-item">
          <div className="ed-quick-icon"><IconExternal /></div>
          Ver Portal
        </Link>
      </div>
    </>
  );
}