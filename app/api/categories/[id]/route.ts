import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, saveCategories } from '@/lib/fs-categories';
import { getAllProducts, saveProducts } from '@/lib/fs-products';
import { validateCategory } from '@/lib/validation';
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

    // Validate category
    const validation = validateCategory(body);
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const categoryId = params.id;
    const categories = getAllCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Check unique name (excluding current category)
    if (categories.some(c => c.name.toLowerCase() === body.name.toLowerCase() && c.id !== categoryId)) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      );
    }

    // Update category
    const updatedCategory = {
      ...categories[categoryIndex],
      name: body.name.trim()
    };

    categories[categoryIndex] = updatedCategory;
    saveCategories(categories);

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
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

    const categoryId = params.id;
    const categories = getAllCategories();
    const categoryExists = categories.some(c => c.id === categoryId);

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Remove category from products
    const products = getAllProducts();
    const updatedProducts = products.map(product => {
      if (product.categoryId === categoryId) {
        const { categoryId, ...productWithoutCategory } = product;
        return productWithoutCategory;
      }
      return product;
    });
    
    // Save updated products
    if (updatedProducts.some((p, i) => p !== products[i])) {
      saveProducts(updatedProducts);
    }

    // Filter out the category
    const filteredCategories = categories.filter(c => c.id !== categoryId);
    saveCategories(filteredCategories);

    return NextResponse.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}