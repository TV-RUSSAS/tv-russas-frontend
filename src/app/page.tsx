import Link from "next/link";
import Image from "next/image";
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
          Ver todas <i className="fas fa-chevron-right"></i>
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [noticiasRaw, maisLidasRaw, trendingRaw] = await Promise.all([
    apiService.getNoticias(),
    apiService.getMaisLidas(),
    apiService.getTrending(),
  ]);

  // --- LÓGICA DE DEDUPLICAÇÃO E ORGANIZAÇÃO ---
  const exibidasIds = new Set<string>();

  // 1. Pegar os destaques manuais primeiro
  const destaquesManuais = noticiasRaw
    .filter((n) => n.featured)
    .sort(
      (a, b) =>
        new Date(b.publicadoEm).getTime() - new Date(a.publicadoEm).getTime(),
    );

  const idsDestaquesManuais = new Set(destaquesManuais.map((n) => n.id));
  const poolRestante = noticiasRaw.filter(
    (n) => !idsDestaquesManuais.has(n.id),
  );

  const findNews = (keyword: string) =>
    noticiasRaw.find((n) =>
      n.titulo.toLowerCase().includes(keyword.toLowerCase()),
    );

  const destaque =
    findNews("construção") ||
    findNews("medicina") ||
    destaquesManuais[0] ||
    poolRestante[0];
  const heroSide1 =
    findNews("kits natalidade") || destaquesManuais[1] || poolRestante[1];
  const heroSide2 =
    findNews("jovem é presa") || destaquesManuais[2] || poolRestante[2];

  if (destaque) exibidasIds.add(destaque.id);
  if (heroSide1) exibidasIds.add(heroSide1.id);
  if (heroSide2) exibidasIds.add(heroSide2.id);

  const ultimasNoticias = noticiasRaw
    .filter((n) => !exibidasIds.has(n.id))
    .slice(0, 6);
  ultimasNoticias.forEach((n) => exibidasIds.add(n.id));

  // 3. Mais Lidas e Trending (Sidebar)
  const maisLidas = maisLidasRaw.length > 0 ? maisLidasRaw : noticiasRaw.slice(0, 5);
  const trending = trendingRaw.length > 0 ? trendingRaw : noticiasRaw.slice(5, 10);

  const getCategory = (slug: string, limit: number = 4) => {
    return noticiasRaw
      .filter(
        (n) =>
          !exibidasIds.has(n.id) &&
          (n.categoria.slug.toLowerCase() === slug.toLowerCase() ||
            n.categoria.nome.toLowerCase() === slug.toLowerCase()),
      )
      .slice(0, limit);
  };
  const politica = getCategory("politica");
  const cidade = getCategory("cidade");
  const esporte = getCategory("esporte");
  const brasil = getCategory("brasil");
  const entretenimento = getCategory("entretenimento");
  const policia = getCategory("policia");
  const youtube = getCategory("youtube");
  const ceara = getCategory("ceara");

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


          {cidade.length > 0 && (
            <section className="premium-section bg-light-gray rounded-box">
              <SectionHeader title="Cidade" link="/categoria/cidade" />
              <div className="news-grid-mixed">
                {cidade[0] && <PremiumCard noticia={cidade[0]} size="medium" />}
                <div className="mixed-list">
                  {cidade.slice(1).map((n) => (
                    <PremiumCard key={n.slug} noticia={n} size="list" />
                  ))}
                </div>
              </div>
            </section>
          )}

          {politica.length > 0 && (
            <section className="premium-section bg-light-gray rounded-box">
              <SectionHeader title="Política" link="/categoria/politica" />
              <div className="news-grid-mixed">
                {politica[0] && (
                  <PremiumCard noticia={politica[0]} size="medium" />
                )}
                <div className="mixed-list">
                  {politica.slice(1, 4).map((n) => (
                    <PremiumCard key={n.slug} noticia={n} size="list" />
                  ))}
                </div>
              </div>
            </section>
          )}

          <div className="parallel-sections">
            {esporte.length > 0 && (
              <div className="parallel-col">
                <SectionHeader title="Esporte" link="/categoria/esporte" />
                <div className="parallel-list">
                  {esporte.slice(0, 3).map((n) => (
                    <PremiumCard key={n.slug} noticia={n} size="list" />
                  ))}
                </div>
              </div>
            )}
            {brasil.length > 0 && (
              <div className="parallel-col">
                <SectionHeader title="Brasil" link="/categoria/brasil" />
                <div className="parallel-list">
                  {brasil.slice(0, 3).map((n) => (
                    <PremiumCard key={n.slug} noticia={n} size="list" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="parallel-sections">
            {entretenimento.length > 0 && (
              <div className="parallel-col">
                <SectionHeader
                  title="Entretenimento"
                  link="/categoria/entretenimento"
                />
                <div className="parallel-list">
                  {entretenimento.slice(0, 3).map((n) => (
                    <PremiumCard key={n.slug} noticia={n} size="list" />
                  ))}
                </div>
              </div>
            )}
            {policia.length > 0 && (
              <div className="parallel-col">
                <SectionHeader title="Polícia" link="/categoria/policia" />
                <div className="parallel-list">
                  {policia.slice(0, 3).map((n) => (
                    <PremiumCard key={n.slug} noticia={n} size="list" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {youtube.length > 0 && (
            <section className="premium-section bg-light-gray rounded-box">
              <SectionHeader title="Youtube" link="/categoria/youtube" />
              <div className="news-grid-mixed">
                {youtube[0] && <PremiumCard noticia={youtube[0]} size="medium" />}
                <div className="mixed-list">
                  {youtube.slice(1, 4).map((n) => (
                    <PremiumCard key={n.slug} noticia={n} size="list" />
                  ))}
                </div>
              </div>
            </section>
          )}

          {ceara.length > 0 && (
            <section
              className="premium-section bg-light-gray rounded-box"
              style={{ marginTop: "20px" }}
            >
              <SectionHeader title="Ceará" link="/categoria/ceara" />
              <div className="news-grid-mixed">
                {ceara[0] && <PremiumCard noticia={ceara[0]} size="medium" />}
                <div className="mixed-list">
                  {ceara.slice(1, 4).map((n) => (
                    <PremiumCard key={n.slug} noticia={n} size="list" />
                  ))}
                </div>
              </div>
            </section>
          )}
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
                alt="TV Russas no Instagram"
                fill
                sizes="300px"
                style={{ objectFit: "cover" }}
              />
              <div className="ad-overlay">Siga no Instagram</div>
            </a>
          </div>

          <TrendingWidget items={trending} title="Em Alta" />
          
          <div className="sticky-widget">
            <TrendingWidget items={maisLidas} title="Mais Lidas" />
          </div>
        </aside>
      </div>
    </main>
  );
}
