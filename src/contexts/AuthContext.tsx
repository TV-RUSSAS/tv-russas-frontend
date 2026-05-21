'use client';
import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'COLUNISTA';
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (email: string, password: string, captchaToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  setAuthError: (error: string | null) => void;
  authError: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setAuthError(null);
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userId');
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
      sessionStorage.setItem('accessToken', data.accessToken);
      return true;
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      clearAuth();
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() / 1000 > payload.exp;

      if (isExpired) {
        const refreshed = await refreshSession();
        if (!refreshed) {
          clearAuth();
          return false;
        }
        return true;
      }

      setAccessToken(token);
      return true;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      clearAuth();
      return false;
    }
  }, [clearAuth, refreshSession]);

  const login = useCallback(async (email: string, password: string, captchaToken: string) => {
    try {
      setAuthError(null);
      setIsLoading(true);

      const response = await fetch(`${API_BASE.replace('/api', '')}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao fazer login');
      }

      setAccessToken(data.accessToken);
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('userName', data.user.nome);
      sessionStorage.setItem('userRole', data.user.role);
      sessionStorage.setItem('userId', data.user.id);

      setUser({
        id: data.user.id,
        nome: data.user.nome,
        email: data.user.email,
        role: data.user.role,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      setAuthError(message);
      clearAuth();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignorar erro ao fazer logout
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // Verificar autenticação ao montar
  useEffect(() => {
    const initAuth = async () => {
      const isValid = await checkAuth();
      if (isValid) {
        const nome = sessionStorage.getItem('userName');
        const email = sessionStorage.getItem('userRole');
        const role = sessionStorage.getItem('userRole') as AuthUser['role'];
        const id = sessionStorage.getItem('userId');

        if (nome && role && id) {
          setUser({ id, nome, email: email || '', role });
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [checkAuth]);

  // Verificar sessão a cada 5 minutos
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const isValid = await checkAuth();
      if (!isValid) {
        clearAuth();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, checkAuth, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        accessToken,
        login,
        logout,
        refreshSession,
        checkAuth,
        setAuthError,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
