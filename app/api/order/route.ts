import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Sistema de email deshabilitado - usar descarga de PDF en su lugar
  return NextResponse.json(
    { 
      ok: false, 
      disabled: 'email',
      message: 'El sistema de email está deshabilitado. Usa la descarga de PDF desde el carrito.'
    }, 
    { status: 501 }
  );
}