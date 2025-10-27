import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/pre-order', '/admin', '/employee'];
const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/session', '/api/auth/logout'];

const REDIRECTS = {
  admin: '/admin',
  employee: '/employee/scan',
  customer: '/dashboard',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Wenn kein Session-Cookie vorhanden ist und der Benutzer versucht, auf eine geschützte Route zuzugreifen
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Wenn ein Session-Cookie vorhanden ist
  if (sessionCookie) {
    try {
      const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        headers: {
          Cookie: `session=${sessionCookie}`,
        },
      });

      // Wenn die Verifizierung fehlschlägt (z.B. 401 Unauthorized), zum Login umleiten
      if (!verifyResponse.ok) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('session'); // Ungültigen Cookie löschen
        return response;
      }
      
      const { role } = await verifyResponse.json();

      // Wenn der Benutzer angemeldet ist, von den Authentifizierungsseiten zum entsprechenden Dashboard umleiten
      if (isPublicRoute && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
         const targetUrl = REDIRECTS[role as keyof typeof REDIRECTS] || '/dashboard';
         return NextResponse.redirect(new URL(targetUrl, request.url));
      }

      // Prüfen, ob der Benutzer versucht, auf eine Route zuzugreifen, für die er keine Berechtigung hat
      if (pathname.startsWith('/admin') && role !== 'admin') {
         const userDashboard = REDIRECTS[role as keyof typeof REDIRECTS] || '/dashboard';
         return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      if (pathname.startsWith('/employee') && role !== 'employee') {
         const userDashboard = REDIRECTS[role as keyof typeof REDIRECTS] || '/dashboard';
         return NextResponse.redirect(new URL(userDashboard, request.url));
      }
       if ((pathname.startsWith('/dashboard') || pathname.startsWith('/pre-order')) && role !== 'customer') {
         const userDashboard = REDIRECTS[role as keyof typeof REDIRECTS] || '/dashboard';
         return NextResponse.redirect(new URL(userDashboard, request.url));
      }

    } catch (error) {
      console.error('Middleware verification error:', error);
      // Im Fehlerfall zum Login umleiten und Cookie löschen
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Übereinstimmung mit allen Anforderungspfaden außer denen, die beginnen mit:
     * - _next/static (statische Dateien)
     * - _next/image (Bildoptimierungsdateien)
     * - favicon.ico (Favicon-Datei)
     * - /api/auth/verify (die Verifizierungsroute selbst, um eine Schleife zu vermeiden)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/verify).*)',
  ],
};
