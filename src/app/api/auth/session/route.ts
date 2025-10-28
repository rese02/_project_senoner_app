import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/firebase/admin';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';

const REDIRECTS: { [key: string]: string } = {
  admin: '/admin',
  employee: '/employee/scan',
  customer: '/dashboard',
};

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID Token ist erforderlich' }, { status: 400 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log('Token verified for UID:', uid);

    const userDocRef = adminFirestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    let role = 'customer';
    if (userDoc.exists) {
      role = userDoc.data()?.role || 'customer';
    } else {
      // Erstelle das Benutzerdokument, wenn es nicht existiert
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

    // Setze den Custom Claim, falls er nicht mit der Rolle in Firestore übereinstimmt
    if (decodedToken.role !== role) {
      await adminAuth.setCustomUserClaims(uid, { role });
      console.log(`Custom claim set to: ${role}`);
    }
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 Tage in Millisekunden
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax' as const,
    };

    cookies().set(options);

    const redirectUrl = REDIRECTS[role] || '/dashboard';

    return NextResponse.json({ success: true, redirectUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Fehler beim Erstellen des Session-Cookies:', error.message);
    return NextResponse.json({ error: 'Nicht autorisiert: ' + error.message }, { status: 401 });
  }
}
