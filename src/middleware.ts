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
    // API route for verification
    const verifyUrl = new URL('/api/auth/verify', request.nextUrl.origin);
    
    try {
      const response = await fetch(verifyUrl, {
        headers: {
          'Cookie': `session=${sessionCookie}`
        }
      });
      
      if (!response.ok) {
        // Verification failed, invalid session
        if (isProtectedRoute) {
          const absoluteLoginURL = new URL('/login', request.nextUrl.origin);
          console.log('Middleware: Token invalid (verify failed), redirecting to login.');
          return NextResponse.redirect(absoluteLoginURL.toString());
        }
      } else {
        const { role } = await response.json();
        console.log(`Middleware: Role '${role}' verified for path '${pathname}'.`);

        // If user with valid session tries to access public routes like login, redirect them away
        if (isPublicRoute) {
            const redirectUrl = role === 'admin' ? '/admin' : (role === 'employee' ? '/employee/scan' : '/dashboard');
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        // Enforce role-based access for protected routes
        if (pathname.startsWith('/admin') && role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (pathname.startsWith('/employee') && role !== 'employee' && role !== 'admin') {
           return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

    } catch (error) {
      console.error('Middleware verification error:', error);
      if (isProtectedRoute) {
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
