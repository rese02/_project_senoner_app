import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    // Session cookie not found, user is not authenticated
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    // Verify the session cookie. This will check if it's valid and not revoked.
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // The cookie is valid. Return the user's role from the custom claims.
    const role = decodedToken.role || 'customer';
    
    return NextResponse.json({ success: true, role: role }, { status: 200 });

  } catch (error) {
    // Session cookie is invalid, expired, or revoked.
    console.error('Fehler bei der Sitzungsüberprüfung:', error);
    return NextResponse.json({ error: 'Sitzung ungültig' }, { status: 401 });
  }
}
