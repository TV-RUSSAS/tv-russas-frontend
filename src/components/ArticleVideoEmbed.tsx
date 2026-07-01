'use client';
import React from 'react';
import { PremiumVideoPlayer } from './PremiumVideoPlayer';

export type VideoPlatform = 'youtube' | 'video' | 'instagram' | 'facebook' | 'unknown';

// Função de detecção altamente restrita e segura
export function detectVideoPlatform(url: string): VideoPlatform {
  try {
    const cleanUrl = url.trim();
    const cleanUrlLower = cleanUrl.toLowerCase();
    
    // Detecção de Vídeo Direto (MP4, WebM, OGG, uploads Cloudinary/locais)
    if (
      cleanUrlLower.endsWith('.mp4') || 
      cleanUrlLower.endsWith('.webm') || 
      cleanUrlLower.endsWith('.ogg') ||
      cleanUrlLower.includes('.mp4?') ||
      cleanUrlLower.includes('/video-upload/') ||
      cleanUrlLower.includes('/videos-admin/')
    ) {
      return 'video';
    }

    // Adiciona protocolo caso esteja faltando para permitir análise de URL
    const urlWithProtocol = cleanUrl.match(/^https?:\/\//i) ? cleanUrl : `https://${cleanUrl}`;
    const parsedUrl = new URL(urlWithProtocol);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Lista estrita de domínios permitidos por segurança
    const allowedYouTube = ['youtube.com', 'www.youtube.com', 'youtu.be', 'youtube-nocookie.com'];
    const allowedInstagram = ['instagram.com', 'www.instagram.com'];
    const allowedFacebook = ['facebook.com', 'www.facebook.com', 'fb.watch', 'fb.com'];
    
    if (allowedYouTube.includes(hostname)) {
      return 'youtube';
    }
    if (allowedInstagram.includes(hostname)) {
      return 'instagram';
    }
    if (allowedFacebook.includes(hostname)) {
      return 'facebook';
    }
  } catch (e) {
    // Falha na análise da URL (inválida)
  }
  return 'unknown';
}

// Converte Shorts ou links normais do YouTube para formato /embed/ seguro
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) {
        videoId = shortsMatch[1];
      }
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
  } catch (e) {
    // Erro ao analisar URL
  }
  return null;
}

export function getInstagramEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (parsed.hostname.includes('instagram.com')) {
      // Remove barra final e query params
      const path = parsed.pathname.replace(/\/$/, '');
      // Suporta posts, reels e IGTV
      if (path.startsWith('/p/') || path.startsWith('/reel/') || path.startsWith('/tv/')) {
        return `https://www.instagram.com${path}/embed/captioned`;
      }
    }
  } catch (e) {
    // Erro ao analisar URL
  }
  return null;
}

interface ArticleVideoEmbedProps {
  url: string;
  platform?: VideoPlatform;
  caption?: string;
  credit?: string;
}

export function ArticleVideoEmbed({ url, platform: initialPlatform, caption, credit }: ArticleVideoEmbedProps) {
  const platform = initialPlatform || detectVideoPlatform(url);

  // 1. VÍDEO DO YOUTUBE
  if (platform === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(url);
    if (!embedUrl) {
      return (
        <div className="article-video-block-fallback">
          <a href={url} target="_blank" rel="noopener noreferrer" className="editorial-link-fallback">
            <i className="fab fa-youtube" style={{ marginRight: '8px', color: '#ff0000' }} />
            Ver vídeo original no YouTube
          </a>
        </div>
      );
    }

    return (
      <div className="article-video-block">
        <span className="video-label"><i className="fas fa-play" style={{ marginRight: '6px' }} />Vídeo</span>
        <div className="article-video-frame">
          <iframe
            src={embedUrl}
            title={caption || "Vídeo da matéria"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        {(caption || credit) && (
          <div className="article-video-info-meta">
            {caption && <span className="article-video-caption">{caption}</span>}
            {credit && <span className="article-video-credit">Foto/Vídeo: {credit}</span>}
          </div>
        )}
      </div>
    );
  }

  // 2. VÍDEO DIRETO (.MP4 / CLOUDINARY / LOCAL)
  if (platform === 'video') {
    return (
      <div className="article-video-block">
        <span className="video-label"><i className="fas fa-play" style={{ marginRight: '6px' }} />Vídeo</span>
        <PremiumVideoPlayer src={url} caption={caption} />
        {credit && (
          <div className="article-video-info-meta" style={{ marginTop: '0', display: 'flex', justifyContent: 'center' }}>
            <span className="article-video-credit">Foto/Vídeo: {credit}</span>
          </div>
        )}
      </div>
    );
  }

  // 3. INSTAGRAM EMBED
  if (platform === 'instagram') {
    const embedUrl = getInstagramEmbedUrl(url);
    if (!embedUrl) {
      return (
        <div className="article-video-fallback-container">
          <a href={url} target="_blank" rel="noopener noreferrer" className="editorial-link-fallback">
            <i className="fab fa-instagram" style={{ marginRight: '8px', color: '#e1306c' }} />
            Ver publicação original no Instagram <i className="fas fa-external-link-alt" style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }} />
          </a>
          {caption && <span className="article-video-caption" style={{ marginTop: '8px', display: 'block', textAlign: 'center' }}>{caption}</span>}
        </div>
      );
    }

    return (
      <div className="article-video-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span className="video-label" style={{ alignSelf: 'flex-start' }}><i className="fab fa-instagram" style={{ marginRight: '6px' }} />Instagram</span>
        <iframe
          src={embedUrl}
          title={caption || "Publicação do Instagram"}
          width="100%"
          height="650"
          style={{ maxWidth: '540px', border: '1px solid #dbdbdb', borderRadius: '3px', boxShadow: 'none', margin: '15px 0' }}
          allow="encrypted-media"
          allowFullScreen
          loading="lazy"
        />
        {(caption || credit) && (
          <div className="article-video-info-meta" style={{ alignSelf: 'flex-start', width: '100%' }}>
            {caption && <span className="article-video-caption">{caption}</span>}
            {credit && <span className="article-video-credit">Crédito: {credit}</span>}
          </div>
        )}
      </div>
    );
  }

  // 4. LINK EDITORIAL COMPACTO PARA FACEBOOK
  if (platform === 'facebook') {
    return (
      <div className="article-video-fallback-container">
        <a href={url} target="_blank" rel="noopener noreferrer" className="editorial-link-fallback">
          <i className="fab fa-facebook" style={{ marginRight: '8px', color: '#1877f2' }} />
          Ver publicação original no Facebook <i className="fas fa-external-link-alt" style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }} />
        </a>
        {caption && <span className="article-video-caption" style={{ marginTop: '8px', display: 'block', textAlign: 'center' }}>{caption}</span>}
      </div>
    );
  }

  // 5. OUTRO DOMÍNIO / LINK GENÉRICO
  return (
    <div className="article-video-fallback-container">
      <a href={url} target="_blank" rel="noopener noreferrer" className="editorial-link-fallback">
        <i className="fas fa-link" style={{ marginRight: '8px', color: '#6b7280' }} />
        Acessar link externo relacionado <i className="fas fa-external-link-alt" style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }} />
      </a>
      {caption && <span className="article-video-caption" style={{ marginTop: '8px', display: 'block', textAlign: 'center' }}>{caption}</span>}
    </div>
  );
}
