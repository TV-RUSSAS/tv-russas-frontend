import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Como o backend (Render) e o frontend (Vercel) estão em domínios diferentes,
  // o Next.js Middleware (rodando no server do Vercel) NÃO TEM ACESSO ao cookie 'refreshToken'
  // que o backend configurou. 
  // 
  // Portanto, a proteção das rotas /admin NÃO DEVE ser feita via middleware de borda,
  // e sim client-side via o hook `useAdminAuth`, que gerencia a sessão no sessionStorage 
  // e faz a validação com a API do backend.

  return NextResponse.next();
}

// Executar middleware em todas as subrotas do admin
export const config = {
  matcher: ['/admin/:path*'],
};
