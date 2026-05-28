'use client';

import { useEffect } from 'react';

interface CategoryActiveSetterProps {
  categorySlug: string;
}

export default function CategoryActiveSetter({ categorySlug }: CategoryActiveSetterProps) {
  useEffect(() => {
    // Envia a categoria ativa para o Header
    const event = new CustomEvent('active-category-change', { detail: categorySlug });
    window.dispatchEvent(event);

    return () => {
      // Limpa a categoria ao sair da página de notícia
      const clearEvent = new CustomEvent('active-category-change', { detail: null });
      window.dispatchEvent(clearEvent);
    };
  }, [categorySlug]);

  return null;
}
