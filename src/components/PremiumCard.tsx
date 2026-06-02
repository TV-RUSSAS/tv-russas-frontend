import Image from "next/image";
import Link from "next/link";
import { getImagePath } from "@/utils/imagePath";

import { Noticia } from "@/types";

export default function PremiumCard({
  noticia,
  size = "medium",
}: {
  noticia: Noticia;
  size?: "small" | "medium" | "large" | "list";
}) {
  const dataFormatada = new Date(noticia.publicadoEm).toLocaleDateString(
    "pt-BR",
    { timeZone: "America/Sao_Paulo" }
  );

  // Função para limpar HTML
  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, "");

  // Fallback inteligente para o resumo (limpando HTML de ambos)
  const resumoLimpo = noticia.resumo ? stripHtml(noticia.resumo) : "";
  const conteudoLimpo = noticia.conteudo ? stripHtml(noticia.conteudo) : "";

  const resumoFinal = resumoLimpo || conteudoLimpo.substring(0, 140) + "...";

  // ----------------------------------------------------
  // LIST CARD
  // ----------------------------------------------------
  if (size === "list") {
    return (
      <Link
        href={`/noticia/${noticia.slug}`}
        prefetch={false}
        className="premium-card-list smooth-transition"
      >
        <div className="list-img-wrapper">
          <Image
            src={getImagePath(noticia.capaUrl)}
            alt={noticia.titulo}
            fill
            sizes="150px"
            className="card-image object-cover image-zoom"
          />
        </div>
        <div className="list-content">
          <span className="premium-tag-small">{noticia.categoria.nome}</span>
          <h4 className="list-title">{noticia.titulo}</h4>
          <span className="list-date">{dataFormatada}</span>
        </div>
      </Link>
    );
  }

  // ----------------------------------------------------
  // LARGE & MEDIUM CARDS (HERO) - Texto DENTRO da imagem com overlay
  // ----------------------------------------------------
  if (size === "large" || size === "medium") {
    return (
      <Link
        href={`/noticia/${noticia.slug}`}
        prefetch={false}
        className={`premium-card ${size} smooth-transition hover-card`}
      >
        <Image
          src={getImagePath(noticia.capaUrl)}
          alt={noticia.titulo}
          fill
          sizes={size === "large" ? "100vw" : "50vw"}
          className="card-image object-cover image-zoom"
          priority={size === "large" || size === "medium"}
        />
        <div className="premium-card-overlay"></div>
        <div className="premium-card-content">
          <span className="premium-tag">{noticia.categoria.nome}</span>
          <h2
            className={
              size === "large"
                ? "premium-title-large"
                : "premium-title-medium-hero"
            }
          >
            {noticia.titulo}
          </h2>

          {/* Adicionando resumo nos destaques */}
          <p className="premium-card-excerpt">{resumoFinal}</p>

          <div className="premium-meta-white">
            <span>{dataFormatada}</span>
            {size === "large" && (
              <span>
                <i className="far fa-star"></i> Destaque
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ----------------------------------------------------
  // SMALL CARD (Grid) - Layout Clean (Imagem em cima, texto em baixo)
  // ----------------------------------------------------
  return (
    <article className="clean-flex-card smooth-transition hover-card h-full">
      <Link
        href={`/noticia/${noticia.slug}`}
        prefetch={false}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div className="small-img-wrapper">
          <Image
            src={getImagePath(noticia.capaUrl)}
            alt={noticia.titulo}
            fill
            sizes="400px"
            className="card-image object-cover image-zoom"
          />
          <span className="premium-tag-floating">{noticia.categoria.nome}</span>
        </div>

        <div className="clean-content">
          <h3 className="small-title">{noticia.titulo}</h3>
          <p className="small-excerpt">{resumoFinal}</p>
          <div className="small-meta">{dataFormatada} • TV Russas</div>
        </div>
      </Link>
    </article>
  );
}
