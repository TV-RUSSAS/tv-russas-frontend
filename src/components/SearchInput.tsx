"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { API_URL } from "@/services/api";
import { getImagePath } from "@/utils/imagePath";
import { TEXTS } from "@/constants/texts";

interface SearchResult {
  id: string;
  titulo: string;
  slug: string;
  capaUrl: string;
  publicadoEm: string;
  categoria: { nome: string };
}

// Cache local em memória persistente durante a sessão do cliente
const localCache: Record<string, SearchResult[]> = {};

export function SearchInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);

  // Sincronizar o input com a URL na página de busca, ou limpar ao navegar para outras páginas (Padrão recomendado pelo React 'during render')
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (pathname === "/search") {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (q && q !== query) {
          setQuery(q);
        }
      }
    } else {
      if (query !== "") {
        setQuery("");
      }
      setIsOpen(false);
    }
  }

  // Debounce search com AbortController e cache local em memória
  useEffect(() => {
    const delay = 500;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      const trimmedQuery = query.trim().toLowerCase();
      if (trimmedQuery.length >= 3) {
        // Verificar cache local em memória
        if (localCache[trimmedQuery]) {
          setResults(localCache[trimmedQuery]);
          setIsOpen(true);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
          });
          if (res.ok) {
            const data = await res.json();
            const searchResults = data.results || [];
            
            // Gravar no cache local
            localCache[trimmedQuery] = searchResults;

            setResults(searchResults);
            setIsOpen(true);
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            // Ignorar erro se a requisição foi abortada
            return;
          }
          console.error("Search error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="search-container-v2" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="search-input-wrapper-v2">
        <i className="fas fa-search search-icon-v2" />
        <input
          type="text"
          placeholder={TEXTS.actions.search + " no portal..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          autoComplete="off"
        />
        {loading && <div className="search-spinner-v2"></div>}
      </form>

      {isOpen && (
        <div className="search-dropdown-v2">
          {results.length > 0 ? (
            <div className="search-results-v2">
              <div className="search-dropdown-header-v2">{TEXTS.search.resultsFor}&quot;{query}&quot;</div>
              {results.slice(0, 3).map((noticia) => (
                <Link
                  key={noticia.id}
                  href={`/noticia/${noticia.slug}`}
                  className="search-item-v2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="search-item-img-v2">
                    <Image src={getImagePath(noticia.capaUrl)} alt={noticia.titulo} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div className="search-item-info-v2">
                    <span className="search-item-tag-v2">{noticia.categoria.nome}</span>
                    <h4 className="search-item-title-v2">{noticia.titulo}</h4>
                    <span className="search-item-date-v2">
                      {new Date(noticia.publicadoEm).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </Link>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="search-view-all-v2"
                onClick={() => setIsOpen(false)}
              >
                {results.length > 3
                  ? `Ver todos os ${results.length} resultados →`
                  : "Ver resultados completos →"}
              </Link>
            </div>
          ) : !loading && query.length >= 3 ? (
            <div className="search-empty-v2">
              {TEXTS.search.noNewsFoundFor}&quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
