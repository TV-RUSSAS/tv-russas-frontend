import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { API_URL } from "@/services/api";
import { getImagePath } from "@/utils/imagePath";
import type { Metadata } from "next";
import { DOMAIN } from "@/utils/domain";
import { TEXTS } from "@/constants/texts";

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
    const resCat = await fetch(`${API_URL}/categorias/${slug}`, { cache: "no-store" });
    if (resCat.ok) {
      const categoria = await resCat.json();
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

async function getNoticias(slug: string): Promise<Noticia[]> {
  try {
    const res = await fetch(`${API_URL}/categorias/${slug}/noticias?limit=20`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
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

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Buscar a categoria dinamicamente
  let categoria = null;
  try {
    const resCat = await fetch(`${API_URL}/categorias/${slug}`, { cache: "no-store" });
    if (resCat.ok) {
      categoria = await resCat.json();
    }
  } catch {
    // Fallback silencioso
  }

  if (!categoria) notFound();

  const nome = categoria.nome;
  const noticias = await getNoticias(slug);
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
      <div className="banner-anuncio" style={{ marginBottom: "30px" }}>
        {isClickable ? (
          <a href={adLink} target="_blank" rel="noopener noreferrer">
            <Image
              src={getImagePath(bannerImg)}
              alt={`Patrocínio ${nome}`}
              width={1280}
              height={140}
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
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
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
            unoptimized={true}
            priority
          />
        )}
      </div>

      <div className="categoria-header">
        <h1>{TEXTS.common.categoryTitle}{nome}</h1>
      </div>

      <div className="categoria-grid">
        {noticias.length > 0 ? (
          noticias.map((n) => (
            <Link
              key={n.slug}
              href={`/noticia/${n.slug}`}
              className="card-noticia"
            >
              <Image
                src={getImagePath(n.capaUrl)}
                alt={n.titulo}
                width={400}
                height={200}
                className="card-noticia-img"
                sizes="(max-width: 640px) 100vw, 300px"
              />
              <div className="card-noticia-body">
                <span className="card-noticia-categoria">
                  {n.categoria.nome}
                </span>
                <p className="card-noticia-titulo">{n.titulo}</p>
                <span className="card-noticia-data">{data(n.publicadoEm)}</span>
                {(() => {
                  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, "");
                  const cleanText = n.resumo ? stripHtml(n.resumo) : (n.conteudo ? stripHtml(n.conteudo) : "");
                  return (
                    <p className="card-noticia-resumo">
                      {cleanText.substring(0, 140)}{cleanText.length > 140 ? "..." : ""}
                    </p>
                  );
                })()}
              </div>
            </Link>
          ))
        ) : (
          <p className="no-news">{TEXTS.common.noNews}</p>
        )}
      </div>
    </div>
  );
}
