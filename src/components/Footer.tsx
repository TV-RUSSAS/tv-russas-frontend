"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getImagePath } from "@/utils/imagePath";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-section">
          <div className="footer-logo-wrapper">
            <Image
              src={getImagePath("sistema/5.png")}
              alt="TV Russas"
              width={60}
              height={60}
              className="footer-logo-img"
              style={{ width: "60px", height: "60px" }}
            />
            <span className="footer-logo-text">TV RUSSAS</span>
          </div>
          <p>
            O portal de notícias da sua cidade. Informação com credibilidade e
            agilidade.
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
          <h4>Categorias</h4>
          <ul>
            <li>
              <Link href="/categoria/cidade">Cidade</Link>
            </li>
            <li>
              <Link href="/categoria/politica">Política</Link>
            </li>
            <li>
              <Link href="/categoria/esporte">Esporte</Link>
            </li>
            <li>
              <Link href="/categoria/entretenimento">Entretenimento</Link>
            </li>
            <li>
              <Link href="/categoria/policia">Polícia</Link>
            </li>
            <li>
              <Link href="/categoria/youtube">YouTube</Link>
            </li>
            <li>
              <Link href="/categoria/brasil">Brasil</Link>
            </li>
            <li>
              <Link href="/categoria/ceara">Ceará</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Navegação</h4>
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
              <Link href="/admin" style={{ opacity: 0.6 }}>
                <i className="fas fa-lock" style={{ marginRight: '4px', fontSize: '0.9em' }} /> Acesso Restrito
              </Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contato</h4>
          <ul>
            <li>
              <i className="fas fa-envelope" /> contato@tvrussas.com.br
            </li>
            <li>
              <i className="fas fa-phone" /> (88) 99692-5964
            </li>
            <li>
              <i className="fas fa-map-marker-alt" /> Russas, CE
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} TV Russas. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
