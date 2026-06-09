'use client';
import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://127.0.0.1:3001/api';

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
  // Expira se faltar menos de 10 segundos para expirar
  return Date.now() / 1000 > (payload.exp - 10);
}

interface RefreshResponse {
  accessToken: string;
  user: AdminUser;
}

// Mecanismo Global de Lock para evitar concorrência nas chamadas de refresh token
let refreshPromise: Promise<RefreshResponse | null> | null = null;

async function executeRefresh(): Promise<RefreshResponse | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async (): Promise<RefreshResponse | null> => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('userName', data.user.nome);
        sessionStorage.setItem('userRole', data.user.role);
        sessionStorage.setItem('userId', data.user.id);
        return data;
      }
      return null;
    } catch (error) {
      console.error('[useAdminAuth] Erro na requisição de refresh:', error);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const verificarAuth = useCallback(async () => {
    let token = sessionStorage.getItem('accessToken');
    
    // Se não há token ou está prestes a expirar, tenta renovar antes de qualquer coisa!
    if (!token || isTokenExpired(token)) {
      console.log('[useAdminAuth] Token expirado ou ausente. Tentando renovar...');
      const refreshResult = await executeRefresh();
      if (refreshResult) {
        token = refreshResult.accessToken;
      }
    }

    if (!token || isTokenExpired(token)) {
      console.warn('[useAdminAuth] Sessão inválida após tentativa de refresh. Redirecionando para login...');
      sessionStorage.clear();
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
      return;
    }

    const nome = sessionStorage.getItem('userName') || '';
    const role = sessionStorage.getItem('userRole') as AdminUser['role'] || 'EDITOR';
    const payload = parseJwtPayload(token);

    setUser({ id: payload?.id || '', nome, email: '', role });
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      await verificarAuth();
    };

    init();
  }, [verificarAuth]);

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
    let token = sessionStorage.getItem('accessToken');
    
    // 1. Garantir que o token está atualizado antes do fetch
    if (!token || isTokenExpired(token)) {
      const refreshResult = await executeRefresh();
      if (refreshResult) {
        token = refreshResult.accessToken;
      }
    }

    if (!token || isTokenExpired(token)) {
      sessionStorage.clear();
      window.location.href = '/admin/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    let res = await fetch(`${API_BASE}${cleanUrl}`, { ...options, headers });

    // 2. Se receber 401 (expirou nesse milissegundo), tenta renovar UMA vez
    if (res.status === 401) {
      console.warn('[useAdminAuth] Recebido 401. Tentando renovação de token emergencial...');
      const refreshResult = await executeRefresh();
      if (refreshResult) {
        token = refreshResult.accessToken;
        headers.set('Authorization', `Bearer ${token}`);
        res = await fetch(`${API_BASE}${cleanUrl}`, { ...options, headers });
      }
    }

    // 3. Se ainda der erro 401, desloga. Se der 403, apenas recusa o acesso sem deslogar.
    if (res.status === 401) {
      sessionStorage.clear();
      window.location.href = '/admin/login';
      throw new Error('Sessão expirada.');
    }
    if (res.status === 403) {
      throw new Error('Você não tem permissão para acessar este recurso.');
    }
    
    return res;
  }, []);

  return { user, loading, logout, authFetch };
}