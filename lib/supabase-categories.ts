import { supabase, SupabaseCategory } from './supabase';
import { Category } from './types';

// Convertir de Supabase a formato interno
function convertFromSupabase(supabaseCategory: SupabaseCategory): Category {
  return {
    id: supabaseCategory.id,
    name: supabaseCategory.name,
    description: supabaseCategory.description || '',
    sortIndex: supabaseCategory.sort_index
  };
}

// Convertir de formato interno a Supabase
function convertToSupabase(category: Partial<Category>): Partial<SupabaseCategory> {
  return {
    name: category.name,
    description: category.description,
    sort_index: category.sortIndex
  };
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_index', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }

  return data.map(convertFromSupabase);
}

export async function getCategory(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Category not found
    }
    console.error('Error fetching category:', error);
    throw new Error('Failed to fetch category');
  }

  return convertFromSupabase(data);
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const supabaseCategory = convertToSupabase(category);
  
  const { data, error } = await supabase
    .from('categories')
    .insert([supabaseCategory])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }

  return convertFromSupabase(data);
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  const supabaseCategory = convertToSupabase(category);
  
  const { data, error } = await supabase
    .from('categories')
    .update(supabaseCategory)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category');
  }

  return convertFromSupabase(data);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
}
