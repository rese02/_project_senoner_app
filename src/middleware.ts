import { type NextRequest, NextResponse } from 'next/server';

// This middleware is Edge-compatible and does not use firebase-admin.

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/employee');

  // If there's no session cookie and the user is trying to access a protected route,
  // redirect them to the login page.
  if (!session && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If there is a session cookie, we can perform further checks.
  if (session) {
    try {
      // Decode the session cookie payload without verifying it.
      // This is safe for role-based redirects as the cookie is httpOnly,
      // and its integrity is verified on the server in API Routes or Server Components.
      const payload = session.split('.')[1];
      if (!payload) {
        throw new Error('Invalid session cookie format');
      }

      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      const role = decoded.role || 'customer';

      // 3. Check for expiration
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        throw new Error('Session expired');
      }
      
      // If the user is logged in, redirect them away from login/register pages.
      if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        const redirectUrl = role === 'admin' ? '/admin' : (role === 'employee' ? '/employee/scan' : '/dashboard');
        const url = request.nextUrl.clone();
        url.pathname = redirectUrl;
        return NextResponse.redirect(url);
      }

      // 4. Role-based route protection
      if (pathname.startsWith('/admin') && role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
      if (
        pathname.startsWith('/employee') &&
        role !== 'employee' &&
        role !== 'admin'
      ) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }

      // If all checks pass, allow the request to proceed.
      return NextResponse.next();
    } catch (error) {
      console.log('Invalid or expired session, redirecting to login');
      // If the cookie is invalid or expired, delete it and redirect to login.
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('session');
      return response;
    }
  }

  // For any other case, allow the request to proceed.
  return NextResponse.next();
}

// This matcher applies the middleware to all routes EXCEPT for the ones starting with:
// - api (API routes)
// - _next/static (static files)
// - _next/image (image optimization files)
// - favicon.ico (favicon file)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
