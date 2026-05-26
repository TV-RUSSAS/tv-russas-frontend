export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { TEXTS } from "@/constants/texts";
import PremiumCard from "@/components/PremiumCard";
import TrendingWidget from "@/components/TrendingWidget";
import { apiService } from "@/services/api";
import { getImagePath } from "@/utils/imagePath";

// --- COMPONENTES UI ---

function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="section-header-premium">
      <h2 className="section-title-premium">{title}</h2>
      {link && (
        <Link href={link} className="section-view-all">
          {TEXTS.navigation.verTodas} <i className="fas fa-chevron-right"></i>
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [
    destaques,
    ultimasNoticias,
    maisLidasRaw,
    trendingRaw,
    categorias,
    fallbackNews
  ] = await Promise.all([
    apiService.getDestaques(),
    apiService.getUltimasNoticias(6),
    apiService.getMaisLidas(),
    apiService.getTrending(),
    apiService.getCategorias(),
    apiService.getUltimasNoticias(10) // Fallback for sidebar
  ]);

  // Buscar notícias de cada categoria de forma paralela
  const noticiasPorCategoria = await Promise.all(
    categorias.map(async (cat) => {
      const noticias = await apiService.getNoticiasByCategoria(cat.slug, 3);
      return {
        categoria: cat,
        noticias,
      };
    })
  );

  // Filtrar apenas categorias que possuem pelo menos 1 notícia
  const categoriasAtivas = noticiasPorCategoria.filter(item => item.noticias.length > 0);

  // 1. Destaques (Top Banner)
  const destaque = destaques[0];
  const heroSide1 = destaques[1];
  const heroSide2 = destaques[2];

  // 2. Mais Lidas e Trending (Sidebar)
  const maisLidas = maisLidasRaw.length > 0 ? maisLidasRaw : fallbackNews.slice(0, 5);
  const trending = trendingRaw.length > 0 ? trendingRaw : fallbackNews.slice(5, 10);

  return (
    <main className="premium-home">
      {/* BANNER PRINCIPAL PREMIUM (TOP) */}
      <div
        className="premium-ad-wrapper"
        style={{ marginTop: "0", marginBottom: "20px", maxWidth: "1100px" }}
      >
        <Link href="#" className="premium-ad-container-v2">
          <Image
            src={getImagePath("anuncio/banner2.png")}
            alt="Patrocínio Premium"
            width={1280}
            height={120}
            className="premium-ad-full-v2"
            priority
          />
        </Link>
      </div>

      {/* HERO SECTION */}
      <section className="premium-hero-section">
        <div className="hero-grid">
          {destaque && (
            <div className="hero-main">
              <PremiumCard noticia={destaque} size="large" />
            </div>
          )}
          <div className="hero-sidebar">
            {heroSide1 && <PremiumCard noticia={heroSide1} size="medium" />}
            {heroSide2 && <PremiumCard noticia={heroSide2} size="medium" />}
          </div>
        </div>
      </section>

      <div className="premium-main-layout">
        <div className="premium-content-area">
          <section className="premium-section">
            <SectionHeader title="Últimas Notícias" />
            <div className="news-grid-modern">
              {ultimasNoticias.map((n) => (
                <PremiumCard key={n.slug} noticia={n} size="small" />
              ))}
            </div>
          </section>

          <div
            className="premium-ad-wrapper"
            style={{ margin: "25px 0", width: "100%" }}
          >
            <Link
              href="https://dinheironamao.trabalho.ce.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="premium-ad-container-v2"
            >
              <Image
                src={getImagePath("anuncio/Anuncio1.png")}
                alt="Publicidade Governo do Ceará"
                width={1280}
                height={140}
                className="premium-ad-full-v2"
                loading="lazy"
                style={{ objectFit: "cover", borderRadius: "8px" }}
              />
            </Link>
          </div>

          {(() => {
            const elementosLayout: React.ReactNode[] = [];
            let i = 0;
            
            while (i < categoriasAtivas.length) {
              const resto = i % 3;
              
              if (resto === 0 || resto === 1) {
                // Renderizar em formato Mixed (bloco inteiro)
                const item = categoriasAtivas[i];
                if (item) {
                  elementosLayout.push(
                    <section key={item.categoria.slug} className="premium-section bg-light-gray rounded-box" style={{ marginTop: "20px", marginBottom: "20px" }}>
                      <SectionHeader title={item.categoria.nome} link={`/categoria/${item.categoria.slug}`} />
                      <div className="news-grid-mixed">
                        {item.noticias[0] && <PremiumCard noticia={item.noticias[0]} size="medium" />}
                        <div className="mixed-list">
                          {item.noticias.slice(1, 3).map((n) => (
                            <PremiumCard key={n.slug} noticia={n} size="list" />
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }
                i++;
              } else {
                // Renderizar em formato Parallel (lado a lado) - pega i e i + 1
                const item1 = categoriasAtivas[i];
                const item2 = categoriasAtivas[i + 1];
                
                if (item1 && item2) {
                  elementosLayout.push(
                    <div key={`${item1.categoria.slug}-${item2.categoria.slug}`} className="parallel-sections" style={{ marginTop: "20px", marginBottom: "20px" }}>
                      <div className="parallel-col">
                        <SectionHeader title={item1.categoria.nome} link={`/categoria/${item1.categoria.slug}`} />
                        <div className="parallel-list">
                          {item1.noticias.slice(0, 3).map((n) => (
                            <PremiumCard key={n.slug} noticia={n} size="list" />
                          ))}
                        </div>
                      </div>
                      <div className="parallel-col">
                        <SectionHeader title={item2.categoria.nome} link={`/categoria/${item2.categoria.slug}`} />
                        <div className="parallel-list">
                          {item2.noticias.slice(0, 3).map((n) => (
                            <PremiumCard key={n.slug} noticia={n} size="list" />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                  i += 2;
                } else if (item1) {
                  // Se for a última e não tiver par para parallel, renderiza como Mixed!
                  elementosLayout.push(
                    <section key={item1.categoria.slug} className="premium-section bg-light-gray rounded-box" style={{ marginTop: "20px", marginBottom: "20px" }}>
                      <SectionHeader title={item1.categoria.nome} link={`/categoria/${item1.categoria.slug}`} />
                      <div className="news-grid-mixed">
                        {item1.noticias[0] && <PremiumCard noticia={item1.noticias[0]} size="medium" />}
                        <div className="mixed-list">
                          {item1.noticias.slice(1, 3).map((n) => (
                            <PremiumCard key={n.slug} noticia={n} size="list" />
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                  i++;
                } else {
                  i++;
                }
              }
            }
            
            return elementosLayout;
          })()}
        </div>

        <aside className="premium-sidebar">
          <div
            className="sidebar-widget"
            style={{
              marginTop: "74px",
              background: "transparent",
              padding: "0",
              boxShadow: "none",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <a
              href="https://www.instagram.com/tvrussas/"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-ad-box"
            >
              <Image
                src={getImagePath("sistema/tv.jpg")}
                alt={TEXTS.brand.name + " no Instagram"}
                fill
                sizes="300px"
                style={{ objectFit: "cover" }}
              />
              <div className="ad-overlay">{"Siga no Instagram"}</div>
            </a>
          </div>

          <TrendingWidget items={trending} title={TEXTS.widgets.trending} />

          <div className="sticky-widget">
            <TrendingWidget items={maisLidas} title={TEXTS.widgets.mostRead} />
          </div>
        </aside>
      </div>
    </main>
  );
}
