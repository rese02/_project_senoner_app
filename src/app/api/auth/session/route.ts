// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('--- DUMMY /api/auth/session CALLED ---');

    // Wir tun so, als ob alles funktioniert hat.
    // Wir senden eine einfache Erfolgsmeldung zurück.
    // Es gibt hier keinen Firebase-Code, der abstürzen kann.
    
    return NextResponse.json({ status: 'success from dummy route' }, { status: 200 });

  } catch (error: any) {
    // Dieser Block sollte jetzt nie erreicht werden.
    console.error('Dummy route crashed, which should be impossible.', error);
    return NextResponse.json({ error: 'Dummy route failed' }, { status: 500 });
  }
}
