'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
  return Date.now() / 1000 > payload.exp;
}

function getInitialUser(): AdminUser | null {
  const token = sessionStorage.getItem('accessToken');
  if (!token || isTokenExpired(token)) return null;
  const nome = sessionStorage.getItem('userName') || '';
  const role = sessionStorage.getItem('userRole') as AdminUser['role'] || 'EDITOR';
  const payload = parseJwtPayload(token);
  return { id: payload?.id || '', nome, email: '', role };
}

export function useAdminAuth() {
  const router = useRouter();
  // Lazy initializer: lê o sessionStorage apenas uma vez, sem causar re-renders
  const [user] = useState<AdminUser | null>(getInitialUser);
  // Não há operação assíncrona: sessionStorage é síncrono, então loading começa como false
  const [loading] = useState(false);

  // useEffect apenas para o efeito colateral externo de navegação
  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    }
  }, [router, user]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      // silenciar erro de rede no logout
    }
    sessionStorage.clear();
    router.push('/admin/login');
  }, [router]);

  /** Fetch autenticado com injeção automática do Bearer token */
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = sessionStorage.getItem('accessToken');
    if (!token || isTokenExpired(token)) {
      router.push('/admin/login');
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

    if (res.status === 401) {
      sessionStorage.clear();
      router.push('/admin/login');
      throw new Error('Não autorizado.');
    }
    return res;
  }, [router]);

  return { user, loading, logout, authFetch };
}
