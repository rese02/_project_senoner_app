// src/app/api/debug-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('--- Checking environment variable ---');
  const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY_JSON;

  if (!serviceAccountKey) {
    console.error('FAIL: SERVICE_ACCOUNT_KEY_JSON is not defined.');
    return NextResponse.json(
      { error: 'Environment variable is not defined.' },
      { status: 500 }
    );
  }

  console.log('SUCCESS: SERVICE_ACCOUNT_KEY_JSON is loaded.');

  try {
    JSON.parse(serviceAccountKey);
    console.log('SUCCESS: Environment variable was parsed as JSON successfully.');
    return NextResponse.json({ status: 'OK', message: 'Variable is loaded and is valid JSON.' });
  } catch (e: any) {
    console.error('FAIL: The variable could not be parsed as JSON.', e.message);
    return NextResponse.json(
      { error: 'The variable is not valid JSON.', details: e.message },
      { status: 500 }
    );
  }
}
