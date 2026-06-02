"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { NoticiaEditorForm } from "@/components/admin/NoticiaEditorForm";
import { getImagePath } from "@/utils/imagePath";

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
  videoUrl?: string | null;
  fonte?: string | null;
  publicadoPor?: string | null;
}

interface Categoria {
  id: string;
  nome: string;
}

interface Colunista {
  id: string;
  nome: string;
}

interface EditorPageData {
  noticia: Noticia;
  categorias: Categoria[];
  colunistas: Colunista[];
}

export default function EditarNoticiaPage() {
  const { id } = useParams<{ id: string }>();
  const { authFetch } = useAdminAuth();
  const [data, setData] = useState<EditorPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    authFetch(`/admin/editor/${id}/page`)
      .then((r) => r.json())
      .then((res) => {
        if (!active) return;
        if (res.error) throw new Error(res.error);
        setData(res);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, authFetch]);

  if (loading) {
    return (
      <div className="cms-loading">
        <div className="cms-spinner" /> Carregando notícia...
      </div>
    );
  }

  if (error) return <div className="cms-alert cms-alert-error">⚠️ {error}</div>;
  if (!data || !data.noticia) return null;

  const { noticia, categorias, colunistas } = data;

  return (
    <NoticiaEditorForm
      mode="edit"
      initialData={{
        id: noticia.id,
        titulo: noticia.titulo,
        slug: noticia.slug,
        resumo: noticia.resumo || "",
        conteudo: noticia.conteudo,
        categoriaId: noticia.categoriaId,
        colunistaId: noticia.colunistaId || "",
        tags: noticia.tags || "",
        featured: noticia.featured,
        breaking: noticia.breaking,
        capaUrl: getImagePath(noticia.capaUrl),
        videoUrl: noticia.videoUrl || "",
        fonte: noticia.fonte || "",
        publicadoPor: noticia.publicadoPor || "",
      }}
      initialCategorias={categorias}
      initialColunistas={colunistas}
    />
  );
}
