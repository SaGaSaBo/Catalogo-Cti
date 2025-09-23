import { NextRequest, NextResponse } from 'next/server';
import { getProduct, updateProduct, deleteProduct } from '@/lib/data-provider';
import { validateProduct } from '@/lib/validation';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    const product = await getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: productId } = await params;
    
    // Check if product exists
    const existingProduct = await getProduct(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Update product
    console.log('PUT /api/products/[id] - Updating product:', productId);
    console.log('PUT /api/products/[id] - Body imageUrls:', body.imageUrls);
    console.log('PUT /api/products/[id] - Body active:', body.active);
    
    const updatedProduct = await updateProduct(productId, {
      brand: body.brand.trim(),
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      sku: body.sku.trim(),
      price: body.price,
      sizes: body.sizes.map((s: string) => s.trim()),
      imageUrls: body.imageUrls || [],
      active: body.active,
      sortIndex: body.sortIndex || existingProduct.sortIndex,
      categoryId: body.categoryId?.trim() || undefined
    });
    
    console.log('PUT /api/products/[id] - Updated product imageUrls:', updatedProduct.imageUrls);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: productId } = await params;
    
    // Check if product exists
    const existingProduct = await getProduct(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Delete product
    await deleteProduct(productId);

    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
