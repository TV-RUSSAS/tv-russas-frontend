'use client';

import dynamic from 'next/dynamic';

// Este wrapper carrega o componente de feedback APENAS no cliente.
// Isso elimina erros de hidratação e avisos de renderização em cascata (cascading renders).
const ArticleFeedbackClient = dynamic(
  () => import('./ArticleFeedback').then((mod) => mod.ArticleFeedback),
  { 
    ssr: false,
    loading: () => <div className="article-feedback-container" style={{ minHeight: '180px' }} />
  }
);

export function ArticleFeedbackWrapper({ articleId }: { articleId: string }) {
  return <ArticleFeedbackClient articleId={articleId} />;
}
