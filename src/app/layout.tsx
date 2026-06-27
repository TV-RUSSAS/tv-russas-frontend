import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import "./home-premium.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  description:
    "Fique por dentro das últimas notícias de Russas, Ceará e região. Cobertura completa de política, esporte, entretenimento, colunas e reportagens especiais.",
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
    // FASE 1 — Migrado de onrender.com para /public do Next.js (Vercel)
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  verification: {
    google: "googlea234f6b2160d5bba", // O código do Search Console
  },
  openGraph: {
    title: "TV Russas - O portal de notícias de Russas e região",
    description:
      "Fique por dentro das últimas notícias de Russas, Ceará e região. Cobertura completa de política, esporte, entretenimento, colunas e reportagens especiais.",
    url: DOMAIN,
    siteName: "TV Russas",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        // FASE 1 — Migrado de onrender.com para /public do Next.js (Vercel)
        url: "/og-tv-russas.jpg",
        width: 1200,
        height: 630,
        alt: "TV Russas Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TV Russas - O portal de notícias de Russas e região",
    description:
      "Fique por dentro das últimas notícias de Russas, Ceará e região.",
    // FASE 1 — Migrado de onrender.com para /public do Next.js (Vercel)
    images: ["/og-tv-russas.jpg"],
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
        url: `${DOMAIN}/`,
        name: "TV Russas",
        description: "O portal de notícias de Russas e região",
        publisher: {
          "@id": `${DOMAIN}/#organization`,
        },
        // Documentação: SearchAction descreve a busca funcional interna do portal TV Russas.
        // A presença deste schema não garante a exibição da "Sitelinks Search Box" especial no Google,
        // mas ajuda o bot a entender a arquitetura interna.
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${DOMAIN}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        inLanguage: "pt-BR",
      },
      {
        "@type": "NewsMediaOrganization",
        "@id": `${DOMAIN}/#organization`,
        name: "TV Russas",
        url: `${DOMAIN}/`,
        logo: {
          "@type": "ImageObject",
          url: "/logo-tv-russas.png",
          caption: "TV Russas",
        },
        sameAs: [
          "https://www.instagram.com/",
          "https://www.facebook.com/share/1BN4Yrd75d/",
        ],
      }
    ],
  };

  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      {/* Layout Principal da TV Russas */}
      <head>
        {/* Schema estruturado global de SEO Local e Negócio */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(baseSchemas).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className={`${inter.variable} ${lora.variable}`}>
        <ScrollToTop />
        <Header />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
