import "./noticia-premium.css";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getImagePath } from "@/utils/imagePath";
import { ViewTracker } from "@/components/ViewTracker";
import {
  ArticleInteractions,
  InlineShare,
} from "@/components/ArticleInteractions";
import { ArticleFeedbackWrapper as ArticleFeedback } from "@/components/ArticleFeedbackWrapper";
import TrendingWidget from "@/components/TrendingWidget";
import { apiService } from "@/services/api";
import type { Metadata } from "next";
import { DOMAIN } from "@/utils/domain";
import { TEXTS } from "@/constants/texts";
import { sanitizeHtml } from "@/utils/sanitize";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const noticia = await apiService.getNoticia(slug);
    if (!noticia) {
      return {
        title: "Matéria Não Encontrada | TV Russas",
      };
    }

    const title = noticia.titulo;
    const cleanContent = noticia.conteudo
      ? noticia.conteudo.replace(/<[^>]*>/g, "").substring(0, 160) + "..."
      : "";
    const description =
      noticia.resumo ||
      cleanContent ||
      "Informação com credibilidade e agilidade em Russas e região.";
    const articleUrl = `${DOMAIN}/noticia/${slug}`;
    const absoluteCapaUrl = getImagePath(noticia.capaUrl);

    return {
      title,
      description,
      alternates: {
        canonical: articleUrl,
      },
      openGraph: {
        title,
        description,
        url: articleUrl,
        siteName: "TV Russas",
        locale: "pt_BR",
        type: "article",
        publishedTime: noticia.publicadoEm,
        modifiedTime: noticia.publicadoEm,
        authors: noticia.colunista
          ? [noticia.colunista.nome]
          : ["Portal TV Russas"],
        images: [
          {
            url: absoluteCapaUrl,
            width: 1200,
            height: 675,
            alt: noticia.titulo,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [absoluteCapaUrl],
      },
      keywords: [
        "Russas CE",
        "Notícias de Russas",
        "TV Russas",
        "Últimas notícias de Russas",
        noticia.categoria?.nome || "",
        "Ceará notícias",
        "Interior do Ceará",
      ].filter(Boolean),
    };
  } catch (error) {
    console.error("Erro ao gerar metadados dinâmicos:", error);
    return {
      title: "Notícia | TV Russas",
    };
  }
}

function formatArticleContent(htmlContent: string): string {
  let content = htmlContent.trim();

  // Remove qualquer linha de autor/atribuição do final para que não apareça no rodapé
  content = content.replace(
    /<p class="article-author-attribution">[\s\S]*?<\/p>/gi,
    ""
  );
  content = content.replace(
    /<p class="article-source-attribution">[\s\S]*?<\/p>/gi,
    ""
  );
  
  // Remove menções manuais cruas ao final do texto para evitar resquícios históricos no rodapé
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)?\s*(?:Publicado\s+por\s*:\s*|Portal\s+)?TV\s*Russas\s*(?:<\/strong>|<\/b>)?\s*<\/p>\s*$/gi,
    ""
  );
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)?\s*Fonte\s*:\s*([^<]+?)\s*(?:<\/strong>|<\/b>)?\s*<\/p>\s*$/gi,
    ""
  );

  // Transformar parágrafos que contêm APENAS <strong> ou <b> em subtítulos h3 semânticos
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)\s*([^<]+?)\s*(?:<\/strong>|<\/b>)\s*<\/p>/gi,
    '<h3 class="article-subheading">$1</h3>',
  );

  return content;
}

