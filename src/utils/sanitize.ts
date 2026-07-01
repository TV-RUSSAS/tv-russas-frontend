/**
 * Sanitização de HTML no cliente — segunda camada de defesa contra Stored XSS.
 * A primeira e principal camada é a sanitização com allowlist real aplicada no backend
 * (backend/src/utils/sanitizeContent.ts) antes de salvar no banco.
 *
 * Esta função protege contra payloads que escapem do backend ou sejam injetados
 * em conteúdo legado ainda não re-processado.
 *
 * Funciona em SSR (Node.js) e CSR (browser) sem dependências externas.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';

  let clean = html.trim();

  // 1. Remover tags <script>...</script> e seus conteúdos internos
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remover tags executáveis, embeds e SVG/MathML que podem hospedar scripts
  clean = clean.replace(/<(iframe|object|embed|frame|frameset|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  clean = clean.replace(/<(iframe|object|embed|frame|frameset|svg|math)\b[^>]*\/?>/gi, '');

  // 3. Remover manipuladores de eventos inline (onclick, onload, onerror, onmouseover, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '');

  // 4. Remover links com esquema javascript: ou data: em href, src ou action
  clean = clean.replace(/(href|src|action)\s*=\s*['"]\s*(javascript|data|vbscript):[^'"]*['"]/gi, '$1="#"');

  // 5. Remover estilos com expressões CSS perigosas (expression(), url(data:), behavior:)
  clean = clean.replace(/style\s*=\s*(['"])[^'"]*(?:expression|behavior|javascript|vbscript|url\s*\([\s]*['"]*data:)[^'"]*\1/gi, '');

  return clean;
}

