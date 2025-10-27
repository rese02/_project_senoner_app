import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/pre-order', '/admin', '/employee'];
const PUBLIC_ROUTES = ['/login', '/register'];

// This middleware is now much simpler. It only handles redirects based on the presence
// of a session cookie and delegates the actual verification to an API route.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // If no session cookie and trying to access a protected route, redirect to login
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session cookie, we need to verify it.
  if (sessionCookie) {
    try {
      // The verification is handled by an API route that runs in the Node.js runtime.
      const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        headers: {
          Cookie: `session=${sessionCookie}`,
        },
      });

      // If verification fails (e.g., token expired), redirect to login and clear the invalid cookie.
      if (!response.ok) {
        const loginUrl = new URL('/login', request.url);
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.cookies.delete('session');
        return redirectResponse;
      }
      
      const { role, uid } = await response.json();
      
      const REDIRECTS: { [key: string]: string } = {
          admin: '/admin',
          employee: '/employee/scan',
          customer: '/dashboard',
      };

      // If user is authenticated and tries to access a public route (login/register),
      // redirect them to their respective dashboard.
      if (isPublicRoute) {
        const targetUrl = REDIRECTS[role as keyof typeof REDIRECTS] || '/dashboard';
        return NextResponse.redirect(new URL(targetUrl, request.url));
      }

      // Enforce role-based access to protected routes
      if (pathname.startsWith('/admin') && role !== 'admin') {
         const userDashboard = REDIRECTS[role as keyof typeof REDIRECTS] || '/dashboard';
         return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      if (pathname.startsWith('/employee') && role !== 'employee' && role !== 'admin') {
         const userDashboard = REDIRECTS[role as keyof typeof REDIRECTS] || '/dashboard';
         return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      if ((pathname.startsWith('/dashboard') || pathname.startsWith('/pre-order')) && role !== 'customer') {
         const userDashboard = REDIRECTS[role as keyof typeof REDIRECTS] || '/dashboard';
         return NextResponse.redirect(new URL(userDashboard, request.url));
      }

    } catch (error) {
      // In case of any other error (e.g., network issue), redirect to login
      console.error('Middleware verification fetch error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for static files, images, and the API routes themselves
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
