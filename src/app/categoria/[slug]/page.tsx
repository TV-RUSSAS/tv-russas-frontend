import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { API_URL } from '@/services/api';
import { getImagePath } from '@/utils/imagePath';
import type { Metadata } from 'next';
import { DOMAIN } from '@/utils/domain';

interface Noticia {
  id: string; titulo: string; slug: string; capaUrl: string;
  publicadoEm: string; categoria: { nome: string; slug: string };
  conteudo: string;
}

const NOMES: Record<string, string> = {
  cidade: 'Cidade', politica: 'Política', esporte: 'Esporte',
  entretenimento: 'Entretenimento', policia: 'Polícia',
  youtube: 'Youtube', brasil: 'Brasil', ceara: 'Ceará',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const nome = NOMES[slug] || "Categoria";
  const title = `Notícias de ${nome} - TV Russas`;
  const description = `Fique por dentro das últimas notícias sobre ${nome} em Russas, no Ceará e em toda a região do Vale do Jaguaribe.`;
  const categoryUrl = `${DOMAIN}/categoria/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title,
      description,
      url: categoryUrl,
      siteName: "TV Russas",
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: "https://tv-russas-backend.onrender.com/uploads/sistema/tv.jpg",
          width: 1200,
          height: 630,
          alt: `Notícias sobre ${nome}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://tv-russas-backend.onrender.com/uploads/sistema/tv.jpg"],
    },
    keywords: [
      `Notícias sobre ${nome}`,
      `Russas ${nome}`,
      "Russas CE",
      "TV Russas",
      "Ceará notícias",
      "Interior do Ceará",
    ],
  };
}

async function getNoticias(slug: string): Promise<Noticia[]> {
  try {
    const res = await fetch(`${API_URL}/noticias`, { cache: 'no-store' });
    if (!res.ok) return [];
    const todas: Noticia[] = await res.json();
    const filtradas = todas
      .filter(n => n.categoria.slug === slug)
      .sort((a, b) => new Date(b.publicadoEm).getTime() - new Date(a.publicadoEm).getTime());
    return filtradas;
  } catch { return []; }
}

const BANNERS_CATEGORIA: Record<string, string> = {
  cidade: 'anuncio/Anuncio1.png',
  politica: 'anuncio/banner2.png',
  esporte: 'anuncio/Anuncio1.png',
  entretenimento: 'anuncio/banner2.png',
  policia: 'anuncio/Anuncio1.png',
  youtube: 'anuncio/banner2.png',
  brasil: 'anuncio/Anuncio1.png',
  ceara: 'anuncio/banner2.png',
};

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const nome = NOMES[slug];
  if (!nome) notFound();

  const noticias = await getNoticias(slug);
  const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const bannerImg = BANNERS_CATEGORIA[slug] || 'anuncio/Anuncio1.png';
  const isClickable = bannerImg === 'anuncio/Anuncio1.png';
  const adLink = 'https://dinheironamao.trabalho.ce.gov.br';

  const categorySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${DOMAIN}/categoria/${slug}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": `${DOMAIN}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": nome,
            "item": `${DOMAIN}/categoria/${slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="site-container">
      {/* Schema estruturado injetado via SSR */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />
      {/* BANNER TOPO: RODÍZIO POR CATEGORIA */}
      <div className="banner-anuncio" style={{ marginBottom: '30px' }}>
        {isClickable ? (
          <a href={adLink} target="_blank" rel="noopener noreferrer">
            <Image 
              src={getImagePath(bannerImg)} 
              alt={`Patrocínio ${nome}`} 
              width={1280} 
              height={140} 
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
              unoptimized={true}
              priority 
            />
          </a>
        ) : (
          <Image 
            src={getImagePath(bannerImg)} 
            alt={`Patrocínio ${nome}`} 
            width={1280} 
            height={140} 
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
            unoptimized={true}
            priority 
          />
        )}
      </div>

      <div className="categoria-header">
        <h1>Categoria: {nome}</h1>
      </div>

      <div className="categoria-grid">
        {noticias.length > 0 ? (
          noticias.map((n) => (
            <Link key={n.slug} href={`/noticia/${n.slug}`} className="card-noticia">
              <Image
                src={getImagePath(n.capaUrl)}
                alt={n.titulo}
                width={400}
                height={200}
                className="card-noticia-img"
                sizes="(max-width: 640px) 100vw, 300px"
              />
              <div className="card-noticia-body">
                <span className="card-noticia-categoria">{n.categoria.nome}</span>
                <p className="card-noticia-titulo">{n.titulo}</p>
                <span className="card-noticia-data">{data(n.publicadoEm)}</span>
                <p className="card-noticia-resumo">
                  {n.conteudo.replace(/<[^>]*>/g, '').substring(0, 140)}...
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="no-news">Nenhuma notícia encontrada nesta categoria.</p>
        )}
      </div>
    </div>
  );
}
