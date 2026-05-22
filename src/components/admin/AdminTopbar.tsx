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
    : '—';

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="cms-topbar">
      <h1 className="cms-topbar-title">{title}</h1>

      <div className="cms-topbar-right">
        {/* Data atual */}
        <span className="ed-topbar-date">{today}</span>

        {/* Usuário */}
        {user && (
          <div className="cms-user-chip" onClick={onLogout} title="Clique para sair da sessão">
            <div className="cms-user-avatar">{initials}</div>
            <span className="cms-user-name">{user.nome.split(' ')[0]}</span>
          </div>
        )}
      </div>
    </header>
  );
}
