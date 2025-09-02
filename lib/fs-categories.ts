import fs from 'fs';
import path from 'path';
import { Category } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'categories.json');

function ensureDataDir(): void {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating data directory:', error);
    throw new Error('Failed to create data directory');
  }
}

export function getAllCategories(): Category[] {
  try {
    ensureDataDir();
    
    if (!fs.existsSync(DATA_FILE)) {
      // Si el archivo no existe, devolver array vacío
      return [];
    }
    
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    
    // Manejar archivo vacío
    if (!data.trim()) {
      return [];
    }
    
    const categories = JSON.parse(data);
    
    // Verificar que sea un array
    if (!Array.isArray(categories)) {
      console.warn('Categories file does not contain an array, returning empty array');
      return [];
    }
    
    return categories;
  } catch (error) {
    console.error('Error reading categories from file:', error);
    // En caso de error, devolver array vacío en lugar de lanzar
    return [];
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    if (!Array.isArray(categories)) {
      throw new Error('Categories must be an array');
    }
    
    ensureDataDir();
    
    const data = JSON.stringify(categories, null, 2);
    fs.writeFileSync(DATA_FILE, data, 'utf-8');
  } catch (error) {
    console.error('Error writing categories to file:', error);
    throw new Error('Failed to save categories');
  }
}

export function getCategories(): Category[] {
  return getAllCategories();
}

export function getCategory(id: string): Category | null {
  const categories = getAllCategories();
  return categories.find(c => c.id === id) || null;
}

export function createCategory(category: Omit<Category, 'id'>): Category {
  const categories = getAllCategories();
  const newCategory: Category = {
    id: crypto.randomUUID(),
    ...category
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(id: string, category: Partial<Category>): Category {
  const categories = getAllCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Category not found');
  }
  categories[index] = { ...categories[index], ...category };
  saveCategories(categories);
  return categories[index];
}

export function deleteCategory(id: string): void {
  const categories = getAllCategories();
  const filteredCategories = categories.filter(c => c.id !== id);
  if (filteredCategories.length === categories.length) {
    throw new Error('Category not found');
  }
  saveCategories(filteredCategories);
}