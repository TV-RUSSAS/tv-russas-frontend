import { Noticia, Colunista } from '@/types';

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
  }
};
