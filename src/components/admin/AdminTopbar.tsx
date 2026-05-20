'use client';
import { AdminUser } from '@/hooks/useAdminAuth';

interface Props {
  title: string;
  user: AdminUser | null;
  onLogout: () => void;
}

export function AdminTopbar({ title, user, onLogout }: Props) {
  const initials = user?.nome
    ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <header className="cms-topbar">
      <h1 className="cms-topbar-title">{title}</h1>
      <div className="cms-topbar-right">
        {user && (
          <div className="cms-user-chip" onClick={onLogout} title="Clique para sair">
            <div className="cms-user-avatar">{initials}</div>
            <span className="cms-user-name">{user.nome.split(' ')[0]}</span>
            <span className={`cms-role-badge ${user.role}`}>{user.role.replace('_', ' ')}</span>
          </div>
        )}
      </div>
    </header>
  );
}
