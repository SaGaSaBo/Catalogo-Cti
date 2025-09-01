import { NextResponse } from 'next/server';

export async function GET() {
  const has = (k: string) => Boolean((process.env as any)[k]);
  return NextResponse.json({
    SMTP_HOST: has('SMTP_HOST'),
    SMTP_PORT: has('SMTP_PORT'),
    SMTP_SECURE: has('SMTP_SECURE'),
    SMTP_USER: has('SMTP_USER'),
    SMTP_PASS: has('SMTP_PASS'),
    ORDER_TO: has('ORDER_TO'),
    NEXT_PUBLIC_CURRENCY: has('NEXT_PUBLIC_CURRENCY'),
    ADMIN_KEY: has('ADMIN_KEY')
  });
}