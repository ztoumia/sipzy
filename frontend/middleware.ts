import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/profile/edit',
  '/profile/submissions',
  '/coffees/new',
];

// Routes d'authentification (rediriger si déjà connecté)
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const pathname = request.nextUrl.pathname;

  // Vérifier si l'utilisateur essaie d'accéder à une route protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Si pas de token et route protégée -> rediriger vers login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si token présent et route d'auth -> rediriger vers home
  // Note: On ne peut pas vérifier la validité JWT côté serveur middleware
  // Le token sera vérifié côté client et nettoyé si invalide
  // Pour forcer l'accès au login même avec un token, utiliser ?force=true
  if (isAuthRoute && token) {
    const forceLogin = request.nextUrl.searchParams.get('force');
    if (!forceLogin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
