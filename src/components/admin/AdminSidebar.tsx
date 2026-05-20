'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminUser } from '@/hooks/useAdminAuth';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles?: string[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/noticias', label: 'Notícias', icon: '📰', roles: ['SUPER_ADMIN','ADMIN','EDITOR','COLUNISTA'] },
  { href: '/admin/categorias', label: 'Categorias', icon: '🏷️', roles: ['SUPER_ADMIN','ADMIN'] },
  { href: '/admin/colunistas', label: 'Colunistas', icon: '✍️', roles: ['SUPER_ADMIN','ADMIN'] },
  { href: '/admin/usuarios', label: 'Usuários', icon: '👥', roles: ['SUPER_ADMIN','ADMIN'] },
  { href: '/admin/sugestoes', label: 'Você Repórter', icon: '📷', roles: ['SUPER_ADMIN','ADMIN','EDITOR'] },
  { href: '/admin/auditoria', label: 'Auditoria', icon: '🔍', roles: ['SUPER_ADMIN','ADMIN'] },
  { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙️', roles: ['SUPER_ADMIN'] },
];

interface Props {
  user: AdminUser | null;
  sugestoesCount?: number;
}

export function AdminSidebar({ user, sugestoesCount }: Props) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <aside className="cms-sidebar">
      <div className="cms-sidebar-logo">
        <div className="cms-sidebar-logo-icon">TV</div>
        <div>
          <div className="cms-sidebar-logo-text">TV Russas</div>
          <div className="cms-sidebar-logo-sub">Painel Editorial</div>
        </div>
      </div>

      <div className="cms-sidebar-section">
        <div className="cms-sidebar-section-label">Menu</div>
        {visibleItems.map(item => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`cms-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="cms-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === '/admin/sugestoes' && sugestoesCount && sugestoesCount > 0 ? (
                <span className="cms-nav-badge">{sugestoesCount}</span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="cms-sidebar-footer">
        <Link href="/" className="cms-nav-item" style={{ fontSize: '13px' }}>
          <span>←</span>
          <span>Ver Portal</span>
        </Link>
      </div>
    </aside>
  );
}
