'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { TEXTS } from '@/constants/texts';

// TipTap imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';

// Custom Tiptap Social/Video Embed Node View
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { detectVideoPlatform } from '@/components/ArticleVideoEmbed';

// Componente React que renderiza o player de vídeo ou card de mídia no próprio editor (Admin)
function SocialEmbedNodeView({ node, deleteNode }: NodeViewProps) {
  const { platform, url, caption, credit } = node.attrs;
  
  const isVideo = platform === 'youtube' || platform === 'video';
  let badgeColor = isVideo ? '#ff9800' : '#9ca3af';
  let badgeBg = isVideo ? 'rgba(255, 152, 0, 0.1)' : 'rgba(156, 163, 175, 0.1)';
  let platformLabel = 'Link Externo';

  if (platform === 'youtube') {
    platformLabel = 'Vídeo do YouTube';
    badgeColor = '#ff0000';
    badgeBg = 'rgba(255, 0, 0, 0.1)';
  } else if (platform === 'video') {
    platformLabel = 'Vídeo Direto (.mp4)';
    badgeColor = '#10b981';
    badgeBg = 'rgba(16, 185, 129, 0.1)';
  } else if (platform === 'instagram') {
    platformLabel = 'Link do Instagram';
    badgeColor = '#e1306c';
    badgeBg = 'rgba(225, 48, 108, 0.1)';
  } else if (platform === 'facebook') {
    platformLabel = 'Link do Facebook';
    badgeColor = '#1877f2';
    badgeBg = 'rgba(24, 119, 242, 0.1)';
  }

  return (
    <NodeViewWrapper className="social-embed-editor-block" style={{ margin: '20px 0', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '8px', padding: '16px', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: badgeColor, background: badgeBg, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
          {platformLabel}
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
          {url}
        </span>
        <button 
          type="button" 
          onClick={deleteNode}
          style={{ marginLeft: 'auto', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', cursor: 'pointer', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', transition: 'all 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
        >
          {isVideo ? 'Remover Vídeo' : 'Remover Link'}
        </button>
      </div>
      {caption && (
        <div style={{ fontSize: '11px', fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', borderLeft: '2px solid rgba(255,255,255,0.15)', paddingLeft: '8px', marginBottom: '8px' }}>
          &ldquo;{caption}&rdquo;
        </div>
      )}
      {credit && (
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', paddingLeft: '8px', marginBottom: '12px' }}>
          Crédito: {credit}
        </div>
      )}
      <div style={{ padding: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
        <i className="fas fa-video" style={{ marginRight: '6px' }} />
        Visualização de Bloco no Portal Público.
      </div>
    </NodeViewWrapper>
  );
}

const SocialEmbedExtension = Node.create({
  name: 'socialEmbed',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      platform: { default: null },
      url: { default: null },
      caption: { default: '' },
      credit: { default: '' }
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[class="article-video-placeholder"]',
        getAttrs: (dom: HTMLElement | string) => {
          if (typeof dom === 'string') return {};
          return {
            platform: dom.getAttribute('data-platform'),
            url: dom.getAttribute('data-url'),
            caption: dom.getAttribute('data-caption') || '',
            credit: dom.getAttribute('data-credit') || ''
          };
        }
      },
      {
        tag: 'div[class="social-embed-placeholder"]',
        getAttrs: (dom: HTMLElement | string) => {
          if (typeof dom === 'string') return {};
          return {
            platform: dom.getAttribute('data-platform'),
            url: dom.getAttribute('data-url'),
            caption: dom.getAttribute('data-caption') || '',
            credit: dom.getAttribute('data-credit') || ''
          };
        }
      }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'article-video-placeholder',
        'data-platform': HTMLAttributes.platform,
        'data-url': HTMLAttributes.url,
        'data-caption': HTMLAttributes.caption,
        'data-credit': HTMLAttributes.credit
      })
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(SocialEmbedNodeView);
  }
});

interface Categoria { id: string; nome: string; }
interface Colunista  { id: string; nome: string; }

function generateSlug(title: string): string {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── TOOLBAR DO EDITOR ─────────────────────────────────────────────
function EditorToolbar({ editor, authFetch }: { editor: ReturnType<typeof useEditor>, authFetch: (url: string, options?: RequestInit) => Promise<Response> }) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedCaption, setEmbedCaption] = useState('');
  const [embedCredit, setEmbedCredit] = useState('');

  if (!editor) return null;

  const handleInsertEmbed = () => {
    if (!embedUrl.trim()) return;
    
    const platform = detectVideoPlatform(embedUrl);
    if (platform === 'unknown') {
      alert('Domínio não permitido por segurança. Use apenas links confiáveis do YouTube, Instagram ou Facebook.');
      return;
    }
    
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'socialEmbed',
        attrs: {
          platform,
          url: embedUrl.trim(),
          caption: embedCaption.trim(),
          credit: embedCredit.trim()
        }
      })
      .run();
      
    setEmbedUrl('');
    setEmbedCaption('');
    setEmbedCredit('');
    setShowEmbedModal(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await authFetch('/admin/upload-image', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Falha ao subir imagem');
      const data = await res.json();
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const fullUrl = data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`;
      
      editor.chain().focus().setImage({ src: fullUrl }).run();
    } catch (err) {
      alert('Erro ao fazer upload da imagem.');
    }
  };

  const btn = (action: () => void, iconClass: string, title: string, active?: boolean) => (
    <button type="button" onClick={action} title={title} className={`ed-btn ${active ? 'active' : ''}`}>
      <i className={iconClass} />
    </button>
  );

  return (
    <div className="ed-toolbar-sticky">
      {/* Undo/Redo */}
      {btn(() => editor.chain().focus().undo().run(), 'fas fa-undo', 'Desfazer')}
      {btn(() => editor.chain().focus().redo().run(), 'fas fa-redo', 'Refazer')}
      <div className="ed-separator" />

      {/* Font Family Dropdown */}
      <div className="ed-dropdown" onMouseLeave={() => setShowFontMenu(false)}>
        <button type="button" className="ed-btn" style={{ width: 'auto', padding: '0 8px', fontSize: '12px', fontWeight: '600' }} onClick={() => setShowFontMenu(!showFontMenu)}>
          {TEXTS.admin.source} <i className="fas fa-chevron-down" style={{ fontSize: '10px', marginLeft: '4px' }}/>
        </button>
        {showFontMenu && (
          <div className="ed-dropdown-content" style={{ display: 'block' }}>
            <button type="button" className="ed-dropdown-item" onClick={() => { editor.chain().focus().unsetFontFamily().run(); setShowFontMenu(false); }} style={{ fontFamily: 'var(--font-sans)' }}>{"Padrão (Inter)"}</button>
            <button type="button" className="ed-dropdown-item" onClick={() => { editor.chain().focus().setFontFamily('Lora').run(); setShowFontMenu(false); }} style={{ fontFamily: 'Lora, serif' }}>{"Lora (Serifada)"}</button>
            <button type="button" className="ed-dropdown-item" onClick={() => { editor.chain().focus().setFontFamily('Merriweather').run(); setShowFontMenu(false); }} style={{ fontFamily: 'Merriweather, serif' }}>{"Merriweather"}</button>
            <button type="button" className="ed-dropdown-item" onClick={() => { editor.chain().focus().setFontFamily('Georgia').run(); setShowFontMenu(false); }} style={{ fontFamily: 'Georgia, serif' }}>{"Georgia"}</button>
          </div>
        )}
      </div>

      <div className="ed-separator" />

      {/* Headings */}
      {btn(() => editor.chain().focus().setParagraph().run(), 'fas fa-paragraph', 'Parágrafo Normal', editor.isActive('paragraph'))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'fas fa-heading', 'Título Principal (H2)', editor.isActive('heading', { level: 2 }))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'fas fa-h3', 'Subtítulo (H3)', editor.isActive('heading', { level: 3 }))}
      
      <div className="ed-separator" />

      {/* Marks */}
      {btn(() => editor.chain().focus().toggleBold().run(), 'fas fa-bold', 'Negrito', editor.isActive('bold'))}
      {btn(() => editor.chain().focus().toggleItalic().run(), 'fas fa-italic', 'Itálico', editor.isActive('italic'))}
      {btn(() => editor.chain().focus().toggleUnderline().run(), 'fas fa-underline', 'Sublinhado', editor.isActive('underline'))}
      {btn(() => editor.chain().focus().toggleStrike().run(), 'fas fa-strikethrough', 'Tachado', editor.isActive('strike'))}
      {btn(() => editor.chain().focus().toggleHighlight().run(), 'fas fa-highlighter', 'Destacar Texto', editor.isActive('highlight'))}
      
      {/* Cor do Texto Dropdown */}
      <div className="ed-dropdown" onMouseLeave={() => setShowColorMenu(false)}>
        <button type="button" className="ed-btn" onClick={() => setShowColorMenu(!showColorMenu)} title="Cor do Texto">
          <i className="fas fa-palette" />
        </button>
        {showColorMenu && (
          <div className="ed-dropdown-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '8px' }}>
            {['#111111', '#e04a2d', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#db2777', '#475569'].map(color => (
              <div key={color} onClick={() => { editor.chain().focus().setColor(color).run(); setShowColorMenu(false); }}
                   style={{ width: '20px', height: '20px', background: color, borderRadius: '50%', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }} />
            ))}
            <button type="button" onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorMenu(false); }} style={{ gridColumn: 'span 4', fontSize: '11px', marginTop: '4px', background: 'transparent', border: 'none', color: 'var(--c-text)', cursor: 'pointer' }}>{"Resetar"}</button>
          </div>
        )}
      </div>

      <div className="ed-separator" />

      {/* Alignment */}
      {btn(() => editor.chain().focus().setTextAlign('left').run(), 'fas fa-align-left', 'Alinhar à Esquerda', editor.isActive({ textAlign: 'left' }))}
      {btn(() => editor.chain().focus().setTextAlign('center').run(), 'fas fa-align-center', 'Centralizar', editor.isActive({ textAlign: 'center' }))}
      {btn(() => editor.chain().focus().setTextAlign('right').run(), 'fas fa-align-right', 'Alinhar à Direita', editor.isActive({ textAlign: 'right' }))}

      <div className="ed-separator" />

      {/* Lists & Blocks */}
      {btn(() => editor.chain().focus().toggleBulletList().run(), 'fas fa-list-ul', 'Lista', editor.isActive('bulletList'))}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), 'fas fa-list-ol', 'Lista Numerada', editor.isActive('orderedList'))}
      {btn(() => editor.chain().focus().toggleTaskList().run(), 'fas fa-tasks', 'Checklist', editor.isActive('taskList'))}
      {btn(() => editor.chain().focus().toggleBlockquote().run(), 'fas fa-quote-right', 'Citação Editorial', editor.isActive('blockquote'))}
      {btn(() => editor.chain().focus().toggleCodeBlock().run(), 'fas fa-code', 'Bloco de Código', editor.isActive('codeBlock'))}
      {btn(() => editor.chain().focus().setHorizontalRule().run(), 'fas fa-minus', 'Separador Horizontal')}

      <div className="ed-separator" />

      {/* Media & Links */}
      {btn(() => {
        const url = window.prompt('URL do Link:');
        if (url === null) return;
        if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }, 'fas fa-link', 'Inserir Link', editor.isActive('link'))}

      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
      <button type="button" onClick={() => fileInputRef.current?.click()} title="Inserir Imagem" className="ed-btn">
        <i className="far fa-image" />
      </button>
      
      <button type="button" onClick={() => setShowEmbedModal(true)} title="Inserir Vídeo na Matéria" className="ed-btn" style={{ position: 'relative' }}>
        <i className="fas fa-video" />
      </button>

      {showEmbedModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#12141D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: '100%', maxWidth: '440px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
              <i className="fas fa-video" style={{ color: '#ff9800' }} /> Inserir Vídeo na Matéria
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Link / URL do YouTube ou Vídeo Direto</label>
                <input 
                  type="text" 
                  value={embedUrl} 
                  onChange={e => setEmbedUrl(e.target.value)} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  style={{ width: '100%', padding: '8px 12px', background: '#181A25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Legenda do Vídeo (Opcional)</label>
                <input 
                  type="text" 
                  value={embedCaption} 
                  onChange={e => setEmbedCaption(e.target.value)} 
                  placeholder="ex: Assista ao vídeo relacionado à matéria." 
                  style={{ width: '100%', padding: '8px 12px', background: '#181A25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Crédito / Fonte do Vídeo (Opcional)</label>
                <input 
                  type="text" 
                  value={embedCredit} 
                  onChange={e => setEmbedCredit(e.target.value)} 
                  placeholder="ex: Repórter Ceará / TV Russas" 
                  style={{ width: '100%', padding: '8px 12px', background: '#181A25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEmbedModal(false)} 
                  style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#9ca3af', fontSize: '12.5px', cursor: 'pointer', outline: 'none' }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleInsertEmbed} 
                  style={{ padding: '6px 12px', background: '#ff9800', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12.5px', cursor: 'pointer', fontWeight: '500', outline: 'none' }}
                >
                  Inserir Vídeo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────
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
    videoUrl?: string;
    fonte?: string;
    publicadoPor?: string;
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
  const breaking = false;
  
  const getApiUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
  };

  const [capa, setCapa] = useState<File | null>(null);
  const [capaPreview, setCapaPreview] = useState<string | null>(getApiUrl(initialData?.capaUrl));
  const [isVertical, setIsVertical] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugManual, setSlugManual] = useState(mode === 'edit');
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'>('idle');
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [destaquesAtuais, setDestaquesAtuais] = useState<{ id: string; titulo: string; capaUrl: string; publicadoEm: string }[]>([]);
  const [replaceFeaturedId, setReplaceFeaturedId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const subtitleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [titulo]);

  useEffect(() => {
    if (subtitleRef.current) {
      subtitleRef.current.style.height = 'auto';
      subtitleRef.current.style.height = subtitleRef.current.scrollHeight + 'px';
    }
  }, [resumo]);

  const extractFonte = (html: string) => {
    const match = html.match(/<p>\s*(?:<strong>|<b>)?\s*Fonte\s*:\s*([^<]+?)\s*(?:<\/strong>|<\/b>)?\s*<\/p>/i);
    return match ? match[1].trim() : 'TV Russas';
  };

  const removeFonte = (html: string) => {
    return html.replace(/<p>\s*(?:<strong>|<b>)?\s*Fonte\s*:\s*([^<]+?)\s*(?:<\/strong>|<\/b>)?\s*<\/p>/gi, '');
  };

  const extractPublicadoPor = (html: string) => {
    // Tenta achar a tag Publicado por genérica
    const match = html.match(/<p>\s*(?:<strong>|<b>)?\s*Publicado\s+por\s*:\s*([^<]+?)\s*(?:<\/strong>|<\/b>)?\s*<\/p>/i);
    return match ? match[1].trim() : '';
  };

  const removePublicadoPor = (html: string) => {
    return html.replace(/<p>\s*(?:<strong>|<b>)?\s*Publicado\s+por\s*:\s*([^<]+?)\s*(?:<\/strong>|<\/b>)?\s*<\/p>/gi, '');
  };

  const [fonteText, setFonteText] = useState('');
  const [publicadoPorText, setPublicadoPorText] = useState('');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');

  // Editor Instantiation
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Escreva a matéria com maestria jornalística...' }),
      CharacterCount,
      Color,
      TextStyle,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: true, allowBase64: true }),
      LinkExtension.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      SocialEmbedExtension,
    ],
    content: removePublicadoPor(removeFonte(initialData?.conteudo || '')),
    editorProps: {
      attributes: {
        class: 'cms-editor-content',
        style: 'outline: none;',
      },
    },
    onUpdate: () => {
      setSaveStatus('saving');
    }
  });

  // Autosave Local (Rascunho)
  useEffect(() => {
    if (saveStatus !== 'saving' || !editor) return;
    const timeout = setTimeout(() => {
      const draftData = {
        titulo, slug, resumo, categoriaId, colunistaId, tags, featured, breaking,
        conteudo: editor.getHTML()
      };
      localStorage.setItem(`draft-noticia-${mode}-${initialData?.id || 'new'}`, JSON.stringify(draftData));
      setSaveStatus('saved');
    }, 1500);
    return () => clearTimeout(timeout);
  }, [saveStatus, editor, titulo, slug, resumo, categoriaId, colunistaId, tags, featured, breaking, mode, initialData?.id]);

  // Carregar rascunho (apenas na criação)
  useEffect(() => {
    if (mode === 'create') {
      const saved = localStorage.getItem('draft-noticia-create-new');
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (confirm('Encontramos um rascunho não salvo. Deseja restaurá-lo?')) {
            setTimeout(() => {
              if (draft.titulo) setTitulo(draft.titulo);
              if (draft.slug) setSlug(draft.slug);
              if (draft.resumo) setResumo(draft.resumo);
              if (draft.categoriaId) setCategoriaId(draft.categoriaId);
              if (draft.conteudo && editor) editor.commands.setContent(draft.conteudo);
            }, 0);
          } else {
            localStorage.removeItem('draft-noticia-create-new');
          }
        } catch {}
      }
    }
  }, [editor, mode]);

  const handleTituloChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTitulo(val);
    setSaveStatus('saving');
    if (!slugManual) setSlug(generateSlug(val));
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

    // Detectar dimensões da imagem para ver se é vertical
    const imgElement = document.createElement('img');
    imgElement.src = URL.createObjectURL(file);
    imgElement.onload = () => {
      setIsVertical(imgElement.naturalHeight > imgElement.naturalWidth);
      URL.revokeObjectURL(imgElement.src);
    };

    const reader = new FileReader();
    reader.onload = ev => setCapaPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (initialData?.capaUrl) {
      const imgElement = document.createElement('img');
      imgElement.src = getApiUrl(initialData.capaUrl) || '';
      imgElement.onload = () => {
        setIsVertical(imgElement.naturalHeight > imgElement.naturalWidth);
      };
    }
  }, [initialData]);

  // Submit Final (com lógica de limite de destaques)
  const executeSubmit = async () => {
    setError('');
    const content = editor?.getHTML() || '';
    if (content === '<p></p>' || !content.trim()) { setError(TEXTS.admin.newsContentEmpty); return; }
    if (mode === 'create' && !capa) { setError(TEXTS.admin.coverRequired); return; }

    setLoading(true);
    try {
      // O conteúdo HTML agora vai limpo sem injeção de fonte/publicador
      const finalContent = content;

      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('slug', slug);
      formData.append('categoriaId', categoriaId);
      formData.append('conteudo', finalContent);
      if (resumo) formData.append('resumo', resumo);
      if (tags) formData.append('tags', tags);
      if (colunistaId) formData.append('colunistaId', colunistaId);
      formData.append('featured', String(featured));
      formData.append('breaking', String(breaking));
      if (replaceFeaturedId) formData.append('replaceFeaturedId', replaceFeaturedId);
      if (capa) formData.append('capa', capa);
      
      // Enviar os novos campos no FormData
      formData.append('videoUrl', videoUrl);
      formData.append('fonte', fonteText);
      formData.append('publicadoPor', publicadoPorText);

      const url = mode === 'edit' ? `/admin/noticias/${initialData?.id}` : '/admin/noticias';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api${url}`, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar notícia.');

      // Limpar rascunho ao publicar com sucesso
      localStorage.removeItem(`draft-noticia-${mode}-${initialData?.id || 'new'}`);
      
      router.push('/admin/noticias');
      router.refresh();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (featured && !initialData?.featured) {
      // Verificar quantidade atual de destaques antes de enviar
      try {
        const res = await authFetch('/admin/noticias?featured=true');
        const data = await res.json();
        const currentFeatured = data.noticias || [];
        const top3Featured = currentFeatured.slice(0, 3);
        if (top3Featured.length >= 3) {
          setDestaquesAtuais(top3Featured);
          setReplaceFeaturedId('');
          setShowFeaturedModal(true);
          return;
        }
      } catch(err) {
        console.error("Erro ao verificar destaques", err);
      }
    }
    executeSubmit();
  };

  const wordCount = editor?.storage.characterCount?.words() || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 palavras por minuto

  return (
    <>
      <form onSubmit={handlePreSubmit}>
        <div className="cms-page-header">
          <div>
            <h2 className="cms-page-title">
              {mode === 'create' ? (
                <><i className="fas fa-feather-alt" style={{ fontSize: '20px', marginRight: '10px', color: 'var(--c-accent)' }} /> {TEXTS.admin.writeMatter}</>
              ) : (
                <><i className="far fa-edit" style={{ fontSize: '20px', marginRight: '10px', color: 'var(--c-accent)' }} /> {TEXTS.admin.editMatter}</>
              )}
            </h2>
            <p className="cms-page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>{mode === 'edit' ? TEXTS.admin.editMode : TEXTS.admin.createMode}</span>
              {saveStatus === 'saving' && <span style={{ color: 'var(--c-warn)', fontSize: '11px', fontWeight: '500' }}><i className="fas fa-circle-notch fa-spin"/> {TEXTS.admin.savingDraft}</span>}
              {saveStatus === 'saved' && <span style={{ color: 'var(--c-positive)', fontSize: '11px', fontWeight: '500' }}><i className="fas fa-check"/> {TEXTS.admin.draftSaved}</span>}
            </p>
          </div>
          <Link href="/admin/noticias" className="cms-btn cms-btn-secondary">
            <i className="fas fa-arrow-left" style={{ fontSize: '11px', marginRight: '6px' }} /> {TEXTS.actions.cancel}
          </Link>
        </div>

        {error && (
          <div className="cms-alert cms-alert-error">
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '12px', marginRight: '6px' }} /> {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          
          {/* Coluna Principal do Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Folha de Papel do Editor (Título, Subtítulo e Corpo) */}
            <div className="cms-editor-paper">
              
              <div className="cms-editor-header">
                <textarea
                  ref={titleRef}
                  required
                  value={titulo}
                  onChange={handleTituloChange}
                  rows={1}
                  placeholder="Título da Reportagem..."
                  className="cms-editor-title"
                />
                <textarea
                  ref={subtitleRef}
                  value={resumo}
                  onChange={e => {
                    setResumo(e.target.value);
                    setSaveStatus('saving');
                  }}
                  rows={1}
                  maxLength={200}
                  placeholder="Subtítulo ou linha fina (aparece abaixo do título)..."
                  className="cms-editor-subtitle"
                />
              </div>

              <div className="cms-editor-toolbar-wrap">
                <EditorToolbar editor={editor} authFetch={authFetch} />
              </div>
              
              <div className="cms-editor-content-area">
                <EditorContent editor={editor} />
              </div>
            </div>

          </div>

          {/* Coluna Lateral */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
             {/* Ações e Publicação */}
            <div className="cms-table-card" style={{ padding: '24px' }}>
              <div style={{ fontWeight: '700', marginBottom: '18px', fontSize: '15px' }}>{TEXTS.admin.publication}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--c-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{TEXTS.admin.feedClassification}</div>
                
                {/* Opção 1: Última Notícia */}
                <div 
                  onClick={() => { setFeatured(false); setSaveStatus('saving'); }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    cursor: 'pointer', 
                    padding: '10px 12px', 
                    background: !featured ? 'rgba(99, 102, 241, 0.05)' : 'var(--c-raised)', 
                    border: `1px solid ${!featured ? 'rgba(99, 102, 241, 0.2)' : 'var(--c-border)'}`, 
                    borderRadius: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    border: `2px solid ${!featured ? '#818cf8' : 'var(--c-secondary)'}`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'transparent',
                    flexShrink: 0
                  }}>
                    {!featured && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: !featured ? '#fff' : 'var(--c-secondary)' }}>{"Última Notícia"}</div>
                    <div style={{ fontSize: '10px', color: 'var(--c-muted)' }}>{TEXTS.admin.standardFeedNews}</div>
                  </div>
                </div>

                {/* Opção 2: Em Destaque Banner */}
                <div 
                  onClick={() => { setFeatured(true); setSaveStatus('saving'); }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    cursor: 'pointer', 
                    padding: '10px 12px', 
                    background: featured ? 'var(--c-accent-dim)' : 'var(--c-raised)', 
                    border: `1px solid ${featured ? 'var(--c-accent-low)' : 'var(--c-border)'}`, 
                    borderRadius: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    border: `2px solid ${featured ? 'var(--c-accent)' : 'var(--c-secondary)'}`, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'transparent',
                    flexShrink: 0
                  }}>
                    {featured && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--c-accent)' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: featured ? '#fff' : 'var(--c-secondary)' }}>{TEXTS.admin.bannerHighlight}</div>
                    <div style={{ fontSize: '10px', color: 'var(--c-muted)' }}>{TEXTS.admin.bannerHighlightSub}</div>
                  </div>
                </div>
              </div>


              
              <button type="submit" disabled={loading} className="cms-btn cms-btn-publish" style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '15px', borderRadius: '8px' }}>
                {loading ? <><div className="cms-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> {"Publicando..."}</> : mode === 'create' ? <><i className="fas fa-paper-plane" style={{ marginRight: '8px' }} /> {TEXTS.actions.publish}</> : <><i className="far fa-save" style={{ marginRight: '8px' }} /> {TEXTS.actions.save}</>}
              </button>
            </div>

            {/* Imagem de Capa */}
            <div className="cms-table-card" style={{ padding: '24px' }}>
              <div style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>
                {TEXTS.admin.matterCover} {mode === 'create' && <span style={{ color: 'var(--c-accent)' }}>*</span>}
              </div>
              {capaPreview ? (
                <div style={{ marginBottom: '16px', borderRadius: '6px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid var(--c-border)', position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={capaPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>{TEXTS.admin.change}</button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} style={{ marginBottom: '16px', borderRadius: '6px', height: '140px', border: '2px dashed var(--c-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--c-muted)', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                  <i className="far fa-image" style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>{TEXTS.admin.clickUploadCover}</span>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCapaChange} style={{ display: 'none' }} />
              
              {isVertical && (
                <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#f87171', fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong>Imagem vertical detectada.</strong> Ela será cortada no portal para manter o padrão editorial.
                  </div>
                </div>
              )}
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--c-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <i className="fas fa-info-circle" style={{ flexShrink: 0 }} />
                <span>Use imagens horizontais, preferencialmente <strong>1200x675</strong>.</span>
              </div>
            </div>

            {/* Classificação */}
            <div className="cms-table-card" style={{ padding: '24px' }}>
              <div style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>{TEXTS.admin.organization}</div>
              <div className="cms-form-group">
                <label className="cms-label">{TEXTS.admin.slugSeo}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="cms-input" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }} value={slug} onChange={e => { setSlug(e.target.value); setSlugManual(true); setSaveStatus('saving'); }} placeholder="url-da-noticia" />
                  <button type="button" className="cms-btn cms-btn-secondary cms-btn-sm" onClick={() => { setSlug(generateSlug(titulo)); setSlugManual(false); }}>↻</button>
                </div>
              </div>
              <div className="cms-form-group">
                <label className="cms-label">{TEXTS.admin.category} <span>*</span></label>
                <select className="cms-select" required value={categoriaId} onChange={e => { setCategoriaId(e.target.value); setSaveStatus('saving'); }}>
                  <option value="">{TEXTS.admin.select}</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="cms-form-group">
                <label className="cms-label">{TEXTS.admin.matterAuthor}</label>
                <select className="cms-select" value={colunistaId} onChange={e => { setColunistaId(e.target.value); setSaveStatus('saving'); }}>
                  <option value="">{TEXTS.admin.defaultAuthor}</option>
                  {colunistas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="cms-form-group">
                <label className="cms-label">{TEXTS.admin.optionalTags}</label>
                <input className="cms-input" value={tags} onChange={e => { setTags(e.target.value); setSaveStatus('saving'); }} placeholder="ex: russas, política" />
              </div>
              <div className="cms-form-group" style={{ marginBottom: 0 }}>
                <label className="cms-label">{"URL do Vídeo (Opcional)"}</label>
                <input className="cms-input" value={videoUrl} onChange={e => { setVideoUrl(e.target.value); setSaveStatus('saving'); }} placeholder="YouTube, Facebook, Instagram..." />
              </div>
            </div>

            {/* Stats Editoriais */}
            <div className="cms-table-card" style={{ padding: '24px' }}>
              <div style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>{"Análise Editorial"}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--c-raised)', padding: '12px', borderRadius: '6px', border: '1px solid var(--c-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{TEXTS.admin.words}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--c-text)' }}>{wordCount}</div>
                </div>
                <div style={{ background: 'var(--c-raised)', padding: '12px', borderRadius: '6px', border: '1px solid var(--c-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--c-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{TEXTS.admin.readTimeLabel}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--c-text)' }}>{readTime}m</div>
                </div>
              </div>
            </div>

            {/* Google Preview */}
            <div className="cms-table-card" style={{ padding: '24px' }}>
              <div style={{ fontWeight: '700', marginBottom: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fab fa-google" style={{ color: '#4285F4' }} /> {"Preview da Busca"}
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e4e4e7', fontFamily: 'arial, sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                
                {/* Favicon e URL Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/sistema/1.png`} alt={TEXTS.brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', color: '#202124', lineHeight: '20px' }}>{TEXTS.brand.name}</span>
                    <div style={{ fontSize: '12px', color: '#4d5156', lineHeight: '18px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ color: '#202124' }}>{"https://tvrussas.com.br"}</span>
                      <span style={{ fontSize: '10px', color: '#70757a' }}>{"›"}</span>
                      <span>{"noticia"}</span>
                      {slug && (
                        <>
                          <span style={{ fontSize: '10px', color: '#70757a' }}>›</span>
                          <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slug}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Título Azul Realista */}
                <div style={{ fontSize: '20px', color: '#1a0dab', lineHeight: '26px', marginBottom: '4px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }}>
                  {titulo || 'Título da Reportagem...'}
                </div>

                {/* Descrição / Snippet */}
                <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: '22px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>
                  {resumo || 'Resumo impactante da matéria que aparecerá no Google. É recomendado ter entre 120 e 160 caracteres para garantir o melhor alcance orgânico e clareza nos resultados de pesquisa.'}
                </div>

              </div>
            </div>

          </div>
        </div>
      </form>

      {/* MODAL DE DESTAQUE */}
      {showFeaturedModal && (
        <div className="cms-modal-overlay" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="cms-modal" style={{ maxWidth: '500px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <div className="cms-modal-header" style={{ borderBottom: '1px solid var(--c-border)', padding: '24px', background: 'var(--c-surface)' }}>
              <h3 className="cms-modal-title" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-crown" style={{ color: '#F59E0B' }}/> {"Substituir Destaque"}
              </h3>
              <button type="button" className="cms-modal-close" onClick={() => setShowFeaturedModal(false)}><i className="fas fa-times" /></button>
            </div>
            <div className="cms-modal-body" style={{ background: 'var(--c-bg)', padding: '24px', color: 'var(--c-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '20px' }}>
                {TEXTS.admin.bannerMaxAlert} <strong>{"3 notícias simultâneas"}</strong>{". Selecione qual matéria sairá do topo para dar lugar à sua nova postagem:"}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {destaquesAtuais.map(noticia => (
                  <label 
                    key={noticia.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      padding: '16px', 
                      background: replaceFeaturedId === noticia.id ? 'var(--c-accent-dim)' : 'var(--c-surface)', 
                      border: `2px solid ${replaceFeaturedId === noticia.id ? 'var(--c-accent)' : 'transparent'}`, 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: replaceFeaturedId === noticia.id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.04)'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="replaceFeatured" 
                      value={noticia.id} 
                      checked={replaceFeaturedId === noticia.id}
                      onChange={() => setReplaceFeaturedId(noticia.id)}
                      style={{ accentColor: 'var(--c-accent)', width: '20px', height: '20px', flexShrink: 0 }}
                    />
                    {noticia.capaUrl && (
                      <div style={{ width: '60px', height: '40px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={getApiUrl(noticia.capaUrl) || ''} alt={noticia.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontWeight: '600', color: 'var(--c-text)', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>
                        {noticia.titulo}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--c-tertiary)', marginTop: '4px' }}>
                        {new Date(noticia.publicadoEm).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="cms-modal-footer" style={{ borderTop: '1px solid var(--c-border)', padding: '20px 24px', background: 'var(--c-surface)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="cms-btn" style={{ background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-text)', padding: '8px 16px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }} onClick={() => setShowFeaturedModal(false)}>{TEXTS.actions.cancel}</button>
              <button 
                type="button" 
                className="cms-btn"
                style={{ 
                  background: replaceFeaturedId ? 'var(--c-primary)' : 'var(--c-border)', 
                  color: replaceFeaturedId ? '#fff' : 'var(--c-secondary)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: replaceFeaturedId ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }} 
                disabled={!replaceFeaturedId}
                onClick={() => { setShowFeaturedModal(false); executeSubmit(); }}
              >
                {TEXTS.admin.confirmReplacement}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
