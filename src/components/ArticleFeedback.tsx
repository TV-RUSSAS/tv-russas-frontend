'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { API_URL } from '@/services/api';

interface ArticleFeedbackProps {
  articleId: string;
}

export function ArticleFeedback({ articleId }: ArticleFeedbackProps) {
  // Como este componente agora só roda no cliente (via Wrapper), 
  // podemos ler o localStorage diretamente na inicialização.
  const [voted, setVoted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`voted_${articleId}`) !== null;
  });

  const [choice, setChoice] = useState<'positive' | 'negative' | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`voted_${articleId}`) as 'positive' | 'negative' | null;
  });

  const handleVote = async (type: 'positive' | 'negative') => {
    setVoted(true);
    setChoice(type);
    localStorage.setItem(`voted_${articleId}`, type);
    
    try {
      await fetch(`${API_URL}/noticias/${articleId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
    } catch (error) {
      console.error('Erro ao enviar feedback para o banco:', error);
    }
  };

  if (voted) {
    return (
      <div className="article-feedback-container voted animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
          <h4 className="text-xl font-bold text-gray-800">Obrigado pelo seu feedback!</h4>
          <p className="text-gray-500">Sua opinião ajuda a melhorar nosso conteúdo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="article-feedback-container">
      <h4 className="feedback-title">O que você achou desta matéria?</h4>
      <div className="feedback-buttons">
        <button 
          onClick={() => handleVote('positive')}
          className="feedback-btn positive"
        >
          <ThumbsUp size={20} />
          <span>Excelente</span>
        </button>
        <button 
          onClick={() => handleVote('negative')}
          className="feedback-btn negative"
        >
          <ThumbsDown size={20} />
          <span>Poderia melhorar</span>
        </button>
      </div>
    </div>
  );
}
