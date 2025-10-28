import { adminAuth, adminFirestore } from '@/firebase/admin';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

const REDIRECTS: { [key: string]: string } = {
  admin: '/admin',
  employee: '/employee/scan',
  customer: '/dashboard',
};

/**
 * Fetches the user role from the 'users' collection in Firestore.
 * @param uid The user's UID.
 * @returns The user's role or 'customer' as a default.
 */
async function getUserRole(uid: string): Promise<string> {
  try {
    const userDocRef = adminFirestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      return userDoc.data()?.role || 'customer';
    }
    console.warn(`User document for ${uid} not found in Firestore. Defaulting to 'customer' role.`);
    return 'customer';
  } catch (error) {
    console.error('Error fetching user role from Firestore:', error);
    // In case of error, default to the most restrictive role for security.
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
    const decodedIdToken = await adminAuth.verifyIdToken(idToken);
    
    // Get role from Firestore to set it as a custom claim
    const role = await getUserRole(decodedIdToken.uid);

    // Set custom claim for role if it's not already set or differs
    if (decodedIdToken.role !== role) {
      await adminAuth.setCustomUserClaims(decodedIdToken.uid, { role });
    }
    
    // Create the session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    // Set the cookie in the response
    cookies().set(options);

    const redirectUrl = REDIRECTS[role] || '/dashboard';

    return NextResponse.json({ success: true, redirectUrl }, { status: 200 });
  } catch (error) {
    console.error('Fehler beim Erstellen des Session-Cookies:', error);
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }
}
