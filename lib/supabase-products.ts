import { supabase, SupabaseProduct } from './supabase';
import { Product } from './types';

// Convertir de Supabase a formato interno
function convertFromSupabase(supabaseProduct: SupabaseProduct): Product {
  return {
    id: supabaseProduct.id,
    brand: supabaseProduct.brand,
    title: supabaseProduct.title,
    description: supabaseProduct.description,
    sku: supabaseProduct.sku,
    price: supabaseProduct.price,
    sizes: supabaseProduct.sizes,
    imageUrls: supabaseProduct.image_urls,
    active: supabaseProduct.active,
    categoryId: supabaseProduct.category_id,
    sortIndex: supabaseProduct.sort_index
  };
}

// Convertir de formato interno a Supabase
function convertToSupabase(product: Partial<Product>): Partial<SupabaseProduct> {
  return {
    brand: product.brand,
    title: product.title,
    description: product.description || undefined,
    sku: product.sku,
    price: product.price,
    sizes: product.sizes,
    image_urls: product.imageUrls,
    active: product.active,
    category_id: product.categoryId,
    sort_index: product.sortIndex
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_index', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }

  return data.map(convertFromSupabase);
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Product not found
    }
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }

  return convertFromSupabase(data);
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const supabaseProduct = convertToSupabase(product);
  
  const { data, error } = await supabase
    .from('products')
    .insert([supabaseProduct])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }

  return convertFromSupabase(data);
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const supabaseProduct = convertToSupabase(product);
  
  const { data, error } = await supabase
    .from('products')
    .update(supabaseProduct)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }

  return convertFromSupabase(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}
