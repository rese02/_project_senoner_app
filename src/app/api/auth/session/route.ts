import { getAdminApp } from '@/firebase/admin';
import { auth, firestore } from 'firebase-admin';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

const REDIRECTS: { [key: string]: string } = {
  admin: '/admin',
  employee: '/employee/scan',
  customer: '/dashboard',
};

async function getUserRole(uid: string): Promise<string> {
  try {
    const db = firestore();
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      return userDoc.data()?.role || 'customer';
    }
    return 'customer';
  } catch (error) {
    console.error('Error fetching user role from Firestore:', error);
    return 'customer';
  }
}

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID Token ist erforderlich' }, { status: 400 });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 Tage

  try {
    getAdminApp(); // Initialisiert die Admin-App, falls noch nicht geschehen
    const decodedIdToken = await auth().verifyIdToken(idToken);
    
    // Get role from firestore to set it as a custom claim
    const role = await getUserRole(decodedIdToken.uid);

    // Set custom claim for role if it's not already set
    if (decodedIdToken.role !== role) {
      await auth().setCustomUserClaims(decodedIdToken.uid, { role });
    }
    
    const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    cookies().set(options);

    const redirectUrl = REDIRECTS[role] || '/dashboard';

    return NextResponse.json({ success: true, redirectUrl }, { status: 200 });
  } catch (error) {
    console.error('Fehler beim Erstellen des Session-Cookies:', error);
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }
}
