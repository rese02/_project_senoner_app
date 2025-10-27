import { getAdminApp } from '@/firebase/admin';
import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Nicht autorisiert: Kein Session-Cookie' }, { status: 401 });
  }

  try {
    getAdminApp();
    const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
    
    // Annahme: Die Rolle ist im Token gespeichert oder wird aus der DB geholt.
    // Für dieses Beispiel lesen wir sie direkt aus den Custom Claims.
    const userRecord = await auth().getUser(decodedToken.uid);
    const role = userRecord.customClaims?.role || 'customer';

    return NextResponse.json({ success: true, uid: decodedToken.uid, role: role }, { status: 200 });
  } catch (error) {
    console.error('Fehler bei der Überprüfung des Session-Cookies:', error);
    // Das Cookie ist ungültig, abgelaufen etc.
    return NextResponse.json({ error: 'Nicht autorisiert: Ungültige Sitzung' }, { status: 401 });
  }
}
