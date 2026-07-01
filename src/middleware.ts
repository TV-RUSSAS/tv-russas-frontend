import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {

  // Como o backend (Render) e o frontend (Vercel) estão em domínios diferentes,
  // o Next.js Middleware (rodando no server do Vercel) NÃO TEM ACESSO ao cookie 'refreshToken'
  // que o backend configurou. 
  // 
  // Portanto, a proteção das rotas /admin NÃO DEVE ser feita via middleware de borda,
  // e sim client-side via o hook `useAdminAuth`, que gerencia a sessão no sessionStorage 
  // e faz a validação com a API do backend.

  const response = NextResponse.next();
  
  // Garantir que páginas do painel administrativo nunca fiquem em cache público
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

// Executar middleware em todas as subrotas do admin
export const config = {
  matcher: ['/admin/:path*'],
};
