// src/app/api/auth/session/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth } from '@/firebase/admin';

export async function POST(request: NextRequest) {
  console.log('--- API /api/auth/session called ---');
  try {
    if (!process.env.SERVICE_ACCOUNT_KEY_JSON) {
      console.error('FATAL: SERVICE_ACCOUNT_KEY_JSON is not set in environment variables.');
      throw new Error('Server configuration error.');
    }

    const body = await request.json();
    const idToken = body.idToken;

    if (!idToken) {
      console.log('Error: No ID token provided in request body.');
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }
    console.log('Received ID token. Verifying and creating session cookie...');

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRecord = await adminAuth.getUser(uid);
    const role = userRecord.customClaims?.role || 'customer';

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 Tage in Millisekunden
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log('Session cookie created successfully.');

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // maxAge erwartet Sekunden
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // WICHTIG!
      path: '/',
    };
    
    let redirectUrl = '/dashboard';
    if (role === 'admin') redirectUrl = '/admin';
    else if (role === 'employee') redirectUrl = '/employee/scan';


    const response = NextResponse.json({ status: 'success', redirectUrl });
    response.cookies.set(options);

    console.log('Cookie set in response headers. Sending success response.');
    return response;
  } catch (error: any) {
    console.error('--- CRITICAL ERROR in /api/auth/session ---');
    console.error(error);

    const errorMessage = error.message || 'An unknown server error occurred.';
    const errorStack = process.env.NODE_ENV === 'development' ? error.stack : undefined;

    return NextResponse.json(
      {
        error: 'Authentication failed on server.',
        details: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}
