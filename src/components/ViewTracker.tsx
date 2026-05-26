"use client";
import { useEffect } from "react";
import { API_URL } from '@/services/api';

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // ECONOMY_MODE: view tracking temporariamente desativado para reduzir banda do Render.
    // TODO: Reativar quando backend estiver em plano com banda suficiente.
    // Para reativar, defina ECONOMY_MODE=false no .env.
    if (process.env.NEXT_PUBLIC_ECONOMY_MODE === "true") {
      return;
    }

    // Registra a visualização após 500ms de permanência
    const timer = setTimeout(async () => {
      try {
        const localKey = `viewed_${slug}`;
        const lastViewed = localStorage.getItem(localKey);
        const now = Date.now();

        // Evita enviar visualização se o usuário acessou essa mesma matéria nos últimos 30 minutos
        if (lastViewed && now - parseInt(lastViewed, 10) < 30 * 60 * 1000) {
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
