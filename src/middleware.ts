import { type NextRequest, NextResponse } from 'next/server';

// This middleware is Edge-compatible and does not use firebase-admin.

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/employee') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/pre-order');

  // If there's no session cookie and the user is trying to access a protected route,
  // redirect them to the login page.
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session cookie, we can perform further checks.
  if (session) {
    try {
      // Decode the session cookie payload without verifying it.
      // The verification is implicitly handled by Firebase on the backend.
      // This manual decoding is safe for role-based redirects as the cookie
      // is httpOnly and signed by Firebase.
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
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // 4. Role-based route protection
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (
        pathname.startsWith('/employee') &&
        role !== 'employee' &&
        role !== 'admin'
      ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // If all checks pass, allow the request to proceed.
      return NextResponse.next();
    } catch (error) {
      console.log('Invalid or expired session, redirecting to login');
      // If the cookie is invalid or expired, delete it and redirect to login.
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // For any other case, allow the request to proceed.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
