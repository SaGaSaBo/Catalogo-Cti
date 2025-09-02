import { NextRequest, NextResponse } from 'next/server';
import { getCategory, updateCategory, deleteCategory } from '@/lib/data-provider';
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
    
    // Check if category exists
    const existingCategory = await getCategory(categoryId);
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Update category
    const updatedCategory = await updateCategory(categoryId, {
      name: body.name.trim(),
      description: body.description?.trim() || existingCategory.description,
      sortIndex: body.sortIndex || existingCategory.sortIndex
    });

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
    
    // Check if category exists
    const existingCategory = await getCategory(categoryId);
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Delete category
    await deleteCategory(categoryId);

    return NextResponse.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}