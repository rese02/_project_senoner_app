// src/app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('--- ✅ SUCCESS: /api/hello route was reached! ---');
  return NextResponse.json({ message: 'Hello from the API!' });
}
