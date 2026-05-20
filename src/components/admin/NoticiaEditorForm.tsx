'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
// TipTap imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

interface Categoria { id: string; nome: string; }
interface Colunista  { id: string; nome: string; }

function generateSlug(title: string): string {
  return title
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (action: () => void, label: string, active?: boolean) => (
    <button
      type="button"
      onClick={action}
      title={label}
      style={{
        padding: '5px 9px', border: 'none', borderRadius: '5px',
        background: active ? 'rgba(255,87,34,0.2)' : 'transparent',
        color: active ? '#ff5722' : '#8b98b0',
        cursor: 'pointer', fontSize: '13px', fontWeight: '600',
        transition: 'all 0.15s'
      }}
    >{label}</button>
  );

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '2px',
      padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.02)'
    }}>
      {btn(() => editor.chain().focus().toggleBold().run(), 'B', editor.isActive('bold'))}
      {btn(() => editor.chain().focus().toggleItalic().run(), 'I', editor.isActive('italic'))}
      {btn(() => editor.chain().focus().toggleUnderline().run(), 'U', editor.isActive('underline'))}
      <span style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', editor.isActive('heading', { level: 2 }))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', editor.isActive('heading', { level: 3 }))}
      <span style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
      {btn(() => editor.chain().focus().toggleBulletList().run(), '• Lista', editor.isActive('bulletList'))}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), '1. Lista', editor.isActive('orderedList'))}
      {btn(() => editor.chain().focus().toggleBlockquote().run(), '❝', editor.isActive('blockquote'))}
      <span style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
      {btn(() => editor.chain().focus().setTextAlign('left').run(), '⬅', editor.isActive({ textAlign: 'left' }))}
      {btn(() => editor.chain().focus().setTextAlign('center').run(), '↔', editor.isActive({ textAlign: 'center' }))}
      {btn(() => editor.chain().focus().setTextAlign('right').run(), '➡', editor.isActive({ textAlign: 'right' }))}
      <span style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
      {btn(() => editor.chain().focus().undo().run(), '↩ Desfazer')}
      {btn(() => editor.chain().focus().redo().run(), '↪ Refazer')}
    </div>
  );
}

interface EditorFormProps {
  initialData?: {
    id?: string;
    titulo?: string;
    slug?: string;
    resumo?: string;
    conteudo?: string;
    categoriaId?: string;
    colunistaId?: string;
    tags?: string;
    featured?: boolean;
    breaking?: boolean;
    capaUrl?: string;
  };
  mode: 'create' | 'edit';
}

