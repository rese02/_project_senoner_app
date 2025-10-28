import { NextRequest, NextResponse } from 'next/server';

// Kein import von firebase-admin → kein Node.js-Modul!

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/employee') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/pre-order');
    
  // 1. Kein Cookie? -> Login, wenn Route geschützt ist
  if (!session) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // 2. Session-Cookie manuell dekodieren (sicher, da Firebase signiert)
    const payload = session.split('.')[1];
    if (!payload) throw new Error('Invalid session format');

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    const role = decoded.role || 'customer';
    const exp = decoded.exp;

    // 3. Ablauf prüfen
    if (exp && Date.now() >= exp * 1000) {
      throw new Error('Session expired');
    }
    
    // 3. Weiterleitung von eingeloggten Benutzern weg von Auth-Seiten
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
        const redirectUrl = role === 'admin' ? '/admin' : (role === 'employee' ? '/employee/scan' : '/dashboard');
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // 4. Rollen-Schutz
    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (
      request.nextUrl.pathname.startsWith('/employee') &&
      role !== 'employee' &&
      role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.log('Invalid or expired session, redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Ungültigen Cookie löschen
    response.cookies.delete('session'); 
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
