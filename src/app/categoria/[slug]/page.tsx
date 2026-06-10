import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategoriaPageData } from "@/services/api";
import { getImagePath } from "@/utils/imagePath";
import type { Metadata } from "next";
import { DOMAIN } from "@/utils/domain";
import { TEXTS } from "@/constants/texts";
import TrendingWidget from "@/components/TrendingWidget";
import type { Noticia as NoticiaGlobal } from "@/types";
import "./categoria.css";

// Cache ISR de 5 minutos — a Vercel revalidará em background após esse período
export const revalidate = 300;

// ─── generateMetadata usa o mesmo getCategoriaPageData (React.cache)
// Garantia: se a Page também chamar, apenas 1 request HTTP é feito ao Render ───
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoriaPageData(slug);
  const nome = data?.categoria?.nome ?? "Categoria";

  const title = `Notícias de ${nome} - TV Russas`;
  const description = `Fique por dentro das últimas notícias sobre ${nome} em Russas, no Ceará e em toda a região do Vale do Jaguaribe.`;
  const categoryUrl = `${DOMAIN}/categoria/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title,
      description,
      url: categoryUrl,
      siteName: "TV Russas",
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: "/og-tv-russas.jpg",
          width: 1200,
          height: 630,
          alt: `Notícias sobre ${nome}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-tv-russas.jpg"],
    },
    keywords: [
      `Notícias sobre ${nome}`,
      `Russas ${nome}`,
      "Russas CE",
      "TV Russas",
      "Ceará notícias",
      "Interior do Ceará",
    ],
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Removido getCategoryBanner hardcoded em favor de bannerCategoria do backend

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

// ─── Interface local (sem conteudo — os dados de listagem não trazem esse campo) ─
interface NoticiaLista {
  id: string;
  titulo: string;
  slug: string;
  capaUrl: string;
  publicadoEm: string;
  categoria: { nome: string; slug: string };
  resumo?: string | null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Uma única chamada HTTP ao Render — consolidada no backend (/api/categorias/:slug/page)
  // React.cache garante que generateMetadata e esta Page compartilham o mesmo resultado
  const pageData = await getCategoriaPageData(slug);
  if (!pageData) notFound();

  const { categoria, noticias: noticiasRaw, maisLidas, bannerCategoria } = pageData;
  const nome = categoria.nome;
  const noticias = noticiasRaw as unknown as NoticiaLista[];

