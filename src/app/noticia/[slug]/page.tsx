export const revalidate = 300; // Cache ISR de 5 minutos para páginas de notícia
import "./noticia-premium.css";
import "@/app/social-embeds.css";
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
import { getNoticiaPageData } from "@/services/api";
import type { Metadata } from "next";
import { DOMAIN } from "@/utils/domain";
import { TEXTS } from "@/constants/texts";
import { sanitizeHtml } from "@/utils/sanitize";
import {
  ArticleVideoEmbed,
  type VideoPlatform,
} from "@/components/ArticleVideoEmbed";
import { PremiumVideoPlayer } from "@/components/PremiumVideoPlayer";
import CategoryActiveSetter from "@/components/CategoryActiveSetter";

// ─── generateMetadata: usa getNoticiaPageData (React.cache)
// Garante 0 requests duplicados com o componente de página no mesmo ciclo SSR ───
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const pageData = await getNoticiaPageData(slug);
    if (!pageData) {
      return { title: "Matéria Não Encontrada | TV Russas" };
    }
    const { noticia } = pageData;

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
      alternates: { canonical: articleUrl },
      openGraph: {
        title,
        description,
        url: articleUrl,
        siteName: "TV Russas",
        locale: "pt_BR",
        type: "article",
        publishedTime: noticia.publicadoEm,
        modifiedTime: noticia.publicadoEm,
        authors: noticia.colunista ? [noticia.colunista.nome] : ["Portal TV Russas"],
        images: [{ url: absoluteCapaUrl, width: 1200, height: 675, alt: noticia.titulo }],
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
    return { title: "Notícia | TV Russas" };
  }
}

function formatArticleContent(htmlContent: string): string {
  let content = htmlContent.trim();

  // Remove qualquer linha de autor/atribuição do final para que não apareça no rodapé
  content = content.replace(
    /<p class="article-author-attribution">[\s\S]*?<\/p>/gi,
    "",
  );
  content = content.replace(
    /<p class="article-source-attribution">[\s\S]*?<\/p>/gi,
    "",
  );

  // Remove menções manuais cruas a "Publicado por:" e "Fonte:" em qualquer lugar do texto
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)?\s*Publicado\s+por\s*:\s*[\s\S]*?(?:<\/strong>|<\/b>)?\s*<\/p>/gi,
    "",
  );
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)?\s*Fonte\s*:\s*[\s\S]*?(?:<\/strong>|<\/b>)?\s*<\/p>/gi,
    "",
  );

  // Transformar parágrafos que contêm APENAS <strong> ou <b> em subtítulos h3 semânticos
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)\s*([^<]+?)\s*(?:<\/strong>|<\/b>)\s*<\/p>/gi,
    '<h3 class="article-subheading">$1</h3>',
  );

  return content;
}

// Helper para converter placeholders em blocos de Vídeo e Embed React
function parseContentWithEmbeds(htmlContent: string) {
  const formattedHtml = formatArticleContent(htmlContent);
  const regex =
    /<div\s+class="(article-video-placeholder|social-embed-placeholder)"\s+data-platform="([a-z]+)"\s+data-url="([^"]+)"(?:\s+data-caption="([^"]*)")?(?:\s+data-credit="([^"]*)")?\s*><\/div>/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(formattedHtml)) !== null) {
    const textBefore = formattedHtml.substring(lastIndex, match.index).trim();
    if (textBefore) {
      parts.push(
        <div
          key={`text-${keyIndex++}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(textBefore) }}
          className="article-body-content premium-editorial-flow"
        />,
      );
    }

    const platform = match[2];
    const url = match[3];
    const caption = match[4] || "";
    const credit = match[5] || "";

    parts.push(
      <ArticleVideoEmbed
        key={`embed-${keyIndex++}`}
        url={url}
        platform={platform as VideoPlatform}
        caption={caption}
        credit={credit}
      />,
    );

    lastIndex = regex.lastIndex;
  }

  const textAfter = formattedHtml.substring(lastIndex).trim();
  if (textAfter) {
    parts.push(
      <div
        key={`text-${keyIndex++}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(textAfter) }}
        className="article-body-content premium-editorial-flow"
      />,
    );
  }

  return parts;
}

