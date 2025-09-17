import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/data-provider';
import { validateCategory } from '@/lib/validation';
import { Category } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { isAdmin } from '@/lib/auth';
import { getMockCategoriesForAPI } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('API /categories called');
    
    // Usar datos mock por ahora para asegurar funcionalidad
    const mockCategories = getMockCategoriesForAPI();
    
    console.log(`Returning ${mockCategories.length} categories`);
    return NextResponse.json(mockCategories);
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