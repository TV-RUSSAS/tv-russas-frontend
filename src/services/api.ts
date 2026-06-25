import { cache } from 'react';
import { Noticia, Colunista, Categoria, Banner } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://127.0.0.1:3001/api';

if (process.env.NODE_ENV === 'production' && API_URL.startsWith('http://') && !API_URL.includes('localhost') && !API_URL.includes('127.0.0.1')) {
  console.error("ERRO CRÍTICO DE SEGURANÇA: API_URL não pode usar http:// em produção.");
  throw new Error("HTTPS obrigatório em produção. Configure NEXT_PUBLIC_API_URL com https://");
}

// O Modo Híbrido ativa cache estático de revalidação de 5 minutos (300 segundos) nas listagens públicas 
// a nível de CDN/Next.js para economizar banda e processamento do backend no Render.
const FETCH_OPTIONS: RequestInit = { next: { revalidate: 300 } };

// ─────────────────────────────────────────────────────────────────────────────
// FASE B: Funções consolidadas de página pública com cache do React.
// O React.cache garante que, quando generateMetadata e o componente de página
// chamarem a mesma função no mesmo ciclo SSR, apenas 1 request HTTP seja feito.
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoriaPageData {
  categoria: { id: string; nome: string; slug: string };
  noticias: Noticia[];
  maisLidas: Noticia[];
  bannerCategoria: Banner | null;
}

export interface NoticiaPageData {
  noticia: Noticia & { conteudo: string };
  relacionadas: Noticia[];
  maisLidas: Noticia[];
  bannerTopo: Banner | null;
}

// Encapsulado com React.cache para deduplicar chamadas entre generateMetadata e Page
export const getCategoriaPageData = cache(async (slug: string): Promise<CategoriaPageData | null> => {
  try {
    const res = await fetch(`${API_URL}/categorias/${slug}/page`, FETCH_OPTIONS);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`Erro ao buscar página consolidada da categoria ${slug}:`, error);
    return null;
  }
});

// Encapsulado com React.cache para deduplicar chamadas entre generateMetadata e Page
export const getNoticiaPageData = cache(async (slug: string): Promise<NoticiaPageData | null> => {
  try {
    const res = await fetch(`${API_URL}/noticias/${slug}/page`, FETCH_OPTIONS);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`Erro ao buscar página consolidada da notícia ${slug}:`, error);
    return null;
  }
});

export const apiService = {
  async getHomeData(): Promise<{
    destaques: Noticia[];
    ultimas: Noticia[];
    maisLidas: Noticia[];
    trending: Noticia[];
    categorias: Categoria[];
    noticiasPorCategoria: { categoria: Categoria; noticias: Noticia[] }[];
    bannerTopo: Banner | null;
    bannerMeio: Banner | null;
  }> {
    try {
      const res = await fetch(`${API_URL}/home`, FETCH_OPTIONS);
      if (!res.ok) throw new Error("Erro na resposta do servidor");
      return res.json();
    } catch (error) {
      console.error("Erro ao buscar dados da home consolidada:", error);
      return {
        destaques: [],
        ultimas: [],
        maisLidas: [],
        trending: [],
        categorias: [],
        noticiasPorCategoria: [],
        bannerTopo: null,
        bannerMeio: null
      };
    }
  },

  async getNoticias(): Promise<Noticia[]> {
    try {
      const res = await fetch(`${API_URL}/noticias`, FETCH_OPTIONS);
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
      return [];
    }
  },

  async getDestaques(): Promise<Noticia[]> {
    try {
      const res = await fetch(`${API_URL}/noticias/destaques`, FETCH_OPTIONS);
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.error("Erro ao buscar destaques:", error);
      return [];
    }
  },

  async getUltimasNoticias(limit: number = 20): Promise<Noticia[]> {
    try {
      const res = await fetch(`${API_URL}/noticias/ultimas?limit=${limit}`, FETCH_OPTIONS);
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.error("Erro ao buscar ultimas:", error);
      return [];
    }
  },

  async getNoticiasByCategoria(slug: string, limit: number = 4): Promise<Noticia[]> {
    try {
      const res = await fetch(`${API_URL}/categorias/${slug}/noticias?limit=${limit}`, FETCH_OPTIONS);
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.error(`Erro ao buscar noticias da categoria ${slug}:`, error);
      return [];
    }
  },

  async getMaisLidas(): Promise<Noticia[]> {
    try {
      const res = await fetch(`${API_URL}/noticias/mais-lidas`, FETCH_OPTIONS);
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.error("Erro ao buscar mais lidas:", error);
      return [];
    }
  },

  async getTrending(): Promise<Noticia[]> {
    try {
      const res = await fetch(`${API_URL}/noticias/trending`, FETCH_OPTIONS);
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.error("Erro ao buscar trending:", error);
      return [];
    }
  },

  async getNoticia(slug: string): Promise<Noticia | null> {
    try {
      const res = await fetch(`${API_URL}/noticias/${slug}`, FETCH_OPTIONS);
      if (!res.ok) return null;
      return res.json();
    } catch (error) {
      console.error(`Erro ao buscar noticia ${slug}:`, error);
      return null;
    }
  },

  async getColunistas(): Promise<Colunista[]> {
    try {
      const res = await fetch(`${API_URL}/colunistas`, FETCH_OPTIONS);
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.error("Erro ao buscar colunistas:", error);
      return [];
    }
  },

  async getColunista(slug: string): Promise<Colunista | null> {
    try {
      const res = await fetch(`${API_URL}/colunistas/${slug}`, FETCH_OPTIONS);
      if (!res.ok) return null;
      return res.json();
    } catch (error) {
      console.error(`Erro ao buscar colunista ${slug}:`, error);
      return null;
    }
  },

  async getCategorias(): Promise<Categoria[]> {
    try {
      const res = await fetch(`${API_URL}/categorias`, FETCH_OPTIONS);
      if (!res.ok) return [];
      return res.json();
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return [];
    }
  },

  async getCategoriaBySlug(slug: string): Promise<Categoria | null> {
    try {
      const res = await fetch(`${API_URL}/categorias/${slug}`, FETCH_OPTIONS);
      if (!res.ok) return null;
      return res.json();
    } catch (error) {
      console.error(`Erro ao buscar categoria ${slug}:`, error);
      return null;
    }
  },

  async getBannerAtivo(posicao: string): Promise<Banner | null> {
    try {
      const res = await fetch(`${API_URL}/banners/ativo/${posicao}`, FETCH_OPTIONS);
      if (!res.ok) return null;
      return res.json();
    } catch (error) {
      console.error(`Erro ao buscar banner ativo para ${posicao}:`, error);
      return null;
    }
  }
};

