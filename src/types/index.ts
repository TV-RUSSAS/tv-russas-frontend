export interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export interface Colunista {
  id: string;
  nome: string;
  fotoUrl: string;
  bio?: string | null;
  noticias?: Noticia[];
}

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  capaUrl: string;
  publicadoEm: string;
  views: number;
  resumo?: string | null;
  featured?: boolean;
  categoria: Categoria;
  colunista?: Colunista | null;
  tags?: string | null;
}
