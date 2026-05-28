'use client';
import React, { useRef, useState, useEffect } from 'react';

interface PremiumVideoPlayerProps {
  src: string;
  caption?: string;
  isCapa?: boolean;
}

export function PremiumVideoPlayer({ src, caption, isCapa }: PremiumVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoVertical, setIsVideoVertical] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.log("Autoplay blocked by browser policy, waiting for interaction", err);
      });
    }
  }, [src]);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !videoRef.current.muted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      // Define se o vídeo é vertical (ex: 9:16 de Reels/TikTok) ou horizontal (16:9)
      setIsVideoVertical(videoHeight > videoWidth);
    }
  };

  return (
    <div 
      className="premium-native-player-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: isCapa ? '0 auto' : '32px auto',
        width: '100%',
        maxWidth: isVideoVertical ? '360px' : '860px',
        clear: 'both'
      }}
    >
      <div 
        className="premium-video-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#000000',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          aspectRatio: isVideoVertical ? '9/16' : '16/9'
        }}
      >
        <video
          ref={videoRef}
          src={src}
          loop
          playsInline
          autoPlay
          muted={isMuted}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={toggleMute}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            cursor: 'pointer'
          }}
        />

        {/* Botão flutuante estilizado de som no canto superior esquerdo (idêntico ao do G1) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s, transform 0.1s',
            zIndex: 10,
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <i className={isMuted ? "fas fa-volume-mute" : "fas fa-volume-up"} style={{ fontSize: '14px' }} />
          {isMuted ? "Ativar som" : "Desativar som"}
        </button>
      </div>

      {caption && (
        <div 
          className="premium-video-caption"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            fontStyle: 'italic',
            color: '#8b949e',
            marginTop: '12px',
            textAlign: 'center',
            lineHeight: '1.4',
            padding: '0 16px',
            maxWidth: '100%'
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
