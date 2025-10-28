import { getAdminApp } from '@/firebase/admin';
import { auth as adminAuth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Verifies the session cookie provided in the request.
 * This API route runs in the Node.js runtime and can use the Firebase Admin SDK.
 */
export async function GET(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Nicht autorisiert: Kein Session-Cookie' }, { status: 401 });
  }

  try {
    getAdminApp(); // Ensure Firebase Admin SDK is initialized
    // Verify the session cookie. This checks for expiry and validity.
    const decodedToken = await adminAuth().verifySessionCookie(sessionCookie, true);
    
    // The role is expected to be a custom claim on the token.
    const role = decodedToken.role || 'customer';

    return NextResponse.json({ success: true, uid: decodedToken.uid, role: role }, { status: 200 });
  } catch (error) {
    console.error('Fehler bei der Überprüfung des Session-Cookies:', error);
    // The cookie is invalid, expired, etc.
    return NextResponse.json({ error: 'Nicht autorisiert: Ungültige Sitzung' }, { status: 401 });
  }
}
