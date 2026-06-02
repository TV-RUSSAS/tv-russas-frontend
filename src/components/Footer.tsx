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
        <div className="footer-section">
          <h4>{TEXTS.navigation.categories}</h4>
          <ul>
            {categorias.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/categoria/${cat.slug}`} prefetch={false}>{cat.nome}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-section">
          <h4>{TEXTS.navigation.navigation}</h4>
          <ul>
            <li>
              <Link href="/">{TEXTS.navigation.home}</Link>
            </li>
            <li>
              <Link href="/colunistas">{TEXTS.navigation.columnists}</Link>
            </li>
            <li>
              <Link href="/reporter">{TEXTS.navigation.reporter}</Link>
            </li>
            <li>
              <Link href="/admin" style={{ opacity: 0.6 }}>
                <i className="fas fa-lock" style={{ marginRight: '4px', fontSize: '0.9em' }} /> {"Acesso Restrito"}
              </Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>{TEXTS.navigation.contact}</h4>
          <ul>
            <li>
              <i className="fas fa-envelope" /> {"contato@tvrussas.com.br"}
            </li>
            <li>
              <i className="fas fa-phone" /> {"(88) 99692-5964"}
            </li>
            <li>
              <i className="fas fa-map-marker-alt" /> {"Russas, CE"}
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} {TEXTS.brand.name}. {TEXTS.brand.rights}
      </div>
    </footer>
  );
}