// Helper para embutir players de vídeo de forma responsiva
function renderVideoPlayer(
  videoUrl: string | null | undefined,
  isCapa: boolean = false,
) {
  if (!videoUrl) return null;

  const cleanUrlLower = videoUrl.trim().toLowerCase();

  // YouTube
  const ytMatch = videoUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return (
      <div
        className="editorial-video-wrapper"
        style={{
          width: "100%",
          margin: isCapa ? "0" : "24px 0",
          borderRadius: "8px",
          overflow: "hidden",
          aspectRatio: "16/9",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    );
  }

  // Instagram (suporta p, reel e reels)
  const igMatch = videoUrl.match(
    /instagram\.com\/(?:p|reels?)\/([a-zA-Z0-9_-]+)/i,
  );
  if (igMatch && igMatch[1]) {
    const igId = igMatch[1];
    return (
      <div
        className="editorial-video-wrapper"
        style={{
          width: "100%",
          margin: isCapa ? "0" : "24px 0",
          borderRadius: "8px",
          overflow: "hidden",
          aspectRatio: "16/9",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <iframe
          src={`https://www.instagram.com/p/${igId}/embed/`}
          title="Instagram post player"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    );
  }

  // Facebook
  if (videoUrl.includes("facebook.com")) {
    return (
      <div
        className="editorial-video-wrapper"
        style={{
          width: "100%",
          margin: isCapa ? "0" : "24px 0",
          borderRadius: "8px",
          overflow: "hidden",
          aspectRatio: "16/9",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <iframe
          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&width=560`}
          title="Facebook video player"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    );
  }

  // Se não bater com as redes conhecidas, mas começar com http ou /, consideramos que é um vídeo direto (MP4, etc.)
  if (
    cleanUrlLower.startsWith("http") ||
    cleanUrlLower.startsWith("/") ||
    cleanUrlLower.startsWith("blob:") ||
    cleanUrlLower.endsWith(".mp4") ||
    cleanUrlLower.includes(".mp4?") ||
    cleanUrlLower.includes("/video-upload/")
  ) {
    let fullSrc = videoUrl;
    if (videoUrl.startsWith("/") && !videoUrl.startsWith("//")) {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
      const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      fullSrc = `${cleanBase}${videoUrl}`;
    }
    return <PremiumVideoPlayer src={fullSrc} isCapa={isCapa} />;
  }

  return null;
}

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Uma única chamada HTTP ao Render — consolidada no backend (/api/noticias/:slug/page)
  // React.cache garante que generateMetadata e esta Page compartilham o mesmo resultado
  const pageData = await getNoticiaPageData(slug);
  if (!pageData) notFound();

  const { noticia, relacionadas, maisLidas, bannerTopo } = pageData;

  const data = new Date(noticia.publicadoEm).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
  const hora = new Date(noticia.publicadoEm).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
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
      <CategoryActiveSetter categorySlug={noticia.categoria.slug} />

      {/* Banner de Publicidade no Topo */}
      {bannerTopo && (
        <div className="editorial-ad-banner-topo">
          <a
            href={bannerTopo.linkUrl || "#"}
            target={bannerTopo.linkUrl ? "_blank" : "_self"}
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              cursor: bannerTopo.linkUrl ? "pointer" : "default",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                bannerTopo.imageUrl.startsWith("http")
                  ? bannerTopo.imageUrl
                  : getImagePath(bannerTopo.imageUrl)
              }
              alt={bannerTopo.titulo}
            />
          </a>
        </div>
      )}

      <article className="editorial-article">
        {/* ===== BREADCRUMB ===== */}
        <nav className="editorial-breadcrumb" aria-label="breadcrumb">
          <Link href="/">INÍCIO</Link>
          <span>/</span>
          <Link href={`/categoria/${noticia.categoria.slug}`} prefetch={false}>
            {noticia.categoria.nome.toUpperCase()}
          </Link>
        </nav>

        {/* ===== HEADER DO ARTIGO (IMPACTO) ===== */}
        <header className="editorial-header">
          <Link
            href={`/categoria/${noticia.categoria.slug}`}
            prefetch={false}
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
                      : "/logo-tv-russas.png"
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
                      noticia.colunista?.nome || "PORTAL TV RUSSAS"
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
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Imagem de capa Premium ou Vídeo de Capa (Estilo G1) */}
        <div className="article-main-image-wrapper">
          {noticia.videoUrl ? (
            renderVideoPlayer(noticia.videoUrl, true)
          ) : (
            <Image
              src={getImagePath(noticia.capaUrl, "main")}
              alt={noticia.titulo}
              width={1200}
              height={675}
              priority
              className="article-img"
            />
          )}
        </div>
        <figcaption className="editorial-image-caption">
          <span>{noticia.titulo}</span>
          <span>{TEXTS.brand.acervo}</span>
        </figcaption>

        {/* ===== GRID DE CONTEÚDO EDITORIAL ===== */}
        <div className="editorial-content-grid">
          {/* ── COLUNA DE LEITURA ── */}
          <div className="editorial-main-content">
            {/* O corpo do texto com classe de alta especificidade intercalando embeds estruturados */}
            {parseContentWithEmbeds(noticia.conteudo)}

            {/* Tags */}
            <div className="article-footer">
              <div className="tags-section">
                <span className="tags-label">{TEXTS.widgets.subjects}</span>
                <div className="tags-list">
                  <Link
                    href={`/categoria/${noticia.categoria.slug}`}
                    prefetch={false}
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
                      prefetch={false}
                      className="related-mini-card"
                    >
                      <div className="mini-card-img">
                        <Image
                          src={getImagePath(item.capaUrl, "card")}
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

            {/* Mais Lidas (Estilo Caixa de Texto / O Povo) */}
            {maisLidas.length > 0 && (
              <section className="editorial-mais-lidas-bottom">
                <div className="mais-lidas-header-container">
                  <h3 className="mais-lidas-heading">MAIS LIDAS</h3>
                  <div className="mais-lidas-heading-bar" />
                </div>
                <div className="mais-lidas-list">
                  {maisLidas.slice(0, 5).map((item, index) => (
                    <Link
                      key={item.slug}
                      href={`/noticia/${item.slug}`}
                      prefetch={false}
                      className="mais-lidas-item"
                    >
                      <div
                        className={`mais-lidas-number ${index === 0 ? "first" : ""}`}
                      >
                        {index + 1}
                      </div>
                      <div className="mais-lidas-content">
                        <span className="mais-lidas-category">
                          {item.categoria?.nome?.toUpperCase() || "TV RUSSAS"}
                        </span>
                        <h4 className="mais-lidas-title">{item.titulo}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
