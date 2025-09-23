import { supabase, SupabaseProduct } from './supabase';
import { Product } from './types';

// Convertir de Supabase a formato interno
function convertFromSupabase(supabaseProduct: SupabaseProduct): Product {
  try {
    console.log('Converting product:', supabaseProduct.id, supabaseProduct.title);
    console.log('Image URLs from DB:', supabaseProduct.image_urls);
    const converted = {
      id: supabaseProduct.id,
      brand: supabaseProduct.brand,
      title: supabaseProduct.title,
      description: supabaseProduct.description,
      sku: supabaseProduct.sku,
      price: supabaseProduct.price,
      sizes: supabaseProduct.sizes || [],
      imageUrls: supabaseProduct.image_urls || [],
      active: supabaseProduct.active,
      categoryId: supabaseProduct.category_id,
      sortIndex: supabaseProduct.sort_index
    };
    console.log('Converted successfully:', converted.id);
    return converted;
  } catch (error) {
    console.error('Error converting product:', supabaseProduct.id, error);
    throw error;
  }
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
  try {
    // Primero intentar con JOIN a categories
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at,
        category:categories(id, name)
      `)
      .order('sort_index', { ascending: true });

    if (error) {
      console.warn('Error with categories JOIN, trying without:', error.message);
      // Si falla el JOIN, intentar sin categories
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('products')
        .select('id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at')
        .order('sort_index', { ascending: true });

      if (fallbackError) {
        console.error('Error fetching products:', fallbackError);
        throw new Error('Failed to fetch products');
      }

      return fallbackData.map(convertFromSupabase);
    }

    return data.map(convertFromSupabase);
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    // Primero intentar con JOIN a categories
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at,
        category:categories(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Product not found
      }
      
      console.warn('Error with categories JOIN, trying without:', error.message);
      // Si falla el JOIN, intentar sin categories
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('products')
        .select('id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at')
        .eq('id', id)
        .single();

      if (fallbackError) {
        if (fallbackError.code === 'PGRST116') {
          return null; // Product not found
        }
        console.error('Error fetching product:', fallbackError);
        throw new Error('Failed to fetch product');
      }

      return convertFromSupabase(fallbackData);
    }

    return convertFromSupabase(data);
  } catch (error) {
    console.error('Error in getProduct:', error);
    throw error;
  }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const supabaseProduct = convertToSupabase(product);
  console.log('Creating product with imageUrls:', product.imageUrls);
  console.log('Supabase product image_urls:', supabaseProduct.image_urls);
  
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
  console.log('Updating product with imageUrls:', product.imageUrls);
  console.log('Supabase product image_urls:', supabaseProduct.image_urls);
  
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
