/**
 * Utilitário de sanitização de HTML leve e de alto desempenho para prevenir Stored XSS.
 * Remove tags maliciosas (script, iframe, object, embed, frame, frameset),
 * atributos de manipulação de eventos inline (onclick, onload, onerror, etc.) e links javascript:
 * Funciona perfeitamente em Server-Side Rendering (SSR) e Client-Side Rendering (CSR).
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';

  let clean = html.trim();

  // 1. Remover tags <script>...</script> e seus conteúdos internos
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remover outros elementos executáveis e embeds de terceiros inseguros
  clean = clean.replace(/<(iframe|object|embed|frame|frameset)\b[^>]*>([\s\S]*?)<\/\1>/gi, '');
  clean = clean.replace(/<(iframe|object|embed|frame|frameset)\b[^>]*\/?>/gi, '');

  // 3. Remover atributos de manipuladores de eventos inline (ex: onclick, onload, onerror, onmouseover, etc.)
  // Essa regex captura chaves de evento dinâmico terminadas por aspas ou espaços sem quebrar outras tags HTML legítimas
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '');

  // 4. Remover links ativos com esquema javascript: ou data: em href, src ou action
  clean = clean.replace(/(href|src|action)\s*=\s*['"]\s*(javascript|data):[^'"]*['"]/gi, '$1="#"');

  return clean;
}
