import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { API_URL } from '@/services/api';
import { getImagePath } from '@/utils/imagePath';

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
  cidade: 'Anuncio1.png',
  politica: 'banner2.png',
  esporte: 'Anuncio1.png',
  entretenimento: 'banner2.png',
  policia: 'Anuncio1.png',
  youtube: 'banner2.png',
  brasil: 'Anuncio1.png',
  ceara: 'banner2.png',
};

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const nome = NOMES[slug];
  if (!nome) notFound();

  const noticias = await getNoticias(slug);
  const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const bannerImg = BANNERS_CATEGORIA[slug] || 'Anuncio1.png';

  return (
    <div className="site-container">
      {/* BANNER TOPO: RODÍZIO POR CATEGORIA */}
      <div className="banner-anuncio" style={{ marginBottom: '30px' }}>
        <Image 
          src={getImagePath(bannerImg)} 
          alt={`Patrocínio ${nome}`} 
          width={1280} 
          height={140} 
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
          unoptimized={true}
          priority 
        />
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
