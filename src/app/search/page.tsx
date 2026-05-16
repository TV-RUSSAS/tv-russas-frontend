import { getImagePath } from "@/utils/imagePath";
import Image from "next/image";
import { API_URL } from "@/services/api";

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  capaUrl: string;
  resumo?: string;
  conteudo?: string;
  publicadoEm: string;
  views?: number;
  categoria?: { nome: string };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  let results: Noticia[] = [];
  let suggestion: string | null = null;

  if (query) {
    try {
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        results = data.results || [];
        suggestion = data.suggestion || null;
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    }
  }

  return (
    <div className="search-page-wrapper">
      <main className="site-container">
        <div className="search-advanced-container">
          <div className="search-header-premium">
            <span className="search-subtitle">Busca Editorial</span>
            <h1 className="search-main-title">
              {query ? `Resultados para "${query}"` : "O que você está procurando?"}
            </h1>
            
            {suggestion && (
              <div className="search-suggestion">
                <span>Você quis dizer: </span>
                <a href={`/search?q=${suggestion}`} className="suggestion-link">
                  {suggestion}
                </a>
              </div>
            )}

            <div className="search-meta-info">
              <p className="search-count">
                {results.length > 0 
                  ? `Encontramos ${results.length} ${results.length === 1 ? "matéria encontrada" : "matérias encontradas"}`
                  : query ? "Nenhuma matéria encontrada com este termo exato." : "Digite um termo para pesquisar em nosso acervo."}
              </p>
            </div>
          </div>

        {results.length > 0 ? (
          <div className="search-results-list" style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px' }}>
            {results.map((noticia) => (
              <a
                key={noticia.id}
                href={`/noticia/${noticia.slug}`}
                className="search-result-horizontal-card group"
                style={{
                  display: 'flex',
                  gap: '30px',
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                  border: '1px solid #f1f5f9',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  alignItems: 'center'
                }}
              >
                {/* Imagem */}
                <div style={{ 
                  width: '260px', 
                  height: '170px', 
                  position: 'relative', 
                  flexShrink: 0,
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <Image
                    src={getImagePath(noticia.capaUrl)}
                    alt={noticia.titulo}
                    fill
                    style={{
                      objectFit: 'cover',
                    }}
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                {/* Texto */}
                <div style={{ flex: 1 }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#ff5722', 
                    fontWeight: '800', 
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    display: 'block',
                    letterSpacing: '1px'
                  }}>
                    {noticia.categoria?.nome}
                  </span>
                  
                  <h3 style={{ 
                    fontSize: '22px', 
                    fontWeight: '800', 
                    color: '#1a202c', 
                    lineHeight: '1.25',
                    marginBottom: '10px'
                  }}>
                    {noticia.titulo}
                  </h3>

                  <p style={{ 
                    fontSize: '15px', 
                    color: '#64748b', 
                    lineHeight: '1.5',
                    marginBottom: '15px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {noticia.resumo || (noticia.conteudo ? noticia.conteudo.substring(0, 160) + '...' : '')}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="far fa-calendar-alt"></i>
                      {new Date(noticia.publicadoEm).toLocaleDateString('pt-BR')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="far fa-eye"></i>
                      {noticia.views || 0} visualizações
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : query ? (
          <div className="search-no-results">
            <i className="fas fa-search-minus"></i>
            <h3>Nenhuma matéria encontrada</h3>
            <p>Tente buscar por outros termos ou verifique a grafia.</p>
          </div>
        ) : null}
        </div>
      </main>
    </div>
  );
}