// Helper para embutir players de vídeo de forma responsiva
function renderVideoPlayer(videoUrl: string | null | undefined) {
  if (!videoUrl) return null;

  // YouTube
  const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return (
      <div className="editorial-video-wrapper" style={{ margin: '24px 0', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9', position: 'relative', border: '1px solid rgba(255,255,255,0.06)' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    );
  }

  // Instagram
  const igMatch = videoUrl.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const igId = igMatch[1];
    return (
      <div className="editorial-video-wrapper" style={{ margin: '24px 0', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9', position: 'relative', border: '1px solid rgba(255,255,255,0.06)' }}>
        <iframe
          src={`https://www.instagram.com/p/${igId}/embed/`}
          title="Instagram post player"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    );
  }

  // Facebook
  if (videoUrl.includes('facebook.com')) {
    return (
      <div className="editorial-video-wrapper" style={{ margin: '24px 0', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9', position: 'relative', border: '1px solid rgba(255,255,255,0.06)' }}>
        <iframe
          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&width=560`}
          title="Facebook video player"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    );
  }

  return null;
}

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const noticia = await apiService.getNoticia(slug);
  if (!noticia) notFound();

  const [todasNoticias, trendingRaw, maisLidasRaw, bannerTopo] = await Promise.all([
    apiService.getNoticias(),
    apiService.getTrending(),
    apiService.getMaisLidas(),
    apiService.getBannerAtivo('topo_interna'),
  ]);

  // Se o trending/maisLidas estiverem vazios (ex: site novo), usa as notícias recentes como fallback
  const trending =
    trendingRaw.length > 0 ? trendingRaw : todasNoticias.slice(0, 5);
  const maisLidas =
    maisLidasRaw.length > 0 ? maisLidasRaw : todasNoticias.slice(5, 10);

  // Relacionadas: prioriza mesma categoria, fallback para qualquer outra
  const mesmaCat = todasNoticias.filter(
    (n) => n.slug !== slug && n.categoria.slug === noticia.categoria.slug,
  );
  const relacionadas = (
    mesmaCat.length >= 3
      ? mesmaCat
      : todasNoticias.filter((n) => n.slug !== slug)
  ).slice(0, 3);

  const data = new Date(noticia.publicadoEm).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const hora = new Date(noticia.publicadoEm).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const readTime = Math.max(
    1,
    Math.ceil(noticia.conteudo.split(" ").length / 200),
  );
  const postUrl = `${DOMAIN}/noticia/${slug}`;

  // Schema estruturado completo de Artigo e Breadcrumbs
  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${DOMAIN}/noticia/${slug}/#breadcrumb`,
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
            name: noticia.categoria.nome,
            item: `${DOMAIN}/categoria/${noticia.categoria.slug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: noticia.titulo,
            item: `${DOMAIN}/noticia/${slug}`,
          },
        ],
      },
      {
        "@type": "NewsArticle",
        "@id": `${DOMAIN}/noticia/${slug}/#article`,
        isPartOf: {
          "@id": `${DOMAIN}/#website`,
        },
        headline: noticia.titulo,
        description:
          noticia.resumo ||
          (noticia.conteudo
            ? noticia.conteudo.replace(/<[^>]*>/g, "").substring(0, 160) + "..."
            : ""),
        image: [getImagePath(noticia.capaUrl)],
        datePublished: noticia.publicadoEm,
        dateModified: noticia.publicadoEm,
        author: {
          "@type": "Person",
          name: noticia.colunista?.nome || "Portal TV Russas",
        },
        publisher: {
          "@id": `${DOMAIN}/#organization`,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${DOMAIN}/noticia/${slug}`,
        },
      },
    ],
  };

  return (
    <main className="editorial-article-container">
      {/* Schema estruturado injetado via SSR */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c"),
        }}
      />
      {/* Barra de progresso + botões flutuantes */}
      <ArticleInteractions title={noticia.titulo} url={postUrl} />
      <ViewTracker slug={slug} />

      {/* Banner de Publicidade no Topo */}
      {bannerTopo && (
        <div className="editorial-ad-banner-topo" style={{ 
          margin: '0 auto 20px', 
          maxWidth: '1200px', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '6px'
        }}>
          <span style={{ 
            fontSize: '9px', 
            color: 'var(--c-muted, #999)', 
            fontWeight: '600', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em' 
          }}>
            {TEXTS.widgets.advertising}
          </span>
          <a 
            href={bannerTopo.linkUrl || '#'} 
            target={bannerTopo.linkUrl ? "_blank" : "_self"} 
            rel="noopener noreferrer"
            style={{ display: 'block', width: '100%', cursor: bannerTopo.linkUrl ? 'pointer' : 'default' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={bannerTopo.imageUrl.startsWith('http') ? bannerTopo.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${bannerTopo.imageUrl}`} 
              alt={bannerTopo.titulo}
              style={{ 
                width: '100%', 
                maxHeight: '120px', 
                objectFit: 'contain', 
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            />
          </a>
        </div>
      )}

      <article className="editorial-article">
        {/* ===== BREADCRUMB ===== */}
        <nav className="editorial-breadcrumb" aria-label="breadcrumb">
          <Link href="/">INÍCIO</Link>
          <span>/</span>
          <Link href={`/categoria/${noticia.categoria.slug}`}>
            {noticia.categoria.nome.toUpperCase()}
          </Link>
        </nav>

        {/* ===== HEADER DO ARTIGO (IMPACTO) ===== */}
        <header className="editorial-header">
          <Link
            href={`/categoria/${noticia.categoria.slug}`}
            className="editorial-category"
          >
            {noticia.categoria.nome}
          </Link>

          <h1 className="editorial-title">{noticia.titulo}</h1>

          {noticia.resumo && (
            <p className="editorial-subtitle">{noticia.resumo}</p>
          )}

          <div className="editorial-meta-bar">
            <div className="meta-left">
              <div className="author-avatar">
                <Image
                  src={
                    noticia.colunista
                      ? getImagePath(noticia.colunista.fotoUrl)
                      : "/uploads/Logo%20Tv%20Russas_Sem%20fundo.png"
                  }
                  alt={noticia.colunista?.nome || "Portal TV Russas"}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="author-info">
                <span className="author-name">
                  {TEXTS.common.por}{" "}
                  <strong>
                    {(
                      noticia.publicadoPor ||
                      noticia.colunista?.nome ||
                      "PORTAL TV RUSSAS"
                    ).toUpperCase()}
                  </strong>
                </span>
                <div className="meta-details">
                  <time dateTime={String(noticia.publicadoEm)}>
                    {data} às {hora}
                  </time>
                  <span className="meta-separator">·</span>
                  <span className="read-time">
                    <i className="far fa-clock" /> {readTime} min de leitura
                  </span>
                  {noticia.fonte && (
                    <>
                      <span className="meta-separator">·</span>
                      <span className="read-time">
                        Fonte: <strong style={{ color: 'var(--c-accent)' }}>{noticia.fonte}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Imagem de capa Premium */}
        <figure className="editorial-featured-image">
          <Image
            src={getImagePath(noticia.capaUrl)}
            alt={noticia.titulo}
            width={1200}
            height={675}
            priority
            className="article-img"
          />
          <figcaption className="editorial-image-caption">
            <span>{noticia.titulo}</span>
            <span>{TEXTS.brand.acervo}</span>
          </figcaption>
        </figure>

        {/* Player de Vídeo Responsivo (YouTube, Facebook, Instagram) */}
        {noticia.videoUrl && renderVideoPlayer(noticia.videoUrl)}

        {/* ===== GRID DE CONTEÚDO EDITORIAL ===== */}
        <div className="editorial-content-grid">
          {/* ── COLUNA DE LEITURA ── */}
          <div className="editorial-main-content">
            {/* O corpo do texto com classe de alta especificidade */}
            <div
              className="article-body-content premium-editorial-flow"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(formatArticleContent(noticia.conteudo)),
              }}
            />

            {/* Tags */}
            <div className="article-footer">
              <div className="tags-section">
                <span className="tags-label">{TEXTS.widgets.subjects}</span>
                <div className="tags-list">
                  <Link
                    href={`/categoria/${noticia.categoria.slug}`}
                    className="tag-link"
                  >
                    {noticia.categoria.nome}
                  </Link>
                  <Link href="/search?q=Ceará" className="tag-link">
                    {TEXTS.common.ceara}
                  </Link>
                  <Link href="/search?q=Russas" className="tag-link">
                    {TEXTS.common.russas}
                  </Link>
                </div>
              </div>
            </div>

            {/* Compartilhar Matéria Horizontal (Seguro, imune ao Brave Shield e Renders do lado do Cliente) */}
            <InlineShare title={noticia.titulo} url={postUrl} />

            {/* Feedback */}
            <ArticleFeedback articleId={noticia.id.toString()} />

            {/* Leia Também */}
            {relacionadas.length > 0 && (
              <section className="editorial-related-bottom">
                <h3 className="section-heading-elegant">
                  <span>{TEXTS.widgets.related}</span>
                </h3>
                <div className="related-cards-grid">
                  {relacionadas.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/noticia/${item.slug}`}
                      className="related-mini-card"
                    >
                      <div className="mini-card-img">
                        <Image
                          src={getImagePath(item.capaUrl)}
                          alt={item.titulo}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="mini-card-info">
                        <span className="mini-category">
                          {item.categoria.nome}
                        </span>
                        <h4 className="mini-title">{item.titulo}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="editorial-sidebar">
            <TrendingWidget items={trending} title="Em Alta" />

            <div className="sticky-sidebar-widget">
              <TrendingWidget items={maisLidas} title="Mais Lidas" />
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
