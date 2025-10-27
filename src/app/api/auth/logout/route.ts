import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const options = {
    name: 'session',
    value: '',
    maxAge: -1,
  };

  cookies().set(options);

  return NextResponse.json({ success: true }, { status: 200 });
}
