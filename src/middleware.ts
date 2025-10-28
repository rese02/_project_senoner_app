import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/pre-order', '/admin', '/employee'];
const PUBLIC_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;
  console.log(`Middleware: Path '${pathname}', Session exists? ${!!sessionCookie}`);

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  if (!sessionCookie && isProtectedRoute) {
    const absoluteLoginURL = new URL('/login', request.nextUrl.origin);
    console.log('Middleware: No session, redirecting to login.');
    return NextResponse.redirect(absoluteLoginURL.toString());
  }

  if (sessionCookie) {
    if (isPublicRoute) {
      const absoluteDashboardURL = new URL('/dashboard', request.nextUrl.origin);
      return NextResponse.redirect(absoluteDashboardURL.toString());
    }

    if (isProtectedRoute) {
      try {
        const response = await fetch(new URL('/api/auth/verify', request.url), {
          headers: {
            'Cookie': `session=${sessionCookie}`
          }
        });

        if (!response.ok) {
          const absoluteLoginURL = new URL('/login', request.nextUrl.origin);
          console.log('Middleware: Token invalid (verify failed), redirecting to login.');
          return NextResponse.redirect(absoluteLoginURL.toString());
        }

        const { role } = await response.json();
        console.log(`Middleware: Role '${role}' verified for path '${pathname}'.`);

        if (pathname.startsWith('/admin') && role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (pathname.startsWith('/employee') && role !== 'employee' && role !== 'admin') {
           return NextResponse.redirect(new URL('/dashboard', request.url));
        }

      } catch (error) {
        console.error('Middleware verification error:', error);
        const absoluteLoginURL = new URL('/login', request.nextUrl.origin);
        return NextResponse.redirect(absoluteLoginURL.toString());
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|manifest.json|service-account.json).*)',
  ],
};
