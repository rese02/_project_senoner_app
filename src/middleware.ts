import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/pre-order', '/admin', '/employee'];
const PUBLIC_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  // 1. Wenn kein Session-Cookie vorhanden ist und versucht wird, auf eine geschützte Route zuzugreifen,
  // leiten wir zur Login-Seite weiter.
  if (!sessionCookie && isProtectedRoute) {
    const absoluteLoginURL = new URL('/login', request.nextUrl.origin);
    return NextResponse.redirect(absoluteLoginURL.toString());
  }

  // 2. Wenn ein Session-Cookie vorhanden ist...
  if (sessionCookie) {
    // Wenn der Benutzer eingeloggt ist und versucht, auf Login/Register zuzugreifen,
    // leiten wir ihn zum Dashboard.
    if (isPublicRoute) {
      const absoluteDashboardURL = new URL('/dashboard', request.nextUrl.origin);
      return NextResponse.redirect(absoluteDashboardURL.toString());
    }

    // Für geschützte Routen rufen wir eine 'verify' API-Route auf,
    // um den Cookie serverseitig zu überprüfen.
    if (isProtectedRoute) {
      try {
        const response = await fetch(new URL('/api/auth/verify', request.url), {
          headers: {
            'Cookie': `session=${sessionCookie}`
          }
        });

        // Wenn die Verifizierung fehlschlägt (z.B. 401 Unauthorized), leiten wir zum Login.
        if (!response.ok) {
          const absoluteLoginURL = new URL('/login', request.nextUrl.origin);
          return NextResponse.redirect(absoluteLoginURL.toString());
        }

        const { role } = await response.json();

        // Rollenbasierter Zugriffsschutz
        if (pathname.startsWith('/admin') && role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (pathname.startsWith('/employee') && role !== 'employee' && role !== 'admin') {
           return NextResponse.redirect(new URL('/employee/scan', request.url));
        }

      } catch (error) {
        // Bei einem Fehler bei der Überprüfung, ist es sicherer, zum Login umzuleiten.
        console.error('Middleware verification error:', error);
        const absoluteLoginURL = new URL('/login', request.nextUrl.origin);
        return NextResponse.redirect(absoluteLoginURL.toString());
      }
    }
  }
  
  // 3. Für alle anderen Fälle, weiter zur angeforderten Seite.
  return NextResponse.next();
}

export const config = {
  // Alle Routen außer statischen Dateien, Bildern und den API-Routen selbst.
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|manifest.json|service-account.json).*)',
  ],
};
