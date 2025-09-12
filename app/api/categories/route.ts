import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/data-provider';
import { validateCategory } from '@/lib/validation';
import { Category } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();
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

    // Create new category
    const newCategory = await createCategory({
      name: body.name.trim()
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}