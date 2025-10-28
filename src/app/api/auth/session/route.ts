'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/firebase/admin';
import admin from 'firebase-admin';

const REDIRECTS: { [key: string]: string } = {
  admin: '/admin',
  employee: '/employee/scan',
  customer: '/dashboard',
};

export async function POST(req: NextRequest) {
    console.log('--- API /api/auth/session called ---');
  try {
    
    // Wichtiger Check: Ist der Service Account Key überhaupt da?
    if (!process.env.SERVICE_ACCOUNT_KEY_JSON) {
        console.error('FATAL: SERVICE_ACCOUNT_KEY_JSON is not set in environment variables.');
        throw new Error('Server configuration error.');
    }
    console.log('Environment variable for service account found.');

    const { idToken } = await req.json();

    if (!idToken) {
      console.log('Error: No ID token provided in request body.');
      return NextResponse.json({ error: 'ID Token ist erforderlich' }, { status: 400 });
    }
    console.log('Received ID token. Verifying and creating session cookie...');


    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log('Token verified for UID:', uid);

    const userDocRef = adminFirestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    let role = 'customer';
    if (userDoc.exists) {
      role = userDoc.data()?.role || 'customer';
    } else {
      await userDocRef.set({
        id: uid,
        email: decodedToken.email,
        role: 'customer',
        points: 0,
        rewards: [],
        coupons: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
       console.log(`User document created for UID: ${uid}`);
    }
    
    console.log('User role determined as:', role);

    if (decodedToken.role !== role) {
      await adminAuth.setCustomUserClaims(uid, { role });
       console.log(`Custom claim set to: ${role}`);
    }
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log('Session cookie created successfully.');

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax' as const,
    };

    const redirectUrl = REDIRECTS[role] || '/dashboard';
    
    const response = NextResponse.json({ success: true, redirectUrl }, { status: 200 });
    response.cookies.set(options);
    
    console.log('Cookie set in response headers. Sending success response.');
    return response;

  } catch (error: any) {
    console.error('--- ERROR in /api/auth/session ---');
    console.error(error);
    return NextResponse.json({ error: 'Authentication failed on server.', details: error.message }, { status: 401 });
  }
}
