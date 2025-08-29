import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/fs-products';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const products = getAllProducts();
    const sortedProducts = products.sort((a, b) => a.sortIndex - b.sortIndex);
    
    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error('Error fetching all products:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}