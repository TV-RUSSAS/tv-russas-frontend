'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminUser } from '@/hooks/useAdminAuth';

interface Props {
  title: string;
  user: AdminUser | null;
  onLogout: () => void;
}

export function AdminTopbar({ title, user, onLogout }: Props) {
  const pathname = usePathname();

  const initials = user?.nome
    ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '—';

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const showNewPost = pathname === '/admin' || pathname.startsWith('/admin/noticias');

  return (
    <header className="cms-topbar">
      <h1 className="cms-topbar-title">{title}</h1>

      <div className="cms-topbar-right">
        {/* Data atual */}
        <span className="ed-topbar-date">{today}</span>

        {/* Atalho Nova Notícia */}
        {showNewPost && (
          <Link href="/admin/noticias/nova" className="cms-btn cms-btn-primary cms-btn-sm">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="6.5" y1="1.5" x2="6.5" y2="11.5"/>
              <line x1="1.5" y1="6.5" x2="11.5" y2="6.5"/>
            </svg>
            Nova Notícia
          </Link>
        )}

        {/* Usuário */}
        {user && (
          <div className="cms-user-chip" onClick={onLogout} title="Clique para sair da sessão">
            <div className="cms-user-avatar">{initials}</div>
            <span className="cms-user-name">{user.nome.split(' ')[0]}</span>
            <span className={`cms-role-badge ${user.role}`}>
              {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
