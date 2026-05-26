import { Noticia, Colunista, Categoria, Banner } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:3001/api';
// Forçar busca de dados sempre fresca do backend
const FETCH_OPTIONS: RequestInit = { cache: 'no-store' };

export const apiService = {
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
