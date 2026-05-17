import "./noticia-premium.css";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getImagePath } from "@/utils/imagePath";
import { ViewTracker } from "@/components/ViewTracker";
import { ArticleInteractions } from "@/components/ArticleInteractions";
import { ArticleFeedbackWrapper as ArticleFeedback } from "@/components/ArticleFeedbackWrapper";
import TrendingWidget from "@/components/TrendingWidget";
import { apiService } from "@/services/api";

function formatArticleContent(htmlContent: string): string {
  let content = htmlContent.trim();

  // 0. Remover qualquer linha bruta e sem estilo de autor (ex: "TV Russas", "Portal TV Russas", "Publicado por: TV Russas") do final do texto para evitar duplicidade
  // Caso A: Parágrafo no final absoluto
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)?\s*(?:Publicado\s+por\s*:\s*|Portal\s+)?TV\s*Russas\s*(?:<\/strong>|<\/b>)?\s*<\/p>\s*$/gi,
    ""
  );
  // Caso B: Linha após br ou quebra de linha no final absoluto
  content = content.replace(
    /(?:<br\s*\/?>|\n)\s*(?:<strong>|<b>)?\s*(?:Publicado\s+por\s*:\s*|Portal\s+)?TV\s*Russas\s*(?:<\/strong>|<\/b>)?\s*$/gi,
    ""
  );
  // Caso C: Parágrafo genérico nos últimos 150 caracteres
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)?\s*(?:Publicado\s+por\s*:\s*|Portal\s+)?TV\s*Russas\s*(?:<\/strong>|<\/b>)?\s*<\/p>/gi,
    (match, p1, offset, string) => {
      const actualOffset = typeof p1 === "number" ? p1 : offset;
      if (actualOffset > string.length - 150) {
        return "";
      }
      return match;
    }
  );

  // 1. Substituir "TV Russas" (ou variações) no final por "Publicado por: TV Russas" com classe de atribuição e negrito limpo (sem aninhamento)
  // Caso 1: Dentro de um parágrafo no final absoluto da string
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)?\s*(?:Publicado\s+por\s*:\s*)?(TV\s+Russas|Tv\s+Russas|tv\s+russas)\s*(?:<\/strong>|<\/b>)?\s*<\/p>\s*$/i,
    '<p class="article-author-attribution"><strong>Publicado por: TV Russas</strong></p>'
  );

  // Caso 2: Precedido por <br /> ou quebra de linha no final absoluto da string
  content = content.replace(
    /(?:<br\s*\/?>|\n)\s*(?:<strong>|<b>)?\s*(?:Publicado\s+por\s*:\s*)?(TV\s+Russas|Tv\s+Russas|tv\s+russas)\s*(?:<\/strong>|<\/b>)?\s*$/i,
    '<br /><strong class="article-author-attribution">Publicado por: TV Russas</strong>'
  );

  // Caso 3: Dentro de um parágrafo genérico localizado nos últimos 150 caracteres (caso haja espaços/tags vazias depois)
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)?\s*(?:Publicado\s+por\s*:\s*)?(TV\s+Russas|Tv\s+Russas|tv\s+russas)\s*(?:<\/strong>|<\/b>)?\s*<\/p>/gi,
    (match, p1, offset, string) => {
      if (offset > string.length - 150) {
        return '<p class="article-author-attribution"><strong>Publicado por: TV Russas</strong></p>';
      }
      return match;
    }
  );

  // 2. Colocar a linha inteira da "Fonte: [Nome]" em negrito com classe de atribuição e sem aninhamento
  // Caso 1: Fonte dentro de um <p> contendo ou não tags <strong>/<b>
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)?\s*Fonte\s*:\s*([^<\n]+?)\s*(?:<\/strong>|<\/b>)?\s*<\/p>/gi,
    '<p class="article-source-attribution"><strong>Fonte: $1</strong></p>'
  );

  // Caso 2: Citação solta de Fonte no texto
  content = content.replace(
    /(?<!class="article-source-attribution">)Fonte\s*:\s*([^<\n\r]+)/gi,
    '<strong class="article-source-attribution">Fonte: $1</strong>'
  );

  // 3. Transformar parágrafos que contêm APENAS <strong> ou <b> em subtítulos h3 semânticos com a classe article-subheading
  // Isso impede conflitos com negritos inline (tags strong dentro de parágrafos com outros textos)
  content = content.replace(
    /<p>\s*(?:<strong>|<b>)\s*([^<]+?)\s*(?:<\/strong>|<\/b>)\s*<\/p>/gi,
    '<h3 class="article-subheading">$1</h3>'
  );

  // 4. Garantir que todas as notícias possuam a assinatura de autoria (Publicado por: TV Russas) para padronização total
  if (!content.includes('class="article-author-attribution"')) {
    content += '\n<p class="article-author-attribution"><strong>Publicado por: TV Russas</strong></p>';
  }

  return content;
}

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const noticia = await apiService.getNoticia(slug);
  if (!noticia) notFound();

  const [todasNoticias, trendingRaw, maisLidasRaw] = await Promise.all([
    apiService.getNoticias(),
    apiService.getTrending(),
    apiService.getMaisLidas(),
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
  const postUrl = `https://tvrussas.com.br/noticia/${slug}`;

  return (
    <main className="editorial-article-container">
      {/* Barra de progresso + botões flutuantes */}
      <ArticleInteractions title={noticia.titulo} url={postUrl} />
      <ViewTracker slug={slug} />

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
                  Por{" "}
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
                  <span className="meta-separator">·</span>
                  <span className="view-count">
                    <i className="far fa-eye" /> {noticia.views || 0}{" "}
                    visualizações
                  </span>
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
            <span>FOTO: REPRODUÇÃO / ACERVO TV RUSSAS</span>
          </figcaption>
        </figure>

        {/* ===== GRID DE CONTEÚDO EDITORIAL ===== */}
        <div className="editorial-content-grid">
          {/* ── COLUNA DE LEITURA ── */}
          <div className="editorial-main-content">
            {/* O corpo do texto com classe de alta especificidade */}
            <div
              className="article-body-content premium-editorial-flow"
              dangerouslySetInnerHTML={{
                __html: formatArticleContent(noticia.conteudo),
              }}
            />

            {/* Tags */}
            <div className="article-footer">
              <div className="tags-section">
                <span className="tags-label">ASSUNTOS:</span>
                <div className="tags-list">
                  <Link
                    href={`/categoria/${noticia.categoria.slug}`}
                    className="tag-link"
                  >
                    {noticia.categoria.nome}
                  </Link>
                  <Link href="/search?q=Ceará" className="tag-link">
                    Ceará
                  </Link>
                  <Link href="/search?q=Russas" className="tag-link">
                    Russas
                  </Link>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <ArticleFeedback articleId={noticia.id.toString()} />

            {/* Leia Também */}
            {relacionadas.length > 0 && (
              <section className="editorial-related-bottom">
                <h3 className="section-heading-elegant">
                  <span>Leia Também</span>
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
