'use client';
import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export function useAuthFetch() {
  const { accessToken, logout, refreshSession } = useAuth();

  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    if (!accessToken) {
      await logout();
      throw new Error('Não autenticado');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken}`);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/api`
      : 'http://127.0.0.1:3001/api';

    let response = await fetch(`${API_BASE}${url}`, { ...options, headers });

    // Se 401, tenta refresh
    if (response.status === 401) {
      const refreshed = await refreshSession();
      if (refreshed) {
        const newToken = sessionStorage.getItem('accessToken');
        if (newToken) {
          headers.set('Authorization', `Bearer ${newToken}`);
          response = await fetch(`${API_BASE}${url}`, { ...options, headers });
        }
      }
    }

    // Se ainda 401 após refresh, logout
    if (response.status === 401) {
      await logout();
      throw new Error('Sessão inválida. Faça login novamente.');
    }

    return response;
  };
}
