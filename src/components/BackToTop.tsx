'use client'
import { useScrollTop } from '@/hooks/useScrollTop';

export function BackToTop() {
  const { isVisible, scrollToTop } = useScrollTop(300);

  if (!isVisible) return null;

  return (
    <button 
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 bg-[#d93a1c] text-white p-3 md:p-4 rounded-full shadow-[0_4px_14px_0_rgba(217,58,28,0.39)] hover:bg-[#b02e15] hover:shadow-[0_6px_20px_rgba(217,58,28,0.23)] hover:-translate-y-1 transition-all duration-200 z-50 flex items-center justify-center group"
      aria-label="Voltar ao topo"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6 group-hover:animate-bounce" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
