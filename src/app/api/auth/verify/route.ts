import { getAdminApp } from '@/firebase/admin';
import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

// This API route runs in the Node.js runtime and can use firebase-admin.
export async function GET(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Nicht autorisiert: Kein Session-Cookie' }, { status: 401 });
  }

  try {
    getAdminApp(); // Ensure admin app is initialized
    const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
    
    // The role is expected to be a custom claim on the token.
    const role = decodedToken.role || 'customer';

    return NextResponse.json({ success: true, uid: decodedToken.uid, role: role }, { status: 200 });
  } catch (error) {
    console.error('Fehler bei der Überprüfung des Session-Cookies:', error);
    // The cookie is invalid, expired, etc.
    return NextResponse.json({ error: 'Nicht autorisiert: Ungültige Sitzung' }, { status: 401 });
  }
}