  const formatData = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });

  // Configurações do Banner Dinâmico
  const bannerImg = bannerCategoria?.imageUrl || "anuncio/Anuncio1.png"; // Fallback para uma imagem default se preferir
  const isClickable = !!bannerCategoria?.linkUrl;
  const adLink = bannerCategoria?.linkUrl || "#";

  const categorySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${DOMAIN}/categoria/${slug}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: `${DOMAIN}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: nome,
            item: `${DOMAIN}/categoria/${slug}`,
          },
        ],
      },
    ],
  };

  // Separação em destaque hero, secundárias e restante
  let heroNoticia: NoticiaLista | null = null;
  let secundariasNoticias: NoticiaLista[] = [];
  let noticiasRestantes: NoticiaLista[] = [];

  if (noticias.length >= 3) {
    heroNoticia = noticias[0];
    secundariasNoticias = noticias.slice(1, 3);
    noticiasRestantes = noticias.slice(3);
  } else if (noticias.length > 0) {
    heroNoticia = noticias[0];
    noticiasRestantes = noticias.slice(1);
  }

  return (
    <div className="site-container">
      {/* Schema estruturado injetado via SSR */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categorySchema).replace(/</g, "\\u003c"),
        }}
      />

      {/* BANNER TOPO: RODÍZIO POR CATEGORIA */}
      {bannerCategoria && (
        <div className="banner-anuncio">
          {isClickable ? (
            <a href={adLink} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerImg.startsWith("http") ? bannerImg : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}${bannerImg}`}
                alt={`Patrocínio ${nome}`}
                width={1280}
                height={140}
                style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
              />
            </a>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={bannerImg.startsWith("http") ? bannerImg : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}${bannerImg}`}
              alt={`Patrocínio ${nome}`}
              width={1280}
              height={140}
              style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
            />
          )}
        </div>
      )}

      {/* CABEÇALHO DA CATEGORIA */}
      <header className="categoria-header">
        <nav className="categoria-breadcrumb" aria-label="breadcrumb">
          <Link href="/" prefetch={false}>INÍCIO</Link>
          <span>/</span>
          <Link href={`/categoria/${slug}`} prefetch={false}>CATEGORIAS</Link>
          <span>/</span>
          <span>{nome.toUpperCase()}</span>
        </nav>
        <h1>{nome.charAt(0).toUpperCase() + nome.slice(1)}</h1>
      </header>

      {/* BLOCO DE DESTAQUES EDITORIAL (ESTILO G1) */}
      {noticias.length > 0 && (
        <section className="categoria-highlights-section">
          {/* Destaque Principal (Hero à esquerda) */}
          {heroNoticia && (
            <Link href={`/noticia/${heroNoticia.slug}`} prefetch={false} className="destaque-card-g1 hero-large">
              <div className="destaque-card-media">
                <Image
                  src={getImagePath(heroNoticia.capaUrl)}
                  alt={heroNoticia.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 700px"
                  priority
                />
              </div>
              <div className="destaque-card-overlay" />
              <span className="destaque-card-tag">{nome}</span>
              <div className="destaque-card-content">
                <h2 className="destaque-card-title">{heroNoticia.titulo}</h2>
                {(() => {
                  const cleanText = heroNoticia.resumo ? stripHtml(heroNoticia.resumo) : "";
                  return (
                    <p className="destaque-card-resumo">
                      {cleanText.substring(0, 160)}{cleanText.length > 160 ? "..." : ""}
                    </p>
                  );
                })()}
                <div className="destaque-card-meta">
                  <time>{formatData(heroNoticia.publicadoEm)}</time>
                </div>
              </div>
            </Link>
          )}

          {/* Destaques Secundários (Pilha à direita - Estilo G1) */}
          {secundariasNoticias.length > 0 && (
            <div className="secondary-noticias-column">
              {secundariasNoticias.map((n) => (
                <Link key={n.slug} href={`/noticia/${n.slug}`} prefetch={false} className="destaque-card-g1 secondary-small">
                  <div className="destaque-card-media">
                    <Image
                      src={getImagePath(n.capaUrl)}
                      alt={n.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                  <div className="destaque-card-overlay" />
                  <span className="destaque-card-tag">{nome}</span>
                  <div className="destaque-card-content">
                    <h3 className="destaque-card-title">{n.titulo}</h3>
                    <div className="destaque-card-meta">
                      <time>{formatData(n.publicadoEm)}</time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* DIVISOR DE CONTEÚDO EDITORIAL */}
      {noticias.length > 0 && (
        <div className="section-divider">
          <h3>VEJA MAIS NOTÍCIAS</h3>
          <div className="section-divider-line" />
        </div>
      )}

      {/* GRID PRINCIPAL + SIDEBAR */}
      <div className="categoria-layout-columns">
        {/* Coluna da esquerda: listagem geral de notícias */}
        <main className="categoria-feed-principal">
          {noticiasRestantes.length > 0 ? (
            noticiasRestantes.map((n) => (
              <Link key={n.slug} href={`/noticia/${n.slug}`} prefetch={false} className="card-noticia-horizontal">
                <div className="card-horizontal-media">
                  <Image
                    src={getImagePath(n.capaUrl)}
                    alt={n.titulo}
                    fill
                    sizes="(max-width: 640px) 100vw, 260px"
                  />
                </div>
                <div className="card-horizontal-body">
                  <span className="card-horizontal-categoria">{n.categoria.nome}</span>
                  <h4 className="card-horizontal-titulo">{n.titulo}</h4>
                  {(() => {
                    const cleanText = n.resumo ? stripHtml(n.resumo) : "";
                    return (
                      <p className="card-horizontal-resumo">
                        {cleanText.substring(0, 140)}{cleanText.length > 140 ? "..." : ""}
                      </p>
                    );
                  })()}
                  <time className="card-horizontal-meta">{formatData(n.publicadoEm)}</time>
                </div>
              </Link>
            ))
          ) : (
            noticias.length === 0 && (
              <div className="no-news-box">
                <i className="far fa-newspaper" />
                <p>{TEXTS.common.noNews}</p>
              </div>
            )
          )}
        </main>

        {/* Coluna da direita: Sidebar */}
        <aside className="categoria-sidebar">
          {/* Widget Mais Lidas — dados já vêm no payload consolidado, sem request adicional */}
          <TrendingWidget items={maisLidas.slice(0, 5) as unknown as NoticiaGlobal[]} title="Mais Lidas" />
        </aside>
      </div>
    </div>
  );
}
