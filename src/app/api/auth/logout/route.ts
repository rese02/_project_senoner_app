import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // To log out, we simply delete the session cookie.
  const options = {
    name: 'session',
    value: '',
    maxAge: -1, // Expire the cookie immediately
  };

  cookies().set(options);

  return NextResponse.json({ success: true, message: "Erfolgreich abgemeldet" }, { status: 200 });
}
