import { Product, Category } from './types';
import { mockProducts, mockCategories } from './mockData';

// Simular almacenamiento en memoria para desarrollo
let products = [...mockProducts];
let categories = [...mockCategories];

export async function getMockProducts(): Promise<Product[]> {
  return products;
}

export async function getMockProduct(id: string): Promise<Product | null> {
  return products.find(p => p.id === id) || null;
}

export async function createMockProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(), // ID simple para desarrollo
  };
  products.push(newProduct);
  return newProduct;
}

export async function updateMockProduct(id: string, product: Partial<Product>): Promise<Product> {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Producto no encontrado');
  }
  
  products[index] = { ...products[index], ...product };
  return products[index];
}

export async function deleteMockProduct(id: string): Promise<void> {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Producto no encontrado');
  }
  
  products.splice(index, 1);
}

export async function getMockCategories(): Promise<Category[]> {
  return categories;
}

export async function getMockCategory(id: string): Promise<Category | null> {
  return categories.find(c => c.id === id) || null;
}

export async function createMockCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const newCategory: Category = {
    ...category,
    id: Date.now().toString(),
  };
  categories.push(newCategory);
  return newCategory;
}

export async function updateMockCategory(id: string, category: Partial<Category>): Promise<Category> {
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Categoría no encontrada');
  }
  
  categories[index] = { ...categories[index], ...category };
  return categories[index];
}

export async function deleteMockCategory(id: string): Promise<void> {
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Categoría no encontrada');
  }
  
  categories.splice(index, 1);
}
