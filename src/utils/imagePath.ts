import { API_URL } from '@/services/api';

export function getImagePath(
  path: string | undefined | null,
  type: 'main' | 'card' | 'thumbnail' | 'none' = 'none'
): string {
  if (!path) return '/uploads/placeholder.png';
  
  // Se for uma URL completa do Cloudinary (ou outra externa), retorna ela mesma
  if (path.startsWith('http')) {
    // Aplicar transformações dinâmicas automáticas no Cloudinary
    if (path.includes('res.cloudinary.com') && path.includes('/upload/') && type !== 'none') {
      const transformation = type === 'main'
        ? 'f_auto,q_auto,c_fill,g_auto,w_1200,h_675'
        : type === 'thumbnail'
        ? 'f_auto,q_auto,c_fill,g_auto,w_300,h_170'
        : 'f_auto,q_auto,c_fill,g_auto,w_600,h_338';

      const parts = path.split('/upload/');
      if (parts.length === 2) {
        const prefix = parts[0] + '/upload';
        const suffix = parts[1];

        const suffixSegments = suffix.split('/');
        const firstSegment = suffixSegments[0];

        // Verifica se o primeiro segmento é a versão (ex: v160000) ou se não há subdiretórios
        const isVersionOrFilename = firstSegment.match(/^v\d+$/) || suffixSegments.length === 1;

        // Apenas remove se o primeiro segmento for de fato uma transformação antiga do Cloudinary (ex: w_400,h_300,c_fill)
        // Isso evita apagar pastas legítimas (como tv-russas) que não tenham o prefixo de versão
        const isTransformation = /^(?:(?:c|w|h|q|f|g|dpr|e|fl|l|u|p|r|bo|co|cs|b|a|o|x|y|z)_[a-zA-Z0-9-._]+,?)+$/.test(firstSegment);

        if (!isVersionOrFilename && isTransformation) {
          // Remove o primeiro segmento que é a transformação antiga
          suffixSegments.shift();
        }

        return `${prefix}/${transformation}/${suffixSegments.join('/')}`;
      }
    }
    return path;
  }

  // Pega a URL base do backend (removendo o /api do final)
  const BASE_URL = API_URL.replace('/api', '');
  
  // Garante que o caminho comece com /uploads/ para imagens antigas salvas só com o nome/relativo
  const cleanPath = path.includes('/uploads/') 
    ? path.substring(path.indexOf('/uploads/'))
    : `/uploads/${path.startsWith('/') ? path.substring(1) : path}`;
  
  return `${BASE_URL}${cleanPath}`;
}

