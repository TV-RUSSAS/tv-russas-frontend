import { getImagePath } from "@/utils/imagePath";
import Image from "next/image";
import { API_URL, apiService } from "@/services/api";
import { TEXTS } from "@/constants/texts";
import TrendingWidget from "@/components/TrendingWidget";
import "../categoria/[slug]/categoria.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  capaUrl: string;
  resumo?: string;
  conteudo?: string;
  publicadoEm: string;
  views?: number;
  categoria?: { nome: string };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  let results: Noticia[] = [];
  let suggestion: string | null = null;

  // Buscar dados da sidebar paralelamente
  const [maisLidas, trending] = await Promise.all([
    apiService.getMaisLidas(),
    apiService.getTrending(),
  ]);

  if (query) {
    try {
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        results = data.results || [];
        suggestion = data.suggestion || null;
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    }
  }

  return (
    <div className="search-page-wrapper">
      <main className="site-container">
        <div className="search-advanced-container">
          <div className="search-header-premium">
            <span className="search-subtitle">{TEXTS.search.editorialSearch}</span>
            <h1 className="search-main-title">
              {query ? `${TEXTS.search.resultsFor}"${query}"` : "O que você está procurando?"}
            </h1>
            
            {suggestion && (
              <div className="search-suggestion">
                <span>{TEXTS.search.didYouMean}</span>
                <a href={`/search?q=${suggestion}`} className="suggestion-link">
                  {suggestion}
                </a>
              </div>
            )}

            <div className="search-meta-info">
              <p className="search-count">
                {results.length > 0 
                  ? `${results.length} ${results.length === 1 ? "matéria encontrada" : "matérias encontradas"}`
                  : query ? "Nenhuma matéria encontrada com este termo exato." : "Digite um termo para pesquisar em nosso acervo."}
              </p>
            </div>
          </div>

          <div className="categoria-layout-columns">
            {/* Coluna da Esquerda: Resultados */}
            <main className="categoria-feed-principal">
              {results.length > 0 ? (
                <div className="search-results-list">
                  {results.map((noticia) => (
                    <a
                      key={noticia.id}
                      href={`/noticia/${noticia.slug}`}
                      className="search-result-horizontal-card group"
                    >
                      {/* Imagem */}
                      <div className="search-result-img-wrapper">
                        <Image
                          src={getImagePath(noticia.capaUrl)}
                          alt={noticia.titulo}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Texto */}
                      <div className="search-result-info">
                        <span className="search-result-tag">
                          {noticia.categoria?.nome}
                        </span>
                        
                        <h3 className="search-result-title">
                          {noticia.titulo}
                        </h3>

                        <p className="search-result-excerpt">
                          {noticia.resumo || (noticia.conteudo ? noticia.conteudo.substring(0, 160) + '...' : '')}
                        </p>

                        <div className="search-result-meta">
                          <span>
                            <i className="far fa-calendar-alt"></i>
                            {new Date(noticia.publicadoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : query ? (
                <div className="search-no-results">
                  <i className="fas fa-search-minus"></i>
                  <h3>{TEXTS.search.noNewsFound}</h3>
                  <p>{TEXTS.search.tryOtherTerms}</p>
                </div>
              ) : null}
            </main>

            {/* Coluna da Direita: Sidebar */}
            <aside className="categoria-sidebar">
              {maisLidas && maisLidas.length > 0 && (
                <TrendingWidget items={maisLidas.slice(0, 5) as import("@/types").Noticia[]} title="Mais Lidas" />
              )}
              {trending && trending.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <TrendingWidget items={trending.slice(0, 5) as import("@/types").Noticia[]} title="Em Alta" />
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
