import { NextResponse, type NextRequest } from 'next/server';
import { getAdminApp } from './firebase/admin';
import { auth } from 'firebase-admin';

const PROTECTED_ROUTES = ['/dashboard', '/pre-order', '/admin', '/employee'];
const PUBLIC_ROUTES = ['/login', '/register'];

const REDIRECTS: { [key: string]: string } = {
  admin: '/admin',
  employee: '/employee/scan',
  customer: '/dashboard',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (sessionCookie) {
    try {
      getAdminApp(); // Ensure admin app is initialized
      const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
      const role = (decodedToken.role as string) || 'customer';

      if (isPublicRoute) {
        const targetUrl = REDIRECTS[role] || '/dashboard';
        return NextResponse.redirect(new URL(targetUrl, request.url));
      }

      if (pathname.startsWith('/admin') && role !== 'admin') {
         const userDashboard = REDIRECTS[role] || '/dashboard';
         return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      if (pathname.startsWith('/employee') && role !== 'employee') {
         const userDashboard = REDIRECTS[role] || '/dashboard';
         return NextResponse.redirect(new URL(userDashboard, request.url));
      }
      if ((pathname.startsWith('/dashboard') || pathname.startsWith('/pre-order')) && role !== 'customer') {
         const userDashboard = REDIRECTS[role] || '/dashboard';
         return NextResponse.redirect(new URL(userDashboard, request.url));
      }

    } catch (error) {
      console.error('Middleware verification error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
