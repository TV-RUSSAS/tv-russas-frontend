import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apenas intercepta rotas sob a subpasta /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('refreshToken')?.value;

    // 1. Se tentar entrar no painel sem cookie e não estiver na página de login, manda pro login
    if (!token && !pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 2. Se o usuário já tiver o cookie de sessão e tentar acessar a tela de login, manda pro dashboard principal
    if (token && pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// Executar middleware em todas as subrotas do admin
export const config = {
  matcher: ['/admin/:path*'],
};
