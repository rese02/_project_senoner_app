import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/firebase/admin';
import { cookies } from 'next/headers';

const REDIRECTS: { [key: string]: string } = {
  admin: '/admin',
  employee: '/employee/scan',
  customer: '/dashboard',
};

async function getOrCreateUserRole(uid: string, email: string | undefined): Promise<string> {
  const userDocRef = adminFirestore.collection('users').doc(uid);
  const userDoc = await userDocRef.get();

  if (userDoc.exists) {
    return userDoc.data()?.role || 'customer';
  } else {
    // Wenn der Benutzer in Firestore nicht existiert, erstellen Sie ihn mit der Standardrolle
    await userDocRef.set({
      id: uid,
      email: email,
      role: 'customer',
      points: 0,
      rewards: [],
      coupons: [],
      createdAt: new Date().toISOString(),
    });
    return 'customer';
  }
}

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID Token ist erforderlich' }, { status: 400 });
  }

  // Session expires in 5 days
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    // Erstellen Sie direkt das Session-Cookie. Dies ist der empfohlene Weg.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Verifizieren Sie das neu erstellte Session-Cookie, um die UID sicher zu erhalten
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const uid = decodedToken.uid;

    // Holen oder erstellen Sie die Benutzerrolle in Firestore
    const role = await getOrCreateUserRole(uid, decodedToken.email);

    // Setzen Sie den Custom Claim, falls er nicht existiert oder veraltet ist
    if (decodedToken.role !== role) {
      await adminAuth.setCustomUserClaims(uid, { role });
    }

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    // Setzen Sie den Cookie in der Antwort
    cookies().set(options);

    const redirectUrl = REDIRECTS[role] || '/dashboard';

    return NextResponse.json({ success: true, redirectUrl }, { status: 200 });
  } catch (error) {
    console.error('Fehler beim Erstellen des Session-Cookies:', error);
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }
}
