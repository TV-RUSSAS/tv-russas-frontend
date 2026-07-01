import Image from 'next/image';
import Link from 'next/link';
import { getImagePath } from '@/utils/imagePath';

interface NewsCardProps {
  slug: string;
  titulo: string;
  capaUrl: string;
  categoria: string;
  data?: string;
  variant?: 'default' | 'highlight' | 'item';
}

export function NewsCard({ slug, titulo, capaUrl, categoria, data, variant = 'default' }: NewsCardProps) {
  
  // Versão 1: Destaque Principal (Grande com texto por cima)
  if (variant === 'highlight') {
    return (
      <Link href={`/noticia/${slug}`} prefetch={false} className="highlight-main block relative">
        <div className="relative w-full h-full">
          <Image 
            src={getImagePath(capaUrl)} 
            alt={titulo} 
            fill 
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>
        <span className="categoria-badge">{categoria}</span>
        <h2>{titulo}</h2>
        <div className="highlight-overlay"></div>
      </Link>
    );
  }

  // Versão 2: Item de Lista (Horizontal pequeno para "Últimas")
  if (variant === 'item') {
    return (
      <Link href={`/noticia/${slug}`} prefetch={false} className="noticia-item">
        <div className="relative w-[110px] h-[70px] shrink-0">
          <Image 
            src={getImagePath(capaUrl)} 
            alt={titulo} 
            fill 
            sizes="110px"
            className="object-cover rounded" 
          />
        </div>
        <div className="info">
          <p>{titulo}</p>
          {data && <small>{data}</small>}
        </div>
      </Link>
    );
  }

  // Versão 3: Card Padrão (Vertical com imagem no topo)
  return (
    <Link href={`/noticia/${slug}`} prefetch={false} className="card">
      <span className="card-categoria">{categoria}</span>
      <div className="relative w-full h-[180px]">
        <Image 
          src={getImagePath(capaUrl)} 
          alt={titulo} 
          fill 
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover object-top" 
        />
      </div>
      <p>{titulo}</p>
      {data && <small>{data}</small>}
    </Link>
  );
}
