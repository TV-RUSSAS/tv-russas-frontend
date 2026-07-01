import type { NextConfig } from "next";

// Domínios externos utilizados no portal TV Russas
const CLOUDINARY = "https://res.cloudinary.com";
const YOUTUBE = "https://www.youtube.com https://www.youtube-nocookie.com";
const INSTAGRAM = "https://www.instagram.com";
const FACEBOOK = "https://www.facebook.com";
const GOOGLE_TAG = "https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com";
const CLOUDFLARE = "https://challenges.cloudflare.com";
const GOOGLE_FONTS = "https://fonts.googleapis.com https://fonts.gstatic.com";

// Construção da diretiva CSP completa
// 'unsafe-inline' é necessário em scriptSrc porque o Next.js injeta scripts inline.
// 'unsafe-eval' é necessário para hydration do React em modo desenvolvimento.
// Em produção, avaliar a migração para nonce-based CSP via middleware.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrcDirectives = [
  "'self'",
  "'unsafe-inline'",
  isDev ? "'unsafe-eval'" : "",
  GOOGLE_TAG,
  CLOUDFLARE
].filter(Boolean).join(" ");

const cspDirectives = [
  `default-src 'self'`,
  `script-src ${scriptSrcDirectives}`,
  `style-src 'self' 'unsafe-inline' ${GOOGLE_FONTS}`,
  `font-src 'self' ${GOOGLE_FONTS}`,
  `img-src 'self' data: blob: ${CLOUDINARY} https://img.youtube.com https://i.ytimg.com ${INSTAGRAM} ${FACEBOOK} http://localhost:3001 http://127.0.0.1:3001 https://tv-russas-backend.onrender.com https://images.unsplash.com https://picsum.photos`,
  `media-src 'self' blob: ${CLOUDINARY}`,
  `frame-src 'self' ${YOUTUBE} ${INSTAGRAM} ${FACEBOOK} ${CLOUDFLARE}`,
  `connect-src 'self' ${GOOGLE_TAG} ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self' ${CLOUDFLARE}`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Adicionado para permitir imagens do localhost sem erros de IP privado
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
      },
      {
        protocol: 'https',
        hostname: 'tv-russas-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Aplica cabeçalhos de segurança em todas as rotas públicas e admin
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

