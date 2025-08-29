import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, saveProducts } from '@/lib/fs-products';
import { validateProduct } from '@/lib/validation';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const productId = params.id;
    const products = getAllProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Check unique SKU (excluding current product)
    if (products.some(p => p.sku === body.sku && p.id !== productId)) {
      return NextResponse.json(
        { error: 'El SKU ya existe' },
        { status: 400 }
      );
    }

    // Update product
    const updatedProduct = {
      ...products[productIndex],
      brand: body.brand.trim(),
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      sku: body.sku.trim(),
      price: body.price,
      sizes: body.sizes.map((s: string) => s.trim()),
      imageUrls: body.imageUrls || [],
      active: body.active,
      sortIndex: body.sortIndex || products[productIndex].sortIndex,
      categoryId: body.categoryId?.trim() || undefined
    };

    products[productIndex] = updatedProduct;
    saveProducts(products);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const productId = params.id;
    const products = getAllProducts();
    const productExists = products.some(p => p.id === productId);

    if (!productExists) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Filter out the product
    const filteredProducts = products.filter(p => p.id !== productId);
    saveProducts(filteredProducts);

    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}