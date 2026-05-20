import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import "./home-premium.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { DOMAIN } from "@/utils/domain";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "TV Russas - O portal de notícias de Russas e região",
    template: "%s | TV Russas",
  },
  description: "Fique por dentro das últimas notícias de Russas, Ceará e região. Cobertura completa de política, esporte, entretenimento, colunas e reportagens especiais.",
  metadataBase: new URL(DOMAIN),
  alternates: {
    canonical: DOMAIN,
  },
  keywords: [
    "Russas CE",
    "Notícias de Russas",
    "TV Russas",
    "Últimas notícias de Russas",
    "Ceará notícias",
    "Interior do Ceará",
    "Vale do Jaguaribe",
    "UFC Russas",
  ],
  icons: {
    icon: "https://tv-russas-backend.onrender.com/uploads/sistema/1.png",
    shortcut: "https://tv-russas-backend.onrender.com/uploads/sistema/1.png",
    apple: "https://tv-russas-backend.onrender.com/uploads/sistema/1.png",
  },
  verification: {
    google: "googlea234f6b2160d5bba", // O código do Search Console
  },
  openGraph: {
    title: "TV Russas - O portal de notícias de Russas e região",
    description: "Fique por dentro das últimas notícias de Russas, Ceará e região. Cobertura completa de política, esporte, entretenimento, colunas e reportagens especiais.",
    url: DOMAIN,
    siteName: "TV Russas",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://tv-russas-backend.onrender.com/uploads/sistema/tv.jpg",
        width: 1200,
        height: 630,
        alt: "TV Russas Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TV Russas - O portal de notícias de Russas e região",
    description: "Fique por dentro das últimas notícias de Russas, Ceará e região.",
    images: ["https://tv-russas-backend.onrender.com/uploads/sistema/tv.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Configuração de schemas múltiplos aninhados (Website, Organization, LocalBusiness)
  const baseSchemas = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${DOMAIN}/#website`,
        "url": `${DOMAIN}/`,
        "name": "TV Russas",
        "description": "O portal de notícias de Russas e região",
        "publisher": {
          "@id": `${DOMAIN}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${DOMAIN}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "pt-BR"
      },
      {
        "@type": "Organization",
        "@id": `${DOMAIN}/#organization`,
        "name": "TV Russas",
        "url": `${DOMAIN}/`,
        "logo": {
          "@type": "ImageObject",
          "url": "https://tv-russas-backend.onrender.com/uploads/sistema/1.png",
          "caption": "TV Russas"
        },
        "sameAs": [
          "https://www.instagram.com/",
          "https://www.facebook.com/share/1BN4Yrd75d/"
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": `${DOMAIN}/#localbusiness`,
        "name": "TV Russas",
        "image": "https://tv-russas-backend.onrender.com/uploads/sistema/tv.jpg",
        "url": `${DOMAIN}/`,
        "telephone": "",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Russas",
          "addressRegion": "CE",
          "addressCountry": "BR"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -4.9378,
          "longitude": -37.9756
        },
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": "Russas e Região do Vale do Jaguaribe"
        }
      }
    ]
  };

  // Carrega chaves de ambiente ou usa códigos padrão configurados
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-PW5B7N3Q";
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-E2T5E2W2T5";

  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        {/* Schema estruturado global de SEO Local e Negócio */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(baseSchemas) }}
        />
      </head>
      <body className={`${inter.variable} ${lora.variable}`}>
        <ScrollToTop />
        <Header />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
        <GoogleTagManager gtmId={gtmId} />
        <GoogleAnalytics gaId={gaId} />
      </body>
    </html>
  );
}
