'use client';
import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:3001/api';

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'COLUNISTA';
}

function parseJwtPayload(token: string): { exp?: number; id?: string } | null {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > (payload.exp - 5);
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verificarAuth = () => {
      const token = sessionStorage.getItem('accessToken');
      
      // A marretada: Se não há token, limpa e força o navegador a ir para o login IMEDIATAMENTE
      if (!token || isTokenExpired(token)) {
        sessionStorage.clear();
        window.location.href = '/admin/login';
        return;
      }

      const nome = sessionStorage.getItem('userName') || '';
      const role = sessionStorage.getItem('userRole') as AdminUser['role'] || 'EDITOR';
      const payload = parseJwtPayload(token);

      if (isMounted) {
        setUser({ id: payload?.id || '', nome, email: '', role });
        setLoading(false);
      }
    };

    verificarAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      // silenciar erro
    }
    sessionStorage.clear();
    window.location.href = '/admin/login';
  }, []);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = sessionStorage.getItem('accessToken');
    
    if (!token || isTokenExpired(token)) {
      sessionStorage.clear();
      window.location.href = '/admin/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const res = await fetch(`${API_BASE}${cleanUrl}`, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
      sessionStorage.clear();
      window.location.href = '/admin/login';
      throw new Error('Não autorizado.');
    }
    
    return res;
  }, []);

  return { user, loading, logout, authFetch };
}