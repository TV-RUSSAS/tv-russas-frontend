'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminUser } from '@/hooks/useAdminAuth';
import { useState, useEffect } from 'react';
import { TEXTS } from '@/constants/texts';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  PenTool,
  Image as ImageIcon,
  Tag,
  Megaphone,
  Inbox,
  MessageCircle,
  Users,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  LineChart,
  Database,
  Settings,
  ExternalLink
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  COLUNISTA: 'Colunista',
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  roles?: string[];
  exact?: boolean;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'PAINEL',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'CONTEÚDO',
    items: [
      { href: '/admin/noticias', label: 'Notícias', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'COLUNISTA'] },
      { href: '/admin/categorias', label: 'Categorias', icon: FolderTree, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { href: '/admin/colunistas', label: 'Colunistas', icon: PenTool, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { href: '/admin/banners', label: 'Banners', icon: ImageIcon, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    label: 'INTERAÇÃO',
    items: [
      { href: '/admin/sugestoes', label: 'Você Repórter', icon: Megaphone, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
    ],
  },
  {
    label: 'USUÁRIOS',
    items: [
      { href: '/admin/usuarios', label: 'Usuários', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    label: 'ANÁLISES',
    items: [
      { href: '/admin/mais-lidas', label: 'Mais lidas', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { href: '/admin/em-alta', label: 'Em alta', icon: TrendingUp, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      { href: '/admin/analytics', label: 'Analytics', icon: LineChart, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { href: '/admin/auditoria', label: 'Auditoria', icon: Database, roles: ['SUPER_ADMIN'] },
      { href: '/admin/configuracoes', label: 'Configurações', icon: Settings, roles: ['SUPER_ADMIN'] },
    ],
  },
];

interface Props {
  user: AdminUser | null;
  sugestoesCount?: number;
}

export function AdminSidebar({ user, sugestoesCount }: Props) {
  const pathname = usePathname();
  const logoUrl = '/logo-tv-russas.png';

  const canSee = (item: NavItem) => {
    if (!item.roles) return true;
    return user?.role ? item.roles.includes(user.role) : false;
  };

  return (
    <aside className="cms-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Topo / Logo */}
      <div className="cms-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 16px', borderBottom: '1px solid var(--c-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={logoUrl} 
            alt={"Logo " + TEXTS.brand.name} 
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = '<span style="font-size: 11px; font-weight: 800; color: #fff;">TVR</span>';
              }
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span className="cms-sidebar-logo-text" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--c-text)', letterSpacing: '-0.01em' }}>{TEXTS.brand.name}</span>
          <span className="cms-sidebar-logo-sub" style={{ fontSize: '10px', color: 'var(--c-secondary)', fontWeight: '400', opacity: 0.8 }}>{TEXTS.brand.panel}</span>
        </div>
      </div>

      {/* Lista de Grupos e Itens de Navegação (Rolável) */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }} className="cms-sidebar-nav-scroll">
        {NAV_GROUPS.map((group, gi) => {
          const visibleItems = group.items.filter(canSee);
          if (visibleItems.length === 0) return null;

          return (
            <div key={gi} className="cms-sidebar-section" style={{ padding: gi === 0 ? '16px 12px 4px' : '12px 12px 4px' }}>
              <div className="cms-sidebar-section-label" style={{ fontSize: '10px', color: 'var(--c-muted)', fontWeight: '600', letterSpacing: '0.08em', padding: '0 8px', marginBottom: '6px' }}>
                {group.label}
              </div>
              {visibleItems.map(item => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                const IconComponent = item.icon;
                const hasBadge = item.href === '/admin/sugestoes' && sugestoesCount && sugestoesCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`cms-nav-item${isActive ? ' active' : ''}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="cms-nav-icon">
                      <IconComponent size={15} strokeWidth={isActive ? 2.2 : 1.6} />
                    </span>
                    <span>{item.label}</span>
                    {hasBadge && (
                      <span className="cms-nav-badge">{sugestoesCount}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Rodapé da Sidebar (Link de Saída) */}
      <div className="cms-sidebar-footer" style={{ borderTop: '1px solid var(--c-border)', background: 'rgba(0, 0, 0, 0.25)', padding: '12px 16px', flexShrink: 0 }}>
        {/* Link para o Portal Público */}
        <Link href="/" target="_blank" className="cms-nav-item" style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--c-border)', borderRadius: '4px', fontSize: '13px', justifyContent: 'center', gap: '8px', display: 'flex', width: '100%' }}>
          <ExternalLink size={14} />
          <span>{"Ver Portal"}</span>
        </Link>
      </div>

      {/* Estilos locais para animação pulse */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </aside>
  );
}
