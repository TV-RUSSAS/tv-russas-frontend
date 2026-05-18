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
  const [showToast, setShowToast] = useState(false);

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

  const shareInstagram = () => {
    navigator.clipboard.writeText(url).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
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
          aria-label="Compartilhar no X"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white" style={{ width: "16px", height: "16px" }}>
            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
          </svg>
        </button>
        <button
          className="share-btn facebook"
          onClick={shareFacebook}
          aria-label="Compartilhar no Facebook"
        >
          <i className="fab fa-facebook-f"></i>
        </button>
        <button
          className="share-btn instagram"
          onClick={shareInstagram}
          aria-label="Compartilhar no Instagram"
          style={{ background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
        >
          <i className="fab fa-instagram"></i>
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

      {/* Toast flutuante para Instagram */}
      <div className={`share-toast ${showToast ? "visible" : ""}`}>
        <i className="fas fa-check-circle" style={{ color: "#fff", marginRight: "8px" }}></i>
        Link copiado! Compartilhe no Instagram.
      </div>
    </>
  );
}

// NOVO COMPONENTE EXPORTADO COMPATÍVEL COM CLIENT SIDE E IMUNE A ADBLOCK
export function InlineShare({ title, url }: { title: string; url: string }) {
  const [showToast, setShowToast] = useState(false);

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

  const shareInstagram = () => {
    navigator.clipboard.writeText(url).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
  };

  return (
    <div className="article-share-inline-container">
      <span className="share-inline-title">Compartilhe esta matéria:</span>
      <div className="share-inline-buttons">
        <button
          onClick={shareWhatsApp}
          className="share-inline-btn s-wa"
          style={{ backgroundColor: "#25D366" }}
          aria-label="Compartilhar no WhatsApp"
        >
          <i className="fab fa-whatsapp"></i> WhatsApp
        </button>
        <button
          onClick={shareTwitter}
          className="share-inline-btn s-twt"
          style={{ backgroundColor: "#111111" }}
          aria-label="Compartilhar no X"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white" style={{ width: "14px", height: "14px", marginRight: "4px" }}>
            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
          </svg> X
        </button>
        <button
          onClick={shareFacebook}
          className="share-inline-btn s-fbk"
          style={{ backgroundColor: "#1877F2" }}
          aria-label="Compartilhar no Facebook"
        >
          <i className="fab fa-facebook-f"></i> Facebook
        </button>
        <button
          onClick={shareInstagram}
          className="share-inline-btn s-ins"
          style={{ background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}
          aria-label="Compartilhar no Instagram"
        >
          <i className="fab fa-instagram"></i> Instagram
        </button>
      </div>

      {/* Toast flutuante para Instagram */}
      <div className={`share-toast ${showToast ? "visible" : ""}`}>
        <i className="fas fa-check-circle" style={{ color: "#fff", marginRight: "8px" }}></i>
        Link copiado! Compartilhe no Instagram.
      </div>
    </div>
  );
}
