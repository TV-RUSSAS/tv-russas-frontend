import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { apiService } from "@/services/api";
import { getImagePath } from "@/utils/imagePath";
import type { Metadata } from "next";
import { DOMAIN } from "@/utils/domain";
import { TEXTS } from "@/constants/texts";
import TrendingWidget from "@/components/TrendingWidget";
import type { Noticia as NoticiaGlobal } from "@/types";
import "./categoria.css";

interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  capaUrl: string;
  publicadoEm: string;
  categoria: { nome: string; slug: string };
  conteudo?: string;
  resumo?: string | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  let nome = "Categoria";
  try {
    const categoria = await apiService.getCategoriaBySlug(slug);
    if (categoria) {
      nome = categoria.nome;
    }
  } catch {
    // Fallback silencioso
  }

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
          url: "https://tv-russas-backend.onrender.com/uploads/sistema/tv.jpg",
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
      images: ["https://tv-russas-backend.onrender.com/uploads/sistema/tv.jpg"],
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

const getCategoryBanner = (slug: string): string => {
  switch (slug) {
    case "cidade": return "anuncio/Anuncio1.png";
    case "politica": return "anuncio/banner2.png";
    case "esporte": return "anuncio/Anuncio1.png";
    case "entretenimento": return "anuncio/banner2.png";
    case "policia": return "anuncio/Anuncio1.png";
    case "youtube": return "anuncio/banner2.png";
    case "brasil": return "anuncio/Anuncio1.png";
    case "ceara": return "anuncio/banner2.png";
    default: return "anuncio/Anuncio1.png";
  }
};

const getCategoryDescription = (slug: string, nome: string): string => {
  // Usa Map em vez de object literal para evitar prototype pollution
  // (slugs vêm da URL e não devem acessar propriedades herdadas como __proto__)
  const descriptions = new Map<string, string>([
    ["cidade", `Últimas notícias, reportagens e eventos sobre o cotidiano de Russas e região.`],
    ["politica", `Bastidores do poder, eleições e cobertura política local, estadual e regional.`],
    ["esporte", `Futebol local, competições regionais e tudo sobre o esporte em Russas e no Ceará.`],
    ["entretenimento", `Cultura, shows, festas e a agenda de eventos no Vale do Jaguaribe.`],
    ["policia", `Segurança pública, ocorrências e informações de utilidade na região.`],
    ["brasil", `As principais notícias do cenário nacional que impactam o país.`],
    ["ceara", `Acontecimentos do estado do Ceará, desenvolvimento regional e notícias do interior.`],
    ["youtube", `Vídeos exclusivos, reportagens e coberturas produzidas pela TV Russas.`],
  ]);
  return descriptions.get(slug.toLowerCase()) ?? `Últimas notícias, matérias e reportagens de ${nome} no portal TV Russas.`;
};

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Buscar dados em paralelo para melhor performance
  const [categoria, noticiasRaw, maisLidas] = await Promise.all([
    apiService.getCategoriaBySlug(slug),
    apiService.getNoticiasByCategoria(slug, 20),
    apiService.getMaisLidas()
  ]);

  if (!categoria) notFound();

  const nome = categoria.nome;
  const noticias = noticiasRaw as unknown as Noticia[];
  const data = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const bannerImg = getCategoryBanner(slug);
  const isClickable = bannerImg === "anuncio/Anuncio1.png";
  const adLink = "https://dinheironamao.trabalho.ce.gov.br";

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

  // Separação de Destaques (Hero + Secundárias) e Grid Principal
  // Se tivermos 3 ou mais notícias, usamos a primeira como Destaque Principal (Hero),
  // as posições 1 e 2 como Secundárias (conforme a imagem, que mostra 1 grande e 2 empilhadas ao lado).
  // Caso contrário, a 1ª é o Hero e o restante vai direto para o Grid principal.
  let heroNoticia: Noticia | null = null;
  let secundariasNoticias: Noticia[] = [];
  let noticiasRestantes: Noticia[] = [];

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
      <div className="banner-anuncio">
        {isClickable ? (
          <a href={adLink} target="_blank" rel="noopener noreferrer">
            <Image
              src={getImagePath(bannerImg)}
              alt={`Patrocínio ${nome}`}
              width={1280}
              height={140}
              unoptimized={true}
              priority
            />
          </a>
        ) : (
          <Image
            src={getImagePath(bannerImg)}
            alt={`Patrocínio ${nome}`}
            width={1280}
            height={140}
            unoptimized={true}
            priority
          />
        )}
      </div>

      {/* CABEÇALHO DA CATEGORIA */}
      <header className="categoria-header">
        <nav className="categoria-breadcrumb" aria-label="breadcrumb">
          <Link href="/">INÍCIO</Link>
          <span>/</span>
          <Link href={`/categoria/${slug}`}>CATEGORIAS</Link>
          <span>/</span>
          <span>{nome.toUpperCase()}</span>
        </nav>
        <h1>{nome}</h1>
      </header>

      {/* BLOCO DE DESTAQUES EDITORIAL (ESTILO G1) */}
      {noticias.length > 0 && (
        <section className="categoria-highlights-section">
          {/* Destaque Principal (Hero à esquerda) */}
          {heroNoticia && (
            <Link href={`/noticia/${heroNoticia.slug}`} className="destaque-card-g1 hero-large">
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
                  const cleanText = heroNoticia.resumo ? stripHtml(heroNoticia.resumo) : (heroNoticia.conteudo ? stripHtml(heroNoticia.conteudo) : "");
                  return (
                    <p className="destaque-card-resumo">
                      {cleanText.substring(0, 160)}{cleanText.length > 160 ? "..." : ""}
                    </p>
                  );
                })()}
                <div className="destaque-card-meta">
                  <time>{data(heroNoticia.publicadoEm)}</time>
                </div>
              </div>
            </Link>
          )}

          {/* Destaques Secundários (Pilha à direita - Estilo G1) */}
          {secundariasNoticias.length > 0 && (
            <div className="secondary-noticias-column">
              {secundariasNoticias.map((n) => (
                <Link key={n.slug} href={`/noticia/${n.slug}`} className="destaque-card-g1 secondary-small">
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
                      <time>{data(n.publicadoEm)}</time>
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
              <Link key={n.slug} href={`/noticia/${n.slug}`} className="card-noticia-horizontal">
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
                    const cleanText = n.resumo ? stripHtml(n.resumo) : (n.conteudo ? stripHtml(n.conteudo) : "");
                    return (
                      <p className="card-horizontal-resumo">
                        {cleanText.substring(0, 140)}{cleanText.length > 140 ? "..." : ""}
                      </p>
                    );
                  })()}
                  <time className="card-horizontal-meta">{data(n.publicadoEm)}</time>
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
          {/* Widget Mais Lidas — usa as mesmas classes trending-* do resto do site */}
          <TrendingWidget items={maisLidas.slice(0, 5) as unknown as NoticiaGlobal[]} title="Mais Lidas" />
        </aside>
      </div>
    </div>
  );
}
