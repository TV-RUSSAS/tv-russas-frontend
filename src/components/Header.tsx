"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SearchInput } from "./SearchInput";
import { TEXTS } from "@/constants/texts";
import { apiService } from "@/services/api";

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

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const [categorias, setCategorias] = useState<{ nome: string; slug: string }[]>(CATEGORIAS_FIXAS);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchCategorias = async () => {
      try {
        const dynamicCats = await apiService.getCategorias();
        if (active && Array.isArray(dynamicCats) && dynamicCats.length > 0) {
          setCategorias(dynamicCats.map(c => ({ nome: c.nome, slug: c.slug })));
        }
      } catch (err) {
        console.error("Erro ao buscar categorias dinâmicas no Header:", err);
      }
    };
    fetchCategorias();
    return () => { active = false; };
  }, [pathname]);

  useEffect(() => {
    const handleCategoryChange = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setActiveCategory(customEvent.detail);
    };
    window.addEventListener('active-category-change', handleCategoryChange);
    return () => {
      window.removeEventListener('active-category-change', handleCategoryChange);
    };
  }, []);

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

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className={`premium-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-top">
          <div className="header-top-inner">
            <Link href="/" className="logo-wrapper">
              <Image
                // FASE 1 — Migrado de getImagePath("sistema/1.png") → /public do Next.js (Vercel)
                src="/logo-tv-russas.png"
                alt={TEXTS.brand.name}
                width={200}
                height={56}
                className="logo-img"
                priority
                style={{ height: "52px", width: "auto" }}
              />
              <span className="logo-text">{TEXTS.brand.name.toUpperCase()}</span>
            </Link>

            <div className="header-actions">
              <nav className="nav-links">
                <Link href="/" className={pathname === "/" ? "active" : ""}>
                  {TEXTS.navigation.home}
                </Link>
                <Link
                  href="/colunistas"
                  prefetch={false}
                  className={pathname === "/colunistas" ? "active" : ""}
                >
                  {TEXTS.navigation.columnists}
                </Link>
                <Link
                  href="/reporter"
                  prefetch={false}
                  className={pathname === "/reporter" ? "active" : ""}
                >
                  {TEXTS.navigation.reporter}
                </Link>
              </nav>

              <SearchInput />

              <div className="mobile-actions">
                <button
                  className="mobile-action-btn"
                  onClick={() => setShowSearch(!showSearch)}
                  aria-label={TEXTS.actions.search}
                >
                  <i className="fas fa-search" />
                </button>
                <button
                  className="mobile-menu-btn"
                  onClick={() => setMobileOpen(true)}
                  aria-label={TEXTS.navigation.menu}
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
            {categorias.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/categoria/${cat.slug}`}
                  prefetch={false}
                  className={
                    pathname === `/categoria/${cat.slug}` || activeCategory === cat.slug ? "active" : ""
                  }
                >
                  {cat.nome}
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
          <span className="drawer-logo">{TEXTS.navigation.menu}</span>
          <button className="drawer-close" onClick={() => setMobileOpen(false)}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="drawer-content">
          <div className="drawer-section">
            <span className="drawer-section-title">{TEXTS.navigation.navigation}</span>
            <nav className="drawer-nav">
              <Link href="/">
                <i className="fas fa-home" /> {TEXTS.navigation.inicio}
              </Link>
              <Link href="/colunistas" prefetch={false}>
                <i className="fas fa-user-edit" /> {TEXTS.navigation.columnists}
              </Link>
              <Link href="/reporter" prefetch={false}>
                <i className="fas fa-camera" /> {TEXTS.navigation.reporter}
              </Link>
            </nav>
          </div>

          <div className="drawer-section">
            <span className="drawer-section-title">{TEXTS.navigation.categories}</span>
            <nav className="drawer-categories">
              {categorias.map((cat) => (
                <Link 
                  key={cat.slug} 
                  href={`/categoria/${cat.slug}`}
                  prefetch={false}
                  className={
                    pathname === `/categoria/${cat.slug}` || activeCategory === cat.slug ? "active" : ""
                  }
                >
                  {cat.nome}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
