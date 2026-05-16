"use client";
import { useEffect } from "react";
import { API_URL } from '@/services/api';

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // Registra a visualização após 2 segundos de permanência (anti-refresh simples)
    const timer = setTimeout(async () => {
      try {
        const sessionId = localStorage.getItem("tv_russas_session") || 
                         Math.random().toString(36).substring(7);
        localStorage.setItem("tv_russas_session", sessionId);

        await fetch(`${API_URL}/noticias/${slug}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      } catch (error) {
        console.error("Erro ao registrar view:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
