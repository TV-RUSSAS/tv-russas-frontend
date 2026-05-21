'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminUser } from '@/hooks/useAdminAuth';

/* ── SVG Icons ─────────────────────────────────────────── */
const Icons = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1"/>
      <rect x="8.5" y="1.5" width="5" height="5" rx="1"/>
      <rect x="1.5" y="8.5" width="5" height="5" rx="1"/>
      <rect x="8.5" y="8.5" width="5" height="5" rx="1"/>
    </svg>
  ),
  noticias: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 1.5h6l3 3v9a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V2A.5.5 0 013 1.5z"/>
      <path d="M9 1.5v3.5h3"/>
      <line x1="4.5" y1="7.5" x2="10.5" y2="7.5"/>
      <line x1="4.5" y1="10" x2="8" y2="10"/>
    </svg>
  ),
  categorias: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 1.5h5.5l6.5 6.5-5.5 5.5-6.5-6.5V1.5z"/>
      <circle cx="5" cy="5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  colunistas: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 2a1.5 1.5 0 012.12 2.12L5.5 11.24l-3 .88.88-3L10.5 2z"/>
    </svg>
  ),
  usuarios: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="5.5" cy="5" r="2.5"/>
      <path d="M1 13.5c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5"/>
      <path d="M11.5 4.5a2 2 0 010 4"/>
      <path d="M14 13.5c0-2.2-1-3.5-2.5-4"/>
    </svg>
  ),
  reporter: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 5.5H3l1.5-2.5h6L12 5.5h1.5a.5.5 0 01.5.5v7a.5.5 0 01-.5.5H1a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5z"/>
      <circle cx="7.5" cy="8.5" r="2"/>
    </svg>
  ),
  auditoria: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 1.5L2 4v4.2c0 3.1 2.3 5.9 5.5 6.8 3.2-.9 5.5-3.7 5.5-6.8V4L7.5 1.5z"/>
      <path d="M5 7.5l1.5 1.5 3.5-3.5"/>
    </svg>
  ),
  configuracoes: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="7.5" cy="7.5" r="2.5"/>
      <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.1 3.1l1.1 1.1M10.8 10.8l1.1 1.1M3.1 11.9l1.1-1.1M10.8 4.2l1.1-1.1"/>
    </svg>
  ),
  portal: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 2.5H3a1 1 0 00-1 1v8.5a1 1 0 001 1h9a1 1 0 001-1V8.5"/>
      <path d="M9.5 1.5h4v4"/>
      <path d="M13.5 1.5L7.5 7.5"/>
    </svg>
  ),
};

/* ── Estrutura de grupos do nav ─────────────────────────── */
interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof Icons;
  roles?: string[];
  exact?: boolean;
  badge?: number;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { href: '/admin', label: 'Painel', icon: 'dashboard', exact: true },
    ],
  },
  {
    label: 'Conteúdo',
    items: [
      { href: '/admin/noticias', label: 'Notícias', icon: 'noticias', roles: ['SUPER_ADMIN','ADMIN','EDITOR','COLUNISTA'] },
      { href: '/admin/categorias', label: 'Categorias', icon: 'categorias', roles: ['SUPER_ADMIN','ADMIN'] },
      { href: '/admin/colunistas', label: 'Colunistas', icon: 'colunistas', roles: ['SUPER_ADMIN','ADMIN'] },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/admin/usuarios', label: 'Usuários', icon: 'usuarios', roles: ['SUPER_ADMIN','ADMIN'] },
      { href: '/admin/sugestoes', label: 'Você Repórter', icon: 'reporter', roles: ['SUPER_ADMIN','ADMIN','EDITOR'] },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admin/auditoria', label: 'Auditoria', icon: 'auditoria', roles: ['SUPER_ADMIN','ADMIN'] },
      { href: '/admin/configuracoes', label: 'Configurações', icon: 'configuracoes', roles: ['SUPER_ADMIN'] },
    ],
  },
];

interface Props {
  user: AdminUser | null;
  sugestoesCount?: number;
}

export function AdminSidebar({ user, sugestoesCount }: Props) {
  const pathname = usePathname();

  const canSee = (item: NavItem) => {
    if (!item.roles) return true;
    return user?.role ? item.roles.includes(user.role) : false;
  };

  return (
    <aside className="cms-sidebar">
      {/* Logo */}
      <div className="cms-sidebar-logo">
        <div className="cms-sidebar-logo-icon">TVR</div>
        <div>
          <div className="cms-sidebar-logo-text">TV Russas</div>
          <div className="cms-sidebar-logo-sub">Painel Editorial</div>
        </div>
      </div>

      {/* Grupos de navegação */}
      {NAV_GROUPS.map((group, gi) => {
        const visibleItems = group.items.filter(canSee);
        if (visibleItems.length === 0) return null;

        return (
          <div key={gi} className="cms-sidebar-section">
            {group.label && (
              <div className="cms-sidebar-section-label">{group.label}</div>
            )}
            {visibleItems.map(item => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              const hasBadge = item.href === '/admin/sugestoes' && sugestoesCount && sugestoesCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`cms-nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="cms-nav-icon">{Icons[item.icon]}</span>
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

      {/* Rodapé */}
      <div className="cms-sidebar-footer">
        <Link href="/" className="cms-nav-item" style={{ fontSize: '12.5px' }}>
          <span className="cms-nav-icon">{Icons.portal}</span>
          <span>Ver Portal</span>
        </Link>
      </div>
    </aside>
  );
}
