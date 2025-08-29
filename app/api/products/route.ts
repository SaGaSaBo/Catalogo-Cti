import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, saveProducts } from '@/lib/fs-products';
import { validateProduct } from '@/lib/validation';
import { Product } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const products = getAllProducts();
    
    // Si hay Authorization header, devolver todos los productos (admin)
    // Si no, solo los activos (público)
    const isAdminRequest = req?.headers?.get('authorization')?.startsWith('Bearer ');
    
    const filteredProducts = isAdminRequest 
      ? products.sort((a, b) => a.sortIndex - b.sortIndex)
      : products
          .filter(product => product.active)
          .sort((a, b) => a.sortIndex - b.sortIndex);
    
    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error interno' },
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

    // Get existing products
    const products = getAllProducts();
    
    // Check unique SKU
    if (products.some(p => p.sku === body.sku)) {
      return NextResponse.json(
        { error: 'El SKU ya existe' },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct: Product = {
      id: uuidv4(),
      brand: body.brand.trim(),
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      sku: body.sku.trim(),
      price: body.price,
      sizes: body.sizes.map((s: string) => s.trim()),
      imageUrls: body.imageUrls || [],
      active: body.active,
      sortIndex: body.sortIndex || products.length + 1,
      categoryId: body.categoryId?.trim() || undefined
    };

    // Add and save
    products.push(newProduct);
    saveProducts(products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}