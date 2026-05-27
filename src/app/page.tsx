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
    fallbackNews,
    bannerTopoHome,
    bannerMeioHome,
  ] = await Promise.all([
    apiService.getDestaques(),
    apiService.getUltimasNoticias(6),
    apiService.getMaisLidas(),
    apiService.getTrending(),
    apiService.getCategorias(),
    apiService.getUltimasNoticias(10), // Fallback for sidebar
    apiService.getBannerAtivo("topo_home").catch(() => null),
    apiService.getBannerAtivo("meio_home").catch(() => null),
  ]);

  // Buscar notícias de cada categoria de forma paralela
  const noticiasPorCategoria = await Promise.all(
    categorias.map(async (cat) => {
      const noticias = await apiService.getNoticiasByCategoria(cat.slug, 3);
      return {
        categoria: cat,
        noticias,
      };
    }),
  );

  // Filtrar apenas categorias que possuem pelo menos 1 notícia
  const categoriasAtivas = noticiasPorCategoria.filter(
    (item) => item.noticias.length > 0,
  );

  // 1. Destaques (Top Banner)
  const destaque = destaques[0];
  const heroSide1 = destaques[1];
  const heroSide2 = destaques[2];

  // 2. Mais Lidas e Trending (Sidebar)
  const maisLidas =
    maisLidasRaw.length > 0 ? maisLidasRaw : fallbackNews.slice(0, 5);
  const trending =
    trendingRaw.length > 0 ? trendingRaw : fallbackNews.slice(5, 10);

  return (
    <main className="premium-home">
      {/* BANNER PRINCIPAL PREMIUM (TOP) */}
      <div
        className="premium-ad-wrapper"
        style={{ marginTop: "0", marginBottom: "24px", maxWidth: "970px", marginLeft: "auto", marginRight: "auto" }}
      >
        <a 
          href={bannerTopoHome?.linkUrl || "#"} 
          target={bannerTopoHome?.linkUrl ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className="premium-ad-container-v2"
          style={{ cursor: bannerTopoHome?.linkUrl ? "pointer" : "default" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerTopoHome ? getImagePath(bannerTopoHome.imageUrl) : getImagePath("anuncio/banner2.png")}
            alt={bannerTopoHome?.titulo || "Patrocínio Premium"}
            style={{ width: "100%", height: "auto", maxHeight: "110px", objectFit: "contain", display: "block" }}
          />
        </a>
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
            style={{ margin: "20px 0" }}
          >
            <a
              href={bannerMeioHome?.linkUrl || "https://dinheironamao.trabalho.ce.gov.br"}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-ad-container-v2"
              style={{ cursor: (bannerMeioHome?.linkUrl || "https://dinheironamao.trabalho.ce.gov.br") ? "pointer" : "default" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerMeioHome ? getImagePath(bannerMeioHome.imageUrl) : getImagePath("anuncio/Anuncio1.png")}
                alt={bannerMeioHome?.titulo || "Publicidade Governo do Ceará"}
                style={{ width: "100%", height: "auto", maxHeight: "140px", objectFit: "cover", borderRadius: "8px", display: "block" }}
              />
            </a>
          </div>

          {(() => {
            const elementosLayout: React.ReactNode[] = [];

            // Separa YouTube para renderizar no final
            const isYT = (item: (typeof categoriasAtivas)[0]) =>
              item.categoria.slug === "youtube" ||
              item.categoria.nome.toLowerCase() === "youtube";

            const youtubeItem = categoriasAtivas.find(isYT);
            const categoriasSemYT = categoriasAtivas.filter((c) => !isYT(c));

            let i = 0;
            while (i < categoriasSemYT.length) {
              // Os dois primeiros itens (ex: Esporte e Política) renderizam como Mixed (bloco grande)
              // Os itens subsequentes (ex: Cidade & Entretenimento, Ceará & Polícia) renderizam em formato Parallel (lado a lado)
              if (i < 2) {
                // Formato Mixed: caixa branca com imagem grande à esquerda
                const item = categoriasSemYT[i];
                if (item) {
                  elementosLayout.push(
                    <section
                      key={item.categoria.slug}
                      className="premium-section bg-light-gray rounded-box"
                    >
                      <SectionHeader
                        title={item.categoria.nome}
                        link={`/categoria/${item.categoria.slug}`}
                      />
                      <div className="news-grid-mixed">
                        {item.noticias[0] && (
                          <PremiumCard
                            noticia={item.noticias[0]}
                            size="medium"
                          />
                        )}
                        <div className="mixed-list">
                          {item.noticias.slice(1, 3).map((n) => (
                            <PremiumCard key={n.slug} noticia={n} size="list" />
                          ))}
                        </div>
                      </div>
                    </section>,
                  );
                }
                i++;
              } else {
                // Formato Parallel: duas colunas lado a lado, SEM caixa branca
                const item1 = categoriasSemYT[i];
                const item2 = categoriasSemYT[i + 1];

                if (item1 && item2) {
                  elementosLayout.push(
                    <div
                      key={`${item1.categoria.slug}-${item2.categoria.slug}`}
                      className="parallel-sections"
                    >
                      <div className="parallel-col">
                        <SectionHeader
                          title={item1.categoria.nome}
                          link={`/categoria/${item1.categoria.slug}`}
                        />
                        <div className="parallel-list">
                          {item1.noticias.slice(0, 3).map((n) => (
                            <PremiumCard key={n.slug} noticia={n} size="list" />
                          ))}
                        </div>
                      </div>
                      <div className="parallel-col">
                        <SectionHeader
                          title={item2.categoria.nome}
                          link={`/categoria/${item2.categoria.slug}`}
                        />
                        <div className="parallel-list">
                          {item2.noticias.slice(0, 3).map((n) => (
                            <PremiumCard key={n.slug} noticia={n} size="list" />
                          ))}
                        </div>
                      </div>
                    </div>,
                  );
                  i += 2;
                } else if (item1) {
                  // Último item sem par: renderiza como Mixed
                  elementosLayout.push(
                    <section
                      key={item1.categoria.slug}
                      className="premium-section bg-light-gray rounded-box"
                    >
                      <SectionHeader
                        title={item1.categoria.nome}
                        link={`/categoria/${item1.categoria.slug}`}
                      />
                      <div className="news-grid-mixed">
                        {item1.noticias[0] && (
                          <PremiumCard
                            noticia={item1.noticias[0]}
                            size="medium"
                          />
                        )}
                        <div className="mixed-list">
                          {item1.noticias.slice(1, 3).map((n) => (
                            <PremiumCard key={n.slug} noticia={n} size="list" />
                          ))}
                        </div>
                      </div>
                    </section>,
                  );
                  i++;
                } else {
                  i++;
                }
              }
            }

            // YouTube sempre no final
            if (youtubeItem) {
              elementosLayout.push(
                <section
                  key={youtubeItem.categoria.slug}
                  className="premium-section bg-light-gray rounded-box"
                >
                  <SectionHeader
                    title={youtubeItem.categoria.nome}
                    link={`/categoria/${youtubeItem.categoria.slug}`}
                  />
                  <div className="news-grid-mixed">
                    {youtubeItem.noticias[0] && (
                      <PremiumCard
                        noticia={youtubeItem.noticias[0]}
                        size="medium"
                      />
                    )}
                    <div className="mixed-list">
                      {youtubeItem.noticias.slice(1, 3).map((n) => (
                        <PremiumCard key={n.slug} noticia={n} size="list" />
                      ))}
                    </div>
                  </div>
                </section>,
              );
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
