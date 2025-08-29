import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Hello from API!',
    status: 'working',
    timestamp: new Date().toISOString()
  });
}