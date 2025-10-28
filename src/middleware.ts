import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')?.value;

  // 1. Kein Cookie? → Login
  if (!session) {
    if (
      request.nextUrl.pathname.startsWith('/admin') ||
      request.nextUrl.pathname.startsWith('/employee') ||
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/pre-order')
    ) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // 2. Rolle aus Session-Cookie extrahieren (ohne verifySessionCookie!)
    const payload = session.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    const role = decoded.role || 'customer';

    // Redirect logged-in users away from auth pages
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
        const redirectUrl = role === 'admin' ? '/admin' : (role === 'employee' ? '/employee/scan' : '/dashboard');
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // 3. Rollen-Schutz
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
    console.log('Invalid session cookie, redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('session', '', { maxAge: -1 });
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
