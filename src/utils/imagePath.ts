import { API_URL } from '@/services/api';

export function getImagePath(path: string | undefined | null): string {
  if (!path) return '/uploads/placeholder.png';
  
  // Se for uma URL completa, retorna ela mesma
  if (path.startsWith('http')) return path;

  // Pega a URL base do backend (removendo o /api do final)
  const BASE_URL = API_URL.replace('/api', '');
  
  // Garante que o caminho comece com /uploads/
  const cleanPath = path.includes('/uploads/') 
    ? path.substring(path.indexOf('/uploads/'))
    : `/uploads/${path.startsWith('/') ? path.substring(1) : path}`;
  
  return `${BASE_URL}${cleanPath}`;
}

