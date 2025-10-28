import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  // To log out, we simply delete the session cookie.
  const options = {
    name: 'session',
    value: '',
    maxAge: -1, // Expire the cookie immediately
  };

  const sessionCookie = cookies().get('session')?.value;
  if (sessionCookie) {
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        await adminAuth.revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
        console.log("Failed to revoke refresh tokens, session cookie might be expired.", error);
    }
  }


  const response = NextResponse.json({ success: true, message: "Erfolgreich abgemeldet" }, { status: 200 });
  response.cookies.set(options);

  return response;
}
