'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { NoticiaEditorForm } from '@/components/admin/NoticiaEditorForm';

interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string;
  categoriaId: string;
  colunistaId: string | null;
  tags: string | null;
  featured: boolean;
  breaking: boolean;
  capaUrl: string;
}

export default function EditarNoticiaPage() {
  const { id } = useParams<{ id: string }>();
  const { authFetch } = useAdminAuth();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    authFetch(`/admin/noticias/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setNoticia(data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, authFetch]);

  if (loading) {
    return (
      <div className="cms-loading">
        <div className="cms-spinner" /> Carregando notícia...
      </div>
    );
  }

  if (error) return <div className="cms-alert cms-alert-error">⚠️ {error}</div>;
  if (!noticia) return null;

  return (
    <NoticiaEditorForm
      mode="edit"
      initialData={{
        id: noticia.id,
        titulo: noticia.titulo,
        slug: noticia.slug,
        resumo: noticia.resumo || '',
        conteudo: noticia.conteudo,
        categoriaId: noticia.categoriaId,
        colunistaId: noticia.colunistaId || '',
        tags: noticia.tags || '',
        featured: noticia.featured,
        breaking: noticia.breaking,
        capaUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${noticia.capaUrl}`,
      }}
    />
  );
}
