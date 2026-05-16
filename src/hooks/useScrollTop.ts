import { useState, useEffect } from 'react';

export function useScrollTop(threshold = 300) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Só roda no navegador, seguro contra quebras de SSR
    const toggleVisibility = () => setIsVisible(window.scrollY > threshold);
    window.addEventListener('scroll', toggleVisibility);
    
    // Cleanup obrigatório para não vazar memória!
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { isVisible, scrollToTop };
}
