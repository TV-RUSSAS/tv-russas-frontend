import { MetadataRoute } from "next";
import { apiService } from "@/services/api";
import { DOMAIN } from "@/utils/domain";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = DOMAIN;

  // Páginas Estáticas Básicas
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/colunistas`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ];

  try {
    // Busca todas as notícias dinâmicas do banco de dados
    const noticias = await apiService.getNoticias();
    
    // Rota de notícias individuais (prioridade alta de indexação)
    const newsRoutes = noticias.map((noticia) => ({
      url: `${baseUrl}/noticia/${noticia.slug}`,
      lastModified: new Date(noticia.publicadoEm),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    // Categorias dinâmicas ativas
    const categoriasSet = new Set(noticias.map((n) => n.categoria.slug));
    const categoryRoutes = Array.from(categoriasSet).map((slug) => ({
      url: `${baseUrl}/categoria/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

    // Colunistas individuais ativos
    const colunistasSet = new Set(
      noticias.filter((n) => n.colunista).map((n) => n.colunista!.id)
    );
    const colunistaRoutes = Array.from(colunistasSet).map((id) => ({
      url: `${baseUrl}/colunistas/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...routes, ...newsRoutes, ...categoryRoutes, ...colunistaRoutes];
  } catch (err) {
    console.error("Erro ao gerar sitemap dinâmico:", err);
    return routes;
  }
}
