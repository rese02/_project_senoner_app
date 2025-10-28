import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/employee') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/pre-order');
    
  if (!session) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    const role = decodedClaims.role || 'customer';
    
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
        const redirectUrl = role === 'admin' ? '/admin' : (role === 'employee' ? '/employee/scan' : '/dashboard');
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

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
    console.log('Invalid or expired session, redirecting to login:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session'); 
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