export function NoticiaEditorForm({ initialData, mode }: EditorFormProps) {
  const router = useRouter();
  const { authFetch } = useAdminAuth();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [colunistas, setColunistas] = useState<Colunista[]>([]);

  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [resumo, setResumo] = useState(initialData?.resumo || '');
  const [categoriaId, setCategoriaId] = useState(initialData?.categoriaId || '');
  const [colunistaId, setColunistaId] = useState(initialData?.colunistaId || '');
  const [tags, setTags] = useState(initialData?.tags || '');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [breaking, setBreaking] = useState(initialData?.breaking || false);
  const [capa, setCapa] = useState<File | null>(null);
  const [capaPreview, setCapaPreview] = useState<string | null>(initialData?.capaUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugManual, setSlugManual] = useState(mode === 'edit');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Escreva o conteúdo da notícia aqui...' }),
      CharacterCount,
    ],
    content: initialData?.conteudo || '',
    editorProps: {
      attributes: {
        style: 'min-height: 300px; padding: 16px; outline: none; color: #e2e8f0; font-size: 15px; line-height: 1.7;',
      },
    },
  });

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitulo(val);
    if (!slugManual) {
      setSlug(generateSlug(val));
    }
  };

  useEffect(() => {
    authFetch('/admin/categorias').then(r => r.json()).then(d => {
      setCategorias(d);
      if (d.length > 0 && !categoriaId) setCategoriaId(d[0].id);
    }).catch(() => {});
    authFetch('/admin/colunistas').then(r => r.json()).then(setColunistas).catch(() => {});
  }, [authFetch, categoriaId]);

  const handleCapaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapa(file);
    const reader = new FileReader();
    reader.onload = ev => setCapaPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const content = editor?.getHTML() || '';
    if (content === '<p></p>' || !content.trim()) {
      setError('O conteúdo da notícia não pode estar vazio.');
      return;
    }
    if (mode === 'create' && !capa) {
      setError('A imagem de capa é obrigatória.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('slug', slug);
      formData.append('categoriaId', categoriaId);
      formData.append('conteudo', content);
      if (resumo) formData.append('resumo', resumo);
      if (tags) formData.append('tags', tags);
      if (colunistaId) formData.append('colunistaId', colunistaId);
      formData.append('featured', String(featured));
      formData.append('breaking', String(breaking));
      if (capa) formData.append('capa', capa);

      const url = mode === 'edit' ? `/admin/noticias/${initialData?.id}` : '/admin/noticias';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api${url}`,
        { method, headers: { Authorization: `Bearer ${token}` }, body: formData }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar notícia.');

      router.push('/admin/noticias');
      router.refresh();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = editor?.storage.characterCount?.words() || 0;
  const charCount = editor?.storage.characterCount?.characters() || 0;

  return (
    <form onSubmit={handleSubmit}>
      <div className="cms-page-header">
        <div>
          <h2 className="cms-page-title">{mode === 'create' ? '+ Nova Notícia' : '✏️ Editar Notícia'}</h2>
          <p className="cms-page-subtitle">
            {mode === 'edit' ? 'Altere os campos desejados e salve.' : 'Preencha todos os campos obrigatórios.'}
          </p>
        </div>
        <Link href="/admin/noticias" className="cms-btn cms-btn-secondary">← Cancelar</Link>
      </div>

      {error && <div className="cms-alert cms-alert-error">⚠️ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Coluna principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Título */}
          <div className="cms-table-card" style={{ padding: '20px' }}>
            <div className="cms-form-group" style={{ marginBottom: '14px' }}>
              <label className="cms-label">Título da Notícia <span>*</span></label>
              <input
                className="cms-input"
                style={{ fontSize: '17px', fontWeight: '600' }}
                required
                value={titulo}
                onChange={handleTituloChange}
                placeholder="Digite um título impactante..."
              />
            </div>
            <div className="cms-form-group" style={{ marginBottom: 0 }}>
              <label className="cms-label">Slug (URL)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="cms-input"
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  value={slug}
                  onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                  placeholder="url-da-noticia"
                />
                <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm"
                  onClick={() => { setSlug(generateSlug(titulo)); setSlugManual(false); }}
                  style={{ whiteSpace: 'nowrap' }}>
                  ↻ Gerar
                </button>
              </div>
              <div className="cms-form-hint">tvrussas.com.br/noticia/{slug || '...'}</div>
            </div>
          </div>

          {/* Editor */}
          <div className="cms-table-card">
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Conteúdo da Notícia <span style={{ color: '#ff5722' }}>*</span></span>
              <span style={{ fontSize: '12px', color: '#8b98b0' }}>{wordCount} palavras · {charCount} caracteres</span>
            </div>
            <EditorToolbar editor={editor} />
            <div style={{ minHeight: '320px' }}>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Resumo */}
          <div className="cms-table-card" style={{ padding: '20px' }}>
            <label className="cms-label">Resumo / Subtítulo
              <span style={{ color: '#8b98b0', fontWeight: '400', marginLeft: '8px', fontSize: '12px' }}>
                ({resumo.length}/160 caracteres — para SEO)
              </span>
            </label>
            <textarea
              className="cms-textarea"
              rows={3}
              maxLength={160}
              value={resumo}
              onChange={e => setResumo(e.target.value)}
              placeholder="Escreva um resumo curto (aparece nos resultados de busca)..."
            />
          </div>
        </div>

        {/* Coluna lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Publicar */}
          <div className="cms-table-card" style={{ padding: '20px' }}>
            <div style={{ fontWeight: '700', marginBottom: '16px', fontSize: '14px' }}>Publicação</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
                  style={{ accentColor: '#ff5722', width: '16px', height: '16px' }} />
                ⭐ Notícia Destaque
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={breaking} onChange={e => setBreaking(e.target.checked)}
                  style={{ accentColor: '#ff5722', width: '16px', height: '16px' }} />
                🔴 Plantão (Breaking News)
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="cms-btn cms-btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: '44px' }}
            >
              {loading ? (
                <><div className="cms-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Salvando...</>
              ) : mode === 'create' ? '🚀 Publicar Notícia' : '💾 Salvar Alterações'}
            </button>
          </div>

          {/* Imagem de capa */}
          <div className="cms-table-card" style={{ padding: '20px' }}>
            <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '14px' }}>
              Imagem de Capa {mode === 'create' && <span style={{ color: '#ff5722' }}>*</span>}
            </div>
            {capaPreview && (
              <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capaPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCapaChange} style={{ display: 'none' }} />
            <button type="button" className="cms-btn cms-btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%', justifyContent: 'center' }}>
              📷 {capaPreview ? 'Trocar imagem' : 'Selecionar imagem'}
            </button>
            <div className="cms-form-hint">Será convertida automaticamente para WebP</div>
          </div>

          {/* Categoria e Colunista */}
          <div className="cms-table-card" style={{ padding: '20px' }}>
            <div style={{ fontWeight: '700', marginBottom: '14px', fontSize: '14px' }}>Classificação</div>
            <div className="cms-form-group">
              <label className="cms-label">Categoria <span>*</span></label>
              <select className="cms-select" required value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="cms-form-group">
              <label className="cms-label">Colunista <span style={{ color: '#8b98b0', fontSize: '11px' }}>(opcional)</span></label>
              <select className="cms-select" value={colunistaId} onChange={e => setColunistaId(e.target.value)}>
                <option value="">Nenhum</option>
                {colunistas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="cms-form-group" style={{ marginBottom: 0 }}>
              <label className="cms-label">Tags <span style={{ color: '#8b98b0', fontSize: '11px' }}>(separadas por vírgula)</span></label>
              <input
                className="cms-input"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="russas, ceara, politica"
              />
            </div>
          </div>

          {/* SEO Preview */}
          <div className="cms-table-card" style={{ padding: '20px' }}>
            <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '14px' }}>🔍 Preview Google</div>
            <div style={{
              padding: '14px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ fontSize: '18px', color: '#8ab4f8', marginBottom: '4px', lineHeight: '1.3', wordBreak: 'break-word' }}>
                {titulo || 'Título da notícia...'}
              </div>
              <div style={{ fontSize: '13px', color: '#34a853', marginBottom: '4px' }}>
                tvrussas.com.br/noticia/{slug || 'url-da-noticia'}
              </div>
              <div style={{ fontSize: '13px', color: '#bdc1c6', lineHeight: '1.4' }}>
                {resumo || 'O resumo da notícia aparecerá aqui. Escreva entre 120-160 caracteres para melhor SEO.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
