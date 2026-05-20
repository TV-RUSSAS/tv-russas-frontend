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

  // Login não usa o layout do CMS
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AdminLayoutInner pathname={pathname}>{children}</AdminLayoutInner>;
}

function AdminLayoutInner({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const { user, loading, logout } = useAdminAuth();

  // Calcula o título baseado na rota mais específica
  const title = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([key]) => pathname.startsWith(key))?.[1] || 'Painel';

  if (loading) {
    return (
      <div className="cms-root" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="cms-loading">
          <div className="cms-spinner" />
          Carregando painel...
        </div>
      </div>
    );
  }

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
