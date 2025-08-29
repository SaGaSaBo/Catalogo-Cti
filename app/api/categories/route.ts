import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, saveCategories } from '@/lib/fs-categories';
import { validateCategory } from '@/lib/validation';
import { Category } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
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

    // Validate category
    const validation = validateCategory(body);
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get existing categories
    const categories = getAllCategories();
    
    // Check unique name
    if (categories.some(c => c.name.toLowerCase() === body.name.toLowerCase())) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      );
    }

    // Create new category
    const newCategory: Category = {
      id: uuidv4(),
      name: body.name.trim()
    };

    // Add and save
    categories.push(newCategory);
    saveCategories(categories);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}