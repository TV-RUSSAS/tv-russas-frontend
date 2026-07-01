"use client";
import { useEffect } from "react";
import { API_URL } from '@/services/api';

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const localKey = `viewed_${slug}`;
        const lastViewed = localStorage.getItem(localKey);
        const now = Date.now();

        // Evita enviar visualização se o usuário acessou essa mesma matéria nas últimas 24 horas
        if (lastViewed && now - parseInt(lastViewed, 10) < 24 * 60 * 60 * 1000) {
          return;
        }

        const sessionId = localStorage.getItem("tv_russas_session") || 
                         Math.random().toString(36).substring(7);
        localStorage.setItem("tv_russas_session", sessionId);

        const res = await fetch(`${API_URL}/noticias/${slug}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok) {
          localStorage.setItem(localKey, now.toString());
        }
      } catch (error) {
        console.error("Erro ao registrar view:", error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
