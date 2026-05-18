"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SearchInput } from "./SearchInput";
import { getImagePath } from "@/utils/imagePath";

const CATEGORIAS = [
  { label: "Cidade", slug: "cidade" },
  { label: "Política", slug: "politica" },
  { label: "Esporte", slug: "esporte" },
  { label: "Entretenimento", slug: "entretenimento" },
  { label: "Polícia", slug: "policia" },
  { label: "Youtube", slug: "youtube" },
  { label: "Brasil", slug: "brasil" },
  { label: "Ceará", slug: "ceara" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled((prev) => {
        if (currentScrollY > 150) return true;
        if (currentScrollY < 50) return false;
        return prev;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fechar o menu/busca mobile quando a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setShowSearch(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bloquear scroll do body quando menu estiver aberto
  useEffect(() => {
    if (mobileOpen || showSearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen, showSearch]);

  // Fechar menu ao mudar de rota (ajuste de estado durante a renderização)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
    if (showSearch) setShowSearch(false);
  }

  return (
    <>
      <header className={`premium-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-top">
          <div className="header-top-inner">
            <Link href="/" className="logo-wrapper">
              <Image
                src={getImagePath(encodeURI("sistema/1.png"))}
                alt="TV Russas"
                width={200}
                height={56}
                className="logo-img"
                priority
                style={{ height: "52px", width: "auto" }}
              />
              <span className="logo-text">TV RUSSAS</span>
            </Link>

            <div className="header-actions">
              <nav className="nav-links">
                <Link href="/" className={pathname === "/" ? "active" : ""}>
                  Página Inicial
                </Link>
                <Link
                  href="/colunistas"
                  className={pathname === "/colunistas" ? "active" : ""}
                >
                  Colunistas
                </Link>
                <Link
                  href="/reporter"
                  className={pathname === "/reporter" ? "active" : ""}
                >
                  Você Repórter
                </Link>
              </nav>

              <SearchInput />

              <div className="mobile-actions">
                <button
                  className="mobile-action-btn"
                  onClick={() => setShowSearch(!showSearch)}
                  aria-label="Buscar"
                >
                  <i className="fas fa-search" />
                </button>
                <button
                  className="mobile-menu-btn"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Menu"
                >
                  <i className="fas fa-bars" />
                </button>
              </div>
            </div>
          </div>

          {/* Busca Mobile (Apenas quando ativada) */}
          {showSearch && (
            <div className="mobile-search-overlay">
              <div className="mobile-search-container">
                <SearchInput />
                <button
                  className="close-search-btn"
                  onClick={() => setShowSearch(false)}
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="category-nav">
          <ul className="category-list">
            {CATEGORIAS.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/categoria/${cat.slug}`}
                  className={
                    pathname === `/categoria/${cat.slug}` ? "active" : ""
                  }
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={`mobile-drawer-overlay ${mobileOpen ? "active" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <span className="drawer-logo">MENU</span>
          <button className="drawer-close" onClick={() => setMobileOpen(false)}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="drawer-content">
          <div className="drawer-section">
            <span className="drawer-section-title">Navegação</span>
            <nav className="drawer-nav">
              <Link href="/">
                <i className="fas fa-home" /> Início
              </Link>
              <Link href="/colunistas">
                <i className="fas fa-user-edit" /> Colunistas
              </Link>
              <Link href="/reporter">
                <i className="fas fa-camera" /> Você Repórter
              </Link>
            </nav>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-title">Categorias</span>
            <nav className="drawer-categories">
              {CATEGORIAS.map((cat) => (
                <Link key={cat.slug} href={`/categoria/${cat.slug}`}>
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
