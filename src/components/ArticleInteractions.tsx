"use client";

import { useEffect, useState } from "react";

export function ArticleInteractions({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Cálculo do progresso de leitura
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;

      setScrollProgress(Number(scroll));
      setShowBackToTop(totalScroll > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " - " + url)}`,
      "_blank",
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  return (
    <>
      {/* Barra de Progresso de Leitura */}
      <div
        className="reading-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* Botões de Compartilhamento Sticky Flutuantes */}
      <div className="sticky-share-sidebar">
        <button
          className="share-btn whatsapp"
          onClick={shareWhatsApp}
          aria-label="Compartilhar no WhatsApp"
        >
          <i className="fab fa-whatsapp"></i>
        </button>
        <button
          className="share-btn twitter"
          onClick={shareTwitter}
          aria-label="Compartilhar no X (Twitter)"
        >
          <i className="fab fa-twitter"></i>
        </button>
        <button
          className="share-btn facebook"
          onClick={shareFacebook}
          aria-label="Compartilhar no Facebook"
        >
          <i className="fab fa-facebook-f"></i>
        </button>
      </div>

      {/* Voltar ao topo */}
      <button
        className={`back-to-top-btn ${showBackToTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
      >
        <i className="fas fa-chevron-up"></i>
      </button>
    </>
  );
}
