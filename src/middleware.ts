import { NextResponse, type NextRequest } from 'next/server';
import { getAdminApp } from './firebase/admin';
import { auth } from 'firebase-admin';

const PROTECTED_ROUTES = {
  '/dashboard': 'customer',
  '/pre-order': 'customer',
  '/admin': 'admin',
  '/employee': 'employee',
};

const REDIRECTS = {
  admin: '/admin',
  employee: '/employee/scan',
  customer: '/dashboard',
};

async function verifySession(sessionCookie?: string) {
  if (!sessionCookie) {
    return null;
  }
  try {
    getAdminApp(); // Stellt sicher, dass die Admin-App initialisiert ist
    const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
    return decodedToken;
  } catch (error) {
    console.warn('Ungültiger Session-Cookie:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;
  
  const decodedToken = await verifySession(sessionCookie);
  const userRole = decodedToken?.role || 'customer';

  const isAccessingProtected = Object.keys(PROTECTED_ROUTES).some(route => pathname.startsWith(route));

  if (!decodedToken && isAccessingProtected) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
  
  if (decodedToken) {
    // Wenn der Benutzer angemeldet ist, von den Authentifizierungsseiten zum entsprechenden Dashboard umleiten
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      const targetUrl = REDIRECTS[userRole as keyof typeof REDIRECTS] || '/dashboard';
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    // Prüfen, ob der Benutzer versucht, auf eine Route zuzugreifen, für die er keine Berechtigung hat
    for (const route in PROTECTED_ROUTES) {
      if (pathname.startsWith(route)) {
        const requiredRole = PROTECTED_ROUTES[route as keyof typeof PROTECTED_ROUTES];
        if (userRole !== requiredRole) {
          // Leite sie zu ihrem eigenen Dashboard um, wenn sie versuchen, auf eine Seite zuzugreifen, die nicht für sie bestimmt ist
          const userDashboard = REDIRECTS[userRole as keyof typeof REDIRECTS] || '/dashboard';
          return NextResponse.redirect(new URL(userDashboard, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Übereinstimmung mit allen Anforderungspfaden außer denen, die beginnen mit:
     * - api (API-Routen)
     * - _next/static (statische Dateien)
     * - _next/image (Bildoptimierungsdateien)
     * - favicon.ico (Favicon-Datei)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
