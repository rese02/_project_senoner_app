import { NextResponse, type NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;
  
  // If there's no session cookie and the user is trying to access a protected route
  const isAccessingProtected = Object.keys(PROTECTED_ROUTES).some(route => pathname.startsWith(route));

  if (!sessionCookie && isAccessingProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      const userRole = session.role || 'customer';
      
      // If user is logged in, redirect from auth pages to their default dashboard
      if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        const targetUrl = REDIRECTS[userRole as keyof typeof REDIRECTS] || '/dashboard';
        return NextResponse.redirect(new URL(targetUrl, request.url));
      }

      // Check if user is trying to access a route they don't have permission for
      for (const route in PROTECTED_ROUTES) {
        if (pathname.startsWith(route)) {
            const requiredRole = PROTECTED_ROUTES[route as keyof typeof PROTECTED_ROUTES];
            if (userRole !== requiredRole) {
                // Redirect them to their own dashboard if they try to access a page not meant for them
                const userDashboard = REDIRECTS[userRole as keyof typeof REDIRECTS] || '/dashboard';
                return NextResponse.redirect(new URL(userDashboard, request.url));
            }
        }
      }
    } catch (e) {
      // If cookie is malformed, clear it and redirect to login
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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
