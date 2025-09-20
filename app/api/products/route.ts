import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/data-provider';
import { validateProduct } from '@/lib/validation';
import { Product } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('API /products called');
    
    // Usar Supabase en lugar de datos mock
    console.log('Calling getProducts()...');
    const products = await getProducts();
    console.log(`getProducts() returned ${products.length} products`);
    
    // Si hay Authorization header, devolver todos los productos (admin)
    // Si no, solo los activos (público)
    const isAdminRequest = req?.headers?.get('authorization')?.startsWith('Bearer ');
    console.log('isAdminRequest:', isAdminRequest);
    
    const filteredProducts = isAdminRequest 
      ? products.sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
      : products
          .filter(product => product.active)
          .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0));
    
    console.log(`Returning ${filteredProducts.length} products`);
    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Error interno', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'JSON inválido en el cuerpo de la petición' },
        { status: 400 }
      );
    }

    // Validate product
    const validation = validateProduct(body);
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct = await createProduct({
      brand: body.brand.trim(),
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      sku: body.sku.trim(),
      price: body.price,
      sizes: body.sizes.map((s: string) => s.trim()),
      imageUrls: body.imageUrls || [],
      active: body.active,
      sortIndex: body.sortIndex || 1,
      categoryId: body.categoryId?.trim() || undefined
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}