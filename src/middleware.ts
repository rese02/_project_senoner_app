import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;
  console.log(`Middleware: Path '${pathname}', Session exists? ${!!session}`);

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // If the user has a session cookie, we need to decode it to check the role
  // for role-based protected routes.
  if (session) {
    try {
      // Decode the JWT payload to get the role without full verification for middleware speed.
      // Full verification happens on API routes or server components where security is critical.
      const decoded = JSON.parse(Buffer.from(session.split('.')[1], 'base64').toString());
      const role = decoded.role || 'customer';
      console.log(`Middleware: Role '${role}' decoded for path '${pathname}'.`);

      // If user with valid session tries to access public routes like login, redirect them away
      if (isPublicRoute) {
        const redirectUrl = role === 'admin' ? '/admin' : (role === 'employee' ? '/employee/scan' : '/dashboard');
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // Enforce role-based access for protected routes
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/employee/scan', request.url));
      }
      if (pathname.startsWith('/employee') && role !== 'employee' && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (error) {
      // This might happen if the cookie is malformed.
      console.error('Middleware token decoding error:', error);
      // If an error occurs and they are on a protected route, send them to login.
      if (isProtectedRoute) {
        const absoluteLoginURL = new URL('/login', request.nextUrl.origin);
        // Clear the malformed cookie
        const response = NextResponse.redirect(absoluteLoginURL.toString());
        response.cookies.set('session', '', { maxAge: -1 });
        return response;
      }
    }
  } else {
    // No session cookie, redirect to login if it's a protected route.
    if (isProtectedRoute) {
      const absoluteLoginURL = new URL('/login', request.nextUrl.origin);
      console.log('Middleware: No session, redirecting to login.');
      return NextResponse.redirect(absoluteLoginURL.toString());
    }
  }

  return NextResponse.next();
}

const PROTECTED_ROUTES = ['/dashboard', '/pre-order', '/admin', '/employee'];
const PUBLIC_ROUTES = ['/login', '/register'];

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|manifest.json|service-account.json).*)',
  ],
};
