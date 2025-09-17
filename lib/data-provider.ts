import { Product, Category } from './types';
import { getProducts as getFSProducts, getProduct as getFSProduct, createProduct as createFSProduct, updateProduct as updateFSProduct, deleteProduct as deleteFSProduct } from './fs-products';
import { getCategories as getFSCategories, getCategory as getFSCategory, createCategory as createFSCategory, updateCategory as updateFSCategory, deleteCategory as deleteFSCategory } from './fs-categories';
import { getProducts as getSupabaseProducts, getProduct as getSupabaseProduct, createProduct as createSupabaseProduct, updateProduct as updateSupabaseProduct, deleteProduct as deleteSupabaseProduct } from './supabase-products';
import { getCategories as getSupabaseCategories, getCategory as getSupabaseCategory, createCategory as createSupabaseCategory, updateCategory as updateSupabaseCategory, deleteCategory as deleteSupabaseCategory } from './supabase-categories';
import { 
  getMockProducts, getMockProduct, createMockProduct, updateMockProduct, deleteMockProduct,
  getMockCategories, getMockCategory, createMockCategory, updateMockCategory, deleteMockCategory
} from './mock-data-provider';

const DATA_PROVIDER = process.env.DATA_PROVIDER || 'mock';

// Product functions
export async function getProducts(): Promise<Product[]> {
  if (DATA_PROVIDER === 'supabase') {
    return getSupabaseProducts();
  } else if (DATA_PROVIDER === 'mock') {
    return getMockProducts();
  }
  return getFSProducts();
}

export async function getProduct(id: string): Promise<Product | null> {
  if (DATA_PROVIDER === 'supabase') {
    return getSupabaseProduct(id);
  } else if (DATA_PROVIDER === 'mock') {
    return getMockProduct(id);
  }
  return getFSProduct(id);
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  if (DATA_PROVIDER === 'supabase') {
    return createSupabaseProduct(product);
  } else if (DATA_PROVIDER === 'mock') {
    return createMockProduct(product);
  }
  return createFSProduct(product);
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  if (DATA_PROVIDER === 'supabase') {
    return updateSupabaseProduct(id, product);
  } else if (DATA_PROVIDER === 'mock') {
    return updateMockProduct(id, product);
  }
  return updateFSProduct(id, product);
}

export async function deleteProduct(id: string): Promise<void> {
  if (DATA_PROVIDER === 'supabase') {
    return deleteSupabaseProduct(id);
  } else if (DATA_PROVIDER === 'mock') {
    return deleteMockProduct(id);
  }
  return deleteFSProduct(id);
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  if (DATA_PROVIDER === 'supabase') {
    return getSupabaseCategories();
  } else if (DATA_PROVIDER === 'mock') {
    return getMockCategories();
  }
  return getFSCategories();
}

export async function getCategory(id: string): Promise<Category | null> {
  if (DATA_PROVIDER === 'supabase') {
    return getSupabaseCategory(id);
  } else if (DATA_PROVIDER === 'mock') {
    return getMockCategory(id);
  }
  return getFSCategory(id);
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
  if (DATA_PROVIDER === 'supabase') {
    return createSupabaseCategory(category);
  } else if (DATA_PROVIDER === 'mock') {
    return createMockCategory(category);
  }
  return createFSCategory(category);
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  if (DATA_PROVIDER === 'supabase') {
    return updateSupabaseCategory(id, category);
  } else if (DATA_PROVIDER === 'mock') {
    return updateMockCategory(id, category);
  }
  return updateFSCategory(id, category);
}

export async function deleteCategory(id: string): Promise<void> {
  if (DATA_PROVIDER === 'supabase') {
    return deleteSupabaseCategory(id);
  } else if (DATA_PROVIDER === 'mock') {
    return deleteMockCategory(id);
  }
  return deleteFSCategory(id);
}
