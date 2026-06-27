'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../app/legal.css';

interface LegalLayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/politica-de-privacidade', label: 'Política de Privacidade' },
    { href: '/termos-de-uso', label: 'Termos de Uso' },
    { href: '/contato', label: 'Contato' },
  ];

  return (
    <main className="legal-page-container">
      <div className="legal-wrapper">
        <aside className="legal-sidebar">
          <ul className="legal-sidebar-menu">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={pathname === item.href ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <article className="legal-article">
          {children}
        </article>
      </div>
    </main>
  );
}
