import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getImagePath } from "@/utils/imagePath";
import { apiService } from "@/services/api";
import { Noticia, Colunista } from "@/types";


export default async function ColunistaPerfil({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const colunista: Colunista | null = await apiService.getColunista(slug);

  if (!colunista) {
    notFound();
  }

  const noticiasColunista = colunista.noticias || [];

  return (
    <main style={{ background: '#fff' }}>
      {/* Cabeçalho Centralizado estilo SVM */}
      <div className="colunista-header-hero" style={{ 
        background: '#f8fafc', 
        padding: '80px 20px', 
        textAlign: 'center',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="profile-image-container" style={{
            width: '140px',
            height: '140px',
            margin: '0 auto 25px',
            position: 'relative',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '5px solid #fff',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <Image
              src={getImagePath(colunista.fotoUrl)}
              alt={colunista.nome}
              fill
              sizes="140px"
              className="object-cover"
            />
          </div>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '900', 
            color: '#1a365d', 
            marginBottom: '15px',
            fontFamily: 'Georgia, serif'
          }}>
            {colunista.nome}
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#4a5568', 
            lineHeight: '1.6',
            maxWidth: '650px',
            margin: '0 auto',
            fontWeight: '400'
          }}>
            {colunista.bio}
          </p>
        </div>
      </div>

      {/* Grid de Artigos Estilo Portal */}
      <div className="container" style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px', 
          marginBottom: '40px',
          borderBottom: '2px solid #edf2f7',
          paddingBottom: '15px'
        }}>
          <div style={{ width: '6px', height: '30px', background: '#ff5722' }}></div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Notícias Publicadas
          </h2>
        </div>

        <div className="noticias-feed" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {noticiasColunista.length > 0 ? (
            noticiasColunista.map((n: Noticia) => (
              <Link
                key={n.id}
                href={`/noticia/${n.slug}`}
                className="noticia-card-horizontal group"
                style={{
                  background: '#fff',
                  display: 'flex',
                  gap: '30px',
                  padding: '15px 0',
                  borderBottom: '1px solid #eee',
                  textDecoration: 'none',
                  alignItems: 'flex-start',
                  transition: 'opacity 0.2s'
                }}
              >
                {/* Imagem à Esquerda */}
                <div style={{ 
                  width: '280px', 
                  height: '160px', 
                  position: 'relative', 
                  flexShrink: 0,
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <Image
                    src={getImagePath(n.capaUrl)}
                    alt={n.titulo}
                    fill
                    sizes="280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                {/* Conteúdo à Direita */}
                <div style={{ flex: 1, paddingTop: '5px' }}>
                  <span style={{ 
                    fontSize: '13px', 
                    color: '#e53e3e', 
                    fontWeight: '900', 
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    display: 'block',
                    letterSpacing: '0.5px'
                  }}>
                    {n.categoria?.nome}
                  </span>
                  
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '800', 
                    color: '#1a202c', 
                    lineHeight: '1.2',
                    marginBottom: '10px',
                    fontFamily: 'inherit'
                  }}>
                    {n.titulo}
                  </h3>

                  {(() => {
                    const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, "");
                    const cleanText = n.resumo ? stripHtml(n.resumo) : (n.conteudo ? stripHtml(n.conteudo) : "");
                    return (
                      <p style={{ 
                        fontSize: '15px', 
                        color: '#4a5568', 
                        lineHeight: '1.5',
                        marginBottom: '12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {cleanText.substring(0, 160) + (cleanText.length > 160 ? '...' : '')}
                      </p>
                    );
                  })()}

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    fontSize: '14px', 
                    color: '#2d3748',
                    fontWeight: '600'
                  }}>
                    <span>{colunista.nome}</span>
                    <span style={{ color: '#cbd5e0', fontWeight: '400' }}>|</span>
                    <span style={{ color: '#718096', fontWeight: '400' }}>
                      {new Date(n.publicadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ padding: '80px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', color: '#94a3b8', border: '2px dashed #e2e8f0' }}>
              <p style={{ fontSize: '18px', fontWeight: '500' }}>Este colunista ainda não possui notícias publicadas.</p>
            </div>
          )}
        </div>
      </div>
    </main>


  );
}
