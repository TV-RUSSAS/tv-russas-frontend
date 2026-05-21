'use client';
import './admin.css';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/noticias': 'Notícias',
  '/admin/noticias/nova': 'Nova Notícia',
  '/admin/categorias': 'Categorias',
  '/admin/colunistas': 'Colunistas',
  '/admin/usuarios': 'Usuários',
  '/admin/sugestoes': 'Você Repórter',
  '/admin/auditoria': 'Logs de Auditoria',
  '/admin/configuracoes': 'Configurações',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AdminLayoutInner pathname={pathname}>{children}</AdminLayoutInner>;
}

function AdminLayoutInner({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const { user, loading, logout } = useAdminAuth();

  const title = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([key]) => pathname.startsWith(key))?.[1] || 'Painel';

  if (loading) {
    return (
      <div className="cms-root" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', display: 'flex', background: '#0a0a0a' }}>
        <div className="cms-loading" style={{ color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="cms-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#ff5722', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Carregando painel...
        </div>
      </div>
    );
  }

  // Se não houver user, não renderiza nada, porque o hook já está a enviar para o login
  if (!user) return null;

  return (
    <div className="cms-root">
      <AdminSidebar user={user} />
      <div className="cms-main">
        <AdminTopbar title={title} user={user} onLogout={logout} />
        <main className="cms-content">
          {children}
        </main>
      </div>
    </div>
  );
}