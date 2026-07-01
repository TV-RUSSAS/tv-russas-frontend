"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { TEXTS } from "@/constants/texts";
const CATEGORIAS_FIXAS = [
  { nome: "Cidade", slug: "cidade" },
  { nome: "Política", slug: "politica" },
  { nome: "Esporte", slug: "esporte" },
  { nome: "Entretenimento", slug: "entretenimento" },
  { nome: "Polícia", slug: "policia" },
  { nome: "Ceará", slug: "ceara" },
  { nome: "Brasil", slug: "brasil" },
  { nome: "Mundo", slug: "mundo" },
];

export function Footer() {
  const pathname = usePathname();
  const [categorias] = useState<{ nome: string; slug: string }[]>(CATEGORIAS_FIXAS);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        
        {/* COLUNA 1: Identidade */}
        <div className="footer-section">
          <div className="footer-logo-wrapper">
            <Image
              src="/logo-footer.png"
              alt={TEXTS.brand.name}
              width={60}
              height={60}
              className="footer-logo-img"
              style={{ width: "60px", height: "60px" }}
            />
            <span className="footer-logo-text">{TEXTS.brand.name.toUpperCase()}</span>
          </div>
          <p>
            {TEXTS.brand.sloganFooter}
          </p>
          <div className="footer-social">
            <a
              href="https://www.facebook.com/share/1BN4Yrd75d/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i className="fab fa-facebook-f" />
            </a>
            <a
              href="https://www.instagram.com/tvrussas?igsh=c3g0dTIzMmtheWdw"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram" />
            </a>
            <a
              href="https://youtube.com/@sitetvrussas?si=YgAKBAXtfVgT7yuK"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <i className="fab fa-youtube" />
            </a>
          </div>
        </div>

        {/* COLUNA 2: Categorias */}
        <div className="footer-section">
          <h4>Categorias</h4>
          <ul>
            {categorias.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/categoria/${cat.slug}`}>{cat.nome}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUNA 3: Institucional */}
        <div className="footer-section">
          <h4>Institucional</h4>
          <ul>
            <li>
              <Link href="/">Página Inicial</Link>
            </li>
            <li>
              <Link href="/colunistas">Colunistas</Link>
            </li>
            <li>
              <Link href="/reporter">Você Repórter</Link>
            </li>
            <li>
              <Link href="/contato">Contato</Link>
            </li>
            <li style={{ marginTop: '16px' }}>
              <Link href="/admin" style={{ opacity: 0.6, fontSize: '0.9em' }}>
                <i className="fas fa-lock" style={{ marginRight: '4px' }} /> Acesso Restrito
              </Link>
            </li>
          </ul>
        </div>

        {/* COLUNA 4: Legal e Privacidade */}
        <div className="footer-section">
          <h4>Legal e Privacidade</h4>
          <ul>
            <li>
              <Link href="/politica-de-privacidade">Política de Privacidade</Link>
            </li>
            <li>
              <Link href="/termos-de-uso">Termos de Uso</Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TV Russas. Todos os direitos reservados.</p>
        <p style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>O conteúdo publicado neste portal é de cunho informativo e jornalístico. A TV Russas se compromete com a veracidade e atualização, ressalvados os direitos de terceiros.</p>
      </div>
    </footer>
  );
}
